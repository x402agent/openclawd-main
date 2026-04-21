import { defineEventHandler, readBody, createError } from 'h3'

const TOGETHER_API_URL = 'https://api.together.xyz/v1/chat/completions'

/**
 * POST /api/together/chat
 * Proxies chat completion requests to Together AI.
 * Body: { model, messages, stream? }
 * Together API key stays server-side.
 */
export default defineEventHandler(async (event) => {
  const apiKey = process.env.TOGETHER_API_KEY
  if (!apiKey) {
    throw createError({ statusCode: 503, message: 'Together API key not configured' })
  }

  const body = await readBody(event)
  if (!body?.messages || !Array.isArray(body.messages)) {
    throw createError({ statusCode: 400, message: 'Missing messages array' })
  }

  const model = body.model || 'Qwen/Qwen3.5-397B-A17B'
  const stream = body.stream === true

  if (stream) {
    // Streaming response
    const resp = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        stream: true,
        max_tokens: body.max_tokens ?? 4096,
        temperature: body.temperature ?? 0.7,
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      throw createError({ statusCode: resp.status, message: err })
    }

    event.node.res.setHeader('Content-Type', 'text/event-stream')
    event.node.res.setHeader('Cache-Control', 'no-cache')
    event.node.res.setHeader('Connection', 'keep-alive')

    const reader = resp.body?.getReader()
    if (!reader) throw createError({ statusCode: 500, message: 'No stream body' })

    const decoder = new TextDecoder()
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      event.node.res.write(decoder.decode(value, { stream: true }))
    }
    event.node.res.end()
    return
  }

  // Non-streaming
  const resp = await fetch(TOGETHER_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: body.messages,
      max_tokens: body.max_tokens ?? 4096,
      temperature: body.temperature ?? 0.7,
    }),
  })

  if (!resp.ok) {
    const err = await resp.text()
    throw createError({ statusCode: resp.status, message: err })
  }

  return resp.json()
})
