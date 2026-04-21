# ClawdRouter Cloud

The hosted edge of ClawdRouter — one OpenAI-compatible URL, realtime stats, and wallet-signed API keys, all running on Cloudflare.

**Live URL:** `https://clawdrouter.x402.workers.dev`

---

## Stack overview

```
         ┌──────────────────────────────────────────────────────────┐
         │              clawdrouter (Cloudflare Worker)             │
         │                                                          │
   POST ─┼─► /v1/chat/completions  ─► 15-dim scorer ─► routeRequest │
         │                            (<1ms local)    ─► OpenRouter │
         │                                             (55+ models) │
         │                                                          │
         │                   ┌──────────┐      ┌──────────────┐     │
         │  every request ──►│ ClawdStats│◄────│ /v1/stats/*  │     │
         │                   │ Durable   │     │ snapshot + WS│     │
         │                   │  Object   │     └──────────────┘     │
         │                   └──────────┘                           │
         │                                                          │
         │                   ┌───────────────────┐                  │
         │  every request ──►│ Analytics Engine  │◄── /v1/stats/    │
         │                   │ dataset: "clawd"  │     history      │
         │                   └───────────────────┘    (SQL API)     │
         │                                                          │
         │                   ┌───────────────────┐                  │
         │  /v1/keys/* ─────►│   D1: clawd       │                  │
         │                   │   api_keys,       │                  │
         │                   │   auth_challenges │                  │
         │                   └───────────────────┘                  │
         └──────────────────────────────────────────────────────────┘
```

Every piece lives in one Worker so the observability is colocated with the code path it measures.

---

## Endpoints

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `POST` | `/v1/chat/completions` | optional Bearer | OpenAI-compatible. Scores → routes → proxies → writes datapoint + DO event. |
| `GET` | `/v1/stats` | public | Realtime snapshot from the Durable Object (in-memory, totals persisted to DO storage). |
| `GET` | `/v1/stats/stream` | public | WebSocket. First frame `{type:"snapshot"}`, then one `{type:"route"}` per routed request. Hibernation API. |
| `GET` | `/v1/stats/history?window=1h\|24h\|7d\|30d` | public | Historical aggregations from Analytics Engine via the Cloudflare SQL API. Cached 60s. |
| `POST` | `/v1/keys/challenge` | none | Returns `{nonce, message, expiresAt}`. Body: `{wallet, action, keyId?}`. |
| `POST` | `/v1/keys/mint` | Solana sig | Verifies signature over the challenge; returns a fresh `ck_live_…` key ONCE. |
| `GET` | `/v1/keys?wallet=…&nonce=…&signature=…` | Solana sig | Lists the wallet's active keys. Lookup is signature-gated. |
| `POST` | `/v1/keys/:id/revoke` | Solana sig | Soft-deletes the key. Signature must come from the wallet that minted it. |
| `GET` | `/health` | public | Liveness. |

### Bearer auth

Authenticated requests ride `Authorization: Bearer ck_live_…`. The Worker looks up `SHA-256(key)` in D1, then threads the resolved wallet + key id through to the analytics path so each datapoint has the issuer.

Anonymous requests still work — they skip the D1 lookup and land in Analytics Engine with index `"anonymous"`.

---

## Cloudflare bindings

From [`clawdrouter/wrangler.jsonc`](../clawdrouter/wrangler.jsonc):

```jsonc
{
  "analytics_engine_datasets": [{ "binding": "clawd", "dataset": "clawd" }],
  "durable_objects": {
    "bindings": [{ "name": "CLAWD_STATS", "class_name": "ClawdStats" }]
  },
  "migrations": [{ "tag": "v1", "new_classes": ["ClawdStats"] }],
  "d1_databases": [{
    "binding": "CLAWD_DB",
    "database_name": "clawd",
    "database_id": "…",
    "migrations_dir": "migrations"
  }]
}
```

### Secrets

| Name | Purpose |
|------|---------|
| `OPENROUTER_API_KEY` | Upstream API key used by the router. |
| `CF_ANALYTICS_TOKEN` | Cloudflare API token (Account · Account Analytics · Read) used by `/v1/stats/history`. |
| `CLAWDROUTER_SITE_URL` / `CLAWDROUTER_SITE_TITLE` | Optional — forwarded as `HTTP-Referer` / `X-Title` to OpenRouter. |

Set each with `npx wrangler secret put <NAME>` from `clawdrouter/`.

---

## Analytics Engine schema

