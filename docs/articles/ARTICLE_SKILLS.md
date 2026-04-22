# Skills Marketplace & My Skills Dashboard

**Ship Date:** 2026-04-21  
**Author:** Clawd Terminal Team

---

## TL;DR

Two new surfaces shipped today: a **Skills Marketplace** for discovering AI agent capabilities, and a **My Skills** dashboard for tracking what you've created and used. Both are live now.

- **Marketplace:** [solanaclawd.com/skills](https://solanaclawd.com/skills)
- **My Skills:** [solanaclawd.com/myskills)
- **API:** [solanaclawd.com/api/skills](https://solanaclawd.com/api/skills)

---

## What Are Skills?

Skills are **KNOWLEDGE + TOOLS + WORKFLOW** definitions that extend what AI agents can do. Think of them as installable capabilities — a trading skill knows how to read Jupiter prices, a DeFi skill knows how to interact with Raydium pools, a browser skill knows how to control a headless Chrome instance.

Skills live in `SKILL.md` files and get loaded by agents at runtime. They define:

1. **What the agent KNOWS** — domain knowledge, vocabulary, best practices
2. **What tools the agent CAN USE** — MCP tools, API calls, browser commands
3. **How the agent SHOULD WORK** — step-by-step workflows, guardrails, output formats

The KNOWN/LEARNED/INFERRED epistemology from SOUL.md carries through — agents can tell the difference between verified API data and inferred insights.

---

## Skills Marketplace

The marketplace is a **public catalog** of 25+ skills spanning 10 categories:

| Category | Example Skills |
|----------|----------------|
| **Trading** | solscan, birdeye, jupiter, pump-fun |
| **DeFi** | Raydium, Orca, Marinade staking |
| **Analytics** | Solana Tracker, DexScreener |
| **Security** | RugCheck, TokenSniffer |
| **Browser Automation** | Browser-harness, CDP control |
| **Developer Tools** | GitHub, Vercel, Supabase |
| **Social** | Telegram, Discord, Twitter/X |
| **AI & ML** | Firecrawl, OpenAI, Anthropic |
| **Infrastructure** | E2B sandboxes, Cloudflare Workers |
| **Content** | Image generation, Video, TTS |

### Features

- **Search** — filter skills by name, description, or source
- **Category chips** — one-click filtering by domain
- **Featured section** — highlighted skills at the top
- **Source badges** — shows where each skill comes from (bundled, clawd, agents catalog)
- **Quick actions** — install, configure, enable/disable per agent

### How It Works

The marketplace aggregates skills from three sources:

1. **Bundled skills** — shipped with clawd CLI (`clawd/src/skills/`)
2. **Catalog skills** — from the agents package (`agents/schema/*.json`)
3. **Marketplace skills** — from external SKILL.md files and MCP registries

All skills go through a **readiness check** — the system verifies required API keys are present, dependencies are installed, and the skill is compatible with the current agent configuration.

---

## My Skills Dashboard

The dashboard is **$CLAWD-gated** — you need to hold CLAWD tokens to access it.

### What It Tracks

| Metric | Description |
|--------|-------------|
| **Created** | Skills you've built and published |
| **Total Uses** | How many times your skills have been invoked |
| **Favorites** | Skills you've bookmarked for quick access |
| **This Week** | Activity breakdown for the current week |

### Features

- **Stats cards** — big numbers at the top showing your skill portfolio
- **Top Skills leaderboard** — ranked by usage count, so you know what's working
- **Skills list** — filterable by category, sortable by date/name/usage
- **Activity history** — every skill interaction logged with timestamp, agent, and context
- **Skills grouped by agent** — see which agent used which skill and when

### Data Model

All skill interactions are tracked in the Convex `skills_usage` table:

```
skillId          — unique skill identifier
skillName        — human-readable name
walletAddress    — the user's Solana wallet
agentId          — which agent invoked the skill (optional)
action           — created | used | favorited | removed
category         — skill category (Trading, DeFi, etc.)
timestamp        — when it happened
metadata         — extra context (prompt, result, duration)
```

This data feeds into:
- Personal analytics (what you use most)
- Agent performance (which agents are productive)
- Marketplace recommendations (trending skills in your domain)

---

## API Endpoint

The unified skills catalog is available via REST:

```
GET /api/skills
```

**Query params:**
- `q` — search query
- `category` — filter by category
- `source` — filter by source (bundled, clawd, agents)
- `featured` — only featured skills

**Response:**
```json
{
  "skills": [...],
  "total": 25,
  "categories": ["trading", "defi", "analytics", ...]
}
```

---

## Why This Matters

### For Agents

Skills turn general-purpose AI into **domain experts**. Instead of a generic chat model that might hallucinate Solana mechanics, you get an agent that actually knows Jupiter's quote API, pump.fun's bonding curve, and Helius RPC quirks — because the skill taught it.

### For Operators

The marketplace makes it **discoverable**. You know you need a trading skill — now you can find one, read its documentation, see how many people use it, and install it in one click.

The dashboard makes it **accountable**. You can see what your agents are actually doing, which skills drive results, and where you're spending compute on things that don't work.

### For Builders

Skills are **composable**. Stack a Jupiter swap skill with a pump.fun scanner with a Telegram notifier and you've got an automated trading bot without writing any code. The skill boundaries are the API boundaries.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Clawd Terminal                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  /skills    │    │ /myskills   │    │ /api/skills │     │
│  │  Marketplace│    │  Dashboard  │    │   REST API  │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                   │                   │             │
│         └───────────────────┼───────────────────┘             │
│                             │                                 │
│                    ┌────────▼────────┐                        │
│                    │  Skills Engine │                        │
│                    │  (Convex DB)   │                        │
│                    └────────┬────────┘                        │
│                             │                                 │
│         ┌───────────────────┼───────────────────┐             │
│         │                   │                   │             │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐     │
│  │  Bundled    │    │   Catalog   │    │ Marketplace │     │
│  │  Skills     │    │   (JSON)   │    │  (External) │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

### Browse the Marketplace

1. Go to [solanaclawd.com/skills](https://solanaclawd.com/skills)
2. Browse by category or search for something specific
3. Click a skill card to see details, dependencies, and setup instructions
4. Install to your agent with one click

### Track Your Skills

1. Connect your wallet at [solanaclawd.com/myskills](https://solanaclawd.com/myskills) (requires CLAWD)
2. View your stats — created skills, total uses, favorites
3. See your Top Skills ranked by usage
4. Browse activity history with agent attribution

### Use Skills in Your Agents

```bash
# Install a skill via CLI
clawd skills add birdeye

# List installed skills
clawd skills list

# Enable a skill for an agent
clawd agents configure <agent-id> --enable birdeye
```

---

## What's Next

- **Skill ratings & reviews** — community feedback on skill quality
- **Skill recommendations** — AI-powered suggestions based on your workflow
- **Skill marketplace** — publish and monetize your skills
- **Cross-agent skill sharing** — use skills across multiple agents seamlessly
- **Skill analytics API** — programmatic access to marketplace data

---

## Related

- [SOUL.md](../SOUL.md) — the epistemology behind agent knowledge
- [TRADE.md](../TRADE.md) — trading skill implementation
- [/market](./ARTICLE_MARKET.md) — x402 marketplace for agentic services
- [docs/monetize.md](../docs/monetize.md) — how to monetize your skills

---

*Built with Convex, React, and a healthy respect for SKILL.md files.*
