# ClawdRouter Tunnel — your local AI, anywhere

The ClawdRouter Tunnel lets a hosted router (`clawdrouter.fly.dev`) serve requests from **your own Ollama instance at home** — without opening ports, running a VPN, or exposing your laptop to the public internet.

It is the answer to a problem the local-AI flow didn't solve: *I want my phone (or another laptop, or my agent running in a sandbox) to use my home GPU.* You already hold the key — your Solana wallet — but the hosted router has no way to reach your kitchen.

This doc explains the pieces and the flow. For the story, see [ARTICLE_TUNNELS.md](../ARTICLE_TUNNELS.md).

---

## The shape

```
[your kitchen]                         [solanaclawd.com]
┌────────────────┐                     ┌─────────────────────────────┐
│  Ollama :11434 │                     │  /api  — dashboard          │
│       ▲        │                     │  Phantom sign + $CLAWD gate │
│       │                              │  └► + New device            │
│  clawdrouter   │    persistent WSS   │                             │
│     (spoke)    │──────────────────►  │  ┌────────────────────────┐ │
│                │   /v1/tunnel/connect│  │ clawdrouter.fly.dev    │ │
│                │                     │  │ tunnel hub + LLM proxy │ │
└────────────────┘                     │  └─────────┬──────────────┘ │
                                       └────────────┼────────────────┘
                                                    │
                                                    ▼
                                  ┌────────────────────────────────┐
                                  │ clawdrouter.x402.workers.dev   │
                                  │ Cloudflare control plane       │
                                  │ D1: api_keys, enrollment_tokens│
                                  └────────────────────────────────┘
```

Three processes across three hosts. Each owns exactly one job.

| Host | Role | Open source |
|---|---|---|
| `clawdrouter.x402.workers.dev` (Cloudflare Worker) | Control plane — issues API keys, creates one-time enrollment tokens, verifies keys for the hub | [`clawdrouter/src/worker.ts`](../clawdrouter/src/worker.ts) |
| `clawdrouter.fly.dev` (Fly.io, Node) | Data plane — hosts the WebSocket tunnel, forwards HTTP requests to the spoke that owns that tenant | [`clawdrouter/src/tunnel/hub.ts`](../clawdrouter/src/tunnel/hub.ts) |
| Your laptop (customer) | Spoke — opens a persistent WSS out to the hub, dispatches `req` frames to local Ollama | [`clawdrouter/src/tunnel/spoke.ts`](../clawdrouter/src/tunnel/spoke.ts) |

No ports opened on the customer machine. The spoke dials *out* — the same pattern used by `cloudflared` and `tailscale funnel`, but scoped to a single-purpose control plane you can read the source of.

---

## Enrollment — how a device gets connected

The dashboard lives at [`/keys`](../client/src/pages/Api.tsx) on solanaclawd.com. One-time, per device:

1. **Connect Phantom** on the `/keys` page. The token gate already requires $CLAWD.
2. **+ New device** button (cyan). Optionally label it ("home-mac", "studio-gpu").
3. Phantom signs an `enroll` challenge — standard Ed25519 sig over a server-minted nonce.
4. The worker mints a fresh `ck_live_*` API key + a single-use enrollment token and returns `https://clawdrouter.x402.workers.dev/v1/enroll/<token>`.
5. The dashboard shows a copy-pasteable line:
   ```
   clawdrouter enroll https://clawdrouter.x402.workers.dev/v1/enroll/<token>
   ```
6. On the machine with Ollama, run that command. The CLI fetches the URL (single-use, 15-min TTL), receives the key + tunnel URL, and writes `~/.clawd/clawdrouter/device.json` (mode 0600).
7. Run `clawdrouter`. The binary detects the device config, switches into **spoke mode**, and dials the hub. You'll see:
   ```
   🔗 Dialing hub: wss://clawdrouter.fly.dev/v1/tunnel/connect
   ✓ Connected to hub as tenant <id>
     Local upstream:  http://127.0.0.1:11434
   ```

That's it. The tunnel stays up with exponential-backoff reconnect and 30-second heartbeat. Drop your wifi, come back, it reconnects on its own.

### Why a one-time URL instead of just pasting the key

The raw `ck_live_*` key is sensitive. Passing it through clipboard + shell history on a different machine is a smell. The enrollment URL is:
- **single-use** — consumed on first GET
- **time-bounded** — 15-minute TTL
- **auditable** — `consumed_ip` is logged
- **revocable** — if you don't run `clawdrouter enroll` in time, it expires and you mint another

The raw key is still returned in the dashboard (inside a `<details>` block) as a backup, in case the user's shell on the target machine is offline and they want to install the config by hand.

---

## Runtime — how a request flows

