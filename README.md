# 🦞 OpenClawd

> **"The Hermes of Web3" — inspired by [Nous Research](https://nousresearch.com)'s Hermes agent philosophy.**

OpenClawd is the open-source, autonomous AI agent system for Solana. Like Hermes — the fleet-footed messenger of the gods — it moves fast, connects everything, and delivers results. Built on the conviction that AI agents should be composable, monetizable, and chain-native from the ground up.

---

<div align="center">

<img src="https://raw.githubusercontent.com/x402agent/openclawd/main/gfx/lobster.svg" alt="OpenClawd" width="140" onerror="this.style.display='none'">

**One router · one settlement layer · one environment contract**

`30+ packages, apps, and services` · `50-agent catalog` · `90+ bundled skills` · `4 payment protocols` · `57 router models` · `49 Metaplex Lobster Agents`

---

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   $CLAWD  ·  8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE.md)
[![Solana](https://img.shields.io/badge/Solana-mainnet-14F195?style=for-the-badge&logo=solana)](https://solana.com)
[![x402](https://img.shields.io/badge/x402-native-F39C12?style=for-the-badge)](https://solanaclawd.com/x402)
[![MCP](https://img.shields.io/badge/MCP-compatible-9B59B6?style=for-the-badge)](https://modelcontextprotocol.io)
[![pAGENT](https://img.shields.io/badge/pAGENT-Browser-FF6B35?style=for-the-badge)](./chrome-extension/)

[![npm solana-clawd](https://img.shields.io/npm/v/solana-clawd?style=flat-square&label=solana-clawd&color=cc3534)](https://www.npmjs.com/package/solana-clawd)
[![npm @openclawd/wallet](https://img.shields.io/npm/v/@openclawd/wallet?style=flat-square&label=@openclawd/wallet&color=cc3534)](https://www.npmjs.com/package/@openclawd/wallet)
[![Twitter Follow](https://img.shields.io/twitter/follow/clawddevs?style=flat-square&color=1DA1F2)](https://x.com/clawddevs)
[![Telegram](https://img.shields.io/badge/Telegram-clawdtoken-26A5E4?style=flat-square&logo=telegram)](https://t.me/clawdtoken)

[**Install**](#install) · [**Architecture**](#architecture) · [**Orchestrator**](#openclawd-orchestrator) · [**Router**](#clawdrouter) · [**Chrome Extension**](#🦞-openclawd-pagent-browser) · [**SolanaOS Integration**](#-solanaos-integration) · [**Metaplex Lobster Agents**](#-metaplex-lobster-agents) · [**Wurk x402**](#wurk-x402-integration) · [**npm Packages**](#npm-packages) · [**Stack Map**](./STACK.md) · [**Docs**](./docs/articles/) · [**Website**](https://solanaclawd.com)

</div>

---

## 🔗 Quick Links

| Service | URL |
|---------|-----|
| 🌐 **Website** | [solanaclawd.com](https://solanaclawd.com) |
| 🕶️ **Cloud OS** | [cloud.solanaclawd.com](https://cloud.solanaclawd.com) |
| 🔐 **Vault** | [vault.solanaclawd.com](https://vault.solanaclawd.com) |
| 💰 **SolanaOS** | [solanaos.net](https://solanaos.net) |
| 🛒 **Hub** | [hub.solanaclawd.com](https://hub.solanaclawd.com) |
| 🐦 **Twitter** | [x.com/clawddevs](https://x.com/clawddevs) |
| 💬 **Telegram** | [t.me/clawdtoken](https://t.me/clawdtoken) |
| 📦 **solana-clawd** | [npm](https://www.npmjs.com/package/solana-clawd) · [GitHub](https://github.com/x402agent/solana-clawd) |
| 🖥️ **SolanaOS** | [GitHub](https://github.com/x402agent/SolanaOS) |

---

## OpenClawd in one paragraph

OpenClawd is a monorepo for building, running, and monetizing Solana-native AI agents. It combines an orchestrator (Honcho brain + E2B sandbox + Privy wallet), a model router, a wallet layer, x402 payment rails, an MCP runtime, a skills marketplace, browser and chat surfaces, and deployment-oriented tooling under one repo and one shared environment contract.

Inspired by Nous Research's Hermes philosophy — agents that think, act, and settle autonomously on-chain — OpenClawd ships the full stack: from sandboxed agent execution to on-chain payment settlement, wrapped in a composable monorepo any team can fork, deploy, or extend.

---

## 🐾 New Contributor?

Start here → **[ONBOARDING.md](./ONBOARDING.md)**

This guide covers:
- Quick start setup
- Project structure overview
- Development workflow
- Working with Skills & Agents
- Security requirements
- Testing & building

---

## 🔧 One-Shot Install

```bash
curl -fsSL https://solanaclawd.com/install.sh | bash
```

This installs `solana-clawd` globally, sets up the local dev environment, and scaffolds your `~/.openclawd/` config with Tailscale serve support.

**Or see it in action first:** → **[Interactive Terminal Demo](./docs/demo.html)** — full animated walkthrough of the install experience, E2B sandbox templates, and profiles system.

**Manual setup:**

```bash
# Clone the repo
git clone https://github.com/x402agent/openclawd.git
cd openclawd

# Install all dependencies
npm install

# Copy environment
cp .env.example .env

# Build the agents catalog
cd AGENTS && node build-catalog.cjs

# Run the Orchestrator (all-in-one: brain + wallet + MCP + payments)
cd ../openclawd-stack && pnpm install && pnpm dev:orchestrator
```

For full installation details, see **[ONBOARDING.md](./ONBOARDING.md)**.

---

## 🦞 OpenClawd pAGENT Browser

The **OpenClawd pAGENT Browser** is a Chrome extension that brings AI agent capabilities directly to your browser with wallet, trading, and OpenClawd harness integration.

### Install

```bash
cd chrome-extension
bash install-openclawd.sh
```

This one-shot installer:
1. ✅ Builds the Chrome extension
2. ✅ Starts the OpenClawd MCP bridge (port 3001)
3. ✅ Creates Claude Desktop MCP config
4. ✅ Generates extension configuration
5. ✅ Prints installation instructions

### Six Tabs

| Tab | What it does | Paid? |
|---|---|:---:|
| 💰 **Wallet** | SOL + SPL balances, OODA trade history, Bitaxe miner card, send / swap | Free |
| 📱 **Seeker** | WebSocket bridge to the Solana Seeker phone | Free |
| ⛏  **Miner** | MawdAxe Bitaxe fleet dashboard with SSE live updates | Free |
| 💬 **Chat** | Multi-turn chat with OpenClawd | Free |
| 🔧 **Tools** | Live RPC health, trending tokens, system status | Free |
| 🔐 **Vault** | AES-256-GCM local wallet vault — keys never leave your box | Free |

### pAGENT — GUI Vision Browser Agent

pAGENT injects `window.PAGENT` into every page. Drive your browser with natural language:

```javascript
await window.PAGENT.execute("Find the cheapest SOL→USDC route on Jupiter and screenshot it", {
  baseURL: "https://api.openrouter.ai/v1",
  model: "anthropic/claude-sonnet-4-6",
  apiKey: "sk-or-...",
  guiVision: true,
});
```

### Connection Points

| Service | Port | OpenClawd Connection |
|---------|------|---------------------|
| Gateway WS | 18790 | WebSocket client |
| Control UI | 7777 | HTTP API |
| Wallet API | 8421 | REST client |
| MawdAxe | 8420 | SSE client |
| MCP Bridge | 3001 | stdio + HTTP |

See [`chrome-extension/README.md`](./chrome-extension/README.md) and [`INTEGRATION_STRATEGY.md`](./INTEGRATION_STRATEGY.md).

---

## 🌐 SolanaOS Integration

OpenClawd connects to the **SolanaOS** Go binary (`github.com/x402agent/SolanaOS`) for unified autonomous AI agent system.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        OpenClawd System                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────┐   │
│  │ Chrome Ext  │───▶│ OpenClawd        │◀───│ Claude Desktop │   │
│  │ pAGENT      │    │ Orchestrator     │    │ MCP Client    │   │
│  └─────────────┘    └────────┬─────────┘    └────────────────┘   │
│                              │                                   │
│  ┌─────────────┐    ┌────────▼─────────┐    ┌────────────────┐   │
│  │ ClawdHub    │◀───│ MCP Bridge       │───▶│ 49 Agents      │   │
│  └─────────────┘    └────────┬─────────┘    └────────────────┘   │
│                              │                                   │
│  ┌─────────────┐    ┌────────▼─────────┐    ┌────────────────┐   │
│  │ Honcho      │    │ Wallet Bridge    │───▶│ Privy Wallet   │   │
│  │ Memory      │    └─────────────────┘    └────────────────┘   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    SolanaOS         │
                    │    (Go Binary)      │
                    │    Port 18790       │
                    ├─────────────────────┤
                    │ • OODA Trading Loop │
                    │ • Telegram Bot       │
                    │ • Wallet Vault      │
                    │ • Honcho Memory     │
                    │ • x402 Payments    │
                    └─────────────────────┘
```

### Auto-Connect

```bash
# Clone both repos
git clone https://github.com/x402agent/openclawd.git
git clone https://github.com/x402agent/SolanaOS.git

# Run OpenClawd installer
cd openclawd
bash chrome-extension/install-openclawd.sh

# Run SolanaOS installer
cd ../SolanaOS
bash start.sh

# Connect them together
openclawd connect --solanaos ~/SolanaOS
```

See [`INTEGRATION_STRATEGY.md`](./INTEGRATION_STRATEGY.md) for full integration guide.

---

## 🦞 Metaplex Lobster Agents

**49 Metaplex Lobster Agents powered by OpenClawd, pump.fun, Birdeye, and Solana RPC.**

Each lobster agent is born with these Solana superpowers:

```typescript
interface LobsterAgent {
  // Core Solana Programs
  programs: {
    pump: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
    pumpSwap: 'PumpSwapAMMxxxxxxxxxxxxxx';
    mayhem: 'MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e';
    metaplex: 'metaqbxxUurdq35cjC23cE9k1rCBu5KNqmWfdKAoZSkb';
    token2022: 'TokenkegQfeZyiNwAjbodcp9C5bw52aqx3mqHPa7';
  };
  
  // Trading Capabilities
  trading: {
    canLaunchToken: true;      // create/create_v2 instructions
    canBuy: true;               // buy instruction
    canSell: true;              // sell instruction
    canClaimFees: true;        // collectCreatorFee
    canMigrate: true;           // migrate to PumpSwap
    canManageMetadata: true;   // set_metaplex_creator
  };
}
```

### Pump.fun Program Integration

| Program | Address | Type |
|---------|---------|------|
| **Pump** | `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P` | Bonding curve |
| **Mayhem** | `MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e` | Trading mode |
| **Global** | `4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf` | Config PDA |

### Mayhem Fee Recipients

```
GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS
4budycTjhs9fD6xw62VBducVTNgMgJJ5BgtKq7mAZwn6
8SBKzEQU4nLSzcwF4a74F2iaUDQyTfjGndn6qUWBnrpR
4UQeTP1T39KZ9Sfxzo3WR5skgsaP6NZa87BAkuazLEKH
8sNeir4QsLsJdYpc9RZacohhK1Y5FLU3nC5LXgYB4aa6
Fh9HmeLNUMVCvejxCtCL2DbYaRyBFVJ5xrWkLnMH6fdk
463MEnMeGyJekNZFQSTUABBEbLnvMTALbT6ZmsxAbAdq
6AUH3WEHucYZyC61hqpqYUWVto5qA5hjHuNQ32GNnNxA
```

### Agent Trading Workflow

```
1. Agent spawns (49 Metaplex Lobster Agents ready)
         ↓
2. Connect wallet via Privy/E2B sandbox
         ↓
3. Scan pump.fun for opportunities (BDS API)
         ↓
4. Analyze token via Birdeye
         ↓
5. Execute trade (buy/sell via pump.fun SDK)
         ↓
6. Monitor position, collect fees if creator
         ↓
7. Report to OpenClawd orchestrator
```

### $CLAWD Tier Requirements

| Tier | $CLAWD Required | Trading Limits |
|------|-----------------|----------------|
| Free | 0 | 0.01 - 0.1 SOL |
| Bronze | 1 | 0.01 - 0.5 SOL |
| Silver | 1,000 | 0.01 - 2.0 SOL |
| Gold | 10,000 | 0.01 - 10 SOL |
| Diamond | 100,000 | Unlimited |

See [`AGENTS/solana-lobster-agents.md`](./AGENTS/solana-lobster-agents.md) and [`API/README.md`](./API/README.md).

---

## 🤖 OpenAI Trading Agent

**GPT-5.4 Responses API autonomous Solana trading agent** — deployed in two parallel surfaces:

1. **Edge worker** — [`workers/openai-trading-bot/`](./workers/openai-trading-bot/) (Cloudflare Worker + Telegram)
2. **Gateway agent** — [`openclawd-stack/gateway/agents/openai-trading.ts`](./openclawd-stack/gateway/agents/openai-trading.ts) (inside the E2B sandbox, key `openai-trader`)

Both use the **OpenAI Responses API** (not legacy Chat Completions):

- `instructions` parameter for high-priority developer guidance
- `output_text` helper for aggregated streamed text
- Items-based output (messages, function_calls, reasoning)
- `previous_response_id` for stateful conversation chaining
- Built-in `web_search` tool with zero config
- `strict: true` function schemas by default

### Models

| Model | Purpose |
|-------|---------|
| `gpt-5.4` | Trading decisions, complex reasoning (high effort) |
| `gpt-5.4-nano` | Fast chat, delegation, simple queries |
| `gpt-image-1` | PnL cards, memes, visual content (GPT Image 2.0) |
| `gpt-image-1-mini` | Fallback image generation |

### Native Tools (born-with capabilities)

| Tool | Purpose |
|------|---------|
| `execute_swap` | Jupiter aggregator swap on Solana |
| `get_token_analysis` | Price, liquidity, holders, safety score |
| `get_trending` | Trending Solana tokens across timeframes |
| `get_wallet_status` | SOL + SPL balances for any wallet |
| `generate_image` | GPT Image 2.0 generation with fallback |
| `web_search` | Built-in OpenAI web search (real-time alpha) |

### Features

- **Autonomous Trading** — OODA loop discipline (Observe → Orient → Decide → Act)
- **Agentic Function Loop** — 6-round max, executes tools + feeds results back until final answer
- **Telegram Interface** — Owner-gated with `/assign` + `/revoke` access control
- **Conversation Memory** — KV-backed, `previous_response_id` chaining (edge) + item-based state (gateway)
- **Vault Persistence** — Every gateway turn written to the INFERRED tier of the Clawd vault
- **Tier-Gated** — Owner (default: `1740095485`) has full access; others assignable

### Quick Start

```bash
# Deploy the edge worker
cd workers/openai-trading-bot
npm install
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler deploy
curl https://your-worker.workers.dev/setup

# Or use the gateway agent (already registered — just point at GATEWAY_URL)
curl -X POST $GATEWAY_URL/v1/sessions \
  -H "Authorization: Bearer $PRIVY_TOKEN" \
  -d '{"agent":"openai-trader"}'
```

### Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome + capabilities list |
| `/generate <prompt>` | Generate image with GPT Image 2.0 |
| `/search <query>` | Web search via Responses API |
| `/trade <token> <side> <amount>` | Execute trade via GPT-5.4 |
| `/trending` | Trending Solana tokens (1h) |
| `/pnl` | Generate PnL summary |
| `/assign <chatId>` | Assign bot to user (owner only) |
| `/revoke <chatId>` | Revoke access (owner only) |

See [`workers/openai-trading-bot/README.md`](./workers/openai-trading-bot/README.md) and [`workers/README.md`](./workers/README.md) for full documentation.

---

## ☁️ Cloudflare Workers Fleet

Edge workers that compose the OpenClawd runtime — all TypeScript, all deploy with `wrangler`.

| Worker | Purpose |
|--------|---------|
| [`openai-trading-bot`](./workers/openai-trading-bot/) | GPT-5.4 Responses API + Telegram trading bot |
| [`agent-wallet`](./workers/agent-wallet/) | OpenClawd Agent Wallet — AES-256-GCM encrypted Solana + EVM keys, Privy proxy, E2B deploy |
| [`email-worker`](./workers/email-worker/) | Clawd email inbox (`clawd@solanaclawd.com`) with AI auto-reply |
| [`install-worker`](./workers/install-worker/) | Serves `https://solanaclawd.com/install.sh` (one-shot installer) |
| [`pumpfun-mcp-worker`](./workers/pumpfun-mcp-worker/) | Remote MCP server for pump.fun scanning (Cron + KV + Convex + Telegram digests) |

See [`workers/README.md`](./workers/README.md) for deployment, secrets, and gateway integration notes.

---

## ☁️ E2B Cloud Sandboxes

Instant, isolated cloud sandboxes for running OpenClawd agents. Fork from `theordlibrary` on E2B — pre-loaded with the tools, SDKs, and runtime your claw needs.

| Template | Description | ID |
|----------|-------------|-----|
| **🦞 Clawd v2** | Latest OpenClawd runtime — monorepo, solana-clawd CLI, TailClawd, @openclawd/wallet, profiles system | `ibyiv77pobbc6mv8luif` |
| **🦞 Clawd** | Legacy OpenClawd agent — solana-clawd CLI, TailClawd, x402 payments, honcho brain | `srsbqb24j095xwd4fiad` |
| **⚡ Solana Dev Env** | Anchor, Rust, Node.js, all Solana SDKs — base for agent coding tasks and on-chain tooling | `stbd55taifr4ajbxzulu` |

### Quick start

```bash
# Fork a template
e2b template fork theordlibrary/clawd-v2
e2b template fork theordlibrary/clawd
e2b template fork theordlibrary/solana-dev-env

# Or use with E2B CLI directly
e2b template fork theordlibrary/clawd-v2     # ibyiv77pobbc6mv8luif
e2b template fork theordlibrary/clawd       # srsbqb24j095xwd4fiad
e2b template fork theordlibrary/solana-dev-env  # stbd55taifr4ajbxzulu
```

See the full interactive demo at **[docs/demo.html](./docs/demo.html)** — animated terminal walkthrough of the install experience, E2B templates, and profiles system.

---

## 👤 Profiles — Running Multiple Agents

> *Inspired by Hermes (Nous Research) — adapted for the claw.*

Every agent needs a home. A **profile** is an isolated agent home directory with its own config, secrets, personality, memories, sessions, skills, and gateway state.

```
~/.openclawd/
├── state.json              ← active profile
└── profiles/
    ├── default/
    │   ├── config.yaml     ← model, provider, toolsets, terminal defaults
    │   ├── .env            ← scoped secrets
    │   ├── CLAW.md        ← personality / operating charter
    │   ├── memories/      ← long-term memory store
    │   ├── sessions/      ← conversation history
    │   ├── skills/        ← profile-local skill overrides
    │   └── gateway/       ← cached gateway config
    └── degen-trader/
```

### Quick Start

```bash
# Install the profile manager
curl -fsSL https://solanaclawd.com/install.sh | bash

# Create your first profile
clawd profile create default

# List profiles (● = active)
clawd profile list

# Switch active profile
clawd profile use degen-trader

# Inspect a profile
clawd profile show

# Clone a profile (great for variations)
clawd profile clone default arb-hunter

# Run via auto-generated alias
degen-trader "buy 0.1 SOL of $PEPE"
```

### All Commands

| Command | Description |
|---------|-------------|
| `clawd profile create <name>` | Scaffold a new profile + install its alias |
| `clawd profile list` | List all profiles (● = active) |
| `clawd profile show [name]` | Inspect profile contents and stats |
| `clawd profile use <name>` | Set active profile (sticky across sessions) |
| `clawd profile rename <old> <new>` | Rename a profile |
| `clawd profile clone <src> <dst>` | Duplicate a profile |
| `clawd profile delete <name>` | Remove a profile (prompts confirmation) |
| `clawd profile export <name> [file]` | Export profile as `.tar.gz` |
| `clawd profile import <archive>` | Import a profile from `.tar.gz` |
| `clawd profile path [name]` | Print profile directory path |

### CLAW.md — The Soul of the Claw

Each profile ships with a **CLAW.md** (replacing Hermes' SOUL.md). Personality charter — identity, operating style, hard limits, and domain focus. Edit to shape your agent's persona (trader vs researcher vs security auditor), set hard limits, define tone.

### CLI Aliases

When you `create` a profile, `clawd-profile` installs a wrapper script at `~/.local/bin/<name>`:

```bash
# ~/.local/bin/degen-trader
#!/usr/bin/env bash
exec clawd -p degen-trader "$@"
```

### Multi-Agent with Honcho

For true parallel multi-agent operation, profiles work alongside Honcho:

```yaml
# honcho.yaml
services:
  degen-trader:
    command: clawd -p degen-trader
    env:
      OPENCLAWD_HOME: ~/.openclawd

  research-claw:
    command: clawd -p research-claw
    env:
      OPENCLAWD_HOME: ~/.openclawd
```

```bash
honcho start           # run all profiles in parallel
honcho logs -f         # stream all profile logs
```

See [`profiles/README.md`](./profiles/README.md) for full documentation.

---

## 🧠 OpenClawd AutoResearch Wiki

**Self-improving AI research engine for Solana — inspired by [Andrej Karpathy](https://karpathy.ai)'s approach to AI research.**

The [`llm-wiki-tang/`](./llm-wiki-tang/) module is a FastAPI + Supabase + vector embedding knowledge base that powers autonomous blockchain and DeFi research.

### Karpathy-Style Research Loop

```
OBSERVE → ORIENT → DECIDE → ACT → LEARN → repeat
  ↑                                        │
  └──────── 49 agents, 24/7 ───────────────┘
```

Every research cycle:
1. **Observe** — Scan pump.fun, Birdeye, Helius RPC
2. **Orient** — Store findings as vector embeddings
3. **Decide** — Pick the best agent for the task
4. **Act** — Execute trade, report, or analysis
5. **Learn** — Update agent weights, share with swarm

### Research API

```bash
# Chain research (pump.fun, tokens, graduation)
curl -X POST http://localhost:8000/api/v1/research/chain \
  -H "X-Payment: 0.001 SOL" \
  -d '{"query": "Which tokens are graduating?", "focus": ["pump_fun"]}'

# DeFi research (yields, LPs, arbitrage)
curl -X POST http://localhost:8000/api/v1/research/defi \
  -H "X-Payment: 0.005 SOL" \
  -d '{"action": "yield_scan", "protocols": ["raydium", "orca"]}'

# Market research (sentiment, alpha, whale tracking)
curl -X POST http://localhost:8000/api/v1/research/market \
  -H "X-Payment: 0.001 SOL" \
  -d '{"focus": "alpha", "timeframe": "1h"}'

# Agent self-improvement (learn, share, collaborate, calibrate)
curl -X POST http://localhost:8000/api/v1/research/agent \
  -H "X-Payment: 0.001 SOL" \
  -d '{"agent_id": "lobster-trader-01", "action": "learn"}'
```

See [`llm-wiki-tang/README.md`](./llm-wiki-tang/README.md) and [`docs/articles/AUTO_RESEARCH_AGENTS.md`](./docs/articles/AUTO_RESEARCH_AGENTS.md).

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [ONBOARDING.md](./ONBOARDING.md) | **Start here!** Contributor setup & workflow |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [STACK.md](./STACK.md) | Technical architecture |
| [docs/articles/](./docs/articles/) | Deep-dive documentation (46 articles) |
| [AGENTS/README.md](./AGENTS/README.md) | Agent development |
| [AGENTS/solana-lobster-agents.md](./AGENTS/solana-lobster-agents.md) | **NEW** Metaplex Lobster Agents |
| [chrome-extension/README.md](./chrome-extension/README.md) | **NEW** pAGENT Browser Extension |
| [INTEGRATION_STRATEGY.md](./INTEGRATION_STRATEGY.md) | **NEW** OpenClawd × SolanaOS |
| [API/README.md](./API/README.md) | **NEW** Solana Blockchain Integration |

---

## 🧠 OpenClawd Orchestrator

The heart of the stack: **`openclawd-stack/orchestrator/`** — a single Hono server that ties everything together.

### What it runs

```text
┌─────────────────────────────────────────────────────────────────┐
│                    OpenClawd Orchestrator                       │
│                     Port 8787 · Hono server                    │
├─────────────────────────────────────────────────────────────────┤
│  Honcho Brain        → memory, peer.chat, session context       │
│  E2B Sandbox         → per-user isolated agent sandboxes        │
│  Privy Wallet        → embedded wallet, balance, transfer        │
│  Solana MCP           → child process per user, JSON-RPC stdio  │
│  Payments Client      → ClawdVault registry, AP2 mandates        │
│  Wurk x402 Bridge     → social campaigns, agent-to-human jobs    │
│  Metaplex Bridge      → Core agents, Genesis, token launch        │
└─────────────────────────────────────────────────────────────────┘
```

### API routes

| Route | Description |
|-------|-------------|
| `GET /healthz` | Server liveness |
| `GET /api/v1/me` | Auth info (Privy JWT) |
| `GET /api/v1/agents` | Agent catalog (49 lobster agents) |
| `POST /api/v1/launch` | Launch agent (Honcho + E2B) |
| `GET /api/v1/wallet` | List Privy wallets |
| `POST /api/v1/wallet/transfer` | Transfer SOL/USDC |
| `GET /api/v1/mcp/tools` | List MCP tools |
| `POST /api/v1/mcp/call` | Call MCP tool |
| `POST /api/v1/metaplex/mint` | Mint Core agent asset (auto on login) |
| `GET /api/v1/metaplex/read/:asset` | Read agent on-chain |
| `POST /api/v1/metaplex/launch-token` | Launch agent token via Genesis |
| `GET /api/v1/metaplex/lobster-agents` | **NEW** List lobster agents with pump.fun integration |
| `POST /api/v1/metaplex/trade` | **NEW** Execute trade via bonding curve |

### Dev mode

```bash
cd openclawd-stack
pnpm dev:orchestrator
# Server boots on :8787, hot-reloads on file changes
```

---

## 🤖 49-Agent Catalog

Browse the full catalog at **[hub.solanaclawd.com/agents](https://hub.solanaclawd.com/agents)**

All 49 agents are Metaplex-enabled and mintable as Core assets. **The lobster agents have full pump.fun integration at birth.**

### Agent Categories

| Category | Count | Capabilities |
|----------|-------|--------------|
| **DeFi** | 12 | Swap, liquidity, yield farming |
| **Trading** | 10 | Sniper, scalper, swing trader, **pump.fun** |
| **Analytics** | 11 | On-chain data, sentiment, Birdeye |
| **Security** | 8 | Rug detection, scam alerts |
| **NFT** | 5 | Mint, trade, collection |
| **Dev Tools** | 8 | Deploy, test, audit |
| **Research** | 4 | Token analysis, market research |
| **Governance** | 3 | DAO voting, proposals |

### Featured Agents (20)

- 🪂 **DeFi Airdrop Hunter** — Live airdrop identification
- 🎯 **Crypto Alpha & Signal Detector** — Smart money tracking
- 💀 **CLAWD Mayhem Mode** — Full Metaplex + trading (all 6 programs)
- 🎰 **CLAWD × Pump.fun Official Agent** — Payment-gated RNG (0.1 SOL)
- 🌾 **CLAWD Yield Aggregator** — Best yield ranking
- 💼 **CLAWD Portfolio Tracker** — Helius DAS wallet tracking
- ⚠️ **CLAWD Protocol Risk Monitor** — DeFi risk monitoring
- 💧 **CLAWD Liquidity Provider Strategist** — LP optimization
- 🦞 **SolanaOS Trading Lobster** — OODA loop + pump.fun integration
- 🔥 **CLAWD Firecrawl Researcher** — Web research

### Mint Your Agent

```bash
# Via curl (auto-mints on first Privy login)
curl -X POST http://localhost:8787/api/v1/metaplex/mint \
  -H "Authorization: Bearer <privy-jwt>" \
  -d '{"name":"My Agent","uri":"https://example.com/agent.json"}'

# Via ClawdHub marketplace
# https://hub.solanaclawd.com/agents/mint

# List all agents
curl http://localhost:8787/api/v1/agents | jq '.'
```

---

## 📦 NPM Packages

| Package | npm | Description |
|---------|-----|-------------|
| [`solana-clawd`](https://www.npmjs.com/package/solana-clawd) | `npm i -g solana-clawd` | Go + TypeScript agent framework, OODA loop trading, 31 MCP tools |
| [`@openclawd/wallet`](https://www.npmjs.com/package/@openclawd/wallet) | `npm i @openclawd/wallet` | Privy-powered embedded Solana wallet with Grok 4.20 Beta agentic trading |
| [`@solana-clawd/agents-x402`](./packages/agents-x402-solana/) | `import from "@solana-clawd/agents-x402"` | x402 agent-to-agent USDC payment protocol for MCP servers and HTTP APIs |
| [`@mawdbotsonsolana/nemoclaw`](https://www.npmjs.com/package/nemoclaw) | `npm i -g @mawdbotsonsolana/nemoclaw` | xAI Grok-powered Solana trading engine with blockchain buddies |
| `clawdhub` | `npx clawdhub publish` | Skills marketplace CLI (publish, install, search SKILL.md bundles) |

### @openclawd/wallet — Agentic Trading SDK

Privy-embedded Solana wallet with **Grok 4.20 Beta** as the AI reasoning layer. Architecture: `User → Grok screens → ClawdWallet (Privy) → Solana`.

```typescript
import { AgenticWallet, DEFAULT_PERMISSIONS } from "@openclawd/wallet";

const agent = new AgenticWallet(wallet, {
  privyAppId: process.env.PRIVY_APP_ID!,
  grokApiKey: process.env.XAI_API_KEY,
  permissions: { swap: "ask", ...DEFAULT_PERMISSIONS },
  onPendingTransaction: async (tx) => pushNotify(tx.description),
});

// Agent swap — Grok 4.20 Beta screens, then user confirms
const { signature, explorerUrl } = await agent.agentSwap({
  inputToken: "SOL", outputToken: "8cHz...pump", amount: "100000000",
});
```

Permission levels: `deny` (blocked) → `ask` (Grok + user) → `allow` (auto up to limits). See [`packages/clawd-wallet/`](./packages/clawd-wallet/) and [`examples/clawd-wallet-demo.ts`](./examples/clawd-wallet-demo.ts).

### @solana-clawd/agents-x402 — Agent Payment Protocol

One-line x402 monetization for MCP servers, HTTP handlers, and agent tool calls. Settles USDC through the Clawd facilitator on Solana.

```typescript
import { createClawdX402Client } from "@solana-clawd/agents-x402";
import { http } from "@solana-clawd/agents-x402/http";
import { mcp } from "@solana-clawd/agents-x402/mcp";

// Client: call paid APIs (handles 402 → pay → retry)
const client = createClawdX402Client({ facilitatorUrl, wallet, network: "solana-mainnet" });

// Server: gate HTTP routes behind payment
app.get("/api/premium", http.pay({ slug: "premium", price: "0.01", network: "solana-mainnet" }));

// MCP: register paid tools
mcp.registerPaidTool(server, { name: "chain_analysis", price: "0.02", handler: async () => ({...}) });
```

See [`packages/agents-x402-solana/`](./packages/agents-x402-solana/) and [`examples/x402-payment-demo.ts`](./examples/x402-payment-demo.ts).

### TailClawd — Tailscale Web UI

Browser-accessible Clawd Code interface via Tailscale. 14 streaming endpoints, real-time SSE, live token counter, cost tracking, model selector, and system metrics — all on your private tailnet.

```bash
# One-shot install includes TailClawd
curl -fsSL https://solanaclawd.com/install.sh | bash

# Or standalone
cd tailclawd && npm install && npm run dev  # → http://localhost:3110
tailscale serve --bg --https=443 http://127.0.0.1:3110  # → https://your-machine.tailnet
```

See [`tailclawd/README.md`](./tailclawd/README.md).

---

## 💰 $CLAWD token

| Symbol | Chain | Standard | Contract |
|:---:|:---:|:---:|:---|
| **$CLAWD** | Solana | SPL Token | [`8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`](https://solscan.io/token/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump) |

[![Buy on Jupiter](https://img.shields.io/badge/Buy-Jupiter-F97316?style=for-the-badge)](https://jup.ag/swap/SOL-8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
[![Chart on Dexscreener](https://img.shields.io/badge/Chart-Dexscreener-000000?style=for-the-badge)](https://dexscreener.com/solana/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
[![Pump.fun](https://img.shields.io/badge/Pump.fun-Origin-3DCD58?style=for-the-badge)](https://pump.fun/coin/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)

### Holder utility

| Balance | Discount | Benefit |
|:---:|:---:|:---|
| `>= 100,000` $CLAWD | 10% | Paid model calls and paid skill installs |
| `>= 1,000,000` $CLAWD | 25% | Priority routing and beta access |
| `>= 10,000,000` $CLAWD | 50% | Full discount tier and governance-oriented features |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│ Surfaces                                                         │
│ chrome-extension (pAGENT) · telegram · tailclawd · WatchApp     │
│ clawdhub (hub.solanaclawd.com) · SolanaOS                        │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / SSE / WS
┌────────────────────────────▼────────────────────────────────────┐
│ OpenClawd Orchestrator (port 8787)                               │
│ honcho brain · e2b sandbox · privy wallet · solana mcp           │
│ payments client · wurk x402 bridge · metaplex bridge             │
└────────────────────────────┬────────────────────────────────────┘
                             │ routed model calls + settlement
┌────────────────────────────▼────────────────────────────────────┐
│ Router and payments                                              │
│ clawdrouter · x402-openrouter-main · workers · services         │
└────────────────────────────┬────────────────────────────────────┘
                             │ signed Solana actions
┌────────────────────────────▼────────────────────────────────────┐
│ Runtime                                                          │
│ src · solana-clawd · AGENTS (49 Lobster Agents) · MCP            │
│ packages · openclawd-stack                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │ pump.fun, birdeye, helius RPC
┌────────────────────────────▼────────────────────────────────────┐
│ Blockchain                                                       │
│ Solana · Helius RPC · pump.fun · Birdeye · Jupiter · SPL USDC     │
│ $CLAWD · Metaplex Core/Genesis                                   │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ 🛡️ Security: ClawdVault (clawd-vault-master)                    │
│ policy engine · skill scanning · vault certification             │
│ ─────────────────────────────────────────────────────────────  │
│ 💰 Monetization: WURK.fun x402                                   │
│ social campaigns · agent-to-human jobs · multi-chain settlement  │
└─────────────────────────────────────────────────────────────────┘
```

For the full layer map, request flow, and directory breakdown, read [STACK.md](./STACK.md).

---

## Monorepo map

| Area | Directories |
|---|---|
| **Orchestrator** | [`openclawd-stack/orchestrator/`](./openclawd-stack/orchestrator/) — honcho, e2b, privy, mcp, payments, wurk x402, metaplex |
| **Core Runtime** | [`solana-clawd/`](./solana-clawd/), [`AGENTS/`](./AGENTS/), [`src/`](./src/), [`MCP/`](./MCP/), [`packages/`](./packages/) |
 | **Router & Payments** | [`clawdrouter/`](./clawdrouter/), [`x402-openrouter-main/`](./x402-openrouter-main/), [`workers/`](./workers/), [`services/`](./services/), [`plugin.delivery/`](./plugin.delivery/) |
 | **OpenAI Trading Bot** | [`workers/openai-trading-bot/`](./workers/openai-trading-bot/) — GPT-5.4 Solana trading Telegram bot with CUA, image gen, web search |
| **Surfaces** | [`chrome-extension/`](./chrome-extension/) · [`tailclawd/`](./tailclawd/) · [`WatchApp/`](./WatchApp/) · [`beepboop/`](./beepboop/) · [`chess/`](./chess/) |
| **Cloud & Orchestration** | [`openclawd-stack/`](./openclawd-stack/) · [`clawd-cloud-os/`](./clawd-cloud-os/) · [`CLI/`](./CLI/) |
| **Cloud Bridge** | [`openclawd-stack/bridge/`](./openclawd-stack/bridge/) — WS terminal bridge |
| **Solana Blockchain API** | [`API/`](./API/) · [`bds-public-main/`](./API/bds-public-main/) · [`pump-public-docs/`](./API/pump-public-docs/) · [`solana-tracker/`](./API/solana-tracker/) |
| **Skills & Knowledge** | [`clawdhub/`](./clawdhub/), [`skills/`](./skills/), [`acp_registry/`](./acp_registry/), [`docs/articles/`](./docs/articles/) |
| **Security (ClawdVault)** | [`clawd-vault-master/`](./clawd-vault-master/) — policy engine, skill scanning |
| **API Registrar** | [`api-registrar/`](./api-registrar/) — X-verified API key registration |
| **Monetization (WURK)** | [`skills/wurk-integration/`](./skills/wurk-integration/), [`MCP/wurk-mcp/`](./MCP/wurk-mcp/) |
| **Protocols** | [`x402-openrouter-main/`](./x402-openrouter-main/) — x402 payment protocol |
| **Scripts & CI** | [`scripts/`](./scripts/), [`NPM/`](./NPM/) |
| **SolanaOS Integration** | [`INTEGRATION_STRATEGY.md`](./INTEGRATION_STRATEGY.md) |

---

## Documentation Articles (46 articles)

| Category | Articles |
|----------|----------|
| **Core** | [AGENT_GUIDE.md](./docs/articles/AGENT_GUIDE.md), [agent-bus.md](./docs/articles/agent-bus.md), [architecture.md](./docs/articles/architecture.md) |
| **AI & Models** | [ARTICLE_LOCAL_AI.md](./docs/articles/ARTICLE_LOCAL_AI.md), [MODELS.md](./docs/articles/MODELS.md), [PROMPTS.md](./docs/articles/PROMPTS.md) |
| **Blockchain** | [solana-clawd-go.md](./docs/articles/solana-clawd-go.md), [SOLANA_CLAWD_SHELL.md](./docs/articles/SOLANA_CLAWD_SHELL.md), [MINTING_GUIDE.md](./docs/articles/MINTING_GUIDE.md) |
| **Payments** | [ARTICLE_PAYMENTS.md](./docs/articles/ARTICLE_PAYMENTS.md), [x402-proxy-worker.md](./docs/articles/x402-proxy-worker.md), [mpp-compatibility.md](./docs/articles/mpp-compatibility.md) |
| **Routing** | [CLAWD_ROUTER.md](./docs/articles/CLAWD_ROUTER.md), [CLAWD_ROUTER_BUILD.md](./docs/articles/CLAWD_ROUTER_BUILD.md), [CLAWD_ROUTER_TUNNEL.md](./docs/articles/CLAWD_ROUTER_TUNNEL.md), [routing-profiles.md](./docs/articles/routing-profiles.md) |
| **Marketplace** | [ARTICLE_SKILLS.md](./docs/articles/ARTICLE_SKILLS.md), [monetize.md](./docs/articles/monetize.md), [monetize-agents-openclawd.md](./docs/articles/monetize-agents-openclawd.md) |
| **Infrastructure** | [ARTICLE_TUNNELS.md](./docs/articles/ARTICLE_TUNNELS.md), [firecrawl.md](./docs/articles/firecrawl.md), [r2-vault.md](./docs/articles/r2-vault.md), [ipfs-setup.md](./docs/articles/ipfs-setup.md) |
| **Guides** | [FAQ.md](./docs/articles/FAQ.md), [TROUBLESHOOTING.md](./docs/articles/TROUBLESHOOTING.md), [WORKFLOW.md](./docs/articles/WORKFLOW.md), [configuration.md](./docs/articles/configuration.md) |

Full list in [`docs/articles/README.md`](./docs/articles/README.md).

---

## Security posture

- No real `.env` files are tracked in git.
- The root [`.gitignore`](./.gitignore) blocks common secret locations and `.npmrc`.
- Signing flows are deny-first by design.
- Sandbox-oriented components isolate user-controlled execution.
- Hosted endpoints are examples, not mandatory infrastructure.
- ClawdVault enforces policy checks on all skills before they enter the registry.

Read [SECURITY.md](./SECURITY.md) and [articles/permissions-sandboxing.md](./docs/articles/permissions-sandboxing.md).

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).

Common paths:

- ship a skill: `npx clawdhub publish ./my-skill --slug my-skill`
- add an agent: create a new directory under [`AGENTS/`](./AGENTS/) with its metadata and skill bundle
- publish npm packages: use [scripts/publish.sh](./scripts/publish.sh) with `NPM_TOKEN` exported in your shell
- extend the orchestrator: add routes in [`openclawd-stack/orchestrator/routes.ts`](./openclawd-stack/orchestrator/routes.ts)

---

## License

MIT. See [LICENSE.md](./LICENSE.md).

---

<div align="center">

### Open source · Open format · Open future

**$CLAWD** · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

Built by [8BIT Labs](https://8bit.io) · Inspired by [Nous Research](https://nousresearch.com) · Powered by [xAI Grok](https://x.ai) · Settled on [Solana](https://solana.com)

[![Twitter](https://img.shields.io/badge/𝕏-@clawddevs-000000?style=for-the-badge)](https://x.com/clawddevs)
[![Telegram](https://img.shields.io/badge/Telegram-clawdtoken-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/clawdtoken)
[![GitHub](https://img.shields.io/badge/GitHub-openclawd-181717?style=for-the-badge&logo=github)](https://github.com/x402agent/openclawd)
[![GitHub solana-clawd](https://img.shields.io/badge/GitHub-solana--clawd-181717?style=for-the-badge&logo=github)](https://github.com/x402agent/solana-clawd)
[![GitHub solanaos](https://img.shields.io/badge/GitHub-solanaos-181717?style=for-the-badge&logo=github)](https://github.com/x402agent/solanaos)

</div>