/**
 * 🐾 OpenClawd API Registrar Routes
 * 
 * Handles:
 * - Verification code generation
 * - X (Twitter) tweet verification
 * - API key management
 * 
 * Part of the OpenClawd ACP registry ecosystem.
 */

import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const router = new Hono();

// X API base URL
const X_API_BASE = 'https://api.twitter.com/2';

/**
 * POST /api/register/generate-code
 * Generate a verification code for a wallet
 */
router.post('/generate-code', async (c) => {
  const { walletAddress, signature } = await c.req.json();
  
  if (!walletAddress) {
    return c.json({ 
      error: 'Wallet address required',
      field: 'walletAddress',
    }, 400);
  }
  
  // Validate Solana address format
  const isValidAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress);
  if (!isValidAddress) {
    return c.json({ 
      error: 'Invalid Solana wallet address',
      field: 'walletAddress',
      hint: 'Solana addresses are base58 encoded, 32-44 characters',
    }, 400);
  }
  
  // Generate verification code (format: clawd + hex)
  const randomBytes = crypto.getRandomValues(new Uint8Array(4));
  const verificationCode = 'clawd' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  try {
    // Check if user exists or create one
    let userResult = await sql`
      SELECT id FROM users WHERE wallet_address = ${walletAddress}
    `;
    
    let userId: number;
    
    if (userResult.length === 0) {
      // Create new user
      const newUser = await sql`
        INSERT INTO users (wallet_address, login_method, role)
        VALUES (${walletAddress}, 'wallet', 'user')
        RETURNING id
      `;
      userId = newUser[0].id;
    } else {
      userId = userResult[0].id;
    }
    
    // Invalidate any existing unverified codes
    await sql`
      UPDATE x_verification_codes 
      SET expires_at = NOW()
      WHERE wallet_address = ${walletAddress}
      AND verified = false
      AND expires_at > NOW()
    `;
    
    // Create verification code record
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    
    const codeResult = await sql`
      INSERT INTO x_verification_codes (wallet_address, user_id, verification_code, expires_at)
      VALUES (${walletAddress}, ${userId}, ${verificationCode}, ${expiresAt.toISOString()})
      RETURNING id
    `;
    
    return c.json({
      success: true,
      verificationCode,
      expiresAt: expiresAt.toISOString(),
      userId,
      instructions: {
        step: 1,
        action: 'tweet',
        content: `Verifying my Solana wallet for @clawddevs: ${verificationCode}`,
        url_template: 'https://x.com/compose/tweet',
      },
    });
  } catch (error) {
    console.error('🐾 Generate code error:', error);
    return c.json({ 
      error: 'Failed to generate verification code',
      hint: 'Please try again',
    }, 500);
  }
});

/**
 * POST /api/register/verify-tweet
 * Verify the tweet contains the code and generate API key
 */
