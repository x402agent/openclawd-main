import { useCallback, useEffect, useRef, useState } from 'react'
import {
  chesscomApi,
  type ChesscomGame,
  type ChesscomLeaderboardEntry,
  type ChesscomPlayer,
  type ChesscomPlayerStats,
  type ChesscomDailyPuzzle,
} from './chesscomApi'

// Generic fetch hook with auto-refresh
function useChesscomData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  refreshMs?: number,
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      if (mountedRef.current) setData(result)
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      if (mountedRef.current) setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    mountedRef.current = true
    load()
    let interval: ReturnType<typeof setInterval> | undefined
    if (refreshMs && refreshMs > 0) {
      interval = setInterval(load, refreshMs)
    }
    return () => {
      mountedRef.current = false
      if (interval) clearInterval(interval)
    }
  }, [load, refreshMs])

  return { data, loading, error, refetch: load }
}

// ── Public hooks ─────────────────────────────────────────────────────

export function useChesscomPlayer(username: string | null) {
  return useChesscomData<ChesscomPlayer>(
    () => chesscomApi.getPlayer(username!),
    [username],
  )
}

export function useChesscomPlayerStats(username: string | null) {
  return useChesscomData<ChesscomPlayerStats>(
    () => chesscomApi.getPlayerStats(username!),
    [username],
  )
}

export function useChesscomRecentGames(username: string | null, count = 10) {
  return useChesscomData<ChesscomGame[]>(
    () => chesscomApi.getRecentGames(username!, count),
    [username, count],
  )
}

export function useChesscomLeaderboards(
  category: keyof Awaited<ReturnType<typeof chesscomApi.getLeaderboards>> = 'live_blitz',
  limit = 20,
) {
  return useChesscomData<ChesscomLeaderboardEntry[]>(
    async () => {
      const boards = await chesscomApi.getLeaderboards()
      return (boards[category] ?? []).slice(0, limit)
    },
    [category, limit],
  )
}

export function useChesscomDailyPuzzle() {
  return useChesscomData<ChesscomDailyPuzzle>(
    () => chesscomApi.getDailyPuzzle(),
    [],
  )
}
