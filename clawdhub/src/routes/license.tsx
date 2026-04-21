import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { trackHubEvent } from '../lib/analytics'
import { getNanoHubSiteUrl } from '../lib/site'

export const Route = createFileRoute('/license')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/license`
    const title = 'License | SolanaOS'
    const description =
      'SolanaOS is distributed under the MIT License. View the full license terms.'

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
  component: LicenseRoute,
})

function LicenseRoute() {
  useEffect(() => {
    trackHubEvent('legal_page_view', { page: 'license' })
  }, [])

  return (
    <main className="solana-legal-page">
      <section className="hero solana-legal-hero">
        <div className="hero-inner solana-legal-hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">Legal / License</span>
            <h1 className="hero-title">
              MIT License.
              <br />
              <span className="solana-legal-hero-accent">Free and open source.</span>
            </h1>
            <p className="hero-subtitle">
              The SolanaOS repository is distributed under the MIT License. Use, modify, and
              distribute freely.
            </p>
            <div className="solana-legal-meta-strip">
              <div className="solana-legal-meta-chip">
                <span>License</span>
                <strong>MIT</strong>
              </div>
              <div className="solana-legal-meta-chip">
                <span>Source</span>
                <strong>GitHub</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="solana-legal-content">
          <article className="card solana-legal-card">
            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">License</span>
              <h2>MIT License</h2>
              <p>
                The canonical license file lives in the project repository root.{' '}
                <a
                  href="https://github.com/sepivip/nanosolana-go/blob/main/LICENSE"
                  className="solana-legal-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on GitHub
                </a>
                .
              </p>
            </div>

            <div className="solana-legal-section">
              <span className="tag solana-legal-tag">Full Text</span>
              <h2>License Text</h2>
              <div className="solana-legal-license-block">
                <pre>{`MIT License

Copyright (c) 2026 SolanaOS contributors

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.`}</pre>
              </div>
            </div>
          </article>

          <div className="solana-legal-nav">
            <Link to="/privacy" className="btn">
              Privacy Policy
            </Link>
            <Link to="/terms" className="btn">
              Terms of Service
            </Link>
            <Link to="/copyright" className="btn">
              Copyright
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
