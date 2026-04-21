import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { trackHubEvent } from '../lib/analytics'
import { getNanoHubSiteUrl } from '../lib/site'

export const Route = createFileRoute('/privacy')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/privacy`
    const title = 'Privacy Policy | SolanaOS'
    const description =
      'SolanaOS privacy policy. Local-first design, operator-controlled data, and transparent data practices.'

    return {
      links: [{ rel: 'canonical', href: url }],
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: url },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
    }
  },
  component: PrivacyRoute,
})

function PrivacyRoute() {
  useEffect(() => {
    trackHubEvent('legal_page_view', { page: 'privacy' })
  }, [])

  return (
    <main className="solana-legal-page">
      <section className="hero solana-legal-hero">
        <div className="hero-inner solana-legal-hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">Legal / Privacy</span>
            <h1 className="hero-title">
              Privacy Policy.
              <br />
              <span className="solana-legal-hero-accent">Local-first by design.</span>
            </h1>
            <p className="hero-subtitle">
              SolanaOS is built to keep sensitive runtime data, device state, and wallet-adjacent
              workflows under the operator's control.
            </p>
            <div className="solana-legal-meta-strip">
              <div className="solana-legal-meta-chip">
                <span>Effective</span>
                <strong>March 1, 2026</strong>
              </div>
              <div className="solana-legal-meta-chip">
                <span>Contact</span>
                <strong>security@8bitlabs.xyz</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="solana-legal-content">
          <article className="card solana-legal-card">
            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Overview</span>
              <h2>SolanaOS Privacy Policy</h2>
              <p>
                SolanaOS is designed as a local-first product. The Android app and related control
                surfaces are built to keep sensitive runtime data, device state, and wallet-adjacent
                workflows under the operator's control.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Collection</span>
              <h2>What We Collect</h2>
              <p>
                SolanaOS may process account identifiers, device pairing metadata, runtime logs,
                configuration details, and app telemetry that is necessary to operate the product.
                Data processed through your own connected providers, wallets, RPC endpoints, or
                agent infrastructure remains governed by those services as well.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Usage</span>
              <h2>How Data Is Used</h2>
              <div className="solana-legal-list">
                <div className="solana-legal-list-item">
                  <span className="solana-legal-bullet">&#x25C6;</span>
                  <span>
                    To pair the mobile app with your SolanaOS runtime or gateway.
                  </span>
                </div>
                <div className="solana-legal-list-item">
                  <span className="solana-legal-bullet">&#x25C6;</span>
                  <span>
                    To render status, chat, voice, camera, and device-control features.
                  </span>
                </div>
                <div className="solana-legal-list-item">
                  <span className="solana-legal-bullet">&#x25C6;</span>
                  <span>
                    To troubleshoot failures, secure the service, and improve product reliability.
                  </span>
                </div>
              </div>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Sharing</span>
              <h2>Data Sharing</h2>
              <p>
                SolanaOS does not sell your personal information. Data may be shared only with
                infrastructure and API providers that you explicitly configure or that are required
                to deliver the feature you use.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Storage</span>
              <h2>Retention</h2>
              <p>
                Local runtime data is retained according to your own installation, device state,
                and configured services. Cloud-side retention depends on the providers you connect
                to.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Contact</span>
              <h2>Questions</h2>
              <p>
                For privacy or security questions, contact{' '}
                <a href="mailto:security@8bitlabs.xyz" className="solana-legal-link">
                  security@8bitlabs.xyz
                </a>
                .
              </p>
            </div>
          </article>

          <div className="solana-legal-nav">
            <Link to="/terms" className="btn">
              Terms of Service
            </Link>
            <Link to="/copyright" className="btn">
              Copyright
            </Link>
            <Link to="/license" className="btn">
              License
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
