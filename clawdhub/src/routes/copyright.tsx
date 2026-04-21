import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { trackHubEvent } from '../lib/analytics'
import { getNanoHubSiteUrl } from '../lib/site'

export const Route = createFileRoute('/copyright')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/copyright`
    const title = 'Copyright Notice | SolanaOS'
    const description =
      'SolanaOS copyright notice. Ownership, third-party software, and brand asset usage.'

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
  component: CopyrightRoute,
})

function CopyrightRoute() {
  useEffect(() => {
    trackHubEvent('legal_page_view', { page: 'copyright' })
  }, [])

  return (
    <main className="solana-legal-page">
      <section className="hero solana-legal-hero">
        <div className="hero-inner solana-legal-hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">Legal / Copyright</span>
            <h1 className="hero-title">
              Copyright Notice.
              <br />
              <span className="solana-legal-hero-accent">Open source, clear ownership.</span>
            </h1>
            <p className="hero-subtitle">
              SolanaOS source code, app packaging, brand presentation, documentation, and related
              media are owned by their respective authors and contributors.
            </p>
            <div className="solana-legal-meta-strip">
              <div className="solana-legal-meta-chip">
                <span>Year</span>
                <strong>2026</strong>
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
              <span className="tag solana-legal-tag">Notice</span>
              <h2>Copyright Notice</h2>
              <p>
                SolanaOS source code, app packaging, brand presentation, documentation, and
                related media are owned by their respective authors and contributors. Third-party
                components remain subject to their own licenses and notices.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Ownership</span>
              <h2>Project Ownership</h2>
              <p>
                The public project source is maintained in the{' '}
                <a
                  href="https://github.com/x402agent/SolanaOS"
                  className="solana-legal-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SolanaOS repository
                </a>{' '}
                and distributed under the MIT License where applicable. Brand assets and store
                media should not be redistributed in a misleading way or used to imply an official
                partnership without permission.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Dependencies</span>
              <h2>Third-Party Software</h2>
              <p>
                SolanaOS includes open-source dependencies. Applicable notices and third-party
                license files remain in the repository and app distribution where required.
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Contact</span>
              <h2>Questions</h2>
              <p>
                For copyright or takedown questions, contact{' '}
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
            <Link to="/terms" className="btn">
              Terms of Service
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
