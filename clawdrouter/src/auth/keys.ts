/**
 * ClawdRouter — wallet-signed API keys.
 *
 * Endpoint flow:
 *   1. POST /v1/keys/challenge { wallet, action, keyId? }
 *        → stores a nonce, returns the message the wallet must sign.
 *   2. Wallet signs with Ed25519 (Phantom, Solflare, CLI — whatever).
 *   3. POST /v1/keys/mint { wallet, nonce, signature, label? }
 *        → verifies the signature, consumes the challenge, returns a fresh
 *          API key ONCE. We store only SHA-256(key).
 *   4. GET /v1/keys?wallet=&nonce=&signature=
 *        → verifies a "list" challenge, returns the user's active keys.
 *   5. POST /v1/keys/:id/revoke { nonce, signature }
 *        → soft deletes. Requires the wallet that minted the key.
 */

import {
  buildChallengeMessage,
  generateApiKey,
  randomNonce,
  sha256Hex,
  verifySolanaSignature,
} from './crypto.js';
import {
  type ClawdHoldingEnv,
  gateEnabled,
  isAdminWallet,
  verifyClawdHolding,
} from './clawd-holding.js';

export interface KeysEnv extends ClawdHoldingEnv {
  CLAWD_DB: D1Database;
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

// ── Challenge ─────────────────────────────────────────────────────────

export async function handleChallenge(
  request: Request,
  env: KeysEnv,
): Promise<Response> {
  const body = await safeJson<{ wallet: string; action: string; keyId?: string }>(request);
  if (!body?.wallet || !body.action) {
    return jsonError(400, 'wallet_and_action_required');
  }
  const action = normalizeAction(body.action, body.keyId);
  if (!action) return jsonError(400, 'invalid_action');

  const nonce = randomNonce();
  const now = Date.now();
  const expiresAt = now + CHALLENGE_TTL_MS;
  const message = buildChallengeMessage(action, body.wallet, nonce, expiresAt);

  await env.CLAWD_DB.prepare(
    `INSERT INTO auth_challenges (nonce, wallet, message, action, created_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  )
    .bind(nonce, body.wallet, message, action, now, expiresAt)
    .run();

  return Response.json({ nonce, message, expiresAt });
}

// ── Mint ──────────────────────────────────────────────────────────────

export async function handleMint(request: Request, env: KeysEnv): Promise<Response> {
  const body = await safeJson<{
    wallet: string;
    nonce: string;
    signature: string;
    label?: string;
  }>(request);
  if (!body?.wallet || !body.nonce || !body.signature) {
    return jsonError(400, 'wallet_nonce_signature_required');
  }

  const challenge = await consumeChallenge(env, body.wallet, body.nonce, 'mint');
  if ('error' in challenge) return jsonError(challenge.status, challenge.error);

  const ok = await verifySolanaSignature(body.wallet, challenge.message, body.signature);
  if (!ok) return jsonError(401, 'invalid_signature');

  // $CLAWD holder gate. Admin wallets + disabled gate skip the on-chain check.
  if (gateEnabled(env) && !isAdminWallet(env, body.wallet)) {
    const holding = await verifyClawdHolding(body.wallet, env);
    if (!holding.rpcOk) {
      return Response.json(
        { error: 'holder_check_unavailable', reason: holding.rpcError },
        { status: 503 },
      );
    }
    if (!holding.meetsMinimum) {
      return Response.json(
        {
          error: 'holder_only',
          message: 'API keys are for $CLAWD holders. Acquire $CLAWD to mint a key.',
          wallet: body.wallet,
          clawdBalance: holding.uiAmount,
        },
        { status: 403 },
      );
    }
  }

  const { key, prefix, id } = generateApiKey();
  const keyHash = await sha256Hex(key);
  const now = Date.now();

  await env.CLAWD_DB.prepare(
    `INSERT INTO api_keys (id, key_prefix, key_hash, wallet_address, label, tier, created_at)
     VALUES (?, ?, ?, ?, ?, 'FREE', ?)`,
  )
    .bind(id, prefix, keyHash, body.wallet, body.label ?? null, now)
    .run();

  return Response.json({
    id,
    prefix,
    key, // shown exactly once
    wallet: body.wallet,
    tier: 'FREE',
    createdAt: now,
    warning: 'Store this key now — it will never be shown again.',
  });
}

// ── List ──────────────────────────────────────────────────────────────

export async function handleList(url: URL, env: KeysEnv): Promise<Response> {
  const wallet = url.searchParams.get('wallet');
  const nonce = url.searchParams.get('nonce');
  const signature = url.searchParams.get('signature');
  if (!wallet || !nonce || !signature) {
    return jsonError(400, 'wallet_nonce_signature_required');
  }

  const challenge = await consumeChallenge(env, wallet, nonce, 'list');
  if ('error' in challenge) return jsonError(challenge.status, challenge.error);

  const ok = await verifySolanaSignature(wallet, challenge.message, signature);
  if (!ok) return jsonError(401, 'invalid_signature');

  const { results } = await env.CLAWD_DB.prepare(
    `SELECT id, key_prefix, label, tier, credits_usdc, created_at, last_used_at, request_count
       FROM api_keys
       WHERE wallet_address = ? AND revoked_at IS NULL
       ORDER BY created_at DESC`,
  )
    .bind(wallet)
    .all();

  return Response.json({ wallet, keys: results ?? [] });
}

// ── Revoke ────────────────────────────────────────────────────────────

export async function handleRevoke(
  request: Request,
  env: KeysEnv,
  keyId: string,
): Promise<Response> {
  const body = await safeJson<{ wallet: string; nonce: string; signature: string }>(
    request,
  );
  if (!body?.wallet || !body.nonce || !body.signature) {
    return jsonError(400, 'wallet_nonce_signature_required');
  }

  const expected = `revoke:${keyId}`;
  const challenge = await consumeChallenge(env, body.wallet, body.nonce, expected);
  if ('error' in challenge) return jsonError(challenge.status, challenge.error);

  const ok = await verifySolanaSignature(body.wallet, challenge.message, body.signature);
  if (!ok) return jsonError(401, 'invalid_signature');

  const res = await env.CLAWD_DB.prepare(
    `UPDATE api_keys SET revoked_at = ?
      WHERE id = ? AND wallet_address = ? AND revoked_at IS NULL`,
  )
    .bind(Date.now(), keyId, body.wallet)
    .run();

  if ((res.meta.changes ?? 0) === 0) {
    return jsonError(404, 'key_not_found_or_already_revoked');
  }
  return Response.json({ revoked: keyId });
}

// ── Bearer auth for /chat/completions ─────────────────────────────────

export interface AuthedKey {
  id: string;
  wallet: string;
  tier: string;
}

/**
 * Look up the API key sent in the Authorization header. Returns null for
 * missing/unknown keys (callers decide whether to allow x402/anon access).
 * Updates last_used_at + request_count asynchronously.
 */
export async function authenticateBearer(
  header: string | null,
  env: KeysEnv,
): Promise<AuthedKey | null> {
  if (!header) return null;
  const raw = header.replace(/^Bearer\s+/i, '').trim();
  if (!raw.startsWith('ck_live_') || raw.length < 16) return null;

  const hash = await sha256Hex(raw);
  const row = await env.CLAWD_DB.prepare(
    `SELECT id, wallet_address, tier
       FROM api_keys
       WHERE key_hash = ? AND revoked_at IS NULL
       LIMIT 1`,
  )
    .bind(hash)
    .first<{ id: string; wallet_address: string; tier: string }>();

  if (!row) return null;
  return { id: row.id, wallet: row.wallet_address, tier: row.tier };
}

// ── Verify (called by the fly.dev tunnel hub) ─────────────────────────
//
// The hub wants to validate a customer's bearer token before accepting
// a WSS connection. It hits this endpoint with an `x-clawd-hub-secret`
// header (shared secret provisioned as `CLAWDROUTER_HUB_SECRET`).

export interface VerifyEnv extends KeysEnv {
  CLAWDROUTER_HUB_SECRET?: string;
}

export async function handleKeysVerify(
  request: Request,
  env: VerifyEnv,
): Promise<Response> {
  const expected = env.CLAWDROUTER_HUB_SECRET?.trim();
  if (!expected) {
    return Response.json({ ok: false, reason: 'hub_secret_not_configured' }, { status: 503 });
  }
  const provided = request.headers.get('x-clawd-hub-secret');
  if (!provided || provided !== expected) {
    return Response.json({ ok: false, reason: 'hub_secret_mismatch' }, { status: 401 });
  }

  const body = await safeBodyJson<{ key?: string }>(request);
  const raw = body?.key?.trim() ?? request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  if (!raw) {
    return Response.json({ ok: false, reason: 'missing_key' }, { status: 400 });
  }
  const authed = await authenticateBearer(`Bearer ${raw}`, env);
  if (!authed) {
    return Response.json({ ok: false, reason: 'invalid_or_revoked' }, { status: 200 });
  }
  return Response.json({
    ok: true,
    tenantId: authed.id,
    wallet: authed.wallet,
    tier: authed.tier,
  });
}

async function safeBodyJson<T>(request: Request): Promise<T | null> {
  try {
    const ctype = request.headers.get('content-type') ?? '';
    if (!ctype.includes('application/json')) return null;
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export async function touchKey(env: KeysEnv, keyId: string): Promise<void> {
  await env.CLAWD_DB.prepare(
    `UPDATE api_keys SET last_used_at = ?, request_count = request_count + 1
      WHERE id = ?`,
  )
    .bind(Date.now(), keyId)
    .run();
}

// ── Helpers ───────────────────────────────────────────────────────────

type ConsumedChallenge = { message: string } | { error: string; status: number };

async function consumeChallenge(
  env: KeysEnv,
  wallet: string,
  nonce: string,
  action: string,
): Promise<ConsumedChallenge> {
  const now = Date.now();
  const row = await env.CLAWD_DB.prepare(
    `SELECT message, expires_at, consumed_at, wallet, action
       FROM auth_challenges
       WHERE nonce = ?`,
  )
    .bind(nonce)
    .first<{
      message: string;
      expires_at: number;
      consumed_at: number | null;
      wallet: string;
      action: string;
    }>();

  if (!row) return { error: 'unknown_nonce', status: 404 };
  if (row.wallet !== wallet) return { error: 'wallet_mismatch', status: 401 };
  if (row.action !== action) return { error: 'action_mismatch', status: 401 };
  if (row.consumed_at) return { error: 'nonce_already_used', status: 409 };
  if (row.expires_at < now) return { error: 'nonce_expired', status: 410 };

  await env.CLAWD_DB.prepare(
    `UPDATE auth_challenges SET consumed_at = ? WHERE nonce = ?`,
  )
    .bind(now, nonce)
    .run();

  return { message: row.message };
}

function normalizeAction(action: string, keyId?: string): string | null {
  if (action === 'mint' || action === 'list' || action === 'enroll') return action;
  if (action === 'revoke' && keyId && /^[A-Za-z0-9]+$/.test(keyId)) {
    return `revoke:${keyId}`;
  }
  return null;
}

async function safeJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function jsonError(status: number, error: string): Response {
  return Response.json({ error }, { status });
}
