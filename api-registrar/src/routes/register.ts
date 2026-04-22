import { Hono } from 'hono';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
const router = new Hono();

// POST /api/register/generate-code
// Generate a verification code for a wallet
router.post('/generate-code', async (c) => {
  const { walletAddress, signature } = await c.req.json();
  
  if (!walletAddress) {
    return c.json({ error: 'Wallet address required' }, 400);
  }
  
  // Validate Solana address format
  const isValidAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress);
  if (!isValidAddress) {
    return c.json({ error: 'Invalid Solana wallet address' }, 400);
  }
  
  // Generate verification code
  const randomBytes = crypto.getRandomValues(new Uint8Array(4));
  const verificationCode = 'clawd' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Check if user exists or create one
  let userResult = await sql`
    SELECT id FROM users WHERE "walletAddress" = ${walletAddress}
  `;
  
  let userId: number;
  
  if (userResult.length === 0) {
    // Create new user
    const newUser = await sql`
      INSERT INTO users ("walletAddress", "loginMethod", role)
      VALUES (${walletAddress}, 'wallet', 'user')
      RETURNING id
    `;
    userId = newUser[0].id;
  } else {
    userId = userResult[0].id;
  }
  
  // Create verification code record
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  
  const codeResult = await sql`
    INSERT INTO x_verification_codes ("walletAddress", "userId", "verificationCode", "expiresAt")
    VALUES (${walletAddress}, ${userId}, ${verificationCode}, ${expiresAt.toISOString()})
    RETURNING id
  `;
  
  return c.json({
    success: true,
    verificationCode,
    expiresAt: expiresAt.toISOString(),
    userId,
  });
});

// POST /api/register/verify-tweet
// Verify the tweet contains the code and generate API key
router.post('/verify-tweet', async (c) => {
  const { walletAddress, verificationCode, tweetUrl } = await c.req.json();
  
  if (!walletAddress || !verificationCode || !tweetUrl) {
    return c.json({ error: 'All fields required' }, 400);
  }
  
  // Find the verification code
  const codeResult = await sql`
    SELECT * FROM x_verification_codes 
    WHERE "walletAddress" = ${walletAddress}
    AND "verificationCode" = ${verificationCode}
    AND verified = false
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;
  
  if (codeResult.length === 0) {
    return c.json({ error: 'Invalid or expired verification code' }, 400);
  }
  
  const codeRecord = codeResult[0];
  
  // Check expiry
  if (new Date(codeRecord.expires_at) < new Date()) {
    return c.json({ error: 'Verification code expired' }, 400);
  }
  
  // Parse tweet URL
  const tweetMatch = tweetUrl.match(/x\.com\/(\w+)\/status\/(\d+)/i) 
    || tweetUrl.match(/twitter\.com\/(\w+)\/status\/(\d+)/i);
  
  if (!tweetMatch) {
    return c.json({ error: 'Invalid tweet URL format' }, 400);
  }
  
  const xUsername = tweetMatch[1];
  const tweetId = tweetMatch[2];
  
  // TODO: Verify tweet content via X API
  // For now, we'll trust the submission (add X API verification in production)
  
  // Mark verification as complete
  await sql`
    UPDATE x_verification_codes 
    SET verified = true, 
        "verifiedAt" = NOW(), 
        "xTweetUrl" = ${tweetUrl},
        "xUsername" = ${xUsername}
    WHERE id = ${codeRecord.id}
  `;
  
  // Generate API key
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const apiKey = 'clawd_sk_' + btoa(String.fromCharCode(...randomBytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  const keyPrefix = apiKey.slice(0, 16);
  const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(apiKey))
    .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));
  
  // Create API key record
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
  
  const apiKeyResult = await sql`
    INSERT INTO registrar_api_keys 
    ("userId", "walletAddress", "verificationCodeId", "keyPrefix", "keyHash", name, scopes, "expiresAt")
    VALUES (
      ${codeRecord.user_id}, 
      ${walletAddress}, 
      ${codeRecord.id}, 
      ${keyPrefix}, 
      ${keyHash}, 
      'Primary API Key', 
      '["chat:read", "chat:write"]'::jsonb,
      ${expiresAt.toISOString()}
    )
    RETURNING id
  `;
  
  // Update verification record with API key ID
  await sql`
    UPDATE x_verification_codes 
    SET "apiKeyId" = ${apiKeyResult[0].id}
    WHERE id = ${codeRecord.id}
  `;
  
  return c.json({
    verified: true,
    apiKey,
    keyPrefix,
    expiresAt: expiresAt.toISOString(),
  });
});

// GET /api/register/keys/:walletAddress
// List all API keys for a wallet
router.get('/keys/:walletAddress', async (c) => {
  const walletAddress = c.req.param('walletAddress');
  
  const keys = await sql`
    SELECT id, name, "keyPrefix", scopes, "lastUsedAt", "expiresAt", "revokedAt", "createdAt"
    FROM registrar_api_keys
    WHERE "walletAddress" = ${walletAddress}
    AND "revokedAt" IS NULL
    ORDER BY "createdAt" DESC
  `;
  
  return c.json({ keys });
});

// DELETE /api/register/keys/:keyId
// Revoke an API key
router.delete('/keys/:keyId', async (c) => {
  const keyId = c.req.param('keyId');
  
  await sql`
    UPDATE registrar_api_keys 
    SET "revokedAt" = NOW()
    WHERE id = ${keyId}
  `;
  
  return c.json({ success: true });
});

export default router;
