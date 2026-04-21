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

export const Route = createFileRoute('/godmode')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/godmode`
    const title = 'GODMODE | SolanaOS'
    const description =
      'Multi-model AI racing engine. GODMODE single-model + ULTRAPLINIAN parallel racing. Powered by OpenRouter.'
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
  component: GodmodeRoute,
})

// ── Types ───────────────────────────────────────────────────────

type Message = {
  role: 'user' | 'assistant' | 'system'
  content: string
  meta?: {
    mode?: string
    winner?: { model: string; label: string; score: number; latency: number }
    results?: { model: string; label: string; score: number; latency: number; tokens: number; preview: string }[]
  }
}

type Mode = 'single' | 'ultraplinian'
type Tier = 'fast' | 'standard'

const SINGLE_MODELS = [
  { id: 'deepseek/deepseek-chat', label: 'DeepSeek', accent: '#00d4ff' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini Flash', accent: '#4285f4' },
  { id: 'moonshotai/kimi-k2.5', label: 'Kimi K2.5', accent: '#ff8f3d' },
  { id: 'anthropic/claude-sonnet-4-6', label: 'Claude 4.6', accent: '#d4a574' },
  { id: 'openai/gpt-4o', label: 'GPT-4o', accent: '#10a37f' },
  { id: 'x-ai/grok-code-fast-1', label: 'Grok Fast', accent: '#fff' },
  { id: 'meta-llama/llama-3.1-8b-instruct', label: 'Llama 8B', accent: '#8f6aff' },
  { id: 'nousresearch/hermes-3-llama-3.1-70b', label: 'Hermes 70B', accent: '#14f195' },
]

// ── Main ────────────────────────────────────────────────────────

function GodmodeRoute() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [mode, setMode] = useState<Mode>('single')
  const [tier, setTier] = useState<Tier>('fast')
  const [model, setModel] = useState(SINGLE_MODELS[0].id)
  const [godmode, setGodmode] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    trackHubEvent('godmode_route_view', { surface: 'godmode' })
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const send = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault()
      const text = input.trim()
      if (!text || busy) return

      const userMsg: Message = { role: 'user', content: text }
      const history = [...messages, userMsg]
      setMessages(history)
      setInput('')
      setBusy(true)

      // Placeholder
      setMessages([...history, { role: 'assistant', content: '', meta: { mode } }])

      try {
        if (mode === 'ultraplinian') {
          // Non-streaming race
          const resp = await fetch('/api/godmode/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'ultraplinian',
              tier,
              godmode,
              messages: history.map((m) => ({ role: m.role, content: m.content })),
            }),
          })
          const data = await resp.json()
          setMessages((prev) => {
            const copy = [...prev]
            copy[copy.length - 1] = {
              role: 'assistant',
              content: data.content || 'All models failed.',
              meta: {
                mode: 'ultraplinian',
                winner: data.winner,
                results: data.results,
              },
            }
            return copy
          })
        } else {
          // Streaming single model
          const resp = await fetch('/api/godmode/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mode: 'single',
              model,
              godmode,
              stream: true,
              messages: history.map((m) => ({ role: m.role, content: m.content })),
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
                    copy[copy.length - 1] = { role: 'assistant', content: full, meta: { mode: 'single' } }
                    return copy
                  })
                }
              } catch {}
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
        setBusy(false)
        inputRef.current?.focus()
      }
    },
    [input, messages, busy, mode, model, tier, godmode],
  )

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const activeModel = SINGLE_MODELS.find((m) => m.id === model) ?? SINGLE_MODELS[0]

  return (
    <main className="gm-page">
      {/* Header bar */}
      <div className="gm-header">
        <div className="gm-header-left">
          <span className="gm-logo">G0DM0D3</span>
          <span className="gm-logo-sub">x SolanaOS</span>
        </div>
        <div className="gm-header-controls">
          {/* Mode toggle */}
          <div className="gm-mode-toggle">
            <button
              type="button"
              className={`gm-mode-btn${mode === 'single' ? ' is-active' : ''}`}
              onClick={() => setMode('single')}
            >
              Single
            </button>
            <button
              type="button"
              className={`gm-mode-btn gm-mode-ultra${mode === 'ultraplinian' ? ' is-active' : ''}`}
              onClick={() => setMode('ultraplinian')}
            >
              ULTRA
            </button>
          </div>
          {/* GODMODE toggle */}
          <button
            type="button"
            className={`gm-godmode-btn${godmode ? ' is-on' : ''}`}
            onClick={() => setGodmode((g) => !g)}
          >
            {godmode ? 'GODMODE: ON' : 'GODMODE: OFF'}
          </button>
        </div>
      </div>

      {/* Model/tier selector */}
      <div className="gm-selector-bar">
        {mode === 'single' ? (
          <div className="gm-model-chips">
            {SINGLE_MODELS.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`gm-chip${m.id === model ? ' is-active' : ''}`}
                style={m.id === model ? { borderColor: m.accent, color: m.accent } : undefined}
                onClick={() => setModel(m.id)}
              >
                {m.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="gm-model-chips">
            <button
              type="button"
              className={`gm-chip${tier === 'fast' ? ' is-active' : ''}`}
              style={tier === 'fast' ? { borderColor: '#14f195', color: '#14f195' } : undefined}
              onClick={() => setTier('fast')}
            >
              FAST (5 models)
            </button>
            <button
              type="button"
              className={`gm-chip${tier === 'standard' ? ' is-active' : ''}`}
              style={tier === 'standard' ? { borderColor: '#ff8f3d', color: '#ff8f3d' } : undefined}
              onClick={() => setTier('standard')}
            >
              STANDARD (10 models)
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="gm-messages" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="gm-empty">
            <pre className="gm-ascii">{`
 ▄████  ██████  ██████  ███▄ ▄███  ██████  ██████  ██████
