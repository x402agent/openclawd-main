# OpenClawd

> Solana-native AI agent stack for routing, orchestration, payments, skills, MCP, browser automation, and local or hosted inference.

OpenClawd is the public monorepo behind the Clawd ecosystem. It combines an orchestrator, model router, wallet tooling, x402/AP2 payment rails, MCP servers, browser surfaces, package libraries, edge workers, and a large checked-in skill and agent catalog so teams can fork one repo and ship chain-native AI products quickly.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE.md)
[![Node](https://img.shields.io/badge/Node-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](./.nvmrc)
[![Solana](https://img.shields.io/badge/Solana-native-14F195?style=for-the-badge&logo=solana&logoColor=black)](https://solana.com)
[![MCP](https://img.shields.io/badge/MCP-compatible-111827?style=for-the-badge)](https://modelcontextprotocol.io)

## What Ships

| Area | Paths | What it covers |
| --- | --- | --- |
| Surfaces | [`chrome-extension/`](./chrome-extension/), [`tailclawd/`](./tailclawd/), [`clawd-cloud-os/`](./clawd-cloud-os/), [`Apps/`](./Apps/) | Browser agent surface, terminal UI, cloud OS, companion apps |
| Runtime | [`openclawd-stack/`](./openclawd-stack/), [`src/`](./src/), [`solana-clawd/`](./solana-clawd/) | Orchestration, gateway, wallets, MCP runtime, Solana agent framework |
| Routing and payments | [`clawdrouter/`](./clawdrouter/), [`workers/`](./workers/), [`services/`](./services/), [`x402/`](./x402/) | Model routing, x402 rails, workers, settlement and support services |
| Agent and skill layer | [`AGENTS/`](./AGENTS/), [`skills/`](./skills/), [`clawdhub/`](./clawdhub/), [`acp_registry/`](./acp_registry/) | Agent catalog, skills marketplace, registry and publishing flows |
| Packages | [`packages/`](./packages/), [`MCP/`](./MCP/), [`API/`](./API/) | Shared SDKs, MCP servers, protocol references, wallet and payment libraries |
| Docs and onboarding | [`docs/articles/`](./docs/articles/), [ONBOARDING.md](./ONBOARDING.md), [STACK.md](./STACK.md), [INTEGRATION_STRATEGY.md](./INTEGRATION_STRATEGY.md) | Product docs, architecture, ops, integration guides |

## Flagship Capabilities

- **OpenClawd Orchestrator** in [`openclawd-stack/`](./openclawd-stack/) ties together wallets, Honcho memory, E2B sandboxes, MCP tools, and monetized runtime services.
- **ClawdRouter** in [`clawdrouter/`](./clawdrouter/) routes across cloud and local models, supports hosted and local AI lanes, and sits on the payment-aware edge of the stack.
- **Browser automation and pAGENT** in [`chrome-extension/`](./chrome-extension/) gives the stack a browser-native operator surface for wallet-aware browsing, tool use, and task automation.
- **50-agent catalog and bundled skills** live in [`AGENTS/`](./AGENTS/) and [`skills/`](./skills/), giving the repo a ready-made marketplace and extension layer.
- **Payments as a first-class primitive** span x402, MPP, AP2, and A2A flows; see [ARTICLE_PAYMENTS.md](./docs/articles/ARTICLE_PAYMENTS.md).
- **Local AI and remote tunnel flows** are documented in [ARTICLE_LOCAL_AI.md](./docs/articles/ARTICLE_LOCAL_AI.md) and [CLAWD_ROUTER_TUNNEL.md](./docs/articles/CLAWD_ROUTER_TUNNEL.md).
- **AutoResearch and agentic research loops** are documented in [AUTO_RESEARCH_AGENTS.md](./docs/articles/AUTO_RESEARCH_AGENTS.md).
- **ClawdVault security posture** is described in [SECURITY_VAULT_INTEGRATION.md](./SECURITY_VAULT_INTEGRATION.md) and the [`skills/clawd-vault/`](./skills/clawd-vault/) + [`MCP/vault-mcp/`](./MCP/vault-mcp/) implementation.
- **Agent Bus / Claw3D integration** is covered in [agent-bus.md](./docs/articles/agent-bus.md).

## Quick Start

### From Source

```bash
git clone https://github.com/x402agent/openclawd.git
cd openclawd
cp .env.example .env

# Install repo-managed hooks and verify the machine.
npm run hooks:install
npm run doctor

# Install the main repo entry points.
npm run install:all

# Build the agent catalog and start the orchestrator.
npm run build:catalog
npm run dev:orchestrator
```

Minimum local toolchain:

- Node `20+`
- npm `10+`
- `pnpm` on your `PATH`
- Git

### Bootstrap Installer

If you want the end-user bootstrap flow instead of a full source checkout:

```bash
bash ./install.sh
```

Install snippets and hosted installer copy live in [INSTALL_SNIPPETS.md](./INSTALL_SNIPPETS.md).

## Core Developer Commands

| Command | Purpose |
| --- | --- |
| `npm run hooks:install` | Installs repo-managed git hooks to block accidental secret commits |
| `npm run brand:check` | Catches high-visibility old-brand phrases in first-party docs |
| `npm run doctor` | Verifies the supported root bootstrap path |
| `npm run guard:worktree` | Scans tracked and untracked worktree files for env files and common secret patterns |
| `npm run release:check` | Public-release sanity check for docs, tracked file hygiene, and package metadata |
| `npm run build:catalog` | Rebuilds the checked-in agent catalog |
| `npm run dev:orchestrator` | Starts the main runtime orchestrator from `openclawd-stack/` |
| `npm run dev:router` | Starts ClawdRouter |
| `npm run dev:registrar` | Starts the API registrar |
| `npm run dev:cli` | Starts the canonical Clawd CLI surface |

## Build Map

| Subsystem | Path | Notes |
| --- | --- | --- |
| Orchestrator and gateway | [`openclawd-stack/`](./openclawd-stack/) | Main runtime, wallets, session orchestration, gateway agents |
| Router | [`clawdrouter/`](./clawdrouter/) | Model routing, local/cloud inference lanes |
| CLI | [`clawd-code-cli/`](./clawd-code-cli/) | Terminal-native coding and ops surface |
| Skills marketplace | [`clawdhub/`](./clawdhub/) | Skill discovery, install, publish flows |
| Wallet SDK | [`packages/clawd-wallet/`](./packages/clawd-wallet/) | Embedded wallet and agentic trading hooks |
| x402 SDK | [`packages/agents-x402-solana/`](./packages/agents-x402-solana/) | Payment-aware MCP and HTTP tooling |
| Perpetuals CLI | [`packages/percolator/`](./packages/percolator/) | Solana perps CLI |
| Workers | [`workers/`](./workers/) | Trading bot, install worker, wallet worker, email worker, more |
| MCP servers | [`MCP/`](./MCP/) | Shared MCP server implementations including vault and WURK |
| Browser extension | [`chrome-extension/`](./chrome-extension/) | pAGENT browser surface and control bridge |

## Docs by Theme

| Theme | Docs |
| --- | --- |
| Onboarding | [ONBOARDING.md](./ONBOARDING.md), [CONTRIBUTING.md](./CONTRIBUTING.md), [SUPPORT.md](./SUPPORT.md) |
| Architecture | [STACK.md](./STACK.md), [architecture.md](./docs/articles/architecture.md), [INTEGRATION_STRATEGY.md](./INTEGRATION_STRATEGY.md) |
| Payments and monetization | [ARTICLE_PAYMENTS.md](./docs/articles/ARTICLE_PAYMENTS.md), [monetize-agents-openclawd.md](./docs/articles/monetize-agents-openclawd.md), [ARTICLE_MARKET.md](./docs/articles/ARTICLE_MARKET.md) |
| Local and routed AI | [ARTICLE_LOCAL_AI.md](./docs/articles/ARTICLE_LOCAL_AI.md), [CLAWD_ROUTER_TUNNEL.md](./docs/articles/CLAWD_ROUTER_TUNNEL.md), [CLAWD_ROUTER.md](./docs/articles/CLAWD_ROUTER.md) |
| Research and memory | [AUTO_RESEARCH_AGENTS.md](./docs/articles/AUTO_RESEARCH_AGENTS.md), [agent-bus.md](./docs/articles/agent-bus.md) |
| Security | [SECURITY.md](./SECURITY.md), [SECURITY_VAULT_INTEGRATION.md](./SECURITY_VAULT_INTEGRATION.md), [permissions-sandboxing.md](./docs/articles/permissions-sandboxing.md) |

## Security Guardrails

OpenClawd is meant to be cloned and published publicly, so the repo now ships with built-in guardrails:

```bash
npm run hooks:install
npm run brand:check
npm run guard:worktree
npm run doctor
npm run release:check
```

What these cover:

- pre-commit blocks staged `.env`, `.pem`, `.key`, and common live-secret patterns
- pre-push re-runs worktree and release hygiene checks
- `brand:check` catches high-visibility first-party branding drift in docs
- `doctor` verifies the supported root bootstrap path
- `release:check` verifies public-release hygiene and metadata

Review [SECURITY.md](./SECURITY.md) before publishing a fork or opening a release PR.

## $CLAWD Token

OpenClawd centers a Solana SPL token used across holder gating, pricing, wallet-aware surfaces, and docs.

| Property | Value |
| --- | --- |
| Symbol | `$CLAWD` |
| Chain | Solana |
| Standard | SPL Token |
| Mint / contract address | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |

Links:

- [Buy on Jupiter](https://jup.ag/swap/SOL-8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
- [View on DexScreener](https://dexscreener.com/solana/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
- [View on pump.fun](https://pump.fun/coin/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)

## Community

- Website: [solanaclawd.com](https://solanaclawd.com)
- Agent hub: [hub.solanaclawd.com](https://hub.solanaclawd.com)
- X: [@clawddevs](https://x.com/clawddevs)
- Telegram: [t.me/clawdtoken](https://t.me/clawdtoken)

## License

MIT. See [LICENSE.md](./LICENSE.md).
