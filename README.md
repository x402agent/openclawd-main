# OpenClawd

> **The Solana AI Agent Ecosystem** — Open-source monorepo for building, deploying, and operating AI agents on Solana with 50 production agents, 100 skills, trading engines, MCP servers, payment infrastructure, and a ClawdHub marketplace.

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Ethereum-brightgreen?style=for-the-badge" alt="Solana">
  <img src="https://img.shields.io/badge/AI-Agents-FF6B6B?style=for-the-badge" alt="AI Agents">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/MCP-Protocol-9B59B6?style=for-the-badge" alt="MCP">
  <img src="https://img.shields.io/badge/x402-Payments-F39C12?style=for-the-badge" alt="x402">
  <img src="https://img.shields.io/badge/Skills-100-brightgreen?style=for-the-badge" alt="Skills">
  <img src="https://img.shields.io/badge/ClawdHub-Marketplace-E11D24?style=for-the-badge" alt="ClawdHub">
</p>

<p align="center">
  <strong>$CLAWD Token:</strong> <a href="https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump">8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump</a>
</p>

## 🌐 Quick Links

| Resource | URL |
|----------|-----|
| **Website** | [solanaclawd.com](https://solanaclawd.com) |
| **GitHub** | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| **Skills Marketplace** | [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace) |
| **API** | [solanaclawd.com/api](https://solanaclawd.com/api) |
| **x402 Gateway** | [solanaclawd.com/x402](https://solanaclawd.com/x402) |
| **Twitter/X** | [x.com/clawddevs](https://x.com/clawddevs) |
| **Telegram** | [t.me/clawdtoken](https://t.me/clawdtoken) |
| **IPFS Gateway** | [ipfs.solanaclawd.com](https://ipfs.solanaclawd.com) |

---

## ✨ What's Inside

OpenClawd is a comprehensive monorepo for building, deploying, and operating AI agents on Solana. It combines trading engines, MCP servers, Telegram bots, Chrome extensions, payment infrastructure, ClawdHub skills marketplace, and cloud deployment into a unified agentic runtime.

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

### 🏪 100 Skills in the ClawdHub Marketplace

| Category | Count | Examples |
|----------|-------|----------|
| **Clawd Ecosystem** | 7 | clawdhub, openclawd-codeskill, claude-code-skill, skill-creator |
| **Pump.fun** | 26 | pumpfun-launcher, pumpfun-trading, pumpfun-analytics |
| **Solana/Blockchain** | 8 | solana-clawd, solana-dev, metaplex, solana-formal-verification |
| **AI/Agents** | 8 | gemini, coding-agent, cua, swarm-orchestrator |
| **Productivity** | 15 | browse, summarize, notion, obsidian, trello |
| **Media** | 10 | canvas, camsnap, video-frames, spotify-player |
| **DevOps** | 5 | gateway-node-ops, e2b, tmux |
| **Communication** | 8 | discord, slack, himalaya, wacli, imsg |
| **System/IoT** | 7 | eightctl, openhue, sonoscli, healthcheck |

---

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

# Install skills via ClawdHub
npx clawdhub install pumpfun-trading
npx clawdhub install solana-clawd
npx clawdhub list

# Or use curl commands
curl https://solanaclawd.com/api/skills | jq '.'
```

---

## 🏪 ClawdHub — Skills Marketplace

**The central hub for AI agent capabilities** — Browse, publish, and install `SKILL.md` bundles.

### CLI Commands (npx clawdhub)

```bash
# Install skills
npx clawdhub install pumpfun-trading
npx clawdhub install solana-clawd
npx clawdhub install swarm-orchestrator
npx clawdhub install skill-creator

# List installed skills
npx clawdhub list

# Search skills
npx clawdhub search solana
npx clawdhub search trading

# Update a skill
npx clawdhub update pumpfun-trading

# Publish your own skill
npx clawdhub publish ./my-skill --slug my-skill

# Get featured skills
npx clawdhub featured

# Get skill details
npx clawdhub inspect pumpfun-trading
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
curl https://solanaclawd.com/api/marketplace/categories | jq '.'

# Trending skills
curl https://solanaclawd.com/api/marketplace/trending | jq '.'

# New skills
curl https://solanaclawd.com/api/marketplace/new | jq '.'
```

### Featured Skills

| Skill | Description |
|-------|-------------|
| **swarm-orchestrator** | Multi-bot trading swarms on Pump.fun |
| **clawdhub** | Browse, publish, and install SKILL.md bundles |
| **solana-clawd** | OODA loop trading + 31 MCP tools |
| **pumpfun-launcher** | Launch tokens on Pump.fun |
| **pumpfun-trading** | Buy/sell on bonding curves |
| **skill-creator** | Create new SKILL.md files |

### Monetization

Skills can be integrated with the ClawdRouter payment system:
- **Per-call payments** — Pay per skill invocation
- **Subscriptions** — Monthly/annual access
- **$CLAWD discounts** — Token holders get 10-50% off

---

## 📁 Project Structure (31 Projects)

### 🤖 Core Agent Framework

| Project | Description |
|---------|-------------|
| [`solana-clawd/`](solana-clawd/) | **Go + TypeScript** agent framework with OODA trading engine, 31 MCP tools, gagliardetto/solana-go SDK, and xAI Grok integration |
| [`agents/`](agents/) | **50 production AI agents** with Metaplex integration, REST API, and MCP endpoints |
| [`clawdrouter/`](clawdrouter/) | **Multi-protocol payment gateway** — x402, MPP, AP2, A2A with Solana settlement and $CLAWD holder discounts |

### 🏪 Skills Hub & Marketplace

| Project | Description |
|---------|-------------|
| [`clawdhub/`](clawdhub/) | **ClawdHub** — Skills registry, SOUL.md bundles, vector search, marketplace |
| [`skills/`](skills/) | **100 bundled SKILL.md** files for AI agent capabilities |
| [`plugin.delivery/`](plugin.delivery/) | **Plugin delivery system** for skill and agent monetization |

### 🌐 Infrastructure & Deployment

| Project | Description |
|---------|-------------|
| [`openclawd-stack/`](openclawd-stack/) | **Production deployment stack** — OpenShell sandboxes, E2B cloud terminals, Privy wallets |
| [`MCP/`](MCP/) | **Model Context Protocol servers** for editor integration (VS Code, Cursor, Zed) |
| [`CLI/`](CLI/) | **Command-line tools** — ClawdHub CLI, curl commands, registration, gateway connection |
| [`workers/`](workers/) | **Cloudflare Workers** — agent-wallet, email-worker, pumpfun-mcp-worker |

### 💳 Payment Infrastructure

| Project | Description |
|---------|-------------|
| [`x402-openrouter-main/`](x402-openrouter-main/) | **x402 protocol** native implementation for Solana |

### 🖥️ User Interfaces

| Project | Description |
|---------|-------------|
| [`tailclawd/`](tailclawd/) | **Web Claude Code** — browser-based terminal via Tailscale with SSE streaming |
| [`chrome-extension/`](chrome-extension/) | **Browser extension** — clawd-agent, page-agent, page-controller |
| [`beepboop/`](beepboop/) | **macOS menu bar** — lobster claw companion with voice, vision, claw pointing |
| [`WatchApp/`](WatchApp/) | **watchOS app** — wallet state monitoring |

### 📱 Communication & Bots

| Project | Description |
|---------|-------------|
| [`telegram/`](telegram/) | **Telegram bots** — agent integrations |
| [`x-bot/`](x-bot/) | **Twitter/X bot** — agent automation |
| [`bots/`](bots/) | **Trading bots** — Pump.fun sniper, mayhem trading AI |

### 🎮 Applications

| Project | Description |
|---------|-------------|
| [`chess/`](chess/) | **SolanaOS Chess hub** — live play, wallet-signed matches |

### 🛠️ Developer Tools

| Project | Description |
|---------|-------------|
| [`src/`](src/) | **Core engine** — TypeScript engine, commands, tools, memory, bridge, gateway |
| [`packages/`](packages/) | **Shared npm packages** |
| [`API/`](API/) | **API definitions** — BDS public, Pump.fun docs |
| [`websocket-server/`](websocket-server/) | **WebSocket server** for real-time communication |

### 🗄️ Data & Services

| Project | Description |
|---------|-------------|
| [`services/`](services/) | **Backend services** — gateway, bridge, monitoring |
| [`llm-wiki-tang/`](llm-wiki-tang/) | **LLM knowledge base** with vector embeddings |
| [`clawd-cloud-os/`](clawd-cloud-os/) | **Cloud OS** integration |

### 📦 Installers & Examples

| Project | Description |
|---------|-------------|
| [`npm/`](npm/) | **npm installers** — ClawdBot CLI, SolanaOS CLI |
| [`examples/`](examples/) | **Example code** — blockchain demos, OODA loop, x402 |
| [`moltbook-agent/`](moltbook-agent/) | **Moltbook agent** — educational platform integration |

### 🗂️ Registry & Docs

| Project | Description |
|---------|-------------|
| [`acp_registry/`](acp_registry/) | **Project registry** — JSON registry of all projects |
| [`articles/`](articles/) | **Documentation** — 42 articles on architecture, payments, deployment, AI, SEO |

---

## 💰 $CLAWD Token & Revenue Model

The $CLAWD token powers the OpenClawd ecosystem:

### Tokenomics

| Metric | Value |
|--------|-------|
| **Token** | $CLAWD |
| **Address** | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |
| **Standard** | SPL Token (Solana) |
| **Settlement** | SPL USDC + $CLAWD |

### Holder Discounts

Every agent call checks the caller's $CLAWD balance. Holders get tiered discounts:

| Balance | Discount |
|---------|----------|
| ≥ 100k $CLAWD | 10% |
| ≥ 1M $CLAWD | 25% |
| ≥ 10M $CLAWD | 50% |

### Revenue Split

When agents earn from calls:

| Recipient | Share | Mechanism |
|-----------|-------|-----------|
| Agent owner | 70% | Direct SPL transfer |
| $CLAWD buyback | 15% | Jupiter swap USDC → $CLAWD → burn |
| ClawdRouter treasury | 10% | Squads multisig |
| Operator (node) | 5% | Facilitator runner |

---

## 🔐 x402 Payment Protocol

Multi-protocol agentic payment gateway for Solana — **one endpoint, four protocols, one settlement layer**.

### Supported Protocols

| Protocol | Description |
|----------|-------------|
| **x402** | HTTP 402 native on Solana (Ed25519 + SPL Token) |
| **MPP** | Machine Payments Protocol (Tempo/Stripe) |
| **AP2** | Google Agent Payments Protocol |
| **A2A** | Google Agent-to-Agent with payment wrapping |

### x402 Endpoints

| Route | Purpose |
|-------|---------|
| `POST /facilitator/verify` | x402 facilitator verify |
| `POST /facilitator/settle` | x402 facilitator settle |
| `GET /facilitator/supported` | Supported networks and tokens |
| `POST /registry/register` | Register an agent (creates PDA) |
| `GET /registry/:id` | Fetch agent manifest from IPFS |
| `POST /a2a/:id/tasks/send` | A2A task send (payment-gated) |

### x402 Curl Commands

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

# Register agent
curl -X POST https://solanaclawd.com/x402/registry/register \
  -H "Content-Type: application/json" \
  -d '{"agentId":"<id>","manifest":"<ipfs://...>"}'
```

---

## ☁️ Cloud Clawd

**Your Browser IS the Terminal** — Transform any website into a fully functional Solana trading desktop.

### How It Works

```
User clicks "Launch Terminal"
        │
        ▼
   E2B creates sandbox (Ubuntu 24.04)
        │
        ▼
   Sandbox boots with solana-clawd pre-installed
        │
        ▼
   WebSocket bridge connects browser to sandbox
        │
        ▼
   User gets full terminal in browser
```

### Components

- **solana-clawd** — OODA loop trading engine
- **nemoClawd** — xAI Grok integration with 31 MCP tools
- **agentwallet** — Privy-powered agentic wallet management
- **Full CLI access** — Install npm packages, run any command

### Security

- User secrets isolated in E2B sandbox
- No secrets touch your servers
- Configurable network access
- Per-user sandboxing

---

## 📖 Documentation

### Core Documentation

| Document | Description |
|----------|-------------|
| [`agents/README.md`](agents/README.md) | 50 AI agents catalog with MCP integration |
| [`solana-clawd/README.md`](solana-clawd/README.md) | Agent framework with OODA loop |
| [`clawdrouter/README.md`](clawdrouter/README.md) | Payment gateway with x402, MPP, AP2, A2A |
| [`tailclawd/README.md`](tailclawd/README.md) | Web-based Claude Code interface |
| [`clawdhub/README.md`](clawdhub/README.md) | ClawdHub skills marketplace |
| [`skills/README.md`](skills/README.md) | 100 skills catalog and usage guide |
| [`CLI/README.md`](CLI/README.md) | CLI commands and curl API |

### Articles (42 Documents)

Located in [`articles/`](articles/):

| Category | Articles |
|----------|----------|
| **Architecture** | CLAWD_ROUTER, SOLANA_CLAWD_SHELL, architecture |
| **Deployment** | CLAWD_ROUTER_BUILD, CLAWD_ROUTER_TUNNEL, migrate-from-openclaw |
| **Payments** | ARTICLE_PAYMENTS, monetize, x402-proxy-worker, mpp-compatibility |
| **AI/Agents** | ARTICLE, ARTICLE_LOCAL_AI, grok-prompting, pi-chat-streaming |
| **Development** | WORKFLOW, AGENT_GUIDE, CLI_PAIR_FLOW, TROUBLESHOOTING |
| **Marketing** | ARTICLE_MARKET, SEO_STRATEGY, KEYWORDS |
| **Monetization** | monetize-agents-openclawd, monetization |

---

## 🛡️ Security

- **No data collection** — static JSON index, zero tracking
- **Agents run wherever you install them** — local Clawd Desktop, your own infra, or MPL Core on Solana
- **Deny-first signing** — every agent instructs deny-first behaviour on irreversible actions
- **Payment-gated agents** are transparent — wallet connect → on-chain verify → deliver
- **E2B sandbox isolation** — user secrets never touch your servers

---

## 📜 License

MIT License — See [`LICENSE.md`](LICENSE.md) and individual project directories.

---

## 🔗 Ecosystem Links

| Platform | Link |
|----------|------|
| **Website** | [solanaclawd.com](https://solanaclawd.com) |
| **GitHub** | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| **Skills Marketplace** | [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace) |
| **API** | [solanaclawd.com/api](https://solanaclawd.com/api) |
| **x402 Gateway** | [solanaclawd.com/x402](https://solanaclawd.com/x402) |
| **Twitter** | [x.com/clawddevs](https://x.com/clawddevs) |
| **Telegram** | [t.me/clawdtoken](https://t.me/clawdtoken) |

---

**Open Source • Open Format • Open Future**

*Built with ❤️ by [8BIT Labs](https://8bit.io)* · Powered by [xAI Grok](https://x.ai) · Built on [Solana](https://solana.com)