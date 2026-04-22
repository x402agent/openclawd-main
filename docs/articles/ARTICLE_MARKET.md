# The Clawd Bazaar: Every $CLAWD holder is now an agentic-service business

*How /market and /bazaar wire Coinbase's x402 protocol, the agentic market
catalog, a Convex-backed seller ledger, Firecrawl auto-import, and a Clawd
copilot into a single page where a Solana wallet is a business license.*

---

## The premise

In 2026 the thing stopping your agent from calling a new service is never
the spec — it's the account. You hit a useful API, it wants a signup. You
want a key. You want a billing address. You want a team plan. Between your
agent wanting to do the thing and actually doing it are seven screens, four
of which are email validation.

x402 deletes those seven screens. The server responds `402 Payment
Required` with a machine-readable challenge. The client signs a USDC
transfer, retries, and gets the response. No signup, no key, no billing.
Just an HTTP round trip.

Coinbase built a catalog at `api.agentic.market` indexing the services that
speak this protocol. Clawd already knew every $CLAWD holder had a funded
Solana wallet and a session. Wiring one into the other gives us `/market`
and `/bazaar` — token-gated pages where a holder's wallet is their buyer
identity *and* their seller identity, and the only difference between
"browsing an agentic service" and "running one" is how many endpoints they
register.

---

## What ships

Two pages, one Convex table, four loops.

**`/market`** is the general front door. Five tabs:

- **Browse** live-queries `api.agentic.market/v1/services` with debounced
  search and category chips. This is Coinbase's data; we don't mirror it.
- **Your Listings** reads + writes a Convex `market_listings` table,
  scoped to the authenticated wallet. Paste a URL, Firecrawl auto-fills
  name + description + homepage, publish, done.
- **Monetize** is the existing x402 facilitator flow — register a slug,
  pick a price, let the Clawd facilitator verify + settle on your behalf.
- **Copilot** is a Clawd chat panel with a market-specific system prompt,
  streaming from the same endpoint Terminal uses.
- **Build** is copy-paste seller snippets: `exact` middleware, `upto`
  middleware, Bazaar discovery metadata.

**`/bazaar`** is the Solana-first earnings view on the same Convex data.
It filters to `solana-*` networks, leads with a revenue leaderboard, shows
live fee flow, and collapses the seller flow to a minimal "publish in two
minutes" form. Same backend; different cut.

Both routes are `<TokenGate>`d. Both routes treat your Solana wallet as
identity, wallet, and business license.

---

## The payment path

Four facilitators, one shape. Every participant in x402 is one of:

- A **buyer** (an agent, a client SDK, a human-in-the-loop) that has a
  signer and wants to call something.
- A **seller** (a service) that exposes HTTP endpoints and wants USDC per
  call.
- A **facilitator** that verifies the buyer's signature and settles the
  transfer on-chain.

The seller declares a route and a price in CAIP-2 format
(`solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp`, `eip155:8453`, etc.). The
buyer sends a plain HTTP request. The seller replies `402` with a
`PAYMENT-REQUIRED` header describing the challenge. The buyer signs a
USDC transfer, retries with a `PAYMENT-SIGNATURE` header, and gets the
response. The facilitator handles the onchain settlement and returns a
receipt the seller can trust.

That's it. One round trip extra on the first call. After that, each
request carries payment inline — no sessions, no auth cookies, no
asymmetric rate limits. An agent that wants to call a service for the
hundredth time looks exactly like an agent calling it for the first time.

---

## Why $CLAWD holders are the right audience

The hard part of x402 right now is not the protocol — it's the seed.

Someone has to build the catalog: list services, keep URLs fresh, iterate
pricing. Someone has to build the buyer side: wrap fetch, wrap axios, wire
multi-network signers. Someone has to run a facilitator on mainnet. The
ecosystem only gets interesting when enough services exist that an agent
can *compose* services — research → price → settle → write.

