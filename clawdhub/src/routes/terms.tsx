import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { trackHubEvent } from '../lib/analytics'
import { getNanoHubSiteUrl } from '../lib/site'

export const Route = createFileRoute('/terms')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/terms`
    const title = 'Terms of Service | SolanaOS'
    const description =
      'SolanaOS terms of service. Usage terms for the SolanaOS runtime, mobile dApp, and Hub surfaces.'

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
  component: TermsRoute,
})

function TermsRoute() {
  useEffect(() => {
    trackHubEvent('legal_page_view', { page: 'terms' })
  }, [])

  return (
    <main className="solana-legal-page">
      <section className="hero solana-legal-hero">
        <div className="hero-inner solana-legal-hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">Legal / Terms</span>
            <h1 className="hero-title">
              Terms of Service.
              <br />
              <span className="solana-legal-hero-accent">Operator-first, transparent use.</span>
            </h1>
            <p className="hero-subtitle">
              By using SolanaOS you agree to these terms. SolanaOS is provided as-is for operators
              who want autonomous local-first control over their Solana infrastructure.
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
              <span className="tag solana-legal-tag">Acceptance</span>
              <h2>Agreement to Terms</h2>
              <p>
                By accessing or using the SolanaOS runtime, mobile dApp, Hub surfaces, or any
                associated tooling, you agree to be bound by these Terms of Service. If you do not
                agree, do not use SolanaOS.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Description</span>
              <h2>The Service</h2>
              <p>
                SolanaOS is a Seeker-native mobile dApp for running and monitoring your SolanaOS
                agent from your phone. It pairs with your SolanaOS runtime and gives you one place
                to check status, chat with your agent, manage permissions, use voice and camera
                inputs, and control on-device workflows without relying on a generic remote shell.
              </p>
              <p>
                Built for local-first operation, SolanaOS is designed around direct control,
                visibility, and fast interaction. You can use it to stay connected to your runtime,
                inspect what it is doing, and operate your Solana setup from Seeker with a mobile
                experience that feels purpose-built instead of adapted from desktop tooling.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Usage</span>
              <h2>Acceptable Use</h2>
              <div className="solana-legal-list">
                <div className="solana-legal-list-item">
                  <span className="solana-legal-bullet">&#x25C6;</span>
                  <span>
                    You are responsible for securing your own keys, wallets, RPC endpoints, and
                    runtime environment.
                  </span>
                </div>
                <div className="solana-legal-list-item">
                  <span className="solana-legal-bullet">&#x25C6;</span>
                  <span>
                    You may not use SolanaOS to engage in unlawful activity, market manipulation,
                    or fraud.
                  </span>
                </div>
                <div className="solana-legal-list-item">
                  <span className="solana-legal-bullet">&#x25C6;</span>
                  <span>
                    You may not reverse-engineer, decompile, or attempt to extract source code from
                    compiled binaries beyond what the MIT License permits.
                  </span>
                </div>
                <div className="solana-legal-list-item">
                  <span className="solana-legal-bullet">&#x25C6;</span>
                  <span>
                    You may not use SolanaOS brand assets to imply official endorsement or
                    partnership without written permission.
                  </span>
                </div>
              </div>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Risk</span>
              <h2>Disclaimer of Warranties</h2>
              <p>
                SolanaOS is provided "as is" and "as available" without warranties of any kind,
                either express or implied. The authors and contributors make no representations
                about the suitability, reliability, availability, or accuracy of the software.
                Trading, wallet management, and on-chain operations carry inherent financial risk.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Liability</span>
              <h2>Limitation of Liability</h2>
              <p>
                In no event shall the SolanaOS authors or contributors be liable for any indirect,
                incidental, special, consequential, or punitive damages, including but not limited
                to loss of profits, data, or funds, arising out of or in connection with your use
                of SolanaOS.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Changes</span>
              <h2>Modifications</h2>
              <p>
                We reserve the right to modify these terms at any time. Continued use of SolanaOS
                after changes constitutes acceptance of the updated terms.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Contact</span>
              <h2>Questions</h2>
              <p>
                For questions about these terms, contact{' '}
                <a href="mailto:security@8bitlabs.xyz" className="solana-legal-link">
                  security@8bitlabs.xyz
                </a>
                .
              </p>
            </div>
          </article>

          <div className="solana-legal-nav">
            <Link to="/privacy" className="btn">
              Privacy Policy
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
