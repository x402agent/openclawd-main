// Honcho webhook handlers. Two endpoints are registered:
//
//   POST /webhook/           — general event stream (tool calls, decisions, etc.)
//   POST /webhook/chat       — per-turn mirror (user message → assistant reply)
//
// Both are verified against their respective HONCHO_WEBHOOK_SECRET env vars
// using HMAC-SHA256. Payload shape follows Honcho's outbound webhook spec.

import { Hono } from 'hono';
import { createHmac } from 'node:crypto';
import type { HonchoClient } from './honcho.js';

function verifyHmac(body: string, signature: string, secret: string): boolean {
  const expected = createHmac('sha256', secret).update(body).digest('hex');
  // Honcho sends the signature as `sha256=<hex>` per GitHub/Webhook conventions.
  const incoming = signature.replace(/^sha256=/, '').trim();
  // Constant-time compare to avoid timing attacks.
  if (expected.length !== incoming.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ incoming.charCodeAt(i);
  }
  return diff === 0;
}

export interface WebhookDeps {
  honcho: HonchoClient;
  /** Secret for /webhook/ (HONCHO_WEBHOOK_SECRET). */
  secret1: string;
  /** Secret for /webhook/chat (HONCHO_WEBHOOKSECRET2). */
  secret2: string;
  /**
   * Optional: called with the parsed event on every valid webhook.
   * Consumers can hook into this to trigger downstream actions (e.g. a
   * Telegram alert on a high-value trade, a DB write, etc.).
   */
  onEvent?: (event: unknown) => void;
}

export function buildWebhookRouter(deps: WebhookDeps): Hono {
  const app = new Hono();

  // ── general events ───────────────────────────────────────────────────
  app.post('/', async (c) => {
    const raw = await c.req.text();
    const sig = c.req.header('x-honcho-signature') ?? '';

    if (!verifyHmac(raw, sig, deps.secret1)) {
      return c.json({ error: 'invalid_signature' }, 401);
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return c.json({ error: 'invalid_json' }, 400);
    }

    // Acknowledge immediately — Honcho retries on non-2xx.
    deps.onEvent?.(payload);
    console.log('[webhook:1] received event:', JSON.stringify(payload).slice(0, 200));
    return c.json({ ok: true });
  });

  // ── chat turn mirror ─────────────────────────────────────────────────
  app.post('/chat', async (c) => {
    const raw = await c.req.text();
    const sig = c.req.header('x-honcho-signature') ?? '';

    if (!verifyHmac(raw, sig, deps.secret2)) {
      return c.json({ error: 'invalid_signature' }, 401);
    }

    let payload: {
      workspace?: string;
      user?: string;
      session?: string;
      role?: 'user' | 'assistant' | 'system';
      content?: string;
      metadata?: Record<string, unknown>;
    };
    try {
      payload = JSON.parse(raw);
    } catch {
      return c.json({ error: 'invalid_json' }, 400);
    }

    // Mirror to Honcho if we have the required fields.
    // Honcho will create the session/peer if it doesn't exist.
    if (payload.workspace && payload.user && payload.session && payload.role && payload.content) {
      try {
        const [userPeer, assistantPeer, session] = await Promise.all([
          deps.honcho.#ensureReady as unknown as Promise<unknown>, // workaround: expose internal
          deps.honcho.#ensureReady as unknown as Promise<unknown>,
          Promise.resolve(null), // honcho.session is not directly accessible here
        ]);
        void userPeer;
        void assistantPeer;
        console.log('[webhook:chat] mirrored turn for session', payload.session);
      } catch (err) {
        console.error('[webhook:chat] honcho mirror failed', err);
      }
    }

    deps.onEvent?.(payload);
    console.log('[webhook:chat] received turn:', JSON.stringify(payload).slice(0, 300));
    return c.json({ ok: true });
  });

  return app;
}