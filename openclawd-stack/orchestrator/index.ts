import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { app as apiRoutes } from './routes.js';
import { buildWebhookRouter } from './webhooks.js';
import { HonchoClient } from './honcho.js';

// Prevent tsx from crashing the dev server on Honcho SDK's internal unhandled
// rejections (e.g. workspace not found 404). These rejections are handled
// internally by the SDK — tsx just sees the orphan promise and kills the
// process. Swallowing them here keeps the server alive.
process.on('unhandledRejection', (err) => {
  console.warn('[orchestrator] unhandled rejection — suppressed:', String(err));
});

const PORT = Number(process.env.ORCHESTRATOR_PORT ?? 8787);

const honcho = new HonchoClient({
  apiKey: process.env.HONCHO_API_KEY ?? '',
  baseUrl: process.env.HONCHO_URL ?? undefined,
  workspace: process.env.HONCHO_WORKSPACE_ID ?? undefined,
});

// Honcho warmup is deferred — #ensureReady is called lazily on first actual
// request so the server boots immediately even if Honcho workspace doesn't
// exist yet. Webhook handlers and route handlers all call #ensureReady via
// their respective honcho methods, so warmup happens on first use.

const webhookRouter = buildWebhookRouter({
  honcho,
  secret1: process.env.HONCHO_WEBHOOK_SECRET ?? '',
  secret2: process.env.HONCHO_WEBHOOKSECRET2 ?? '',
});

const root = new Hono();
root.get('/healthz', (c) => c.json({ ok: true, ts: Date.now() }));
root.route('/api', apiRoutes);
root.route('/webhook', webhookRouter);

serve({ fetch: root.fetch, port: PORT, hostname: '0.0.0.0' }, (info) => {
  console.log(`[orchestrator] listening on :${info.port}`);
  console.log(`[orchestrator] webhooks: /webhook (${process.env.HONCHO_WEBHOOK_URL1 ?? 'unconfigured'}), /webhook/chat (${process.env.HONCHO_WEBHOOK_URL2 ?? 'unconfigured'})`);
});
