# OpenClawd

> Open-source Solana AI agent ecosystem — 50 agents, trading engines, MCP servers, and cloud infrastructure

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Ethereum-brightgreen?style=for-the-badge" alt="Solana">
  <img src="https://img.shields.io/badge/AI-Agents-FF6B6B?style=for-the-badge" alt="AI Agents">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/MCP-Protocol-9B59B6?style=for-the-badge" alt="MCP">
</p>

## ✨ What's Inside

OpenClawd is a comprehensive monorepo for building, deploying, and operating AI agents on Solana. It combines trading engines, MCP servers, Telegram bots, Chrome extensions, and cloud infrastructure into a unified agentic runtime.

### 🧠 50 Production AI Agents

| Category | Count | Examples |
|----------|-------|----------|
| **DeFi** | 12 | Yield aggregator, liquidity strategist, protocol comparator |
| **Trading** | 6 | Jupiter router, pump screener, DEX optimizer |
| **Analytics** | 11 | Portfolio tracker, whale watcher, risk monitor |
| **Security** | 8 | Rug screener, MEV advisor, wallet security |
| **Education** | 6 | Staking calculator, onboarding guide, L2 comparison |
| **Dev Tools** | 3 | Priority fee expert, SDK documentation |
| **Governance** | 2 | Proposal analyst, governance guide |
| **NFT** | 2 | MPL Core launcher, liquidity advisor |

### 🚀 Core Components

| Project | Description |
|---------|-------------|
| [`solana-clawd/`](solana-clawd/) | Go + TypeScript agent framework with OODA trading engine and 31 MCP tools |
| [`agents/`](agents/) | 50 production-ready AI agents with Metaplex integration |
| [`tailclawd/`](tailclawd/) | Web interface for Claude Code from any browser (Tailscale-aware) |
| [`clawdhub/`](clawdhub/) | Skills/souls registry hub with Convex backend |
| [`skills/`](skills/) | 97 bundled SKILL.md files for agent capabilities |
| [`openclawd-stack/`](openclawd-stack/) | Production deployment stack with OpenShell, E2B, and Privy |

### 🛠️ Infrastructure

| Project | Description |
|---------|-------------|
| [`MCP/`](MCP/) | Model Context Protocol servers |
| [`CLI/`](CLI/) | Command-line tools |
| [`workers/`](workers/) | Cloudflare edge workers |
| [`chrome-extension/`](chrome-extension/) | Browser extension |
| [`telegram/`](telegram/) | Telegram bot integrations |
| [`x-bot/`](x-bot/) | Twitter/X bot |

### 📱 Applications

| Project | Description |
|---------|-------------|
| [`beepboop/`](beepboop/) | macOS menu bar app with voice, vision, and claw pointing |
| [`WatchApp/`](WatchApp/) | watchOS companion app for SolanaOS |
| [`bots/`](bots/) | Trading bots (Pump.fun sniper, etc.) |

## 📁 Project Structure

```
openclawd/
├── agents/              # 50 production AI agents
├── solana-clawd/        # Go + TypeScript framework
├── tailclawd/           # Web Claude Code interface
├── clawdhub/            # Skills registry hub
├── skills/              # 97 bundled SKILL.md files
├── MCP/                 # MCP servers
├── CLI/                 # Command-line tools
├── src/                 # Core TypeScript engine
├── telegram/            # Telegram bots
├── workers/             # Edge workers
├── chrome-extension/    # Browser extension
├── openclawd-stack/     # Production deployment
├── bots/                # Trading bots
├── x-bot/               # Twitter bot
├── beepboop/            # macOS menu bar app
├── WatchApp/            # watchOS app
├── acp_registry/        # This registry
└── README.md            # You are here
```

## 🚀 Quick Start

```bash
# Clone the monorepo
git clone https://github.com/x402agent/openclawd.git
cd openclawd

# Install agents
cd agents && npm install

# Start the OODA trading engine
cd ../solana-clawd
make install
clawd daemon
clawd ooda --sim   # Simulated trading mode
```

## 🔗 Key Links

| Resource | URL |
|----------|-----|
| **Website** | [openclawd.io](https://openclawd.io) |
| **GitHub** | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| **Twitter** | [@clawddevs](https://x.com/clawddevs) |
| **Telegram** | [@clawdtoken](https://t.me/clawdtoken) |

## 📖 Documentation

- [`agents/README.md`](agents/README.md) — 50 AI agents catalog
- [`solana-clawd/README.md`](solana-clawd/README.md) — Agent framework
- [`tailclawd/README.md`](tailclawd/README.md) — Web interface
- [`clawdhub/README.md`](clawdhub/README.md) — Skills registry
- [`openclawd-stack/README.md`](openclawd-stack/README.md) — Deployment stack

## 🛡️ Security

- **No data collection** — static JSON index, zero tracking
- **Agents run wherever you install them** — local Clawd Desktop, your own infra, or MPL Core on Solana
- **Deny-first signing** — every agent instructs deny-first behaviour on irreversible actions
- **Payment-gated agents** are transparent — wallet connect → on-chain verify → deliver

## 📜 License

MIT License — See individual project directories for specific licenses.

**Open Source • Open Format • Open Future**

---

*Built with ❤️ by [8BIT Labs](https://8bit.io)*