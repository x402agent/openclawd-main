/**
 * Jupiter API Client — authenticated with JUPITER_API_KEY.
 *
 * Exports (Swap + Price v2):
 *   getSolPrice()          — SOL/USD price (cached 60s)
 *   getJupiterPrice()      — any token(s) price via /price/v2
 *   getJupiterPriceV3()    — heuristics-based USD price via /price/v3
 *   getJupiterQuote()      — swap quote via /swap/v1/quote
 *   buildJupiterSwap()     — build tx via /swap/v1/order
 *
 * Exports (Tokens v2):
 *   jupTokensSearch()      — /tokens/v2/search
 *   jupTokensTag()         — /tokens/v2/tag
 *   jupTokensCategory()    — /tokens/v2/category/:category/:interval
 *   jupTokensRecent()      — /tokens/v2/recent
 *   jupTokensContent()     — /tokens/v2/content?ids=…
 *   jupTokensCooking()     — /tokens/v2/content/cooking
 *
 * Exports (Portfolio v1):
 *   jupPortfolioPositions()     — all DeFi positions across protocols
 *   jupPortfolioWallet()        — Jupiter-specific positions for a wallet
 *   jupPortfolioStakedJup()     — staked JUP balances
 *   jupPortfolioPlatforms()     — supported platforms
 *
 * Exports (Prediction Markets v1):
 *   jupPredictionEvents()       — list events
 *   jupPredictionEventSearch()  — search events by keyword
 *   jupPredictionEvent()        — single event by id
 *   jupPredictionMarket()       — single market by id
 *   jupPredictionOrderbook()    — orderbook for market
 *   jupPredictionPositions()    — positions by owner
 *   jupPredictionProfile()      — user profile stats
 *   jupPredictionLeaderboards() — leaderboard rankings
 *   jupPredictionTrades()       — global trade feed
 */

const JUPITER_API_KEY = process.env.JUPITER_API_KEY ?? '';
const BASE = 'https://api.jup.ag';
const SOL_MINT = 'So11111111111111111111111111111111111111112';

/** True when JUPITER_API_KEY is present (enables pro rate limits + keyed endpoints). */
export const jupiterConfigured = JUPITER_API_KEY.length > 0;

function jupHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (JUPITER_API_KEY) h['x-api-key'] = JUPITER_API_KEY;
  return h;
}

async function jupGet<T>(path: string, params?: Record<string, unknown>): Promise<T> {
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params ?? {})) {
    if (v != null && v !== '') url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString(), {
    headers: jupHeaders(),
    signal: AbortSignal.timeout(8_000),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Jupiter ${res.status}`);
  return data;
}

async function jupPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: jupHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Jupiter ${res.status}`);
  return data;
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface JupiterPrice {
  id: string;
  type: string;
  price: string;
  extraInfo?: {
    quotedPrice?: {
      buyPrice: string;
      sellPrice: string;
      buyAt: number;
      sellAt: number;
    };
    confidenceLevel: 'high' | 'medium' | 'low';
  };
}

export interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: 'ExactIn' | 'ExactOut';
  slippageBps: number;
  priceImpactPct: string;
  routePlan: Array<{
    swapInfo: {
      ammKey: string;
      label: string;
      inputMint: string;
      outputMint: string;
      inAmount: string;
      outAmount: string;
      feeAmount: string;
      feeMint: string;
    };
    percent: number;
  }>;
  contextSlot?: number;
  timeTaken?: number;
}

export interface JupiterOrder {
  swapTransaction: string;       // base64 VersionedTransaction
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
  computeUnitLimit: number;
  simulationError: string | null;
}

export interface JupiterToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
  tags?: string[];
}

// ── SOL/USD Price (cached) ───────────────────────────────────────────────────

let _cachedSolUsd = 0;
let _solUsdExpiresAt = 0;

/** Fetch current SOL/USD price from Jupiter (cached 60s). Returns 0 on failure. */
export async function getSolPrice(): Promise<number> {
  if (_cachedSolUsd > 0 && Date.now() < _solUsdExpiresAt) return _cachedSolUsd;
  try {
    const data = await getJupiterPrice(SOL_MINT);
    const price = parseFloat(data[SOL_MINT]?.price ?? '0');
    if (price > 0) {
      _cachedSolUsd = price;
      _solUsdExpiresAt = Date.now() + 60_000;
    }
    return price;
  } catch {
    return _cachedSolUsd; // return stale on failure
  }
}

