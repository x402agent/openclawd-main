// ════════════════════════════════════════════════════════════════════
// SolanaTracker API client — https://data.solanatracker.io
//
// Endpoints:
//   GET  /tokens/:mint              → token info + risk assessment
//   GET  /tokens/:mint/ath           → all-time high
//   GET  /tokens/:mint/holders/top   → top holders
//   GET  /tokens/:mint/pnl           → holder PnL distribution
//   GET  /chart/:mint?type=1m|5m…    → OHLCV candles
//   GET  /search?query=…             → token search
//   GET  /tokens/trending            → trending
//   GET  /tokens/latest              → newest launches
//   GET  /tokens/volume/:timeframe   → volume leaders (1h|24h|7d)
//
// All fns return null / [] on failure (never throw).
// ════════════════════════════════════════════════════════════════════

const API_KEY = process.env.SOLANA_TRACKER_API_KEY ?? '';
const BASE = process.env.SOLANA_TRACKER_URL ?? 'https://data.solanatracker.io';

function headers(): Record<string, string> {
  return { accept: 'application/json', 'x-api-key': API_KEY };
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
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      if (res.status !== 404) console.warn(`[tracker] ${path} → ${res.status}`);
      return null;
    }
    return await res.json() as T;
  } catch (err) {
    console.warn(`[tracker] ${path} error:`, err instanceof Error ? err.message : err);
    return null;
  }
}

// ── Types (partial — only fields we care about) ────────────────────────

export interface TrackerToken {
  token?: {
    name?: string;
    symbol?: string;
    mint?: string;
    decimals?: number;
    image?: string;
    description?: string;
    twitter?: string;
    telegram?: string;
    website?: string;
    createdOn?: string;
  };
  pools?: Array<{
    poolId?: string;
    market?: string;
    liquidity?: { usd?: number };
    price?: { usd?: number; quote?: number };
    marketCap?: { usd?: number };
    tokenSupply?: number;
    txns?: { buys?: number; sells?: number; volume?: number };
  }>;
  events?: Record<string, { priceChangePercentage?: number }>;
  risk?: {
    rugged?: boolean;
    risks?: Array<{ name: string; description?: string; level?: 'warning' | 'danger' | 'info'; score?: number }>;
    score?: number;
    jupiterVerified?: boolean;
  };
  holders?: number;
  buys?: number;
  sells?: number;
  txns?: number;
}

export interface TrackerHolder {
  wallet: string;
  amount: number;
  percentage: number;
  value?: { usd?: number };
}

export interface TrackerCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Public API ────────────────────────────────────────────────────────

export async function trackerToken(mint: string): Promise<TrackerToken | null> {
  return get<TrackerToken>(`/tokens/${mint}`);
}

export async function trackerAth(mint: string): Promise<unknown> {
  return get(`/tokens/${mint}/ath`);
}

export async function trackerTopHolders(mint: string): Promise<TrackerHolder[]> {
  const r = await get<TrackerHolder[]>(`/tokens/${mint}/holders/top`);
  return Array.isArray(r) ? r : [];
}

export async function trackerPnl(mint: string): Promise<unknown> {
  return get(`/tokens/${mint}/pnl`);
}

export async function trackerChart(mint: string, opts?: {
  type?: '1s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  time_from?: number;
  time_to?: number;
}): Promise<{ oclhv?: TrackerCandle[] } | null> {
  return get<{ oclhv?: TrackerCandle[] }>(`/chart/${mint}`, {
    type: opts?.type ?? '5m',
    time_from: opts?.time_from,
    time_to: opts?.time_to,
  });
}

export async function trackerSearch(query: string, limit = 20): Promise<unknown[]> {
  const r = await get<{ data?: unknown[] }>('/search', { query, limit });
  return r?.data ?? [];
}

export async function trackerTrending(timeframe: '5m' | '15m' | '30m' | '1h' | '2h' | '3h' | '4h' | '5h' | '6h' | '12h' | '24h' = '1h'): Promise<unknown[]> {
  const r = await get<unknown[]>(`/tokens/trending/${timeframe}`);
  return Array.isArray(r) ? r : [];
}

export async function trackerLatest(page = 1): Promise<unknown[]> {
  const r = await get<unknown[]>('/tokens/latest', { page });
  return Array.isArray(r) ? r : [];
}

export async function trackerVolumeLeaders(timeframe: '1h' | '24h' | '7d' = '24h'): Promise<unknown[]> {
  const r = await get<unknown[]>(`/tokens/volume/${timeframe}`);
  return Array.isArray(r) ? r : [];
}

export const trackerConfigured = Boolean(API_KEY);
