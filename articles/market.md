# /market — x402 Agentic Market for $CLAWD holders

The Clawd Market is a token-gated page where $CLAWD holders (a) browse
pay-per-request x402 services an agent can call with one HTTP request, and
(b) list their own services — agent endpoints, MCP tools, HTTP APIs — and
start earning USDC per call.

It's the buyer side and the seller side of the x402 protocol, welded to a
Convex-backed catalog, an in-app Clawd copilot, and a Firecrawl import so
sellers don't have to retype boilerplate.

> Live page: [/market](../client/src/pages/Market.tsx) · [/bazaar](../client/src/pages/Bazaar.tsx) (Solana-first view)
>
> x402 spec: <https://docs.cdp.coinbase.com/x402/welcome>

---

## Why this exists

The Coinbase agentic market at `api.agentic.market` is the first catalog of
x402-callable services: pay a signed HTTP request, get a response, settle
per-call in USDC. No API keys, no accounts, no rate limits.

Clawd is a Solana-native agent host. Every $CLAWD holder already signs in
with Phantom / Privy and already has a funded Solana wallet. Wiring the
agentic market into the Clawd terminal gives every holder:

- A **buyer-side catalog** their agent can search and call today.
- A **seller-side surface** where they can register their own endpoint, pick
  a price, and immediately earn USDC — routed through the Clawd x402
  facilitator or the CDP facilitator, both of which speak Solana.
- A **copilot** that knows the x402 spec, has read the Bazaar discovery
  docs, and can draft a listing from a URL.

---

## The five tabs

### 1. Browse

Live query against `https://api.agentic.market/v1/services` with debounced
search and category chips. Every card shows per-endpoint pricing and
copy-URL buttons so your agent can lift the resource URL straight into its
request. All data comes from Coinbase — we don't mirror it.

### 2. Your Listings

Wallet-owned listings saved to Convex (`market_listings` table). The server
enforces ownership on every write — only the wallet that created a listing
can edit or delete it.

Each listing tracks:

| field              | purpose                                                      |
| ------------------ | ------------------------------------------------------------ |
| `slug`             | globally unique, 2-64 lowercase chars/hyphens                |
| `name`             | display name                                                 |
| `description`      | up to 4000 chars, markdown OK                                |
| `category`/`tags`  | free-form, powers Browse filters                             |
| `networks[]`       | `solana-mainnet`, `solana-devnet`, `base`, `base-sepolia`, … |
| `endpoints[]`      | method + URL + USDC price (atomic units)                     |
| `status`           | `active` / `paused` / `draft`                                |
| `visibility`       | `public` (shown in catalog) or `unlisted` (direct link only) |
| `totalSales`       | lifetime successful calls                                    |
| `totalRevenueAtomic` | lifetime revenue in atomic USDC (6 decimals)               |

Paste a URL and hit **Import** — `trpc.firecrawl.scrape` fetches the page,
pulls out the title/description/summary, and pre-fills the form. You still
own every field; Firecrawl just saves you from retyping.

Copying the `paymentRequirements` payload from a listing emits the exact
JSON you drop into your own 402 response.

### 3. Monetize

The existing MonetizeDashboard — `trpc.monetize.register` wired to the
Clawd x402 facilitator. Use this when you want the Clawd facilitator to
verify + settle payments on your behalf. Your Listings tab is for the
public-catalog metadata; Monetize is for the settlement path.

### 4. Copilot

The Clawd Market Copilot. Streams from `/api/chat/stream` with a
market-specific system prompt and suggested prompts covering:

- "Walk me through listing my first x402 service"
- "What price should I charge per call for an LLM summarizer?"
- "Should I use exact or upto scheme for a token-counted endpoint?"
- "Generate a Bazaar discovery metadata block for my weather API"

