// Chess.com Public Data API client
// Docs: https://www.chess.com/news/view/published-data-api
// No API key required — rate-limit friendly (avoid parallel requests)

const BASE = 'https://api.chess.com/pub'

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error(`Chess.com API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// ── Types ────────────────────────────────────────────────────────────

export interface ChesscomPlayer {
  player_id: number
  '@id': string
  url: string
  username: string
  title?: string
  status: string
  name?: string
  avatar?: string
  location?: string
  country: string
  joined: number
  last_online: number
  followers: number
  is_streamer: boolean
  fide?: number
}

export interface ChesscomRating {
  last: { rating: number; date: number; rd: number }
  best: { rating: number; date: number; game: string }
  record: { win: number; loss: number; draw: number }
}

export interface ChesscomPlayerStats {
  chess_daily?: ChesscomRating
  chess_rapid?: ChesscomRating
  chess_bullet?: ChesscomRating
  chess_blitz?: ChesscomRating
  tactics?: { highest: { rating: number; date: number } }
  puzzle_rush?: { best: { score: number } }
}

export interface ChesscomGame {
  url: string
  pgn?: string
  time_control: string
  end_time: number
  rated: boolean
  accuracies?: { white: number; black: number }
  tcn?: string
  uuid: string
  initial_setup?: string
  fen?: string
  time_class: string
  rules: string
  white: {
    rating: number
    result: string
    '@id': string
    username: string
    uuid: string
  }
  black: {
    rating: number
    result: string
    '@id': string
    username: string
    uuid: string
  }
}

export interface ChesscomArchiveGames {
  games: ChesscomGame[]
}

export interface ChesscomArchiveList {
  archives: string[]
}

export interface ChesscomLeaderboardEntry {
  player_id: number
  '@id': string
  url: string
  username: string
  score: number
  rank: number
  country?: string
  title?: string
  name?: string
  status: string
  avatar?: string
  trend_score?: { direction: number; delta: number }
  trend_rank?: { direction: number; delta: number }
  flair_code?: string
  win_count?: number
  loss_count?: number
  draw_count?: number
}

export interface ChesscomLeaderboards {
  daily: ChesscomLeaderboardEntry[]
  daily960: ChesscomLeaderboardEntry[]
  live_rapid: ChesscomLeaderboardEntry[]
  live_blitz: ChesscomLeaderboardEntry[]
  live_bullet: ChesscomLeaderboardEntry[]
  live_bughouse: ChesscomLeaderboardEntry[]
  live_blitz960: ChesscomLeaderboardEntry[]
  live_threecheck: ChesscomLeaderboardEntry[]
  live_crazyhouse: ChesscomLeaderboardEntry[]
  live_kingofthehill: ChesscomLeaderboardEntry[]
  tactics: ChesscomLeaderboardEntry[]
  rush: ChesscomLeaderboardEntry[]
  battle: ChesscomLeaderboardEntry[]
}

export interface ChesscomCurrentGame {
  url: string
  move_by: number
  pgn: string
  time_control: string
  last_activity: number
  rated: boolean
  turn: string
  fen: string
  start_time: number
  time_class: string
  rules: string
  white: string
  black: string
  draw_offer?: string
}

export interface ChesscomStreamers {
  streamers: {
    username: string
    avatar?: string
    twitch_url?: string
    url: string
    is_live: boolean
    is_community_streamer: boolean
  }[]
}

export interface ChesscomDailyPuzzle {
  title: string
  url: string
  publish_time: number
  fen: string
  pgn: string
  image: string
}

// ── API methods ──────────────────────────────────────────────────────

export const chesscomApi = {
  // Player
  getPlayer: (username: string) =>
    fetchJson<ChesscomPlayer>(`/player/${username.toLowerCase()}`),

  getPlayerStats: (username: string) =>
    fetchJson<ChesscomPlayerStats>(`/player/${username.toLowerCase()}/stats`),

  getPlayerCurrentGames: (username: string) =>
    fetchJson<{ games: ChesscomCurrentGame[] }>(`/player/${username.toLowerCase()}/games`),

  getPlayerArchives: (username: string) =>
    fetchJson<ChesscomArchiveList>(`/player/${username.toLowerCase()}/games/archives`),

  getPlayerMonthGames: (username: string, year: number, month: number) => {
    const mm = String(month).padStart(2, '0')
    return fetchJson<ChesscomArchiveGames>(`/player/${username.toLowerCase()}/games/${year}/${mm}`)
  },

  // Leaderboards & global
  getLeaderboards: () =>
    fetchJson<ChesscomLeaderboards>('/leaderboards'),

  getStreamers: () =>
    fetchJson<ChesscomStreamers>('/streamers'),

  getDailyPuzzle: () =>
    fetchJson<ChesscomDailyPuzzle>('/puzzle'),

  getRandomPuzzle: () =>
    fetchJson<ChesscomDailyPuzzle>('/puzzle/random'),

  // Titled players
  getTitledPlayers: (title: string) =>
    fetchJson<{ players: string[] }>(`/titled/${title}`),

  // Helper: get most recent games for a player
  async getRecentGames(username: string, count = 10): Promise<ChesscomGame[]> {
    const archives = await this.getPlayerArchives(username)
    if (!archives.archives.length) return []
    // Fetch the latest archive directly
    const latestUrl = archives.archives[archives.archives.length - 1]
    const res = await fetch(latestUrl, { headers: { Accept: 'application/json' } })
    if (!res.ok) return []
    const data = (await res.json()) as ChesscomArchiveGames
    return data.games.slice(-count).reverse()
  },
}
