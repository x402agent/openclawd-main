# OpenClawd

> Solana-native AI agent monorepo: router, orchestrator, payments, MCP tools, skills, and developer-facing surfaces in one repo.

OpenClawd is the public monorepo for building, running, and monetizing chain-native AI agents. It combines a model router, agent runtime, wallet tooling, x402 payment rails, MCP servers, reusable packages, and multiple user surfaces so teams can fork one codebase and ship fast.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](./LICENSE.md)
[![Node](https://img.shields.io/badge/Node-20%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](./.nvmrc)
[![Solana](https://img.shields.io/badge/Solana-native-14F195?style=for-the-badge&logo=solana&logoColor=black)](https://solana.com)
[![MCP](https://img.shields.io/badge/MCP-compatible-111827?style=for-the-badge)](https://modelcontextprotocol.io)

## Why Developers Clone It

- `openclawd-stack/` ties together orchestration, sandboxing, wallet flows, MCP, and runtime services.
- `clawdrouter/` provides model routing and payment-aware request flow for agent workloads.
- `AGENTS/` and `skills/` give you a catalog plus reusable SKILL bundles to extend quickly.
- `packages/`, `workers/`, `chrome-extension/`, and `tailclawd/` cover SDKs, edge services, browser tooling, and UI surfaces.

## Quick Start

### From Source

```bash
git clone https://github.com/x402agent/openclawd.git
cd openclawd
cp .env.example .env

# Verify your local toolchain first.
npm run doctor

# Install the repo entry points.
npm run install:all

# Build the agent catalog and start the main runtime.
npm run build:catalog
npm run dev:orchestrator
```

Minimum local toolchain:

- Node `20+`
- npm `10+`
- `pnpm` on your `PATH` for `openclawd-stack/`
- Git

### Installer

If you want the end-user installer flow instead of the full source checkout, use the local bootstrap script:

```bash
bash ./install.sh
```

Website-ready install snippets and hosted installer copy live in [INSTALL_SNIPPETS.md](./INSTALL_SNIPPETS.md).

## Main Entry Points

| Area | Path | Purpose |
| --- | --- | --- |
| Orchestrator | [`openclawd-stack/`](./openclawd-stack/) | Runtime coordination, wallets, MCP, services |
| Router | [`clawdrouter/`](./clawdrouter/) | Model routing and payment-aware inference |
| Agent Catalog | [`AGENTS/`](./AGENTS/) | Agent metadata, catalog generation, docs |
| Skills | [`skills/`](./skills/) | Bundled `SKILL.md` capabilities |
| Shared Packages | [`packages/`](./packages/) | Wallet, payments, CLI-adjacent libraries |
| Workers | [`workers/`](./workers/) | Cloudflare edge services |
| Browser Surface | [`chrome-extension/`](./chrome-extension/) | OpenClawd browser integration |
| Web Surface | [`tailclawd/`](./tailclawd/) | Browser-accessible terminal-style UI |
| Docs | [`docs/articles/`](./docs/articles/) | Deep architecture and feature docs |

## Security and Public Release Hygiene

OpenClawd is meant to be forked publicly, so the repo treats release hygiene as part of the build:

```bash
# Bootstrap sanity checks
npm run doctor

# Public-release checks: docs, tracked file hygiene, likely secret patterns
npm run release:check
```

Before opening a PR or publishing a fork:

- keep real credentials out of git
- use `.env.example` files as templates only
- rotate any leaked key before rewriting git history
- review [SECURITY.md](./SECURITY.md) for disclosure guidance

## Docs

- Start here: [ONBOARDING.md](./ONBOARDING.md)
- Contribution flow: [CONTRIBUTING.md](./CONTRIBUTING.md)
- Security policy: [SECURITY.md](./SECURITY.md)
- Stack map: [STACK.md](./STACK.md)
- Integration notes: [INTEGRATION_STRATEGY.md](./INTEGRATION_STRATEGY.md)
- Install snippets: [INSTALL_SNIPPETS.md](./INSTALL_SNIPPETS.md)

## Community

- Website: [solanaclawd.com](https://solanaclawd.com)
- Agent hub: [hub.solanaclawd.com](https://hub.solanaclawd.com)
- X: [@clawddevs](https://x.com/clawddevs)
- Telegram: [t.me/clawdtoken](https://t.me/clawdtoken)

## License

MIT. See [LICENSE.md](./LICENSE.md).
