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
  if (!secret) return false;
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
      console.warn('[webhook:1] invalid signature');
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
      console.warn('[webhook:chat] invalid signature');
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
    if (payload.workspace && payload.user && payload.session && payload.role && payload.content) {
      // Derive privySub from Honcho's user field (workspace:user format).
      const parts = payload.user.split(':');
      const privySub = parts[parts.length - 1] ?? payload.user;

      await deps.honcho.warmup();

      // For user-role events, record as user message; for assistant role,
      // record as assistant message. Webhooks are typically one direction per event.
      if (payload.role === 'user' || payload.role === 'assistant') {
        // Strip agent key from session (e.g. "sandbox:sub:agent-key" → "agent-key")
        const sessionParts = payload.session.split(':');
        const agent = sessionParts[sessionParts.length - 1] ?? 'unknown';

        // If this is a user message, store it; assistant replies get paired in the
        // next user message handler. For now, record all as user messages with a
        // note in metadata so the caller can pair them.
        await deps.honcho.recordTurn({
          privySub,
          agent,
          userMessage: payload.role === 'user' ? payload.content : '',
          assistantMessage: payload.role === 'assistant' ? payload.content : '',
          model: payload.metadata?.model as string | undefined,
        });
      }
    }

    deps.onEvent?.(payload);
    console.log('[webhook:chat] received turn:', JSON.stringify(payload).slice(0, 300));
    return c.json({ ok: true });
  });

  return app;
}