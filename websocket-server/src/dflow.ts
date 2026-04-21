/**
 * dFlow DEX + Prediction Markets — direct server-side client
 * Calls dFlow APIs with the API key from env (safe — server-side only).
 *
 * Quote API:   https://d.quote-api.dflow.net
 * Markets API: https://d.prediction-markets-api.dflow.net
 */

const QUOTE_BASE  = process.env.DFLOW_QUOTE_API_URL   ?? 'https://d.quote-api.dflow.net';
const MARKET_BASE = process.env.DFLOW_MARKETS_API_URL  ?? 'https://d.prediction-markets-api.dflow.net';
const API_KEY     = process.env.DFLOW_API_KEY ?? '';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DFlowQuote {
  inputMint:      string;
  outputMint:     string;
  inAmount:       string;
  outAmount:      string;
  priceImpactPct?: number;
  slippageBps?:   number | string;
}

export interface DFlowOrder {
  outAmount:            string;
  executionMode:        'async' | 'sync';
  transaction:          string; // base64 VersionedTransaction
  lastValidBlockHeight: number;
  revertMint?:          string;
}

export interface DFlowOrderStatus {
  status:    'pending' | 'closed' | 'expired' | 'failed';
  outAmount?: number;
  reverts?:  Array<{ signature: string }>;
}

export interface DFlowMarketAccounts {
  settlementMint?:    string;
  yesMint?:           string;
  noMint?:            string;
  redemptionStatus?:  string;
}

export interface DFlowMarket {
  ticker:    string;
  title:     string;
  status:    string;
  result?:   string;
  yesBid?:   number;
  yesAsk?:   number;
  noBid?:    number;
  noAsk?:    number;
  accounts?: DFlowMarketAccounts;
}

export interface DFlowEvent {
  ticker:        string;
  title:         string;
  status:        string;
  seriesTicker?: string;
  markets?:      DFlowMarket[];
}

export interface DFlowCategory {
  category: string;
  tags:     string[];
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function headers(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (API_KEY) h['x-api-key'] = API_KEY;
  return h;
}

async function get<T>(base: string, path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(path, base);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v !== undefined && v !== null && v !== '') {
      url.searchParams.set(k, String(v));
    }
  }
  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`dFlow ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Indicative swap quote — no transaction, just price info */
export async function dflowQuote(opts: {
  inputMint:   string;
  outputMint:  string;
  amount:      number;
  slippageBps?: number | 'auto';
}): Promise<DFlowQuote> {
  return get<DFlowQuote>(QUOTE_BASE, '/quote', {
    inputMint:   opts.inputMint,
    outputMint:  opts.outputMint,
    amount:      opts.amount,
    slippageBps: opts.slippageBps ?? 'auto',
  });
}

/** Build a swap / prediction-market order transaction */
export async function dflowOrder(opts: {
  userPublicKey:              string;
  inputMint:                  string;
  outputMint:                 string;
  amount:                     number;
  slippageBps?:               number | 'auto';
  prioritizationFeeLamports?: number;
  platformFeeBps?:            number;
  feeAccount?:                string;
}): Promise<DFlowOrder> {
  return get<DFlowOrder>(QUOTE_BASE, '/order', {
    userPublicKey:              opts.userPublicKey,
    inputMint:                  opts.inputMint,
    outputMint:                 opts.outputMint,
    amount:                     opts.amount,
    slippageBps:                opts.slippageBps ?? 'auto',
    dynamicComputeUnitLimit:    'true',
    prioritizationFeeLamports:  opts.prioritizationFeeLamports ?? 5000,
    platformFeeBps:             opts.platformFeeBps,
    feeAccount:                 opts.feeAccount,
  });
}

/** Poll async order status */
export async function dflowOrderStatus(
  signature: string,
  lastValidBlockHeight?: number,
): Promise<DFlowOrderStatus> {
  return get<DFlowOrderStatus>(QUOTE_BASE, '/order-status', {
    signature,
    lastValidBlockHeight,
  });
}

/** List all prediction market categories.
 *  dFlow returns `{ tagsByCategories: { CategoryName: [tag, ...] } }`;
 *  we flatten to a sortable array for consumers.
 */
export async function dflowCategories(): Promise<DFlowCategory[]> {
  const data = await get<{ tagsByCategories?: Record<string, string[]> } | unknown[]>(
    MARKET_BASE, '/api/v1/tags_by_categories',
  );
  if (Array.isArray(data)) return data as DFlowCategory[];
  const map = (data as { tagsByCategories?: Record<string, string[]> }).tagsByCategories ?? {};
  return Object.entries(map).map(([category, tags]) => ({ category, tags: tags ?? [] }));
}

/** List prediction market series (optionally filtered). */
export async function dflowSeries(opts?: {
  category?: string;
  tags?:     string;
}): Promise<unknown[]> {
  const data = await get<{ series?: unknown[] } | unknown[]>(
    MARKET_BASE, '/api/v1/series', opts ?? {},
  );
  if (Array.isArray(data)) return data;
  return (data as { series?: unknown[] }).series ?? [];
}

/** Get live prediction market events. */
export async function dflowEvents(opts?: {
  seriesTickers?: string;
  category?:      string;
  tags?:          string;
  status?:        'active' | 'closed';
  limit?:         number;
}): Promise<DFlowEvent[]> {
  const data = await get<{ events?: DFlowEvent[] } | DFlowEvent[]>(MARKET_BASE, '/api/v1/events', {
    status:           'active',
    withNestedMarkets: 'true',
    limit:            20,
    ...(opts ?? {}),
  });
  if (Array.isArray(data)) return data;
  return (data as { events?: DFlowEvent[] }).events ?? [];
}

/** Get a single prediction market by outcome token mint */
export async function dflowMarketByMint(mint: string): Promise<DFlowMarket> {
  return get<DFlowMarket>(MARKET_BASE, `/api/v1/market/by-mint/${mint}`);
}

