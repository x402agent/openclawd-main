import { createFileRoute } from '@tanstack/react-router'
import {
  type FormEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { trackHubEvent } from '../lib/analytics'
import { getNanoHubSiteUrl } from '../lib/site'
import { useAuthStatus } from '../lib/useAuthStatus'

export const Route = createFileRoute('/terminal')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/terminal`
    const title = 'Terminal | SolanaOS'
    const description =
      'Real-time AI terminal powered by Together AI. Multi-model chat with Qwen, Kimi, and more.'
    return {
      links: [{ rel: 'canonical', href: url }],
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: url },
      ],
    }
  },
  component: TerminalRoute,
})

type Message = { role: 'user' | 'assistant' | 'system'; content: string }

const MODELS = [
  { id: 'Qwen/Qwen3.5-397B-A17B', label: 'Qwen 3.5 397B', accent: '#14f195' },
  { id: 'moonshotai/Kimi-K2.5', label: 'Kimi K2.5', accent: '#00d4ff' },
  { id: 'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8', label: 'Llama 4 Maverick', accent: '#8f6aff' },
  { id: 'deepseek-ai/DeepSeek-V3', label: 'DeepSeek V3', accent: '#ff8f3d' },
  { id: 'Qwen/Qwen3-235B-A22B', label: 'Qwen 3 235B', accent: '#14f195' },
  { id: 'google/gemma-3-27b-it', label: 'Gemma 3 27B', accent: '#00d4ff' },
]

const SYSTEM_PROMPT =
  'You are SolanaOS Terminal, an AI assistant for Solana traders and operators. Be concise, technical, and helpful. When discussing crypto, include relevant data points. Format code blocks with ```.'

function TerminalRoute() {
  const { walletAddress } = useAuthStatus()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    trackHubEvent('terminal_route_view', { surface: 'terminal' })
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const sendMessage = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault()
      const text = input.trim()
      if (!text || streaming) return

      const userMsg: Message = { role: 'user', content: text }
      const history = [...messages, userMsg]
      setMessages(history)
      setInput('')
      setStreaming(true)

      const assistantMsg: Message = { role: 'assistant', content: '' }
      setMessages([...history, assistantMsg])

      try {
        const resp = await fetch('/api/together/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              ...history.map((m) => ({ role: m.role, content: m.content })),
            ],
            stream: true,
          }),
        })

        if (!resp.ok) throw new Error(`${resp.status}`)

        const reader = resp.body?.getReader()
        if (!reader) throw new Error('No stream')

        const decoder = new TextDecoder()
        let full = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          // Parse SSE lines
          for (const line of chunk.split('\n')) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                full += delta
                setMessages((prev) => {
                  const copy = [...prev]
                  copy[copy.length - 1] = { role: 'assistant', content: full }
                  return copy
                })
              }
            } catch {
              // skip
            }
          }
        }
      } catch (err) {
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = {
            role: 'assistant',
            content: `Error: ${err instanceof Error ? err.message : 'Request failed'}`,
          }
          return copy
        })
      } finally {
        setStreaming(false)
        inputRef.current?.focus()
      }
    },
    [input, messages, streaming, selectedModel],
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const activeModel = MODELS.find((m) => m.id === selectedModel) ?? MODELS[0]

  if (!walletAddress) {
    return (
      <main className="section">
        <div className="solana-terminal-gate">
          <span className="hero-badge">Terminal</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: '#fff', margin: '16px 0 8px' }}>
            SolanaOS Terminal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
            Connect your Solana wallet to access the AI terminal.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="solana-terminal-page">
      {/* Model selector bar */}
      <div className="solana-terminal-model-bar">
        <span className="solana-terminal-model-label">Model</span>
        <div className="solana-terminal-model-chips">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              className={`solana-terminal-model-chip${m.id === selectedModel ? ' is-active' : ''}`}
              style={m.id === selectedModel ? { borderColor: m.accent, color: m.accent } : undefined}
              onClick={() => setSelectedModel(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="solana-terminal-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="solana-terminal-empty">
            <div className="solana-terminal-empty-icon">{'>'}_</div>
            <h2>SolanaOS Terminal</h2>
            <p>
              Powered by <strong style={{ color: activeModel.accent }}>{activeModel.label}</strong> via
              Together AI
            </p>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)' }}>
              Ask about tokens, strategies, code, on-chain data, or anything.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`solana-terminal-msg ${msg.role === 'user' ? 'is-user' : 'is-assistant'}`}
          >
            <div className="solana-terminal-msg-label">
              {msg.role === 'user' ? (
                <>{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}</>
              ) : (
                <span style={{ color: activeModel.accent }}>{activeModel.label}</span>
              )}
            </div>
            <div className="solana-terminal-msg-body">
              {msg.content || (streaming && i === messages.length - 1 ? (
                <span className="solana-terminal-typing">
                  <span /><span /><span />
                </span>
              ) : null)}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form className="solana-terminal-input-bar" onSubmit={sendMessage}>
        <textarea
          ref={inputRef}
          className="solana-terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={streaming ? 'Generating...' : 'Message SolanaOS Terminal...'}
          disabled={streaming}
          rows={1}
        />
        <button
          type="submit"
          className="solana-terminal-send"
          disabled={streaming || !input.trim()}
          style={{ background: activeModel.accent }}
        >
          Send
        </button>
      </form>
    </main>
  )
}
