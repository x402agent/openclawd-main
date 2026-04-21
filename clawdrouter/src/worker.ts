/**
 * ClawdRouter — Cloudflare Worker entry
 *
 * OpenAI-compatible proxy that:
 *   1. Scores each request with the 15-dimension local scorer (<1ms)
 *   2. Routes to the best model per the configured profile (eco/auto/premium)
 *   3. Proxies to the upstream (OpenRouter by default)
 *   4. Writes a datapoint to the Cloudflare Analytics Engine `clawd` dataset
 *      AND pushes a live event to the `ClawdStats` Durable Object for realtime
 *      stats (`/v1/stats` snapshot + `/v1/stats/stream` WebSocket feed).
 */

import type { ChatCompletionRequest, RoutingProfile } from './types.js';
import { scoreRequest } from './router/scorer.js';
import { routeRequest } from './router/profiles.js';
import { estimateCostPerRequest, getModel } from './models/registry.js';
import { writeClawdEvent, type ClawdAnalyticsBindings } from './analytics/engine.js';
import type { RouteEvent } from './stats/durable-object.js';
import { fetchHistory } from './stats/history.js';
import {
  authenticateBearer,
  handleChallenge,
  handleKeysVerify,
  handleList,
  handleMint,
  handleRevoke,
  touchKey,
  type AuthedKey,
} from './auth/keys.js';
import { handleEnrollMint, handleEnrollRedeem } from './auth/enroll.js';
import {
  gateEnabled,
  isAdminWallet,
  verifyClawdHolding,
} from './auth/clawd-holding.js';

export { ClawdStats } from './stats/durable-object.js';

interface Env extends ClawdAnalyticsBindings {
  CLAWDROUTER_PROFILE: RoutingProfile;
  UPSTREAM_BASE_URL: string;
  OPENROUTER_API_KEY?: string;
  CLAWDROUTER_SITE_URL?: string;
  CLAWDROUTER_SITE_TITLE?: string;
  CLAWD_STATS: DurableObjectNamespace;
  CLAWD_DB: D1Database;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CF_ANALYTICS_TOKEN?: string;
  // $CLAWD gating knobs (see auth/clawd-holding.ts)
  CLAWD_TOKEN_ADDRESS?: string;
  HELIUS_RPC_URL?: string;
  SOLANA_RPC_URL?: string;
  CLAWD_MIN_BALANCE?: string;
  CLAWD_GATE_ENABLED?: string;
  CLAWD_ADMIN_WALLETS?: string;
  // ── Tunnel control-plane (fly.dev hub ↔ CF) ─────────────────
  CLAWDROUTER_HUB_SECRET?: string;
  CLAWDROUTER_TUNNEL_URL?: string;
  CLAWDROUTER_ENROLL_TTL_MS?: string;
}

const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization,x-solana-address',
  'access-control-max-age': '86400',
};

function withCors(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/health') {
      return withCors(Response.json({ ok: true, service: 'clawdrouter-worker' }));
    }

    if (request.method === 'GET' && url.pathname === '/v1/stats') {
      return handleStatsSnapshot(env);
    }

    if (request.method === 'GET' && url.pathname === '/v1/stats/stream') {
      return handleStatsStream(request, env);
    }

    if (request.method === 'GET' && url.pathname === '/v1/stats/history') {
      return handleStatsHistory(url, env);
    }

    if (request.method === 'POST' && url.pathname.endsWith('/chat/completions')) {
      return withCors(await handleChatCompletion(request, env, ctx));
    }

    // ── Wallet-signed API keys ───────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/v1/keys/challenge') {
      return withCors(await handleChallenge(request, env));
    }
    if (request.method === 'POST' && url.pathname === '/v1/keys/mint') {
      return withCors(await handleMint(request, env));
    }
    if (request.method === 'GET' && url.pathname === '/v1/keys') {
      return withCors(await handleList(url, env));
    }
    {
      const revokeMatch = url.pathname.match(/^\/v1\/keys\/([A-Za-z0-9]+)\/revoke$/);
      if (request.method === 'POST' && revokeMatch) {
        return withCors(await handleRevoke(request, env, revokeMatch[1]!));
      }
    }

    // Hub → CF key validation (shared-secret protected)
    if (request.method === 'POST' && url.pathname === '/v1/keys/verify') {
      return withCors(await handleKeysVerify(request, env));
    }

    // ── Enrollment flow ──────────────────────────────────────────
    if (request.method === 'POST' && url.pathname === '/v1/enroll/mint') {
      return withCors(await handleEnrollMint(request, env));
    }
    {
      const enrollMatch = url.pathname.match(/^\/v1\/enroll\/([A-Za-z0-9_-]+)$/);
      if (request.method === 'GET' && enrollMatch) {
        return withCors(await handleEnrollRedeem(request, env, enrollMatch[1]!));
      }
    }

    return withCors(new Response('Not found', { status: 404 }));
  },
} satisfies ExportedHandler<Env>;

