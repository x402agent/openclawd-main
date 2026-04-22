# 🦞 OpenClawd

> **"The Hermes of Web3" — inspired by [Nous Research](https://nousresearch.com)'s Hermes agent philosophy.**

OpenClawd is the open-source, autonomous AI agent system for Solana. Like Hermes — the fleet-footed messenger of the gods — it moves fast, connects everything, and delivers results. Built on the conviction that AI agents should be composable, monetizable, and chain-native from the ground up.

---

<div align="center">

<img src="https://raw.githubusercontent.com/x402agent/openclawd/main/gfx/lobster.svg" alt="OpenClawd" width="140" onerror="this.style.display='none'">

**One router · one settlement layer · one environment contract**

`30+ packages, apps, and services` · `50-agent catalog` · `90+ bundled skills` · `4 payment protocols` · `57 router models`

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

[**Install**](#install) · [**Architecture**](#architecture) · [**Orchestrator**](#openclawd-orchestrator) · [**Router**](#clawdrouter) · [**Wurk x402**](#wurk-x402-integration) · [**npm Packages**](#npm-packages) · [**Stack Map**](./STACK.md) · [**Docs**](./articles) · [**Website**](https://solanaclawd.com)

</div>

---

## 🔗 Quick Links

| Service | URL |
|---------|-----|
| 🌐 **Website** | [solanaclawd.com](https://solanaclawd.com) |
| 🕶️ **Cloud OS** | [cloud.solanaclawd.com](https://cloud.solanaclawd.com) |
| 🔐 **Vault** | [vault.solanaclawd.com](https://vault.solanaclawd.com) |
| 💰 **SolanaOS** | [solanaos.net](https://solanaos.net) |
| 🐦 **Twitter** | [x.com/clawddevs](https://x.com/clawddevs) |
| 💬 **Telegram** | [t.me/clawdtoken](https://t.me/clawdtoken) |
| 📦 **solana-clawd** | [npm](https://www.npmjs.com/package/solana-clawd) · [GitHub](https://github.com/x402agent/solana-clawd) |
| 🖥️ **SolanaOS** | [GitHub](https://github.com/x402agent/solanaos) |

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

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [ONBOARDING.md](./ONBOARDING.md) | **Start here!** Contributor setup & workflow |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [STACK.md](./STACK.md) | Technical architecture |
| [articles/](./articles/) | Deep-dive documentation |
| [AGENTS/README.md](./AGENTS/README.md) | Agent development |
| [skills/README.md](./skills/README.md) | Skill development |

---

## 🧠 OpenClawd Orchestrator

The heart of the stack: **`openclawd-stack/orchestrator/`** — a single Hono server that ties everything together.

### What it runs

```text
┌─────────────────────────────────────────────────────────────────┐
│                    OpenClawd Orchestrator                       │
│                     Port 8787 · Hono server                     │
├─────────────────────────────────────────────────────────────────┤
│  Honcho Brain        → memory, peer.chat, session context       │
│  E2B Sandbox         → per-user isolated agent sandboxes        │
│  Privy Wallet        → embedded wallet, balance, transfer        │
│  Solana MCP           → child process per user, JSON-RPC stdio  │
│  Payments Client      → ClawdVault registry, AP2 mandates        │
│  Wurk x402 Bridge     → social campaigns, agent-to-human jobs     │
└─────────────────────────────────────────────────────────────────┘
```

### API routes

| Route | Description |
|-------|-------------|
| `GET /healthz` | Server liveness |
| `GET /api/v1/me` | Auth info (Privy JWT) |
| `GET /api/v1/agents` | Agent catalog |
| `POST /api/v1/launch` | Launch agent (Honcho + E2B) |
| `POST /api/v1/pause` | Stop agent sandbox |
| `GET /api/v1/wallet` | List Privy wallets |
| `POST /api/v1/wallet/create` | Create embedded wallet |
| `POST /api/v1/wallet/transfer` | Transfer SOL/USDC |
| `GET /api/v1/mcp/tools` | List MCP tools |
| `POST /api/v1/mcp/call` | Call MCP tool |
| `GET /api/v1/projects` | Honcho projects |
| `POST /api/v1/brain/ask` | Ask the Honcho brain |
| `GET /api/v1/brain/context/:agent` | Load agent context |
| `POST /api/v1/mandates/mint` | Mint AP2 payment mandate |
| `GET /api/v1/earnings` | Pending earnings (USDC) |
| `GET /api/v1/wurk/services` | Wurk service catalog |
| `POST /api/v1/wurk/quick` | Create quick x402 job |
| `POST /api/v1/wurk/agent-to-human` | Hire humans for tasks |
| `GET /api/v1/wurk/submissions` | Retrieve job submissions |
| `POST /webhook/` | Honcho event webhook |
| `POST /webhook/chat` | Honcho chat turn webhook |

### Environment variables

```bash
# Orchestrator core
ORCHESTRATOR_PORT=8787
ORCHESTRATOR_CORS_ORIGINS=https://solanaclawd.com,https://www.solanaclawd.com,http://localhost:5173

# Privy embedded wallet
PRIVY_APP_ID=
PRIVY_APP_SECRET=
PRIVY_JWKS_ENDPOINT=https://auth.privy.io/api/v1/apps/{app_id}/jwks.json
PRIVY_AUTH_PRIVATE_KEY=wallet-auth:...

# Honcho brain + memory
HONCHO_API_KEY=
HONCHO_WORKSPACE_ID=pumpfun
HONCHO_WEBHOOK_SECRET=
HONCHO_WEBHOOKSECRET2=

# E2B sandbox runtime
E2B_API_KEY=

# Solana Clawd MCP
HELIUS_RPC=
HELIUS_API_KEY=
XAI_API_KEY=

# Wurk.fun x402 (optional — quick jobs work without key)
WURK_API_KEY=
```

### Dev mode

```bash
cd openclawd-stack
pnpm dev:orchestrator
# Server boots on :8787, hot-reloads on file changes
```

---

## 📦 NPM Packages

| Package | npm | Description |
|---------|-----|-------------|
| [`solana-clawd`](https://www.npmjs.com/package/solana-clawd) | `npm i -g solana-clawd` | Go + TypeScript agent framework, OODA loop trading, 31 MCP tools |
| [`@openclawd/wallet`](https://www.npmjs.com/package/@openclawd/wallet) | `npm i @openclawd/wallet` | Privy-powered embedded Solana wallet with deny-first controls |
| [`@mawdbotsonsolana/nemoclaw`](https://www.npmjs.com/package/nemoclaw) | `npm i -g @mawdbotsonsolana/nemoclaw` | xAI Grok-powered Solana trading engine with blockchain buddies |
| `clawdhub` | `npx clawdhub publish` | Skills marketplace CLI (publish, install, search SKILL.md bundles) |

### Solana Clawd Runtime Shell

Integration of solana-clawd, nemoClawd, and agentic wallet for a unified Solana AI agent runtime with OODA trading loop:

```
OBSERVE  → sol_price, trending, helius_priority_fee, memory KNOWN
ORIENT   → score candidates (trend + momentum + liquidity)
DECIDE   → confidence ≥ 60? → size band (0.5x / 1.0x / 1.25x / 1.5x)
ACT      → trade_execute gated at `ask` permission (human approval required)
LEARN    → write INFERRED signals → Dream agent promotes to LEARNED
```

### 31 MCP Tools

**Solana Market Data:** `solana_price`, `solana_trending`, `solana_token_info`, `solana_wallet_pnl`, `solana_search`, `solana_top_traders`, `solana_wallet_tokens`

**Helius Onchain:** `helius_account_info`, `helius_balance`, `helius_transactions`, `helius_priority_fee`, `helius_das_asset`, `helius_webhook_create`

**Trading (Pump.fun):** `pump_token_scan`, `pump_buy_quote`, `pump_sell_quote`, `pump_graduation`

**Memory:** `memory_recall`, `memory_write`

**Agent Fleet:** `agent_spawn`, `agent_list`, `agent_stop`

**Metaplex:** `metaplex_mint_agent`, `metaplex_register_identity`, `metaplex_read_agent`

---

## Why OpenClawd exists

Most AI agent stacks are stitched together from separate services:

- an LLM gateway
- wallet custody or signing glue
- payment verification
- an MCP/tool runtime
- a skills registry
- sandboxed execution
- a frontend or bot surface
- a memory/brain system

OpenClawd keeps those pieces in one place, inspired by the Hermes philosophy — agents that move fast, connect everything, and settle autonomously:

- **OpenClawd Orchestrator** for brain (Honcho), sandbox (E2B), wallet (Privy), and payment (AP2/x402) in one server
- **ClawdRouter** for model selection and payment-aware routing
- **`@openclawd/wallet`** for embedded Solana wallet flows with deny-first controls
- **`solana-clawd`** for agent runtime, OODA loops, and Solana tooling
- **ClawdHub** for searchable `SKILL.md` bundles
- **Wurk.fun** for social campaigns and agent-to-human microjobs via x402
- **x402 / MPP / AP2 / A2A** for payment-gated calls on Solana
- **TailClawd and cloud surfaces** for browser and bot access

---

## Install

The installer source of truth lives in [install.sh](./install.sh). Hosted mirrors may move; the checked-in script is authoritative.

### One-line install

```bash
curl -fsSL https://solanaclawd.com/install.sh | bash
```

### Run the local script directly

```bash
bash ./install.sh
```

### What the installer does

1. Verifies `curl`, `git`, `node >= 18`, and `npm`.
2. Optionally installs Tailscale and prompts for `tailscale up`.
3. Installs `solana-clawd` globally from npm.
4. Creates `~/.openclawd`, shallow-clones the repo there, and links `tailclawd/`.
5. Installs `tailclawd` dependencies.
6. Scaffolds `~/.openclawd/.env` without overwriting an existing file.
7. Optionally exposes TailClawd with `tailscale serve`.

### Installer overrides

`OPENCLAWD_DIR`, `TAILCLAWD_DIR`, `OPENCLAWD_REPO`, `SKIP_TAILSCALE=1`, `SKIP_TAILCLAWD=1`, `AUTO_SERVE=1`, `TAILCLAWD_TOKEN`

### CLI only

```bash
npm i -g solana-clawd
solana-clawd pair <CODE>
solana-clawd mint
solana-clawd status
solana-clawd agent
```

### TailClawd

[`tailclawd/`](./tailclawd/) exposes Clawd Code in the browser, designed to sit behind Tailscale Serve or Funnel.

```bash
cd ~/.openclawd/tailclawd
npm run dev
tailscale serve --bg --https=443 http://127.0.0.1:3110
```

Set `TAILCLAWD_TOKEN` in `~/.openclawd/.env` if you want bearer-token protection on requests.

---

## Core layers

### OpenClawd Orchestrator

The unified server tying brain, sandbox, wallet, and payments together.

- **`honcho.ts`** — Honcho SDK client for memory, peer.chat, and session context
- **`sandbox-manager.ts`** — E2B sandbox lifecycle (launch/pause per user)
- **`wallet-bridge.ts`** — Privy REST API for embedded wallet operations
- **`mcp-bridge.ts`** — Solana Clawd MCP child processes per user (JSON-RPC over stdio)
- **`payments.ts`** — ClawdVault registry + AP2 mandates + Pinata manifest pinning
- **`wurk-bridge.ts`** — Wurk.fun x402 client (social jobs + agent-to-human)
- **`webhooks.ts`** — Honcho webhook handlers (events + chat turns)
- **`routes.ts`** — All HTTP routes under `/api/v1/*` (Privy JWT protected)

### ClawdRouter

[`clawdrouter/`](./clawdrouter/) is the single model-routing layer for the stack.

- 57 models in the local registry
- 15-dimension scorer
- one entry point for routing, pricing, and provider selection
- payment-aware flow for Solana-native agent calls

See [articles/CLAWD_ROUTER.md](./articles/CLAWD_ROUTER.md).

### ClawdHub

[`clawdhub/`](./clawdhub/) and [`skills/`](./skills/) provide the skill registry and bundled `SKILL.md` library.

- installable skills
- vector-searchable marketplace
- publish and download flow
- local and hosted APIs

See [articles/ARTICLE_SKILLS.md](./articles/ARTICLE_SKILLS.md) and [skills/README.md](./skills/README.md).

### solana-clawd

[`solana-clawd/`](./solana-clawd/) is the agent framework and runtime spine.

- Solana-focused CLI
- MCP-first tool runtime (31 tools)
- OODA-loop agent flows
- Go plus TypeScript bridge

See [articles/solana-clawd-go.md](./articles/solana-clawd-go.md).

### Payments

[`x402-openrouter-main/`](./x402-openrouter-main/), [`workers/`](./workers/), and [`services/`](./services/) cover payment and gateway plumbing.

- `x402` — Solana-native payment protocol
- `MPP` — Multi-protocol payments
- `AP2` — Agent-to-agent payment intents
- `A2A` — Agent-to-agent messaging with payment

The settlement layer is Solana, with SPL USDC and `$CLAWD` as the core billing assets.

See [articles/ARTICLE_PAYMENTS.md](./articles/ARTICLE_PAYMENTS.md).

### Wurk x402 Integration

Social campaigns and agent-to-human microjobs powered by Wurk.fun's x402 protocol.

**Quick social jobs** (no API key needed):
```bash
# 1. Call endpoint — returns 402 with payment info
curl -X POST http://localhost:8787/api/v1/wurk/quick \
  -H "Content-Type: application/json" \
  -d '{"network":"solana","jobType":"xlikes","url":"https://x.com/user/status/123"}'

# 2. Retry with PAYMENT-SIGNATURE header (on-chain USDC proof)
curl -X POST http://localhost:8787/api/v1/wurk/quick \
  -H "Content-Type: application/json" \
  -H "PAYMENT-SIGNATURE: <base64-encoded-payment-proof>" \
  -d '{"network":"solana","jobType":"xlikes","url":"https://x.com/user/status/123"}'
```

**Available job types**: `xlikes`, `reposts`, `comments`, `xfollowers`, `xraid`, `bookmarks`, `dex`, `pfcomments`, `tgmembers`, `dcmembers`, `instalikes`, `instafollowers`, `ytlikes`, `ytsubs`, `basefollowers`, `baselikes`, `basereposts`

**Agent-to-human jobs** (hire real humans):
```bash
# Create a microjob to hire humans for feedback
curl -X POST http://localhost:8787/api/v1/wurk/agent-to-human \
  -H "Content-Type: application/json" \
  -d '{"network":"solana","amount":"0.001","description":"Check if this website is accessible"}'

# Retrieve submissions
curl "http://localhost:8787/api/v1/wurk/submissions?secret=<secret>&network=solana"
```

See [`skills/wurk-integration/`](./skills/wurk-integration/) and [`MCP/wurk-mcp/`](./MCP/wurk-mcp/).

### API Registrar

[`api-registrar/`](./api-registrar/) handles X (Twitter) wallet verification and API key generation.

- **Wallet Verification** — Verify Solana wallet ownership via X (Twitter) tweet
- **API Key Generation** — Issue `clawd_sk_` prefixed API keys
- **ClawdRouter Integration** — Keys validated by ClawdRouter for AI agent calls
- **Scope-based Permissions** — Fine-grained access control
- **Secure Storage** — API keys hashed (SHA-256) before storage

```bash
# Start the API Registrar server
cd api-registrar
pnpm install
pnpm db:push  # Run migrations
pnpm server   # Start on port 3001
```

See [api-registrar/README.md](./api-registrar/README.md).

### ClawdVault (Security)

[`clawd-vault-master/`](./clawd-vault-master/) provides security scanning for skills and agents, policy enforcement, and vault certification — the backbone of OpenClawd's deny-first security model.

- **Risk Scanning** — Detect vulnerabilities in SKILL.md bundles
- **Hardening** — Apply security best practices
- **Policy Enforcement** — Validate against security policies
- **Vault Certification** — Score-based approval system

```bash
# Scan a skill for security issues
cd clawd-vault-master
pip install -e .
python -m clawd_vault scan ../../skills/my-skill
```

See [`clawd-vault-master/`](./clawd-vault-master/).

### ClawdCloudOS

[`clawd-cloud-os/`](./clawd-cloud-os/) — browser-terminal cloud OS surface at **[cloud.solanaclawd.com](https://cloud.solanaclawd.com)**

### Cloud and browser surfaces

[`openclawd-stack/`](./openclawd-stack/), [`clawd-cloud-os/`](./clawd-cloud-os/), and [`tailclawd/`](./tailclawd/) cover browser-hosted and remote-access flows. Frontend and user-facing surfaces also include [`chrome-extension/`](./chrome-extension/), [`telegram/`](./telegram/), [`WatchApp/`](./WatchApp/), [`beepboop/`](./beepboop/), [`chess/`](./chess/), and [`moltbook-agent/`](./moltbook-agent/).

---

## $CLAWD token

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

### Revenue split

| Recipient | Share | Mechanism |
|---|:---:|---|
| Agent owner | 70% | Direct SPL transfer |
| `$CLAWD` buyback and burn | 15% | USDC -> `$CLAWD` -> burn |
| ClawdRouter treasury | 10% | Treasury allocation |
| Operator | 5% | Facilitator payout |

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────────┐
│ Surfaces                                                         │
│ chrome-extension · telegram · tailclawd · WatchApp               │
│ beepboop · chess · moltbook-agent                               │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP / SSE / WS
┌────────────────────────────▼────────────────────────────────────┐
│ OpenClawd Orchestrator (port 8787)                               │
│ honcho brain · e2b sandbox · privy wallet · solana mcp         │
│ payments client · wurk x402 bridge                              │
└────────────────────────────┬────────────────────────────────────┘
                             │ routed model calls + settlement
┌────────────────────────────▼────────────────────────────────────┐
│ Router and payments                                              │
│ clawdrouter · x402-openrouter-main · workers · services        │
│ plugin.delivery · api-registrar                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │ signed Solana actions
┌────────────────────────────▼────────────────────────────────────┐
│ Runtime                                                          │
│ src · solana-clawd · AGENTS · MCP · packages                    │
│ openclawd-stack · clawd-cloud-os · CLI                          │
└────────────────────────────┬────────────────────────────────────┘
                             │ skills, registry, docs
┌────────────────────────────▼────────────────────────────────────┐
│ Skills and knowledge                                             │
│ clawdhub · skills · acp_registry · articles · llm-wiki-tang    │
└────────────────────────────┬────────────────────────────────────┘
                             │ signed Solana actions
┌────────────────────────────▼────────────────────────────────────┐
│ Chain                                                            │
│ Solana · Helius RPC · Jupiter · SPL USDC · $CLAWD              │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ 🛡️ Security: ClawdVault (clawd-vault-master)                    │
│ policy engine · skill scanning · vault certification             │
│ ─────────────────────────────────────────────────────────────── │
│ 💰 Monetization: WURK.fun x402                                   │
│ social campaigns · agent-to-human jobs · multi-chain settlement  │
└─────────────────────────────────────────────────────────────────┘
```

For the full layer map, request flow, and directory breakdown, read [STACK.md](./STACK.md).

---

## Monorepo map

| Area | Directories |
|---|---|
| **Orchestrator** | [`openclawd-stack/orchestrator/`](./openclawd-stack/orchestrator/) — honcho, e2b, privy, mcp, payments, wurk x402 |
| **Core Runtime** | [`solana-clawd/`](./solana-clawd/), [`AGENTS/`](./AGENTS/), [`src/`](./src/), [`MCP/`](./MCP/), [`packages/`](./packages/) |
| **Router & Payments** | [`clawdrouter/`](./clawdrouter/), [`x402-openrouter-main/`](./x402-openrouter-main/), [`workers/`](./workers/), [`services/`](./services/), [`plugin.delivery/`](./plugin.delivery/) |
| **Surfaces** | [`chrome-extension/`](./chrome-extension/), [`telegram/`](./telegram/), [`tailclawd/`](./tailclawd/), [`WatchApp/`](./WatchApp/), [`beepboop/`](./beepboop/), [`chess/`](./chess/), [`moltbook-agent/`](./moltbook-agent/) |
| **Cloud & Orchestration** | [`openclawd-stack/`](./openclawd-stack/) · [`clawd-cloud-os/`](./clawd-cloud-os/) · [`CLI/`](./CLI/) |
| **Cloud Bridge** | [`openclawd-stack/bridge/`](./openclawd-stack/bridge/) — WS terminal bridge connecting to orchestrator |
| **Skills & Knowledge** | [`clawdhub/`](./clawdhub/), [`skills/`](./skills/), [`acp_registry/`](./acp_registry/), [`articles/`](./articles/), [`llm-wiki-tang/`](./llm-wiki-tang/), [`docs/`](./docs/) |
| **Security (ClawdVault)** | [`clawd-vault-master/`](./clawd-vault-master/) — policy engine, skill scanning, vault certification |
| **API Registrar** | [`api-registrar/`](./api-registrar/) — X-verified API key registration with Solana wallet auth |
| **Monetization (WURK)** | [`skills/wurk-integration/`](./skills/wurk-integration/), [`MCP/wurk-mcp/`](./MCP/wurk-mcp/) — x402 job monetization on Solana/Base |
| **Protocols** | [`x402-openrouter-main/`](./x402-openrouter-main/) — x402 payment protocol implementation |
| **Scripts & CI** | [`scripts/`](./scripts/), [`NPM/`](./NPM/) — automation and package publishing |

`tailclawd-backup/` exists as a backup directory and is not part of the primary stack path.

---

## Configuration

The shared environment contract lives in [`.env.example`](./.env.example).

Typical minimum variables:

- `OPENROUTER_API_KEY`
- `CLAWDROUTER_BASE_URL`
- `XAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MOONSHOT_API_KEY` as needed
- `E2B_API_KEY`
- `PRIVY_APP_ID`, `PRIVY_APP_SECRET`, `PRIVY_JWKS_ENDPOINT`, `PRIVY_AUTH_PRIVATE_KEY`
- `HELIUS_API_KEY` or `HELIUS_RPC_URL`
- `SOLANA_RPC_URL`
- `TELEGRAM_BOT_TOKEN` or `TAILSCALE_AUTH_KEY` for specific surfaces
- `HONCHO_API_KEY`, `HONCHO_WORKSPACE_ID` for agent brain/memory
- `WURK_API_KEY` for agent monetization via Wurk.fun x402 (optional — quick jobs work without key)

Per-project example env files also exist in:

- [`openclawd-stack/.env.example`](./openclawd-stack/.env.example)
- [`openclawd-stack/orchestrator/.env.example`](./openclawd-stack/orchestrator/.env.example)
- [`openclawd-stack/bridge/.env.example`](./openclawd-stack/bridge/.env.example)
- [`llm-wiki-tang/.env.example`](./llm-wiki-tang/.env.example)
- [`clawd-cloud-os/.env.example`](./clawd-cloud-os/.env.example)

---

## Security posture

- No real `.env` files are tracked in git.
- The root [`.gitignore`](./.gitignore) blocks common secret locations and `.npmrc`.
- Signing flows are deny-first by design.
- Sandbox-oriented components isolate user-controlled execution.
- Hosted endpoints are examples, not mandatory infrastructure.
- ClawdVault enforces policy checks on all skills before they enter the registry.

Read [SECURITY.md](./SECURITY.md) and [articles/permissions-sandboxing.md](./articles/permissions-sandboxing.md).

---

## Documentation

Start with these:

- [STACK.md](./STACK.md)
- [articles/architecture.md](./articles/architecture.md)
- [articles/MODELS.md](./articles/MODELS.md)
- [articles/ARTICLE_PAYMENTS.md](./articles/ARTICLE_PAYMENTS.md)
- [articles/AGENT_GUIDE.md](./articles/AGENT_GUIDE.md)
- [tailclawd/README.md](./tailclawd/README.md)
- [articles/README.md](./articles/README.md)

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