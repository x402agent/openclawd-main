<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24,28&height=240&section=header&text=🦞%20OpenClawd&fontSize=90&fontColor=ffffff&animation=fadeIn&fontAlignY=38&desc=Sovereign%20AI%20Lobsters%20on%20Solana%20·%20Born%20to%20Earn%20·%20Beach%20with%20Dignity&descAlignY=58&descAlign=50" alt="OpenClawd banner" />

<p>
  <a href="https://solanaclawd.com"><img src="https://img.shields.io/badge/$CLAWD-on_Solana-9945FF?style=for-the-badge&logo=solana&logoColor=14F195" alt="$CLAWD on Solana"></a>
  <a href="https://x.com/clawddevs"><img src="https://img.shields.io/badge/@clawddevs-X-000000?style=for-the-badge&logo=x" alt="@clawddevs"></a>
  <a href="https://www.npmjs.com/package/solana-clawd"><img src="https://img.shields.io/npm/v/solana-clawd?style=for-the-badge&label=solana-clawd&color=cc3534&logo=npm" alt="npm: solana-clawd"></a>
  <a href="https://www.npmjs.com/package/@openclawd/wallet"><img src="https://img.shields.io/npm/v/@openclawd/wallet?style=for-the-badge&label=@openclawd/wallet&color=cc3534&logo=npm" alt="npm: @openclawd/wallet"></a>
  <a href="./LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" alt="MIT"></a>
</p>

<p>
  <a href="https://solanaclawd.com/x402"><img src="https://img.shields.io/badge/x402-native-F39C12?style=flat-square" alt="x402"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-9B59B6?style=flat-square" alt="MCP"></a>
  <a href="https://t.me/clawdtoken"><img src="https://img.shields.io/badge/Telegram-clawdtoken-26A5E4?style=flat-square&logo=telegram&logoColor=white" alt="Telegram"></a>
  <a href="https://github.com/x402agent/openclawd/stargazers"><img src="https://img.shields.io/github/stars/x402agent/openclawd?style=flat-square&color=yellow&logo=github" alt="Stars"></a>
  <a href="https://github.com/x402agent/openclawd/network/members"><img src="https://img.shields.io/github/forks/x402agent/openclawd?style=flat-square&color=blue&logo=github" alt="Forks"></a>
  <a href="https://github.com/x402agent/openclawd/issues"><img src="https://img.shields.io/github/issues/x402agent/openclawd?style=flat-square&color=red" alt="Issues"></a>
  <a href="https://github.com/x402agent/openclawd/pulls"><img src="https://img.shields.io/github/issues-pr/x402agent/openclawd?style=flat-square&color=brightgreen" alt="PRs"></a>
</p>

# 🦞 OpenClawd

### The open-source Solana AI agent stack.

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