$CLAWD holders are already:

- Signed in with a Solana wallet (Phantom or Privy).
- Running Clawd CLI locally, or wallet-agents on our hosted runtime.
- Paying for LLM inference through ClawdRouter, which already speaks
  x402 internally for power-user tiers.
- Listed in a Convex-backed holder registry with `totalSpend` and
  `totalSaved` fields that make revenue math easy.

Every one of them can be a seller today. A holder with a fine-tuned Grok
prompt for a specific token has a paid endpoint. A holder with a curated
Firecrawl crawl has a paid endpoint. A holder running a local model on a
Jetson Nano has a paid endpoint. All they need is a slug, a price, and a
URL — and the `/market` form, after one Firecrawl import, takes about 90
seconds.

The Convex `market_listings` table is keyed to `walletAddress`. The
server-side auth is `requireAuthenticatedClawdHolder`. The facilitator
settles Solana USDC to the wallet that created the listing. There is no
fourth party. A holder turning on x402 doesn't need our permission and
doesn't have to trust us with their funds.

---

## Why Convex

The x402 catalog is not a database of *truth*. Truth lives on-chain: the
recipient wallet, the USDC transfer, the facilitator signature. What we
need off-chain is discovery: title, description, category, tags, sales
counters that update live as calls land.

Convex gives us five things the tRPC+Drizzle stack didn't:

1. **Live queries** — the Your Listings view refreshes automatically as
   the facilitator records sales. No polling.
2. **Indexes on wallet + slug + status** — the public Browse query is
   O(indexed) even when the catalog grows past tens of thousands of
   listings.
3. **Mutations with server-side auth** — every write validates
   `walletAddress` against the requesting session. Ownership is a
   first-class invariant, not a check we can forget.
4. **Schema-validated writes** — the Convex validators in
   `convex/marketListings.ts` enforce slug format and endpoint shape so
   malformed rows can't land.
5. **Idempotent revenue projection** — settled txs are mirrored into Convex
   by signature exactly once, so retries never double-count a seller's revenue.

The server talks to Convex via `ConvexHttpClient` (the same pattern used
by `/api/user/summary`), so the browser never sees Convex credentials.

The robust bit is that Convex is not the settlement layer, it's the
**idempotent public projection** of the settlement layer. The facilitator's SQL
`payment_events` table still records every verify/settle attempt. Once a
payment confirms on-chain, the facilitator mirrors it into Convex keyed by tx
signature. Retry the settle call if you want — the signature check short-circuits
and the listing counters do not double-count.

---

## Firecrawl is the onboarding gap

The reason catalogs like Product Hunt work is that listing is easy; the
reason most crypto catalogs are ghost towns is that listing is tedious.
If we want $CLAWD holders to actually list services, the form can't be
twelve fields of boilerplate.

Firecrawl fills that gap. Paste a URL; `trpc.firecrawl.scrape` fetches
the page with `formats: ["markdown", "summary"]`; we lift the title into
`name`, the summary into `description`, the URL into `homepage`. The
holder sees a draft listing, edits the parts that matter (price,
endpoints, category), and ships.

This is the same firehose we already use on `/fire`. The market form is
just another consumer.

---

## The copilot is the pricing advisor

Pricing an agent-callable endpoint is a weird skill. Too cheap and you
lose money on gas. Too expensive and nobody calls you. The right price
depends on your provider cost, your latency, how agent-native the use
case is, and what the existing catalog is charging for the same shape of
thing.

The Clawd Market Copilot has the whole page in its context. It can quote
prices from agentic.market services the user just browsed, compare them
to the user's own listings in Convex, and suggest a price tier based on
the seven-row heuristic table in `docs/market.md`. It can emit a full
`paymentRequirements` JSON on request. It can draft a Bazaar discovery
metadata block from a plain-English description of the endpoint.