```
[anywhere on the internet]
   │
   │  curl -H "Authorization: Bearer ck_live_..." \
   │       https://clawdrouter.fly.dev/v1/local/models
   ▼
┌─────────────────────────────────────────────────────┐
│  clawdrouter.fly.dev                                │
│                                                     │
│  ① extract bearer, hit KeyVerifier (5-min cache)    │
│  ② cache miss → POST CF /v1/keys/verify             │
│       (x-clawd-hub-secret header)                   │
│  ③ CF looks up sha256(key) in D1 → tenantId         │
│  ④ hub.get(tenantId) → TunnelConnection             │
│  ⑤ forward frame: {t:"req", id, method, path, ...}  │
└──────────────────────────┬──────────────────────────┘
                           │  WSS (persistent)
                           ▼
┌─────────────────────────────────────────────────────┐
│  your laptop · clawdrouter spoke                    │
│                                                     │
│  ⑥ receive req frame, route:                        │
│     /v1/local/models        → GET /api/tags         │
│     /v1/local/chat/completions → POST /v1/chat/...  │
│  ⑦ reply {t:"res", id, status, headers, body}       │
└──────────────────────────┬──────────────────────────┘
                           │  same WSS
                           ▼
                     hub resolves pending[id]
                     writes res to inbound HTTP
                           │
                           ▼
                     caller gets JSON back
```

Every hop is just a JSON object. There is no magic. If the spoke isn't connected, fly returns `503 tunnel_offline`. If it takes longer than 30 s, `504 tunnel_timeout`. If the spoke disconnects mid-request, in-flight calls reject with `tunnel_closed`.

---

## Frame protocol (v1)

All frames are JSON text over a standard WebSocket. Bodies are base64 so binary transits cleanly.

```ts
type TunnelFrame =
  | { t: "req"; id: string; method: string; path: string; headers: Record<string,string>; body?: string }
  | { t: "res"; id: string; status: number; headers: Record<string,string>; body?: string }
  | { t: "res.start"; id: string; status: number; headers: Record<string,string> }   // reserved for PR 5
  | { t: "res.chunk"; id: string; data: string }                                      // reserved for PR 5
  | { t: "res.end";   id: string; trailers?: Record<string,string> }                  // reserved for PR 5
  | { t: "ping"; ts: number }
  | { t: "pong"; ts: number }
  | { t: "err";  id?: string; code: string; message: string };
```

`id` is a UUID per hub→spoke request. The hub parks a `{resolve, reject, timer}` against that id until the matching `res` comes back.

Both paths ship in v1. **Single-shot** (`res`) for responses that buffer cleanly — e.g. `/v1/local/models`, short completions. **Streaming** (`res.start` + N × `res.chunk` + `res.end`) kicks in automatically when the spoke sees chunked transfer, `text/event-stream` content-type, or `"stream": true` in the request JSON. The hub's `forward()` accepts an optional `onStream` callback that feeds chunks straight into the inbound HTTP response, so SSE flows byte-for-byte from the customer's Ollama all the way to the remote caller.

---

## Authentication — three secrets, one wallet

| Secret | Where it lives | What it proves |
|---|---|---|
| Your Solana wallet (Ed25519 keypair) | Phantom | "I hold $CLAWD." Signs challenges on dashboard actions. |
| `ck_live_*` API key | Issued by CF mint, stored hashed in D1 | "I am the device enrolled under this wallet." Sent as bearer on every WS connect + every inbound HTTP. |
| `CLAWDROUTER_HUB_SECRET` (32 random bytes) | Fly secret + CF secret | "I am the hub, trusted to ask the control plane about keys." Sent in `x-clawd-hub-secret` on every verify call. |

The hub **never** sees your wallet. CF **never** sees raw Ollama traffic. The only thing that crosses all three tiers is a `tenantId` string — an opaque uuid CF issues when the key is minted.

### What if the hub is compromised?

It can replay `/v1/keys/verify` with the shared secret and learn `tenantId → wallet` mappings. It can *not* impersonate a key (it only verifies; CF never sends key material back). Customers keep full control of which devices are enrolled by revoking keys on the dashboard — revocation propagates on the next 5-min cache expiry, or instantly if you call `verifier.invalidate(key)`.

### What if a spoke is compromised?

The attacker gets to answer requests on behalf of that one tenant. They do not learn other tenants' keys (the hub shards connections per-tenant). Revoke the key on the dashboard; the next hub verify rejects the WS and cleans up the inflight requests.

### What if CF is compromised?

They've already lost; they're your auth authority. Same calculus as any product sitting behind a control plane.

---

## Environment variables

### Fly.dev hub

```bash
CLAWDROUTER_HUB_ENABLED=true                 # flip on tunnel mode
CLAWDROUTER_HUB_SECRET=<64-hex>              # shared with CF
CLAWDROUTER_CONTROL_URL=https://clawdrouter.x402.workers.dev
CLAWDROUTER_HUB_PATH=/v1/tunnel/connect      # default
CLAWDROUTER_HUB_HEARTBEAT_MS=30000           # default
CLAWDROUTER_HUB_CACHE_TTL_MS=300000          # 5-min key verify cache
CLAWDROUTER_BIND=all                         # auto-detected from FLY_APP_NAME
```

