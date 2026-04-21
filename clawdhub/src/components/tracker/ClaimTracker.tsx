/**
 * ClaimTracker — Real-time fee claim events (creator fees, cashback, social fees).
 */
import { useState } from 'react'
import { useClaimStream, type ClaimType, type ClaimEntry } from './hooks/useClaimStream'

function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr || ''
  return addr.slice(0, 4) + '…' + addr.slice(-4)
}

function fmtSol(sol: number): string {
  if (sol <= 0) return '—'
  if (sol >= 1000) return sol.toFixed(0)
  if (sol >= 1) return sol.toFixed(2)
  return sol.toFixed(4)
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function StatusDot({ status }: { status: string }) {
  const color = status === 'connected' ? 'bg-green-400' : status === 'connecting' ? 'bg-yellow-400 animate-pulse' : 'bg-red-400'
  const label = status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting…' : 'Disconnected'
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  )
}

const CLAIM_CONFIG: Record<ClaimType, { emoji: string; label: string; color: string; bg: string }> = {
  creator_fee: { emoji: '💰', label: 'Creator Fee', color: 'text-green-400', bg: 'bg-green-500/10' },
  cashback: { emoji: '🎁', label: 'Cashback', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  social_fee: { emoji: '🤝', label: 'Social Fee', color: 'text-purple-400', bg: 'bg-purple-500/10' },
}

const FILTERS: { key: ClaimType | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'creator_fee', label: '💰 Creator Fees' },
  { key: 'cashback', label: '🎁 Cashback' },
  { key: 'social_fee', label: '🤝 Social Fees' },
]

function ClaimRow({ claim, onSelect }: { claim: ClaimEntry; onSelect?: (mint: string) => void }) {
  const cfg = CLAIM_CONFIG[claim.claimType]
  const name = claim.tokenName
    ? `${claim.tokenName}${claim.tokenSymbol ? ' $' + claim.tokenSymbol : ''}`
    : shortAddr(claim.mint)

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <span className="text-lg shrink-0 mt-0.5">💰</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${cfg.color} ${cfg.bg}`}>
            {cfg.emoji} {cfg.label}
          </span>
          <span className="text-[11px] text-gray-500 ml-auto">{formatTime(claim.timestamp)}</span>
        </div>
        <p className="text-base font-bold text-green-400">+{fmtSol(claim.amountSol)} SOL</p>
        <p className="text-sm text-white mt-0.5">
          <button className="text-yellow-400 hover:underline font-medium" onClick={() => onSelect?.(claim.mint)}>
            {name}
          </button>
        </p>
        <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap">
          {claim.claimerWallet && (
            <span>
              <span className="text-gray-500">Claimer: </span>
              <a href={`https://solscan.io/account/${claim.claimerWallet}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {shortAddr(claim.claimerWallet)}
              </a>
            </span>
          )}
          <a
            href={`https://solscan.io/tx/${claim.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-0.5 text-xs rounded bg-white/5 text-blue-400 border border-white/10 hover:bg-white/10 transition-colors ml-auto"
          >
            View TX
          </a>
        </div>
      </div>
    </div>
  )
}

export function ClaimTracker({ onSelectToken }: { onSelectToken?: (mint: string) => void }) {
  const { claims, status, stats, isDemo } = useClaimStream()
  const [filter, setFilter] = useState<ClaimType | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = claims.filter(c => {
    if (filter !== 'all' && c.claimType !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      if (!c.mint.toLowerCase().includes(s) && !c.tokenName?.toLowerCase().includes(s) && !c.tokenSymbol?.toLowerCase().includes(s) && !c.claimerWallet.toLowerCase().includes(s)) return false
    }
    return true
  })

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <StatusDot status={status} />
        {isDemo && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] px-2 py-0.5 rounded-full font-medium">DEMO</span>}
        <div className="w-px h-4 bg-white/10" />
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Filter by wallet/token…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 w-44"
        />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { emoji: '📊', value: stats.total, label: 'Claims' },
          { emoji: '💎', value: fmtSol(stats.totalSol), label: 'SOL Claimed', color: 'text-green-400' },
          { emoji: '💰', value: stats.creatorFees, label: 'Creator', color: 'text-green-400' },
          { emoji: '🎁', value: stats.cashback, label: 'Cashback', color: 'text-yellow-400' },
          { emoji: '🤝', value: stats.socialFees, label: 'Social', color: 'text-purple-400' },
          { emoji: '⚡', value: `${stats.rate}/s`, label: 'Rate', color: 'text-cyan-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f0f23]/80 rounded-lg border border-white/5 p-2 text-center">
            <span className="text-base">{s.emoji}</span>
            <p className={`text-sm font-bold mt-0.5 ${s.color || 'text-white'}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feed */}
      <div className="bg-[#0f0f23]/80 rounded-xl border border-white/5 overflow-hidden max-h-[55vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">💰</p>
            <p className="text-gray-500 text-sm">Waiting for fee claims…</p>
            <p className="text-gray-600 text-xs mt-1">Creator fee, cashback & social fee claims appear here</p>
          </div>
        ) : (
          filtered.map(c => <ClaimRow key={c.id} claim={c} onSelect={onSelectToken} />)
        )}
      </div>
    </div>
  )
}

export default ClaimTracker
