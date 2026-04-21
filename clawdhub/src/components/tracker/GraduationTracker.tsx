/**
 * GraduationTracker — Real-time token graduations (migration to PumpSwap AMM).
 */
import { useState } from 'react'
import { useGraduationStream, type GraduationEntry } from './hooks/useGraduationStream'

function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr || ''
  return addr.slice(0, 4) + '…' + addr.slice(-4)
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

function GradRow({ grad, onSelect }: { grad: GraduationEntry; onSelect?: (mint: string) => void }) {
  const name = grad.tokenName || 'Unknown'
  return (
    <div className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
      <span className="text-lg shrink-0 mt-0.5">🎓</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase text-purple-400">Graduated</span>
          <span className="text-[11px] text-gray-500 ml-auto">{formatTime(grad.timestamp)}</span>
        </div>
        <p className="text-sm text-white">
          <button className="text-yellow-400 hover:underline font-medium" onClick={() => onSelect?.(grad.mint)}>
            {name}
          </button>
          {grad.tokenSymbol && <span className="text-cyan-400 ml-1">${grad.tokenSymbol}</span>}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">Migrated to PumpSwap AMM</p>
        <div className="flex items-center gap-3 mt-1.5 text-xs flex-wrap">
          <span>
            <span className="text-gray-500">Mint: </span>
            <a href={`https://pump.fun/coin/${grad.mint}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              {shortAddr(grad.mint)}
            </a>
          </span>
          {grad.pool && (
            <span>
              <span className="text-gray-500">Pool: </span>
              <a href={`https://solscan.io/account/${grad.pool}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {shortAddr(grad.pool)}
              </a>
            </span>
          )}
          {grad.creator && (
            <span>
              <span className="text-gray-500">Creator: </span>
              <a href={`https://solscan.io/account/${grad.creator}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {shortAddr(grad.creator)}
              </a>
            </span>
          )}
        </div>
        <div className="flex gap-2 mt-2">
          <a
            href={`https://pump.fun/coin/${grad.mint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-xs rounded bg-purple-500/20 text-purple-400 border border-purple-500/20 hover:bg-purple-500/30 transition-colors"
          >
            Trade on PumpSwap
          </a>
          <a
            href={`https://solscan.io/tx/${grad.signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 text-xs rounded bg-white/5 text-blue-400 border border-white/10 hover:bg-white/10 transition-colors"
          >
            Explorer
          </a>
        </div>
      </div>
    </div>
  )
}

export function GraduationTracker({ onSelectToken }: { onSelectToken?: (mint: string) => void }) {
  const { graduations, status, stats } = useGraduationStream()
  const [search, setSearch] = useState('')

  const filtered = search
    ? graduations.filter(g =>
        (g.tokenName || '').toLowerCase().includes(search.toLowerCase()) ||
        (g.tokenSymbol || '').toLowerCase().includes(search.toLowerCase()) ||
        g.mint.toLowerCase().includes(search.toLowerCase())
      )
    : graduations

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <StatusDot status={status} />
        <div className="w-px h-4 bg-white/10" />
        <span className="bg-white/5 text-gray-400 text-xs px-2.5 py-1 rounded-full">🎓 {stats.total}</span>
        <span className="bg-white/5 text-gray-400 text-xs px-2.5 py-1 rounded-full">⚡ {stats.rate}/s</span>
        <div className="flex-1" />
        <input
          type="text"
          placeholder="Filter by name, symbol, or mint…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 w-48"
        />
      </div>

      {/* Feed */}
      <div className="bg-[#0f0f23]/80 rounded-xl border border-white/5 overflow-hidden max-h-[65vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🎓</p>
            <p className="text-gray-500 text-sm">Waiting for token graduations…</p>
            <p className="text-gray-600 text-xs mt-1">Tokens migrating to PumpSwap AMM appear here</p>
          </div>
        ) : (
          filtered.map(g => <GradRow key={g.id} grad={g} onSelect={onSelectToken} />)
        )}
      </div>
    </div>
  )
}

export default GraduationTracker