// ── Price API ────────────────────────────────────────────────────────────────

/**
 * Get real-time prices for one or more token mints.
 * @param mints  Single mint string or comma-separated list.
 */
export async function getJupiterPrice(
  mints: string | string[],
  showExtraInfo = false,
): Promise<Record<string, JupiterPrice>> {
  const ids = Array.isArray(mints) ? mints.join(',') : mints;
  const data = await jupGet<{ data: Record<string, JupiterPrice>; timeTaken: number }>(
    '/price/v2',
    { ids, showExtraInfo },
  );
  return data.data;
}

/** Convenience: get USD price for a single token. Returns 0 on failure. */
export async function getTokenPriceUsd(mint: string): Promise<number> {
  try {
    const data = await getJupiterPrice(mint);
    return parseFloat(data[mint]?.price ?? '0');
  } catch {
    return 0;
  }
}

// ── Quote API ────────────────────────────────────────────────────────────────

/** Get a swap quote. Amount is in base units (lamports for SOL, raw for tokens). */
export async function getJupiterQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: number | string;
  slippageBps?: number;
  swapMode?: 'ExactIn' | 'ExactOut';
  restrictIntermediateTokens?: boolean;
}): Promise<JupiterQuote> {
  return jupGet<JupiterQuote>('/swap/v1/quote', {
    ...params,
    slippageBps: params.slippageBps ?? 50,
    restrictIntermediateTokens: params.restrictIntermediateTokens ?? true,
  });
}

// ── Order (Build Swap Transaction) ───────────────────────────────────────────

/**
 * Build a signed-ready swap transaction from a quote.
 * Returns base64-encoded VersionedTransaction.
 */
export async function buildJupiterSwap(params: {
  quoteResponse: JupiterQuote;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  dynamicComputeUnitLimit?: boolean;
}): Promise<JupiterOrder> {
  return jupPost<JupiterOrder>('/swap/v1/order', {
    quoteResponse: params.quoteResponse,
    userPublicKey: params.userPublicKey,
    wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? true,
    dynamicComputeUnitLimit: params.dynamicComputeUnitLimit ?? true,
  });
}

// ── Token Search ─────────────────────────────────────────────────────────────

/** Search tokens by name or symbol. */
export async function searchJupiterToken(query: string, limit = 10): Promise<JupiterToken[]> {
  try {
    return await jupGet<JupiterToken[]>('/tokens/v1/search', { query, limit });
  } catch {
    return [];
  }
}

/** Get full metadata for a single token by mint address. */
export async function getJupiterToken(mint: string): Promise<JupiterToken | null> {
  try {
    return await jupGet<JupiterToken>(`/tokens/v1/token/${mint}`);
  } catch {
    return null;
  }
}

// ── Formatting helpers ───────────────────────────────────────────────────────

/** Format a Jupiter quote into a human-readable summary string. */
export function formatJupiterQuote(quote: JupiterQuote, inputSymbol = 'TOKEN', outputSymbol = 'TOKEN'): string {
  const inAmt = quote.inAmount;
  const outAmt = quote.outAmount;
  const impact = parseFloat(quote.priceImpactPct).toFixed(3);
  const route = quote.routePlan.map(r => r.swapInfo.label).join(' → ');
  return [
    `In:  ${inAmt} ${inputSymbol}`,
    `Out: ${outAmt} ${outputSymbol}`,
    `Impact: ${impact}%`,
    `Route:  ${route}`,
    `Slippage: ${quote.slippageBps / 100}%`,
  ].join('\n');
}

// ═════════════════════════════════════════════════════════════════════════════
// Price API v3
// ═════════════════════════════════════════════════════════════════════════════

export interface JupiterPriceV3Entry {
  usdPrice: number;
  blockId?: number;
  decimals?: number;
  priceChange24h?: number;
}

/**
 * Heuristics-based USD prices for up to 50 token mint addresses.
 * Validated against liquidity + trading metrics (more robust than v2 for thin tokens).
 */
export async function getJupiterPriceV3(
  mints: string | string[],
): Promise<Record<string, JupiterPriceV3Entry>> {
  const ids = Array.isArray(mints) ? mints.slice(0, 50).join(',') : mints;
  return jupGet<Record<string, JupiterPriceV3Entry>>('/price/v3', { ids });
}

