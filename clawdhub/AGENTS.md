# OpenClawd Agent Guidelines

> "The Hermes of Web3" — inspired by [Nous Research](https://nousresearch.com)'s Hermes agent philosophy.

## OpenClawd Agent System

OpenClawd agents are autonomous AI assistants that run on Solana. Each agent has:

- **Brain** — Honcho peer.chat + session context for memory
- **Sandbox** — E2B isolated execution environment
- **Wallet** — Privy embedded Solana wallet (auto-created on login)
- **MCP tools** — 31 tools for Solana market data, Helius onchain, Pump.fun, memory, agent fleet, Metaplex
- **Payment** — x402/AP2 integration for skill monetization

---

## Agent Architecture

```
Privy JWT (user auth)
         ↓
OpenClawd Orchestrator (:8787)
         │
         ├─ HonchoClient.brainAsk() → peer.chat + session context
         ├─ SandboxManager.launch() → E2B sandbox
         ├─ WalletBridge.createWallet() → Privy embedded wallet
         ├─ McpBridge.callTool() → 31 MCP tools
         ├─ PaymentsClient.registerUserAgent() → ClawdVault registry
         └─ WurkBridge.createQuickJob() → Wurk.fun x402 (17+ job types)

OpenClawd Orchestrator
         ↓
ClawdRouter (57-model routing, payment-aware)
         ↓
Solana — Helius RPC · Jupiter · SPL USDC · $CLAWD
```

---

## Available Agents

| Agent | Description | Model | Tools |
|-------|-------------|-------|-------|
| **mawdbot** | Autonomous Solana trading agent — OODA loop + ClawdVault memory | xAI Grok | 31 MCP |
| **defi-scanner** | Pump.fun + Raydium scanner with SNIPE/BUY/SCALP/AVOID classifier | Claude Sonnet | 31 MCP |
| **clawd-trader** | Full $CLAWD ecosystem — perps via Hyperliquid/Aster | GPT-5.2 | 31 MCP |
| **vibe-coder** | Project-aware coding assistant | Claude Opus 4 | 31 MCP |

---

## OODA Trading Loop

```
OBSERVE  → sol_price, trending, helius_priority_fee, memory KNOWN
ORIENT   → score candidates (trend + momentum + liquidity)
DECIDE   → confidence ≥ 60? → size band (0.5x / 1.0x / 1.25x / 1.5x)
ACT      → trade_execute gated at ask permission (human approval required)
LEARN    → write INFERRED signals → Dream agent promotes to LEARNED
```

---

## Agent Lifecycle

```bash
# 1. User logs in via Privy → JWT issued
# 2. Orchestrator middleware extracts privySub
# 3. If no wallet, auto-create via WalletBridge
# 4. POST /api/v1/launch → SandboxManager.launch()
# 5. E2B sandbox starts → ClawdGateway connects
# 6. Agent runs in sandbox → MCP tools via McpBridge
# 7. Payments via PaymentsClient (AP2 mandates + x402)
# 8. Memory via HonchoClient (peer.chat + session context)
```

---

## Agent Registration

Agents are registered on-chain via the Payments Client:

```typescript
const reg = await payments.registerUserAgent({
  privySub,
  wallet,
  manifest: buildManifest(agent, privySub, wallet, pricing),
  pricing: Object.entries(manifest.pricing).map(([method, p]) => ({
    method,
    amountUsdcBaseUnits: BigInt(p.amount),
  })),
});
```

Manifest includes: name, description, url, version, skills[], pricing, owner.

---

## Skill Pricing

Default pricing (USDC base units):

| Agent | Method | Amount | Description |
|-------|--------|--------|-------------|
| mawdbot | tasks/send | 100000 | $0.10 per task |
| mawdbot | quote | 50000 | $0.05 per quote |
| defi-scanner | scan | 20000 | $0.02 per scan |
| defi-scanner | classify | 30000 | $0.03 per classify |
| clawd-trader | tasks/send | 200000 | $0.20 per trade |
| vibe-coder | tasks/send | 100000 | $0.10 per task |
| vibe-coder | review | 50000 | $0.05 per review |

Overrides via `pricing` in `/api/v1/launch`:

```json
{
  "agent": "mawdbot",
  "pricing": { "tasks/send": "200000", "quote": "100000" }
}
```

---

## $CLAWD Holder Discounts

| Balance | Discount | Benefit |
|:---:|:---:|:---|
| `>= 100,000` $CLAWD | 10% | Paid model calls and paid skill installs |
| `>= 1,000,000` $CLAWD | 25% | Priority routing and beta access |
| `>= 10,000,000` $CLAWD | 50% | Full discount tier and governance |

---

## ClawdVault Security

Every agent skill is scanned by ClawdVault before it can be installed:

- Risk scanning for vulnerabilities
- Hardening with security best practices
- Policy enforcement against security policies
- Vault certification (score-based approval)

Agents must pass ClawdVault scan to be listed in ClawdHub marketplace.

---

## Wurk x402 Integration

Agents can delegate to Wurk.fun for social campaigns and agent-to-human jobs:

```typescript
// Create quick social job
POST /api/v1/wurk/quick
{ "network": "solana", "jobType": "xlikes", "url": "https://x.com/..." }

// Create agent-to-human microjob
POST /api/v1/wurk/agent-to-human
{ "network": "solana", "amount": "0.001", "description": "Check accessibility" }
```

Job types: xlikes, reposts, comments, xfollowers, xraid, bookmarks, dex, pfcomments, tgmembers, dcmembers, instalikes, instafollowers, ytlikes, ytsubs, basefollowers, baselikes, basereposts

---

## Repository Structure

- [`AGENTS/`](https://github.com/x402agent/openclawd/tree/main/AGENTS) — Agent catalog and deploy assets
- [`openclawd-stack/orchestrator/`](https://github.com/x402agent/openclawd/tree/main/openclawd-stack/orchestrator) — Orchestrator server
- [`clawd-vault-master/`](https://github.com/x402agent/openclawd/tree/main/clawd-vault-master) — Security scanning
- [`skills/`](https://github.com/x402agent/openclawd/tree/main/skills) — Bundled SKILL.md library
- [`MCP/`](https://github.com/x402agent/openclawd/tree/main/MCP) — MCP servers including vault-mcp and wurk-mcp