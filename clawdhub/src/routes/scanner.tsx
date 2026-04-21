import { createFileRoute, Link } from '@tanstack/react-router'
import { useCallback, useEffect, useState } from 'react'
import { trackHubEvent } from '../lib/analytics'
import { getNanoHubSiteUrl } from '../lib/site'

const SCANNER_API = 'https://pumpfun-mcp-server.x402.workers.dev'

export const Route = createFileRoute('/scanner')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/scanner`
    const title = 'Pump Scanner | SolanaOS'
    const description =
      'Live pump.fun token scanner. Top 100 trending Solana tokens, risk scores, market data, and tier classification.'
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
  component: ScannerRoute,
})

type Token = {
  name?: string
  symbol?: string
  mint?: string
  priceUsd?: number
  marketCapUsd?: number
  volume24h?: number
  holders?: number
  riskScore?: number
  priceChange24h?: number
  curvePercentage?: number
  buys?: number
  sells?: number
  tier?: string
  tierLabel?: string
  age?: string
  market?: string
}

type ScanData = {
  timestamp: string
  tokenCount: number
  summary: {
    totalTokens: number
    nearGraduation: number
    freshTokens: number
    highestMcToken?: { name: string; symbol: string; mc: string }
    top5ByMc?: { name: string; symbol: string; mc: string }[]
  }
  tokens: Token[]
}

const TIER_COLORS: Record<string, string> = {
  '1': '#ff4d6a',
  '2': '#ff8f3d',
  '3': '#ffd93d',
  '4': '#14f195',
  '5': '#00d4ff',
}

const TIER_LABELS: Record<string, string> = {
  '1': 'Fresh Sniper',
  '2': 'Near Grad',
  '3': 'Micro-Cap',
  '4': 'Mid-Cap',
  '5': 'Large-Cap',
}

function formatUsd(n?: number): string {
  if (n == null) return '—'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  if (n >= 1) return `$${n.toFixed(2)}`
  if (n >= 0.001) return `$${n.toFixed(4)}`
  return `$${n.toExponential(2)}`
}

function formatPct(n?: number): string {
  if (n == null) return '—'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(1)}%`
}

function formatNum(n?: number): string {
  if (n == null) return '—'
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return n.toLocaleString()
}

function classifyTier(t: Token): string {
  const mc = t.marketCapUsd ?? 0
  if (t.age && t.age.includes('m') && parseInt(t.age) <= 15) return '1'
  if ((t.curvePercentage ?? 0) >= 75) return '2'
  if (mc < 10_000) return '3'
  if (mc < 100_000) return '4'
  return '5'
}

function ScannerRoute() {
  const [data, setData] = useState<ScanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    trackHubEvent('scanner_route_view', { surface: 'scanner' })
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const resp = await fetch(`${SCANNER_API}/api/latest`)
      if (!resp.ok) throw new Error(`${resp.status}`)
      const json = await resp.json()
      setData(json as ScanData)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const tokens = (data?.tokens ?? []).map((t) => {
    const tier = t.tier || classifyTier(t)
    return { ...t, tier, tierLabel: t.tierLabel || TIER_LABELS[tier] || 'Unknown' }
  })

  const filtered = tokens.filter((t) => {
    if (filter !== 'all' && t.tier !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      return (t.symbol?.toLowerCase().includes(q) || t.name?.toLowerCase().includes(q) || t.mint?.toLowerCase().includes(q))
    }
    return true
  })

  return (
    <main className="solana-scanner-page">
      <section className="hero solana-scanner-hero">
        <div className="hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">Pump Scanner / Live</span>
            <h1 className="hero-title">
              Pump.fun Scanner.
              <br />
              <span className="solana-legal-hero-accent">Top 100 trending tokens.</span>
            </h1>
            <p className="hero-subtitle">
              Auto-scanned every 15 minutes. Tier-classified. Risk-scored. Powered by SolanaTracker
              + GeckoTerminal.
            </p>
            {data && (
              <div className="solana-legal-meta-strip">
                <div className="solana-legal-meta-chip">
                  <span>Last Scan</span>
                  <strong>{new Date(data.timestamp).toLocaleTimeString()}</strong>
                </div>
                <div className="solana-legal-meta-chip">
                  <span>Tokens</span>
                  <strong>{data.tokenCount}</strong>
                </div>
                <div className="solana-legal-meta-chip">
                  <span>Near Grad</span>
                  <strong>{data.summary.nearGraduation}</strong>
                </div>
                <div className="solana-legal-meta-chip">
                  <span>Fresh</span>
                  <strong>{data.summary.freshTokens}</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="solana-scanner-controls">
          <input
            className="solana-scanner-search"
            type="text"
            placeholder="Search by symbol, name, or mint..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="solana-scanner-filters">
            {[
              { id: 'all', label: 'All' },
              { id: '1', label: 'Fresh' },
              { id: '2', label: 'Near Grad' },
              { id: '3', label: 'Micro' },
              { id: '4', label: 'Mid' },
              { id: '5', label: 'Large' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                className={`solana-scanner-filter-chip${filter === f.id ? ' is-active' : ''}`}
                style={filter === f.id && f.id !== 'all' ? { borderColor: TIER_COLORS[f.id], color: TIER_COLORS[f.id] } : undefined}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
            <button type="button" className="solana-scanner-refresh" onClick={fetchData} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {error && <p style={{ color: '#ff4d6a', textAlign: 'center', padding: 20 }}>{error}</p>}

        <div className="solana-scanner-grid">
          {filtered.map((token, i) => {
            const tierColor = TIER_COLORS[token.tier ?? '5'] ?? '#888'
            const change = token.priceChange24h
            const changeColor = change != null ? (change >= 0 ? '#14f195' : '#ff4d6a') : 'rgba(255,255,255,0.3)'
            return (
              <div key={token.mint || i} className="solana-scanner-card">
                <div className="solana-scanner-card-header">
                  <div>
                    <span className="solana-scanner-symbol">{token.symbol || '???'}</span>
                    <span className="solana-scanner-name">{token.name}</span>
                  </div>
                  <span className="solana-scanner-tier" style={{ color: tierColor, borderColor: tierColor }}>
                    {token.tierLabel}
                  </span>
                </div>
                <div className="solana-scanner-card-stats">
                  <div>
                    <span className="solana-scanner-stat-label">Price</span>
                    <span>{formatUsd(token.priceUsd)}</span>
                  </div>
                  <div>
                    <span className="solana-scanner-stat-label">MCap</span>
                    <span>{formatUsd(token.marketCapUsd)}</span>
                  </div>
                  <div>
                    <span className="solana-scanner-stat-label">24h</span>
                    <span style={{ color: changeColor }}>{formatPct(change)}</span>
                  </div>
                  <div>
                    <span className="solana-scanner-stat-label">Vol</span>
                    <span>{formatUsd(token.volume24h)}</span>
                  </div>
                </div>
                <div className="solana-scanner-card-footer">
                  <span>Holders {formatNum(token.holders)}</span>
                  <span>Buys {formatNum(token.buys)} / Sells {formatNum(token.sells)}</span>
                  {token.riskScore != null && (
                    <span style={{ color: token.riskScore > 50 ? '#ff4d6a' : '#14f195' }}>
                      Risk {token.riskScore}
                    </span>
                  )}
                </div>
                {token.mint && (
                  <div className="solana-scanner-card-mint">
                    {token.mint.slice(0, 6)}...{token.mint.slice(-4)}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {!loading && filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 40 }}>
            No tokens match your filter.
          </p>
        )}
      </section>
    </main>
  )
}