// ═════════════════════════════════════════════════════════════════════════════
// Tokens API v2
// ═════════════════════════════════════════════════════════════════════════════

export interface JupiterTokenV2 {
  id: string;             // mint address
  name: string;
  symbol: string;
  icon?: string;
  decimals: number;
  twitter?: string;
  website?: string;
  dev?: string;
  circSupply?: number;
  totalSupply?: number;
  tokenProgram?: string;
  launchpad?: string;
  firstPool?: { id: string; createdAt: string };
  holderCount?: number;
  audit?: Record<string, unknown>;
  organicScore?: number;
  organicScoreLabel?: 'high' | 'medium' | 'low';
  isVerified?: boolean;
  cexes?: string[];
  tags?: string[];
  fdv?: number;
  mcap?: number;
  usdPrice?: number;
  priceBlockId?: number;
  liquidity?: number;
  stats5m?: JupiterTokenStats;
  stats1h?: JupiterTokenStats;
  stats6h?: JupiterTokenStats;
  stats24h?: JupiterTokenStats;
}

export interface JupiterTokenStats {
  priceChange?: number;
  holderChange?: number;
  liquidityChange?: number;
  volumeChange?: number;
  buyVolume?: number;
  sellVolume?: number;
  buyOrganicVolume?: number;
  sellOrganicVolume?: number;
  numBuys?: number;
  numSells?: number;
  numTraders?: number;
  numOrganicBuyers?: number;
  numNetBuyers?: number;
}

/** Search tokens by name, symbol or mint. Returns organic-scored results. */
export async function jupTokensSearch(query: string, limit = 20): Promise<JupiterTokenV2[]> {
  const data = await jupGet<JupiterTokenV2[] | { tokens: JupiterTokenV2[] }>(
    '/tokens/v2/search',
    { query, limit },
  );
  return Array.isArray(data) ? data : (data.tokens ?? []);
}

/** Return tokens by tag (e.g. "verified", "lst", "pump"). */
export async function jupTokensTag(tag: string): Promise<JupiterTokenV2[]> {
  const data = await jupGet<JupiterTokenV2[]>('/tokens/v2/tag', { query: tag });
  return Array.isArray(data) ? data : [];
}

/** Return tokens by category. Category examples: "toporganicscore", "toptraded", "toptrending". */
export async function jupTokensCategory(
  category: string,
  interval: '5m' | '1h' | '6h' | '24h' = '1h',
  limit = 50,
): Promise<JupiterTokenV2[]> {
  const data = await jupGet<JupiterTokenV2[]>(
    `/tokens/v2/${category}/${interval}`,
    { limit },
  );
  return Array.isArray(data) ? data : [];
}

/** Mints that recently had their first created pool (new launches with liquidity). */
export async function jupTokensRecent(limit = 30): Promise<JupiterTokenV2[]> {
  const data = await jupGet<JupiterTokenV2[]>('/tokens/v2/recent', { limit });
  return Array.isArray(data) ? data : [];
}

/** Approved content (tweets, articles) for up to 50 mints. */
export async function jupTokensContent(mints: string | string[]): Promise<unknown> {
  const ids = Array.isArray(mints) ? mints.slice(0, 50).join(',') : mints;
  return jupGet<unknown>('/tokens/v2/content', { ids });
}

/** Trending token content feed ("cooking"). */
export async function jupTokensCooking(limit = 20): Promise<unknown> {
  return jupGet<unknown>('/tokens/v2/content/cooking', { limit });
}

// ═════════════════════════════════════════════════════════════════════════════
// Portfolio API v1
// ═════════════════════════════════════════════════════════════════════════════

export interface PortfolioPosition {
  protocol: string;
  type: string;
  value?: number;
  [k: string]: unknown;
}

/** All DeFi positions across protocols (lending, staking, LP, etc) for a wallet. */
export async function jupPortfolioPositions(wallet: string): Promise<PortfolioPosition[]> {
  const data = await jupGet<{ positions?: PortfolioPosition[] } | PortfolioPosition[]>(
    '/portfolio/v1/positions',
    { wallet },
  );
  if (Array.isArray(data)) return data;
  return data.positions ?? [];
}

/** Jupiter-native positions for an address (wallet balances, staked JUP, limit orders, DCA, pools, perps). */
export async function jupPortfolioWallet(address: string): Promise<unknown> {
  return jupGet<unknown>(`/portfolio/v1/positions/${address}`);
}

