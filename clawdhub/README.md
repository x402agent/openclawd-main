<p align="center">
  <img src="public/clawd-logo.png" alt="ClawdHub" width="120">
</p>

<h1 align="center">ClawdHub</h1>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Solana-Ethereum-brightgreen?style=for-the-badge" alt="Solana">
  <img src="https://img.shields.io/badge/x402-Payments-F39C12?style=for-the-badge" alt="x402">
</p>

**ClawdHub** is the registry and web hub for the OpenClawd ecosystem — Browse, publish, and install `SKILL.md` and `SOUL.md` bundles for AI agents on Solana.

> ClawdHub powers the skills marketplace at [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace)

## 🌐 Links

| Resource | URL |
|----------|-----|
| **Website** | [solanaclawd.com](https://solanaclawd.com) |
| **Skills Marketplace** | [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace) |
| **API** | [solanaclawd.com/api](https://solanaclawd.com/api) |
| **x402 Gateway** | [solanaclawd.com/x402](https://solanaclawd.com/x402) |

---

## What ClawdHub Does

- **Browse** skills and souls in the marketplace
- **Publish** versioned updates with tags/changelogs
- **Search** using vector embeddings (not just keyword match)
- **Install** skills via CLI (`npx clawdhub`) or curl
- **Monetize** skills with x402 payments and $CLAWD discounts

---

## 🚀 Quick Start

### CLI Installation

```bash
# Install skills
npx clawdhub install pumpfun-trading
npx clawdhub install solana-clawd
npx clawdhub install swarm-orchestrator

# List installed skills
npx clawdhub list

# Search skills
npx clawdhub search solana

# Publish a skill
npx clawdhub publish ./my-skill --slug my-skill

# Update a skill
npx clawdhub update <skill-slug>
```

### Curl Commands

```bash
# Browse skills marketplace
curl https://solanaclawd.com/marketplace/skills | jq '.'

# List all skills
curl https://solanaclawd.com/api/skills | jq '.'

# Search skills
curl "https://solanaclawd.com/api/skills/search?q=solana" | jq '.'

# Get featured skills
curl https://solanaclawd.com/api/skills/featured | jq '.'

# Get skill details
curl https://solanaclawd.com/api/skills/pumpfun-trading

# Install skill (download SKILL.md)
curl -s "https://solanaclawd.com/api/skills/pumpfun-trading/download" -o SKILL.md

# Marketplace categories
curl https://solanaclawd.com/api/marketplace/categories

# Trending skills
curl https://solanaclawd.com/api/marketplace/trending | jq '.'

# New skills
curl https://solanaclawd.com/api/marketplace/new | jq '.'
```

---

## 🏪 Marketplace

### Categories

| Category | Description |
|----------|-------------|
| **Clawd Ecosystem** | clawdhub, openclawd-codeskill, claude-code-skill |
| **Pump.fun** | 26 skills for token launches and trading |
| **Solana/Blockchain** | solana-clawd, solana-dev, metaplex |
| **AI/Agents** | gemini, coding-agent, cua, swarm-orchestrator |
| **Productivity** | browse, summarize, notion, obsidian |
| **DevOps** | gateway-node-ops, e2b, tmux |
| **Communication** | discord, slack, himalaya, wacli, imsg |

### Featured Skills

| Skill | Description |
|-------|-------------|
| **swarm-orchestrator** | Multi-bot trading swarms on Pump.fun |
| **clawdhub** | Browse, publish, and install SKILL.md bundles |
| **solana-clawd** | OODA loop trading + 31 MCP tools |
| **pumpfun-launcher** | Launch tokens on Pump.fun |
| **skill-creator** | Create new SKILL.md files |

---

## 💰 $CLAWD Token & Monetization

Skills can be integrated with the ClawdRouter payment system:

- **Per-call payments** — Pay per skill invocation
- **Subscriptions** — Monthly/annual access
- **$CLAWD discounts** — Token holders get 10-50% off

### x402 Payment Integration

```bash
# Verify payment
curl -X POST https://solanaclawd.com/x402/facilitator/verify \
  -H "Content-Type: application/json" \
  -d '{"payment":"<id>"}' | jq '.'

# Settle payment
curl -X POST https://solanaclawd.com/x402/facilitator/settle \
  -H "Content-Type: application/json" \
  -d '{"tx":"<signature>"}' | jq '.'

# Supported tokens
curl https://solanaclawd.com/x402/facilitator/supported | jq '.'
```

---

## 📦 100 Skills Catalog

The complete skills catalog is available at [`../skills/`](https://github.com/x402agent/openclawd/tree/main/skills).

```bash
# Get all skills
curl https://solanaclawd.com/api/skills | jq '.'
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

- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `VITE_SOULHUB_SITE_URL`
- `VITE_SOULHUB_HOST`
- `VITE_SITE_MODE` (`skills` or `souls`)
- `CONVEX_SITE_URL`
- `SITE_URL`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET`
- `TOGETHER_API_KEY`
- `HELIUS_API_KEY`
- `HELIUS_RPC_URL`

---

## 📁 Repo Layout

- `src/` — TanStack Start app (routes/components/styles)
- `convex/` — schema + queries/mutations/actions + HTTP routes
- `packages/schema/` — shared API contract/types
- `docs/` — architecture, CLI, auth, deployment docs

---

## CLI Aliases

```bash
npx clawdhub <command>   # Primary
npx nanohub <command>    # Alias
npx clawhub <command>    # Legacy alias
```

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for:
- Skill creation guidelines
- Quality standards
- Submission process

---

## 📜 License

MIT — See [`../LICENSE.md`](../LICENSE.md)

---

*Built with ❤️ by [8BIT Labs](https://8bit.io)* · [solanaclawd.com](https://solanaclawd.com)