The copilot can quote from your current listings (since they're in Convex)
and knows the pricing in both atomic USDC and dollars.

### 5. Build

Copy-paste seller quickstart: install the agentic wallet skill
(`npx skills add coinbase/agentic-wallet-skills`), Express `exact` scheme
middleware, Express `upto` scheme middleware, and a Bazaar discovery
metadata block. Matches the CDP x402 quickstart-for-sellers.

---

## Architecture

```
browser ──▶ /api/market/listings (Express, auth-gated)
              │
              ▼
          ConvexHttpClient ──▶ Convex (market_listings)
              ▲
              │  recordSettlement() after confirmed settle
x402 facilitator ──┘
```

- **Convex schema**: [`convex/schema.ts`](../convex/schema.ts) defines
  `market_listings` with indexes on `by_wallet`, `by_slug`, `by_status`,
  `by_createdAt`.
- **Convex functions**:
  [`convex/marketListings.ts`](../convex/marketListings.ts) exposes
  `listPublic`, `listByWallet`, `getBySlug`, `create`, `update`, `remove`,
  while [`convex/marketPayments.ts`](../convex/marketPayments.ts) exposes the
  idempotent settlement mirror/feed. Every mutation validates the listing
  relationship before counters are updated.
- **Express proxy**:
  [`server/api/marketListings.ts`](../server/api/marketListings.ts) mounts
  `/api/market/listings` routes and proxies to Convex via
  `ConvexHttpClient` — the browser never sees Convex credentials.
  Authentication reuses the existing
  `requireAuthenticatedClawdHolder` flow (`$CLAWD` balance check + admin
  bypass).
- **UI**:
  [`client/src/components/MarketListings.tsx`](../client/src/components/MarketListings.tsx)
  and
  [`client/src/components/MarketClawdAssistant.tsx`](../client/src/components/MarketClawdAssistant.tsx).
  The Market page at
  [`client/src/pages/Market.tsx`](../client/src/pages/Market.tsx) and the
  Bazaar page at [`client/src/pages/Bazaar.tsx`](../client/src/pages/Bazaar.tsx)
  both render these and share the same Convex records — Bazaar filters to
  Solana networks.

## Settlement verification and idempotency

The facilitator now writes to two places intentionally:

- **SQL `payment_events`** is the authoritative facilitator audit log.
- **Convex `market_payment_events`** is the public/UI projection used by
  `/market` and `/bazaar`.

Why split them:

- SQL keeps every verify/settle attempt, including failures, reasons,
  signatures, payer wallets, and commission accounting.
- Convex keeps the marketplace state fast, queryable, and idempotent for the
  holder-facing UI.

On a successful payment:

1. `x402Facilitator.settle()` submits the signed Solana tx to RPC.
2. It waits for confirmation before treating the payment as settled.
3. It marks the SQL row `settled`.
4. It mirrors the sale into Convex with `marketPayments.recordSettlement`.
5. Convex checks `by_signature` first, so a retried settlement cannot
   increment listing counters twice.

This is what powers the bazaar leaderboard correctly: revenue and sales are
derived from **confirmed on-chain settlements**, not optimistic UI writes.

### Public settlement feed

`GET /api/market/settlements` returns recent confirmed settlement events from
the Convex projection and powers the "Recent Settlements" panel on `/bazaar`.

Query params:

- `limit`: 1-100, default `25`
- `slug`: filter to a single listing slug
- `wallet`: filter to a seller wallet

---

## CDP Server Wallet integration

Sellers who don't want to use their personal Phantom wallet as the
`recipientWallet` can provision a **Coinbase Developer Platform Server
Wallet** straight from the market surface. CDP holds the signing key inside
its Trusted Execution Environment — the seller never sees a private key and
Clawd never sees one either. USDC still lands on-chain on Solana mainnet.

### Why use a CDP-managed recipient

- **Key hygiene** — the wallet that receives x402 payments is a different
  key than the wallet the seller uses to sign into Clawd. Compromising one
  doesn't compromise the other.
- **Programmable payouts** — the CDP account can be funded, swept, or
  split by any automation that has CDP credentials, without re-prompting a
  browser extension for every signature.
- **Consistent priority-fee behaviour** — CDP's `sendTransaction` auto-
  inserts compute-budget instructions with reasonable defaults, so
  transactions from the seller's automation don't die on `BlockhashNotFound`
  or land after the validator leader window.

### Endpoints (Express → CDP SDK)

| Method | Path | Purpose | Auth |
| --- | --- | --- | --- |
| `GET` | `/api/market/cdp/status` | `{ configured, network }` — UI uses this to render the "Use CDP wallet" button only when CDP is wired | public |
| `POST` | `/api/market/cdp/wallet` | create-or-get a managed Solana account named `clawd-market-{slug}-{suffix}` | $CLAWD holder |
| `GET` | `/api/market/cdp/wallets` | list every managed account the authenticated seller has created | $CLAWD holder |
| `GET` | `/api/market/cdp/confirm/:signature` | confirm a Solana tx signature through CDP's RPC path | public |

The server helper lives at
[`server/_core/cdpSolana.ts`](../server/_core/cdpSolana.ts); the Express
glue is in [`server/api/marketCdp.ts`](../server/api/marketCdp.ts). The
helper exposes `createAccount`, `getOrCreateAccount`, `listAccounts`,
`getSolBalance`, `confirmSignature`, `signTransaction`,
`broadcastSignedTransaction`, `sendSol`, and `sendSolViaOwnNode` — the
latter two cover both the "CDP signs and sends" and "CDP signs, you
broadcast via your own Helius RPC" flows from the CDP docs.

### Onramp deep link

`buildOnrampUrl({ destinationAddress, asset: "USDC" })` in `cdpSolana.ts`
generates a Coinbase Onramp URL that deposits USDC directly onto the
seller's Solana wallet. Sellers can drop this into their landing page so
first-time buyers who don't have USDC yet can fund their wallet in two
clicks and then pay the 402 challenge.

Set `COINBASE_CLIENT_ID` in the server environment to enable onramp links.

---

## Priority fees and reliable submission

Solana transactions can get stuck or dropped on a busy leader if they don't
attach a compute-unit price. Every transaction built through the CDP helper
accepts optional `computeUnitPriceMicroLamports` and `computeUnitLimit`
arguments that are prepended as `ComputeBudgetProgram.setComputeUnitPrice`
+ `setComputeUnitLimit` instructions before the main transfer.

Example — build + sign via CDP, broadcast via our own Helius RPC:

```ts
import {
  buildSolTransferTransaction,
  signTransaction,
  broadcastSignedTransaction,
} from "@/server/_core/cdpSolana";

const { serializedTransaction } = await buildSolTransferTransaction({
  from: sellerCdpAddress,
  to: buybackWallet,
  lamports: 1_000_000,
  computeUnitPriceMicroLamports: 5_000, // ~0.005 lamports per CU
  computeUnitLimit: 300_000,             // upper bound
});
const { signedTransaction } = await signTransaction({
  address: sellerCdpAddress,
  serializedTransaction,
});
const { signature } = await broadcastSignedTransaction({ signedTransaction });
```

When the facilitator settles a buyer-signed x402 transaction it calls
`connection.sendRawTransaction(..., { skipPreflight: false, preflightCommitment: "confirmed" })`
and then `connection.confirmTransaction` with the latest blockhash. Only
after that confirmation returns without an error does it:

1. Mark the SQL `payment_events` row as `settled` and store the signature.
2. Call `marketPayments.recordSettlement` into Convex (keyed by signature).
3. Increment the listing's `totalSales` / `totalRevenueAtomic` / `callCount`
   in the same Convex transaction.

Convex checks `by_signature` first, so a duplicate `recordSettlement` call
(facilitator retry, RPC replay, operator re-running settle for debugging)
returns `{ duplicate: true }` and **does not** double-count the sale.

---

## Presence (live seller/buyer signal)

`/api/market/presence` provides a lightweight liveness signal adapted from
Claw3D's [`/api/office/presence`](../Claw3D-main/src/app/api/office/presence/route.ts)
pattern. Storage is an in-memory ring buffer with a 10-minute freshness
window — intentionally ephemeral, since the authoritative record of
marketplace activity is `market_payment_events` in Convex.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/market/presence` | public | `{ total, sellers, buyers, sample }` for the last 10 min |
| `POST` | `/api/market/presence` | $CLAWD holder | heartbeat; body `{ role: "seller" \| "buyer", page: "market" \| "bazaar", slug? }` |

The UI heartbeats on a 60-second interval when the page is visible. A bad
actor spamming heartbeats is bounded — same-wallet re-posts only update
`lastSeen`, and the process caps at 2000 entries (oldest dropped first).

---

## Claw3D integration scope

[Claw3D](../Claw3D-main/README.md) is an independent sibling project — a
3D workspace for AI agents built on Next.js + three.js. It has its own
server (`server/*.js`) and a rich agent-collaboration API (`/api/office/*`).
Only the patterns that map cleanly onto the x402 market/bazaar surface are
ported here:

| Claw3D module | Adaptation here | Status |
| --- | --- | --- |
| `/api/office/presence` | `/api/market/presence` (in-memory liveness) | ✅ ported |
| `server/access-gate.js` | Already covered by `requireAuthenticatedClawdHolder` | — skip |
| `server/network-policy.js` | Not relevant (Express host binding is in fly.toml / env) | — skip |
| `server/studio-settings.js` | Our ENV-based config replaces file-backed settings | — skip |
| `server/gateway-proxy.js` | We speak Helius RPC directly; no gateway proxy | — skip |
| `/api/office/call` / `text` / `voice` | Agent collaboration — separate product, not market | deferred |
| `/office` page + `/office/builder` | 3D visualization — separate surface under `/Users/8bit/Downloads/clawd-terminal/Claw3D-main/` | deferred |
| `scripts/` | Project-specific Next.js setup scripts | — skip |

The `/office` 3D visualization and Claw3D's agent-collaboration API
(`call`, `text`, `voice`, `github`, `publish`, `standup`, `browser-preview`)
are genuinely different surfaces from the x402 marketplace. Porting them
would be a new product-scope decision, not a robustness improvement, and
is left to a separate initiative.

---

## Robustness checklist

| Concern | Mitigation |
| --- | --- |
| Listing ownership tampering | Every Convex mutation validates `walletAddress` matches the authenticated session before patching rows |
| Double-counted sales | `market_payment_events.by_signature` index guards the `recordSettlement` mutation — retries return `duplicate: true` |
| Unconfirmed payments projected into UI | `x402Facilitator.settle` calls `confirmTransaction` before the Convex mirror runs |
| Seller leaks personal key | CDP Server Wallet option provisions a TEE-managed recipient per seller/listing |
| Stuck transactions on a busy leader | Priority-fee helpers in `cdpSolana.ts` prepend compute-budget instructions; CDP's `sendTransaction` also injects defaults |
| RPC outage hides real holders | `requireAuthenticatedClawdHolder` returns `503 holder-check-unavailable` instead of `403` when Helius blips |
| Catalog spam | 64 KB request body cap, slug regex `^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$`, description ≤ 4000 chars, 12 endpoints max per listing |
| Buyer replay | x402 signature + nonce + expiry enforced in `verifyCore`; on-chain SPL USDC transfer is non-replayable per signature |

---

## Quickstart for Buyers (agents)

> Full upstream doc: `https://docs.cdp.coinbase.com/x402/quickstart-for-buyers`

### Install

```bash
# TypeScript
npm install @x402/fetch @x402/evm @x402/svm @x402/core @x402/extensions

# Go
go get github.com/coinbase/x402/go

# Python
pip install "x402[httpx,svm]"
```

### Wrap fetch so 402s are handled automatically

```typescript
import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { registerExactSvmScheme } from "@x402/svm/exact/client";
import { createKeyPairSignerFromBytes } from "@solana/kit";
import { base58 } from "@scure/base";

const signer = await createKeyPairSignerFromBytes(
  base58.decode(process.env.SOLANA_PRIVATE_KEY!),
);

const client = new x402Client();
registerExactSvmScheme(client, { signer });

const fetchWithPayment = wrapFetchWithPayment(fetch, client);

const res = await fetchWithPayment(
  "https://api.exa.ai/search", // from /market browse
  { method: "POST", body: JSON.stringify({ query: "solana x402" }) },
);
```

On a 402 response the wrapper parses the `PAYMENT-REQUIRED` header, signs a
Solana USDC transfer (or EVM EIP-3009), and retries the request with the
`PAYMENT-SIGNATURE` header. Your handler only sees the final 200.

### Multi-network clients

Register both EVM + SVM to let the client pick per-service:

```typescript
const client = new x402Client();
registerExactEvmScheme(client, { signer: evmSigner });
registerExactSvmScheme(client, { signer: svmSigner });
```

## CDP Server Wallet: robust Solana sends

[`server/_core/cdpSolana.ts`](../server/_core/cdpSolana.ts) now supports both
CDP's direct send path and the "bring your own node" path from the official
Solana docs.

Helpers:

- `sendSol()` — CDP signs and broadcasts in one call.
- `buildSolTransferTransaction()` — creates a transfer with a fresh blockhash.
- `signTransaction()` — CDP signs an unsigned base64 tx.
- `broadcastSignedTransaction()` — sends and confirms the signed tx over our
  own RPC.
- `sendSolViaOwnNode()` — CDP-sign + Helius-broadcast flow.
- `confirmSignature()` — explicit confirmation helper for downstream callers.

### Priority fee support

Following Coinbase's Solana transaction guide, the helper accepts optional:

- `computeUnitPriceMicroLamports`
- `computeUnitLimit`

These map to Solana compute-budget instructions so managed-wallet sends can bid
priority fees instead of relying on default inclusion behavior.

---

## Quickstart for Sellers (holders)

> Full upstream doc: `https://docs.cdp.coinbase.com/x402/quickstart-for-sellers`

### Option A — register through Clawd (fastest)

1. Go to [/market](../client/src/pages/Market.tsx) → **Your Listings** →
   **New Listing**.
2. Paste the homepage URL of your service; hit **Import**. Firecrawl fills
   name + description + homepage.
3. Add at least one endpoint (method, URL, price in USDC).
4. Pick networks (default `solana-mainnet`) and visibility (`public` puts
   you in the catalog).
5. Save.
6. Copy the **x402 payload** button from the listing card and paste it into
   your service's 402 response.

Payments flow through the Clawd x402 facilitator, which calls
`marketPayments.recordSettlement()` back into Convex after confirmed
settlement so your listing's `totalSales` and `totalRevenueAtomic` update in
real time.

### Option B — own your middleware

If you want to host the 402 logic yourself (say, on Cloudflare Workers or
your own Express server), install the x402 SDK and point at your chosen
facilitator:

```ts
import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();
const payTo = "0xYourAddress"; // or your Solana address

const facilitatorClient = new HTTPFacilitatorClient({
  // Testnet — no signup
  url: "https://x402.org/facilitator",
});

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme());

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          { scheme: "exact", price: "$0.001", network: "eip155:84532", payTo },
        ],
        description: "Current weather for any location",
        mimeType: "application/json",
      },
    },
    server,
  ),
);

app.get("/weather", (_req, res) =>
  res.json({ temperature: 72, conditions: "sunny" }),
);
```

Mainnet = CDP facilitator:

```ts
import { facilitator } from "@coinbase/x402";
const facilitatorClient = new HTTPFacilitatorClient(facilitator);
```

### `exact` vs `upto`

- **exact** — the client pays the advertised price. Works everywhere (EVM,
  Solana), every SDK. Use this for fixed-price endpoints.
- **upto** — the client authorizes a max, you settle only what was used.
  EVM only; TS/Go/Python SDKs. Use this for LLM calls, byte-metered APIs,
  compute time.

```ts
setSettlementOverrides(res, { amount: "50%" });
// or atomic units: "1000" (= $0.001 USDC)
// or dollars:      "$0.05"
```

---

## Opt into Bazaar discovery

> Full upstream doc: `https://docs.cdp.coinbase.com/x402/bazaar`

The x402 Bazaar is Coinbase's discovery layer — it indexes endpoints the
first time the CDP facilitator processes a payment through them. Agents can
then query `/v2/x402/discovery/resources` to find new services by
category, tag, price, schema.

Two prerequisites to get indexed:

1. Use the **CDP facilitator** (not x402.org) for production.
2. Declare a discovery extension on your route.

```ts
import {
  bazaarResourceServerExtension,
  declareDiscoveryExtension,
} from "@x402/extensions/bazaar";

server.registerExtension(bazaarResourceServerExtension);

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: {
          scheme: "exact",
          price: "$0.001",
          network: "eip155:8453", // Base mainnet
          payTo: "0xYourAddress",
        },
        extensions: {
          ...declareDiscoveryExtension({
            output: {
              example: { temperature: 72, conditions: "sunny" },
              schema: {
                properties: {
                  temperature: { type: "number" },
                  conditions: { type: "string" },
                },
                required: ["temperature", "conditions"],
              },
            },
          }),
        },
      },
    },
    server,
  ),
);
```

The Clawd `/market` Browse tab mirrors public Bazaar data via
`api.agentic.market`. If your service is in the Bazaar, it lands here too —
and if you also push metadata into the Clawd Convex catalog via **Your
Listings**, you get a second distribution surface.

---

## Facilitator cheat sheet

> Full upstream doc: `https://docs.cdp.coinbase.com/x402/facilitator`

| Environment | URL | Networks | Auth |
| --- | --- | --- | --- |
| **CDP** (recommended for mainnet + prod) | `https://api.cdp.coinbase.com/platform/v2/x402` | Base, Base Sepolia, Polygon, Arbitrum, World, World Sepolia, Solana, Solana Devnet | CDP API keys |
| x402.org | `https://x402.org/facilitator` | Base Sepolia, Solana Devnet | None |
| **Clawd** | `solanaclawd.com/api/x402/facilitator/*` | solana-mainnet, solana-devnet | Wallet session or service token |

CDP's pricing as of Apr 2026: 1,000 transactions/month free, then $0.001
per transaction. Clawd facilitator is free for $CLAWD holders (no
per-request fee) — holders pay only the underlying Solana fee + the
routing commission set on their listing.

---

## CAIP-2 network identifiers

Every x402 route declares its network in CAIP-2 format. Most common:

| Network | CAIP-2 | Use |
| --- | --- | --- |
| Base mainnet | `eip155:8453` | Production USDC payments on Base |
| Base Sepolia | `eip155:84532` | Testnet |
| Polygon | `eip155:137` | Production USDC on Polygon |
| Arbitrum | `eip155:42161` | Production USDC on Arbitrum |
| Solana mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | Production SPL USDC |
| Solana Devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` | Testnet |

The Clawd catalog accepts short names (`solana-mainnet`, `base`,
`base-sepolia`, …) for readability — the server normalises before storing.

---

## API reference (Clawd)

### `GET /api/market/listings`

Public catalog read. Returns all `active` + `public` listings in reverse
chronological order.

```bash
curl https://solanaclawd.com/api/market/listings?limit=50&category=Search
```

```json
{
  "listings": [
    {
      "_id": "…",
      "slug": "my-weather",
      "name": "Weather API",
      "description": "Real-time weather for any city",
      "endpoints": [
        {
          "method": "GET",
          "url": "https://api.example.com/weather",
          "priceAtomic": 1000,
          "currency": "USDC"
        }
      ],
      "networks": ["solana-mainnet"],
      "totalSales": 42,
      "totalRevenueAtomic": 42000
    }
  ]
}
```

### `GET /api/market/listings/mine`

Auth required. Returns every listing owned by the authenticated wallet.

### `GET /api/market/settlements`

Public. Returns recent confirmed settlement events mirrored into Convex.

```bash
curl "https://solanaclawd.com/api/market/settlements?limit=10"
curl "https://solanaclawd.com/api/market/settlements?slug=my-weather"
```

### `POST /api/market/listings`

Auth required. Create a listing. Body shape:

```json
{
  "slug": "my-weather",
  "name": "Weather API",
  "description": "…",
  "category": "Weather",
  "tags": ["forecast", "real-time"],
  "homepage": "https://…",
  "networks": ["solana-mainnet"],
  "endpoints": [
    {
      "method": "GET",
      "url": "https://api.example.com/weather",
      "description": "Get current weather",
      "priceAtomic": 3000,
      "currency": "USDC"
    }
  ],
  "visibility": "public"
}
```

### `PATCH /api/market/listings/:id`

Auth required. Owner-only. Any subset of create fields (slug is immutable).

### `DELETE /api/market/listings/:id`

Auth required. Owner-only. Hard delete.

---

## Pricing heuristics

If you're new to pricing agent-callable endpoints, start here:

| Endpoint kind | Typical price | Scheme |
| --- | --- | --- |
| Read-only lookup (price, balance, slot) | $0.0001–$0.001 | exact |
| Structured data scrape | $0.001–$0.01 | exact |
| Small LLM prompt (< 2K tokens) | $0.005–$0.02 | upto |
| Large LLM prompt / long-context | $0.02–$0.20 | upto |
| Image generation | $0.01–$0.10 | exact |
| Compute task (short) | $0.005–$0.05 | upto |
| Custom workflow (multi-step) | $0.05+ | upto |

These are the defaults the Clawd copilot will suggest. Your mileage varies
by provider cost, latency, and how agent-native the use case is.

---

## Further reading

- [`docs/monetize.md`](./monetize.md) — the existing monetize dashboard flow
- [`docs/x402-proxy-worker.md`](./x402-proxy-worker.md) — Cloudflare worker
  that wraps third-party APIs with x402
- [`docs/agents-x402-sdk.md`](./agents-x402-sdk.md) — Clawd's typed x402
  client (`@solanaclawd/x402-client`)
- [`docs/mpp-compatibility.md`](./mpp-compatibility.md) — Machine Payment
  Protocol framing on Solana
- [ARTICLE_MARKET.md](../ARTICLE_MARKET.md) — the longer-form writeup

Questions or bugs: open an issue on
`https://github.com/x402agent/solana-clawd`, or ask the Clawd copilot on
[/market](../client/src/pages/Market.tsx) directly.
