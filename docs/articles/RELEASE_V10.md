# 🦞 OpenClawd v.10 — The Hermes Release

> **"The Hermes of Web3" — one router · one settlement layer · one environment contract.**
>
> OpenClawd v.10 is the first release where the full stack — surfaces, router, runtime, skills, settlement, and chain — snaps into a single monorepo behind a single install command. Inspired by [Nous Research](https://nousresearch.com)'s Hermes agent philosophy, the claw now moves fast, connects everything, and settles autonomously on Solana.

---

## TL;DR

- **One-line install**, live on a Cloudflare Worker:
  `curl -fsSL https://solanaclawd-install.x402.workers.dev | bash`
- **30+ packages, apps, and services** in one monorepo — orchestrator, router, wallet, MCP, surfaces, and skills.
- **50-agent catalog** (including 49 Metaplex Lobster Agents) · **90+ bundled skills** · **57 router models** · **4 payment protocols** (x402, MPP, AP2, A2A).
- **ClawdVault** — security scanning, auto-hardening, and policy enforcement baked into the stack.
- **SolanaOS integration** — WebSocket gateway bridge to the Go daemon for unified OODA trading.
- **Zero-secrets repo** — every key is a placeholder; the installer writes its own `~/.openclawd/.env`.

---

## What is OpenClawd?

OpenClawd is an **open-source monorepo** for building, running, and monetizing Solana-native AI agents. It combines:

- **ClawdRouter** — 57-model routing with x402/MPP/AP2/A2A payment rails
- **Orchestrator** — Honcho brain + E2B sandbox + Privy wallet + MCP runtime
- **50+ AI Agents** — trading, DeFi, NFTs, security, research, governance
- **90+ Skills** — bundled `SKILL.md` capabilities
- **ClawdVault** — security scanner and credential vault (Hermes Vault port)
- **$CLAWD Token** — settlement layer with holder discounts (10–50%)

**Stack flow:** `Surface → Router → Runtime → Skills → Settlement → Chain`

---

## The v.10 Stack

```text
┌──────────────────────────────────────────────────────────────┐
│ Surfaces                                                     │
│ chrome-extension · telegram · tailclawd · WatchApp           │
│ beepboop · chess · moltbook-agent · examples                 │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP / SSE / WS
┌────────────────────────────▼─────────────────────────────────┐
│ Router & Payments                                            │
│ clawdrouter · x402-openrouter-main · workers · services      │
└────────────────────────────┬─────────────────────────────────┘
                             │ model routing + payment checks
┌────────────────────────────▼─────────────────────────────────┐
│ Runtime                                                      │
│ src · solana-clawd · AGENTS · MCP · packages                 │
│ openclawd-stack · clawd-cloud-os · CLI                       │
└────────────────────────────┬─────────────────────────────────┘
                             │ skills, registry, docs
┌────────────────────────────▼─────────────────────────────────┐
│ Skills & Knowledge                                           │
│ clawdhub · skills · acp_registry · articles · llm-wiki-tang  │
└────────────────────────────┬─────────────────────────────────┘
                             │ signed Solana actions
┌────────────────────────────▼─────────────────────────────────┐
│ Chain                                                        │
│ Solana · Helius RPC · Jupiter · pump.fun · Birdeye · $CLAWD  │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ 🛡  ClawdVault — policy engine · skill scanning · vault certs │
└──────────────────────────────────────────────────────────────┘
```

---

## Install in One Line

The canonical install surface is a Cloudflare Worker — tamper-evident, no origin server, no private repo needed:

```bash
curl -fsSL https://solanaclawd-install.x402.workers.dev | bash
```

What the installer does:

1. **Preflight** — verifies `curl`, `node ≥ 18`, `npm`, `git`.
2. **Installs** the public [`solana-clawd`](https://www.npmjs.com/package/solana-clawd) CLI globally.
3. **Scaffolds** `~/.openclawd/.env` with Solana + model-router defaults.
4. **Prints** next steps: `pair`, `mint`, `status`.

### Manual setup

```bash
git clone https://github.com/x402agent/openclawd.git
cd openclawd
npm install
cp .env.example .env

# Build the 50-agent catalog
cd AGENTS && node build-catalog.cjs

# Run the orchestrator (brain + wallet + MCP + payments)
cd ../openclawd-stack && pnpm install && pnpm dev:orchestrator
```

Full contributor walkthrough in [`ONBOARDING.md`](../../ONBOARDING.md).

---

## The Orchestrator — Heart of v.10

The single Hono server at `openclawd-stack/orchestrator/` ties the whole stack together on port **8787**:

| Subsystem | Role |
|---|---|
| **Honcho Brain** | Memory, peer.chat, session context |
| **E2B Sandbox** | Per-user isolated agent execution |
| **Privy Wallet** | Embedded wallet, balance, transfer |
| **Solana MCP** | Child process per user, JSON-RPC stdio |
| **Payments Client** | ClawdVault registry, AP2 mandates |
| **Wurk x402 Bridge** | Social campaigns, agent-to-human jobs |
| **Metaplex Bridge** | Core agents, Genesis, token launch |

Key routes:

- `POST /api/v1/launch` — launch an agent (Honcho + E2B)
- `POST /api/v1/wallet/transfer` — SOL/USDC transfers
- `POST /api/v1/metaplex/mint` — mint a Core agent asset on login
- `POST /api/v1/metaplex/launch-token` — launch via Genesis
- `POST /api/v1/metaplex/trade` — execute bonding-curve trades
- `GET  /api/v1/metaplex/lobster-agents` — list the 49 Metaplex Lobster Agents

---

## The 50-Agent Catalog

All 50 agents are Metaplex-enabled and mintable as Core assets. The **49 Metaplex Lobster Agents** ship with full pump.fun, Birdeye, and Solana RPC integration at birth.

| Category | Count | Capabilities |
|---|---|---|
| DeFi | 12 | Swap, liquidity, yield farming |
| Trading | 10 | Sniper, scalper, swing trader, pump.fun |
| Analytics | 11 | On-chain data, sentiment, Birdeye |
| Security | 8 | Rug detection, scam alerts, ClawdVault |
| NFT | 5 | Mint, trade, collection |
| Dev Tools | 8 | Deploy, test, audit |
| Research | 4 | Token analysis, market research |
| Governance | 3 | DAO voting, proposals |

Every lobster agent is born with: `create`/`create_v2`, `buy`, `sell`, `collectCreatorFee`, `migrate`, and `set_metaplex_creator` across the Pump, Mayhem, and Metaplex programs.

### $CLAWD tier gating

| Tier | $CLAWD Required | Trading Limits |
|---|---|---|
| Free | 0 | 0.01 – 0.1 SOL |
| Bronze | 1 | 0.01 – 0.5 SOL |
| Silver | 1,000 | 0.01 – 2.0 SOL |
| Gold | 10,000 | 0.01 – 10 SOL |
| Diamond | 100,000 | Unlimited |

---

## 🛡 ClawdVault — Security as a First-Class Citizen

v.10 promotes Hermes Vault to a core subsystem under the name **ClawdVault**. It transforms the codebase into a hardened, threat-monitored vault.

### What ClawdVault does

- 🔍 **Security Risk Scanner** — secrets, vulnerabilities, misconfigurations across the entire tree
- 🛡 **Auto-Hardening** — automatic fixes for common security issues
- 🔐 **Credential Vault** — AES-GCM encrypted credential management
- 📋 **Policy Enforcement** — skills can't enter the registry without passing
- 🐾 **Clawd Persona** — pre-configured vault guardian agent

### Layout

```
openclawd/
├── skills/clawd-vault/          # Main vault skill (+ scanner & hardener)
├── AGENTS/vault-agent.json      # Vault guardian agent config
├── MCP/vault-mcp/               # MCP server for vault tools
└── services/hermes-vault/       # Python backend (optional)
```

### Usage

```bash
npx claudette vault scan --path . --full   # full scan
npx claudette vault scan --secrets          # secrets only
npx claudette vault harden --auto           # apply fixes
npx claudette vault policy --check          # compliance
```

### Checks performed

1. **Secret detection** — AWS/GCP/Azure/Stripe keys, SSH/GPG/Solana/Ethereum private keys, DB creds, hardcoded passwords.
2. **Vulnerability detection** — SQL injection, XSS, insecure deserialization, path traversal, dependency CVEs.
3. **Configuration hardening** — file permissions, git history exposure, debug mode, CORS, insecure protocols.
4. **Code quality** — unsafe `eval`, dynamic execution, insecure PRNGs, inline credentials.

### Skill publishing gates

Every skill in the marketplace must:

- ✅ Pass the ClawdVault security scan
- ✅ Score ≥ 80/100
- ✅ Have zero critical issues
- ✅ Use placeholder variables (`{{API_KEY}}`) rather than real keys

---

## Zero-Secrets Public Release

v.10 ships the repository **without a single real credential**. Every API key, token, deployment ID, and RPC URL is a placeholder like `<your-helius-api-key>` or `sk-proj-...`. Key posture:

- No real `.env` files tracked in git.
- Root `.gitignore` blocks common secret locations *and* `.npmrc`.
- Signing flows are **deny-first** by design.
- Sandbox-oriented components isolate user-controlled execution.
- Hosted endpoints (e.g. `solanaclawd.com`) are examples — swap them for your own infra.
- For Cloudflare Workers: use `wrangler secret put <NAME>`. For Convex/Netlify/Vercel/Supabase: set env in the provider dashboard.

If you find anything that looks like a live secret in the tree, **open an issue immediately** — we treat it as a P0. Report flow is documented in [`SECURITY.md`](../../SECURITY.md).

---

## SolanaOS Integration — The Unified Agent System

v.10 introduces the first-class bridge between the OpenClawd TypeScript orchestrator and the [SolanaOS](https://github.com/x402agent/SolanaOS) Go daemon. Together they form a unified autonomous AI agent system.

```
Chrome pAGENT ──▶ OpenClawd Orchestrator ──▶ Claude Desktop
                         │
                   ┌─────┴─────┐
                   ▼           ▼
              ClawdHub     49 Agents
                   │
                   ▼
            Wallet Bridge ──▶ Privy Wallet
                   │
                   ▼
            ┌────────────────┐
            │    SolanaOS    │
            │   (Go Binary)  │
            │   Port 18790   │
            ├────────────────┤
            │ OODA Loop      │
            │ Telegram Bot   │
            │ Wallet Vault   │
            │ Honcho Memory  │
            │ x402 Payments  │
            └────────────────┘
```

### Connection points

| Bridge | Port | Protocol |
|---|---|---|
| Gateway | 18790 | WebSocket |
| Wallet API | 8421 | REST |
| MCP Bridge | 3001 | stdio + HTTP |
| Control UI | 7777 | HTTP |
| MawdAxe SSE | 8420 | SSE |

### Auto-connect

```bash
git clone https://github.com/x402agent/openclawd.git
git clone https://github.com/x402agent/SolanaOS.git

cd openclawd && bash chrome-extension/install-openclawd.sh
cd ../SolanaOS && bash start.sh

openclawd connect --solanaos ~/SolanaOS
```

The installer scans for the SolanaOS binary at `~/SolanaOS/solanaos`, reads `~/.solanaos/solanaos.json` for the gateway port, and writes an `.env.local` pointing the orchestrator at the daemon.

### Feature parity

| Feature | OpenClawd | SolanaOS | Unified |
|---|---|---|---|
| OODA trading | ✅ (via agents) | ✅ (native) | ✅ |
| Wallet vault | ✅ (Privy) | ✅ (Go) | ✅ |
| Honcho memory | ✅ | ✅ | ✅ |
| MCP bridge | ✅ | ✅ | ✅ |
| Telegram bot | ❌ | ✅ | ✅ |
| Chrome extension | ✅ | ❌ | ✅ |
| x402 payments | ✅ | ✅ | ✅ |
| Metaplex agents | ✅ (49) | ❌ | ✅ |
| BitAxe mining | ❌ | ✅ | ✅ |
| Seeker mobile | ❌ | ✅ | ✅ |

Full details in [`INTEGRATION_STRATEGY.md`](../../INTEGRATION_STRATEGY.md).

---

## Contributor Onboarding, Codified

v.10 ships a full [`ONBOARDING.md`](../../ONBOARDING.md) that takes a new contributor from clone to merged PR:

- Quick start + environment setup
- Architecture walk-through (Surface → Router → Runtime → Skills → Settlement → Chain)
- Key directory map (`AGENTS/`, `skills/`, `clawdrouter/`, `MCP/`, `packages/`, etc.)
- Dev workflow: branch → change → test → commit → PR
- Skill authoring template (Trigger, Environment, Steps, Security, References)
- Agent JSON schema with categories (`defi`, `trading`, `analytics`, `security`, `nft`, …)
- Commit conventions: `type(scope): description` (e.g. `feat(skills): add trading-advisor`)
- PR checklist

### Skill shape

```
skills/my-skill/
├── SKILL.md           # Required: main definition
├── README.md          # Optional: documentation
└── references/        # Optional: extra files
```

### Agent shape

```json
{
  "$schema": "./agent-template-full.json",
  "name": "my-agent",
  "displayName": "My Agent",
  "version": "1.0.0",
  "ecosystem": "OpenClawd",
  "skills": [{ "name": "relevant-skill", "enabled": true, "priority": "primary" }],
  "capabilities": { "skills": ["trading"], "x402_support": true },
  "metadata": { "tags": ["solana", "trading"], "category": "trading" }
}
```

---

## Drop-in Install UX for Your Site

Every surface that embeds the install command now has a canonical snippet pack in [`INSTALL_SNIPPETS.md`](../../INSTALL_SNIPPETS.md). The pack ships:

- A plain-text one-liner for hero blocks
- HTML + CSS hero component with copy-to-clipboard
- A React component (`<InstallHero />`) drop-in for Next.js / Vite
- Markdown block for `.md` landing pages
- Plain-text terminal preview art (the cyberpunk lobster ASCII)
- Open Graph / Twitter meta tags
- Agent system-prompt fragment so your bot answers *"how do I install openclawd?"* correctly
- Security talking points (Worker-hosted installer, public npm package, no sudo, no private repo)

```html
<pre><code>curl -fsSL https://solanaclawd-install.x402.workers.dev | bash</code></pre>
```

---

## Environment Contract

The shared env surface is defined in [`.env.example`](../../.env.example) and summarized in [`STACK.md`](../../STACK.md):

- **Router / models:** `OPENROUTER_API_KEY`, `CLAWDROUTER_API_KEY`, `XAI_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MOONSHOT_API_KEY`
- **Runtime / sandboxing:** `E2B_API_KEY`, `PRIVY_APP_ID`, `PRIVY_APP_SECRET`, `HONCHO_URL`, `HONCHO_API_KEY`
- **Solana / data:** `HELIUS_API_KEY`, `HELIUS_RPC_URL`, `SOLANA_RPC_URL`, `CLAWD_MINT`, `BIRDEYE_API_KEY`, `JUPITER_API_KEY`, `SOLANA_TRACKER_KEY`, `DFLOW_API_KEY`
- **Surfaces:** `TELEGRAM_BOT_TOKEN`, `TAILSCALE_AUTH_KEY`

If defaults change, the rule is: update `.env.example` and the router registry — don't fan out model tables across docs.

---

## $CLAWD

| Symbol | Chain | Standard | Contract |
|:---:|:---:|:---:|:---|
| **$CLAWD** | Solana | SPL Token | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |

Holder utility:

| Balance | Discount | Benefit |
|:---:|:---:|:---|
| ≥ 100,000 $CLAWD | 10% | Paid model calls + paid skill installs |
| ≥ 1,000,000 $CLAWD | 25% | Priority routing + beta access |
| ≥ 10,000,000 $CLAWD | 50% | Full discount tier + governance features |

---

## What's Next After v.10

v.10 is the *integration* release. The next milestones follow the phased migration path in `INTEGRATION_STRATEGY.md`:

- **Phase 2 — Shared Memory:** unify Honcho workspace + vault structure across OpenClawd and SolanaOS.
- **Phase 3 — Unified Control:** single `openclawd` CLI drives both runtimes, one agent catalog.
- **Phase 4 — Merged Binary:** compile SolanaOS into OpenClawd → single Go+Node hybrid.

Plus:

- Finish ClawdVault cross-agent policy bus.
- Close out SolanaOS orchestrator wiring (gateway ↔ orchestrator, shared `ACP` registry).
- Ship `openclawd connect` auto-detection for all surfaces.

---

## Ship it 🦞

v.10 is the release where the claw stops being a collection of packages and starts being a **stack**. One installer, one orchestrator, one security layer, one settlement rail — 50 agents ready to launch, trade, and report the moment you drop a key into `~/.openclawd/.env`.

```bash
curl -fsSL https://solanaclawd-install.x402.workers.dev | bash
```

**Welcome to the claw.**

---

### Further reading

| Doc | What it covers |
|---|---|
| [`README.md`](../../README.md) | Product overview + quick links |
| [`ONBOARDING.md`](../../ONBOARDING.md) | Contributor setup & workflow |
| [`STACK.md`](../../STACK.md) | Layer-to-directory map + request flow |
| [`SECURITY.md`](../../SECURITY.md) | Public-release security posture |
| [`SECURITY_VAULT_INTEGRATION.md`](../../SECURITY_VAULT_INTEGRATION.md) | ClawdVault architecture |
| [`INTEGRATION_STRATEGY.md`](../../INTEGRATION_STRATEGY.md) | OpenClawd × SolanaOS |
| [`INSTALL_SNIPPETS.md`](../../INSTALL_SNIPPETS.md) | Drop-in install UX assets |

---

<div align="center">

**Open source · Open format · Open future**

**$CLAWD** · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

Built by [8BIT Labs](https://8bit.io) · Inspired by [Nous Research](https://nousresearch.com) · Powered by [xAI Grok](https://x.ai) · Settled on [Solana](https://solana.com)

</div>