function statsStub(env: Env): DurableObjectStub {
  return env.CLAWD_STATS.get(env.CLAWD_STATS.idFromName('global'));
}

async function handleStatsSnapshot(env: Env): Promise<Response> {
  const stub = statsStub(env);
  const res = await stub.fetch('https://do/snapshot');
  return withCors(new Response(res.body, { status: res.status, headers: res.headers }));
}

async function handleStatsHistory(url: URL, env: Env): Promise<Response> {
  try {
    const result = await fetchHistory(url, env);
    const res = Response.json(result);
    res.headers.set('cache-control', 'public, max-age=60');
    return withCors(res);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'unknown';
    const status = msg === 'missing_ae_credentials' ? 503 : 502;
    return withCors(Response.json({ error: msg }, { status }));
  }
}

function handleStatsStream(request: Request, env: Env): Promise<Response> | Response {
  if (request.headers.get('upgrade') !== 'websocket') {
    return withCors(new Response('Expected WebSocket', { status: 426 }));
  }
  const stub = statsStub(env);
  // Forward the original request (preserves sec-websocket-key and friends)
  // but rewrite the URL so the DO sees /stream.
  const doRequest = new Request('https://do/stream', request);
  return stub.fetch(doRequest);
}

async function handleChatCompletion(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
): Promise<Response> {
  const started = Date.now();
  const userAgent = request.headers.get('user-agent') ?? '';
  const authed: AuthedKey | null = await authenticateBearer(
    request.headers.get('authorization'),
    env,
  );

  // ── CLAWD holder gate ─────────────────────────────────────────────────
  // Inbound requests must carry a valid bearer API key minted by a $CLAWD
  // holder (see handleMint) OR the gate must be explicitly disabled. The
  // raw `x-solana-address` header is untrusted and alone is NOT sufficient.
  if (gateEnabled(env)) {
    if (!authed) {
      return Response.json(
        {
          error: 'holder_only',
          message:
            'ClawdRouter requires a bearer API key minted by a $CLAWD holder. See /v1/keys/challenge to mint one.',
        },
        { status: 401 },
      );
    }
    if (!isAdminWallet(env, authed.wallet)) {
      const holding = await verifyClawdHolding(authed.wallet, env);
      if (!holding.rpcOk) {
        return Response.json(
          { error: 'holder_check_unavailable', reason: holding.rpcError },
          { status: 503 },
        );
      }
      if (!holding.meetsMinimum) {
        return Response.json(
          {
            error: 'holder_only',
            message:
              'The wallet behind this key no longer holds the required $CLAWD balance.',
            wallet: authed.wallet,
            clawdBalance: holding.uiAmount,
          },
          { status: 403 },
        );
      }
    }
  }

  const walletAddress =
    authed?.wallet ?? request.headers.get('x-solana-address') ?? undefined;

  let body: ChatCompletionRequest;
  try {
    body = (await request.json()) as ChatCompletionRequest;
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }

  const routingStarted = Date.now();
  const scored = scoreRequest(body.messages ?? []);
  const profile = env.CLAWDROUTER_PROFILE ?? 'auto';
  const { model: routed, fallback } = routeRequest(scored, profile);
  const routingTimeMs = Date.now() - routingStarted;

  const upstreamBody = { ...body, model: routed.id };
  const upstreamUrl = `${env.UPSTREAM_BASE_URL.replace(/\/$/, '')}/chat/completions`;

  const headers = new Headers({ 'content-type': 'application/json' });
  if (env.OPENROUTER_API_KEY) headers.set('authorization', `Bearer ${env.OPENROUTER_API_KEY}`);
  if (env.CLAWDROUTER_SITE_URL) headers.set('http-referer', env.CLAWDROUTER_SITE_URL);
  if (env.CLAWDROUTER_SITE_TITLE) headers.set('x-title', env.CLAWDROUTER_SITE_TITLE);

  let upstream: Response;
  try {
    upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(upstreamBody),
    });
  } catch (err) {
    const event = buildRouteEvent({
      scored, routed, profile, fallback,
      requestedModel: body.model ?? 'clawdrouter/auto',
      inputTokens: 0, outputTokens: 0,
      latencyMs: Date.now() - started,
      status: 'upstream_error',
    });
    ctx.waitUntil(recordAndLog(env, event, {
      walletAddress, userAgent, routingTimeMs,
      totalScore: scored.totalScore,
      httpStatus: 502,
      errorCode: err instanceof Error ? err.message.slice(0, 120) : 'fetch_failed',
      keyId: authed?.id,
    }));
    return Response.json({ error: 'upstream_unreachable' }, { status: 502 });
  }

  if (upstreamBody.stream) {
    const [forwardBody, inspectBody] = upstream.body ? upstream.body.tee() : [null, null];
    ctx.waitUntil(
      inspectStreamUsage(inspectBody).then((usage) => {
        const event = buildRouteEvent({
          scored, routed, profile, fallback,
          requestedModel: body.model ?? 'clawdrouter/auto',
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
          latencyMs: Date.now() - started,
          status: upstream.ok ? 'ok' : 'upstream_error',
        });
        return recordAndLog(env, event, {
          walletAddress, userAgent, routingTimeMs,
          totalScore: scored.totalScore,
          httpStatus: upstream.status,
          keyId: authed?.id,
        });
      }),
    );
    return new Response(forwardBody, { status: upstream.status, headers: upstream.headers });
  }

  const text = await upstream.text();
  let inputTokens = 0;
  let outputTokens = 0;
  try {
    const parsed = JSON.parse(text) as { usage?: { prompt_tokens?: number; completion_tokens?: number } };
    inputTokens = parsed.usage?.prompt_tokens ?? 0;
    outputTokens = parsed.usage?.completion_tokens ?? 0;
  } catch {
    // non-JSON (error page) — token counts stay 0
  }

  const event = buildRouteEvent({
    scored, routed, profile, fallback,
    requestedModel: body.model ?? 'clawdrouter/auto',
    inputTokens, outputTokens,
    latencyMs: Date.now() - started,
    status: upstream.ok ? 'ok' : 'upstream_error',
  });
  ctx.waitUntil(recordAndLog(env, event, {
    walletAddress, userAgent, routingTimeMs,
    totalScore: scored.totalScore,
    httpStatus: upstream.status,
    keyId: authed?.id,
  }));

  return new Response(text, { status: upstream.status, headers: upstream.headers });
}