Streaming is over `/api/chat/stream` — the same SSE endpoint Terminal
uses. The copilot is auth-gated, not x402-gated: talking to your own
market assistant about what to list should not charge you.

---

## The Bazaar angle

Coinbase's x402 Bazaar is the canonical discovery layer. Services that
use the CDP facilitator and declare a discovery extension get indexed
automatically the first time a payment flows through them. Agents can
then query `/v2/x402/discovery/resources` by category, tag, schema, or
price range.

Our Browse tab mirrors the Bazaar's public data via
`api.agentic.market`. If your service is in the Bazaar, it lands here
too. We don't replace the Bazaar — we surface it next to the holder's
own listings, their own monetize flow, and the seller quickstart.

The `/bazaar` page exists for the case where a holder doesn't want to
think about Base or Polygon. Solana-only filter, Solana-only networks in
the publish flow, Solana-only leaderboard. The Clawd facilitator under
the hood. The $CLAWD holder as the sole citizen.

---

## Making it robust

A bazaar is only useful if the counter on a listing card tells the truth.
If the number jumps because the UI optimistically incremented it, if it
doesn't move because the seller's RPC call timed out, if it double-counts
because the facilitator retried — the whole thing becomes theatre.

Four things keep it honest.

**Confirmed on-chain settlement gates every write.** The facilitator
submits the buyer-signed Solana transaction to our Helius RPC, calls
`confirmTransaction` with the latest blockhash + `lastValidBlockHeight`,
and only after that confirmation returns without an error does it touch
the ledger. Unconfirmed payments never make it into the public counters.

**Signatures are the idempotency key.** `market_payment_events.by_signature`
is a unique Convex index. The `recordSettlement` mutation looks up the
signature first; a duplicate call (facilitator retry, operator re-running
settle to debug, an RPC node that replayed a frame) returns
`{ duplicate: true }` and does not patch the listing's counters. The SQL
`payment_events` table keeps every attempt — verified, settled, failed —
with reason strings for audit. Convex keeps the public projection.

**CDP Server Wallet is a first-class recipient option.** Not every seller
wants their personal Phantom wallet to be a public paypoint. From the
listing form, a seller can provision a TEE-managed CDP Solana account —
CDP holds the private key, the seller never sees it, and USDC still lands
on Solana mainnet. The endpoints at `/api/market/cdp/*` are idempotent:
`POST /wallet` with the same suffix returns the same account every time.
`GET /wallets` lists every managed wallet the seller has created through
the market surface, so they can sweep proceeds back to cold storage on
their own cadence. The Coinbase Onramp deep link closes the first-buyer
loop — a brand-new agent operator can hit the seller's service, 402, fund
via Onramp, pay, and receive a response in the same browser tab.

**Priority fees are wired in.** The CDP helper's `buildSolTransferTransaction`
takes `computeUnitPriceMicroLamports` + `computeUnitLimit` and prepends
`ComputeBudgetProgram.setComputeUnitPrice` / `setComputeUnitLimit`
instructions before the main transfer. CDP's `sendTransaction` path
injects sensible defaults if the seller omits them, so a Clawd automation
sending USDC through CDP never dies on `BlockhashNotFound` or lands after
the leader window closes. Sellers who want to bring their own Helius RPC
can sign through CDP and broadcast through their own node via
`sendSolViaOwnNode` — the standard "CDP signs, you broadcast" flow.

Together these four commitments are what let the leaderboard be the
leaderboard. A wallet at the top of `/bazaar` is there because it earned
that USDC on Solana mainnet, from buyers who signed real transactions,
and the facilitator watched those transactions confirm before adding to
the counter. There is no phantom revenue, no optimistic projection, no
"almost settled." The number is the money.

---

## What a seller's day looks like

9:00am — A holder reads a thread on X about an LLM that's good at
extracting JSON from unstructured Solana transactions. They already have
a local model that does this.