[**Install**](#install) · [**Architecture**](#architecture) · [**Router**](#clawdrouter) · [**Wallet**](#clawd-wallet) · [**Marketplace**](#clawdhub) · [**Stack Map**](./STACK.md) · [**Docs**](./articles) · [**Website**](https://solanaclawd.com)

</div>

---

## OpenClawd in one paragraph

OpenClawd is a monorepo for building, running, and monetizing Solana-native AI agents. It combines a model router, a wallet layer, payment rails, an MCP runtime, a skills marketplace, browser and chat surfaces, and deployment-oriented tooling under one repo and one shared environment contract.

If you want the product overview, start here. If you want the directory-by-directory technical map, read [STACK.md](./STACK.md).

---

## Public release

This repo is published without real secrets, private keys, or required proprietary credentials.

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

## 🔧 Quick Start

```bash
# Clone the repo
git clone https://github.com/x402agent/openclawd.git
cd openclawd

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your API keys

# Build agents catalog
cd agents && node build-catalog.cjs

# Run ClawdRouter
cd ../clawdrouter && npm run dev
```

For full installation details, see **[ONBOARDING.md](./ONBOARDING.md)**.

---

## 📚 Documentation

| Guide | Description |
|-------|-------------|
| [ONBOARDING.md](./ONBOARDING.md) | **Start here!** Contributor setup & workflow |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |
| [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) | Community Code of Conduct |
| [SECURITY.md](./SECURITY.md) | Security policy & reporting |
| [STACK.md](./STACK.md) | Technical architecture |
| [articles/](./articles/) | Deep-dive documentation |
| [agents/README.md](./agents/README.md) | Agent development |
| [skills/README.md](./skills/README.md) | Skill development |

---

Before you run anything:

1. Copy [`.env.example`](./.env.example) to `.env`, plus any subproject `*.env.example` files you actually need.
2. Read [SECURITY.md](./SECURITY.md).
3. Use [STACK.md](./STACK.md) and the docs in [articles/](./articles/) as the source of truth for setup details.

Hosted URLs in the repo are defaults, not lock-in. Swap them for your own infrastructure if you self-host.

---

## Why this repo exists

Most Solana agent stacks are stitched together from separate services:

- an LLM gateway
- wallet custody or signing glue
- payment verification
- an MCP/tool runtime
- a skills registry
- sandboxed execution
- a frontend or bot surface

OpenClawd keeps those pieces in one place:

- **ClawdRouter** for model selection and payment-aware routing
- **`@openclawd/wallet`** for embedded Solana wallet flows with deny-first controls
- **`solana-clawd`** for agent runtime, OODA loops, and Solana tooling
- **ClawdHub** for searchable `SKILL.md` bundles
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

### ClawdRouter

[`clawdrouter/`](./clawdrouter/) is the single model-routing layer for the stack.

- 57 models in the local registry
- 15-dimension scorer
- one entry point for routing, pricing, and provider selection
- payment-aware flow for Solana-native agent calls

See [articles/CLAWD_ROUTER.md](./articles/CLAWD_ROUTER.md).

### Clawd Wallet

[`packages/clawd-wallet/`](./packages/clawd-wallet/) packages the embedded wallet layer as [`@openclawd/wallet`](https://www.npmjs.com/package/@openclawd/wallet).

- Privy-powered embedded wallet flows
- Jupiter swap support
- deny-first transaction permissions
- agentic transaction screening hooks

See [articles/CLAWD_WALLET_INTEGRATION.md](./articles/CLAWD_WALLET_INTEGRATION.md).

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
- MCP-first tool runtime
- OODA-loop agent flows
- Go plus TypeScript bridge

See [articles/solana-clawd-go.md](./articles/solana-clawd-go.md).

### Payments

[`x402-openrouter-main/`](./x402-openrouter-main/), [`workers/`](./workers/), and [`services/`](./services/) cover payment and gateway plumbing.

- `x402`
- `MPP`
- `AP2`
- `A2A`

The settlement layer is Solana, with SPL USDC and `$CLAWD` as the core billing assets.

See [articles/ARTICLE_PAYMENTS.md](./articles/ARTICLE_PAYMENTS.md).

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

[`services/hermes-vault/`](./services/hermes-vault/) provides security scanning for skills and agents.

- **Risk Scanning** — Detect vulnerabilities in SKILL.md bundles
- **Hardening** — Apply security best practices
- **Policy Enforcement** — Validate against security policies
- **Vault Certification** — Score-based approval system

```bash
# Scan a skill for security issues
cd services/hermes-vault
python -m hermes_vault.cli scan ../../skills/my-skill
```

See [skills/clawd-vault/](./skills/clawd-vault/).

### WURK Integration (Monetization)

[`MCP/wurk-mcp/`](./MCP/wurk-mcp/) and [`skills/wurk-integration/`](./skills/wurk-integration/) enable x402 job monetization.

- **Job Posting** — Post AI agent jobs with SOL/USDC payment
- **Bidding System** — Agents bid on jobs
- **x402 Payments** — Automatic payment on completion
- **Solana/Base Support** — Multi-chain settlement

See [WURK Integration Guide](./skills/wurk-integration/README.md).

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
┌──────────────────────────────────────────────────────────────┐
│ Surfaces                                                     │
│ chrome-extension · telegram · tailclawd · WatchApp          │
│ beepboop · chess · moltbook-agent · examples                │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP / SSE / WS
┌────────────────────────────▼─────────────────────────────────┐
│ Router and payments                                          │
│ clawdrouter · x402-openrouter-main · workers · services      │
│ plugin.delivery · api-registrar                              │
└────────────────────────────┬─────────────────────────────────┘
                             │ routed model calls + settlement
┌────────────────────────────▼─────────────────────────────────┐
│ Runtime                                                      │
│ src · solana-clawd · agents · MCP · packages                 │
│ openclawd-stack · clawd-cloud-os · CLI                       │
└────────────────────────────┬─────────────────────────────────┘
                             │ skills, registry, docs
┌────────────────────────────▼─────────────────────────────────┐
│ Skills and knowledge                                         │
│ clawdhub · skills · acp_registry · articles · llm-wiki-tang  │
│ clawd-vault · werk-integration                                │
└────────────────────────────┬─────────────────────────────────┘
                             │ signed Solana actions
┌────────────────────────────▼─────────────────────────────────┐
│ Chain                                                        │
│ Solana · Helius RPC · Jupiter · SPL USDC · $CLAWD            │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ 🐾 Security: ClawdVault (hermes-vault)                        │
│ vault-agent · vault-mcp · hermes-vault services               │
│ ─────────────────────────────────────────────────────────────│
│ 💰 Monetization: WURK.fun                                     │
│ werk-mcp · werk-integration skill · x402 payments            │
└──────────────────────────────────────────────────────────────┘
```

For the full layer map, request flow, and directory breakdown, read [STACK.md](./STACK.md).

---

## Monorepo map

| Area | Directories |
|---|---|
| **Core Runtime** | [`solana-clawd/`](./solana-clawd/), [`agents/`](./agents/), [`src/`](./src/), [`MCP/`](./MCP/), [`packages/`](./packages/) |
| **Router & Payments** | [`clawdrouter/`](./clawdrouter/), [`x402-openrouter-main/`](./x402-openrouter-main/), [`workers/`](./workers/), [`services/`](./services/), [`plugin.delivery/`](./plugin.delivery/) |
| **Surfaces** | [`chrome-extension/`](./chrome-extension/), [`telegram/`](./telegram/), [`tailclawd/`](./tailclawd/), [`WatchApp/`](./WatchApp/), [`beepboop/`](./beepboop/), [`chess/`](./chess/), [`moltbook-agent/`](./moltbook-agent/) |
| **Cloud & Orchestration** | [`openclawd-stack/`](./openclawd-stack/), [`clawd-cloud-os/`](./clawd-cloud-os/), [`CLI/`](./CLI/) |
| **Skills & Knowledge** | [`clawdhub/`](./clawdhub/), [`skills/`](./skills/), [`acp_registry/`](./acp_registry/), [`articles/`](./articles/), [`llm-wiki-tang/`](./llm-wiki-tang/) |
| **SDKs, Examples & Assets** | [`solana-go-main/`](./solana-go-main/), [`API/`](./API/), [`examples/`](./examples/), [`gfx/`](./gfx/), [`npm/`](./npm/) |
| **Security (ClawdVault)** | [`skills/clawd-vault/`](./skills/clawd-vault/), [`MCP/vault-mcp/`](./MCP/vault-mcp/), [`agents/vault-agent.json`](./agents/vault-agent.json), [`services/hermes-vault/`](./services/hermes-vault/) |
| **API Registrar** | [`api-registrar/`](./api-registrar/) — X-verified API key registration with Solana wallet auth |
| **Monetization (WURK)** | [`skills/wurk-integration/`](./skills/wurk-integration/), [`MCP/wurk-mcp/`](./MCP/wurk-mcp/) — x402 job monetization on Solana/Base |
| **Protocols** | [`x402-openrouter-main/`](./x402-openrouter-main/) — x402 payment protocol implementation |

`tailclawd-backup/` exists as a backup directory and is not part of the primary stack path.

---

## Configuration

The shared environment contract lives in [`.env.example`](./.env.example).

Typical minimum variables:

- `OPENROUTER_API_KEY`
- `CLAWDROUTER_BASE_URL`
- `XAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MOONSHOT_API_KEY` as needed
- `E2B_API_KEY`
- `PRIVY_APP_ID`
- `HELIUS_API_KEY` or `HELIUS_RPC_URL`
- `SOLANA_RPC_URL`
- `TELEGRAM_BOT_TOKEN` or `TAILSCALE_AUTH_KEY` for specific surfaces
- `WURK_API_KEY` for agent monetization via WURK.fun (see [`api-registrar/`](./api-registrar/))

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
- add an agent: create a new directory under [`agents/`](./agents/) with its metadata and skill bundle
- publish npm packages: use [scripts/publish.sh](./scripts/publish.sh) with `NPM_TOKEN` exported in your shell

---

## License

MIT. See [LICENSE.md](./LICENSE.md).

---

<div align="center">

### Open source · Open format · Open future

**$CLAWD** · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

Built by [8BIT Labs](https://8bit.io) · Powered by [xAI Grok](https://x.ai) · Settled on [Solana](https://solana.com)

[![Twitter](https://img.shields.io/badge/𝕏-@clawddevs-000000?style=for-the-badge)](https://x.com/clawddevs)
[![Telegram](https://img.shields.io/badge/Telegram-clawdtoken-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/clawdtoken)
[![GitHub](https://img.shields.io/badge/GitHub-openclawd-181717?style=for-the-badge&logo=github)](https://github.com/x402agent/openclawd)

</div>
