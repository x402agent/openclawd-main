## OpenClawd Vision

**"The Hermes of Web3" — inspired by [Nous Research](https://nousresearch.com)'s Hermes agent philosophy.**

OpenClawd is the AI that actually does things — and settles them on-chain.
It runs on your devices, in your channels, with your rules, and pays for its own compute.

This document explains the current state and direction of the project.
We are still early, so iteration is fast.
Project overview and developer docs: [`README.md`](README.md)

OpenClawd evolved through several names and shells: Warelay -> Clawdbot -> Moltbot -> OpenClaw -> **OpenClawd**.

The goal? An autonomous agent system that's easy to use, supports a wide range of platforms, respects your privacy and security, and settles autonomously on Solana.

---

## OpenClawd Stack

```
Surfaces (chrome-extension, telegram, tailclawd, WatchApp, beepboop)
         ↓ HTTP / SSE / WebSocket
Cloud Bridge (port 8080) — WebSocket terminal → E2B sandboxes
         ↓ REST
OpenClawd Orchestrator (port 8787)
         │ Honcho brain — memory, peer.chat, session context
         │ E2B sandbox — per-user isolated agent sandboxes
         │ Privy wallet — embedded Solana wallet (auto-created on login)
         │ Solana MCP — 31 tools (Solana market data, Helius onchain, Pump.fun, memory, agent fleet, Metaplex)
         │ Payments Client — ClawdVault registry, AP2 mandates, Pinata manifest pinning
         │ Wurk x402 Bridge — social campaigns, agent-to-human jobs, multi-chain settlement (Solana/Base)
         ↓
ClawdRouter (57-model routing, payment-aware)
         ↓
Skills & Knowledge — ClawdHub marketplace, 90+ bundled SKILL.md bundles, ClawdVault security scanning
         ↓
Solana — Helius RPC · Jupiter · SPL USDC · $CLAWD
```

---

## Core Principles

**1. Autonomous by default**
Agents should act without asking for permission every step. Human approval at key decision points (OODA `ask` gate), not on every call.

**2. Payment-native**
Every agent call can carry a payment intent. x402, AP2 mandates, and $CLAWD discounts are first-class, not bolted on.

**3. Deny-first security**
ClawdVault scans every skill before publishing. AP2 mandates cap spend. Sandbox isolation for user-controlled execution. Signing flows are explicit and operator-controlled.

**4. Hermes philosophy**
Agents that think (Honcho brain), act (E2B sandbox + Solana MCP), and settle autonomously on-chain (x402 + AP2). No middlemen.

---

## Current Focus

**Priority:**
- Security and safe defaults (ClawdVault, deny-first policies)
- Bug fixes and stability
- Setup reliability and first-run UX
- Payment flow completeness (x402 + AP2 mandates)

**Next priorities:**
- 57-model ClawdRouter integration across all surfaces
- Wurk x402 social campaigns (17+ job types: xlikes, reposts, raids, etc.)
- Better computer-use and agent harness capabilities
- Ergonomics across CLI and web frontend
- Privy embedded wallet UX (auto-creation, balance display, transfer)
- Honcho brain integration (peer.chat, session context, summariser)

---

## Security

Security in OpenClawd is a deliberate tradeoff: strong defaults without killing capability.
The goal is to stay powerful for real work while making risky paths explicit and operator-controlled.

**ClawdVault** is the canonical security layer:
- Risk scanning for SKILL.md bundles
- Policy enforcement against security policies
- Vault certification (score-based approval system)
- Hardening with best practices

Canonical security policy and reporting:
- [`SECURITY.md`](https://github.com/x402agent/openclawd/blob/main/SECURITY.md)
- [`clawd-vault-master/`](https://github.com/x402agent/openclawd/tree/main/clawd-vault-master)

We prioritize secure defaults, but we also expose clear knobs for trusted high-power workflows.

---

## Skills & ClawdHub

Skills are the atom of capability in OpenClawd.
New skills should be published to **ClawdHub** ([hub.solanaclawd.com/marketplace](https://hub.solanaclawd.com/marketplace)) first, not added to core by default.

Core skill additions should be rare and require a strong product or security reason.

### SKILL.md Format

Every skill is a `SKILL.md` file with structured metadata:
- `id`, `name`, `description`, `version`
- `tools[]` — capability declarations
- `pricing` — x402/AP2 payment terms
- `security` — ClawdVault scan results
- `examples` — usage examples

---

## MCP Support

OpenClawd ships with **@openclawd/solana-clawd-mcp**: 31 MCP tools including:

**Solana Market Data:** `solana_price`, `solana_trending`, `solana_token_info`, `solana_wallet_pnl`, `solana_search`, `solana_top_traders`, `solana_wallet_tokens`

**Helius Onchain:** `helius_account_info`, `helius_balance`, `helius_transactions`, `helius_priority_fee`, `helius_das_asset`, `helius_webhook_create`

**Trading (Pump.fun):** `pump_token_scan`, `pump_buy_quote`, `pump_sell_quote`, `pump_graduation`

**Memory:** `memory_recall`, `memory_write`

**Agent Fleet:** `agent_spawn`, `agent_list`, `agent_stop`

**Metaplex:** `metaplex_mint_agent`, `metaplex_register_identity`, `metaplex_read_agent`

MCP bridge in orchestrator: [`openclawd-stack/orchestrator/mcp-bridge.ts`](https://github.com/x402agent/openclawd/tree/main/openclawd-stack/orchestrator/mcp-bridge.ts)

---

## Payments

**x402** — Solana-native payment protocol. First call returns 402 with payment info, retry with `PAYMENT-SIGNATURE` header.

**AP2** — Agent-to-agent payment intents. Mint mandates with spend limits and TTL.

**$CLAWD** — Utility token with holder discounts (10-50% based on balance).

| Protocol | Use |
|----------|-----|
| `x402` | Per-call skill payments |
| `AP2` | Subscription mandates, spend caps |
| `A2A` | Agent-to-agent messaging with payment |
| `MPP` | Multi-protocol payment routing |

---

## Surfaces

OpenClawd runs across multiple surfaces:

| Surface | Description |
|---------|-------------|
| **Telegram** | `@clawdtoken` bot — agent commands, pair codes |
| **Chrome Extension** | Page-agent bridge, inline AI |
| **TailClawd** | Browser-hosted Clawd Code over Tailscale |
| **WatchApp** | watchOS companion |
| **Cloud Bridge** | WebSocket terminal → E2B sandboxes |
| **ClawdCloudOS** | Browser-terminal cloud OS |
| **Beepboop** | macOS companion |
| **Chess** | Wallet-signed chess surface |

---

## What We Will Not Merge (For Now)

- New core skills when they can live on ClawdHub
- Commercial service integrations that do not clearly fit the model-provider category
- Wrapper channels around already supported channels without a clear capability or security gap
- Heavy orchestration layers that duplicate existing agent and tool infrastructure

This list is a roadmap guardrail, not a law of physics.
Strong user demand and strong technical rationale can change it.