<div align="center">

<img src="https://raw.githubusercontent.com/x402agent/openclawd/main/gfx/lobster.svg" alt="OpenClawd" width="140" onerror="this.style.display='none'">

# 🦞 OpenClawd

### The complete open-source stack for building, deploying, and monetizing AI agents on Solana.

**One router · one settlement layer · one environment contract**

`34 projects` · `50 agents` · `100 skills` · `1000+ MCP tools` · `4 payment protocols` · `57 models`

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

[![npm solana-clawd](https://img.shields.io/npm/v/solana-clawd?style=flat-square&label=solana-clawd&color=cc3534)](https://www.npmjs.com/package/solana-clawd)
[![npm @openclawd/wallet](https://img.shields.io/npm/v/@openclawd/wallet?style=flat-square&label=@openclawd/wallet&color=cc3534)](https://www.npmjs.com/package/@openclawd/wallet)
[![Twitter Follow](https://img.shields.io/twitter/follow/clawddevs?style=flat-square&color=1DA1F2)](https://x.com/clawddevs)
[![Telegram](https://img.shields.io/badge/Telegram-clawdtoken-26A5E4?style=flat-square&logo=telegram)](https://t.me/clawdtoken)

[**⚡ Install**](#-install) · [**🏗️ Architecture**](#%EF%B8%8F-architecture) · [**🤖 Router**](#-clawdrouter--the-only-model-entry-point) · [**🦞 Wallet**](#-clawd-wallet--privy-embedded-wallet) · [**🏪 Marketplace**](#-clawdhub--skills-marketplace) · [**📖 Docs**](./articles) · [**🌐 Website**](https://solanaclawd.com)

</div>

---

## 🔓 Public Release

This repo is open for the community to build on. It ships with **no secrets,
no private keys, and no proprietary endpoints** — every credential has been
redacted to a placeholder. Before running anything:

1. Copy `.env.example` → `.env` (and any `*/.env.example` you need) and fill in
   your own keys.
2. Read [`SECURITY.md`](./SECURITY.md) for the full contract and how to report
   a vulnerability.
3. See [`STACK.md`](./STACK.md) and [`articles/`](./articles) for per-layer
   setup guides.

---

## 💡 Why OpenClawd?

Building AI agents on Solana today means stitching together 10+ services: an LLM router, a wallet layer, a payment facilitator, a sandbox, a skills registry, an MCP runtime, a pricing model, and a frontend. Every piece leaks secrets or charges rent.

**OpenClawd ships all of it as one open-source monorepo**, glued together by:

- 🤖 **ClawdRouter** — the only model entry point · 57 models, 15-dim scoring, x402-native
- 🦞 **@openclawd/wallet** — Privy-powered embedded wallet · Jupiter swaps · Grok transaction screening
- 💳 **x402 · MPP · AP2 · A2A** — four payment protocols, one settlement chain (Solana)
- 🏪 **ClawdHub** — 100 `SKILL.md` files, vector search, paid installs via $CLAWD
- 🤖 **50 production agents** — Metaplex Core NFTs, MCP servers, REST endpoints
- 🌫️ **Cloud Clawd** — browser-based Solana terminal on E2B sandboxes
- 🔐 **Deny-first signing** — user secrets never touch your servers

**One env contract. One router. One chain. Zero fluff.**

---

## ⚡ Install — 🦞 cyberpunk lobster edition

```bash
curl -fsSL https://solanaclawd-install.x402.workers.dev | bash
```

```
╔═══════════════════════════════════════════╗
║     ▄▄▄▄          OPEN       ▄▄▄▄         ║
║    ▐█▄█▌         CLAWD      ▐█▄█▌         ║
║     ╲██╱  ┏━━━━━━━━━━━━━┓   ╲██╱          ║
║      ██   ┃ 🦞 lobster.os┃    ██          ║
║     ▕██▏  ┃ chain: solana┃   ▕██▏         ║
║      ▀▀   ┗━━━━━━━━━━━━━┛    ▀▀           ║
║    ▄▄██████▄▄              ▄▄██████▄▄     ║
║   ▜█████████▛  ┌─┐┌─┐┌┐┌   ▜█████████▛    ║
║    ▀▀▀██▀▀▀   │  ├─┘││││    ▀▀▀██▀▀▀      ║
║                └─┘└─┘┘└┘                  ║
║  [ one router · one chain · zero fluff ]  ║
╚═══════════════════════════════════════════╝
```

The installer is live on Cloudflare Workers — fully self-contained, no repo access required, runs with themed unicode spinners (🦞 claw, scuttle, matrix, heartbeat) in 256-color ANSI.

| URL | Status |
|---|---|
| `https://solanaclawd-install.x402.workers.dev` | ✅ **Live now** — canonical |
| `https://install.solanaclawd.com` | ⏳ Activates when CF Bot Fight Mode is disabled |
| `https://solanaclawd.com/install.sh` | ⏳ Activates when apex DNS orange-clouds |

### What the installer does

1. **Preflight** — verifies `node ≥ 18`, `git`, `npm`
2. **Installs** `solana-clawd` CLI globally from npm
3. **Scaffolds** `~/.openclawd/.env` with Solana + model defaults (never overwrites)
4. **Prints** pair / mint / status next steps

### CLI only?

```bash
npm i -g solana-clawd
solana-clawd pair <CODE>   # pair this device
solana-clawd mint          # mint your agent NFT (Metaplex Core)
solana-clawd status        # show pairing + wallet
solana-clawd agent         # start agentic OODA loop
```

---

## 🪙 $CLAWD Token

<div align="center">

| Symbol | Chain | Standard | Contract Address |
|:---:|:---:|:---:|:---|
| **$CLAWD** | Solana | SPL Token | [`8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`](https://solscan.io/token/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump) |

[![Buy on Jupiter](https://img.shields.io/badge/Buy-Jupiter-F97316?style=for-the-badge)](https://jup.ag/swap/SOL-8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
[![Chart on Dexscreener](https://img.shields.io/badge/Chart-Dexscreener-000000?style=for-the-badge)](https://dexscreener.com/solana/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
[![Pump.fun](https://img.shields.io/badge/Pump.fun-Origin-3DCD58?style=for-the-badge)](https://pump.fun/coin/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)

</div>

### Holder utility

| Balance | ClawdRouter Discount | Benefit |
|:---:|:---:|:---|
| ≥ 100,000 $CLAWD | **10% off** | All paid model calls + paid skill installs |
| ≥ 1,000,000 $CLAWD | **25% off** | + priority routing + beta model access |
| ≥ 10,000,000 $CLAWD | **50% off** | + all features + Squads multisig governance voting |

### Revenue split — on every paid call

| Recipient | Share | Mechanism |
|---|:---:|---|
| **Agent owner** | **70%** | Direct SPL transfer to the NFT owner |
| **$CLAWD buyback & burn** | 15% | Jupiter swap USDC → $CLAWD → burn forever |
| **ClawdRouter treasury** | 10% | Squads multisig (community-governed) |
| **Operator (facilitator)** | 5% | Automatic payout to edge runner |

---

## 🌐 solanaclawd.com

**solanaclawd.com** is the production deployment of this monorepo — the canonical API surface for every openclawd user.

| Endpoint | Description |
|---|---|
| `solanaclawd.com` | Landing page + agent discovery |
| `solanaclawd.com/api` | REST API for skills, agents, registry |
| `solanaclawd.com/x402` | x402 / MPP / AP2 / A2A payment gateway |
| `solanaclawd.com/marketplace` | ClawdHub skills marketplace |
| `ipfs.solanaclawd.com` | IPFS gateway for SKILL.md + agent metadata |

---

## 🤖 ClawdRouter — the only model entry point

Every LLM call in openclawd flows through **one gateway**. ClawdRouter scores each request across **15 dimensions** (complexity, context-length, tool-use, vision, Solana-awareness, latency, price, attribution, etc.) and routes to the best-fit model.

**Highlights:**
- Drop-in replacement for OpenRouter — better scoring, cheaper, Solana-native
- 57 models across 4 tiers × 3 quality bands (Eco / Auto / Premium)
- Native x402 payment gateway — pay per call in SPL USDC or $CLAWD
- Upstream: OpenRouter, xAI, Anthropic, OpenAI, Moonshot — unified
- $CLAWD holder discounts built into the pricing layer

**Flagship models:**

| Model | Context | Role | Alias |
|---|:---:|---|---|
| **`xai/grok-4.20-beta`** | 256K | Default REASONING tier · Solana-aware · vision · agentic | `grok`, `grok-4.20` |
| **`moonshot/kimi-k2.6`** | 320K | Long-context agentic tool-use + code audit | `kimi`, `kimi-k2.6` |
| `anthropic/claude-opus-4.6` | 200K | COMPLEX-Premium | `opus`, `claude-opus` |
| `anthropic/claude-sonnet-4.6` | 200K | REASONING-Premium | `sonnet`, `claude-sonnet` |
| `openai/gpt-5.3-codex` | 128K | MEDIUM-Premium (code) | `gpt-5.3`, `codex` |
| `google/gemini-3.1-pro` | 2M | COMPLEX-Auto | `gemini`, `gemini-3.1` |

**Model tiers — pick one, let the router decide:**

| Tier | Eco | Auto | Premium |
|---|---|---|---|
| `SIMPLE` | `nvidia/gpt-oss-120b` *(free)* | `google/gemini-2.5-flash` | `nvidia/kimi-k2.5` |
| `MEDIUM` | `google/gemini-2.5-flash-lite` | `nvidia/kimi-k2.5` | `openai/gpt-5.3-codex` |
| `COMPLEX` | `google/gemini-2.5-flash-lite` | `google/gemini-3.1-pro` | `anthropic/claude-opus-4.6` |
| `REASONING` | `xai/grok-4-1-fast` | **`xai/grok-4.20-beta`** | `anthropic/claude-sonnet-4.6` |

**x402 facilitator endpoints:**
```bash
curl https://solanaclawd.com/x402/facilitator/supported | jq
curl -X POST https://solanaclawd.com/x402/facilitator/verify \
  -H 'content-type: application/json' -d '{"payment":"<id>"}'
curl -X POST https://solanaclawd.com/x402/facilitator/settle \
  -H 'content-type: application/json' -d '{"tx":"<sig>"}'
```

📁 Source: [`clawdrouter/`](./clawdrouter/) · Article: [`CLAWD_ROUTER.md`](./articles/CLAWD_ROUTER.md)

---

## 🦞 Clawd Wallet — Privy Embedded Wallet

**`@openclawd/wallet`** — drop-in embedded Solana wallet for any React, Next.js, or Node.js app.

> Private keys never leave Privy's secure TEE. Grok 4.20 Beta pre-screens every transaction. Deny-first permissions model.

**Architecture:**

```
User → Grok 4.20 Beta → ClawdWallet (Privy TEE) → Solana blockchain
         │
         ├─── allow ───→ auto-sign up to $50
         ├─── ask ──────→ Grok screens → user confirms
         └─── deny ──────→ always block
```

### React — 3 lines to a working wallet

```tsx
import { PrivyProvider, useClawdWallet } from "@openclawd/wallet/react";

<PrivyProvider appId={process.env.PRIVY_APP_ID!} embeddedWallets>
  <SwapButton />
</PrivyProvider>

// Inside any component:
const { wallet, connectWallet } = useClawdWallet();
// wallet.address, wallet.ready, connectWallet(), disconnect()
```

### Node.js — Jupiter swap in 6 lines

```ts
import { ClawdWallet, SwapService } from "@openclawd/wallet";

const wallet = new ClawdWallet(privyWallet, { chain: "mainnet" });
const swap = new SwapService();
const result = await swap.execute(wallet, {
  inputToken: "SOL", outputToken: "USDC",
  amount: "1000000000", slippageBps: 50,
});
console.log(result.explorerUrl);
```

### Agentic trading — Grok screens every tx

```ts
import { AgenticWallet, DEFAULT_PERMISSIONS } from "@openclawd/wallet";

const agent = new AgenticWallet(wallet, {
  privyAppId: process.env.PRIVY_APP_ID!,
  grokApiKey: process.env.XAI_API_KEY,
  permissions: { ...DEFAULT_PERMISSIONS, swap: "ask", maxSwapUsd: 100 },
});

const { signature, explorerUrl } = await agent.agentSwap({
  inputToken: "SOL", outputToken: "USDC",
  amount: "1000000000", slippageBps: 50,
});
```

### CLI

```bash
npm i -g @openclawd/wallet
clawd-wallet tokens              # list Jupiter tokens
clawd-wallet quote SOL USDC 0.1  # get swap quote
clawd-wallet balance <addr>      # check SOL balance
```

**Built-in tokens:** SOL · USDC · USDT · WBTC · WETH · BONK · WIF · POPCAT (+ any SPL mint)

📁 Source: [`packages/clawd-wallet/`](./packages/clawd-wallet/) · npm: [`@openclawd/wallet`](https://www.npmjs.com/package/@openclawd/wallet) · 📖 **[Full integration guide →](./articles/CLAWD_WALLET_INTEGRATION.md)**

---

## 🏪 ClawdHub — Skills Marketplace

The agent upgrade system. **100 bundled `SKILL.md` files** across 9 categories, searchable via vector embeddings. Install via CLI or download raw.

```bash
npx clawdhub install pumpfun-trading solana-clawd swarm-orchestrator
npx clawdhub search "solana rug"
npx clawdhub featured
npx clawdhub publish ./my-skill --slug my-skill
```

| Category | Count | Highlights |
|---|:---:|---|
| Clawd Ecosystem | 7 | `clawdhub`, `openclawd-codeskill`, `skill-creator` |
| Pump.fun | 26 | `pumpfun-launcher`, `pumpfun-trading`, `pumpfun-analytics` |
| Solana / Blockchain | 8 | `solana-clawd`, `solana-dev`, `metaplex` |
| AI / Agents | 8 | `swarm-orchestrator`, `coding-agent`, `cua` |
| Productivity | 15 | `browse`, `notion`, `obsidian`, `trello` |
| Media | 10 | `canvas`, `camsnap`, `video-frames`, `spotify-player` |
| DevOps | 5 | `gateway-node-ops`, `e2b`, `tmux` |
| Communication | 8 | `discord`, `slack`, `wacli`, `imsg` |
| System / IoT | 7 | `eightctl`, `openhue`, `sonoscli` |

**REST API:**
```bash
curl https://solanaclawd.com/api/skills | jq
curl "https://solanaclawd.com/api/skills/search?q=solana" | jq
curl -s https://solanaclawd.com/api/skills/pumpfun-trading/download -o SKILL.md
```

📁 Source: [`clawdhub/`](./clawdhub/) · Skills: [`skills/`](./skills/) · Article: [`ARTICLE_SKILLS.md`](./articles/ARTICLE_SKILLS.md)

---

## 💳 Payments — x402, MPP, AP2, A2A

Four payment protocols, one settlement layer (Solana), denominated in **SPL USDC + $CLAWD**.

| Protocol | Role |
|---|---|
| **x402** | HTTP 402 native on Solana (Ed25519 + SPL Token) |
| **MPP** | Stripe / Tempo Machine Payments Protocol |
| **AP2** | Google Agent Payments Protocol v2 |
| **A2A** | Google Agent-to-Agent, payment-wrapped |

Every paid call triggers the revenue split described in the **[$CLAWD Token](#-clawd-token)** section above — 70% to the agent owner, 15% burned, 10% treasury, 5% operator.

📁 Source: [`x402-openrouter-main/`](./x402-openrouter-main/) · Article: [`ARTICLE_PAYMENTS.md`](./articles/ARTICLE_PAYMENTS.md)

---

## 📦 solana-clawd — Go + TypeScript Agent Framework

Open-source Solana AI agent framework powered by xAI Grok.

**Core:**
- OODA-loop trading agent (MawdBot) for Pump.fun and Solana spot
- **31+ MCP tools**: market data, Jupiter DEX, Jupiter Limit Order, Solana Pay, Tensor, ZKLogin, Helius RPC, Privy wallet management, E2B sandbox exec
- TypeScript MCP server + Go runtime bridge
- Privy-managed agentic wallets per user — no seedphrase exposure
- E2B isolated Ubuntu sandbox for untrusted code execution

**CLI:**
```bash
solana-clawd pair <CODE>     # pair device
solana-clawd mint            # mint agent NFT (Metaplex Core)
solana-clawd status          # show pairing + wallet
solana-clawd agent           # start agentic OODA loop
```

📁 Source: [`solana-clawd/`](./solana-clawd/) · Go SDK: [`solana-go-main/`](./solana-go-main/) · Article: [`solana-clawd-go.md`](./articles/solana-clawd-go.md)

---

## 🤖 50 Production Agents

Every agent is a **`SKILL.md` bundle + an MCP server + a REST endpoint + an optional Metaplex Core NFT.**

| Category | Count | Examples |
|---|:---:|---|
| **DeFi** | 12 | Yield aggregator, liquidity strategist, protocol comparator |
| **Trading** | 6 | Jupiter router, pump screener, DEX optimizer |
| **Analytics** | 11 | Portfolio tracker, whale watcher, risk monitor |
| **Security** | 8 | Rug screener, MEV advisor, wallet security |
| **Education** | 6 | Staking calculator, onboarding guide, L2 comparison |
| **Dev tools** | 3 | Priority-fee expert, SDK documentation |
| **Governance** | 2 | Proposal analyst, governance guide |
| **NFT** | 2 | MPL Core launcher, liquidity advisor |

**Agent capabilities:** OODA loop framework · 31 MCP tools · on-chain execution · Privy agentic wallets · x402 payment-gated · $CLAWD holder-discounted.

📁 Source: [`agents/`](./agents/) · MCP: [`MCP/`](./MCP/) · Registry: [`acp_registry/`](./acp_registry/) · Article: [`AGENT_GUIDE.md`](./articles/AGENT_GUIDE.md)

---

## 🌫️ Cloud Clawd — Browser-based Solana Terminal

**E2B-isolated Ubuntu sandbox**, `solana-clawd` pre-installed, wired to a Privy agentic wallet. Runs entirely in the browser.

```
User click → E2B spawns Ubuntu 24.04 → WebSocket bridge → full CLI in browser
```

User secrets stay inside E2B. Your servers only see the pairing token.

📁 Source: [`openclawd-stack/`](./openclawd-stack/) · [`clawd-cloud-os/`](./clawd-cloud-os/) · Article: [`OPENCLAWDarticle.md`](./articles/OPENCLAWDarticle.md)

---

## 🏛️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│  SURFACES                                                       │
│  chrome-extension · beepboop · WatchApp · tailclawd · telegram  │
│  x-bot · chess · moltbook-agent · bots · examples               │
└────────────────────────────┬───────────────────────────────────┘
                             │ HTTP / SSE / WS
┌────────────────────────────▼───────────────────────────────────┐
│  GATEWAY + PAYMENTS                                             │
│  clawdrouter (57 models · 15-dim scorer)                        │
│  x402 · MPP · AP2 · A2A · CF edge workers                       │
│  plugin.delivery · services · websocket-server                  │
└────────────────────────────┬───────────────────────────────────┘
                             │ routed model calls + x402 settle
┌────────────────────────────▼───────────────────────────────────┐
│  RUNTIME                                                        │
│  src · agents (50) · MCP (31 tools) · openclawd-stack           │
│  CLI · clawd-cloud-os · solana-clawd · solana-go-main           │
│  packages/clawd-wallet (@openclawd/wallet)                      │
└────────────────────────────┬───────────────────────────────────┘
                             │ SKILL.md · agent.json · acp_registry
┌────────────────────────────▼───────────────────────────────────┐
│  SKILLS + REGISTRY                                              │
│  clawdhub · skills (100) · acp_registry · articles (43)         │
│  llm-wiki-tang                                                  │
└────────────────────────────┬───────────────────────────────────┘
                             │ signed SPL txns
┌────────────────────────────▼───────────────────────────────────┐
│  CHAIN                                                          │
│  Solana mainnet (USDC + $CLAWD) · Helius RPC · Jupiter          │
│  $CLAWD: 8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump           │
└────────────────────────────────────────────────────────────────┘
```

Full diagram, per-layer directory mapping, request flow, and config reference in **[STACK.md](./STACK.md)**.

---

## 📁 Monorepo layout — 34 projects

### 🏛️ Core framework

| Project | Description |
|---|---|
| [`solana-clawd/`](./solana-clawd/) | Go + TypeScript agent framework — OODA loop, 31+ MCP tools, xAI Grok |
| [`agents/`](./agents/) | 50 production AI agents — Metaplex Core + REST + MCP |
| [`clawdrouter/`](./clawdrouter/) | Model + payment gateway — x402, MPP, AP2, A2A, 57 models |
| [`solana-go-main/`](./solana-go-main/) | Solana Go SDK |
| [`src/`](./src/) | Core TypeScript engine — commands, tools, memory, bridge |

### 💳 Payments & gateway

| Project | Description |
|---|---|
| [`x402-openrouter-main/`](./x402-openrouter-main/) | Native x402 facilitator for Solana |
| [`workers/`](./workers/) | Cloudflare edge workers — install worker, x402 proxy |
| [`services/`](./services/) | Backend services — gateway, bridge, monitoring |
| [`websocket-server/`](./websocket-server/) | Real-time streams for agents and trading |
| [`plugin.delivery/`](./plugin.delivery/) | Paid plugin delivery channel |

### 🏪 Skills & marketplace

| Project | Description |
|---|---|
| [`clawdhub/`](./clawdhub/) | Skills registry, vector search, publishing, CLI |
| [`skills/`](./skills/) | 100 bundled `SKILL.md` files across 9 categories |
| [`acp_registry/`](./acp_registry/) | Agent registry JSON (8004 protocol) |

### ⚙️ Runtime & infra

| Project | Description |
|---|---|
| [`openclawd-stack/`](./openclawd-stack/) | OpenShell + E2B + Privy + NemoClawd |
| [`clawd-cloud-os/`](./clawd-cloud-os/) | Browser-terminal cloud OS |
| [`MCP/`](./MCP/) | Model Context Protocol servers |
| [`CLI/`](./CLI/) | `clawd` command-line tools |
| [`packages/`](./packages/) | Shared npm packages — **`@openclawd/wallet`** |

### 🖥️ Surfaces

| Project | Description |
|---|---|
| [`chrome-extension/`](./chrome-extension/) | `clawd-agent`, `page-agent`, `page-controller` |
| [`telegram/`](./telegram/) | Telegram bots — NemoClawd, ClawdBot |
| [`x-bot/`](./x-bot/) | Twitter/X bot |
| [`beepboop/`](./beepboop/) | macOS menu-bar companion (voice + vision + claw overlay) |
| [`WatchApp/`](./WatchApp/) | watchOS wallet-state app |
| [`tailclawd/`](./tailclawd/) | Web Claude Code via Tailscale |
| [`chess/`](./chess/) | Wallet-signed chess hub |
| [`bots/`](./bots/) | Pump.fun sniper + mayhem trader |
| [`moltbook-agent/`](./moltbook-agent/) | Educational agent |

### 📊 Data, knowledge & API

| Project | Description |
|---|---|
| [`llm-wiki-tang/`](./llm-wiki-tang/) | Vector-indexed LLM knowledge base |
| [`articles/`](./articles/) | 43 architecture / payments / model / SEO articles |
| [`API/`](./API/) | BDS + Pump.fun API specs |
| [`gfx/`](./gfx/) | Visualizations / branding |
| [`examples/`](./examples/) | Reference clients (OODA, x402, blockchain) |
| [`npm/`](./npm/) | CLI installers (ClawdBot, SolanaOS) |

---

## 🔧 Configuration — one env contract

All 34 projects consume the same env contract. See [`.env.example`](./.env.example).

```bash
# ── Solana / base URLs ──────────────────────────────
SOLANA_CLAWD_BASE_URL=https://solanaclawd.com
CLAWD_MINT=8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=
HELIUS_RPC_URL=

# ── Model router ────────────────────────────────────
OPENROUTER_API_KEY=
CLAWDROUTER_API_KEY=
CLAWDROUTER_BASE_URL=https://clawdrouter.com
CLAWDROUTER_DEFAULT_REASONING=xai/grok-4.20-beta
CLAWDROUTER_DEFAULT_LONGCTX=moonshot/kimi-k2.6

# ── Direct providers (optional) ─────────────────────
XAI_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
MOONSHOT_API_KEY=

# ── Runtime / infra ─────────────────────────────────
E2B_API_KEY=
PRIVY_APP_ID=
PRIVY_APP_SECRET=
HONCHO_URL=
HONCHO_API_KEY=

# ── Surfaces ────────────────────────────────────────
TELEGRAM_BOT_TOKEN=
TAILSCALE_AUTH_KEY=
```

**Real `.env` files are gitignored — never committed.** Per-subdirectory `.env.example` files live in `openclawd-stack/orchestrator`, `websocket-server`, `x-bot`, `llm-wiki-tang`.

---

## 🔐 Security posture

- 🔒 **No `.env` files tracked in git** — enforced by `**/.env` in [`.gitignore`](./.gitignore). `.npmrc` blocked too.
- 🚫 **Deny-first signing** on every irreversible on-chain action.
- 🏝️ **E2B sandbox isolation** — user API keys never touch your servers.
- 💳 **Payment-gated agents** — wallet connect → on-chain verify → deliver. No hidden auth.
- 📊 **No data collection** — static JSON index, zero tracking.
- 🔍 **Audit & permissions** — see [`articles/permissions-sandboxing.md`](./articles/permissions-sandboxing.md).

---

## 📦 Releasing the CLI

The `solana-clawd` and `@openclawd/wallet` packages are published to npm. Release uses an env-only token flow so nothing secret lands on disk:

```bash
export NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxx   # never commit
./scripts/publish.sh
```

[`scripts/publish.sh`](./scripts/publish.sh) writes an ephemeral `.npmrc` containing `${NPM_TOKEN}`, expands it at read-time, deletes it on exit. Template: [`scripts/.npmrc.example`](./scripts/.npmrc.example).

---

## 📖 43 articles

| Article | Topic |
|---|---|
| [`architecture.md`](./articles/architecture.md) | System architecture |
| [`CLAWD_ROUTER.md`](./articles/CLAWD_ROUTER.md) | ClawdRouter protocol |
| [`MODELS.md`](./articles/MODELS.md) | Model selection + tuning |
| [`ARTICLE_PAYMENTS.md`](./articles/ARTICLE_PAYMENTS.md) | Payment infrastructure |
| [`monetize-agents-openclawd.md`](./articles/monetize-agents-openclawd.md) | Agent monetization |
| [`SOLANA_CLAWD_SHELL.md`](./articles/SOLANA_CLAWD_SHELL.md) | Full-stack integration |
| [`OPENCLAWDarticle.md`](./articles/OPENCLAWDarticle.md) | Cloud Clawd browser terminal |
| [`permissions-sandboxing.md`](./articles/permissions-sandboxing.md) | Security & permissions |
| [**`CLAWD_WALLET_INTEGRATION.md`**](./articles/CLAWD_WALLET_INTEGRATION.md) | **Add embedded Solana wallets to your site** |
| [`x402-proxy-worker.md`](./articles/x402-proxy-worker.md) | x402 edge implementation |
| [`SEO_STRATEGY.md`](./articles/SEO_STRATEGY.md) | SEO for agent ecosystems |
| [`AGENT_GUIDE.md`](./articles/AGENT_GUIDE.md) | Build your first agent |
| [`grok-prompting.md`](./articles/grok-prompting.md) | Grok 4.20 Beta prompting best practices |

**Full index in [`articles/`](./articles/) — 43 articles total.**

---

## 🧭 Quick links

| Resource | URL |
|---|---|
| 🌐 Website | [solanaclawd.com](https://solanaclawd.com) |
| 🏪 Marketplace | [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace) |
| 🔌 REST API | [solanaclawd.com/api](https://solanaclawd.com/api) |
| 💳 x402 gateway | [solanaclawd.com/x402](https://solanaclawd.com/x402) |
| 🗄️ IPFS gateway | [ipfs.solanaclawd.com](https://ipfs.solanaclawd.com) |
| 📦 npm (CLI) | [`solana-clawd`](https://www.npmjs.com/package/solana-clawd) |
| 🦞 npm (Wallet) | [`@openclawd/wallet`](https://www.npmjs.com/package/@openclawd/wallet) |
| 🏪 ClawdHub CLI | `npx clawdhub` |
| 🐙 GitHub | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| 🐦 Twitter/X | [@clawddevs](https://x.com/clawddevs) |
| 💬 Telegram | [t.me/clawdtoken](https://t.me/clawdtoken) |
| 🪙 $CLAWD token | [`8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`](https://solscan.io/token/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump) |

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup, coding standards, PR process, and `SKILL.md` creation guidelines.

**Want to ship a skill?** `npx clawdhub publish ./my-skill --slug my-skill` — it'll be live on the marketplace in under a minute.

**Want to add an agent?** Drop a directory into [`agents/`](./agents/) with an `agent.json` and a `SKILL.md`. The catalog rebuilds automatically.

**Security issues** — please open a private advisory on GitHub.

---

## 📜 License

MIT. See [`LICENSE.md`](./LICENSE.md) and per-project LICENSE files.

---

<div align="center">

### 🦞 Open source · Open format · Open future.

**$CLAWD** · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

Built with ❤️ by [8BIT Labs](https://8bit.io) · Powered by [xAI Grok](https://x.ai) · Shipped on [Solana](https://solana.com)

[![Twitter](https://img.shields.io/badge/𝕏-@clawddevs-000000?style=for-the-badge)](https://x.com/clawddevs)
[![Telegram](https://img.shields.io/badge/Telegram-clawdtoken-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/clawdtoken)
[![GitHub](https://img.shields.io/badge/GitHub-openclawd-181717?style=for-the-badge&logo=github)](https://github.com/x402agent/openclawd)

</div>
