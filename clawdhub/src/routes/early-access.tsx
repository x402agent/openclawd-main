import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { trackHubEvent } from '../lib/analytics'
import { getNanoHubSiteUrl } from '../lib/site'

export const Route = createFileRoute('/early-access')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/early-access`
    const title = 'Early Access | SolanaOS'
    const description = 'Sign up for early access to SolanaOS — the Solana computer for traders, operators, and builders.'
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
  component: EarlyAccessRoute,
})

function EarlyAccessRoute() {
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    trackHubEvent('early_access_view', { surface: 'early-access' })
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setBusy(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const resp = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as any).toString(),
      })
      if (resp.ok) {
        setSubmitted(true)
        trackHubEvent('early_access_submit', { surface: 'early-access' })
      } else {
        setError('Submission failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  if (submitted) {
    return (
      <main className="ea-page">
        <div className="ea-success">
          <div className="ea-success-icon">&#x2714;</div>
          <h1>You're on the list.</h1>
          <p>We'll reach out when early access opens. Keep building.</p>
          <a href="/" className="ea-back-link">Back to SolanaOS</a>
        </div>
      </main>
    )
  }

  return (
    <main className="ea-page">
      {/* Hidden HTML form for Netlify detection */}
      <form name="early-access" data-netlify="true" hidden>
        <input type="text" name="username" />
        <input type="email" name="email" />
        <input type="text" name="solana-wallet" />
        <input type="text" name="evm-wallet" />
        <input type="text" name="telegram" />
        <input type="text" name="x-handle" />
        <input type="text" name="github" />
        <input type="text" name="role" />
        <input type="text" name="interest" />
      </form>

      <section className="hero ea-hero">
        <div className="hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">Early Access</span>
            <h1 className="hero-title">
              Get early access.
              <br />
              <span className="solana-legal-hero-accent">Build with SolanaOS.</span>
            </h1>
            <p className="hero-subtitle">
              SolanaOS is the autonomous Solana computer for traders, operators, and builders.
              Sign up to get early access to the runtime, mobile dApp, and Hub.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="ea-form-wrap">
          <form
            name="early-access"
            method="POST"
            data-netlify="true"
            onSubmit={handleSubmit}
            className="ea-form"
          >
            <input type="hidden" name="form-name" value="early-access" />

            <div className="ea-section-label">Identity</div>

            <div className="ea-field">
              <label htmlFor="ea-username">Username *</label>
              <input id="ea-username" name="username" type="text" required placeholder="your handle" />
            </div>

            <div className="ea-field">
              <label htmlFor="ea-email">Email *</label>
              <input id="ea-email" name="email" type="email" required placeholder="you@example.com" />
            </div>

            <div className="ea-row">
              <div className="ea-field">
                <label htmlFor="ea-telegram">Telegram</label>
                <input id="ea-telegram" name="telegram" type="text" placeholder="@username" />
              </div>
              <div className="ea-field">
                <label htmlFor="ea-x">X / Twitter</label>
                <input id="ea-x" name="x-handle" type="text" placeholder="@handle" />
              </div>
            </div>

            <div className="ea-field">
              <label htmlFor="ea-github">GitHub</label>
              <input id="ea-github" name="github" type="text" placeholder="github.com/username" />
            </div>

            <div className="ea-section-label">Wallets</div>

            <div className="ea-field">
              <label htmlFor="ea-sol">Solana Wallet</label>
              <input id="ea-sol" name="solana-wallet" type="text" placeholder="Your Solana address" />
            </div>

            <div className="ea-field">
              <label htmlFor="ea-evm">EVM Wallet</label>
              <input id="ea-evm" name="evm-wallet" type="text" placeholder="0x... (Ethereum, Base, etc.)" />
            </div>

            <div className="ea-section-label">About You</div>

            <div className="ea-field">
              <label htmlFor="ea-role">Role</label>
              <select id="ea-role" name="role">
                <option value="">Select...</option>
                <option value="trader">Trader</option>
                <option value="developer">Developer</option>
                <option value="operator">Operator / Node Runner</option>
                <option value="researcher">Researcher</option>
                <option value="builder">Builder / Founder</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="ea-field">
              <label htmlFor="ea-interest">What interests you most?</label>
              <select id="ea-interest" name="interest">
                <option value="">Select...</option>
                <option value="trading">Autonomous Trading</option>
                <option value="mobile">Seeker Mobile dApp</option>
                <option value="agents">AI Agents</option>
                <option value="skills">Skills & Hub</option>
                <option value="mining">Mining</option>
                <option value="voice">Voice & Telegram Control</option>
                <option value="everything">Everything</option>
              </select>
            </div>

            {error && <p className="ea-error">{error}</p>}

            <button type="submit" className="ea-submit" disabled={busy}>
              {busy ? 'Submitting...' : 'Request Early Access'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
