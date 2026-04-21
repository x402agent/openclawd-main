import type { Context } from '@netlify/functions'

/**
 * Honcho Webhook — receives memory events, conclusions, dreams, and trade records.
 * Validates HONCHO_WEBHOOK_SECRET from env via X-Webhook-Secret or Authorization header.
 *
 * Endpoints:
 *   POST /webhook/       — General Honcho events (conclusions, dreams, memory)
 *   POST /webhook/chat   — Chat completion / memory-enriched events
 */

function getWebhookSecret(): string {
  return (process.env.HONCHO_WEBHOOK_SECRET ?? '').trim()
}

function validateSecret(req: Request): boolean {
  const expected = getWebhookSecret()
  if (!expected) return true // no secret configured = accept all

  const fromHeader = req.headers.get('X-Webhook-Secret')?.trim()
  if (fromHeader === expected) return true

  const auth = req.headers.get('Authorization')?.trim()
  if (auth) {
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : auth
    if (token === expected) return true
  }

  return false
}

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Secret',
}

export default async (req: Request, context: Context) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  if (!validateSecret(req)) {
    console.warn('[WEBHOOK] Rejected: invalid secret')
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    })
  }

  let body: string
  let event: { type?: string; peer_id?: string; session_id?: string; data?: Record<string, unknown> }
  try {
    body = await req.text()
    event = JSON.parse(body)
  } catch {
    event = { type: 'raw' }
    body = ''
  }

  const url = new URL(req.url)
  const subPath = url.pathname.replace(/^\/webhook\/?/, '') || 'general'

  console.log(
    `[WEBHOOK] ${subPath} type=${event.type ?? 'unknown'} peer=${event.peer_id ?? '-'} session=${event.session_id ?? '-'} (${body.length} bytes)`,
  )

  // Route by sub-path for specific handling
  if (subPath === 'chat' || subPath.startsWith('chat')) {
    console.log(`[WEBHOOK-CHAT] ${event.type}: ${body.slice(0, 300)}`)

    // Forward to Convex if configured for persistent storage
    const convexUrl = process.env.VITE_CONVEX_URL?.trim()
    if (convexUrl) {
      try {
        await fetch(`${convexUrl.replace(/\/$/, '')}/api/mutation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: 'gatewayEvents:ingestWebhookEvent',
            args: {
              source: 'honcho',
              eventType: event.type ?? 'chat',
              payload: body,
              receivedAt: new Date().toISOString(),
            },
          }),
        }).catch(() => {})
      } catch {
        // Non-blocking — Convex ingest is best-effort
      }
    }
  } else {
    console.log(`[WEBHOOK] ${event.type}: ${body.slice(0, 300)}`)
  }

  return new Response(
    JSON.stringify({
      status: 'ok',
      received: event.type ?? 'unknown',
      path: url.pathname,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
    },
  )
}

export const config = {
  path: ['/webhook', '/webhook/*'],
  method: ['POST', 'OPTIONS'],
}
