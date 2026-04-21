// ════════════════════════════════════════════════════════════════════
// BirdEye API client
//
// Endpoints exposed:
//   GET  /defi/token_overview      → birdeyeTokenOverview(mint)
//   GET  /defi/v3/search           → birdeyeSearch(opts)
//   GET  /defi/token_trending      → birdeyeTrending(opts)
//   GET  /defi/price               → birdeyePrice(mint)
//   GET  /defi/multi_price         → birdeyeMultiPrice(mints)
//   GET  /defi/v3/token/holder     → birdeyeHolders(mint)
//   GET  /defi/txs/token           → birdeyeTokenTrades(mint, opts)
//
// All calls return null on failure (never throw) so callers can degrade
// gracefully when BirdEye is down or rate-limited.
// ════════════════════════════════════════════════════════════════════

const API_KEY = process.env.BIRDEYE_API_KEY ?? '';
const BASE = process.env.BIRDEYE_BASE_URL ?? 'https://public-api.birdeye.so';

function headers(): Record<string, string> {
  return {
    accept: 'application/json',
    'X-API-KEY': API_KEY,
    'x-chain': 'solana',
  };
}

async function get<T>(path: string, params?: Record<string, unknown>): Promise<T | null> {
  if (!API_KEY) return null;
  try {
    const url = new URL(BASE + path);
    for (const [k, v] of Object.entries(params ?? {})) {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v));
    }
    const res = await fetch(url.toString(), {
      headers: headers(),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      if (res.status !== 404) {
        console.warn(`[birdeye] ${path} → ${res.status}`);
      }
      return null;
    }
    const j = (await res.json()) as { success?: boolean; data?: T };
    return j?.data ?? null;
  } catch (err) {
    console.warn(`[birdeye] ${path} error:`, err instanceof Error ? err.message : err);
    return null;
  }
}

// ── Types ─────────────────────────────────────────────────────────────

export interface BirdeyeOverview {
  address?: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  price?: number;
  priceChange24hPercent?: number;
  v24hUSD?: number;
  mc?: number;
  liquidity?: number;
  uniqueWallet24h?: number;
  trade24h?: number;
  buy24h?: number;
  sell24h?: number;
  holder?: number;
  lastTradeUnixTime?: number;
  logoURI?: string;
  extensions?: Record<string, unknown>;
}

export interface BirdeyeSearchToken {
  type: 'token' | 'market';
  name: string;
  symbol: string;
  address: string;
  network: string;
  decimals: number;
  verified: boolean;
  fdv?: number;
  market_cap?: number;
  liquidity?: number;
  price?: number;
  price_change_24h_percent?: number;
  volume_24h_usd?: number;
  trade_24h?: number;
  unique_wallet_24h?: number;
  last_trade_unix_time?: number;
  logo_uri?: string;
}

export interface BirdeyeTrendingToken {
  address: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  rank?: number;
  price?: number;
  price24hChangePercent?: number;
  volume24hUSD?: number;
  liquidity?: number;
  logoURI?: string;
}

export interface BirdeyeHolder {
  amount: string;
  decimals: number;
  mint: string;
  owner: string;
  token_account: string;
  ui_amount: number;
}

// ── Public API ────────────────────────────────────────────────────────

export async function birdeyeTokenOverview(mint: string): Promise<BirdeyeOverview | null> {
  return get<BirdeyeOverview>('/defi/token_overview', { address: mint });
}

export async function birdeyePrice(mint: string): Promise<{ value?: number; updateUnixTime?: number } | null> {
  return get<{ value?: number; updateUnixTime?: number }>('/defi/price', { address: mint });
}

export async function birdeyeMultiPrice(mints: string[]): Promise<Record<string, { value?: number }> | null> {
  if (!mints.length) return null;
  return get<Record<string, { value?: number }>>('/defi/multi_price', {
    list_address: mints.join(','),
  });
}

export async function birdeyeTrending(opts?: {
  sort_by?: 'rank' | 'volume24hUSD' | 'liquidity';
  sort_type?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}): Promise<{ tokens?: BirdeyeTrendingToken[] } | null> {
  return get<{ tokens?: BirdeyeTrendingToken[] }>('/defi/token_trending', {
    sort_by:  opts?.sort_by  ?? 'rank',
    sort_type: opts?.sort_type ?? 'asc',
    offset:   opts?.offset   ?? 0,
    limit:    opts?.limit    ?? 20,
  });
}

export async function birdeyeSearch(opts: {
  keyword?: string;
  chain?: 'all' | 'solana';
  target?: 'all' | 'token' | 'market';
  searchMode?: 'exact' | 'fuzzy';
  searchBy?: 'combination' | 'address' | 'name' | 'symbol';
  sortBy?: 'volume_24h_usd' | 'liquidity' | 'market_cap' | 'price_change_24h_percent' | 'trade_24h';
  sortType?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  verifyToken?: boolean;
}): Promise<BirdeyeSearchToken[]> {
  const r = await get<{ items?: { type: string; result: BirdeyeSearchToken[] }[] }>('/defi/v3/search', {
    keyword:      opts.keyword,
    chain:        opts.chain      ?? 'solana',
    target:       opts.target     ?? 'token',
    search_mode:  opts.searchMode ?? 'fuzzy',
    search_by:    opts.searchBy   ?? 'combination',
    sort_by:      opts.sortBy     ?? 'volume_24h_usd',
    sort_type:    opts.sortType   ?? 'desc',
    limit:        opts.limit      ?? 20,
    offset:       opts.offset     ?? 0,
    verify_token: opts.verifyToken,
  });
  const items = r?.items ?? [];
  return items.flatMap(g => g.result ?? []);
}

export async function birdeyeHolders(mint: string, limit = 20, offset = 0): Promise<BirdeyeHolder[]> {
  const r = await get<{ items?: BirdeyeHolder[] }>('/defi/v3/token/holder', {
    address: mint, limit, offset,
  });
  return r?.items ?? [];
}

export async function birdeyeTokenTrades(mint: string, opts?: {
  offset?: number;
  limit?: number;
  tx_type?: 'swap' | 'all';
  sort_type?: 'desc' | 'asc';
}): Promise<unknown[]> {
  const r = await get<{ items?: unknown[] }>('/defi/txs/token', {
    address:   mint,
    offset:    opts?.offset    ?? 0,
    limit:     opts?.limit     ?? 20,
    tx_type:   opts?.tx_type   ?? 'swap',
    sort_type: opts?.sort_type ?? 'desc',
  });
  return r?.items ?? [];
}

export const birdeyeConfigured = Boolean(API_KEY);
