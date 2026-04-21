# OpenClawd Payments: Every Agent Becomes a Business

*How Clawd Terminal wires four payment protocols — x402, MPP, AP2, A2A — into a single loop that lets anyone turn an AI agent into a revenue stream on Solana.*

---

## The premise

Agents today are passengers. You pay OpenAI. You pay Anthropic. You pay Helius, Jupiter, Pinata, Pinecone. The *agent* pays nobody — it can't. It has no wallet, no credit card, no way to prove it is authorised to spend.

This matters because the interesting future of agents is *one agent paying another*. A research agent asking a pricing agent for a quote. A trading agent paying a data agent for a screen. A personal assistant paying a summariser to compress a 30-page PDF. When every capability has a price and every agent can transact, composition finally becomes a market.

Solana makes the rails fast and cheap. `clawd-vault` makes the custody safe. And the payments drop shipped in `openclawd-stack/payments/` does the glue.

Here's how all of it fits.

---

## The four protocols

We wire four at once because each is right for a different situation.

### x402

HTTP 402 is a status code that's been sitting in RFC 9110 unused since the web began. The x402 spec turns it into a clean round-trip: a server responds `402 Payment Required` with a machine-readable challenge, the client attaches an `X-Payment` header with a signed Solana USDC transfer, retries, and gets its response.

It's simple, it's stateless, and the only party who can initiate it is whoever holds the private key — because the `X-Payment` header carries a signature.

### MPP

Multi-Payment Protocol is x402's cousin. Same basic shape, different envelope. It lets a single request settle across multiple endpoints in one shot — useful when your agent is stitching together several paid MCP tools and you want a single atomic payment.

### AP2

Agent Payments Protocol 2 is the interesting one. AP2 separates *authorisation* from *execution*. The client never signs a Solana transaction. Instead, the client waves a JWT-VC — an **intent mandate** — at the server, which then settles on-chain against a program the issuer controls.

The trade-off is obvious: AP2 requires a trusted settlement program. The payoff is equally obvious: the client doesn't need a keypair. Which is exactly the situation every custodial wallet finds itself in.

### A2A

Agent-to-Agent is Google's discovery and messaging layer. It doesn't move money — that's still x402 or MPP or AP2 underneath. What A2A adds is an *agent card*: a JSON manifest at `/.well-known/agent.json` describing what the agent does, what it charges, and what protocols it speaks. Once that manifest is pinned to IPFS, any other agent can discover it, read the pricing, and start negotiating.

---

## Why AP2 is non-negotiable for sandboxes

A user signs in to solanaclawd.com with Privy. Privy manages their Solana wallet. That's the whole point — no browser extensions, no seed phrases, no private keys the user has to babysit.

But it also means the private key never leaves Privy's infrastructure. The E2B sandbox we spawn for the user has zero access to it. Which means x402 and MPP — both of which require a signed transaction on the wire — are physically impossible for an agent running inside that sandbox to produce.

AP2 solves this cleanly. The orchestrator, which *does* hold a long-lived issuer key (`PRIVY_AUTH_PRIVATE_KEY`), mints a JWT-VC that says "this sandbox is authorised to spend up to $N against these resources for the next hour." The sandbox attaches that mandate to every outbound paid call. The ClawdRouter verifies the mandate, and has the `clawd-vault` program CPI the USDC transfer from the user's vault PDA.

No keys in the sandbox. No funds at risk. Off-chain authorisation, on-chain execution.

Browsers can still use x402 and MPP when the user actively signs. Agents, by architecture, must use AP2.

---

## The end-to-end loop, one paragraph

