/**
 * CTOTracker — Real-time CTO (Creator Transfer Ownership) and fee distribution events.
 */
import { useState } from 'react'
import { useCTOStream, type CTOFeedEntry } from './hooks/useCTOStream'

type FilterKey = 'all' | 'cto' | 'distribution'

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

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'cto', label: '👑 CTO' },
  { key: 'distribution', label: '💎 Distributions' },
]

function CTORow({ entry, onSelect }: { entry: CTOFeedEntry & { kind: 'cto' }; onSelect?: (mint: string) => void }) {
  const name = entry.tokenName
    ? `${entry.tokenName}${entry.tokenSymbol ? ' $' + entry.tokenSymbol : ''}`
    : shortAddr(entry.mint)

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <span className="text-lg shrink-0 mt-0.5">👑</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase text-pink-400">Creator Transfer</span>
          <span className="bg-pink-500/20 text-pink-400 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">CTO</span>
          <span className="text-[11px] text-gray-500 ml-auto">{formatTime(entry.timestamp)}</span>
        </div>
        <button className="text-sm text-yellow-400 hover:underline font-medium" onClick={() => onSelect?.(entry.mint)}>
          {name}
        </button>
        <div className="mt-1.5 text-xs space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">From:</span>
            <a href={`https://solscan.io/account/${entry.oldCreator}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {shortAddr(entry.oldCreator)}
            </a>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-gray-500">To:</span>
            <a href={`https://solscan.io/account/${entry.newCreator}`} target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline font-medium">
              {shortAddr(entry.newCreator)}
            </a>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <a href={`https://pump.fun/coin/${entry.mint}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs rounded bg-white/5 text-blue-400 border border-white/10 hover:bg-white/10 transition-colors">View Token</a>
          <a href={`https://solscan.io/tx/${entry.signature}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs rounded bg-white/5 text-blue-400 border border-white/10 hover:bg-white/10 transition-colors">View TX</a>
        </div>
      </div>
    </div>
  )
}

function DistributionRow({ entry, onSelect }: { entry: CTOFeedEntry & { kind: 'distribution' }; onSelect?: (mint: string) => void }) {
  const name = entry.tokenName
    ? `${entry.tokenName}${entry.tokenSymbol ? ' $' + entry.tokenSymbol : ''}`
    : shortAddr(entry.mint)

  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <span className="text-lg shrink-0 mt-0.5">💎</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase text-cyan-400">Fee Distribution</span>
          <span className="text-cyan-400 text-sm font-semibold">{fmtSol(entry.totalSol)} SOL</span>
          <span className="text-[11px] text-gray-500 ml-auto">{formatTime(entry.timestamp)}</span>
        </div>
        <button className="text-sm text-yellow-400 hover:underline font-medium" onClick={() => onSelect?.(entry.mint)}>
          {name}
        </button>
        {entry.shareholders.length > 0 && (
          <div className="mt-1.5 text-xs space-y-0.5">
            {entry.shareholders.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <a href={`https://solscan.io/account/${s.address}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                  {shortAddr(s.address)}
                </a>
                <span className="text-green-400 font-medium">{fmtSol(s.amountSol)} SOL</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <a href={`https://pump.fun/coin/${entry.mint}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs rounded bg-white/5 text-blue-400 border border-white/10 hover:bg-white/10 transition-colors">View Token</a>
          <a href={`https://solscan.io/tx/${entry.signature}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 text-xs rounded bg-white/5 text-blue-400 border border-white/10 hover:bg-white/10 transition-colors">View TX</a>
        </div>
      </div>
    </div>
  )
}

export function CTOTracker({ onSelectToken }: { onSelectToken?: (mint: string) => void }) {
  const { entries, status, stats, isDemo } = useCTOStream()
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  const filtered = entries.filter(e => {
    if (filter !== 'all' && e.kind !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      const matchMint = e.mint.toLowerCase().includes(s)
      const matchName = e.tokenName?.toLowerCase().includes(s)
      const matchSymbol = e.tokenSymbol?.toLowerCase().includes(s)
      let matchWallet = false
      if (e.kind === 'cto') matchWallet = e.oldCreator.toLowerCase().includes(s) || e.newCreator.toLowerCase().includes(s)
      else matchWallet = e.shareholders.some(sh => sh.address.toLowerCase().includes(s))
      if (!matchMint && !matchName && !matchSymbol && !matchWallet) return false
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
          placeholder="Filter by token, mint, wallet…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 w-48"
        />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          { emoji: '👑', value: stats.totalCTO, label: 'CTO Events', color: 'text-pink-400' },
          { emoji: '💎', value: stats.totalDistributions, label: 'Distributions', color: 'text-cyan-400' },
          { emoji: '💰', value: fmtSol(stats.totalDistributedSol), label: 'SOL Distributed', color: 'text-green-400' },
          { emoji: '⚡', value: `${stats.rate}/s`, label: 'Rate' },
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
            <p className="text-3xl mb-2">👑💎</p>
            <p className="text-gray-500 text-sm">Waiting for CTO & distribution events…</p>
            <p className="text-gray-600 text-xs mt-1">Creator transfers and fee payouts appear here in real-time</p>
          </div>
        ) : (
          filtered.map(e =>
            e.kind === 'cto'
              ? <CTORow key={e.id} entry={e} onSelect={onSelectToken} />
              : <DistributionRow key={e.id} entry={e} onSelect={onSelectToken} />
          )
        )}
      </div>
    </div>
  )
}

export default CTOTracker