router.post('/verify-tweet', async (c) => {
  const { walletAddress, verificationCode, tweetUrl } = await c.req.json();
  
  if (!walletAddress || !verificationCode || !tweetUrl) {
    return c.json({ 
      error: 'All fields required',
      fields: ['walletAddress', 'verificationCode', 'tweetUrl'],
    }, 400);
  }
  
  // Validate Solana address
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
    return c.json({ error: 'Invalid wallet address' }, 400);
  }
  
  try {
    // Find the verification code
    const codeResult = await sql`
      SELECT * FROM x_verification_codes 
      WHERE wallet_address = ${walletAddress}
      AND verification_code = ${verificationCode}
      AND verified = false
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (codeResult.length === 0) {
      return c.json({ 
        error: 'Invalid or expired verification code',
        hint: 'Generate a new code if needed',
      }, 400);
    }
    
    const codeRecord = codeResult[0];
    
    // Check expiry
    if (new Date(codeRecord.expires_at) < new Date()) {
      return c.json({ 
        error: 'Verification code expired',
        hint: 'Please generate a new code',
      }, 400);
    }
    
    // Parse tweet URL
    const tweetMatch = tweetUrl.match(/x\.com\/(\w+)\/status\/(\d+)/i) 
      || tweetUrl.match(/twitter\.com\/(\w+)\/status\/(\d+)/i);
    
    if (!tweetMatch) {
      return c.json({ 
        error: 'Invalid tweet URL format',
        hint: 'Use format: https://x.com/username/status/123456789',
      }, 400);
    }
    
    const xUsername = tweetMatch[1];
    const tweetId = tweetMatch[2];
    
    // Verify tweet content via X API (if token available)
    if (process.env.X_API_BEARER_TOKEN) {
      try {
        const tweetResponse = await fetch(
          `${X_API_BASE}/tweets/${tweetId}?tweet.fields=text,author_id`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.X_API_BEARER_TOKEN}`,
            },
          }
        );
        
        if (tweetResponse.ok) {
          const tweetData = await tweetResponse.json();
          const tweetText = tweetData.data?.text?.toLowerCase() || '';
          const expectedCode = verificationCode.toLowerCase();
          
          if (!tweetText.includes(expectedCode)) {
            return c.json({ 
              error: 'Verification code not found in tweet',
              hint: `Tweet must contain: ${verificationCode}`,
            }, 400);
          }
        }
      } catch (xError) {
        console.warn('🐾 X API verification skipped:', xError);
        // Continue without X API verification in dev mode
      }
    }
    
    // Mark verification as complete
    await sql`
      UPDATE x_verification_codes 
      SET verified = true, 
          verified_at = NOW(),
          x_tweet_url = ${tweetUrl},
          x_username = ${xUsername}
      WHERE id = ${codeRecord.id}
    `;
    
    // Generate API key
    const randomBytes = crypto.getRandomValues(new Uint8Array(32));
    const apiKey = 'clawd_sk_' + btoa(String.fromCharCode(...randomBytes))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    
    const keyPrefix = apiKey.slice(0, 18); // clawd_sk_ + 8 chars
    const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
      .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
    
    // Create API key record
    const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    
    const apiKeyResult = await sql`
      INSERT INTO registrar_api_keys 
      (user_id, wallet_address, verification_code_id, key_prefix, key_hash, name, scopes, expires_at)
      VALUES (
        ${codeRecord.user_id}, 
        ${walletAddress}, 
        ${codeRecord.id}, 
        ${keyPrefix}, 
        ${keyHash}, 
        'Primary API Key', 
        '["chat:read", "chat:write", "skills:read"]',
        ${expiresAt.toISOString()}
      )
      RETURNING id
    `;
    
    // Update verification record with API key ID
    await sql`
      UPDATE x_verification_codes 
      SET api_key_id = ${apiKeyResult[0].id}
      WHERE id = ${codeRecord.id}
    `;
    
    return c.json({
      verified: true,
      message: 'Wallet verified successfully!',
      apiKey,
      keyPrefix,
      expiresAt: expiresAt.toISOString(),
      usage: {
        header: 'Authorization',
        format: 'Bearer clawd_sk_...',
        example: `curl -H "Authorization: Bearer ${apiKey}" https://api.solanaclawd.com/chat`,
      },
      nextSteps: [
        'Store your API key securely',
        'Use it with ClawdRouter for AI agent calls',
        'Check docs at: https://solanaclawd.com/docs',
      ],
    });
  } catch (error) {
    console.error('🐾 Verify tweet error:', error);
    return c.json({ 
      error: 'Verification failed',
      hint: 'Please try again',
    }, 500);
  }
});

/**
 * GET /api/register/keys/:walletAddress
 * List all API keys for a wallet
 */
router.get('/keys/:walletAddress', async (c) => {
  const walletAddress = c.req.param('walletAddress');
  
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
    return c.json({ error: 'Invalid wallet address' }, 400);
  }
  
  try {
    const keys = await sql`
      SELECT 
        id, 
        name, 
        key_prefix, 
        scopes, 
        last_used_at, 
        expires_at, 
        revoked_at, 
        created_at
      FROM registrar_api_keys
      WHERE wallet_address = ${walletAddress}
      ORDER BY created_at DESC
    `;
    
    return c.json({ 
      walletAddress,
      keys: keys.map(k => ({
        ...k,
        isActive: !k.revoked_at && new Date(k.expires_at) > new Date(),
        isExpired: new Date(k.expires_at) < new Date(),
        isRevoked: !!k.revoked_at,
      })),
    });
  } catch (error) {
    console.error('🐾 List keys error:', error);
    return c.json({ error: 'Failed to list keys' }, 500);
  }
});

/**
 * DELETE /api/register/keys/:keyId
 * Revoke an API key
 */
router.delete('/keys/:keyId', async (c) => {
  const keyId = c.req.param('keyId');
  
  try {
    const result = await sql`
      UPDATE registrar_api_keys 
      SET revoked_at = NOW()
      WHERE id = ${keyId}
      RETURNING id, name
    `;
    
    if (result.length === 0) {
      return c.json({ error: 'API key not found' }, 404);
    }
    
    return c.json({
      success: true,
      message: 'API key revoked successfully',
      keyId: result[0].id,
    });
  } catch (error) {
    console.error('🐾 Revoke key error:', error);
    return c.json({ error: 'Failed to revoke key' }, 500);
  }
});

/**
 * GET /api/register/stats
 * Get registration statistics (admin only via auth middleware)
 */
router.get('/stats', async (c) => {
  try {
    const [totalUsers, totalKeys, verifiedCodes, recentRegistrations] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM registrar_api_keys WHERE revoked_at IS NULL`,
      sql`SELECT COUNT(*) as count FROM x_verification_codes WHERE verified = true`,
      sql`
        SELECT DATE(created_at) as date, COUNT(*) as count 
        FROM users 
        WHERE created_at > NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `,
    ]);
    
    return c.json({
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        activeApiKeys: totalKeys[0]?.count || 0,
        verifiedRegistrations: verifiedCodes[0]?.count || 0,
        registrationsLast30Days: recentRegistrations,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('🐾 Stats error:', error);
    return c.json({ error: 'Failed to get stats' }, 500);
  }
});

export default router;
