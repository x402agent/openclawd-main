import { createFileRoute } from '@tanstack/react-router'
import { ConnectBox } from '@phantom/react-sdk'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/auth/callback')({
  component: AuthCallback,
})

function AuthCallback() {
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const c = params.get('code')
    if (c) setCode(c)
  }, [])

  async function copyCode() {
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fall through — user can select manually
    }
  }

  if (code) {
    return (
      <main
        className="section"
        style={{ display: 'grid', placeItems: 'center', minHeight: '70vh', padding: 24 }}
      >
        <div className="card" style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
          <span className="hero-badge" style={{ marginBottom: 12 }}>
            🦞 OpenClawd · OpenRouter
          </span>
          <h1 style={{ marginTop: 0 }}>Paste this code into your terminal</h1>
          <p style={{ opacity: 0.8, marginBottom: 24 }}>
            Return to the <code>clawd</code> CLI and paste the code at the prompt. The terminal
            will exchange it for an API key locally — the key never touches this page.
          </p>
          <code
            style={{
              display: 'block',
              padding: 16,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.25)',
              fontSize: 15,
              wordBreak: 'break-all',
              marginBottom: 16,
            }}
          >
            {code}
          </code>
          <button type="button" className="btn btn-primary" onClick={copyCode}>
            {copied ? 'Copied ✓' : 'Copy code'}
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="section" style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
      <ConnectBox />
    </main>
  )
}
