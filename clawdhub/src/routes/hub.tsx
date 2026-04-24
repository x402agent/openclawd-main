import { createFileRoute, Link } from '@tanstack/react-router'
import { useMemo, useState } from 'react'
import { InstallSwitcher } from '../components/InstallSwitcher'
import { openClawdCatalog } from '../lib/generated/openclawdCatalog'

export const Route = createFileRoute('/hub')({
  component: HubRoute,
})

function HubRoute() {
  const [query, setQuery] = useState('')
  const normalizedQuery = query.trim().toLowerCase()

  const filteredPackages = useMemo(() => {
    if (!normalizedQuery) return openClawdCatalog.packages
    return openClawdCatalog.packages.filter((entry) =>
      `${entry.name} ${entry.path} ${entry.category} ${entry.summary} ${entry.keyFiles.join(' ')}`.toLowerCase().includes(normalizedQuery),
    )
  }, [normalizedQuery])

  const filteredSkills = useMemo(() => {
    if (!normalizedQuery) return openClawdCatalog.skills
    return openClawdCatalog.skills.filter((entry) =>
      `${entry.name} ${entry.path}`.toLowerCase().includes(normalizedQuery),
    )
  }, [normalizedQuery])

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">{openClawdCatalog.siteUrl} / SolanaOS</span>
            <h1 className="hero-title">The SolanaOS computer system catalog for Seeker, gateway, agent, and on-chain runtime modules.</h1>
            <p className="hero-subtitle">
              Browse the full Go runtime surface from <code>pkg/</code>, inspect the public
              Seeker-linked computer modules that power SolanaOS, install downloadable skills built
              from this repo, and use the web backend as the public control plane instead of
              exposing local internals directly.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <a href="/mobile" className="btn btn-primary">
                See mobile dapp
              </a>
              <a href="#solanaos-skills" className="btn btn-primary">
                Download skills
              </a>
              <a href="#solanaos-packages" className="btn">
                Explore packages
              </a>
              <a href={openClawdCatalog.troubleshootingUrl} className="btn">
                Troubleshooting
              </a>
            </div>
          </div>
          <div className="hero-card hero-search-card fade-up" data-delay="2">
            <div className="catalog-stats-grid">
              <div className="card">
                <div className="stat">Runtime packages</div>
                <strong>{openClawdCatalog.packageCount}</strong>
              </div>
              <div className="card">
                <div className="stat">Downloadable skills</div>
                <strong>{openClawdCatalog.skillCount}</strong>
              </div>
              <div className="card">
                <div className="stat">Backend surface</div>
                <strong>{openClawdCatalog.backend.entries.length} files</strong>
              </div>
            </div>
            <div className="hero-install" style={{ marginTop: 18 }}>
              <div className="stat">Install SolanaOS skills from the hub CLI:</div>
              <InstallSwitcher exampleSlug="seeker-daemon-ops" />
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <header className="skills-header-top">
          <h2 className="section-title" style={{ marginBottom: 8 }}>
            SolanaOS catalog search
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Filter runtime packages and skills by name or path.
          </p>
        </header>
        <div className="skills-toolbar">
          <div className="skills-search">
            <input
              className="skills-search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search agent, gateway, solana, seeker-daemon-ops, pump..."
            />
          </div>
          <div className="stat">
            {filteredPackages.length.toLocaleString('en-US')} packages ·{' '}
            {filteredSkills.length.toLocaleString('en-US')} skills
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card solanaos-home-cta">
          <div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Seeker mobile dapp preview
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Walk the current mobile experience as a public product page: pairing, registry,
              Grok, chat, ORE, canvas, and settings framed around the Seeker build we just shipped.
            </p>
          </div>
          <div className="solanaos-home-cta-actions">
            <a href="/mobile" className="btn btn-primary">
              Open mobile route
            </a>
            <a href="/pair" className="btn">
              Pair handoff
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="card solanaos-home-cta" style={{ borderLeft: '3px solid var(--color-accent, #7c3aed)' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              Formal Verification for Solana Programs
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Mathematically prove your Solana program is correct using Lean 4 proofs. QEDGen lets Claude
              act as the proof engineer — reading your codebase, writing formal specifications, generating
              Lean 4 models, and iterating on proofs with Leanstral for hard sub-goals.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="tag tag-accent">Access Control</span>
              <span className="tag tag-accent">Conservation</span>
              <span className="tag tag-accent">State Machines</span>
              <span className="tag tag-accent">Arithmetic Safety</span>
              <span className="tag tag-accent">CPI Correctness</span>
            </div>
          </div>
          <div className="solanaos-home-cta-actions">
            <a href="#skill-solana-formal-verification" className="btn btn-primary">
              Install skill
            </a>
            <a href="https://github.com/qedgen/solana-skills" target="_blank" rel="noreferrer" className="btn">
              View on GitHub
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Bundled mobile starter pack</h2>
        <p className="section-subtitle">
          The Android Seeker build now ships with a curated SolanaOS mobile skill pack and always
          points back to <code>{openClawdCatalog.skillsHubUrl}</code> for the full catalog.
        </p>
        <div className="grid">
          {openClawdCatalog.bundledMobileSkills.map((entry) => (
            <article key={entry.slug} className="card solanaos-feature-card">
              <div className="catalog-card-top">
                <h3 className="skill-card-title">{entry.title}</h3>
                <span className="tag tag-accent">{entry.slug}</span>
              </div>
              <p className="stat" style={{ margin: 0 }}>
                {entry.summary}
              </p>
              <div className="catalog-link-row">
                <a href={`${openClawdCatalog.skillsHubUrl}#skill-${entry.slug}`}>Open on hub</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <header className="skills-header-top">
          <h2 className="section-title" style={{ marginBottom: 8 }}>
            SolanaOS computer system modules
          </h2>
          <p className="section-subtitle" style={{ marginBottom: 0 }}>
            Featured runtime groups from the Seeker-connected SolanaOS computer stack.
          </p>
        </header>
        <div className="grid">
          {openClawdCatalog.featuredSections.map((section) => (
            <article key={section.title} className="card solanaos-feature-card">
              <div className="catalog-card-top">
                <h3 className="skill-card-title">{section.title}</h3>
                <span className="tag tag-accent">{section.packages.length} modules</span>
              </div>
              <p className="stat" style={{ margin: 0 }}>
                {section.summary}
              </p>
              <div className="solanaos-chip-row">
                {section.packages.map((name) => (
                  <a key={name} href={`#pkg-${name}`} className="tag solanaos-package-chip">
                    {name}
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="solanaos-packages">
        <h2 className="section-title">Go runtime packages</h2>
        <p className="section-subtitle">
          Every top-level module under <code>pkg/</code>, grouped and described as part of the
          SolanaOS computer system.
        </p>
        <div className="grid">
          {filteredPackages.map((entry) => (
            <article key={entry.path} id={`pkg-${entry.name}`} className="card catalog-card">
              <div className="catalog-card-top">
                <h3 className="skill-card-title">{entry.name}</h3>
                <span className="tag">{entry.category}</span>
              </div>
              <p className="stat" style={{ margin: 0 }}>
                {entry.summary}
              </p>
              <code className="catalog-path">{entry.path}</code>
              <code className="catalog-command">{entry.importPath}</code>
              <div className="solanaos-package-meta">
                <span className="tag">{entry.fileCount} files</span>
                <span className="tag">{formatBytes(entry.sizeBytes)} of source</span>
              </div>
              {entry.keyFiles.length > 0 ? (
                <div className="solanaos-keyfiles">
                  <div className="stat">Key files</div>
                  <div className="solanaos-chip-row">
                    {entry.keyFiles.slice(0, 8).map((file) => (
                      <span key={file} className="tag">
                        {file}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="catalog-link-row">
                <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
                  View source
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="solanaos-skills">
        <h2 className="section-title">Downloadable skills</h2>
        <p className="section-subtitle">
          Skill folders from <code>skills/</code>, exported as static zip downloads during the
          site build.
        </p>
        <div className="grid">
          {filteredSkills.map((entry) => (
            <article key={entry.path} id={`skill-${entry.name}`} className="card catalog-card">
              <div className="catalog-card-top">
                <h3 className="skill-card-title">{entry.name}</h3>
                <span className="tag tag-accent">{entry.fileCount} files</span>
              </div>
              <code className="catalog-path">{entry.path}</code>
              <div className="stat">{formatBytes(entry.sizeBytes)} unpacked</div>
              <code className="catalog-command">{entry.install.npm}</code>
              <div className="catalog-link-row">
                <a href={entry.downloadUrl} download>
                  Download zip
                </a>
                <a href={entry.catalogUrl}>Hub entry</a>
                <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
                  View source
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Solana-Claude Agent Engine ─────────────────────────────── */}
      <section className="section">
        <div className="card solanaos-home-cta" style={{ borderLeft: '3px solid #14f195' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>
              solana-claude Agent Engine
            </h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              Solana-native agentic engine with OODA trading loops, 31 MCP tools, 7 built-in agents,
              18 blockchain buddy species, 3-tier epistemological memory, 128-bit risk engine,
              AgentWallet vault, and Telegram gateway. Now bundled in <code>solana-claude/</code>.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="tag tag-accent">7 Agents</span>
              <span className="tag tag-accent">31 MCP Tools</span>
              <span className="tag tag-accent">95 Skills</span>
              <span className="tag tag-accent">18 Buddy Species</span>
              <span className="tag tag-accent">128-bit Risk Engine</span>
              <span className="tag tag-accent">OODA Loop</span>
              <span className="tag tag-accent">x402 Payments</span>
            </div>
          </div>
          <div className="solanaos-home-cta-actions">
            <Link to="/agents/engine" className="btn btn-primary">
              Open Agent Engine
            </Link>
            <Link to="/tracker" className="btn">
              Live Charts
            </Link>
            <Link to="/scanner" className="btn">
              Pump Scanner
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">solana-claude Components</h2>
        <p className="section-subtitle">
          Core subsystems bundled from <code>solana-claude/</code> — gateway, wallet vault, examples, and data integrations.
        </p>
        <div className="grid">
          <article className="card solanaos-feature-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">CLAWD Gateway</h3>
              <span className="tag tag-accent">gateway/</span>
            </div>
            <p className="stat" style={{ margin: 0 }}>
              Telegram bot + HTTP API with Helius RPC, Birdeye WebSocket alerts,
              wallet commands, price tracking, and whale watching.
            </p>
          </article>
          <article className="card solanaos-feature-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">AgentWallet Vault</h3>
              <span className="tag tag-accent">packages/agentwallet/</span>
            </div>
            <p className="stat" style={{ margin: 0 }}>
              AES-256-GCM encrypted Solana + EVM keypair management.
              REST API for wallet CRUD, import/export, E2B and Cloudflare deployment.
            </p>
          </article>
          <article className="card solanaos-feature-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">TailClaude</h3>
              <span className="tag tag-accent">tailclawd/</span>
            </div>
            <p className="stat" style={{ margin: 0 }}>
              Full Claude Code interface in the browser via Tailscale.
              Real-time cost tracking, session history, QR code pairing.
            </p>
          </article>
          <article className="card solanaos-feature-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">Solana Tracker</h3>
              <span className="tag tag-accent">solana-tracker/</span>
            </div>
            <p className="stat" style={{ margin: 0 }}>
              Full-stack Helius wallet tracking — balances, tx history, transfers,
              funding source detection, batch identity, and DAS assets.
            </p>
          </article>
          <article className="card solanaos-feature-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">TradingView Charts</h3>
              <span className="tag tag-accent">solana-tradingview/</span>
            </div>
            <p className="stat" style={{ margin: 0 }}>
              Advanced TradingView charts with real-time Solana Tracker Datastream.
              OHLCV candles, live trades, wallet tracking, holder overlays.
            </p>
          </article>
          <article className="card solanaos-feature-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">Risk Engine Spec</h3>
              <span className="tag tag-accent">docs/risk-engine-spec.md</span>
            </div>
            <p className="stat" style={{ margin: 0 }}>
              128-bit perpetual DEX risk engine. Protected principal, lazy ADL,
              oracle manipulation resistance, live premium funding.
            </p>
          </article>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Backend recommendation</h2>
        <p className="section-subtitle">
          Yes, this should connect to <code>web/backend</code>. That service is the right public
          edge for SolanaOS runtime actions, setup bundles, gateway access, and authenticated API
          calls.
        </p>
        <div className="card" style={{ gap: 16 }}>
          <p className="stat" style={{ margin: 0 }}>
            {openClawdCatalog.backend.summary}
          </p>
          <div className="grid">
            {openClawdCatalog.backend.entries.map((entry) => (
              <article key={entry.path} className="card catalog-card">
                <h3 className="skill-card-title">{entry.name}</h3>
                <code className="catalog-path">{entry.path}</code>
                <div className="stat">{entry.role}</div>
                <div className="catalog-link-row">
                  <a href={entry.sourceUrl} target="_blank" rel="noreferrer">
                    View source
                  </a>
                </div>
              </article>
            ))}
          </div>
          <p className="stat" style={{ margin: 0 }}>
            <strong>Security:</strong> <code>web/backend/.env</code> is intentionally not surfaced
            here. Keep deploy secrets private and ship only the built backend service.
          </p>
        </div>
      </section>
    </main>
  )
}

function formatBytes(sizeBytes: number) {
  if (sizeBytes >= 1_000_000) {
    return `${(sizeBytes / 1_000_000).toFixed(2)} MB`
  }
  if (sizeBytes >= 1_000) {
    return `${(sizeBytes / 1_000).toFixed(1)} KB`
  }
  return `${sizeBytes} B`
}
