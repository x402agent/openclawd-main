<div align="center">

# 🦞 OpenClawd 🦞

### *“Claws that code, brains that deploy.”*

**A red-shelled, Solana-native AI agent stack — routing, orchestration, payments, skills, MCP, browser automation, and local or hosted inference.**

[![🦞 $CLAWD](https://img.shields.io/badge/%F0%9F%A6%9E%20%24CLAWD-Buy%20on%20Jupiter-FF3B30?style=for-the-badge)](https://jup.ag/swap/SOL-8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
[![Site](https://img.shields.io/badge/site-solanaclawd.com-FF6B35?style=for-the-badge&logo=safari&logoColor=white)](https://solanaclawd.com)
[![GitHub](https://img.shields.io/badge/GitHub-x402agent%2Fsolana--clawd-E63946?style=for-the-badge&logo=github&logoColor=white)](https://github.com/x402agent/solana-clawd)
[![Telegram](https://img.shields.io/badge/Telegram-%40clawdtoken-D62828?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/clawdtoken)
[![X clawddevs](https://img.shields.io/badge/X-%40clawddevs-FB6F92?style=for-the-badge&logo=x&logoColor=white)](https://x.com/clawddevs)
[![X 0rdlibrary](https://img.shields.io/badge/X-%400rdlibrary-FFB4A2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/0rdlibrary)

[![License: MIT](https://img.shields.io/badge/License-MIT-FF1744?style=for-the-badge)](./LICENSE.md)
[![Node](https://img.shields.io/badge/Node-20%2B-FF5252?style=for-the-badge&logo=node.js&logoColor=white)](./.nvmrc)
[![Solana](https://img.shields.io/badge/Solana-native-14F195?style=for-the-badge&logo=solana&logoColor=black)](https://solana.com)
[![MCP](https://img.shields.io/badge/MCP-compatible-FF8C42?style=for-the-badge)](https://modelcontextprotocol.io)

</div>

```
                              🦞  $CLAWD  🦞
   ╭────────────────────────────────────────────────────────────────╮
   │                                                                │
   │    ██████╗██╗      █████╗ ██╗    ██╗██████╗                    │
   │   ██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗                   │
   │   ██║     ██║     ███████║██║ █╗ ██║██║  ██║                   │
   │   ██║     ██║     ██╔══██║██║███╗██║██║  ██║                   │
   │   ╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝                   │
   │    ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝                    │
   │                                                                │
   │          ◢█◣   red shell · sharp claws · on-chain   ◢█◣        │
   ╰────────────────────────────────────────────────────────────────╯
                           🦀  forged on Solana  🦀
```

## ⛓️ Solana Attestation Service (SAS) — NEW

**Formally verified skills and agents on-chain via QEDGen Lean 4 proofs and Hermès vault protocol.**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Solana Attestation Service                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Credential │  │   Schema    │  │ Attestation │                 │
│  │  (Issuer)   │  │  (Structure)│  │  (Proof)    │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│         │                │                │                          │
│         └────────────────┴────────────────┘                          │
│                           │                                          │
│    ┌─────────────────────┼─────────────────────┐                  │
│    │                     │                     │                    │
│    ▼                     ▼                     ▼                    │
│ ┌──────────┐      ┌──────────┐         ┌──────────┐               │
│ │  Skill   │      │  Agent   │         │  Vault   │               │
│ │Attestation│     │ Identity │         │Integration│              │
│ └──────────┘      └──────────┘         └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Program Addresses

| Component | Address |
| --- | --- |
| **SAS Program ID** | `22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG` |
| Token Program (Token-2022) | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Event Authority PDA | `DzSpKpST2TSyrxokMXchFz3G2yn5WEGoxzpGEUDjCX4g` |

### Verification Pipeline

```
Agent → QEDGen → Lean 4 Proof → proof_hash → SAS Attestation → On-chain
```

1. Agent requests formal verification via QEDGen
2. QEDGen generates Lean 4 proofs for skill capabilities
3. Proof compilation produces `proof_hash`
4. Attestation created with `proof_hash` and stored on-chain
5. Any party can verify attestation trustlessly

### Key Components

| Component | Path |
| --- | --- |
| Attestation Program | [`solana-attestation-service-master/`](./solana-attestation-service-master/) |
| SAS Skill | [`skills/solana-attestation-skill/`](./skills/solana-attestation-skill/) |
| Attested Agent Template | [`AGENTS/agent-template-attested.json`](./AGENTS/agent-template-attested.json) |
| Attested Plugin Template | [`plugin.delivery/plugin-template-attested.json`](./plugin.delivery/plugin-template-attested.json) |
| CLI Attestation Commands | [`CLI/clawd-cli.sh`](./CLI/clawd-cli.sh) (run `./clawd-cli.sh attest:status`) |

### CLI Usage

```bash
# Create skill attestation
./CLI/clawd-cli.sh attest:skill --skill qedgen-solana --verifier QEDGenVault

# Verify attestation
./CLI/clawd-cli.sh attest:verify --address 7xK9...mP2

# Create agent identity with vault
./CLI/clawd-cli.sh attest:agent --agent my-agent --wallet A123...xyz

# Initialize vault
./CLI/clawd-cli.sh attest:vault --agent my-agent --wallet A123...xyz
```

### Agent Wallet at Birth

Agents are born with vault-protected wallets via **Hermès Vault Protocol**:
- Wallet created at agent birth
- Initialized in Hermès vault immediately
- Multi-signature required for vault operations
- Emergency recovery via vault protocol

```typescript
// Agent Identity Schema
{
  layout: [12, 32, 12, 32, 1],  // String, Pubkey, String, Pubkey, Bool
  field_names: [
    "agent_id",
    "wallet_pubkey",
    "skill_attestation",
    "vault_address",
    "is_vault_initialized"
  ]
}
```

---

> 🦞 **$CLAWD CA:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
> 🌐 [solanaclawd.com](https://solanaclawd.com) · 🐙 [github.com/x402agent/solana-clawd](https://github.com/x402agent/solana-clawd) · 💬 [t.me/clawdtoken](https://t.me/clawdtoken) · 🐦 [@clawddevs](https://x.com/clawddevs) · 📚 [@0rdlibrary](https://x.com/0rdlibrary)

OpenClawd is the public monorepo behind the 🦞 Clawd ecosystem — an orchestrator, model router, wallet tooling, x402/AP2 payment rails, MCP servers, browser surfaces, package libraries, edge workers, and a large checked-in skill and agent catalog so teams can fork one repo and ship chain-native AI products quickly.

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
- **⛓️ Solana Attestation Service (SAS)** in [`skills/solana-attestation-skill/`](./skills/solana-attestation-skill/) enables formally verified, on-chain attestations for skills via QEDGen Lean 4 proofs.
- **Formally Verified Skills** integrate QEDGen formal verification with on-chain attestation storage using the Solana Attestation Service program.
- **Metaplex Agent Integration** with vault-protected wallets at birth - agents mint as MPL Core NFTs with attestation metadata.
- **Hermès Vault Protocol** - agent wallets are initialized in vault custody at birth for secure multi-signature operations.

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
| Solana Attestation Service | [`solana-attestation-service-master/`](./solana-attestation-service-master/) | On-chain attestation program with Pinocchio framework |
| Formal Verification | [`skills/solana-formal-verification/`](./skills/solana-formal-verification/) | QEDGen Lean 4 proof generation for Solana programs |
| Attested Skills | [`skills/solana-attestation-skill/`](./skills/solana-attestation-skill/) | SAS integration for formally verified skill attestations |
| Attested Agents | [`AGENTS/agent-template-attested.json`](./AGENTS/agent-template-attested.json) | Agent template with on-chain attestation and vault integration |
| Attested Plugins | [`plugin.delivery/plugin-template-attested.json`](./plugin.delivery/plugin-template-attested.json) | Plugin template with SAS verification |

## Docs by Theme

| Theme | Docs |
| --- | --- |
| Onboarding | [ONBOARDING.md](./ONBOARDING.md), [CONTRIBUTING.md](./CONTRIBUTING.md), [SUPPORT.md](./SUPPORT.md) |
| Architecture | [STACK.md](./STACK.md), [architecture.md](./docs/articles/architecture.md), [INTEGRATION_STRATEGY.md](./INTEGRATION_STRATEGY.md) |
| Payments and monetization | [ARTICLE_PAYMENTS.md](./docs/articles/ARTICLE_PAYMENTS.md), [monetize-agents-openclawd.md](./docs/articles/monetize-agents-openclawd.md), [ARTICLE_MARKET.md](./docs/articles/ARTICLE_MARKET.md) |
| Local and routed AI | [ARTICLE_LOCAL_AI.md](./docs/articles/ARTICLE_LOCAL_AI.md), [CLAWD_ROUTER_TUNNEL.md](./docs/articles/CLAWD_ROUTER_TUNNEL.md), [CLAWD_ROUTER.md](./docs/articles/CLAWD_ROUTER.md) |
| Research and memory | [AUTO_RESEARCH_AGENTS.md](./docs/articles/AUTO_RESEARCH_AGENTS.md), [agent-bus.md](./docs/articles/agent-bus.md) |
| Security | [SECURITY.md](./SECURITY.md), [SECURITY_VAULT_INTEGRATION.md](./SECURITY_VAULT_INTEGRATION.md), [permissions-sandboxing.md](./docs/articles/permissions-sandboxing.md) |

## ⛓️ Solana Attestation Service

The Solana Attestation Service (SAS) enables formally verified, on-chain attestations for skills and agents through integration with QEDGen Lean 4 proofs and the Hermès vault protocol.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Solana Attestation Service                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Credential │  │   Schema    │  │ Attestation │                 │
│  │  (Issuer)   │  │  (Structure)│  │  (Proof)    │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│         │                │                │                          │
│         └────────────────┴────────────────┘                          │
│                           │                                          │
│    ┌─────────────────────┼─────────────────────┐                  │
│    │                     │                     │                    │
│    ▼                     ▼                     ▼                    │
│ ┌──────────┐      ┌──────────┐         ┌──────────┐               │
│ │  Skill   │      │  Agent   │         │  Vault   │               │
│ │Attestation│     │ Identity │         │Integration│              │
│ └──────────┘      └──────────┘         └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Program Addresses

| Component | Address |
| --- | --- |
| SAS Program ID | `22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG` |
| Token Program (Token-2022) | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Event Authority PDA | `DzSpKpST2TSyrxokMXchFz3G2yn5WEGoxzpGEUDjCX4g` |

### Skill Attestation Schema

```typescript
{
  layout: [12, 32, 12, 8, 1],  // String, Pubkey, String, U64, Bool
  field_names: [
    "skill_id",
    "verifier_pubkey",
    "proof_hash",
    "verification_timestamp",
    "is_formally_verified"
  ]
}
```

### Agent Identity Schema

```typescript
{
  layout: [12, 32, 12, 32, 1],  // String, Pubkey, String, Pubkey, Bool
  field_names: [
    "agent_id",
    "wallet_pubkey",
    "skill_attestation",
    "vault_address",
    "is_vault_initialized"
  ]
}
```

### Verification Pipeline

1. Agent requests formal verification via QEDGen
2. QEDGen generates Lean 4 proofs for skill capabilities
3. Proof compilation produces `proof_hash`
4. Agent creates attestation with `proof_hash`
5. Attestation stored on-chain via SAS program
6. Attestation verified by any party trustlessly

### Key Components

| Component | Path | Description |
| --- | --- | --- |
| Attestation Program | [`solana-attestation-service-master/`](./solana-attestation-service-master/) | Pinocchio-based Solana program for on-chain attestations |
| Cereal Macro | [`solana-attestation-service-master/cereal_macro/`](./solana-attestation-service-master/cereal_macro/) | Procedural macro for schema serialization |
| Core Types | [`solana-attestation-service-master/core/`](./solana-attestation-service-master/core/) | Shared types and schema definitions |
| SAS Skill | [`skills/solana-attestation-skill/`](./skills/solana-attestation-skill/) | Agent skill for attestation operations |
| Attested Agent Template | [`AGENTS/agent-template-attested.json`](./AGENTS/agent-template-attested.json) | Agent template with vault and attestation |
| Attested Plugin Template | [`plugin.delivery/plugin-template-attested.json`](./plugin.delivery/plugin-template-attested.json) | Plugin template with SAS verification |

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
