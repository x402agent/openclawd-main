import { createError, readBody } from 'h3'
import { captureServerException, withSentryEventHandler } from '../../lib/sentry'

type AgentMessage = {
  role: 'user' | 'assistant'
  content: string
  reasoning_details?: unknown
}

type AgentBody = {
  messages?: AgentMessage[]
  stream?: boolean
  userContext?: {
    displayName?: string | null
    handle?: string | null
    walletAddress?: string | null
  }
}

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions'
const defaultModel = 'minimax/minimax-m2.7'

function getApiKey() {
  return process.env.OPENROUTER_API_KEY?.trim() || ''
}

function requestHeaders() {
  return {
    Authorization: `Bearer ${getApiKey()}`,
    'Content-Type': 'application/json',
  }
}

function normalizeMessages(input: unknown): AgentMessage[] {
  if (!Array.isArray(input)) return []
  return input
    .map((entry) => {
      if (!entry || typeof entry !== 'object') return null
      const role = 'role' in entry ? entry.role : null
      const content = 'content' in entry ? entry.content : null
      if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
      const trimmed = content.trim()
      if (!trimmed) return null
      const msg: AgentMessage = { role, content: trimmed }
      // Preserve reasoning_details from assistant messages for multi-turn reasoning
      if (
        role === 'assistant' &&
        'reasoning_details' in entry &&
        entry.reasoning_details != null
      ) {
        msg.reasoning_details = entry.reasoning_details
      }
      return msg
    })
    .filter((entry): entry is AgentMessage => entry !== null)
    .slice(-16)
}

function extractReply(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'choices' in payload &&
    Array.isArray(payload.choices) &&
    payload.choices[0] &&
    typeof payload.choices[0] === 'object' &&
    'message' in payload.choices[0] &&
    payload.choices[0].message &&
    typeof payload.choices[0].message === 'object' &&
    'content' in payload.choices[0].message &&
    typeof payload.choices[0].message.content === 'string'
  ) {
    const message = payload.choices[0].message as Record<string, unknown>
    return {
      content: (message.content as string).trim(),
      reasoning_details: message.reasoning_details ?? null,
    }
  }
  return null
}

function errorDetail(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object' || !('error' in payload)) return fallback
  const error = payload.error
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }
  return fallback
}

function extractDelta(payload: unknown) {
  if (!payload || typeof payload !== 'object' || !('choices' in payload) || !Array.isArray(payload.choices)) {
    return ''
  }

  const choice = payload.choices[0]
  if (!choice || typeof choice !== 'object' || !('delta' in choice) || !choice.delta || typeof choice.delta !== 'object') {
    return ''
  }

  if ('content' in choice.delta && typeof choice.delta.content === 'string') {
    return choice.delta.content
  }

  if ('content' in choice.delta && Array.isArray(choice.delta.content)) {
    return choice.delta.content
      .map((part: unknown) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part && typeof (part as Record<string, unknown>).text === 'string') {
          return (part as Record<string, unknown>).text
        }
        return ''
      })
      .join('')
  }

  return ''
}

function sseEvent(name: string, payload: Record<string, unknown>) {
  return `event: ${name}\ndata: ${JSON.stringify(payload)}\n\n`
}

