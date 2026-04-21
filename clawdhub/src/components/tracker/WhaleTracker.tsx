/**
 * WhaleTracker — Real-time whale trades (≥1 SOL) from pump.fun WebSocket feeds.
 */
import { useState } from 'react'
import { useWhaleStream, type WhaleEntry } from './hooks/useWhaleStream'

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

function fmtTokens(raw: number): string {
  if (raw <= 0) return '—'
  if (raw >= 1e12) return (raw / 1e12).toFixed(1) + 'T'
  if (raw >= 1e9) return (raw / 1e9).toFixed(1) + 'B'
  if (raw >= 1e6) return (raw / 1e6).toFixed(1) + 'M'
  if (raw >= 1e3) return (raw / 1e3).toFixed(1) + 'K'
  return raw.toString()
}

function formatTime(ts: string): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

type WhaleFilter = 'all' | 'buy' | 'sell'

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

function WhaleRow({ whale, onSelect }: { whale: WhaleEntry; onSelect?: (mint: string) => void }) {
  const isBuy = whale.direction === 'buy'
  const name = whale.tokenName
    ? `${whale.tokenName}${whale.tokenSymbol ? ' $' + whale.tokenSymbol : ''}`
    : shortAddr(whale.mint)

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <span className="text-lg shrink-0">{isBuy ? '🟢' : '🔴'}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
            {isBuy ? 'BUY' : 'SELL'}
          </span>
          <span className="text-orange-400 text-sm font-semibold">{fmtSol(whale.solAmount)} SOL</span>
          <span className="text-[11px] text-gray-500 ml-auto">{formatTime(whale.timestamp)}</span>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs">
          <button
            className="text-yellow-400 hover:underline font-medium truncate"
            onClick={() => onSelect?.(whale.mint)}
          >
            {name}
          </button>
          {whale.tokenAmount > 0 && <span className="text-gray-500">{fmtTokens(whale.tokenAmount)} tokens</span>}
          {whale.trader && (
            <a
              href={`https://solscan.io/account/${whale.trader}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {shortAddr(whale.trader)}
            </a>
          )}
          <a
            href={`https://solscan.io/tx/${whale.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline ml-auto"
          >
            tx
          </a>
        </div>
      </div>
    </div>
  )
}

export function WhaleTracker({ onSelectToken }: { onSelectToken?: (mint: string) => void }) {
  const { whales, status, stats } = useWhaleStream()
  const [filter, setFilter] = useState<WhaleFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = whales.filter(w => {
    if (filter !== 'all' && w.direction !== filter) return false
    if (search) {
      const s = search.toLowerCase()
      if (!w.mint.toLowerCase().includes(s) && !w.tokenName?.toLowerCase().includes(s) && !w.tokenSymbol?.toLowerCase().includes(s)) return false
    }
    return true
  })

  const buyPct = stats.buys + stats.sells > 0 ? Math.round((stats.buys / (stats.buys + stats.sells)) * 100) : 50

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatusDot status={status} />
        <div className="w-px h-4 bg-white/10" />
        {(['all', 'buy', 'sell'] as WhaleFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/10'
            }`}
          >
            {f === 'all' ? 'All' : f === 'buy' ? '🟢 Buys' : '🔴 Sells'}
          </button>
        ))}
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Filter by token…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 w-40"
        />
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { emoji: '🐋', value: stats.total, label: 'Whales' },
          { emoji: '🟢', value: stats.buys, label: 'Buys', color: 'text-green-400' },
          { emoji: '🔴', value: stats.sells, label: 'Sells', color: 'text-red-400' },
          { emoji: '💎', value: fmtSol(stats.volumeSol), label: 'Vol SOL', color: 'text-cyan-400' },
          { emoji: '🏆', value: fmtSol(stats.biggestTrade), label: 'Biggest', color: 'text-orange-400' },
          { emoji: '⚡', value: `${stats.rate}/s`, label: 'Rate', color: 'text-yellow-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0f0f23]/80 rounded-lg border border-white/5 p-2 text-center">
            <span className="text-base">{s.emoji}</span>
            <p className={`text-sm font-bold mt-0.5 ${s.color || 'text-white'}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Buy/Sell ratio */}
      <div>
        <div className="flex h-1.5 rounded-full overflow-hidden">
          <div className="bg-green-400 transition-all duration-500" style={{ width: `${buyPct}%` }} />
          <div className="bg-red-400 transition-all duration-500" style={{ width: `${100 - buyPct}%` }} />
        </div>
        <div className="flex justify-between text-[10px] text-gray-500 mt-1">
          <span>Buy {buyPct}%</span>
          <span>Sell {100 - buyPct}%</span>
        </div>
      </div>

      {/* Feed */}
      <div className="bg-[#0f0f23]/80 rounded-xl border border-white/5 overflow-hidden max-h-[60vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🐋</p>
            <p className="text-gray-500 text-sm">Waiting for whale trades…</p>
            <p className="text-gray-600 text-xs mt-1">Trades ≥1 SOL appear here in real-time</p>
          </div>
        ) : (
          filtered.map(w => <WhaleRow key={w.id} whale={w} onSelect={onSelectToken} />)
        )}
      </div>
    </div>
  )
}

export default WhaleTracker
