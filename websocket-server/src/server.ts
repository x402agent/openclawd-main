// ════════════════════════════════════════════════════════════════════
// PumpFun WebSocket Relay Server
//
// Architecture:
//   Solana RPC (wss) ◄── SolanaMonitor ──► Relay Server (ws) ──► Browsers
//
// One upstream connection to Solana, broadcasts parsed token launch
// events to all connected browser clients. Also serves the HTML page.
// ════════════════════════════════════════════════════════════════════

import 'dotenv/config';
import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { WebSocketServer, WebSocket } from 'ws';
import { SolanaMonitor } from './solana-monitor.js';
import { ClaimMonitor } from './claim-monitor.js';
import type {
  TokenLaunchEvent, FeeClaimEvent, ServerStatus, Heartbeat, RelayMessage,
  TokenEnrichedEvent, JupiterPredictionSnapshot, JupiterPriceTick,
  HeliusWebhookEvent,
} from './types.js';
import {
  birdeyeConfigured, birdeyeTokenOverview, birdeyeSearch, birdeyeTrending,
  birdeyePrice, birdeyeMultiPrice, birdeyeHolders, birdeyeTokenTrades,
} from './birdeye.js';
import {
  trackerConfigured, trackerToken, trackerAth, trackerTopHolders, trackerPnl,
  trackerChart, trackerSearch, trackerTrending, trackerLatest, trackerVolumeLeaders,
} from './solana-tracker.js';
import { analyzerConfigured, analyzeToken } from './grok-analyzer.js';
import {
  jupiterConfigured,
  getJupiterPrice, getJupiterPriceV3, getJupiterQuote, buildJupiterSwap,
  searchJupiterToken, getJupiterToken,
  jupTokensSearch, jupTokensTag, jupTokensCategory, jupTokensRecent,
  jupTokensContent, jupTokensCooking,
  jupPortfolioPositions, jupPortfolioWallet, jupPortfolioStakedJup, jupPortfolioPlatforms,
  jupPredictionEvents, jupPredictionEventSearch, jupPredictionEvent,
  jupPredictionMarket, jupPredictionOrderbook, jupPredictionPositions,
  jupPredictionProfile, jupPredictionLeaderboards, jupPredictionTrades,
  type JupPredictionEvent,
} from './jupiter.js';
import {
  dflowQuote, dflowOrder, dflowOrderStatus,
  dflowCategories, dflowSeries, dflowEvents, dflowMarketByMint,
} from './dflow.js';
import { createClawdBuyBotFromEnv, type ClawdBuyEvent } from './clawd-buy-bot.js';
import {
  heliusConfigured, heliusWebhookEnabled,
  verifyHeliusAuth, heliusParseTransactions, summarizeHeliusTx,
  type HeliusEnhancedTx,
} from './helius.js';

// ── Config ──────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3099', 10);
const SOLANA_RPC_WS =
  process.env.HELIUS_WSS_URL ||
  process.env.SOLANA_RPC_WS ||
  'wss://api.mainnet-beta.solana.com';
const SOLANA_RPC_HTTP =
  process.env.HELIUS_RPC_URL ||
  process.env.SOLANA_RPC_URL ||
  'https://api.mainnet-beta.solana.com';
const ENABLE_CLAIMS = (process.env.ENABLE_CLAIMS || 'true').toLowerCase() === 'true';
const CLAIM_POLL_INTERVAL = parseInt(process.env.CLAIM_POLL_INTERVAL || '15000', 10);
const ENRICH_LAUNCHES = (process.env.BIRDEYE_ENRICH_LAUNCHES || 'true').toLowerCase() === 'true' && birdeyeConfigured;
const HEARTBEAT_INTERVAL = 15_000; // 15s
const STATUS_INTERVAL = 10_000;    // 10s
const PREDICTION_BROADCAST_INTERVAL = parseInt(process.env.JUPITER_PREDICTION_INTERVAL || '60000', 10);
const ENABLE_PREDICTION_STREAM = (process.env.ENABLE_PREDICTION_STREAM || 'true').toLowerCase() === 'true' && jupiterConfigured;
const dflowConfigured = Boolean(process.env.DFLOW_API_KEY);
const HELIUS_API_KEY = process.env.HELIUS_API_KEY ?? '';
const HELIUS_WALLET_API_BASE = process.env.HELIUS_WALLET_API_BASE ?? 'https://api.helius.xyz';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Load static HTML page ───────────────────────────────────────────
let indexHtml = '<html><body>PumpFun WebSocket Relay — connect via WebSocket</body></html>';
const htmlPath = resolve(__dirname, '../public/index.html');
if (existsSync(htmlPath)) {
  indexHtml = readFileSync(htmlPath, 'utf-8');
}

// ── HTTP server (serves the page) ───────────────────────────────────
function sendJson(res: import('node:http').ServerResponse, data: unknown, code = 200) {
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(data));
}