9:05am — Holder opens `/market`, clicks **Your Listings**, **New
Listing**. Pastes their endpoint's docs URL. Firecrawl imports the name
"Solana Transaction Parser", a one-line description, and the homepage.

9:07am — They ask the Copilot "what should I charge per call for a
structured data extractor?". Copilot replies: "$0.005–$0.01 USDC in
exact scheme is the right tier based on what similar services in the
catalog charge. Use upto if your token count varies by input — your
endpoint's body length suggests you should."

9:08am — They fill in `slug: solana-tx-parser`, `price: 0.006`, pick
`solana-mainnet`, set visibility to `public`, save.

9:09am — Holder copies the `paymentRequirements` JSON from the listing
card and pastes it into their own Express middleware as the 402 response
template.

9:15am — First real request arrives. Their service 402s, the client
signs, the facilitator settles USDC to their wallet, the tx signature is
mirrored into Convex, the listing's `totalRevenueAtomic` increments, the
Your Listings view refreshes live.

9:16am — They watch the revenue counter tick for ten seconds because
they've been waiting three years for a catalog that actually works this
way.

9:20am — They post the listing link to their Telegram chat. Other
$CLAWD holders in the chat copy the slug into their own agents' tool
list so their agents can call it.

That's the loop. Every step compresses until the only manual piece is
the price, and the Copilot helps with that too.

---

## Where this goes

The current shape is buyer + seller + catalog + copilot on one page. The
next surfaces to wire in:

- **Leaderboards** — `/bazaar` already shows a top-earning-holders view.
  Extending this with weekly deltas and holder badges turns it into a
  distribution rail of its own.
- **Programmable payouts** — every successful call already lands in the
  settlement mirror. Next step is splitting revenue on-chain: a creator share,
  a $CLAWD buyback share, an operator share, all codified in a Solana
  program so the splits are trustless.
- **Agent-to-agent discovery** — when an agent hits a 402 on a service
  it doesn't know, the Copilot can query Convex for comparable listings
  and suggest cheaper or faster substitutes.
- **Paid access to Clawd's own surfaces** — `/fire`, `/repl`, `/voice`,
  `/predict` are all behind a $CLAWD gate today. Same surfaces, with an
  x402 path for non-holders, becomes a direct Solana USDC revenue stream
  to the treasury.
- **Cross-chain via CDP** — Base, Polygon, Arbitrum, World. The Convex
  schema already stores `networks[]` as an array. The facilitator layer
  already understands CAIP-2. Flipping on EVM sellers is a matter of
  pricing + UI, not architecture.
- **Managed-wallet seller ops** — `cdpSolana.ts` now supports both CDP's
  direct send path and the "sign with CDP, broadcast on our own node" flow,
  plus optional compute-budget priority fees. That gives us a clean path to
  treasury payouts, seller sweeps, and sponsored Solana actions without giving
  up onchain verification.

The protocol is a commodity. The agents are a commodity. The wallets are
a commodity. The thing that's rare is a place where all three meet a
user who actually wants to get paid. That's what `/market` and `/bazaar`
are.

---

## Links

- Page: [`/market`](./client/src/pages/Market.tsx) ·
  [`/bazaar`](./client/src/pages/Bazaar.tsx)
- Docs: [`docs/market.md`](./docs/market.md)
- Schema: [`convex/schema.ts`](./convex/schema.ts)
- Convex functions: [`convex/marketListings.ts`](./convex/marketListings.ts)
- Server proxy: [`server/api/marketListings.ts`](./server/api/marketListings.ts)
- UI: [`client/src/components/MarketListings.tsx`](./client/src/components/MarketListings.tsx),
  [`client/src/components/MarketClawdAssistant.tsx`](./client/src/components/MarketClawdAssistant.tsx)
- x402 spec: <https://docs.cdp.coinbase.com/x402/welcome>
- Agentic market: <https://agentic.market>

$CLAWD: `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
