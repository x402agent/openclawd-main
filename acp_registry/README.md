# OpenClawd Registry

> Open-source registry for the OpenClawd Solana AI agent ecosystem

## Overview

OpenClawd is a comprehensive monorepo for building, deploying, and operating AI agents on Solana. It combines trading engines, MCP servers, Telegram bots, Chrome extensions, and cloud infrastructure into a unified agentic runtime.

## Quick Start

```bash
# Clone the monorepo
git clone https://github.com/x402agent/openclawd.git
cd openclawd

# Install dependencies
cd agents && npm install
cd ../solana-clawd && npm install

# Start the OODA trading engine
cd ../solana-clawd && make install && clawd daemon
```

## Project Structure

```
openclawd/
├── agents/              # 50 production AI agents (DeFi, trading, NFTs, security)
├── solana-clawd/        # Go + TypeScript agent framework
├── tailclawd/           # Web-based Claude Code interface (Tailscale-aware)
├── clawdhub/            # Skills/souls registry hub (TanStack + Convex)
├── skills/              # 97 bundled SKILL.md files
├── MCP/                 # Model Context Protocol servers
├── CLI/                 # Command-line tools
├── src/                 # Core TypeScript engine
├── telegram/            # Telegram bot integrations
├── workers/             # Cloudflare/edge workers
├── chrome-extension/     # Browser extension
├── openclawd-stack/     # Production deployment stack
├── bots/                # Trading bots (Pump.fun sniper, etc.)
├── x-bot/               # Twitter/X bot
└── acp_registry/        # This registry
```

## Key Components

### AI Agents (50 agents)

| Category | Count | Examples |
|----------|-------|----------|
| DeFi | 12 | Yield aggregator, liquidity strategist, protocol comparator |
| Trading | 6 | Jupiter router, pump screener, DEX optimizer |
| Analytics | 11 | Portfolio tracker, whale watcher, risk monitor |
| Security | 8 | Rug screener, MEV advisor, wallet security |
| Education | 6 | Staking calculator, onboarding guide, L2 comparison |
| Dev Tools | 3 | Priority fee expert, SDK documentation |
| Governance | 2 | Proposal analyst, governance guide |
| NFT | 2 | MPL Core launcher, liquidity advisor |

### Core Framework (solana-clawd)

- **Go Runtime**: Native gagliardetto/solana-go SDK for on-chain operations
- **OODA Loop Trading**: MawdBot for Pump.fun and Solana spot
- **31+ MCP Tools**: Market data, trading, wallet operations
- **Memory Tiers**: KNOWN/LEARNED/INFERRED epistemology

### Infrastructure

- **TailClawd**: Web interface for Claude Code from any browser
- **ClawdHub**: Skills/souls registry with Convex backend
- **OpenShell**: Secure isolated execution environments
- **Privy Integration**: Agentic wallet management

## License

MIT — See individual project directories for specific licenses

## Links

- **Website**: [openclawd.io](https://openclawd.io)
- **GitHub**: [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd)
- **Twitter**: [@clawddevs](https://x.com/clawddevs)