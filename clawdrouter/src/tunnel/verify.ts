/**
 * ClawdRouter — hub-side API key verification
 *
 * The hub authenticates spoke WS connections by asking the Cloudflare
 * control plane (clawdrouter.x402.workers.dev) to validate the bearer
 * token. Results are cached in-memory for 5 minutes to keep the hub
 * cheap under load. Revocation propagates on the next TTL expiry.
 */

import { createHash } from 'node:crypto';

export interface VerifyOk {
  ok: true;
  tenantId: string;
  wallet: string;
  tier: string;
}

export interface VerifyFail {
  ok: false;
  reason: string;
}

export type VerifyResult = VerifyOk | VerifyFail;

export interface VerifierOptions {
  controlUrl: string;    // e.g. https://clawdrouter.x402.workers.dev
  hubSecret: string;     // shared secret with the CF worker
  ttlMs?: number;        // cache TTL (default 5 min)
  fetchImpl?: typeof fetch; // for tests
}

interface CacheEntry {
  result: VerifyResult;
  expiresAt: number;
}

export class KeyVerifier {
  private readonly controlUrl: string;
  private readonly hubSecret: string;
  private readonly ttlMs: number;
  private readonly fetchImpl: typeof fetch;
  private readonly cache = new Map<string, CacheEntry>();

  constructor(opts: VerifierOptions) {
    if (!opts.controlUrl) throw new Error('controlUrl required');
    if (!opts.hubSecret) throw new Error('hubSecret required');
    this.controlUrl = opts.controlUrl.replace(/\/+$/, '');
    this.hubSecret = opts.hubSecret;
    this.ttlMs = opts.ttlMs ?? 5 * 60 * 1000;
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  async verify(apiKey: string): Promise<VerifyResult> {
    if (!apiKey) return { ok: false, reason: 'missing_key' };
    const cacheKey = hashKey(apiKey);
    const now = Date.now();
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > now) return cached.result;

    let result: VerifyResult;
    try {
      const res = await this.fetchImpl(`${this.controlUrl}/v1/keys/verify`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-clawd-hub-secret': this.hubSecret,
        },
        body: JSON.stringify({ key: apiKey }),
      });
      if (!res.ok && res.status !== 200) {
        const body = await res.text().catch(() => '');
        return { ok: false, reason: `control_${res.status}:${body.slice(0, 80)}` };
      }
      const json = (await res.json()) as VerifyResult;
      result = json;
    } catch (err) {
      // Network failure: fail closed but do not cache — we want retries.
      return { ok: false, reason: `control_unreachable:${(err as Error).message}` };
    }

    // Only cache positive or deterministic-negative results. Network errors
    // are not cached (fall-through above).
    this.cache.set(cacheKey, { result, expiresAt: now + this.ttlMs });
    return result;
  }

  /** Invalidate a cached key — e.g. on explicit logout or admin signal. */
  invalidate(apiKey: string): void {
    this.cache.delete(hashKey(apiKey));
  }

  /** Size of the cache (ops/telemetry). */
  size(): number {
    return this.cache.size;
  }
}

function hashKey(apiKey: string): string {
  // Don't store raw keys even in RAM — hash to 32-byte hex.
  return createHash('sha256').update(apiKey, 'utf8').digest('hex');
}
