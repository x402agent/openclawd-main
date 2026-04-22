<p align="center">
  <img src="public/clawd-logo.png" alt="ClawdHub" width="140" onerror="this.style.display='none'">
</p>

<h1 align="center">ClawdHub</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Solana-mainnet-14F195?style=for-the-badge&logo=solana" alt="Solana">
  <img src="https://img.shields.io/badge/x402-native-F39C12?style=for-the-badge" alt="x402">
  <img src="https://img.shields.io/badge/MCP-compatible-9B59B6?style=for-the-badge" alt="MCP">
</p>

**ClawdHub** is the skills marketplace and registry for the **OpenClawd** ecosystem — Browse, publish, and install `SKILL.md` bundles for AI agents on Solana. Inspired by [Nous Research](https://nousresearch.com)'s Hermes philosophy: agents that think, act, and settle autonomously on-chain.

> ClawdHub powers the skills marketplace at [hub.solanaclawd.com/marketplace](https://hub.solanaclawd.com/marketplace)

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Website** | [hub.solanaclawd.com](https://hub.solanaclawd.com) |
| **Cloud OS** | [cloud.hub.solanaclawd.com](https://cloud.hub.solanaclawd.com) |
| **Vault** | [vault.hub.solanaclawd.com](https://vault.hub.solanaclawd.com) |
| **SolanaOS** | [solanaos.net](https://solanaos.net) |
| **Skills Marketplace** | [hub.solanaclawd.com/marketplace](https://hub.solanaclawd.com/marketplace) |
| **Orchestrator** | [hub.solanaclawd.com/api](https://hub.solanaclawd.com/api) |

---

## 🧠 OpenClawd Stack

```
Surfaces (chrome-extension, telegram, tailclawd, WatchApp, beepboop)
         ↓ HTTP / SSE / WebSocket
Cloud Bridge (port 8080) — WebSocket terminal → E2B sandboxes
         ↓ REST
OpenClawd Orchestrator (port 8787) — Honcho brain, Privy wallet, Solana MCP, Wurk x402
         ↓
ClawdRouter (57-model routing, payment-aware)
         ↓
Skills & Knowledge — ClawdHub marketplace, 90+ bundled SKILL.md bundles
         ↓
Solana — Helius RPC · Jupiter · SPL USDC · $CLAWD
```

---

## What ClawdHub Does

- **Browse** skills in the marketplace (vector-searchable, not just keyword match)
- **Publish** versioned updates with tags, changelogs, and security scan results
- **Search** using AI embeddings for semantic matching
- **Install** skills via CLI (`npx clawdhub`) or curl
- **Monetize** skills with x402 payments, AP2 mandates, and $CLAWD discounts
- **Verify** skills via ClawdVault security scanning before publishing

---

## 🔧 One-Shot Install

```bash
curl -fsSL https://hub.solanaclawd.com/install.sh | bash
```

---

## 🚀 Quick Start

### CLI Installation

```bash
# Install skills
npx clawdhub install pumpfun-trading
npx clawdhub install solana-clawd
npx clawdhub install clawd-trader

# List installed skills
npx clawdhub list

# Search skills
npx clawdhub search solana

# Publish a skill
npx clawdhub publish ./my-skill --slug my-skill

# Scan a skill for security issues
npx clawdhub scan ./my-skill
```

### Curl Commands

```bash
# Browse skills marketplace
curl https://hub.solanaclawd.com/marketplace/skills | jq '.'

# List all skills
curl https://hub.solanaclawd.com/api/skills | jq '.'

# Search skills
curl "https://hub.solanaclawd.com/api/skills/search?q=solana" | jq '.'

# Get featured skills
curl https://hub.solanaclawd.com/api/skills/featured | jq '.'

# Get skill details
curl https://hub.solanaclawd.com/api/skills/pumpfun-trading

# Install skill (download SKILL.md)
curl -s "https://hub.solanaclawd.com/api/skills/pumpfun-trading/download" -o SKILL.md

# Trending skills
curl https://hub.solanaclawd.com/api/marketplace/trending | jq '.'

# New skills
curl https://hub.solanaclawd.com/api/marketplace/new | jq '.'
```

---

## 🏪 Marketplace Categories

| Category | Description |
|----------|-------------|
| **OpenClawd Ecosystem** | ClawdHub, OpenClawd agent skills, solana-clawd, clawd-trader |
| **Pump.fun Trading** | 26+ skills for token launches, sniper bots, graduation tracking |
| **Solana/Blockchain** | OODA loop trading, 31 MCP tools, Helius, Jupiter |
| **AI/Agents** | xAI Grok, Claude, OpenAI, multi-agent orchestration |
| **Wurk x402** | Social campaigns, agent-to-human jobs, multi-chain settlement |
| **Security (ClawdVault)** | Skill scanning, policy enforcement, vault certification |
| **DevOps** | E2B sandbox, gateway-node-ops, tmux |

### Featured Skills

| Skill | Description | Price |
|-------|-------------|-------|
| **solana-clawd** | OODA loop trading + 31 MCP tools on Solana | Free |
| **clawd-trader** | Full $CLAWD ecosystem — perps via Hyperliquid/Aster | Free |
| **pumpfun-launcher** | Launch tokens on Pump.fun with AP2 mandates | $0.10/call |
| **wurk-social** | Social campaigns via Wurk.fun x402 on Solana/Base | $0.05/call |
| **clawd-vault-scan** | Security scan for SKILL.md bundles | Free |
| **swarm-orchestrator** | Multi-bot trading swarms on Pump.fun | $0.20/call |

---

## 💰 $CLAWD Token & Monetization

Skills integrate with the OpenClawd payment system:

- **Per-call payments** — Pay per skill invocation via x402
- **Subscriptions** — Monthly/annual access via AP2 mandates
- **$CLAWD discounts** — 10-50% off for token holders

### x402 Payment Integration

```bash
# Verify payment
curl -X POST https://hub.solanaclawd.com/x402/facilitator/verify \
  -H "Content-Type: application/json" \
  -d '{"payment":"<id>"}' | jq '.'

# Settle payment
curl -X POST https://hub.solanaclawd.com/x402/facilitator/settle \
  -H "Content-Type: application/json" \
  -d '{"tx":"<signature>"}' | jq '.'

# Supported tokens
curl https://hub.solanaclawd.com/x402/facilitator/supported | jq '.'
```

### OpenClawd Orchestrator API

The orchestrator at `hub.solanaclawd.com/api` powers all payment and agent flows:

| Route | Description |
|-------|-------------|
| `GET /api/v1/me` | Auth info (Privy JWT) |
| `POST /api/v1/launch` | Launch agent (Honcho + E2B sandbox) |
| `POST /api/v1/mandates/mint` | Mint AP2 payment mandate |
| `GET /api/v1/earnings` | Pending earnings (USDC) |
| `POST /api/v1/agents/register` | Register agent on-chain |
| `GET /api/v1/wurk/services` | Wurk service catalog (17+ job types) |
| `POST /api/v1/wurk/quick` | Create quick x402 job |
| `POST /api/v1/wurk/agent-to-human` | Hire humans for microtasks |
| `POST /api/v1/metaplex/mint` | Mint Core agent asset (auto on login) |
| `GET /api/v1/metaplex/read/:asset` | Read agent on-chain (asset signer PDA) |
| `POST /api/v1/metaplex/launch-token` | Launch agent token via Genesis |

---

## 🔐 ClawdVault Security

Every skill published through ClawdHub is scanned by **ClawdVault** before going live:

- **Risk Scanning** — Detect vulnerabilities in SKILL.md bundles
- **Hardening** — Apply security best practices
- **Policy Enforcement** — Validate against security policies  
- **Vault Certification** — Score-based approval system

```bash
# Scan a skill locally
cd clawd-vault-master
pip install -e .
python -m clawd_vault scan ../../skills/my-skill
```

---

## 🛠️ Development

### Local Setup

```bash
bun install
cp .env.local.example .env.local

# Terminal A: Convex backend
bunx convex dev

# Terminal B: app (http://localhost:3000)
bun run dev

# Seed skills
bunx convex run --no-push devSeed:seedNixSkills
```

### Environment Variables

- `VITE_CONVEX_URL` — Convex deployment URL
- `VITE_CONVEX_SITE_URL` — Public site URL
- `CONVEX_SITE_URL` — Backend site URL
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — GitHub OAuth
- `HELIUS_API_KEY` / `HELIUS_RPC_URL` — Solana RPC
- `PRIVY_APP_ID` / `PRIVY_APP_SECRET` — Embedded wallet auth
- `HONCHO_API_KEY` — Brain/memory for agents
- `WURK_API_KEY` — x402 social campaigns (optional)

---

## 📁 Repo Layout

- `src/` — TanStack Start app (routes, components, styles)
- `src/routes/` — 40+ page routes (skills, agents, tracker, wallet, terminal, etc.)
- `src/components/` — Reusable UI components with cypherpunk styling
- `src/components/tracker/` — Pump.fun scanner, graduation tracker, whale tracker
- `src/lib/` — API clients, auth, theme, analytics, upload utilities
- `convex/` — Schema + queries/mutations/actions + HTTP routes
- `docs/` — Architecture, CLI, auth, deployment docs

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for skill creation guidelines, quality standards, and submission process.

**Key rules:**
- Skills must be published via CLI (`npx clawdhub publish`)
- No skill bundles in source code — publish through ClawdHub
- Security scan via ClawdVault required before publishing

---

## 📜 License

MIT — See [`../LICENSE.md`](../LICENSE.md)

---

*Built with ❤️ by [8BIT Labs](https://8bit.io) · Inspired by [Nous Research](https://nousresearch.com) · Powered by [xAI Grok](https://x.ai) · Settled on [Solana](https://solana.com)*

[![Twitter](https://img.shields.io/badge/𝕏-@clawddevs-000000?style=for-the-badge)](https://x.com/clawddevs)
[![Telegram](https://img.shields.io/badge/Telegram-clawdtoken-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/clawdtoken)
[![GitHub](https://img.shields.io/badge/GitHub-openclawd-181717?style=for-the-badge&logo=github)](https://github.com/x402agent/openclawd)