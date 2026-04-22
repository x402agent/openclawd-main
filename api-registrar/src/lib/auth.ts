/**
 * 🐾 OpenClawd API Registrar - Authentication
 * 
 * API key validation middleware for protected endpoints.
 */

import { neon } from '@neondatabase/serverless';
import type { MiddlewareHandler } from 'hono';

const sql = neon(process.env.DATABASE_URL!);

/**
 * Validate API key and attach user to context
 */
export const validateApiKey: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader) {
    return c.json({ 
      error: 'Missing Authorization header',
      hint: 'Use: Authorization: Bearer clawd_sk_...',
    }, 401);
  }
  
  // Extract API key
  const apiKey = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;
  
  if (!apiKey.startsWith('clawd_sk_')) {
    return c.json({ 
      error: 'Invalid API key format',
      hint: 'OpenClawd API keys start with: clawd_sk_',
    }, 401);
  }
  
  // Hash the API key for lookup
  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  // Look up the API key in database
  try {
    const result = await sql`
      SELECT 
        rak.id,
        rak.user_id,
        rak.wallet_address,
        rak.name,
        rak.scopes,
        rak.expires_at,
        rak.revoked_at,
        u.role
      FROM registrar_api_keys rak
      JOIN users u ON u.id = rak.user_id
      WHERE rak.key_hash = ${keyHash}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return c.json({ 
        error: 'Invalid API key',
        hint: 'Check your API key or generate a new one at api-registrar',
      }, 401);
    }
    
    const apiKeyRecord = result[0];
    
    // Check if revoked
    if (apiKeyRecord.revoked_at) {
      return c.json({ 
        error: 'API key has been revoked',
        hint: 'Generate a new API key at api-registrar',
      }, 401);
    }
    
    // Check if expired
    if (new Date(apiKeyRecord.expires_at) < new Date()) {
      return c.json({ 
        error: 'API key has expired',
        hint: 'Generate a new API key at api-registrar',
      }, 401);
    }
    
    // Update last used timestamp (async, don't wait)
    sql`
      UPDATE registrar_api_keys 
      SET last_used_at = NOW()
      WHERE id = ${apiKeyRecord.id}
    `.catch(() => {}); // Ignore errors for non-critical updates
    
    // Attach user info to context
    c.set('user', {
      id: apiKeyRecord.user_id,
      walletAddress: apiKeyRecord.wallet_address,
      role: apiKeyRecord.role,
      scopes: apiKeyRecord.scopes,
    });
    
    c.set('apiKeyId', apiKeyRecord.id);
    
    await next();
    
  } catch (error) {
    console.error('🐾 Auth error:', error);
    return c.json({ 
      error: 'Authentication failed',
      hint: 'Please try again or contact support',
    }, 500);
  }
};

/**
 * Check if user has specific scope
 */
export function requireScope(scope: string): MiddlewareHandler {
  return async (c, next) => {
    const user = c.get('user');
    
    if (!user) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    
    const scopes = user.scopes || [];
    
    if (!scopes.includes(scope) && !scopes.includes('admin')) {
      return c.json({ 
        error: 'Insufficient permissions',
        required_scope: scope,
        your_scopes: scopes,
      }, 403);
    }
    
    await next();
  };
}

/**
 * Validate ClawdRouter internal secret for service-to-service auth
 */
export function validateInternalSecret(): MiddlewareHandler {
  return async (c, next) => {
    const secret = c.req.header('X-ClawdRouter-Secret');
    const expectedSecret = process.env.CLAWDROUTER_INTERNAL_SECRET;
    
    if (!expectedSecret) {
      console.warn('🐾 CLAWDROUTER_INTERNAL_SECRET not configured');
      return c.json({ error: 'Internal auth not configured' }, 500);
    }
    
    if (!secret || secret !== expectedSecret) {
      return c.json({ 
        error: 'Invalid internal secret',
        hint: 'This endpoint requires service-to-service authentication',
      }, 401);
    }
    
    await next();
  };
}
