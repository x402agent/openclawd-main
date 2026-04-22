/**
 * 🐾 OpenClawd API Registrar Server
 * 
 * Run: pnpm server
 * 
 * This service handles:
 * - X (Twitter) verification for wallet ownership
 * - API key generation for ClawdRouter
 * - ACP registry integration
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { secureHeaders } from 'hono/secure-headers';
import registerRoutes from './routes/register';
import { validateApiKey } from './lib/auth';

const app = new Hono();

// Security headers
app.use('*', secureHeaders({
  hsts: true,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// CORS
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'DELETE'],
  headers: ['Content-Type', 'Authorization'],
}));

// Request logging
app.use('*', logger());

// Rate limiting headers (X-RateLimit-*)
// Note: For production, use a Redis-based rate limiter

// Health check with service info
app.get('/health', (c) => c.json({ 
  status: 'ok', 
  service: 'openclawd-api-registrar',
  version: '1.0.0',
  ecosystem: 'OpenClawd',
  timestamp: new Date().toISOString(),
}));

// API info
app.get('/api', (c) => c.json({
  name: 'OpenClawd API Registrar',
  version: '1.0.0',
  description: 'X-verified API key registration for OpenClawd ecosystem',
  endpoints: {
    'POST /api/register/generate-code': 'Generate verification code for wallet',
    'POST /api/register/verify-tweet': 'Verify tweet and get API key',
    'GET /api/register/keys/:walletAddress': 'List API keys for wallet',
    'DELETE /api/register/keys/:keyId': 'Revoke an API key',
  },
  documentation: 'https://github.com/x402agent/openclawd',
  registry: 'https://github.com/x402agent/openclawd/tree/main/acp_registry',
  hub: {
    marketplace: 'https://hub.solanaclawd.com/marketplace',
    agents: 'https://hub.solanaclawd.com/agents',
    skills: 'https://hub.solanaclawd.com/skills',
    orchestrator: 'https://solanaclawd.com/api',
    clawdRouter: 'https://solanaclawd.com/router',
  },
}));

// Hub integration endpoint — returns registration status for a wallet
app.get('/api/hub/status/:walletAddress', async (c) => {
  const wallet = c.req.param('walletAddress');
  // Fetch from Convex database to check registration status
  try {
    const keys = await fetch(
      `${process.env.CLAWDHUB_API_URL || 'https://hub.solanaclawd.com'}/api/keys/${wallet}`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.CLAWDROUTER_INTERNAL_SECRET || ''}`,
        },
      },
    ).then(r => r.json()).catch(() => ({ keys: [] }));
    
    return c.json({
      wallet,
      registered: true,
      keyCount: keys.keys?.length ?? 0,
      hubUrl: 'https://hub.solanaclawd.com',
      ecosystem: 'OpenClawd',
      timestamp: new Date().toISOString(),
    });
  } catch {
    return c.json({
      wallet,
      registered: false,
      keyCount: 0,
      hubUrl: 'https://hub.solanaclawd.com',
      ecosystem: 'OpenClawd',
      message: 'Wallet not yet verified — visit https://hub.solanaclawd.com to get started',
      timestamp: new Date().toISOString(),
    });
  }
});

// Protected API routes (require API key)
app.use('/api/keys/*', validateApiKey);
app.use('/api/stats/*', validateApiKey);

// API routes
app.route('/api/register', registerRoutes);

// Error handling
app.onError((err, c) => {
  console.error('🐾 Server error:', err);
  
  if (err.message.includes('rate')) {
    return c.json({ 
      error: 'Rate limit exceeded',
      retry_after: 60 
    }, 429);
  }
  
  return c.json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  }, 500);
});

// 404
app.notFound((c) => {
  return c.json({ 
    error: 'Not found',
    path: c.req.path,
    hint: 'Check /api for available endpoints',
  }, 404);
});

const port = parseInt(process.env.PORT || '3001');
const host = process.env.HOST || '0.0.0.0';

console.log(`
╔══════════════════════════════════════════════════════════╗
║  🐾 OpenClawd API Registrar                             ║
║  X-verified wallet → API key generation                 ║
║  Part of the OpenClawd ACP registry ecosystem           ║
╠══════════════════════════════════════════════════════════╣
║  Port: ${port}                                            ║
║  Host: ${host}                                             ║
║  Env:  ${process.env.NODE_ENV || 'development'}                              ║
╚══════════════════════════════════════════════════════════╝
`);

serve({
  fetch: app.fetch,
  port,
  hostname: host,
});

console.log(`✅ API Registrar running at http://localhost:${port}`);
console.log(`📖 API docs at http://localhost:${port}/api`);
