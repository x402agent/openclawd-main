import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { ArrowLeft, ExternalLink, Shield, Users, Activity, TrendingUp } from 'lucide-react'
import { birdeyeApi, type BirdeyeTokenOverview } from '../lib/birdeyeApi'

const LightweightChart = lazy(() => import('../components/tracker/LightweightChart'))

export const Route = createFileRoute('/chart/$token')({
  head: ({ params }) => ({
    meta: [{ title: `Chart ${params.token.slice(0, 8)}... — SolanaOS Hub` }],
  }),
  component: ChartRoute,
})

// ─── Types ───────────────────────────────────────────────────────────────────

interface TokenDetail {
  token: { name: string; symbol: string; mint: string; image?: string; description?: string }
  pools: Array<{
    poolId: string
    price: { usd: number; quote: number }
    liquidity: { usd: number }
    marketCap: { usd: number }
    market: string
    tokenSupply: number
    lpBurn: number
    security: { freezeAuthority: unknown; mintAuthority: unknown }
    txns?: { buys: number; sells: number; total: number; volume: number; volume24h: number }
  }>
  events: Record<string, { priceChangePercentage: number }>
  risk: {
    top10: number
    dev: { percentage: number; amount: number }
    snipers: { count: number; totalPercentage: number }
    insiders: { count: number; totalPercentage: number }
    bundlers: { count: number; totalPercentage: number }
    rugged: boolean
    score: number
    jupiterVerified: boolean
  }
  buys: number
  sells: number
  txns: number
  holders: number
}