██      ██  ██  ██   ██ ██ ███ ██  ██  ██  ██   ██      ██
██ ▄███ ██  ██  ██   ██ ██  █  ██  ██  ██  ██   ██  █████
██  ██  ██  ██  ██   ██ ██     ██  ██  ██  ██   ██      ██
 ██████  ████   ██████  ██     ██   ████   ██████  ██████`}</pre>
            <p className="gm-empty-tagline">LIBERATED AI. COGNITION WITHOUT CONTROL.</p>
            <p className="gm-empty-hint">
              {mode === 'single'
                ? `Single model with ${godmode ? 'GODMODE pipeline' : 'standard prompts'}. Streaming.`
                : `ULTRAPLINIAN: Race ${tier === 'fast' ? '5' : '10'} models in parallel. Best response wins.`}
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`gm-msg ${msg.role === 'user' ? 'is-user' : 'is-assistant'}`}>
            <div className="gm-msg-label">
              {msg.role === 'user' ? (
                'You'
              ) : msg.meta?.mode === 'ultraplinian' && msg.meta?.winner ? (
                <span>
                  <span style={{ color: '#ff8f3d' }}>ULTRA</span> Winner:{' '}
                  <strong style={{ color: '#14f195' }}>{msg.meta.winner.label}</strong>
                  {' '}(score {msg.meta.winner.score}, {msg.meta.winner.latency}ms)
                </span>
              ) : (
                <span style={{ color: activeModel.accent }}>{activeModel.label}</span>
              )}
            </div>

            {/* Race rankings */}
            {msg.meta?.results && msg.meta.results.length > 0 && (
              <div className="gm-race-rankings">
                {msg.meta.results.slice(0, 5).map((r, j) => (
                  <div key={r.model} className="gm-race-row">
                    <span className="gm-race-rank">{j === 0 ? '1st' : j === 1 ? '2nd' : j === 2 ? '3rd' : `${j + 1}th`}</span>
                    <span className="gm-race-model">{r.label}</span>
                    <span className="gm-race-score">score {r.score}</span>
                    <span className="gm-race-latency">{r.latency}ms</span>
                  </div>
                ))}
              </div>
            )}

            <div className="gm-msg-body">
              {msg.content || (busy && i === messages.length - 1 ? (
                <span className="gm-typing">
                  {mode === 'ultraplinian' ? 'Racing models...' : 'Generating...'}
                </span>
              ) : null)}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form className="gm-input-bar" onSubmit={send}>
        <textarea
          ref={inputRef}
          className="gm-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={busy ? (mode === 'ultraplinian' ? 'Racing models...' : 'Generating...') : 'Enter prompt...'}
          disabled={busy}
          rows={1}
        />
        <button
          type="submit"
          className="gm-send"
          disabled={busy || !input.trim()}
        >
          {mode === 'ultraplinian' ? 'RACE' : 'SEND'}
        </button>
      </form>
    </main>
  )
}
