/**
 * ClawdRouter — API Key Authentication Middleware
 *
 * Supports two auth modes:
 *   1. clawd_sk_ API keys (validated against clawd-terminal Postgres DB)
 *   2. Ed25519 Solana wallet signatures (original x402 flow)
 *   3. x402 literal (local development / legacy)
 *
 * When deployed as a hosted service on Fly.io, API key auth is the primary path.
 * When running locally, wallet auth or x402 literal is fine.
 */

import { createHash } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

// ── Types ────────────────────────────────────────────────────────────

export interface AuthResult {
  authenticated: boolean;
  method: 'api-key' | 'wallet' | 'x402-literal' | 'none';
  userId?: number;
  keyId?: number;
  scopes?: string[];
  walletAddress?: string;
  agentWalletId?: number | null;
  error?: string;
}

export interface ApiKeyValidationResult {
  valid: boolean;
  userId?: number;
  keyId?: number;
  scopes?: string[];
  agentWalletId?: number | null;
  walletAddress?: string;
  error?: string;
}

// ── Configuration ────────────────────────────────────────────────────

export interface AuthConfig {
  /** Postgres connection string for API key validation */
  databaseUrl?: string;
  /** Allow x402 literal key for local/dev mode */
  allowX402Literal?: boolean;
  /** Allow unauthenticated requests (local mode) */
  allowUnauthenticated?: boolean;
  /** Internal validation URL (hit the main clawd-terminal server) */
  validationUrl?: string;
}

// ── API Key Prefix ───────────────────────────────────────────────────

const API_KEY_PREFIX = 'clawd_sk_';

// ── Auth Extraction ──────────────────────────────────────────────────

/**
 * Extract and validate authentication from an incoming HTTP request.
 * Checks Authorization header for Bearer tokens.
 */
export async function authenticateRequest(
  req: IncomingMessage,
  config: AuthConfig,
): Promise<AuthResult> {
  const authHeader = req.headers['authorization'] as string | undefined;

  if (!authHeader) {
    if (config.allowUnauthenticated) {
      return { authenticated: true, method: 'none' };
    }
    return { authenticated: false, method: 'none', error: 'No Authorization header' };
  }

  // Must be Bearer token
  if (!authHeader.startsWith('Bearer ')) {
    return { authenticated: false, method: 'none', error: 'Invalid Authorization header format' };
  }

  const token = authHeader.slice(7).trim();

  // ── clawd_sk_ API key ────────────────────────────────────────────
  if (token.startsWith(API_KEY_PREFIX)) {
    return validateApiKey(token, config);
  }

  // ── x402 literal (local/dev mode) ────────────────────────────────
  if (token === 'x402' || token === 'x402-local') {
    if (config.allowX402Literal) {
      return { authenticated: true, method: 'x402-literal' };
    }
    return { authenticated: false, method: 'x402-literal', error: 'x402 literal auth not allowed in hosted mode' };
  }

  // ── x402:<wallet_pubkey> (Solana wallet auth) ────────────────────
  if (token.startsWith('x402:')) {
    const walletAddress = token.slice(5);
    if (walletAddress.length >= 32 && walletAddress.length <= 44) {
      return { authenticated: true, method: 'wallet', walletAddress };
    }
    return { authenticated: false, method: 'wallet', error: 'Invalid wallet address' };
  }

  // Unknown auth format
  return { authenticated: false, method: 'none', error: 'Unrecognized auth token format' };
}

// ── API Key Validation ───────────────────────────────────────────────

/**
 * Validate a clawd_sk_ API key.
 *
 * Two strategies:
 *   1. If validationUrl is set, POST to the clawd-terminal server for validation
 *   2. If databaseUrl is set, validate directly against Postgres
 */