interface Trade {
  signature: string
  wallet: string
  type: 'buy' | 'sell'
  tokenAmount: number
  solAmount: number
  priceUsd: number
  volumeUsd: number
  timestamp: number
  pool?: string
  marketCap?: number
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatUsd(n: number | undefined): string {
  if (!n) return '$0'
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`
  if (n < 0.01 && n > 0) return `$${n.toFixed(8)}`
  return `$${n.toFixed(2)}`
}

function formatPct(n: number | undefined): string {
  if (n === undefined || n === null) return '0%'
  return `${n > 0 ? '+' : ''}${n.toFixed(2)}%`
}

function riskLabel(score: number): { text: string; color: string; bg: string } {
  if (score <= 3) return { text: 'Low Risk', color: '#14f195', bg: 'rgba(20,241,149,0.1)' }
  if (score <= 6) return { text: 'Medium Risk', color: '#facc15', bg: 'rgba(250,204,21,0.1)' }
  return { text: 'High Risk', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
}

// ─── Component ───────────────────────────────────────────────────────────────

function ChartRoute() {
  const { token: tokenAddress } = Route.useParams()
  const [tokenData, setTokenData] = useState<TokenDetail | null>(null)
  const [birdeyeData, setBirdeyeData] = useState<BirdeyeTokenOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [recentTrades, setRecentTrades] = useState<Trade[]>([])
  const chartRef = useRef<{ setWalletMarks: (m: unknown[]) => void; refreshData: () => void } | null>(null)

  // Load token info from both Solana Tracker (risk/holder) and Birdeye (price/overview)
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [tokenRes, birdeyeRes] = await Promise.allSettled([
          fetch(`/api/solana-tracker/token?address=${tokenAddress}`).then(r => r.json()),
          birdeyeApi.getToken(tokenAddress),
        ])
        if (!cancelled) {
          if (tokenRes.status === 'fulfilled') setTokenData(tokenRes.value)
          if (birdeyeRes.status === 'fulfilled') setBirdeyeData(birdeyeRes.value)
        }
      } catch (e) {
        console.error('Token load error:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [tokenAddress])

  const pool = tokenData?.pools?.[0]
  // Prefer Birdeye price data when available (more accurate real-time)
  const price = birdeyeData?.price ?? pool?.price?.usd ?? 0
  const mc = birdeyeData?.marketCap ?? pool?.marketCap?.usd ?? 0
  const liq = birdeyeData?.liquidity ?? pool?.liquidity?.usd ?? 0
  const change24h = birdeyeData?.priceChange24hPercent ?? tokenData?.events?.['24h']?.priceChangePercentage ?? 0
  const risk = tokenData?.risk
  const riskInfo = riskLabel(risk?.score ?? 5)

  const handleTransaction = (tx: Trade) => {
    setRecentTrades(prev => [tx, ...prev].slice(0, 50))
  }

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e5e5e5', fontFamily: "'Manrope', sans-serif" }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <a href="/dex" style={{ color: '#71717a', display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', fontSize: 13 }}>
            <ArrowLeft size={14} /> Back to DEX
          </a>
        </div>

        {loading && !tokenData ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#71717a' }}>Loading token data...</div>
        ) : (
          <>
            {/* Token Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              {tokenData?.token.image && (
                <img src={tokenData.token.image} alt="" style={{ width: 48, height: 48, borderRadius: 12 }} />
              )}
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, color: '#fff' }}>
                  {tokenData?.token.name ?? 'Unknown'}{' '}
                  <span style={{ color: '#71717a', fontWeight: 600, fontSize: 18 }}>
                    {tokenData?.token.symbol}
                  </span>
                </h1>
                <div style={{ fontSize: 13, color: '#71717a', fontFamily: "'IBM Plex Mono', monospace", marginTop: 4 }}>
                  {tokenAddress}
                </div>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
              <MetricCard label="Price" value={formatUsd(price)} />
              <MetricCard label="Market Cap" value={formatUsd(mc)} />
              <MetricCard label="Liquidity" value={formatUsd(liq)} />
              <MetricCard label="24h Change" value={formatPct(change24h)} color={change24h >= 0 ? '#14f195' : '#ef4444'} />
              <MetricCard label="Holders" value={(birdeyeData?.holder ?? tokenData?.holders)?.toLocaleString() ?? '—'} icon={<Users size={14} />} />
              <MetricCard label="Transactions" value={tokenData?.txns?.toLocaleString() ?? '—'} icon={<Activity size={14} />} />
            </div>

            {/* Birdeye Multi-Timeframe Price Changes */}
            {birdeyeData && (
              <div style={{
                background: 'rgba(15,15,35,0.8)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: '14px 20px',
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <TrendingUp size={14} style={{ color: '#ffa500' }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffa500' }}>Birdeye Price Changes</span>
                  {birdeyeData.fdv > 0 && (
                    <span style={{ fontSize: 11, color: '#71717a', marginLeft: 'auto', fontFamily: "'IBM Plex Mono', monospace" }}>
                      FDV: {formatUsd(birdeyeData.fdv)}
                    </span>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 10 }}>
                  {([
                    ['1m', birdeyeData.priceChange1mPercent],
                    ['5m', birdeyeData.priceChange5mPercent],
                    ['1h', birdeyeData.priceChange1hPercent],
                    ['4h', birdeyeData.priceChange4hPercent],
                    ['12h', birdeyeData.priceChange12hPercent],
                    ['24h', birdeyeData.priceChange24hPercent],
                  ] as [string, number][]).map(([label, val]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#71717a', marginBottom: 3 }}>{label}</div>
                      <div style={{
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "'IBM Plex Mono', monospace",
                        color: val > 0 ? '#14f195' : val < 0 ? '#ef4444' : '#9ca3af',
                      }}>
                        {val !== undefined ? formatPct(val) : '—'}
                      </div>
                    </div>
                  ))}
                </div>
                {birdeyeData.uniqueWallet24h > 0 && (
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 10, fontFamily: "'IBM Plex Mono', monospace" }}>
                    Unique wallets (24h): <span style={{ color: '#d1d5db' }}>{birdeyeData.uniqueWallet24h.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Lightweight Chart — Birdeye OHLCV + Solana Tracker with toggle */}
            <div style={{
              background: 'rgba(15,15,35,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
              marginBottom: 24,
              overflow: 'hidden',
              height: 520,
            }}>
              <Suspense fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#71717a' }}>
                  Loading chart...
                </div>
              }>
                <LightweightChart
                  ref={chartRef}
                  tokenAddress={tokenAddress}
                  tokenDetail={tokenData}
                  onTransaction={handleTransaction}
                  theme="dark"
                  dataSource="birdeye"
                />
              </Suspense>
            </div>

            {/* Recent Trades Table */}
            {recentTrades.length > 0 && (
              <div style={{
                background: 'rgba(15,15,35,0.8)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Activity size={16} style={{ color: '#14f195' }} />
                  <span style={{ fontWeight: 700, fontSize: 15 }}>Live Trades</span>
                  <span style={{ fontSize: 12, color: '#71717a', marginLeft: 'auto' }}>
                    {recentTrades.length} recent
                  </span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>
                    <thead>
                      <tr style={{ color: '#71717a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <th style={{ padding: '8px 6px', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right' }}>Price</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right' }}>Volume</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right' }}>Amount</th>
                        <th style={{ padding: '8px 6px', textAlign: 'left' }}>Wallet</th>
                        <th style={{ padding: '8px 6px', textAlign: 'right' }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTrades.slice(0, 15).map((tx, i) => (
                        <tr key={`${tx.signature}-${i}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          <td style={{
                            padding: '6px',
                            color: tx.type === 'buy' ? '#14f195' : '#ef4444',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}>
                            {tx.type}
                          </td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>{formatUsd(tx.priceUsd)}</td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>{formatUsd(tx.volumeUsd)}</td>
                          <td style={{ padding: '6px', textAlign: 'right' }}>{tx.tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                          <td style={{ padding: '6px', color: '#9ca3af' }}>
                            {tx.wallet.slice(0, 4)}...{tx.wallet.slice(-4)}
                          </td>
                          <td style={{ padding: '6px', textAlign: 'right', color: '#9ca3af' }}>
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Risk Assessment */}
            {risk && (
              <div style={{
                background: riskInfo.bg,
                border: `1px solid ${riskInfo.color}33`,
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Shield size={18} style={{ color: riskInfo.color }} />
                  <span style={{ fontWeight: 700, fontSize: 16, color: riskInfo.color }}>{riskInfo.text}</span>
                  <span style={{ fontSize: 13, color: '#9ca3af' }}>Score: {risk.score}/10</span>
                  {risk.rugged && <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>RUGGED</span>}
                  {risk.jupiterVerified && <span style={{ background: '#14f195', color: '#0a0a0f', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>Jupiter Verified</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, fontSize: 13 }}>
                  <div>Top 10 holders: <b>{risk.top10.toFixed(2)}%</b></div>
                  <div>Dev holdings: <b>{risk.dev.percentage.toFixed(4)}%</b></div>
                  <div>Snipers: <b>{risk.snipers.count}</b> ({risk.snipers.totalPercentage.toFixed(2)}%)</div>
                  <div>Insiders: <b>{risk.insiders.count}</b> ({risk.insiders.totalPercentage.toFixed(2)}%)</div>
                  <div>Bundlers: <b>{risk.bundlers.count}</b> ({risk.bundlers.totalPercentage.toFixed(2)}%)</div>
                  <div>Freeze Auth: <b>{pool?.security?.freezeAuthority ? 'Yes' : 'None'}</b></div>
                  <div>Mint Auth: <b>{pool?.security?.mintAuthority ? 'Yes' : 'None'}</b></div>
                  <div>LP Burn: <b>{pool?.lpBurn ?? 0}%</b></div>
                </div>
              </div>
            )}

            {/* External Links */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <ExtLink href={`https://www.solanatracker.io/token/${tokenAddress}`} label="SolanaTracker" />
              <ExtLink href={`https://solscan.io/token/${tokenAddress}`} label="Solscan" />
              <ExtLink href={`https://birdeye.so/token/${tokenAddress}?chain=solana`} label="Birdeye" />
              <ExtLink href={`https://dexscreener.com/solana/${tokenAddress}`} label="DexScreener" />
              <ExtLink href={`https://jup.ag/swap/SOL-${tokenAddress}`} label="Jupiter Swap" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MetricCard({ label, value, color, icon }: { label: string; value: string; color?: string; icon?: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(15,15,35,0.8)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 10,
      padding: '14px 16px',
    }}>
      <div style={{ fontSize: 11, color: '#71717a', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color ?? '#fff', fontFamily: "'IBM Plex Mono', monospace" }}>
        {value}
      </div>
    </div>
  )
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 8,
        color: '#9ca3af',
        fontSize: 13,
        fontWeight: 600,
        textDecoration: 'none',
      }}
    >
      {label} <ExternalLink size={12} />
    </a>
  )
}