function buildRouteEvent(args: {
  scored: ReturnType<typeof scoreRequest>;
  routed: ReturnType<typeof routeRequest>['model'];
  profile: RoutingProfile;
  fallback: boolean;
  requestedModel: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  status: string;
}): RouteEvent {
  const costUsdc = estimateCostPerRequest(args.routed, args.inputTokens, args.outputTokens);
  const baseline = getModel('anthropic/claude-opus-4.6');
  const baselineCost = baseline
    ? estimateCostPerRequest(baseline, args.inputTokens, args.outputTokens)
    : costUsdc;
  return {
    t: Date.now(),
    tier: args.scored.tier,
    profile: args.profile,
    requestedModel: args.requestedModel,
    routedModel: args.routed.id,
    provider: args.routed.provider,
    inputTokens: args.inputTokens,
    outputTokens: args.outputTokens,
    costUsdc,
    savedUsdc: Math.max(0, baselineCost - costUsdc),
    latencyMs: args.latencyMs,
    fallback: args.fallback,
    status: args.status,
  };
}

async function recordAndLog(
  env: Env,
  event: RouteEvent,
  meta: {
    walletAddress?: string;
    userAgent: string;
    routingTimeMs: number;
    totalScore: number;
    httpStatus: number;
    errorCode?: string;
    keyId?: string;
  },
): Promise<void> {
  if (meta.keyId) {
    try {
      await touchKey(env, meta.keyId);
    } catch {
      // metering is best-effort
    }
  }
  writeClawdEvent(env.clawd, {
    walletAddress: meta.walletAddress,
    requestedModel: event.requestedModel,
    routedModel: event.routedModel,
    tier: event.tier,
    profile: event.profile,
    provider: event.provider,
    status: event.status as 'ok' | 'error' | 'payment_required' | 'upstream_error',
    errorCode: meta.errorCode ?? '',
    userAgent: meta.userAgent,
    inputTokens: event.inputTokens,
    outputTokens: event.outputTokens,
    costUsdc: event.costUsdc,
    savedUsdc: event.savedUsdc,
    latencyMs: event.latencyMs,
    routingTimeMs: meta.routingTimeMs,
    totalScore: meta.totalScore,
    fallback: event.fallback,
    httpStatus: meta.httpStatus,
  });

  try {
    await statsStub(env).fetch('https://do/record', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(event),
    });
  } catch {
    // DO write is best-effort — Analytics Engine already has the datapoint
  }
}

async function inspectStreamUsage(
  stream: ReadableStream<Uint8Array> | null,
): Promise<{ inputTokens: number; outputTokens: number }> {
  if (!stream) return { inputTokens: 0, outputTokens: 0 };
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let inputTokens = 0;
  let outputTokens = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split('\n\n');
      buffer = frames.pop() ?? '';
      for (const frame of frames) {
        const line = frame.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.slice(5).trim();
        if (payload === '[DONE]') continue;
        try {
          const parsed = JSON.parse(payload) as { usage?: { prompt_tokens?: number; completion_tokens?: number } };
          if (parsed.usage) {
            inputTokens = parsed.usage.prompt_tokens ?? inputTokens;
            outputTokens = parsed.usage.completion_tokens ?? outputTokens;
          }
        } catch {
          // skip non-JSON payloads
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  return { inputTokens, outputTokens };
}
