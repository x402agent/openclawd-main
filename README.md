<div align="center">

# OpenClawd

**The complete open-source stack for building, deploying, and monetizing AI agents on Solana.**

One router · one settlement layer · one environment contract · 33 projects · 50 agents · 100 skills · 1000+ MCP tools.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE.md)
[![npm](https://img.shields.io/npm/v/solana-clawd?style=flat-square&label=solana-clawd)](https://www.npmjs.com/package/solana-clawd)
[![Solana](https://img.shields.io/badge/Solana-mainnet-14F195?style=flat-square)](https://solana.com)
[![Model Context Protocol](https://img.shields.io/badge/MCP-compatible-9B59B6?style=flat-square)](https://modelcontextprotocol.io)
[![x402](https://img.shields.io/badge/x402-native-F39C12?style=flat-square)](https://solanaclawd.com/x402)

[**⚡ Install**](#-install) · [**Stack**](#-the-openclawd-ecosystem) · [**Router**](#-clawdrouter) · [**Marketplace**](#-clawdhub-marketplace) · [**Docs**](./articles) · [**Website**](https://solanaclawd.com)

</div>

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

The installer is live on Cloudflare Workers — fully self-contained, no repo access required, runs with themed unicode spinners (🦞 claw, scuttle, matrix, heartbeat) in 256-color ANSI. Active short URLs:

| URL | Status |
|---|---|
| `https://solanaclawd-install.x402.workers.dev` | ✅ **Live now** — canonical |
| `https://install.solanaclawd.com` | ⏳ Activates when CF Bot Fight Mode is disabled (dashboard → Security → Bots → Off) |
| `https://solanaclawd.com/install.sh` | ⏳ Activates when `solanaclawd.com` apex DNS moves to orange-cloud |

### What the installer does

1. **Preflight** — verifies `node ≥ 18`, `git`, `npm`
2. **Installs** `solana-clawd` CLI globally from npm
3. **Scaffolds** `~/.openclawd/.env` with Solana + model defaults (never overwrites)
4. **Prints** pair / mint / status next steps

### Prefer the CLI only?

```bash
npm i -g solana-clawd
solana-clawd pair <CODE>   # pair this device
solana-clawd mint          # mint your agent NFT (Metaplex Core)
solana-clawd status        # show pairing + wallet
```

---

## 🌐 solanaclawd.com

**solanaclawd.com** is the production deployment of this monorepo — the canonical API surface for every openclawd user. It hosts:

| Endpoint | Description |
|---|---|
| `solanaclawd.com` | Landing page + agent discovery |
| `solanaclawd.com/api` | REST API for skills, agents, registry |
| `solanaclawd.com/x402` | x402 / MPP / AP2 / A2A payment gateway |
| `solanaclawd.com/marketplace` | ClawdHub skills marketplace |
| `ipfs.solanaclawd.com` | IPFS gateway |

---

## 🤖 ClawdRouter

**The only model entry point.** Scores every request across 15 dimensions (complexity, context-length, tool-use, vision, Solana-awareness, latency, price, etc.) and routes to the best model.

**Key features:**
- Drop-in replacement for OpenRouter — better scoring, cheaper, Solana-native
- 57 models across 4 tiers × 3 quality bands (Eco / Auto / Premium)
- Native x402 payment gateway — pay per call in SPL USDC or $CLAWD
- $CLAWD holder discounts: 10% (≥100k), 25% (≥1M), 50% (≥10M)
- Upstream: OpenRouter, Grok, Anthropic, OpenAI, Kimi — unified through ClawdRouter

**Grok 4.20 Beta** (`xai/grok-4.20-beta`) — 256K context, reasoning-tier default, Solana-aware, vision, agentic. Aliases: `grok`, `grok-4.20`, `grok-beta`.

**Kimi K2.6** (`moonshot/kimi-k2.6`) — 320K context, long-context agentic tool-use + code/audit. Aliases: `kimi`, `kimi-k2`, `kimi-k2.6`.

**Model tiers:**

| Tier | Eco | Auto | Premium |
|------|-----|------|---------|
| `SIMPLE` | `nvidia/gpt-oss-120b` *(free)* | `google/gemini-2.5-flash` | `nvidia/kimi-k2.5` |
| `MEDIUM` | `google/gemini-2.5-flash-lite` | `nvidia/kimi-k2.5` | `openai/gpt-5.3-codex` |
| `COMPLEX` | `google/gemini-2.5-flash-lite` | `google/gemini-3.1-pro` | `anthropic/claude-opus-4.6` |
| `REASONING` | `xai/grok-4-1-fast` | **`xai/grok-4.20-beta`** | `anthropic/claude-sonnet-4.6` |

**Endpoints:**
```bash
curl https://solanaclawd.com/x402/facilitator/supported | jq
curl -X POST https://solanaclawd.com/x402/facilitator/verify  -H 'content-type: application/json' -d '{"payment":"<id>"}'
curl -X POST https://solanaclawd.com/x402/facilitator/settle  -H 'content-type: application/json' -d '{"tx":"<sig>"}'
```

Source: [`clawdrouter/`](./clawdrouter/) · Config: `CLAWDROUTER_BASE_URL`, `CLAWDROUTER_DEFAULT_REASONING`, `CLAWDROUTER_DEFAULT_LONGCTX`

---

## 🏪 ClawdHub — Skills Marketplace

The agent upgrade system. 100 bundled `SKILL.md` files across 9 categories, searchable via vector index.

```bash
npx clawdhub install pumpfun-trading solana-clawd swarm-orchestrator
npx clawdhub search "solana rug"
npx clawdhub featured
npx clawdhub publish ./my-skill --slug my-skill
```

| Category | Count | Highlights |
|---|---|---|
| Clawd Ecosystem | 7 | `clawdhub`, `openclawd-codeskill`, `skill-creator` |
| Pump.fun | 26 | `pumpfun-launcher`, `pumpfun-trading`, `pumpfun-analytics` |
| Solana / Blockchain | 8 | `solana-clawd`, `solana-dev`, `metaplex` |
| AI / Agents | 8 | `swarm-orchestrator`, `coding-agent`, `cua` |
| Productivity | 15 | `browse`, `notion`, `obsidian`, `trello` |
| Media | 10 | `canvas`, `camsnap`, `video-frames`, `spotify-player` |
| DevOps | 5 | `gateway-node-ops`, `e2b`, `tmux` |
| Communication | 8 | `discord`, `slack`, `wacli`, `imsg` |
| System / IoT | 7 | `eightctl`, `openhue`, `sonoscli` |

```bash
curl https://solanaclawd.com/api/skills | jq
curl "https://solanaclawd.com/api/skills/search?q=solana" | jq
curl -s https://solanaclawd.com/api/skills/pumpfun-trading/download -o SKILL.md
```

Source: [`clawdhub/`](./clawdhub/) · Skills: [`skills/`](./skills/)

---

## 💳 Payments — x402, MPP, AP2, A2A

Four payment protocols, one settlement layer (Solana), denominated in SPL USDC + $CLAWD.

| Protocol | Role |
|---|---|
| **x402** | HTTP 402 native on Solana (Ed25519 + SPL Token) |
| **MPP** | Stripe / Tempo Machine Payments Protocol |
| **AP2** | Google Agent Payments Protocol v2 |
| **A2A** | Google Agent-to-Agent, payment-wrapped |

**Revenue split** on every paid call:

| Recipient | Share | Mechanism |
|---|---|---|
| Agent owner | **70%** | Direct SPL transfer |
| $CLAWD buyback & burn | 15% | Jupiter swap USDC → $CLAWD → burn |
| ClawdRouter treasury | 10% | Squads multisig |
| Operator (facilitator) | 5% | Automatic payout |

**Token:** $CLAWD on Solana — `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

Source: [`x402-openrouter-main/`](./x402-openrouter-main/)

---

## 📦 solana-clawd — Go + TypeScript Agent Framework

Open-source Solana AI agent framework powered by xAI Grok.

**Core:**
- OODA loop trading agent (MawdBot) for Pump.fun and Solana spot
- 31+ MCP tools: market data, Jupiter DEX, Jupiter Limit Order, Solana Pay, Tensor, ZKLogin, Helius RPC,Privy wallet management, E2B sandbox exec
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

Source: [`solana-clawd/`](./solana-clawd/) · Go SDK: [`solana-go-main/`](./solana-go-main/)

---

## 🤖 50 Production Agents

Every agent is a `SKILL.md` bundle + an MCP server + a REST endpoint + an optional Metaplex Core NFT.

| Category | Count | Examples |
|---|---|---|
| DeFi | 12 | Yield aggregator, liquidity strategist, protocol comparator |
| Trading | 6 | Jupiter router, pump screener, DEX optimizer |
| Analytics | 11 | Portfolio tracker, whale watcher, risk monitor |
| Security | 8 | Rug screener, MEV advisor, wallet security |
| Education | 6 | Staking calculator, onboarding guide, L2 comparison |
| Dev tools | 3 | Priority-fee expert, SDK documentation |
| Governance | 2 | Proposal analyst, governance guide |
| NFT | 2 | MPL Core launcher, liquidity advisor |

**Agent capabilities:** OODA loop framework · 31 MCP tools · on-chain execution · Privy agentic wallets · x402 payment-gated · $CLAWD holder-discounted.

Source: [`agents/`](./agents/) · MCP: [`MCP/`](./MCP/) · Agent registry: [`acp_registry/`](./acp_registry/)

---

## 🌫️ Cloud Clawd (openclawd-stack)

Browser-based Solana trading terminal — E2B-isolated Ubuntu sandbox, `solana-clawd` pre-installed, wired to a Privy agentic wallet.

```
User click → E2B spawns Ubuntu 24.04 → WebSocket bridge → full CLI in browser
```

User secrets stay inside E2B. Your servers only see the pairing token.

Source: [`openclawd-stack/`](./openclawd-stack/) · Cloud OS: [`clawd-cloud-os/`](./clawd-cloud-os/) · Article: [`articles/OPENCLAWDarticle.md`](./articles/OPENCLAWDarticle.md)

---

## 🧭 Quick links

| Resource | URL |
|---|---|
| Website | [solanaclawd.com](https://solanaclawd.com) |
| Marketplace | [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace) |
| REST API | [solanaclawd.com/api](https://solanaclawd.com/api) |
| x402 gateway | [solanaclawd.com/x402](https://solanaclawd.com/x402) |
| IPFS gateway | [ipfs.solanaclawd.com](https://ipfs.solanaclawd.com) |
| npm (CLI) | [`solana-clawd`](https://www.npmjs.com/package/solana-clawd) |
| ClawdHub CLI | `npx clawdhub` |
| GitHub | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| Twitter/X | [@clawddevs](https://x.com/clawddevs) |
| Telegram | [t.me/clawdtoken](https://t.me/clawdtoken) |
| $CLAWD token | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |

---

## 📁 Monorepo layout (33 projects)

### Core framework

| Project | Description |
|---|---|
| [`solana-clawd/`](./solana-clawd/) | Go + TypeScript agent framework — OODA loop, 31+ MCP tools, xAI Grok |
| [`agents/`](./agents/) | 50 production AI agents — Metaplex Core + REST + MCP |
| [`clawdrouter/`](./clawdrouter/) | Model + payment gateway — x402, MPP, AP2, A2A, 57 models |
| [`solana-go-main/`](./solana-go-main/) | Solana Go SDK |

### Payments & gateway

| Project | Description |
|---|---|
| [`x402-openrouter-main/`](./x402-openrouter-main/) | Native x402 facilitator for Solana |
| [`workers/`](./workers/) | Cloudflare edge workers — install worker, x402 proxy |
| [`services/`](./services/) | Gateway, bridge, monitoring |
| [`websocket-server/`](./websocket-server/) | Real-time streams |

### Skills & marketplace

| Project | Description |
|---|---|
| [`clawdhub/`](./clawdhub/) | Skills registry, vector search, publishing, CLI |
| [`skills/`](./skills/) | 100 bundled `SKILL.md` files |
| [`plugin.delivery/`](./plugin.delivery/) | Paid plugin delivery |
| [`acp_registry/`](./acp_registry/) | Agent registry JSON |

### Runtime & infra

| Project | Description |
|---|---|
| [`openclawd-stack/`](./openclawd-stack/) | OpenShell + E2B + Privy + NemoClawd |
| [`MCP/`](./MCP/) | Model Context Protocol servers |
| [`src/`](./src/) | Core TypeScript engine |
| [`CLI/`](./CLI/) | `clawd` command-line |
| [`packages/`](./packages/) | Shared npm packages |

### Surfaces

| Project | Description |
|---|---|
| [`chrome-extension/`](./chrome-extension/) | `clawd-agent`, `page-agent`, `page-controller` |
| [`telegram/`](./telegram/) | Telegram bots — NemoClawd, ClawdBot |
| [`x-bot/`](./x-bot/) | Twitter/X bot |
| [`beepboop/`](./beepboop/) | macOS menu-bar companion |
| [`WatchApp/`](./WatchApp/) | watchOS wallet-state app |
| [`tailclawd/`](./tailclawd/) | Web Claude Code via Tailscale |
| [`chess/`](./chess/) | Wallet-signed chess hub |
| [`bots/`](./bots/) | Pump.fun sniper + mayhem trader |
| [`moltbook-agent/`](./moltbook-agent/) | Educational agent |

### Data, knowledge & API

| Project | Description |
|---|---|
| [`llm-wiki-tang/`](./llm-wiki-tang/) | Vector-indexed LLM knowledge base |
| [`articles/`](./articles/) | 42 architecture / payments / model / SEO articles |
| [`API/`](./API/) | BDS + Pump.fun API specs |
| [`gfx/`](./gfx/) | Visualizations / branding |
| [`examples/`](./examples/) | Reference clients (OODA, x402, blockchain) |
| [`npm/`](./npm/) | CLI installers (ClawdBot, SolanaOS) |
| [`clawd-cloud-os/`](./clawd-cloud-os/) | Browser-terminal cloud OS |

---

## 🔧 Configuration — one env contract

All 33 projects consume the same env contract. See [`.env.example`](./.env.example).

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

# ── Runtime / infra ────────────────────────────────
E2B_API_KEY=
PRIVY_APP_ID=
PRIVY_APP_SECRET=
HONCHO_URL=
HONCHO_API_KEY=

# ── Surfaces ────────────────────────────────────────
TELEGRAM_BOT_TOKEN=
TAILSCALE_AUTH_KEY=
```

Per-subdirectory `.env.example` files for `openclawd-stack/orchestrator`, `websocket-server`, `x-bot`, `llm-wiki-tang`. **Real `.env` files are gitignored — never committed.**

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
│  plugin.delivery · services · websocket-server                 │
└────────────────────────────┬───────────────────────────────────┘
                             │ routed model calls + x402 settle
┌────────────────────────────▼───────────────────────────────────┐
│  RUNTIME                                                        │
│  src · agents (50) · MCP (31 tools) · openclawd-stack           │
│  CLI · clawd-cloud-os · solana-clawd · solana-go-main           │
└────────────────────────────┬───────────────────────────────────┘
                             │ SKILL.md · agent.json · acp_registry
┌────────────────────────────▼───────────────────────────────────┐
│  SKILLS + REGISTRY                                              │
│  clawdhub · skills (100) · acp_registry · articles              │
│  llm-wiki-tang                                                  │
└────────────────────────────┬───────────────────────────────────┘
                             │ signed SPL txns
┌────────────────────────────▼───────────────────────────────────┐
│  CHAIN                                                          │
│  Solana mainnet (USDC + $CLAWD) · Helius RPC · Jupiter          │
└────────────────────────────────────────────────────────────────┘
```

Full diagram, per-layer directory mapping, request flow, and config reference in [**STACK.md**](./STACK.md).

---

## 🔐 Security posture

- **No `.env` files tracked in git** — enforced by `**/.env` in [`.gitignore`](./.gitignore). `.npmrc` blocked too.
- **Deny-first signing** on every irreversible on-chain action.
- **E2B sandbox isolation** — user API keys never touch your servers.
- **Payment-gated agents** — wallet connect → on-chain verify → deliver. No hidden auth.
- **No data collection** — static JSON index, zero tracking.
- **Audit & permissions** — see [`articles/permissions-sandboxing.md`](./articles/permissions-sandboxing.md).

---

## 📦 Releasing the CLI

The `solana-clawd` package is published to npm. Release uses an env-only token flow so nothing secret lands on disk:

```bash
export NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxx   # never commit
./scripts/publish.sh
```

Under the hood, [`scripts/publish.sh`](./scripts/publish.sh) writes an ephemeral `.npmrc` containing `${NPM_TOKEN}`, expands it at read-time, deletes it on exit. Template: [`scripts/.npmrc.example`](./scripts/.npmrc.example).

---

## 📖 42 articles

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
| [`x402-proxy-worker.md`](./articles/x402-proxy-worker.md) | x402 edge implementation |
| [`SEO_STRATEGY.md`](./articles/SEO_STRATEGY.md) | SEO for agent ecosystems |

Full index in [`articles/`](./articles/).

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup, coding standards, PR process, and `SKILL.md` creation guidelines. Security issues — please open a private advisory on GitHub.

---

## 📜 License

MIT. See [`LICENSE.md`](./LICENSE.md) and per-project LICENSE files.

---

<div align="center">

**Open source · Open format · Open future.**

Built with ❤️ by [8BIT Labs](https://8bit.io) · Powered by [xAI Grok](https://x.ai) · Shipped on [Solana](https://solana.com)

</div>