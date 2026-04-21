# OpenClawd Registry

> Open-source registry for the OpenClawd Solana AI agent ecosystem

## 🌐 Links

| Resource | URL |
|----------|-----|
| **Website** | [solanaclawd.com](https://solanaclawd.com) |
| **GitHub** | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| **Twitter/X** | [x.com/clawddevs](https://x.com/clawddevs) |
| **Telegram** | [t.me/clawdtoken](https://t.me/clawdtoken) |

## 💰 $CLAWD Token

**Address:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

The $CLAWD token powers the OpenClawd ecosystem with:
- Agent call payments (70% to agent owners)
- $CLAWD holder discounts (10-50% off)
- Revenue buyback and burn

## 📦 Projects (30 Total)

| Category | Projects |
|----------|----------|
| **Framework** | solana-clawd, src, solana-go-main |
| **AI Agents** | agents (50), skills (97), moltbook-agent |
| **Payments** | clawdrouter, x402-openrouter-main, plugin.delivery |
| **Infrastructure** | openclawd-stack, tailclawd, MCP, CLI, workers, clawdhub |
| **Interfaces** | chrome-extension, beepboop, WatchApp, tailclawd-backup |
| **Bots** | telegram, x-bot, bots |
| **Data** | llm-wiki-tang, chess, API |
| **Tools** | services, packages, npm, examples, websocket-server |
| **Docs** | articles (42 docs) |

See [`registry.json`](registry.json) for full machine-readable metadata.

## 🔐 x402 Payment Protocol

Multi-protocol agentic payment gateway supporting:
- **x402** — HTTP 402 on Solana (Ed25519 + SPL Token)
- **MPP** — Machine Payments Protocol
- **AP2** — Google Agent Payments Protocol
- **A2A** — Google Agent-to-Agent

**Gateway:** `solanaclawd.com/x402`

## ☁️ Cloud Clawd

Browser-based Solana trading terminal via E2B sandboxes.

Components:
- solana-clawd (OODA loop trading)
- nemoClawd (xAI Grok + 31 MCP tools)
- agentwallet (Privy wallets)
- Full CLI access

## 📜 License

MIT — See [`../LICENSE.md`](../LICENSE.md)

## 🔗 Quick Start

```bash
git clone https://github.com/x402agent/openclawd.git
cd openclawd
cd agents && npm install
cd ../solana-clawd && make install && clawd daemon