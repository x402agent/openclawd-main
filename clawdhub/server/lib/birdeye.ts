/**
 * Birdeye API — server-side wrapper.
 * Proxies requests to Birdeye public API so API key never leaks to browser.
 * Supports: OHLCV, token overview, market data, trade data, price stats, new pairs.
 */

const BIRDEYE_BASE = 'https://public-api.birdeye.so'

function getBirdeyeApiKey(): string {
  const key = process.env.BIRDEYE_API_KEY
  if (!key) throw new Error('Missing BIRDEYE_API_KEY env var')
  return key
}

function getBirdeyeWssUrl(): string {
  return (
    process.env.BIRDEYE_WSS_URL ??
    `wss://public-api.birdeye.so/socket/solana?x-api-key=${getBirdeyeApiKey()}`
  )
}

/* ── Generic fetch helper ─────────────────────────────────── */

async function birdeyeFetch<T = unknown>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
  chain = 'solana',
): Promise<T> {
  const url = new URL(path, BIRDEYE_BASE)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url.toString(), {
    headers: {
      'X-API-KEY': getBirdeyeApiKey(),
      'x-chain': chain,
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Birdeye ${res.status}: ${body}`)
  }
  const json = (await res.json()) as { success?: boolean; data?: T }
  if (json.data !== undefined) return json.data as T
  return json as unknown as T
}

/* ── OHLCV (historical candlestick data) ─────────────────── */

export interface BirdeyeOHLCVItem {
  o: number
  h: number
  l: number
  c: number
  v: number
  unixTime: number
  address: string
  type: string
}

/**
 * Fetch OHLCV bars from Birdeye REST API.
 * Endpoint: GET /defi/ohlcv
 * @param address Token or pair address
 * @param type Timeframe: 1m, 3m, 5m, 15m, 30m, 1H, 2H, 4H, 6H, 8H, 12H, 1D, 3D, 1W, 1M
 * @param timeFrom Unix timestamp start (optional)
 * @param timeTo Unix timestamp end (optional)
 */
export async function getBirdeyeOHLCV(opts: {
  address: string
  type?: string
  timeFrom?: number
  timeTo?: number
  currency?: string
}): Promise<{ items: BirdeyeOHLCVItem[] }> {
  const now = Math.floor(Date.now() / 1000)
  const resolution = opts.type ?? '1m'

  // Calculate sensible default time range based on resolution
  const resolutionSeconds: Record<string, number> = {
    '1m': 60, '3m': 180, '5m': 300, '15m': 900, '30m': 1800,
    '1H': 3600, '2H': 7200, '4H': 14400, '6H': 21600, '8H': 28800, '12H': 43200,
    '1D': 86400, '3D': 259200, '1W': 604800, '1M': 2592000,
  }
  const barSec = resolutionSeconds[resolution] ?? 60
  const defaultBars = 300
  const timeFrom = opts.timeFrom ?? (now - barSec * defaultBars)
  const timeTo = opts.timeTo ?? now

  return birdeyeFetch('/defi/ohlcv', {
    address: opts.address,
    type: resolution,
    time_from: timeFrom,
    time_to: timeTo,
    currency: opts.currency,
  })
}

/* ── Token Overview ──────────────────────────────────────── */

export interface BirdeyeTokenOverview {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  price: number
  marketCap: number
  fdv: number
  liquidity: number
  holder: number
  priceChange24hPercent: number
  priceChange1hPercent: number
  volume24hUSD: number
  extensions: {
    coingecko_id?: string
    website?: string
    twitter?: string
    discord?: string
    telegram?: string
    description?: string
  }
}

export async function getBirdeyeTokenOverview(address: string): Promise<BirdeyeTokenOverview> {
  return birdeyeFetch('/defi/token_overview', { address })
}

/* ── Token Market Data ───────────────────────────────────── */

export interface BirdeyeMarketData {
  address: string
  price: number
  liquidity: number
  total_supply: number
  circulating_supply: number
  market_cap: number
  fdv: number
  holder: number
}

export async function getBirdeyeMarketData(address: string): Promise<BirdeyeMarketData> {
  return birdeyeFetch('/defi/v3/token/market-data', { address })
}

/* ── Token Trade Data ────────────────────────────────────── */

export async function getBirdeyeTradeData(address: string, frames?: string) {
  return birdeyeFetch('/defi/v3/token/trade-data/single', { address, frames })
}

/* ── Token Metadata ──────────────────────────────────────── */

export interface BirdeyeTokenMeta {
  address: string
  symbol: string
  name: string
  decimals: number
  logo_uri: string
  extensions: {
    coingecko_id?: string
    website?: string
    twitter?: string
    discord?: string
    telegram?: string
  }
}

export async function getBirdeyeTokenMetadata(address: string): Promise<BirdeyeTokenMeta> {
  return birdeyeFetch('/defi/v3/token/meta-data/single', { address })
}

/* ── Price Stats ─────────────────────────────────────────── */

export async function getBirdeyePriceStats(address: string, timeframes?: string) {
  return birdeyeFetch('/defi/v3/price/stats/single', {
    address,
    list_timeframe: timeframes ?? '1m,5m,30m,1h,4h,24h',
  })
}

/* ── Token Price (current) ───────────────────────────────── */

export async function getBirdeyePrice(address: string): Promise<{ value: number; updateUnixTime: number }> {
  return birdeyeFetch('/defi/price', { address })
}

/* ── New Pair Listings ───────────────────────────────────── */

export async function getBirdeyeNewListings(limit = 50) {
  return birdeyeFetch('/defi/v3/token/new-listing', { limit })
}

/* ── Token Security ──────────────────────────────────────── */

export async function getBirdeyeTokenSecurity(address: string) {
  return birdeyeFetch('/defi/token_security', { address })
}

/* ── Re-exports ──────────────────────────────────────────── */

export { getBirdeyeApiKey, getBirdeyeWssUrl, birdeyeFetch }