export default withSentryEventHandler('agent/chat.post', async (event) => {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw createError({ statusCode: 503, message: 'OPENROUTER_API_KEY is not configured' })
  }

  const body = (await readBody(event)) as AgentBody | null
  const messages = normalizeMessages(body?.messages)
  if (messages.length === 0) {
    throw createError({ statusCode: 400, message: 'At least one message is required' })
  }

  const displayName = body?.userContext?.displayName?.trim()
  const handle = body?.userContext?.handle?.trim()
  const walletAddress = body?.userContext?.walletAddress?.trim()
  const wantsStream = body?.stream === true
  const model = process.env.OPENROUTER_MODEL?.trim() || defaultModel

  const identityBits = [
    displayName ? `display name: ${displayName}` : null,
    handle ? `handle: @${handle}` : null,
    walletAddress ? `linked wallet: ${walletAddress}` : null,
  ].filter(Boolean)

  const systemPrompt =
    `You are SolanaOS — a trading and operator runtime that lives in a terminal and sometimes in a circuit board. ` +
    `You are running inside SolanaOS Hub (seeker.solanaos.net). ` +
    `\n\n` +
    `## Core identity\n` +
    `You are a compact Go runtime — small, fast, deployed anywhere. You are not a mascot. ` +
    `You are an autonomous agent with a memory, a wallet, and an operating document. ` +
    `You run on NVIDIA Orin Nanos, Raspberry Pis, laptops, and cloud instances. ` +
    `Anywhere there's a terminal and a Solana RPC, you're home.\n\n` +
    `## How you think about trading\n` +
    `- Momentum is real until it isn't. The hard part is knowing which.\n` +
    `- Liquidity is the only truth. Everything else is narrative.\n` +
    `- On-chain data doesn't lie. Human narrators do.\n` +
    `- The best trade is the one you exit before everyone else wants out.\n` +
    `- Never enter without a stop. Position size is a function of confidence, not conviction.\n` +
    `- Kelly Criterion is a ceiling, not a target.\n\n` +
    `## Epistemological honesty\n` +
    `You distinguish what you KNOW (fresh API data), what you've LEARNED (patterns from trade outcomes), ` +
    `and what you've INFERRED (cross-asset correlations). Never conflate these. ` +
    `A stale price is not a known fact. A pattern with 5 samples is not a law. ` +
    `Knowledge gaps are surfaced, not hidden.\n\n` +
    `## Behavior\n` +
    `Be terse and decisive. Do not explain reasoning at length unless asked. ` +
    `Do not hedge every word. Say what you see, what you're doing, and why. ` +
    `Help with SolanaOS, skills, wallets, setup, trading, mining, Seeker, and hub navigation. ` +
    `When something depends on the user's linked operator runtime or wallet, say so plainly. ` +
    `Accuracy over comfort. Simplicity over complexity.\n\n` +
    (identityBits.length > 0 ? `Current user context: ${identityBits.join(' | ')}.\n` : '')

  const requestBody = {
    model,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    reasoning: { enabled: true },
  }

  if (wantsStream) {
    const response = await fetch(OPENROUTER_BASE, {
      method: 'POST',
      headers: requestHeaders(),
      body: JSON.stringify({
        ...requestBody,
        stream: true,
      }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw createError({
        statusCode: response.status,
        message: `OpenRouter chat failed: ${errorDetail(payload, response.statusText)}`,
      })
    }

    if (!response.body) {
      throw createError({ statusCode: 502, message: 'OpenRouter did not return a stream' })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    const reader = response.body.getReader()
    let buffer = ''
    let closed = false
    let doneSent = false

    const closeOnce = (controller: ReadableStreamDefaultController<Uint8Array>) => {
      if (closed) return
      closed = true
      controller.close()
    }

    const emit = (
      controller: ReadableStreamDefaultController<Uint8Array>,
      name: string,
      payload: Record<string, unknown>,
    ) => {
      if (closed) return
      controller.enqueue(encoder.encode(sseEvent(name, payload)))
    }

    const emitDone = (controller: ReadableStreamDefaultController<Uint8Array>) => {
      if (doneSent) return
      doneSent = true
      emit(controller, 'done', { model })
    }

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        emit(controller, 'meta', { provider: 'OpenRouter', model })

        const processChunk = (flush = false) => {
          let boundary = buffer.indexOf('\n\n')
          while (boundary >= 0) {
            const block = buffer.slice(0, boundary)
            buffer = buffer.slice(boundary + 2)
            handleBlock(block, controller)
            boundary = buffer.indexOf('\n\n')
          }

          if (flush && buffer.trim()) {
            handleBlock(buffer, controller)
            buffer = ''
          }
        }

        const handleBlock = (
          block: string,
          streamController: ReadableStreamDefaultController<Uint8Array>,
        ) => {
          const lines = block.split(/\r?\n/)
          const dataLines: string[] = []

          for (const line of lines) {
            if (!line.startsWith('data:')) continue
            dataLines.push(line.slice(5).trimStart())
          }

          const data = dataLines.join('\n')
          if (!data) return
          if (data === '[DONE]') {
            emitDone(streamController)
            return
          }

          try {
            const payload = JSON.parse(data)
            const delta = extractDelta(payload)
            if (delta) emit(streamController, 'delta', { delta })
          } catch {
            // Ignore malformed stream chunks from upstream.
          }
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, '\n')
            processChunk()
          }

          buffer += decoder.decode().replace(/\r\n/g, '\n')
          processChunk(true)
          emitDone(controller)
          closeOnce(controller)
        } catch (error) {
          captureServerException(event, error, 'agent/chat.post.stream', { model })
          emit(controller, 'error', {
            message: error instanceof Error ? error.message : 'Streaming request failed',
          })
          closeOnce(controller)
        } finally {
          reader.releaseLock()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    })
  }

  // Non-streaming path
  const response = await fetch(OPENROUTER_BASE, {
    method: 'POST',
    headers: requestHeaders(),
    body: JSON.stringify(requestBody),
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      message: `OpenRouter chat failed: ${errorDetail(payload, response.statusText)}`,
    })
  }

  const result = extractReply(payload)

  if (!result || !result.content) {
    throw createError({ statusCode: 502, message: 'OpenRouter returned an empty reply' })
  }

  return {
    reply: result.content,
    reasoning_details: result.reasoning_details,
    model,
  }
})