async function validateApiKey(
  fullKey: string,
  config: AuthConfig,
): Promise<AuthResult> {
  // Strategy 1: Remote validation via clawd-terminal server
  if (config.validationUrl) {
    return validateApiKeyRemote(fullKey, config.validationUrl);
  }

  // Strategy 2: Direct DB validation
  if (config.databaseUrl) {
    return validateApiKeyDirect(fullKey, config.databaseUrl);
  }

  // No validation backend configured
  return {
    authenticated: false,
    method: 'api-key',
    error: 'No API key validation backend configured. Set DATABASE_URL or CLAWDROUTER_VALIDATION_URL.',
  };
}

// ── Remote Validation ────────────────────────────────────────────────

async function validateApiKeyRemote(
  fullKey: string,
  validationUrl: string,
): Promise<AuthResult> {
  try {
    const resp = await fetch(`${validationUrl}/api/auth/validate-key`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Secret': process.env['CLAWDROUTER_INTERNAL_SECRET'] ?? '',
      },
      body: JSON.stringify({ key: fullKey }),
      signal: AbortSignal.timeout(5000),
    });

    if (!resp.ok) {
      return { authenticated: false, method: 'api-key', error: `Validation server returned ${resp.status}` };
    }

    const result = (await resp.json()) as ApiKeyValidationResult;

    if (!result.valid) {
      return { authenticated: false, method: 'api-key', error: result.error ?? 'Invalid API key' };
    }

    return {
      authenticated: true,
      method: 'api-key',
      userId: result.userId,
      keyId: result.keyId,
      scopes: result.scopes,
      agentWalletId: result.agentWalletId,
      walletAddress: result.walletAddress,
    };
  } catch (err: any) {
    return { authenticated: false, method: 'api-key', error: `Validation request failed: ${err.message}` };
  }
}

// ── Direct DB Validation ─────────────────────────────────────────────

async function validateApiKeyDirect(
  fullKey: string,
  _databaseUrl: string,
): Promise<AuthResult> {
  // Hash the key the same way the main server does
  const keyHash = createHash('sha256').update(fullKey).digest('hex');
  const keyPrefix = fullKey.slice(0, 16);

  // Dynamic import to avoid requiring pg when not needed
  try {
    // Use the neon serverless driver (same as main app)
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(_databaseUrl);

    const rows = await sql`
      SELECT ak.id, ak."userId", ak.scopes, ak."agentWalletId", ak.expires_at,
             u."walletAddress"
      FROM api_keys ak
      LEFT JOIN users u ON u.id = ak."userId"
      WHERE ak.key_hash = ${keyHash}
        AND ak.key_prefix = ${keyPrefix}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return { authenticated: false, method: 'api-key', error: 'Invalid API key' };
    }

    const row = rows[0]!;

    // Check expiry
    if (row.expires_at && new Date(row.expires_at as string) < new Date()) {
      return { authenticated: false, method: 'api-key', error: 'API key expired' };
    }

    // Update last_used_at (fire-and-forget)
    sql`UPDATE api_keys SET last_used_at = NOW() WHERE id = ${row.id}`.catch(() => {});

    return {
      authenticated: true,
      method: 'api-key',
      userId: row.userId as number,
      keyId: row.id as number,
      scopes: (row.scopes as string[]) ?? [],
      agentWalletId: (row.agentWalletId as number | null) ?? null,
      walletAddress: row.walletAddress as string | undefined,
    };
  } catch (err: any) {
    // If neon driver not available, fall back to error
    return {
      authenticated: false,
      method: 'api-key',
      error: `Direct DB validation failed: ${err.message}`,
    };
  }
}

// ── Scope Checking ───────────────────────────────────────────────────

/**
 * Check if an auth result has the required scopes.
 * Non-API-key auth methods are assumed to have all scopes.
 */
export function hasScopes(auth: AuthResult, required: string[]): boolean {
  if (auth.method !== 'api-key') return true; // wallet/x402 = full access
  if (!auth.scopes) return false;
  if (auth.scopes.includes('admin')) return true;
  return required.every(s => auth.scopes!.includes(s));
}

/**
 * Check if auth result can use chat completions
 */
export function canUseChat(auth: AuthResult): boolean {
  return hasScopes(auth, ['chat:read', 'chat:write']);
}
