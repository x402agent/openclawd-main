/**
 * gatewayEvents — Convex functions for storing gateway events.
 *
 * The Go gateway pushes events here so the hub can display
 * real-time gateway activity, agent sessions, and DEX terminal data.
 */
import { v } from 'convex/values'
import { api } from './_generated/api'
import { mutation, query } from './_generated/server'
import { httpAction } from './functions'
import { corsHeaders, mergeHeaders } from './lib/httpHeaders'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: mergeHeaders(corsHeaders(), { 'Content-Type': 'application/json' }),
  })
}

function options(methods: string) {
  return new Response(null, {
    status: 204,
    headers: mergeHeaders(corsHeaders(), {
      'Access-Control-Allow-Methods': methods,
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }),
  })
}

// ── Mutation: Store a gateway event ──────────────────────────────

export const ingestEvent = mutation({
  args: {
    kind: v.string(),
    source: v.string(),
    agentId: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    nodeId: v.optional(v.string()),
    method: v.optional(v.string()),
    payload: v.optional(v.any()),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('gatewayEvents', {
      ...args,
      createdAt: Date.now(),
    })
    return { id }
  },
})

// ── Mutation: Store a DEX price snapshot ─────────────────────────

export const ingestPriceSnapshot = mutation({
  args: {
    tokens: v.array(
      v.object({
        address: v.string(),
        symbol: v.string(),
        name: v.string(),
        price: v.number(),
        priceChange24h: v.optional(v.number()),
        marketCap: v.optional(v.number()),
        liquidity: v.optional(v.number()),
        volume24h: v.optional(v.number()),
      }),
    ),
    source: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert('dexPriceSnapshots', {
      tokens: args.tokens,
      source: args.source,
      tokenCount: args.tokens.length,
      timestamp: args.timestamp,
      createdAt: Date.now(),
    })
    return { id, tokenCount: args.tokens.length }
  },
})

// ── Query: Latest gateway events ─────────────────────────────────

export const latestEvents = query({
  args: {
    limit: v.optional(v.number()),
    kind: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 200)
    let q = ctx.db
      .query('gatewayEvents')
      .withIndex('by_timestamp')
      .order('desc')

    const results = await q.take(limit)

    if (args.kind) {
      return results.filter((e) => e.kind === args.kind)
    }
    return results
  },
})

// ── Query: Latest price snapshot ─────────────────────────────────

export const latestPriceSnapshot = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db
      .query('dexPriceSnapshots')
      .withIndex('by_timestamp')
      .order('desc')
      .first()
  },
})

// ── Query: Price history for a token ─────────────────────────────

export const priceHistory = query({
  args: {
    address: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 100, 500)
    const snapshots = await ctx.db
      .query('dexPriceSnapshots')
      .withIndex('by_timestamp')
      .order('desc')
      .take(limit)

    return snapshots
      .map((s) => {
        const token = s.tokens.find((t) => t.address === args.address)
        if (!token) return null
        return {
          price: token.price,
          priceChange24h: token.priceChange24h,
          timestamp: s.timestamp,
        }
      })
      .filter(Boolean)
  },
})

// ── HTTP: Gateway event ingest ───────────────────────────────────

export const gatewayEventHttp = httpAction(async (ctx, request) => {
  if (request.method === 'OPTIONS') return options('POST, OPTIONS')
  if (request.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  let body: any
  try {
    body = await request.json()
  } catch {
    return json({ error: 'invalid JSON' }, 400)
  }

  if (body.kind === 'price_snapshot' && Array.isArray(body.tokens)) {
    const id = await ctx.runMutation(api.gatewayEvents.ingestPriceSnapshot, {
      tokens: body.tokens.slice(0, 100),
      source: body.source || 'gateway',
      timestamp: body.timestamp || Date.now(),
    })
    return json({ status: 'ok', ...id })
  }

  const result = await ctx.runMutation(api.gatewayEvents.ingestEvent, {
    kind: body.kind || 'unknown',
    source: body.source || 'gateway',
    agentId: body.agentId,
    sessionId: body.sessionId,
    nodeId: body.nodeId,
    method: body.method,
    payload: body.payload,
    timestamp: body.timestamp || Date.now(),
  })

  return json({ status: 'ok', ...result })
})

// ── HTTP: Get latest events ──────────────────────────────────────

export const gatewayEventsGetHttp = httpAction(async (ctx, request) => {
  if (request.method === 'OPTIONS') return options('GET, OPTIONS')
  if (request.method !== 'GET') return json({ error: 'method not allowed' }, 405)

  const url = new URL(request.url)
  const kind = url.searchParams.get('kind') || undefined
  const limit = parseInt(url.searchParams.get('limit') ?? '50') || 50

  const events = await ctx.runQuery(api.gatewayEvents.latestEvents, { limit, kind })

  return new Response(JSON.stringify({ events }), {
    status: 200,
    headers: mergeHeaders(corsHeaders(), {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=5',
    }),
  })
})
