/**
 * ClawdRouter — enrollment flow
 *
 * One wallet-signed call mints an API key AND generates a single-use
 * enrollment URL. The user pastes `https://<worker>/v1/enroll/<token>`
 * into `clawdrouter enroll <url>` on their device; the customer binary
 * redeems the token, receives the key + tunnel URL, and writes its
 * local config. Tokens are single-use and expire in 15 minutes.
 *
 *   POST /v1/enroll/challenge  (handled by handleChallenge with action=enroll)
 *   POST /v1/enroll/mint       → returns { enrollmentUrl, key, keyId, expiresAt }
 *   GET  /v1/enroll/:token     → { apiKey, tunnelUrl, deviceLabel, keyId }
 */

import {
  generateApiKey,
  randomNonce,
  sha256Hex,
  verifySolanaSignature,
} from './crypto.js';
import type { KeysEnv } from './keys.js';
import { gateEnabled, isAdminWallet, verifyClawdHolding } from './clawd-holding.js';

export interface EnrollEnv extends KeysEnv {
  CLAWDROUTER_TUNNEL_URL?: string;   // e.g. wss://clawdrouter.fly.dev/v1/tunnel/connect
  CLAWDROUTER_ENROLL_TTL_MS?: string; // override default 15-min TTL
}

const DEFAULT_TTL_MS = 15 * 60 * 1000;
const DEFAULT_TUNNEL_URL = 'wss://clawdrouter.fly.dev/v1/tunnel/connect';

// ── Mint + enrollment token in one shot ───────────────────────────────

export async function handleEnrollMint(
  request: Request,
  env: EnrollEnv,
): Promise<Response> {
  const body = await safeJson<{
    wallet: string;
    nonce: string;
    signature: string;
    label?: string;        // label for the api_keys row
    deviceLabel?: string;  // label the customer sees (e.g. "home-mac")
  }>(request);
  if (!body?.wallet || !body.nonce || !body.signature) {
    return jsonError(400, 'wallet_nonce_signature_required');
  }

  const challenge = await consumeChallenge(env, body.wallet, body.nonce, 'enroll');
  if ('error' in challenge) return jsonError(challenge.status, challenge.error);

  const ok = await verifySolanaSignature(body.wallet, challenge.message, body.signature);
  if (!ok) return jsonError(401, 'invalid_signature');

  // Same $CLAWD holder gate as plain mint.
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
          message: 'Enrollment requires a $CLAWD holder wallet.',
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
  const ttlMs = parseInt(env.CLAWDROUTER_ENROLL_TTL_MS ?? '', 10) || DEFAULT_TTL_MS;
  const expiresAt = now + ttlMs;
  const tunnelUrl = env.CLAWDROUTER_TUNNEL_URL ?? DEFAULT_TUNNEL_URL;
  const token = generateEnrollToken();

  // Atomic-ish: insert key, then enrollment row. D1 doesn't do multi-statement
  // transactions across prepares inside a single call, so we write sequentially.
  // If step 2 fails, the key still exists but no enrollment token — user can
  // retry by minting a fresh one (idempotent enough for v1).
  await env.CLAWD_DB.prepare(
    `INSERT INTO api_keys (id, key_prefix, key_hash, wallet_address, label, tier, created_at)
     VALUES (?, ?, ?, ?, ?, 'FREE', ?)`,
  )
    .bind(id, prefix, keyHash, body.wallet, body.label ?? null, now)
    .run();

  await env.CLAWD_DB.prepare(
    `INSERT INTO enrollment_tokens
       (token, api_key_id, api_key_raw, tunnel_url, device_label, wallet_address, created_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(token, id, key, tunnelUrl, body.deviceLabel ?? null, body.wallet, now, expiresAt)
    .run();

  const enrollmentUrl = `${workerOrigin(request)}/v1/enroll/${token}`;

  return Response.json({
    enrollmentUrl,
    key, // also returned so the dashboard can show "copy key" as a backup path
    keyId: id,
    prefix,
    tier: 'FREE',
    expiresAt,
    warning: 'This enrollment URL is single-use and expires in 15 minutes.',
  });
}

// ── Redeem ────────────────────────────────────────────────────────────

export async function handleEnrollRedeem(
  request: Request,
  env: EnrollEnv,
  token: string,
): Promise<Response> {
  const now = Date.now();
  const row = await env.CLAWD_DB.prepare(
    `SELECT api_key_id, api_key_raw, tunnel_url, device_label, expires_at, consumed_at
       FROM enrollment_tokens WHERE token = ?`,
  )
    .bind(token)
    .first<{
      api_key_id: string;
      api_key_raw: string;
      tunnel_url: string;
      device_label: string | null;
      expires_at: number;
      consumed_at: number | null;
    }>();

  if (!row) return jsonError(404, 'unknown_token');
  if (row.consumed_at) return jsonError(410, 'token_already_used');
  if (row.expires_at < now) return jsonError(410, 'token_expired');

  const ip = request.headers.get('cf-connecting-ip') ?? null;
  const res = await env.CLAWD_DB.prepare(
    `UPDATE enrollment_tokens SET consumed_at = ?, consumed_ip = ?
       WHERE token = ? AND consumed_at IS NULL`,
  )
    .bind(now, ip, token)
    .run();

  // Lost the race to a concurrent redemption.
  if ((res.meta.changes ?? 0) === 0) return jsonError(410, 'token_already_used');

  return Response.json({
    apiKey: row.api_key_raw,
    tunnelUrl: row.tunnel_url,
    deviceLabel: row.device_label,
    keyId: row.api_key_id,
  });
}

// ── Helpers ───────────────────────────────────────────────────────────

function generateEnrollToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  // base64url without padding
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function workerOrigin(request: Request): string {
  const u = new URL(request.url);
  return `${u.protocol}//${u.host}`;
}

type ConsumedChallenge = { message: string } | { error: string; status: number };

async function consumeChallenge(
  env: EnrollEnv,
  wallet: string,
  nonce: string,
  action: string,
): Promise<ConsumedChallenge> {
  const now = Date.now();
  const row = await env.CLAWD_DB.prepare(
    `SELECT message, expires_at, consumed_at, wallet, action
       FROM auth_challenges WHERE nonce = ?`,
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