function redactUrlSecret(value: string): string {
  try {
    const url = new URL(value);
    if (url.searchParams.has('api-key')) {
      url.searchParams.set('api-key', 'REDACTED');
    }
    return url.toString();
  } catch {
    return value.replace(/(api-key=)[^&]+/i, '$1REDACTED');
  }
}

function readJsonBody(req: import('node:http').IncomingMessage): Promise<unknown> {
  return new Promise((resolvep, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf-8');
      if (!raw) return resolvep({});
      try { resolvep(JSON.parse(raw)); } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function isLikelySolanaAddress(value: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,100}$/.test(value);
}

async function heliusRpc(method: string, params: unknown): Promise<unknown> {
  const res = await fetch(SOLANA_RPC_HTTP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 'clawd-relay', method, params }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || (json as { error?: { message?: string } }).error) {
    const message =
      (json as { error?: { message?: string } }).error?.message ??
      `RPC ${method} failed`;
    throw new Error(message);
  }
  return (json as { result?: unknown }).result ?? null;
}

async function heliusWalletGet(path: string): Promise<unknown> {
  if (!HELIUS_API_KEY) throw new Error('HELIUS_API_KEY not configured');
  const res = await fetch(`${HELIUS_WALLET_API_BASE}${path}`, {
    headers: { 'X-Api-Key': HELIUS_API_KEY },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (json as { error?: string; message?: string }).error ??
      (json as { message?: string }).message ??
      `Helius wallet API failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

async function birdeyeWalletGet(path: string): Promise<unknown> {
  if (!birdeyeConfigured) throw new Error('BIRDEYE_API_KEY not configured');
  const res = await fetch(`https://public-api.birdeye.so${path}`, {
    headers: {
      'X-API-KEY': process.env.BIRDEYE_API_KEY ?? '',
      'x-chain': 'solana',
      accept: 'application/json',
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (json as { error?: string; message?: string }).error ??
      (json as { message?: string }).message ??
      `Birdeye wallet API failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

const httpServer = createServer(async (req, res) => {
  const urlStr = req.url ?? '/';
  const url = new URL(urlStr, `http://${req.headers.host ?? 'localhost'}`);
  const path = url.pathname;

  // Health check
  if (path === '/health') {
    return sendJson(res, {
      status: 'ok',
      solana: monitor.connected,
      claims: claimMonitor?.connected ?? false,
      clients: wss.clients.size,
      totalLaunches: monitor.stats.totalLaunches,
      totalClaims: claimMonitor?.stats.totalClaims ?? 0,
      birdeye: birdeyeConfigured,
      tracker: trackerConfigured,
      analyzer: analyzerConfigured,
      jupiter: jupiterConfigured,
      dflow: dflowConfigured,
      helius: heliusConfigured,
      heliusWebhook: heliusWebhookEnabled,
      predictionStream: ENABLE_PREDICTION_STREAM,
      enrichLaunches: ENRICH_LAUNCHES,
      rpcHttp: redactUrlSecret(SOLANA_RPC_HTTP),
      rpcWs: redactUrlSecret(SOLANA_RPC_WS),
      webhookPath: '/webhook/helius',
      uptime: process.uptime(),
    });
  }

  // Favicon
  if (path === '/favicon.ico') {
    res.writeHead(204);
    res.end();
    return;
  }

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  // ── Helius REST proxy ──────────────────────────────────────────────
  if (path.startsWith('/api/helius/')) {
    const q = url.searchParams;
    try {
      if (path === '/api/helius/rpc' && req.method === 'POST') {
        const body = (await readJsonBody(req)) as {
          method?: string;
          params?: unknown;
        };
        const method = body.method ?? '';
        const allowed = new Set(['getBalance', 'getAsset', 'getAssetsByOwner']);
        if (!allowed.has(method)) {
          return sendJson(res, { error: 'rpc method not allowed' }, 400);
        }
        return sendJson(res, { result: await heliusRpc(method, body.params ?? []) });
      }

      const addressTxMatch = path.match(/^\/api\/helius\/address-transactions\/(.+)$/);
      if (addressTxMatch) {
        const address = decodeURIComponent(addressTxMatch[1] ?? '').trim();
        if (!isLikelySolanaAddress(address)) {
          return sendJson(res, { error: 'invalid address' }, 400);
        }
        if (!HELIUS_API_KEY) {
          return sendJson(res, { error: 'HELIUS_API_KEY not configured' }, 503);
        }
        const limit = Math.max(1, Math.min(50, Number(q.get('limit')) || 15));
        const upstream = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${HELIUS_API_KEY}&limit=${limit}`;
        const txs = await fetch(upstream).then((r) => r.ok ? r.json() : []);
        return sendJson(res, txs);
      }

      if (path === '/api/helius/parse-transactions' && req.method === 'POST') {
        const body = (await readJsonBody(req)) as { transactions?: string[] };
        const signatures = (body.transactions ?? []).filter((s): s is string => typeof s === 'string' && s.length > 0);
        return sendJson(res, await heliusParseTransactions(signatures));
      }

      const webhookMatch = path.match(/^\/api\/helius\/webhook\/(.+)$/);
      if (webhookMatch) {
        const webhookId = decodeURIComponent(webhookMatch[1] ?? '').trim();
        if (!webhookId) return sendJson(res, { error: 'webhook id required' }, 400);
        if (!HELIUS_API_KEY) return sendJson(res, { error: 'HELIUS_API_KEY not configured' }, 503);
        const upstream = `https://api.helius.xyz/v0/webhooks/${webhookId}?api-key=${HELIUS_API_KEY}`;
        const data = await fetch(upstream).then((r) => r.ok ? r.json() : null);
        return sendJson(res, data ?? { error: 'webhook not found' }, data ? 200 : 404);
      }

      const walletBalancesMatch = path.match(/^\/api\/helius\/wallet\/balances\/(.+)$/);
      if (walletBalancesMatch) {
        const address = decodeURIComponent(walletBalancesMatch[1] ?? '').trim();
        if (!isLikelySolanaAddress(address)) {
          return sendJson(res, { error: 'invalid address' }, 400);
        }
        const page = Math.max(1, Number(q.get('page')) || 1);
        const limit = Math.max(1, Math.min(100, Number(q.get('limit')) || 100));
        const showNfts = q.get('showNfts') === 'true' ? 'true' : 'false';
        const showNative = q.get('showNative') === 'false' ? 'false' : 'true';
        const data = await heliusWalletGet(
          `/v1/wallet/${address}/balances?page=${page}&limit=${limit}&showNative=${showNative}&showNfts=${showNfts}`,
        );
        return sendJson(res, data);
      }

      return sendJson(res, { error: 'unknown helius endpoint' }, 404);
    } catch (e) {
      return sendJson(res, { error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  // ── BirdEye REST proxy ─────────────────────────────────────────────
  if (path.startsWith('/api/birdeye/')) {
    if (!birdeyeConfigured) return sendJson(res, { error: 'BIRDEYE_API_KEY not configured' }, 503);
    const q = url.searchParams;

    try {
      if (path === '/api/birdeye/search') {
        const keyword = q.get('q') ?? q.get('keyword') ?? '';
        if (!keyword) return sendJson(res, { error: 'q (keyword) required' }, 400);
        const data = await birdeyeSearch({
          keyword,
          limit: Number(q.get('limit')) || 20,
          offset: Number(q.get('offset')) || 0,
          sortBy: (q.get('sort') as 'volume_24h_usd') ?? 'volume_24h_usd',
          verifyToken: q.get('verified') === 'true' ? true : undefined,
        });
        return sendJson(res, { items: data });
      }

      if (path === '/api/birdeye/trending') {
        const data = await birdeyeTrending({
          limit: Number(q.get('limit')) || 20,
          offset: Number(q.get('offset')) || 0,
        });
        return sendJson(res, data ?? { tokens: [] });
      }

      if (path === '/api/birdeye/wallet/net-worth') {
        const wallet = (q.get('wallet') ?? '').trim();
        if (!isLikelySolanaAddress(wallet)) {
          return sendJson(res, { error: 'wallet required' }, 400);
        }
        return sendJson(
          res,
          await birdeyeWalletGet(
            `/wallet/v2/current-net-worth?wallet=${wallet}&sort_by=value&sort_type=desc&limit=${Number(q.get('limit')) || 20}&offset=${Number(q.get('offset')) || 0}`,
          ),
        );
      }

      if (path === '/api/birdeye/wallet/pnl/summary') {
        const wallet = (q.get('wallet') ?? '').trim();
        if (!isLikelySolanaAddress(wallet)) {
          return sendJson(res, { error: 'wallet required' }, 400);
        }
        const duration = q.get('duration') ?? 'all';
        return sendJson(
          res,
          await birdeyeWalletGet(`/wallet/v2/pnl/summary?wallet=${wallet}&duration=${encodeURIComponent(duration)}`),
        );
      }

      // Everything below requires a mint in the path: /api/birdeye/<op>/<mint>
      const match = path.match(/^\/api\/birdeye\/(overview|price|holders|trades)\/(.+)$/);
      if (match) {
        const [, op, mint] = match;
        if (op === 'overview') return sendJson(res, await birdeyeTokenOverview(mint));
        if (op === 'price')    return sendJson(res, await birdeyePrice(mint));
        if (op === 'holders')  return sendJson(res, {
          items: await birdeyeHolders(mint, Number(q.get('limit')) || 20, Number(q.get('offset')) || 0),
        });
        if (op === 'trades')   return sendJson(res, {
          items: await birdeyeTokenTrades(mint, {
            limit: Number(q.get('limit')) || 20,
            offset: Number(q.get('offset')) || 0,
          }),
        });
      }

      if (path === '/api/birdeye/multi-price') {
        const mints = (q.get('mints') ?? '').split(',').map(s => s.trim()).filter(Boolean);
        if (!mints.length) return sendJson(res, { error: 'mints query param required (comma-separated)' }, 400);
        return sendJson(res, await birdeyeMultiPrice(mints) ?? {});
      }

      return sendJson(res, { error: 'unknown birdeye endpoint' }, 404);
    } catch (e) {
      return sendJson(res, { error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  // ── SolanaTracker REST proxy ───────────────────────────────────────
  if (path.startsWith('/api/tracker/')) {
    if (!trackerConfigured) return sendJson(res, { error: 'SOLANA_TRACKER_API_KEY not configured' }, 503);
    const q = url.searchParams;

    try {
      if (path === '/api/tracker/search') {
        const query = q.get('q') ?? q.get('query') ?? '';
        if (!query) return sendJson(res, { error: 'q (query) required' }, 400);
        return sendJson(res, { items: await trackerSearch(query, Number(q.get('limit')) || 20) });
      }

      if (path === '/api/tracker/trending') {
        type TF = Parameters<typeof trackerTrending>[0];
        const tf = (q.get('timeframe') as TF) ?? '1h';
        return sendJson(res, { items: await trackerTrending(tf) });
      }

      if (path === '/api/tracker/latest') {
        return sendJson(res, { items: await trackerLatest(Number(q.get('page')) || 1) });
      }

      if (path.startsWith('/api/tracker/volume/')) {
        const tf = path.replace('/api/tracker/volume/', '') as '1h' | '24h' | '7d';
        return sendJson(res, { items: await trackerVolumeLeaders(tf) });
      }

      // /api/tracker/<op>/<mint>
      const match = path.match(/^\/api\/tracker\/(token|ath|holders|pnl|chart)\/(.+)$/);
      if (match) {
        const [, op, mint] = match;
        if (op === 'token')   return sendJson(res, await trackerToken(mint));
        if (op === 'ath')     return sendJson(res, await trackerAth(mint));
        if (op === 'holders') return sendJson(res, { items: await trackerTopHolders(mint) });
        if (op === 'pnl')     return sendJson(res, await trackerPnl(mint));
        if (op === 'chart') {
          type TType = NonNullable<Parameters<typeof trackerChart>[1]>['type'];
          return sendJson(res, await trackerChart(mint, {
            type: (q.get('type') as TType) ?? '5m',
            time_from: q.get('from') ? Number(q.get('from')) : undefined,
            time_to:   q.get('to')   ? Number(q.get('to'))   : undefined,
          }));
        }
      }

      return sendJson(res, { error: 'unknown tracker endpoint' }, 404);
    } catch (e) {
      return sendJson(res, { error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  // ── Jupiter REST proxy ─────────────────────────────────────────────
  if (path.startsWith('/api/jupiter/')) {
    const q = url.searchParams;
    try {
      // Price v2 — legacy
      if (path === '/api/jupiter/price') {
        const ids = q.get('ids') ?? q.get('mints');
        if (!ids) return sendJson(res, { error: 'ids query param required' }, 400);
        return sendJson(res, await getJupiterPrice(ids.split(',').map(s => s.trim())));
      }

      // Price v3 — heuristics-validated USD prices
      if (path === '/api/jupiter/price/v3') {
        const ids = q.get('ids') ?? q.get('mints');
        if (!ids) return sendJson(res, { error: 'ids query param required' }, 400);
        return sendJson(res, await getJupiterPriceV3(ids.split(',').map(s => s.trim())));
      }

      // Swap quote — GET /api/jupiter/quote?inputMint=&outputMint=&amount=
      if (path === '/api/jupiter/quote') {
        const inputMint  = q.get('inputMint')  ?? '';
        const outputMint = q.get('outputMint') ?? '';
        const amount     = q.get('amount')     ?? '';
        if (!inputMint || !outputMint || !amount)
          return sendJson(res, { error: 'inputMint, outputMint, amount required' }, 400);
        return sendJson(res, await getJupiterQuote({
          inputMint,
          outputMint,
          amount,
          slippageBps: q.get('slippageBps') ? Number(q.get('slippageBps')) : undefined,
          swapMode: (q.get('swapMode') as 'ExactIn' | 'ExactOut' | null) ?? undefined,
        }));
      }

      // Build swap — POST /api/jupiter/swap { quoteResponse, userPublicKey }
      if (path === '/api/jupiter/swap' && req.method === 'POST') {
        const body = await readJsonBody(req);
        return sendJson(res, await buildJupiterSwap(body as Parameters<typeof buildJupiterSwap>[0]));
      }

      // Tokens v1 — legacy search/:mint
      if (path === '/api/jupiter/tokens/search/v1') {
        const query = q.get('q') ?? q.get('query') ?? '';
        return sendJson(res, { items: await searchJupiterToken(query, Number(q.get('limit')) || 10) });
      }
      const tokenV1Match = path.match(/^\/api\/jupiter\/tokens\/v1\/(.+)$/);
      if (tokenV1Match) return sendJson(res, (await getJupiterToken(tokenV1Match[1])) ?? { error: 'not found' }, 200);

      // Tokens v2
      if (path === '/api/jupiter/tokens/search') {
        const query = q.get('q') ?? q.get('query') ?? '';
        if (!query) return sendJson(res, { error: 'q (query) required' }, 400);
        return sendJson(res, { items: await jupTokensSearch(query, Number(q.get('limit')) || 20) });
      }
      if (path === '/api/jupiter/tokens/tag') {
        const tag = q.get('tag') ?? '';
        if (!tag) return sendJson(res, { error: 'tag required' }, 400);
        return sendJson(res, { items: await jupTokensTag(tag) });
      }
      if (path === '/api/jupiter/tokens/recent') {
        return sendJson(res, { items: await jupTokensRecent(Number(q.get('limit')) || 30) });
      }
      if (path === '/api/jupiter/tokens/content') {
        const ids = q.get('ids') ?? '';
        if (!ids) return sendJson(res, { error: 'ids required' }, 400);
        return sendJson(res, await jupTokensContent(ids.split(',').map(s => s.trim())));
      }
      if (path === '/api/jupiter/tokens/cooking') {
        return sendJson(res, await jupTokensCooking(Number(q.get('limit')) || 20));
      }
      const catMatch = path.match(/^\/api\/jupiter\/tokens\/category\/([^/]+)(?:\/([^/]+))?$/);
      if (catMatch) {
        const [, category, interval] = catMatch;
        type Interval = '5m' | '1h' | '6h' | '24h';
        return sendJson(res, {
          items: await jupTokensCategory(
            category,
            (interval as Interval) ?? '1h',
            Number(q.get('limit')) || 50,
          ),
        });
      }

      // Portfolio
      if (path === '/api/jupiter/portfolio/positions') {
        const wallet = q.get('wallet') ?? '';
        if (!wallet) return sendJson(res, { error: 'wallet required' }, 400);
        return sendJson(res, { items: await jupPortfolioPositions(wallet) });
      }
      if (path === '/api/jupiter/portfolio/staked-jup') {
        const wallet = q.get('wallet') ?? '';
        if (!wallet) return sendJson(res, { error: 'wallet required' }, 400);
        return sendJson(res, await jupPortfolioStakedJup(wallet));
      }
      if (path === '/api/jupiter/portfolio/platforms') {
        return sendJson(res, await jupPortfolioPlatforms());
      }
      const walletMatch = path.match(/^\/api\/jupiter\/portfolio\/wallet\/(.+)$/);
      if (walletMatch) return sendJson(res, await jupPortfolioWallet(walletMatch[1]));

      // Prediction Markets
      if (path === '/api/jupiter/prediction/events') {
        return sendJson(res, {
          items: await jupPredictionEvents({
            status: (q.get('status') as 'active' | 'closed' | 'resolved' | null) ?? 'active',
            category: q.get('category') ?? undefined,
            tags: q.get('tags') ?? undefined,
            limit: Number(q.get('limit')) || 20,
            offset: Number(q.get('offset')) || 0,
          }),
        });
      }
      if (path === '/api/jupiter/prediction/events/search') {
        const query = q.get('q') ?? q.get('query') ?? '';
        if (!query) return sendJson(res, { error: 'q (query) required' }, 400);
        return sendJson(res, { items: await jupPredictionEventSearch(query, Number(q.get('limit')) || 20) });
      }
      const eventMatch = path.match(/^\/api\/jupiter\/prediction\/events\/([^/]+)$/);
      if (eventMatch) return sendJson(res, await jupPredictionEvent(eventMatch[1]));
      const marketMatch = path.match(/^\/api\/jupiter\/prediction\/markets\/([^/]+)$/);
      if (marketMatch) return sendJson(res, await jupPredictionMarket(marketMatch[1]));
      const obMatch = path.match(/^\/api\/jupiter\/prediction\/orderbook\/([^/]+)$/);
      if (obMatch) return sendJson(res, await jupPredictionOrderbook(obMatch[1]));
      if (path === '/api/jupiter/prediction/positions') {
        const ownerPubkey = q.get('ownerPubkey') ?? '';
        if (!ownerPubkey) return sendJson(res, { error: 'ownerPubkey required' }, 400);
        return sendJson(res, {
          items: await jupPredictionPositions({
            ownerPubkey,
            marketId: q.get('marketId') ?? undefined,
            status: (q.get('status') as 'open' | 'closed' | null) ?? undefined,
            limit: Number(q.get('limit')) || 50,
          }),
        });
      }
      const profileMatch = path.match(/^\/api\/jupiter\/prediction\/profiles\/([^/]+)$/);
      if (profileMatch) return sendJson(res, await jupPredictionProfile(profileMatch[1]));
      if (path === '/api/jupiter/prediction/leaderboards') {
        return sendJson(res, await jupPredictionLeaderboards({
          metric: (q.get('metric') as 'volume' | 'pnl' | 'winrate' | null) ?? undefined,
          interval: (q.get('interval') as '24h' | '7d' | '30d' | 'all' | null) ?? undefined,
          limit: Number(q.get('limit')) || 50,
        }));
      }
      if (path === '/api/jupiter/prediction/trades') {
        return sendJson(res, await jupPredictionTrades({
          marketId: q.get('marketId') ?? undefined,
          ownerPubkey: q.get('ownerPubkey') ?? undefined,
          limit: Number(q.get('limit')) || 50,
        }));
      }

      return sendJson(res, { error: 'unknown jupiter endpoint' }, 404);
    } catch (e) {
      return sendJson(res, { error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  // ── Helius webhook (enhanced transactions) ─────────────────────────
  if (path === '/webhook/helius' && req.method === 'POST') {
    const auth = req.headers.authorization;
    if (!verifyHeliusAuth(Array.isArray(auth) ? auth[0] : auth)) {
      return sendJson(res, { error: 'unauthorized' }, 401);
    }
    try {
      const body = await readJsonBody(req);
      // Helius sends either an array of enhanced txs, or a signatures-only
      // payload we can round-trip through the Parse API.
      let txs: HeliusEnhancedTx[];
      if (Array.isArray(body)) {
        txs = body as HeliusEnhancedTx[];
      } else if (body && typeof body === 'object' && 'transactions' in body) {
        txs = (body as { transactions: HeliusEnhancedTx[] }).transactions ?? [];
      } else if (body && typeof body === 'object' && 'signatures' in body) {
        txs = await heliusParseTransactions((body as { signatures: string[] }).signatures ?? []);
      } else {
        txs = [];
      }

      if (txs.length) {
        const event: HeliusWebhookEvent = {
          type: 'helius-webhook',
          ts: Date.now(),
          source: 'helius',
          transactions: txs.map(summarizeHeliusTx),
        };
        recentHeliusEvents.push(event);
        if (recentHeliusEvents.length > MAX_RECENT) recentHeliusEvents.shift();
        broadcast(event);
      }

      return sendJson(res, { ok: true, received: txs.length });
    } catch (e) {
      return sendJson(res, { error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  // ── dFlow DEX + Prediction Markets proxy ───────────────────────────
  if (path.startsWith('/api/dflow/')) {
    const q = url.searchParams;
    try {
      if (path === '/api/dflow/quote') {
        const inputMint  = q.get('inputMint')  ?? '';
        const outputMint = q.get('outputMint') ?? '';
        const amount     = Number(q.get('amount') ?? 0);
        if (!inputMint || !outputMint || !amount) {
          return sendJson(res, { error: 'inputMint, outputMint, amount required' }, 400);
        }
        const slippage = q.get('slippageBps');
        return sendJson(res, await dflowQuote({
          inputMint,
          outputMint,
          amount,
          slippageBps: slippage === 'auto' || !slippage ? 'auto' : Number(slippage),
        }));
      }

      if (path === '/api/dflow/order' && req.method === 'POST') {
        const body = (await readJsonBody(req)) as Parameters<typeof dflowOrder>[0];
        return sendJson(res, await dflowOrder(body));
      }

      if (path === '/api/dflow/order-status') {
        const sig = q.get('signature') ?? '';
        if (!sig) return sendJson(res, { error: 'signature required' }, 400);
        const lvbh = q.get('lastValidBlockHeight');
        return sendJson(res, await dflowOrderStatus(sig, lvbh ? Number(lvbh) : undefined));
      }

      if (path === '/api/dflow/categories') {
        return sendJson(res, { items: await dflowCategories() });
      }

      if (path === '/api/dflow/series') {
        return sendJson(res, {
          items: await dflowSeries({
            category: q.get('category') ?? undefined,
            tags:     q.get('tags')     ?? undefined,
          }),
        });
      }

      if (path === '/api/dflow/events') {
        return sendJson(res, {
          items: await dflowEvents({
            seriesTickers: q.get('seriesTickers') ?? undefined,
            category:      q.get('category')      ?? undefined,
            tags:          q.get('tags')          ?? undefined,
            status:        (q.get('status') as 'active' | 'closed' | null) ?? 'active',
            limit:         Number(q.get('limit')) || 20,
          }),
        });
      }

      const marketMatch = path.match(/^\/api\/dflow\/market\/(.+)$/);
      if (marketMatch) return sendJson(res, await dflowMarketByMint(marketMatch[1]));

      return sendJson(res, { error: 'unknown dflow endpoint' }, 404);
    } catch (e) {
      return sendJson(res, { error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  // ── Grok-as-CLAWD analyzer ─────────────────────────────────────────
  const analyzeMatch = path.match(/^\/api\/analyze\/(.+)$/);
  if (analyzeMatch) {
    if (!analyzerConfigured) return sendJson(res, { error: 'XAI_API_KEY not configured' }, 503);
    try {
      const mint = analyzeMatch[1];
      const result = await analyzeToken(mint);
      return sendJson(res, result);
    } catch (e) {
      return sendJson(res, { error: e instanceof Error ? e.message : String(e) }, 500);
    }
  }

  // Serve the HTML page
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(indexHtml);
});

// ── WebSocket server (relay to browsers) ────────────────────────────
const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

// Track recent events for new clients
const recentLaunches: TokenLaunchEvent[] = [];
const recentClaims: FeeClaimEvent[] = [];
const recentEnriched: TokenEnrichedEvent[] = [];
const recentHeliusEvents: HeliusWebhookEvent[] = [];
let latestPrediction: JupiterPredictionSnapshot | null = null;
let latestPriceTick: JupiterPriceTick | null = null;
const MAX_RECENT = 50;

wss.on('connection', (client, req) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(`[relay] Client connected (${wss.clients.size} total) from ${ip}`);

  // Send current status
  sendTo(client, makeStatus());

  // Send recent launches so the page isn't empty
  for (const launch of recentLaunches) {
    sendTo(client, launch);
  }

  // Send recent claims
  for (const claim of recentClaims) {
    sendTo(client, claim);
  }

  // Send recent enrichment events so the UI can merge BirdEye data on reconnect
  for (const enriched of recentEnriched) {
    sendTo(client, enriched);
  }

  // Replay last Jupiter snapshots so a fresh client has instant data
  if (latestPriceTick) sendTo(client, latestPriceTick);
  if (latestPrediction) sendTo(client, latestPrediction);

  // Replay recent Helius webhook events
  for (const ev of recentHeliusEvents) {
    sendTo(client, ev);
  }

  client.on('close', () => {
    console.log(`[relay] Client disconnected (${wss.clients.size} total)`);
  });

  client.on('error', (err) => {
    console.error('[relay] Client error:', err.message);
  });
});

// ── Broadcast helpers ───────────────────────────────────────────────
function broadcast(msg: RelayMessage): void {
  const data = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

function sendTo(client: WebSocket, msg: RelayMessage): void {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(msg));
  }
}

function makeStatus(): ServerStatus {
  return {
    type: 'status',
    connected: monitor.connected,
    uptime: Math.floor(process.uptime()),
    totalLaunches: monitor.stats.totalLaunches,
    githubLaunches: monitor.stats.githubLaunches,
    totalClaims: claimMonitor?.stats.totalClaims ?? 0,
    clients: wss.clients.size,
  };
}

// ── Solana Monitor (upstream) ───────────────────────────────────────
const enrichInFlight = new Set<string>();

async function enrichLaunch(event: TokenLaunchEvent): Promise<void> {
  if (!event.mint || enrichInFlight.has(event.mint)) return;
  enrichInFlight.add(event.mint);
  try {
    const o = await birdeyeTokenOverview(event.mint);
    if (!o) return;
    const enriched: TokenEnrichedEvent = {
      type: 'token-enriched',
      mint: event.mint,
      signature: event.signature,
      priceUsd:          o.price ?? null,
      priceChange24hPct: o.priceChange24hPercent ?? null,
      marketCapUsd:      o.mc ?? null,
      liquidityUsd:      o.liquidity ?? null,
      volume24hUsd:      o.v24hUSD ?? null,
      holders:           o.holder ?? null,
      uniqueWallet24h:   o.uniqueWallet24h ?? null,
      trade24h:          o.trade24h ?? null,
      buy24h:            o.buy24h ?? null,
      sell24h:           o.sell24h ?? null,
      logoUri:           o.logoURI ?? null,
      source: 'birdeye',
      ts: Date.now(),
    };
    recentEnriched.push(enriched);
    if (recentEnriched.length > MAX_RECENT) recentEnriched.shift();
    broadcast(enriched);
  } finally {
    enrichInFlight.delete(event.mint);
  }
}

const monitor = new SolanaMonitor(
  SOLANA_RPC_WS,
  // On token launch — broadcast to all clients
  (event: TokenLaunchEvent) => {
    // Store in recent buffer
    const existing = recentLaunches.findIndex(e => e.signature === event.signature);
    if (existing >= 0) {
      recentLaunches[existing] = event; // update enriched version
    } else {
      recentLaunches.push(event);
      if (recentLaunches.length > MAX_RECENT) recentLaunches.shift();
    }
    broadcast(event);

    // BirdEye enrichment runs in background; broadcasts a separate event when done.
    if (ENRICH_LAUNCHES && event.mint) {
      void enrichLaunch(event);
    }
  },
  // On status change
  (connected: boolean) => {
    console.log(`[relay] Solana ${connected ? 'connected' : 'disconnected'}`);
    broadcast(makeStatus());
  },
);

// ── $CLAWD Buy Bot ──────────────────────────────────────────────────
// Watches the $CLAWD mint over Helius WS and posts Telegram alerts on
// detected buys. Opt-in via CLAWD_BUY_BOT_ENABLED=true — factory
// returns null and logs the missing prereq when env is incomplete.
const clawdBuyBot = createClawdBuyBotFromEnv((event: ClawdBuyEvent) => {
  // Relay buys to connected browser clients too.
  broadcast({ type: 'clawd_buy', ...event } as unknown as RelayMessage);
});
if (clawdBuyBot) {
  clawdBuyBot.start();
  console.log('[relay] CLAWD buy bot started');
}

// ── Heartbeat (keeps connections alive through proxies) ─────────────
setInterval(() => {
  const hb: Heartbeat = { type: 'heartbeat', ts: Date.now() };
  broadcast(hb);
}, HEARTBEAT_INTERVAL);

// ── Periodic status broadcast ───────────────────────────────────────
setInterval(() => {
  broadcast(makeStatus());
}, STATUS_INTERVAL);

// ── Jupiter prediction-market + price broadcast ─────────────────────
const PRICE_BASKET = (process.env.JUPITER_PRICE_BASKET ||
  'So11111111111111111111111111111111111111112,' +               // SOL
  'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN,'  +               // JUP
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'                 // USDC
).split(',').map(s => s.trim()).filter(Boolean);

async function broadcastPriceTick(): Promise<void> {
  try {
    const data = await getJupiterPriceV3(PRICE_BASKET);
    const tick: JupiterPriceTick = {
      type: 'jupiter-price',
      ts: Date.now(),
      prices: Object.fromEntries(
        Object.entries(data).map(([mint, v]) => [mint, {
          usdPrice: v.usdPrice,
          priceChange24h: v.priceChange24h ?? null,
        }]),
      ),
    };
    latestPriceTick = tick;
    broadcast(tick);
  } catch (e) {
    console.error('[jupiter] price tick failed:', e instanceof Error ? e.message : e);
  }
}

async function broadcastPredictionSnapshot(): Promise<void> {
  try {
    const events = await jupPredictionEvents({ status: 'active', limit: 20 });
    const snap: JupiterPredictionSnapshot = {
      type: 'jupiter-prediction',
      ts: Date.now(),
      events: events.map((e: JupPredictionEvent) => {
        const markets = e.markets ?? [];
        const top = markets.sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))[0];
        return {
          id: e.id,
          title: e.title,
          category: e.category ?? null,
          status: e.status,
          volume: e.volume ?? null,
          openInterest: e.openInterest ?? null,
          closeTime: e.closeTime ?? null,
          topMarket: top ? {
            id: top.id,
            title: top.title,
            yesPrice: top.yesPrice ?? top.yesAsk ?? null,
            noPrice:  top.noPrice  ?? top.noAsk  ?? null,
            volume:   top.volume   ?? null,
          } : null,
        };
      }),
    };
    latestPrediction = snap;
    broadcast(snap);
  } catch (e) {
    console.error('[jupiter] prediction snapshot failed:', e instanceof Error ? e.message : e);
  }
}

if (ENABLE_PREDICTION_STREAM) {
  // First shot shortly after boot, then on interval
  setTimeout(() => { void broadcastPriceTick(); void broadcastPredictionSnapshot(); }, 3_000);
  setInterval(() => { void broadcastPriceTick(); }, Math.min(PREDICTION_BROADCAST_INTERVAL, 30_000));
  setInterval(() => { void broadcastPredictionSnapshot(); }, PREDICTION_BROADCAST_INTERVAL);
}

// ── Claim Monitor (on-chain fee claim detection) ────────────────────
let claimMonitor: ClaimMonitor | null = null;

if (ENABLE_CLAIMS) {
  claimMonitor = new ClaimMonitor(
    SOLANA_RPC_HTTP,
    SOLANA_RPC_WS !== 'wss://api.mainnet-beta.solana.com' ? SOLANA_RPC_WS : undefined,
    CLAIM_POLL_INTERVAL,
    (event: FeeClaimEvent) => {
      recentClaims.push(event);
      if (recentClaims.length > MAX_RECENT) recentClaims.shift();
      broadcast(event);
    },
    (connected: boolean) => {
      console.log(`[relay] Claims ${connected ? 'connected' : 'disconnected'}`);
      broadcast(makeStatus());
    },
  );
}

// ── Start ───────────────────────────────────────────────────────────
monitor.start();
claimMonitor?.start();

httpServer.listen(PORT, () => {
  console.log(`[relay] PumpFun WebSocket Relay running on http://0.0.0.0:${PORT}`);
  console.log(`[relay] WebSocket endpoint: ws://0.0.0.0:${PORT}/ws`);
  console.log(`[relay] Upstream Solana RPC: ${SOLANA_RPC_WS}`);
  console.log(`[relay] Claims monitor: ${ENABLE_CLAIMS ? 'enabled' : 'disabled'}`);
  console.log(`[relay] Jupiter API: ${jupiterConfigured ? 'keyed' : 'keyless'} | prediction stream: ${ENABLE_PREDICTION_STREAM ? 'on' : 'off'}`);
  console.log(`[relay] dFlow: ${dflowConfigured ? 'keyed' : 'keyless'} (DEX + Kalshi prediction markets)`);
  console.log(`[relay] Helius: ${heliusConfigured ? 'keyed' : 'keyless'} | webhook: ${heliusWebhookEnabled ? 'secured' : 'OPEN'} at /webhook/helius`);
});

// ── Graceful shutdown ───────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('[relay] SIGTERM — shutting down');
  monitor.stop();
  claimMonitor?.stop();
  wss.close();
  httpServer.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[relay] SIGINT — shutting down');
  monitor.stop();
  claimMonitor?.stop();
  wss.close();
  httpServer.close();
  process.exit(0);
});