export async function jupPortfolioStakedJup(wallet: string): Promise<unknown> {
  return jupGet<unknown>('/portfolio/v1/staked-jup', { wallet });
}

export async function jupPortfolioPlatforms(): Promise<unknown> {
  return jupGet<unknown>('/portfolio/v1/platforms');
}

// ═════════════════════════════════════════════════════════════════════════════
// Prediction Markets API v1
// ═════════════════════════════════════════════════════════════════════════════

export interface JupPredictionEvent {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  category?: string;
  tags?: string[];
  imageUri?: string;
  status: 'active' | 'closed' | 'resolved' | string;
  closeTime?: number;
  resolveTime?: number;
  volume?: number;
  openInterest?: number;
  markets?: JupPredictionMarket[];
}

export interface JupPredictionMarket {
  id: string;
  eventId: string;
  title: string;
  status: string;
  yesPrice?: number;
  noPrice?: number;
  yesBid?: number;
  yesAsk?: number;
  noBid?: number;
  noAsk?: number;
  volume?: number;
  openInterest?: number;
  liquidity?: number;
  resolution?: 'yes' | 'no' | null;
  yesMint?: string;
  noMint?: string;
  settlementMint?: string;
}

export interface JupPredictionOrderbook {
  marketId: string;
  yes: { bids: Array<[number, number]>; asks: Array<[number, number]> };
  no:  { bids: Array<[number, number]>; asks: Array<[number, number]> };
}

export interface JupPredictionPosition {
  id: string;
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  contracts: number;
  entryPrice?: number;
  currentValue?: number;
  pnl?: number;
}

/** List prediction events with optional filtering. */
export async function jupPredictionEvents(opts?: {
  status?: 'active' | 'closed' | 'resolved';
  category?: string;
  tags?: string;
  limit?: number;
  offset?: number;
}): Promise<JupPredictionEvent[]> {
  const data = await jupGet<JupPredictionEvent[] | { events: JupPredictionEvent[] }>(
    '/prediction/v1/events',
    { status: 'active', limit: 20, ...(opts ?? {}) },
  );
  return Array.isArray(data) ? data : (data.events ?? []);
}

/** Search prediction events by keyword. */
export async function jupPredictionEventSearch(query: string, limit = 20): Promise<JupPredictionEvent[]> {
  const data = await jupGet<JupPredictionEvent[] | { events: JupPredictionEvent[] }>(
    '/prediction/v1/events/search',
    { query, limit },
  );
  return Array.isArray(data) ? data : (data.events ?? []);
}

export async function jupPredictionEvent(eventId: string): Promise<JupPredictionEvent> {
  return jupGet<JupPredictionEvent>(`/prediction/v1/events/${eventId}`);
}

export async function jupPredictionMarket(marketId: string): Promise<JupPredictionMarket> {
  return jupGet<JupPredictionMarket>(`/prediction/v1/markets/${marketId}`);
}

export async function jupPredictionOrderbook(marketId: string): Promise<JupPredictionOrderbook> {
  return jupGet<JupPredictionOrderbook>(`/prediction/v1/orderbook/${marketId}`);
}

export async function jupPredictionPositions(opts: {
  ownerPubkey: string;
  marketId?: string;
  status?: 'open' | 'closed';
  limit?: number;
}): Promise<JupPredictionPosition[]> {
  const data = await jupGet<JupPredictionPosition[] | { positions: JupPredictionPosition[] }>(
    '/prediction/v1/positions',
    opts,
  );
  return Array.isArray(data) ? data : (data.positions ?? []);
}

export async function jupPredictionProfile(pubkey: string): Promise<unknown> {
  return jupGet<unknown>(`/prediction/v1/profiles/${pubkey}`);
}

export async function jupPredictionLeaderboards(opts?: {
  metric?: 'volume' | 'pnl' | 'winrate';
  interval?: '24h' | '7d' | '30d' | 'all';
  limit?: number;
}): Promise<unknown> {
  return jupGet<unknown>('/prediction/v1/leaderboards', {
    metric: 'pnl',
    interval: '7d',
    limit: 50,
    ...(opts ?? {}),
  });
}

export async function jupPredictionTrades(opts?: {
  marketId?: string;
  ownerPubkey?: string;
  limit?: number;
}): Promise<unknown> {
  return jupGet<unknown>('/prediction/v1/trades', { limit: 50, ...(opts ?? {}) });
}
