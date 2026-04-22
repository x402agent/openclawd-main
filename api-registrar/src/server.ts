/**
 * API Registrar Server
 * 
 * Run: npx tsx src/server.ts
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import registerRoutes from './routes/register';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

// Health check
app.get('/health', (c) => c.json({ status: 'ok', service: 'api-registrar' }));

// API routes
app.route('/api/register', registerRoutes);

// Error handling
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// 404
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

const port = parseInt(process.env.PORT || '3001');

console.log(`🐾 API Registrar starting on port ${port}...`);

serve({
  fetch: app.fetch,
  port,
});

console.log(`✅ API Registrar running at http://localhost:${port}`);