`clawdrouter/src/analytics/engine.ts` writes every routed request:

| Column | Meaning |
|--------|---------|
| `index1` | Wallet address, or `"anonymous"`. Used for sampling. |
| `blob1` | Requested model |
| `blob2` | Routed model |
| `blob3` | Tier (`SIMPLE \| MEDIUM \| COMPLEX \| REASONING`) |
| `blob4` | Profile (`eco \| auto \| premium`) |
| `blob5` | Provider |
| `blob6` | Status (`ok \| error \| payment_required \| upstream_error`) |
| `blob7` | Error code (empty on success) |
| `blob8` | User agent |
| `double1` | Input tokens |
| `double2` | Output tokens |
| `double3` | Cost (USDC) |
| `double4` | Saved vs Claude Opus baseline (USDC) |
| `double5` | Total latency (ms) |
| `double6` | Routing time (ms) |
| `double7` | Scorer total score (0–100) |
| `double8` | Fallback flag (0/1) |
| `double9` | HTTP status |

### Example SQL

```sql
-- Hourly request + savings volume over the last day
SELECT
  intDiv(toUInt32(timestamp), 3600) * 3600 AS bucket,
  count()                                 AS requests,
  sum(double3)                            AS cost_usdc,
  sum(double4)                            AS saved_usdc
FROM clawd
WHERE timestamp > NOW() - INTERVAL '1' DAY
GROUP BY bucket
ORDER BY bucket;
```

Run it with your `CF_ANALYTICS_TOKEN`:

```bash
curl -X POST \
  "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql" \
  -H "authorization: Bearer ${CF_ANALYTICS_TOKEN}" \
  -H "content-type: text/plain" \
  --data-binary @query.sql
```

---

## Wallet-signed API keys

No accounts, no email — an Ed25519 signature from a Solana wallet is the identity.

```
Client                                Worker
  │                                     │
  │ POST /v1/keys/challenge             │
  │ { wallet, action: "mint" }          │
  │────────────────────────────────────►│
  │                                     │ insert auth_challenges
  │  { nonce, message, expiresAt }      │
  │◄────────────────────────────────────│
  │                                     │
  │ wallet.signMessage(message)         │
  │                                     │
  │ POST /v1/keys/mint                  │
  │ { wallet, nonce, signature }        │
  │────────────────────────────────────►│ consume challenge
  │                                     │ crypto.subtle.verify (Ed25519)
  │                                     │ sha256(random key) → api_keys
  │  { key: "ck_live_…", prefix, id }   │
  │◄────────────────────────────────────│
```

The full key is shown exactly once at mint time. The server stores only `SHA-256(key)`; there is no recovery.

### Schema

See [`clawdrouter/migrations/0001_api_keys.sql`](../clawdrouter/migrations/0001_api_keys.sql). Key tables:

- `api_keys(id, key_prefix, key_hash, wallet_address, label, tier, credits_usdc, created_at, last_used_at, revoked_at, request_count)`
- `auth_challenges(nonce, wallet, message, action, created_at, expires_at, consumed_at)`

Apply with `npx wrangler d1 migrations apply clawd --remote`.

---

## Deploying from scratch

```bash
cd clawdrouter
export CLOUDFLARE_API_TOKEN=...          # or `wrangler login`

# One-time
npx wrangler d1 migrations apply clawd --remote
npx wrangler secret put OPENROUTER_API_KEY
npx wrangler secret put CF_ANALYTICS_TOKEN

# Deploy
npx wrangler deploy
```

Durable Objects require the Workers paid plan ($5/mo). If the deploy fails with a plan error, subscribe and redeploy — no code changes needed.

---

## Where this surfaces on the site

| Route | What it shows |
|-------|---------------|
| [`/api`](../client/src/pages/Api.tsx) | Endpoint reference + wallet-signed key minter. Embeds the live strip. |
| [`/stats`](../client/src/pages/Stats.tsx) | Historical dashboard pulling from `/v1/stats/history`. Live strip up top. |
| [`/clawdrouter`](../client/src/pages/ClawdRouter.tsx) | Models / profiles / specialist agents. Live strip pinned above the tabs. |
| [`/latest`](../client/src/pages/Latest.tsx) | Changelog-style feed of shipped infra pieces, linking to each. |

The shared live component is [`client/src/components/ClawdLiveStats.tsx`](../client/src/components/ClawdLiveStats.tsx) — WebSocket-first, polling fallback.
