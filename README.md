<div align="center">

# OpenClawd

**The complete open-source stack for building, deploying, and monetizing AI agents on Solana.**

One router · one settlement layer · one environment contract · 33 projects, 50 agents, 100 skills.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](./LICENSE.md)
[![npm](https://img.shields.io/npm/v/solana-clawd?style=flat-square&label=solana-clawd)](https://www.npmjs.com/package/solana-clawd)
[![Solana](https://img.shields.io/badge/Solana-mainnet-14F195?style=flat-square)](https://solana.com)
[![Model Context Protocol](https://img.shields.io/badge/MCP-compatible-9B59B6?style=flat-square)](https://modelcontextprotocol.io)
[![x402](https://img.shields.io/badge/x402-native-F39C12?style=flat-square)](https://solanaclawd.com/x402)
[![Stack](https://img.shields.io/badge/STACK.md-read-111?style=flat-square)](./STACK.md)

[**Install**](#-install-in-one-line) · [**Stack Map**](./STACK.md) · [**Marketplace**](https://solanaclawd.com/marketplace) · [**Docs**](./articles) · [**Website**](https://solanaclawd.com)

</div>

---

## ⚡ Install in one line

```bash
curl -fsSL https://solanaclawd-install.x402.workers.dev | bash
```

This is live right now on Cloudflare Workers — fully self-contained, no repo access required. The same worker is also wired to `install.solanaclawd.com` and `solanaclawd.com/install.sh` as a Workers Custom Domain + Routes; those short URLs activate the moment Cloudflare Bot Fight Mode is disabled for the zone (Dashboard → Security → Bots → Off) and the Vercel apex DNS is flipped to orange-cloud:

```bash
curl -fsSL https://install.solanaclawd.com | bash       # vanity URL (after BFM off)
curl -fsSL https://solanaclawd.com/install.sh | bash    # apex route (after apex proxied)
```

The installer worker lives at [`workers/install-worker/`](./workers/install-worker) — a single Cloudflare Worker that embeds [`install.sh`](./install.sh) at deploy-time via [`sync.mjs`](./workers/install-worker/sync.mjs) so it works even while this repo is private. Deploy your own fork with:

```bash
cd workers/install-worker && npm install && npm run deploy
```

The installer:

1. Verifies `node ≥ 18`, `git`, `npm`.
2. Installs the **`solana-clawd`** CLI globally from npm.
3. Clones this monorepo to `~/.openclawd`.
4. Scaffolds `.env` from [`.env.example`](./.env.example) with `SOLANA_CLAWD_BASE_URL` pre-filled.

Prefer to manage it yourself? Install just the CLI:

```bash
npm i -g solana-clawd
solana-clawd pair <CODE>     # pair this device
solana-clawd mint            # mint your agent NFT (Metaplex Core)
solana-clawd status          # show current pairing + wallet
```

See [`install.sh`](./install.sh) for the exact steps the curl script runs.

---

## 📚 What is OpenClawd?

OpenClawd is a production monorepo that unifies everything you need to ship an AI agent on Solana:

- A **model router** (ClawdRouter) with 57 models and a 15-dimension scorer that front-runs OpenRouter.
- A **payment layer** (x402, MPP, AP2, A2A) that settles in SPL USDC + $CLAWD on Solana.
- A **runtime** built on Go + TypeScript with an OODA trading loop, 31 MCP tools, Privy-managed wallets, and E2B sandboxes.
- A **skills marketplace** (ClawdHub) for publishing and installing `SKILL.md` bundles.
- **Surfaces everywhere** — Chrome extension, Telegram bot, Twitter/X bot, watchOS app, macOS menubar, browser terminal, and a chess hub.

> **See [`STACK.md`](./STACK.md) for the full architecture map** — how all 33 projects flow through one gateway, one settlement layer, one env contract.

---

## 🧭 Quick links

| Resource | URL |
|---|---|
| Website | [solanaclawd.com](https://solanaclawd.com) |
| Skills marketplace | [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace) |
| REST API | [solanaclawd.com/api](https://solanaclawd.com/api) |
| x402 gateway | [solanaclawd.com/x402](https://solanaclawd.com/x402) |
| IPFS gateway | [ipfs.solanaclawd.com](https://ipfs.solanaclawd.com) |
| npm (CLI) | [`solana-clawd`](https://www.npmjs.com/package/solana-clawd) |
| GitHub | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| Twitter/X | [@clawddevs](https://x.com/clawddevs) |
| Telegram | [t.me/clawdtoken](https://t.me/clawdtoken) |
| $CLAWD token | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  SURFACES                                                            │
│  chrome-extension · beepboop · WatchApp · tailclawd · telegram       │
│  x-bot · chess · moltbook-agent · bots · examples                    │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │ HTTP / SSE / WS
┌────────────────────────────────────▼─────────────────────────────────┐
│  GATEWAY + PAYMENTS                                                  │
│  clawdrouter · x402-openrouter-main · workers (CF edge)              │
│  plugin.delivery · services · websocket-server                       │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │ routed model calls + x402 settle
┌────────────────────────────────────▼─────────────────────────────────┐
│  RUNTIME                                                             │
│  src · agents (50) · MCP · openclawd-stack · CLI · clawd-cloud-os    │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │ SKILL.md · agent.json
┌────────────────────────────────────▼─────────────────────────────────┐
│  SKILLS + REGISTRY                                                   │
│  clawdhub · skills (100) · acp_registry · articles · llm-wiki-tang   │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │ signed txns (SPL)
┌────────────────────────────────────▼─────────────────────────────────┐
│  CHAIN                                                               │
│  solana-clawd · solana-go-main · packages · npm                      │
└──────────────────────────────────────────────────────────────────────┘
```

Full diagram, per-directory role table, and request flow in [**STACK.md**](./STACK.md).

---

## 🧠 Model Strategy

ClawdRouter is the **only** model entry point. It scores every request across 15 dimensions (complexity, context-length, tool-use, vision, Solana-awareness, latency, price, etc.) and routes to the correct model.

### Default tiers

| Tier | Eco | Auto | Premium |
|------|-----|------|---------|
| `SIMPLE` | `nvidia/gpt-oss-120b` *(free)* | `google/gemini-2.5-flash` | `nvidia/kimi-k2.5` |
| `MEDIUM` | `google/gemini-2.5-flash-lite` | `nvidia/kimi-k2.5` | `openai/gpt-5.3-codex` |
| `COMPLEX` | `google/gemini-2.5-flash-lite` | `google/gemini-3.1-pro` | `anthropic/claude-opus-4.6` |
| `REASONING` | `xai/grok-4-1-fast` | **`xai/grok-4.20-beta`** 🆕 | `anthropic/claude-sonnet-4.6` |

### 🆕 Latest additions

| Model | ID | Context | Role |
|---|---|---|---|
| **Grok 4.20 Beta** | `xai/grok-4.20-beta` | 256K | Reasoning-tier default — Solana-aware, agentic, vision |
| **Kimi K2.6** | `moonshot/kimi-k2.6` | 320K | Long-context agentic tool-use + code/audit workflows |

Both ship with aliases (`grok`, `grok-4.20`, `grok-beta`, `kimi`, `kimi-k2`, `kimi-k2.6`) and are wired into ClawdHub Godmode and NemoClawd's Telegram lair. Registry: [`clawdrouter/src/models/registry.ts`](./clawdrouter/src/models/registry.ts). Upstream mapping: [`clawdrouter/src/upstream/openrouter.ts`](./clawdrouter/src/upstream/openrouter.ts).

---

## 🤖 50 Production Agents

Every agent is a `SKILL.md` bundle + an MCP server + a REST endpoint + an optional Metaplex Core NFT. All 50 live in [`agents/`](./agents/).

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

**Agent capabilities:** OODA loop framework · 31 MCP tools · on-chain execution · Privy agentic wallets · payment-gated via x402 · holder-discounted via $CLAWD.

---

## 🏪 ClawdHub — Skills Marketplace

100 bundled `SKILL.md` files across 9 categories, searchable via vector index.

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

REST:

```bash
curl https://solanaclawd.com/api/skills | jq
curl "https://solanaclawd.com/api/skills/search?q=solana" | jq
curl -s https://solanaclawd.com/api/skills/pumpfun-trading/download -o SKILL.md
```

---

## 💳 Payments — x402, MPP, AP2, A2A

One endpoint, four protocols, one settlement layer.

| Protocol | Role |
|---|---|
| **x402** | HTTP 402 native on Solana (Ed25519 + SPL Token) |
| **MPP** | Tempo / Stripe Machine Payments Protocol |
| **AP2** | Google Agent Payments Protocol |
| **A2A** | Google Agent-to-Agent, payment-wrapped |

```bash
curl https://solanaclawd.com/x402/facilitator/supported | jq
curl -X POST https://solanaclawd.com/x402/facilitator/verify  -H 'content-type: application/json' -d '{"payment":"<id>"}'
curl -X POST https://solanaclawd.com/x402/facilitator/settle  -H 'content-type: application/json' -d '{"tx":"<sig>"}'
curl -X POST https://solanaclawd.com/x402/registry/register   -H 'content-type: application/json' -d '{"agentId":"<id>","manifest":"ipfs://…"}'
```

---

## 💰 $CLAWD token & revenue model

| Metric | Value |
|---|---|
| Token | **$CLAWD** (SPL) |
| Mint | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |
| Settlement | SPL USDC + $CLAWD |

**Holder discounts** (checked per call):

| Balance | Discount |
|---|---|
| ≥ 100k $CLAWD | 10% |
| ≥ 1M $CLAWD | 25% |
| ≥ 10M $CLAWD | 50% |

**Revenue split** (on every paid call):

| Recipient | Share | Mechanism |
|---|---|---|
| Agent owner | **70%** | Direct SPL transfer |
| $CLAWD buyback & burn | 15% | Jupiter swap USDC → $CLAWD → burn |
| ClawdRouter treasury | 10% | Squads multisig |
| Operator (facilitator node) | 5% | Automatic payout |

---

## ☁️ Cloud Clawd

Turn any browser into a Solana trading terminal — E2B-isolated Ubuntu sandbox, `solana-clawd` pre-installed, wired to a Privy agentic wallet.

```
User click → E2B spawns Ubuntu 24.04 sandbox → WebSocket bridge → full CLI in browser
```

User secrets stay inside E2B. Your servers only see the pairing token. Details: [`clawd-cloud-os/`](./clawd-cloud-os/) + [`articles/OPENCLAWDarticle.md`](./articles/OPENCLAWDarticle.md).

---

## 📁 Monorepo layout (33 projects)

### Core framework

| Project | Description |
|---|---|
| [`solana-clawd/`](./solana-clawd/) | Go + TypeScript agent framework — OODA loop, 31 MCP tools, xAI Grok |
| [`agents/`](./agents/) | 50 production AI agents — Metaplex Core + REST + MCP |
| [`clawdrouter/`](./clawdrouter/) | Model + payment gateway — x402, MPP, AP2, A2A |

### Skills & marketplace

| Project | Description |
|---|---|
| [`clawdhub/`](./clawdhub/) | Skills registry, vector search, publishing |
| [`skills/`](./skills/) | 100 bundled `SKILL.md` files |
| [`plugin.delivery/`](./plugin.delivery/) | Paid plugin delivery |

### Payments & infra

| Project | Description |
|---|---|
| [`x402-openrouter-main/`](./x402-openrouter-main/) | Native x402 facilitator for Solana |
| [`openclawd-stack/`](./openclawd-stack/) | OpenShell + E2B + Privy + NemoClawd |
| [`MCP/`](./MCP/) | Model Context Protocol servers |
| [`workers/`](./workers/) | Cloudflare edge workers |
| [`services/`](./services/) | Gateway, bridge, monitoring |
| [`websocket-server/`](./websocket-server/) | Real-time streams |
| [`CLI/`](./CLI/) | `clawd` command-line |

### Surfaces

| Project | Description |
|---|---|
| [`tailclawd/`](./tailclawd/) | Web Claude Code via Tailscale |
| [`chrome-extension/`](./chrome-extension/) | `clawd-agent`, `page-agent`, `page-controller` |
| [`beepboop/`](./beepboop/) | macOS menu-bar companion |
| [`WatchApp/`](./WatchApp/) | watchOS wallet-state app |
| [`telegram/`](./telegram/) | Telegram bots |
| [`x-bot/`](./x-bot/) | Twitter/X bot |
| [`bots/`](./bots/) | Pump.fun sniper + mayhem trader |
| [`chess/`](./chess/) | Wallet-signed chess hub |

### Data, knowledge, registry

| Project | Description |
|---|---|
| [`llm-wiki-tang/`](./llm-wiki-tang/) | Vector-indexed LLM knowledge base |
| [`acp_registry/`](./acp_registry/) | Project registry JSON |
| [`articles/`](./articles/) | 42 architecture / payments / model articles |

### Chain & packaging

| Project | Description |
|---|---|
| [`solana-go-main/`](./solana-go-main/) | Solana Go SDK |
| [`packages/`](./packages/) | Shared npm packages |
| [`npm/`](./npm/) | CLI installers (ClawdBot, SolanaOS) |
| [`gfx/`](./gfx/) | Visualizations / branding |
| [`examples/`](./examples/) | Reference clients (OODA, x402, blockchain) |
| [`moltbook-agent/`](./moltbook-agent/) | Educational agent |
| [`API/`](./API/) | BDS + Pump.fun API specs |
| [`clawd-cloud-os/`](./clawd-cloud-os/) | Browser-terminal cloud OS |
| [`src/`](./src/) | Core TypeScript engine |

---

## 🔧 Configuration

One env contract, consumed by every surface and every service. See [`.env.example`](./.env.example) for the full list.

```bash
# Gateway / Router
OPENROUTER_API_KEY=
CLAWDROUTER_BASE_URL=https://clawdrouter.com
CLAWDROUTER_DEFAULT_REASONING=xai/grok-4.20-beta
CLAWDROUTER_DEFAULT_LONGCTX=moonshot/kimi-k2.6

# Direct providers (optional)
XAI_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
MOONSHOT_API_KEY=

# Runtime
E2B_API_KEY=
PRIVY_APP_ID=
PRIVY_APP_SECRET=
HONCHO_URL=
HONCHO_API_KEY=

# Chain
HELIUS_API_KEY=
HELIUS_RPC_URL=
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
SOLANA_CLAWD_BASE_URL=https://solanaclawd.com
CLAWD_MINT=8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump

# Surfaces
TELEGRAM_BOT_TOKEN=
TAILSCALE_AUTH_KEY=
```

Per-subdirectory `.env.example` files are provided for `openclawd-stack/orchestrator`, `websocket-server`, `x-bot`, and `llm-wiki-tang`. **Real `.env` files are gitignored and never committed.**

---

## 🔐 Security posture

- **No `.env` files are tracked in git** — enforced by `**/.env` in [`.gitignore`](./.gitignore). `.npmrc` is blocked too.
- **Deny-first signing** on every irreversible action.
- **E2B sandbox isolation** — user API keys never touch your servers.
- **Payment-gated agents** — wallet connect → on-chain verify → deliver. No hidden auth.
- **No data collection** — static JSON index, zero tracking.
- **Audit & permissions** — see [`articles/permissions-sandboxing.md`](./articles/permissions-sandboxing.md).

---

## 📦 Releasing the CLI

The `solana-clawd` package is published to npm. Releasing uses an env-only token flow so nothing secret lands on disk:

```bash
export NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxx   # never commit
./scripts/publish.sh
```

Under the hood, [`scripts/publish.sh`](./scripts/publish.sh) writes an ephemeral `.npmrc` containing `${NPM_TOKEN}`, which npm expands at read-time, and deletes it on exit. Template: [`scripts/.npmrc.example`](./scripts/.npmrc.example).

---

## 📖 Documentation — 42 articles

Representative selection (full index in [`articles/`](./articles/)):

| Article | Topic |
|---|---|
| [`architecture.md`](./articles/architecture.md) | System architecture |
| [`CLAWD_ROUTER.md`](./articles/CLAWD_ROUTER.md) | ClawdRouter protocol overview |
| [`MODELS.md`](./articles/MODELS.md) | Model selection + tuning |
| [`ARTICLE_PAYMENTS.md`](./articles/ARTICLE_PAYMENTS.md) | Payment infrastructure |
| [`monetize-agents-openclawd.md`](./articles/monetize-agents-openclawd.md) | Agent monetization |
| [`SOLANA_CLAWD_SHELL.md`](./articles/SOLANA_CLAWD_SHELL.md) | Full-stack integration |
| [`OPENCLAWDarticle.md`](./articles/OPENCLAWDarticle.md) | Cloud Clawd browser terminal |
| [`permissions-sandboxing.md`](./articles/permissions-sandboxing.md) | Security & permissions |
| [`x402-proxy-worker.md`](./articles/x402-proxy-worker.md) | x402 edge implementation |
| [`SEO_STRATEGY.md`](./articles/SEO_STRATEGY.md) | SEO for agent ecosystems |

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for setup, coding standards, PR process, and `SKILL.md` creation guidelines. Security issues — please open a private advisory on GitHub.

---

## 📜 License

MIT. See [`LICENSE.md`](./LICENSE.md) and per-project LICENSE files for third-party components.

---

<div align="center">

**Open source · Open format · Open future.**

Built with ❤️ by [8BIT Labs](https://8bit.io) · Powered by [xAI Grok](https://x.ai) · Shipped on [Solana](https://solana.com)

</div>
