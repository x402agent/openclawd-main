import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { ExternalLink, Search, Trophy, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { trackHubEvent } from '../lib/analytics'
import type { ChesscomGame, ChesscomLeaderboards } from '../lib/chesscomApi'
import { getLiveChessUrl, getNanoHubSiteUrl } from '../lib/site'
import {
  useChesscomDailyPuzzle,
  useChesscomLeaderboards,
  useChesscomPlayerStats,
  useChesscomRecentGames,
} from '../lib/useChesscom'

export const Route = createFileRoute('/chess')({
  head: () => {
    const url = `${getNanoHubSiteUrl()}/chess`
    const title = 'Chess | SolanaOS'
    const description =
      'Play live SolanaOS chess in-browser and browse the wallet-signed on-chain match archive.'
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
  component: ChessRoute,
})

const PIECE_UNICODE: Record<string, string> = {
  K: '\u2654', Q: '\u2655', R: '\u2656', B: '\u2657', N: '\u2658', P: '\u2659',
  k: '\u265A', q: '\u265B', r: '\u265C', b: '\u265D', n: '\u265E', p: '\u265F',
}

function fenToBoard(fen: string): string[][] {
  const rows = fen.split('/').slice(0, 8)
  return rows.map((row) => {
    const cells: string[] = []
    for (const ch of row) {
      if (ch >= '1' && ch <= '8') {
        for (let i = 0; i < parseInt(ch, 10); i += 1) cells.push('')
      } else {
        cells.push(ch)
      }
    }
    while (cells.length < 8) cells.push('')
    return cells
  })
}

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'

type MatchSummary = {
  matchId: string
  whiteWallet: string | null
  blackWallet: string | null
  inviterLabel: string | null
  inviterColor: 'White' | 'Black'
  status: 'Normal' | 'Check' | 'Checkmate' | 'Stalemate'
  moveCount: number
  latestMove: string | null
  createdAt: number
  updatedAt: number
}

type MatchDetail = MatchSummary & {
  moves: {
    ply: number
    move: string
    moveDisplay: string
    signer: string
    signedAt: number
  }[]
}

function MiniBoard({ size = 160 }: { size?: number }) {
  const cellSize = size / 8
  const board = fenToBoard(INITIAL_FEN)
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'grid',
        gridTemplateColumns: `repeat(8, ${cellSize}px)`,
        borderRadius: 8,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {board.map((row, r) =>
        row.map((piece, c) => {
          const isDark = (r + c) % 2 === 1
          return (
            <div
              key={`${r}-${c}`}
              style={{
                width: cellSize,
                height: cellSize,
                background: isDark ? '#2d5016' : '#eeeed2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: cellSize * 0.7,
                lineHeight: 1,
              }}
            >
              {piece ? PIECE_UNICODE[piece] || '' : ''}
            </div>
          )
        }),
      )}
    </div>
  )
}

function statusBadge(status: string) {
  switch (status) {
    case 'Checkmate':
      return { label: 'Checkmate', color: '#ff4d6a' }
    case 'Stalemate':
      return { label: 'Draw', color: '#ffd93d' }
    case 'Check':
      return { label: 'Check', color: '#ff8f3d' }
    default:
      return { label: 'In Progress', color: '#14f195' }
  }
}

function shortWallet(addr: string | null) {
  if (!addr) return '???'
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`
}

function timeAgo(ms: number) {
  const sec = Math.floor((Date.now() - ms) / 1000)
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

// ── Chess.com Live Data Components ───────────────────────────────────

const LEADERBOARD_CATEGORIES: { key: keyof ChesscomLeaderboards; label: string }[] = [
  { key: 'live_blitz', label: 'Blitz' },
  { key: 'live_bullet', label: 'Bullet' },
  { key: 'live_rapid', label: 'Rapid' },
  { key: 'daily', label: 'Daily' },
  { key: 'tactics', label: 'Tactics' },
]

function ChesscomPlayerLookup() {
  const [input, setInput] = useState('')
  const [username, setUsername] = useState<string | null>(null)

  const { data: stats, loading: statsLoading, error: statsError } = useChesscomPlayerStats(username)
  const { data: games, loading: gamesLoading } = useChesscomRecentGames(username, 5)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (trimmed) setUsername(trimmed)
  }

  const ratingCategories = [
    { key: 'chess_blitz' as const, label: 'Blitz', icon: '⚡' },
    { key: 'chess_bullet' as const, label: 'Bullet', icon: '🔫' },
    { key: 'chess_rapid' as const, label: 'Rapid', icon: '⏱' },
    { key: 'chess_daily' as const, label: 'Daily', icon: '📅' },
  ]

  function gameResult(game: ChesscomGame, who: string) {
    const side = game.white.username.toLowerCase() === who.toLowerCase() ? game.white : game.black
    switch (side.result) {
      case 'win': return { text: 'W', color: '#14f195' }
      case 'checkmated': case 'timeout': case 'resigned': case 'abandoned':
        return { text: 'L', color: '#ff4d6a' }
      default: return { text: 'D', color: '#ffd93d' }
    }
  }

  return (
    <div className="chesscom-player-lookup">
      <form onSubmit={handleSearch} className="chesscom-search-form">
        <Search className="chesscom-search-icon" size={16} />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Chess.com username..."
          className="chesscom-search-input"
        />
        <button type="submit" className="btn btn-small">Look up</button>
      </form>

      {statsError && (
        <p className="chesscom-error">Player not found or API error: {statsError}</p>
      )}

      {statsLoading && username && (
        <p className="chesscom-loading">Loading stats for {username}...</p>
      )}

      {stats && username && (
        <div className="chesscom-stats-grid">
          {ratingCategories.map(({ key, label, icon }) => {
            const cat = stats[key]
            if (!cat) return null
            return (
              <div key={key} className="chesscom-stat-card">
                <div className="chesscom-stat-header">
                  <span>{icon} {label}</span>
                </div>
                <div className="chesscom-stat-rating">{cat.last.rating}</div>
                <div className="chesscom-stat-meta">
                  <span className="chesscom-stat-best">Best: {cat.best.rating}</span>
                  <span className="chesscom-stat-record">
                    <span style={{ color: '#14f195' }}>{cat.record.win}W</span>
                    {' / '}
                    <span style={{ color: '#ff4d6a' }}>{cat.record.loss}L</span>
                    {' / '}
                    <span style={{ color: '#ffd93d' }}>{cat.record.draw}D</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {!gamesLoading && games && games.length > 0 && username && (
        <div className="chesscom-recent-games">
          <h4>Recent Games</h4>
          <div className="chesscom-games-list">
            {games.map((game) => {
              const result = gameResult(game, username)
              const isWhite = game.white.username.toLowerCase() === username.toLowerCase()
              const opponent = isWhite ? game.black : game.white
              return (
                <a
                  key={game.uuid}
                  href={game.url}
                  target="_blank"
                  rel="noreferrer"
                  className="chesscom-game-row"
                >
                  <span
                    className="chesscom-game-result"
                    style={{ color: result.color, borderColor: result.color }}
                  >
                    {result.text}
                  </span>
                  <span className="chesscom-game-opponent">
                    vs {opponent.username} ({opponent.rating})
                  </span>
                  <span className="chesscom-game-time-class">{game.time_class}</span>
                  <span className="chesscom-game-date">
                    {new Date(game.end_time * 1000).toLocaleDateString()}
                  </span>
                </a>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function ChesscomLeaderboardSection() {
  const [category, setCategory] = useState<keyof ChesscomLeaderboards>('live_blitz')
  const { data: leaders, loading, error } = useChesscomLeaderboards(category, 20)

  return (
    <div className="chesscom-leaderboard">
      <div className="chesscom-leaderboard-tabs">
        {LEADERBOARD_CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`chesscom-tab${category === key ? ' is-active' : ''}`}
            onClick={() => setCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <p className="chesscom-loading">Loading leaderboard...</p>}
      {error && <p className="chesscom-error">{error}</p>}

      {leaders && (
        <div className="chesscom-leaders-list">
          {leaders.map((entry, i) => (
            <a
              key={entry.player_id}
              href={entry.url}
              target="_blank"
              rel="noreferrer"
              className="chesscom-leader-row"
            >
              <span className="chesscom-leader-rank">#{i + 1}</span>
              {entry.avatar && (
                <img
                  src={entry.avatar}
                  alt=""
                  className="chesscom-leader-avatar"
                />
              )}
              <span className="chesscom-leader-name">
                {entry.title && (
                  <span className="chesscom-leader-title">{entry.title}</span>
                )}
                {entry.username}
              </span>
              <span className="chesscom-leader-score">{entry.score}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function ChesscomDailyPuzzleCard() {
  const { data: puzzle, loading } = useChesscomDailyPuzzle()

  if (loading || !puzzle) {
    return (
      <div className="chesscom-puzzle-card">
        <p className="chesscom-loading">Loading daily puzzle...</p>
      </div>
    )
  }

  return (
    <a
      href={puzzle.url}
      target="_blank"
      rel="noreferrer"
      className="chesscom-puzzle-card"
    >
      <img src={puzzle.image} alt={puzzle.title} className="chesscom-puzzle-img" />
      <div className="chesscom-puzzle-info">
        <h4>{puzzle.title}</h4>
        <p>Daily Puzzle &middot; {new Date(puzzle.publish_time * 1000).toLocaleDateString()}</p>
      </div>
    </a>
  )
}

// ── Main Route ───────────────────────────────────────────────────────

function ChessRoute() {
  const matches = useQuery(api.nanosolanaChess.listRecentMatches, { limit: 30 })
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)
  const [liveFrameLoaded, setLiveFrameLoaded] = useState(false)
  const selectedMatch = useQuery(
    api.nanosolanaChess.getMatchPublic,
    selectedMatchId ? { matchId: selectedMatchId } : 'skip',
  )

  const liveChessUrl = useMemo(() => getLiveChessUrl(), [])

  useEffect(() => {
    trackHubEvent('chess_route_view', { surface: 'chess', liveChessUrl })
  }, [liveChessUrl])

  const totalMatches = matches?.length ?? 0
  const totalCheckmates = matches?.filter((m) => m.status === 'Checkmate').length ?? 0
  const totalActive = matches?.filter((m) => m.status === 'Normal' || m.status === 'Check').length ?? 0

  return (
    <main className="solana-chess-page">
      <section className="hero solana-chess-hero">
        <div className="hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">Arcade / Chess</span>
            <h1 className="hero-title">
              SolanaOS Chess.
              <br />
              <span className="solana-legal-hero-accent">Play live. Archive signed matches.</span>
            </h1>
            <p className="hero-subtitle">
              The live Phoenix board is hosted inside SolanaOS Hub, while the public archive below
              keeps the Seeker wallet-signed match feed searchable from `solanaos.net/chess`.
            </p>
            <div className="solana-legal-meta-strip">
              <div className="solana-legal-meta-chip">
                <span>Total Games</span>
                <strong>{totalMatches}</strong>
              </div>
              <div className="solana-legal-meta-chip">
                <span>Checkmates</span>
                <strong>{totalCheckmates}</strong>
              </div>
              <div className="solana-legal-meta-chip">
                <span>Active</span>
                <strong>{totalActive}</strong>
              </div>
            </div>
            <div className="solana-chess-hero-actions">
              <a className="btn btn-primary" href={liveChessUrl} target="_blank" rel="noreferrer">
                Open Live Chess
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
              <a className="btn" href="#chess-archive">
                Jump to Archive
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="solana-chess-live-shell">
          <div className="solana-chess-live-header">
            <div>
              <p className="section-kicker">Hosted in SolanaOS</p>
              <h2>Live play</h2>
              <p>
                This is the SolanaOS-branded Phoenix app embedded directly in the Hub surface.
              </p>
            </div>
            <a href={liveChessUrl} target="_blank" rel="noreferrer" className="btn">
              Pop out
            </a>
          </div>
          <div className="solana-chess-live-frame-wrap">
            {!liveFrameLoaded ? (
              <div className="solana-chess-live-loading">
                <MiniBoard size={132} />
                <p>Loading the live chess service from {new URL(liveChessUrl).host}…</p>
              </div>
            ) : null}
            <iframe
              title="SolanaOS Live Chess"
              src={liveChessUrl}
              className="solana-chess-live-frame"
              allow="clipboard-write"
              onLoad={() => setLiveFrameLoaded(true)}
            />
          </div>
        </div>
      </section>

      <section className="section" id="chesscom-live">
        <div className="solana-chess-section-heading">
          <div>
            <p className="section-kicker">
              <Zap className="h-4 w-4 inline-block" /> Chess.com Live Data
            </p>
            <h2>Player lookup &amp; leaderboards</h2>
          </div>
          <p>
            Search any Chess.com player to see ratings and recent games, browse the global
            leaderboards, or try today's daily puzzle.
          </p>
        </div>

        <div className="chesscom-live-grid">
          <div className="chesscom-live-main">
            <ChesscomPlayerLookup />
            <div className="chesscom-section-divider" />
            <div className="chesscom-leaderboard-wrap">
              <h3>
                <Trophy className="h-4 w-4 inline-block" /> Global Leaderboards
              </h3>
              <ChesscomLeaderboardSection />
            </div>
          </div>
          <div className="chesscom-live-sidebar">
            <h3>Daily Puzzle</h3>
            <ChesscomDailyPuzzleCard />
          </div>
        </div>
      </section>

      <section className="section" id="chess-archive">
        <div className="solana-chess-section-heading">
          <div>
            <p className="section-kicker">Public archive</p>
            <h2>Wallet-signed match feed</h2>
          </div>
          <p>
            Matches from Seeker continue to flow into Convex here, separate from the live embedded
            board above.
          </p>
        </div>

        <div className="solana-chess-layout">
          <div className="solana-chess-list">
            {!matches && (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>
                Loading matches...
              </p>
            )}
            {matches?.length === 0 && (
              <div className="solana-chess-empty">
                <MiniBoard size={120} />
                <p>No matches yet. Play a game on your Seeker to see it here.</p>
              </div>
            )}
            {matches?.map((match: MatchSummary) => {
              const badge = statusBadge(match.status)
              const isSelected = selectedMatchId === match.matchId
              return (
                <button
                  key={match.matchId}
                  type="button"
                  className={`solana-chess-match-card${isSelected ? ' is-selected' : ''}`}
                  onClick={() => setSelectedMatchId(match.matchId)}
                >
                  <div className="solana-chess-match-header">
                    <span className="solana-chess-match-players">
                      <span style={{ color: '#fff' }}>{shortWallet(match.whiteWallet)}</span>
                      {' vs '}
                      <span style={{ color: 'rgba(255,255,255,0.6)' }}>{shortWallet(match.blackWallet)}</span>
                    </span>
                    <span
                      className="solana-chess-match-badge"
                      style={{ color: badge.color, borderColor: badge.color }}
                    >
                      {badge.label}
                    </span>
                  </div>
                  <div className="solana-chess-match-meta">
                    <span>{match.moveCount} moves</span>
                    {match.latestMove && <span>Last: {match.latestMove}</span>}
                    <span>{timeAgo(match.updatedAt)}</span>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="solana-chess-detail">
            {!selectedMatchId && (
              <div className="solana-chess-detail-empty">
                <MiniBoard size={200} />
                <p>Select a match to view moves</p>
              </div>
            )}
            {selectedMatchId && !selectedMatch && (
              <p style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: 40 }}>
                Loading match...
              </p>
            )}
            {selectedMatch && (
              <div className="solana-chess-detail-content">
                <div className="solana-chess-detail-header">
                  <div>
                    <h2
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.1rem',
                        color: '#fff',
                        margin: 0,
                      }}
                    >
                      {shortWallet((selectedMatch as MatchDetail).whiteWallet)} vs{' '}
                      {shortWallet((selectedMatch as MatchDetail).blackWallet)}
                    </h2>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                      Match {(selectedMatch as MatchDetail).matchId.slice(0, 8)}...
                    </span>
                  </div>
                  <span
                    className="solana-chess-match-badge"
                    style={{
                      color: statusBadge((selectedMatch as MatchDetail).status).color,
                      borderColor: statusBadge((selectedMatch as MatchDetail).status).color,
                    }}
                  >
                    {statusBadge((selectedMatch as MatchDetail).status).label}
                  </span>
                </div>

                <div className="solana-chess-board-area">
                  <MiniBoard size={240} />
                </div>

                <div className="solana-chess-moves-list">
                  <div className="solana-chess-moves-header">
                    <span>Move Log ({(selectedMatch as MatchDetail).moves.length} moves)</span>
                  </div>
                  {(selectedMatch as MatchDetail).moves.length === 0 && (
                    <p
                      style={{
                        color: 'rgba(255,255,255,0.3)',
                        fontSize: '0.82rem',
                        padding: '12px 0',
                      }}
                    >
                      No moves recorded yet.
                    </p>
                  )}
                  <div className="solana-chess-moves-grid">
                    {(selectedMatch as MatchDetail).moves.map((move, i) => (
                      <div key={i} className="solana-chess-move-row">
                        <span className="solana-chess-move-ply">
                          {Math.floor(move.ply / 2) + 1}
                          {move.ply % 2 === 0 ? '.' : '...'}
                        </span>
                        <span className="solana-chess-move-san">{move.moveDisplay || move.move}</span>
                        <span className="solana-chess-move-signer">{shortWallet(move.signer)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
