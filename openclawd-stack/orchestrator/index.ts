import 'dotenv/config';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { app as apiRoutes } from './routes.js';
import { buildWebhookRouter } from './webhooks.js';
import { HonchoClient } from './honcho.js';

const PORT = Number(process.env.ORCHESTRATOR_PORT ?? 8787);

const honcho = new HonchoClient({
  apiKey: process.env.HONCHO_API_KEY ?? '',
  baseUrl: process.env.HONCHO_URL,
  app: process.env.HONCHO_WORKSPACE_ID,
});

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
