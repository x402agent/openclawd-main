# OpenClawd

> **The Complete Solana AI Agent Ecosystem** — Open-source monorepo for building, deploying, and operating AI agents on Solana with 50 production agents, 100 skills, trading engines, MCP servers, x402 payment infrastructure, and ClawdHub marketplace.

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Ethereum-brightgreen?style=for-the-badge" alt="Solana">
  <img src="https://img.shields.io/badge/AI-Agents-FF6B6B?style=for-the-badge" alt="AI Agents">
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="License MIT">
  <img src="https://img.shields.io/badge/MCP-Protocol-9B59B6?style=for-the-badge" alt="MCP">
  <img src="https://img.shields.io/badge/x402-Payments-F39C12?style=for-the-badge" alt="x402">
  <img src="https://img.shields.io/badge/Skills-100-brightgreen?style=for-the-badge" alt="Skills">
  <img src="https://img.shields.io/badge/Agents-50-4CAF50?style=for-the-badge" alt="Agents">
</p>

<p align="center">
  <strong>$CLAWD Token:</strong> <a href="https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump">8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump</a>
</p>

---

## 🌐 Quick Links

| Resource | URL |
|----------|-----|
| **Website** | [solanaclawd.com](https://solanaclawd.com) |
| **GitHub** | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| **Skills Marketplace** | [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace) |
| **API** | [solanaclawd.com/api](https://solanaclawd.com/api) |
| **x402 Gateway** | [solanaclawd.com/x402](https://solanaclawd.com/x402) |
| **IPFS Gateway** | [ipfs.solanaclawd.com](https://ipfs.solanaclawd.com) |
| **Twitter/X** | [x.com/clawddevs](https://x.com/clawddevs) |
| **Telegram** | [t.me/clawdtoken](https://t.me/clawdtoken) |

---

## 📚 What is OpenClawd?

OpenClawd is a comprehensive open-source monorepo for building, deploying, and operating AI agents on Solana. It combines trading engines, MCP servers, Telegram bots, Chrome extensions, payment infrastructure, ClawdHub skills marketplace, and cloud deployment into a unified agentic runtime.

> 👉 **See [`STACK.md`](STACK.md) for the unified stack map** — how all 33 projects connect through one router, one settlement layer, one environment contract.

### 🆕 Latest Additions

| Model | ID | Context | Role |
|-------|-----|---------|------|
| **Grok 4.20 Beta** | `xai/grok-4.20-beta` | 256K | New default for `REASONING` tier — Solana-aware, agentic, vision |
| **Kimi K2.6** | `moonshot/kimi-k2.6` | 320K | Long-context agentic tool-use + code/audit workflows |

Both are live in [`clawdrouter`](clawdrouter/src/models/registry.ts), wired through the OpenRouter upstream, included in ClawdHub Godmode, and set as the default model for NemoClawd.

### Key Components

| Component | Description |
|-----------|-------------|
| **50 AI Agents** | Production-ready agents for trading, DeFi, NFTs, security, and more |
| **100 Skills** | ClawdHub marketplace with SKILL.md bundles |
| **OODA Trading Engine** | Observe-Orient-Decide-Act loop with xAI Grok |
| **x402 Payments** | Multi-protocol payment gateway (x402, MPP, AP2, A2A) |
| **MCP Servers** | Model Context Protocol for editor integration |
| **Cloud Clawd** | Browser-based Solana trading terminal |

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      OpenClawd Ecosystem                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   Agents    │  │   Skills    │  │      Payments       │ │
│  │   (50)      │  │   (100)     │  │   (x402, MPP, AP2)  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              ClawdHub Marketplace                       ││
│  │         solanaclawd.com/marketplace                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │   MCP       │  │  Cloud      │  │    Solana          │ │
│  │   Servers   │  │   Clawd     │  │    (OODA Loop)     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧠 50 Production AI Agents

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

### Agent Capabilities

- **OODA Loop** — Observe-Orient-Decide-Act trading framework
- **31 MCP Tools** — Comprehensive Solana ecosystem integration
- **xAI Grok** — Powered by xAI for advanced reasoning
- **On-chain Execution** — Direct Solana blockchain interaction
- **Privy Wallets** — Secure agentic wallet management

---

## 🏪 ClawdHub — Skills Marketplace

**The central hub for AI agent capabilities** — Browse, publish, and install `SKILL.md` bundles.

### 100 Skills Catalog

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

Every agent call checks the caller's $CLAWD balance:

| Balance | Discount |
|---------|----------|
| ≥ 100k $CLAWD | 10% |
| ≥ 1M $CLAWD | 25% |
| ≥ 10M $CLAWD | 50% |

### Revenue Split

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

### Use Cases

- **SaaS Trading Platforms** — White-label to your users
- **Education** — Safe learning environments
- **API Key Management** — Secure key handling
- **Automated Trading** — Run bots 24/7

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
```

---

## 📁 Project Structure (33 Projects)

### 🤖 Core Agent Framework

| Project | Description |
|---------|-------------|
| [`solana-clawd/`](solana-clawd/) | **Go + TypeScript** agent framework with OODA trading engine, 31 MCP tools, and xAI Grok integration |
| [`agents/`](agents/) | **50 production AI agents** with Metaplex, REST API, and MCP endpoints |
| [`clawdrouter/`](clawdrouter/) | **Multi-protocol payment gateway** — x402, MPP, AP2, A2A with Solana settlement |

### 🏪 Skills Hub & Marketplace

| Project | Description |
|---------|-------------|
| [`clawdhub/`](clawdhub/) | **ClawdHub** — Skills registry, SOUL.md bundles, vector search, marketplace |
| [`skills/`](skills/) | **100 bundled SKILL.md** files for AI agent capabilities |
| [`plugin.delivery/`](plugin.delivery/) | **Plugin delivery system** for skill and agent monetization |

### 💳 Payment Infrastructure

| Project | Description |
|---------|-------------|
| [`x402-openrouter-main/`](x402-openrouter-main/) | **x402 protocol** native implementation for Solana |
| [`clawdrouter/`](clawdrouter/) | **ClawdRouter** — Multi-protocol payment gateway |

### 🌐 Infrastructure & Deployment

| Project | Description |
|---------|-------------|
| [`openclawd-stack/`](openclawd-stack/) | **Production deployment stack** — OpenShell, E2B, Privy wallets |
| [`MCP/`](MCP/) | **Model Context Protocol servers** for editor integration |
| [`CLI/`](CLI/) | **Command-line tools** — ClawdHub CLI, curl commands, registration |
| [`workers/`](workers/) | **Cloudflare Workers** — agent-wallet, email-worker, pumpfun-mcp-worker |
| [`websocket-server/`](websocket-server/) | **WebSocket server** for real-time communication |

### 🖥️ User Interfaces

| Project | Description |
|---------|-------------|
| [`tailclawd/`](tailclawd/) | **Web Claude Code** — browser-based terminal via Tailscale |
| [`chrome-extension/`](chrome-extension/) | **Browser extension** — clawd-agent, page-agent, page-controller |
| [`beepboop/`](beepboop/) | **macOS menu bar** — lobster claw companion with voice, vision |
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
| [`src/`](src/) | **Core engine** — TypeScript engine, commands, tools, memory, bridge |
| [`packages/`](packages/) | **Shared npm packages** |
| [`API/`](API/) | **API definitions** — BDS public, Pump.fun docs |
| [`services/`](services/) | **Backend services** — gateway, bridge, monitoring |

### 🗄️ Data & AI

| Project | Description |
|---------|-------------|
| [`llm-wiki-tang/`](llm-wiki-tang/) | **LLM knowledge base** with vector embeddings |
| [`clawd-cloud-os/`](clawd-cloud-os/) | **Cloud OS** integration |

### 📦 Installers & Examples

| Project | Description |
|---------|-------------|
| [`npm/`](npm/) | **npm installers** — ClawdBot CLI, SolanaOS CLI |
| [`examples/`](examples/) | **Example code** — blockchain demos, OODA loop, x402 |
| [`moltbook-agent/`](moltbook-agent/) | **Moltbook agent** — educational platform |

### 🗂️ Registry & Docs

| Project | Description |
|---------|-------------|
| [`acp_registry/`](acp_registry/) | **Project registry** — JSON registry of all projects |
| [`articles/`](articles/) | **Documentation** — 42 articles on architecture, payments, AI, SEO |

### Blockchain SDKs

| Project | Description |
|---------|-------------|
| [`solana-go-main/`](solana-go-main/) | **Go SDK** for Solana blockchain operations |

---

## 📖 Documentation (42 Articles)

### Core Documentation

| Document | Description |
|----------|-------------|
| [`agents/README.md`](agents/README.md) | 50 AI agents catalog with MCP integration |
| [`solana-clawd/README.md`](solana-clawd/README.md) | Agent framework with OODA loop |
| [`clawdrouter/README.md`](clawdrouter/README.md) | Payment gateway with x402, MPP, AP2, A2A |
| [`tailclawd/README.md`](tailclawd/README.md) | Web-based Claude Code interface |
| [`clawdhub/README.md`](clawdhub/README.md) | ClawdHub skills marketplace |
| [`skills/README.md`](skills/README.md) | 100 skills catalog and usage |
| [`CLI/README.md`](CLI/README.md) | CLI commands and curl API |

### Architecture Articles

| Document | Description |
|----------|-------------|
| `articles/CLAWD_ROUTER.md` | ClawdRouter architecture and protocol overview |
| `articles/SOLANA_CLAWD_SHELL.md` | Full stack integration guide |
| `articles/architecture.md` | System architecture documentation |
| `articles/agent-bus.md` | Agent communication bus |

### Deployment Articles

| Document | Description |
|----------|-------------|
| `articles/CLAWD_ROUTER_BUILD.md` | Building and deploying ClawdRouter |
| `articles/CLAWD_ROUTER_TUNNEL.md` | Tunnel configuration guide |
| `articles/migrate-from-openclaw.md` | Migration guide from OpenClaw |
| `articles/clawdrouter-cloud.md` | Cloud deployment guide |

### Payment & Revenue Articles

| Document | Description |
|----------|-------------|
| `articles/ARTICLE_PAYMENTS.md` | Payment infrastructure overview |
| `articles/monetize.md` | Monetization strategies |
| `articles/monetize-agents-openclawd.md` | Agent monetization guide |
| `articles/x402-proxy-worker.md` | x402 proxy implementation |
| `articles/mpp-compatibility.md` | MPP protocol compatibility |
| `articles/r2-vault.md` | R2 vault integration |

### AI & Agents Articles

| Document | Description |
|----------|-------------|
| `articles/ARTICLE.md` | Core AI agent documentation |
| `articles/ARTICLE_LOCAL_AI.md` | Local AI integration |
| `articles/grok-prompting.md` | xAI Grok prompting techniques |
| `articles/pi-chat-streaming.md` | Chat streaming implementation |
| `articles/OPENCLAWDarticle.md` | Cloud Clawd browser terminal |

### Development Articles

| Document | Description |
|----------|-------------|
| `articles/WORKFLOW.md` | Development workflow |
| `articles/AGENT_GUIDE.md` | Agent creation guide |
| `articles/CLI_PAIR_FLOW.md` | CLI pairing flow |
| `articles/TROUBLESHOOTING.md` | Common issues and solutions |
| `articles/configuration.md` | Configuration guide |

### Models & Prompts Articles

| Document | Description |
|----------|-------------|
| `articles/MODELS.md` | AI model selection guide |
| `articles/PROMPTS.md` | Prompt engineering guide |
| `articles/openrouter-attribution.md` | OpenRouter attribution |

### SEO & Marketing Articles

| Document | Description |
|----------|-------------|
| `articles/ARTICLE_MARKET.md` | Marketing strategy |
| `articles/SEO_STRATEGY.md` | SEO optimization guide |
| `articles/KEYWORDS.md` | Keyword targeting |

### Advanced Topics

| Document | Description |
|----------|-------------|
| `articles/I18N_WORKFLOW.md` | Internationalization workflow |
| `articles/permissions-sandboxing.md` | Security and permissions |
| `articles/ipfs-setup.md` | IPFS setup guide |
| `articles/firecrawl.md` | Firecrawl integration |
| `articles/market.md` | Market analysis |

---

## 🛡️ Security

- **No data collection** — static JSON index, zero tracking
- **Agents run wherever you install them** — local Clawd Desktop, your own infra, or MPL Core on Solana
- **Deny-first signing** — every agent instructs deny-first behaviour on irreversible actions
- **Payment-gated agents** are transparent — wallet connect → on-chain verify → deliver
- **E2B sandbox isolation** — user secrets never touch your servers
- **Permissions & Sandboxing** — granular access controls

---

## 🔧 Configuration

### Environment Variables

```bash
# Core
CLAWD_API="https://solanaclawd.com/api"
MARKETPLACE="https://solanaclawd.com/marketplace"
GATEWAY="https://solanaclawd.com/x402"

# Solana
HELIUS_API_KEY=your_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com
SOLANA_PRIVATE_KEY=your_key

# AI
XAI_API_KEY=your_key
OPENROUTER_API_KEY=your_key

# Optional
TAILSCALE_AUTH_KEY=your_key
E2B_API_KEY=your_key
```

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for:
- Development setup
- Code standards
- Pull request process
- Skill creation guidelines

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