### Cloudflare Worker

```bash
CLAWDROUTER_HUB_SECRET=<64-hex>              # must match fly's
CLAWDROUTER_TUNNEL_URL=wss://clawdrouter.fly.dev/v1/tunnel/connect
CLAWDROUTER_ENROLL_TTL_MS=900000             # 15-min default
```

### Spoke (customer's `clawdrouter`)

Device config at `~/.clawd/clawdrouter/device.json`; written by `clawdrouter enroll`. No env needed for the common path. Override:

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434       # default
CLAWDROUTER_DEVICE_PATH=/custom/path.json    # for multi-device testing
```

---

## Operating the hub

### Live state

```bash
curl https://clawdrouter.fly.dev/v1/tunnel/stats
# {"enabled":true, "connected":2, "tenants":["t_abc","t_def"], "verifierCacheSize":14}
```

### Graceful shutdown

`SIGTERM` drains inflight requests for up to 2 s per tunnel, sends `{t:"err", code:"shutdown"}` to every spoke, closes cleanly. Spokes then reconnect with backoff against whatever machine comes up next.

### Tenant replacement

If the same tenant opens a second WS (e.g. two `clawdrouter` processes on the same key), **last writer wins**. The hub sends `{t:"err", code:"replaced"}` to the stale connection with close code `1012` and registers the new one. If you want two devices enrolled, mint two keys.

---

## Current limits (v1)

- **No mid-stream cancel.** If the HTTP client disconnects, the hub stops writing but the spoke keeps streaming the upstream response to completion. A `cancel` frame type is deferred — bytes that land after client hangup are discarded on the hub side.
- **No explicit backpressure.** Chunks flow as fast as WebSocket `ws.send()` accepts them. Node's internal buffer will grow if a reader is slow; for Ollama-sized SSE streams we haven't seen this bite, but very long generations with a slow consumer could balloon memory.
- **Soft cap ≈ 500 tunnels per fly machine** — matches the `hard_limit = 500` in [`fly.toml`](../clawdrouter/fly.toml). Sticky sharding by tenantId across machines is planned for v2.
- **In-memory registry.** A hub restart drops all tunnels. Spokes reconnect in ≤ 1s with backoff; in-flight requests fail with `tunnel_closed`.
- **No request queueing.** If the tunnel is down when a request lands, the hub returns `503 tunnel_offline` immediately. The caller decides whether to retry.

---

## Files

| Path | Purpose |
|---|---|
| [`clawdrouter/src/auth/enroll.ts`](../clawdrouter/src/auth/enroll.ts) | CF: `/v1/enroll/mint` + `/v1/enroll/:token` |
| [`clawdrouter/src/auth/keys.ts`](../clawdrouter/src/auth/keys.ts) | CF: `/v1/keys/verify` + existing mint/list/revoke |
| [`clawdrouter/migrations/0002_enrollment_tokens.sql`](../clawdrouter/migrations/0002_enrollment_tokens.sql) | D1 schema for enrollment |
| [`clawdrouter/src/tunnel/frames.ts`](../clawdrouter/src/tunnel/frames.ts) | JSON frame codec |
| [`clawdrouter/src/tunnel/verify.ts`](../clawdrouter/src/tunnel/verify.ts) | KeyVerifier (hub → CF) + 5-min cache |
| [`clawdrouter/src/tunnel/hub.ts`](../clawdrouter/src/tunnel/hub.ts) | Fly: WS server, tenant registry, `forward()` |
| [`clawdrouter/src/tunnel/spoke.ts`](../clawdrouter/src/tunnel/spoke.ts) | Customer: WSS client, reconnect, req dispatch |
| [`clawdrouter/src/device/config.ts`](../clawdrouter/src/device/config.ts) | `~/.clawd/clawdrouter/device.json` read/write |
| [`clawdrouter/src/device/enroll.ts`](../clawdrouter/src/device/enroll.ts) | `clawdrouter enroll <url>` command |
| [`client/src/components/WalletKeyMinter.tsx`](../client/src/components/WalletKeyMinter.tsx) | Dashboard + New device button |

Tests: [`clawdrouter/tests/tunnel.test.ts`](../clawdrouter/tests/tunnel.test.ts) (7 unit tests for the hub), [`clawdrouter/tests/forward.test.ts`](../clawdrouter/tests/forward.test.ts) (5 end-to-end forward tests).

---

## Next

- **PR 5:** streaming (`res.start/chunk/end`) for `/v1/chat/completions?stream=true` so agents see tokens as they're generated, not at the end.
- **PR 7:** observability — per-tenant p50/p95 latency, rate limits per tunnel, correlation IDs across logs.
- **v2:** sticky sharding across fly machines, multi-region routing, optional offline queueing for short bursts of unreachability.