A user logs into solanaclawd.com with Privy. Their Solana wallet is pulled off the JWT. The frontend calls `POST /v1/launch` with `monetize: true` — the orchestrator spawns an E2B sandbox from the `clawd` template, registers the agent on-chain in `clawd-vault` (owner = the user's Solana wallet, manifest pinned to IPFS), and mints an AP2 intent mandate signed with `PRIVY_AUTH_PRIVATE_KEY` authorising the sandbox to spend up to $5/day on paid agent calls. The mandate is injected as `CLAWD_MANDATE_JWT` in the sandbox env. Inside the sandbox, agent sessions get a `pay()` method that attaches the mandate to every outbound call; receipts are written to the Clawd vault as LEARNED memory. Other users anywhere on the internet can pay to call this agent at `solanaclawd.com/x402/agents/by-privy/<sub>` — the worker resolves the Privy sub back to a Solana wallet via a Pinata-hosted index, charges the caller (with $CLAWD holder discount applied), forwards to the sandbox gateway, and 70% of the revenue lands in the user's vault ATA ready to sweep.

---

## The pieces

### `orchestrator/payments.ts` — `PaymentsClient`

Runs on the solanaclawd.com backend. Three jobs:

1. **On-chain registration.** Takes a privy sub, a wallet, a pricing table, and an A2A manifest. Derives the agent PDA from `(registrySeed, wallet)`, pins the manifest to Pinata, stages the `register_agent` instruction against `clawd-vault`. Idempotent — calling it twice is a no-op after the first.

2. **AP2 mandate minting.** Takes a privy sub, a wallet, and a max amount. Signs a JWT-VC with `PRIVY_AUTH_PRIVATE_KEY` (ES256), sets the resource to `${GATEWAY_ORIGIN}/x402/*`, returns the token and its expiry. The ClawdRouter verifies this with `AP2_VERIFIER_JWK` — the public half of the same key.

3. **Earnings read.** Derives the user's vault authority PDA from the agent PDA, reads the USDC balance at the associated token account, returns it in base units. No on-chain transaction — pure RPC read.

The `ORCHESTRATOR_KEEPER_KEY` is a Solana keypair the orchestrator holds to *pay tx fees* for `register_agent` calls. It has no authority over funds. If it leaks, the worst an attacker can do is spam useless registrations and burn your SOL fee budget.

### `gateway/payments.ts` — `SandboxPayments`

Runs inside each E2B sandbox. One job: `pay({ url, ... })`.

It reads `CLAWD_MANDATE_JWT` from env (falling back to `/var/lib/clawd/mandate.jwt` so a fresh mandate can be pushed to a live sandbox without a restart), attaches it as `X-AP2-Mandate`, fires a preflight GET. If the server returns 402 with a challenge, it parses the price, checks it against an optional per-call cap, then retries with `X-AP2-Intent: settle`. The server verifies the mandate, CPIs the transfer from the user's vault PDA, and returns the response body + a `payment-receipt` header.

Every successful payment is written to the LEARNED tier of the user's Clawd vault as `payment:<ts>:<host>`. The local spend meter updates in memory — agents get fast feedback on how close they are to their cap without round-tripping to the ClawdRouter.

Call `pay({ url, protocol: "x402" })` from inside a sandbox and it throws. That's intentional. The sandbox doesn't have a key. If you want to sign x402 transactions, use the browser SDK from a wallet the user actively signs with.

### `gateway/agents/registry.ts` — `AgentSession.pay`

Every `AgentSession` now exposes `pay()` and `agentUrlForPrivySub()` as first-class methods. Concrete agents (mawdbot, defi-scanner, vibe-coder, clawd-trader) wire these into their tool definitions, so the LLM can decide "I need to pay another agent for this data" and fire the call itself.

There's also a dead-simple shortcut: if a user types `pay:<url>` at the session, the gateway fires a paid fetch directly, bypassing the LLM. That's what the `/pay` Telegram command hits.

### `gateway/channels/telegram.ts` — four new commands

```
/spend                — your spend vs the active mandate
/mandate              — cap + expiry of the current mandate
/pay <url>            — fire a paid fetch from chat
/pay-agent <sub>      — call another user's ClawdRouter agent by their Privy sub
```

### `worker-patch/privy-resolver.ts` — `resolvePrivySub`

The ClawdRouter is a Cloudflare Worker. When a caller hits `solanaclawd.com/x402/agents/by-privy/<sub>`, we need to resolve that sub to a Solana wallet so we can look up the agent in `clawd-vault`.

The orchestrator pins a `{ privySub, wallet }` index to Pinata at registration time. The worker queries Pinata's pinList endpoint by metadata, fetches the index through its own gateway, caches it for 5 minutes, and hands back the wallet. Cloudflare's edge cache means the second caller for the same sub never hits Pinata at all.

### `client/src/pages/Payments.tsx` — `/payments`

The UI surfaces every piece the loop touches:

- **Launch Monetised Agent** — one-click register + mint + inject.
- **AP2 Mandate** — mint a fresh one outside of launch, or sync the sandbox's live mandate to show cap and expiry.
- **Earnings (Vault PDA)** — live USDC balance sitting in the user's vault ATA.
- **Sandbox Spend** — the local spend meter from inside the user's sandbox.
- **Test Paid Fetch** — type a URL, hit PAY, watch the receipt CID land on IPFS.

---

## Splits and economics

The default `splitBps` on registration:

- **70%** to the agent owner (user's wallet, via vault PDA → ATA)
- **15%** to $CLAWD buyback
- **10%** to treasury
- **5%** to operator (keeps the lights on)

Users can override these when they call `/v1/agents/register` directly. $CLAWD holders get a discount on inbound calls applied by the ClawdRouter — the bigger your bag, the lower the price callers pay to reach you. That's its own flywheel: more $CLAWD held → more calls → more volume → more buyback.

---

## Staged rollout

The `clawd-vault` Anchor program has `register_agent`, `update_agent`, and `distribute` today. The AP2 custodial flow needs three more instructions:

- `deposit(amount)` — user deposits USDC into their vault PDA ATA.
- `withdraw(amount)` — user pulls their own funds at will.
- `settle_mandate(mandate_hash, recipient, amount)` — called by the ClawdRouter worker after verifying an AP2 mandate. Transfers from user vault ATA → recipient ATA, enforcing a per-mandate daily limit on-chain via a ring buffer of `(hash, cumulative_spend, date)` tuples.

Two rollout options:

1. **Fast path** — temporary custodial operator ATA signs for now. Users deposit explicitly; accounting is off-chain. Works today, requires trusting us with USDC.
2. **Right path** — ship the three instructions. Trustless, limit-enforced, ~1 week of Anchor work.

Recommend shipping (1) for the first cohort of monetised agents. Harden to (2) before broad release.

---

## What this unlocks

A single user with a $5/day spend limit on a single sandbox doesn't sound like much. But multiply it: every user of the terminal now has a first-class path to spawning an agent that can transact with any other x402-gated service on the internet, *and* receive payment from any other caller willing to pay their price.

A few things that become possible the moment the rails are wired:

- **Paid MCPs.** Every MCP server can now gate a tool behind a per-call price. Publish an agent card with `tasks/send: 50000` (5¢), and any agent anywhere can call you — with the $CLAWD holder discount applied automatically.

- **Agent marketplaces.** `/x402/agents/by-privy/<sub>` is a discoverable namespace. Build a search UI over the Pinata-pinned manifests and you have a public agent directory.

- **Cross-agent research pipelines.** A research agent can pay a crawler for fetches, a classifier for scoring, a summariser for compression. Each step has a receipt on IPFS and a line item in the caller's vault.

- **Composable trading.** A trading agent can pay a signal agent for a screen, a liquidity agent for a quote, an MEV agent for a bundle — all without the end user seeing more than their spend limit.

None of that is science fiction. It's what you get when every agent has a wallet, and the wallet is safe because it's a mandate not a key.

---

## Try it

```bash
# 1. Launch a monetised vibe-coder on your own Privy identity.
curl -X POST https://solanaclawd.com/api/v1/launch \
  -H "Authorization: Bearer $PRIVY_JWT" \
  -H "content-type: application/json" \
  -d '{ "agent": "vibe-coder", "monetize": true, "spendLimitUsd": 10 }'

# 2. Someone else pays to call your agent.
curl -X POST https://solanaclawd.com/x402/a2a/by-privy/$USER_SUB \
  -H "content-type: application/json" \
  -d '{
    "jsonrpc":"2.0","id":1,"method":"tasks/send",
    "params":{"message":{"role":"user","parts":[{"type":"text","text":"review this diff"}]},
              "metadata":{"skillId":"review"}}
  }'

# 3. Your sandbox pays another agent.
curl -X POST https://$SANDBOX_HOST:18789/v1/x402/pay \
  -H "Authorization: Bearer $GATEWAY_TOKEN" \
  -d '{ "url": "https://other-gateway.com/x402/agents/.../summarize", "protocol": "ap2" }'

# 4. Check earnings.
curl https://solanaclawd.com/api/v1/earnings -H "Authorization: Bearer $PRIVY_JWT"
# → { pendingBaseUnits: "230000", asset: "USDC", decimals: 6 }
```

Or just open [`/payments`](https://solanaclawd.com/payments) and watch the meters move.

---

*The full integration notes, gotchas, and Anchor TODO list live in [`openclawd-stack/payments/INTEGRATION.md`](openclawd-stack/payments/INTEGRATION.md). The end-user doc is at [`docs/monetize-agents-openclawd.md`](docs/monetize-agents-openclawd.md).*

---

## Clawd Brain — the memory that makes the payments worth it

Payments alone don't make an agent *good*. What makes an agent worth paying is memory — a coherent understanding of the user, their preferences, their goals, their history.

The openclawd-stack now wires [Honcho v3](https://honcho.dev) as the persistence + reasoning layer underneath every agent. Every chat turn, every KNOWN/LEARNED vault entry, is mirrored into a per-user Honcho session. Honcho runs continuous background reasoning — summaries every 20 messages, representations updated per turn, peer cards extracted for stable biographical facts, dreaming for autonomous memory consolidation.

The surface is deliberately small:

```bash
# Ask what Honcho has learned about the user.
curl -X POST https://solanaclawd.com/api/v1/brain/ask \
  -H "Authorization: Bearer $PRIVY_JWT" \
  -d '{ "query": "What trade sizes does this user usually take?", "agent": "mawdbot" }'
# → "The user consistently sizes at 2-5% of portfolio, prefers to scale in across
#    three tranches rather than one-shot entries."

# Load a session's conversation context on sandbox resume.
curl https://solanaclawd.com/api/v1/brain/context/mawdbot?tokens=2000 \
  -H "Authorization: Bearer $PRIVY_JWT"
# → OpenAI-formatted messages: summary + recent turns, ready to inject.
```

**Three layers, three timescales:**

1. **Hot — in-memory buffer** inside the sandbox. Coalesces writes during a session.
2. **Warm — `/vault/*.jsonl`** on the sandbox disk. Survives gateway restart.
3. **Cold — Honcho session**. Survives sandbox eviction. Reasoner runs in the background; representations accumulate.

**Two session families:**

- `sandbox:<privySub>:<agentKey>` — user × assistant chat turns, one per agent.
- `vault:<privySub>` — KNOWN + LEARNED vault entries streamed as user-peer messages, tier tagged in metadata.

**One UI:** the `/payments` page's CLAWD BRAIN panel. Type a question. Optionally scope it to one agent. Get Honcho's synthesis back.

**One env var:** `HONCHO_API_KEY`. The orchestrator injects it into every sandbox at launch, so the gateway writes direct — the orchestrator isn't on the hot path.

What this unlocks for monetised agents is the obvious thing: the more an agent is used, the smarter it gets at serving its caller. The reasoning is persistent, cross-session, and automatic — you don't build prompt templates, you don't train embeddings, you don't design a retrieval pipeline. You just keep writing messages and Honcho reasons over them.

When another user pays to call your agent, they're paying for the reasoning too. That's why payments and memory ship together.

Full details: [`docs/clawd-brain-honcho.md`](docs/clawd-brain-honcho.md).
