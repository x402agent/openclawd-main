# `clawd-x402-proxy` — Cloudflare Worker

Phase 3 of the monetization stack. A one-file Cloudflare Worker that
gates any HTTP origin behind the Clawd multi-tenant x402 Solana
facilitator. Users register their agent / MCP / URL at
`/x402 → Monetize`, drop the Worker in front of their origin, and start
earning USDC per request.

Source: [workers/x402-proxy/](../workers/x402-proxy/).

## Flow

```
┌──────────┐  GET /api/premium/x     ┌────────────────┐
│  client  │ ───────────────────────▶│  x402-proxy    │
└──────────┘                         │  (Worker)      │
     ▲                               └───────┬────────┘
     │ 402 + paymentRequirements             │ fetch slug config
     │                                       ▼
     │                               ┌────────────────┐
     │                               │ /api/monetize/ │
     │                               │  public/:slug  │  (Clawd app)
     │                               └────────────────┘
     │                                       │
     │                                       ▼  resolved x402 payload
     │                               ┌────────────────┐
     │                               │  x402-proxy    │
     │                               └────────────────┘
     │
client signs a Solana USDC transfer → X-Payment header
     │
     ▼
┌────────────────┐  POST /settle  ┌─────────────────────┐
│  x402-proxy    │ ─────────────▶ │  /api/x402/facilit. │
└────────┬───────┘                └──────────┬──────────┘
         │                                   │ multi-tenant
         │                                   │ recipient
         │                                   │ routing
         ▼ on settle.success                 ▼
┌────────────────┐                  ┌──────────────────┐
│   UPSTREAM     │  request proxied │ Solana RPC       │
│   ORIGIN       │  + X-Payment-    │ (on-chain        │
│                │    Response      │  settlement)     │
└────────────────┘                  └──────────────────┘
```

## Why a Worker instead of middleware in each origin?

- One deploy point protects N origins — just add patterns.
- No secrets at the edge. The Worker never sees a private key; every
  sensitive operation is a `fetch()` into the Clawd Express server.
- Cloudflare's global network answers the 402 challenge within the same
  POP the client hit, so unpaid traffic never reaches the origin at all.

## Deploy steps

1. `cd workers/x402-proxy && npm install`
2. Edit `wrangler.jsonc`:
   - `UPSTREAM_URL` → your origin
   - `PROTECTED_PATTERNS` → array of `{ pattern, slug, description?, pricePerCallUsd? }`
3. `npx wrangler deploy`

The bundled `wrangler.jsonc` already pins `account_id` to the Clawd
Cloudflare account (`2f5db575118d15ec19000e13282201bc`). Replace it (or
delete the field and pass `--account-id`) to deploy to another account.

## Optional KV cache

Slug configs are hot objects — most requests hit the same one. Bind a KV
namespace so isolates across POPs share the cache:

```bash
npx wrangler kv namespace create SLUG_CACHE
```

Uncomment the `kv_namespaces` block in `wrangler.jsonc` with the
returned id. TTL is driven by `SLUG_CACHE_TTL_SECONDS` (default 30s).

## Configuration reference

| Var | Purpose |
| --- | --- |
| `CLAWD_API_URL` | Base URL of the Clawd app. Default `https://solanaclawd.com` |
| `UPSTREAM_URL` | Where to forward paid requests. Required. |
| `PROTECTED_PATTERNS` | Array of `{ pattern, slug, description?, pricePerCallUsd? }` |
| `SLUG_CACHE_TTL_SECONDS` | KV + Cloudflare fetch cache TTL. Default 30 |

### Pattern syntax

Any [URLPattern](https://developer.mozilla.org/en-US/docs/Web/API/URLPattern)
pathname-only expression:

- `/api/premium/*` — matches any subpath
- `/tools/:name` — matches `/tools/anything`
- `/files/:name.:ext` — parametric with extension

Requests that don't match any pattern are forwarded through unchanged.

## How pricing works

The Worker charges the greater of:

1. The slug's configured `pricePerCallAtomic` (set by the owner at
   `/x402 → Monetize`).
2. The per-pattern `pricePerCallUsd` override from `wrangler.jsonc`.

This means an owner can never be tricked into accepting less than their
floor, and an operator can price different paths independently while
respecting the owner's minimum.

## Client-side usage

The Worker speaks the standard x402 exact-Solana flow. Any compliant
client will work. Examples:

- **Browser** → use the live demo at [/router/demo](https://solanaclawd.com/router/demo)
  which signs with Phantom/any wallet-adapter.
- **Agent** → use `@x402/fetch` + a Solana scheme registered against the
  facilitator.
- **Claude Code / OpenCode** → see [Cloudflare's coding-tool guide](https://developers.cloudflare.com/agents/agentic-payments/x402/pay-with-tool-plugins/)
  and point `X402_PRIVATE_KEY` at a Solana wallet.

## Observability

- Per-request logs via `wrangler tail`.
- Every successful settlement writes a row to the Clawd `payment_events`
  table; the owner sees it in real time under `/x402 → Monetize → your
  agent → Recent payments`.
- `/.well-known/x402-proxy` exposes the Worker's config for
  client-side discovery and debugging.

## Related

- Worker code: [workers/x402-proxy/src/index.ts](../workers/x402-proxy/src/index.ts)
- Multi-tenant facilitator: [server/_core/x402Facilitator.ts](../server/_core/x402Facilitator.ts)
- Monetize dashboard: [/x402 → Monetize](../client/src/pages/X402.tsx)
- Monetize guide: [docs/monetize.md](./monetize.md)
