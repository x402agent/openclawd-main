# OpenClawd Stack Map

> Technical map for the current monorepo checkout.

This file explains how the major directories in this repo fit together. It is intentionally stricter than the root [README.md](./README.md): it focuses on directories that are actually present in this checkout and avoids product copy that tends to drift.

The shared flow is:

**Surface -> Router -> Runtime -> Skills -> Settlement -> Chain**

---

## 1. Stack at a glance

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
│ plugin.delivery                                              │
└────────────────────────────┬─────────────────────────────────┘
                              │ model routing + payment checks
┌────────────────────────────▼─────────────────────────────────┐
│ Runtime                                                      │
│ src · solana-clawd · agents · MCP · packages                 │
│ openclawd-stack · clawd-cloud-os · CLI                       │
└────────────────────────────┬─────────────────────────────────┘
                              │ skills, registry, docs
┌────────────────────────────▼─────────────────────────────────┐
│ Skills and knowledge                                         │
│ clawdhub · skills · acp_registry · articles · llm-wiki-tang  │
└────────────────────────────┬─────────────────────────────────┘
                              │ signed Solana actions
┌────────────────────────────▼─────────────────────────────────┐
│ Chain                                                        │
│ Solana · Helius RPC · Jupiter · SPL USDC · $CLAWD            │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ 🐾 Security (ClawdVault)                                      │
│ hermes-vault (services/) · clawd-vault (skills/)             │
│ vault-mcp (MCP/) · vault-agent (agents/)                     │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Layer-to-directory map

| Layer | Directory | Role |
|---|---|---|
| Surface | [`chrome-extension/`](./chrome-extension/) | Browser-side surface and page-agent bridge |
| Surface | [`telegram/`](./telegram/) | Telegram bot surface |
| Surface | [`tailclawd/`](./tailclawd/) | Browser-hosted Clawd Code over Tailscale |
| Surface | [`WatchApp/`](./WatchApp/) | watchOS-facing app |
| Surface | [`beepboop/`](./beepboop/) | macOS companion surface |
| Surface | [`chess/`](./chess/) | Wallet-signed chess surface |
| Surface | [`moltbook-agent/`](./moltbook-agent/) | Educational surface |
| Surface | [`examples/`](./examples/) | Reference clients and demos |
| Router | [`clawdrouter/`](./clawdrouter/) | 57-model router and local scoring layer |
| Router | [`x402-openrouter-main/`](./x402-openrouter-main/) | Solana-native x402 facilitator and payment gateway |
| Router | [`workers/`](./workers/) | Cloudflare worker deployments |
| Router | [`services/`](./services/) | Backend services and support processes |
| Router | [`plugin.delivery/`](./plugin.delivery/) | Paid plugin and package delivery flow |
| Runtime | [`src/`](./src/) | Core TypeScript engine |
| Runtime | [`solana-clawd/`](./solana-clawd/) | Go plus TypeScript Solana agent framework |
| Runtime | [`agents/`](./agents/) | Agent catalog and deploy-oriented assets |
| Runtime | [`MCP/`](./MCP/) | MCP servers |
| Runtime | [`packages/`](./packages/) | Shared npm packages, including wallet components |
| Runtime | [`openclawd-stack/`](./openclawd-stack/) | Browser and sandbox runtime stack |
| Runtime | [`clawd-cloud-os/`](./clawd-cloud-os/) | Browser-terminal cloud OS surface |
| Runtime | [`CLI/`](./CLI/) | CLI-related code and docs |
| Skills | [`clawdhub/`](./clawdhub/) | Marketplace, search, publish, and install flows |
| Skills | [`skills/`](./skills/) | Bundled `SKILL.md` library |
| Skills | [`acp_registry/`](./acp_registry/) | Registry JSON and metadata |
| Skills | [`articles/`](./articles/) | Longer-form docs and reference material |
| Skills | [`llm-wiki-tang/`](./llm-wiki-tang/) | Knowledge-base and indexing layer |
| Chain | [`solana-go-main/`](./solana-go-main/) | Go Solana SDK support code |
| Chain | [`API/`](./API/) | Protocol and external API references |
| Assets | [`gfx/`](./gfx/) | Visual assets |
| Assets | [`npm/`](./npm/) | npm installer and packaging helpers |
| Security | [`skills/clawd-vault/`](./skills/clawd-vault/) | Security vault skill (Hermes Vault port) |
| Security | [`MCP/vault-mcp/`](./MCP/vault-mcp/) | MCP server for vault tools |
| Security | [`agents/vault-agent.json`](./agents/vault-agent.json) | Vault guardian agent config |
| Security | [`services/hermes-vault/`](./services/hermes-vault/) | Hermes Vault Python backend (symlink) |
| Registrar | [`api-registrar/`](./api-registrar/) | X-verified API key registration service |
| Monetization | [`skills/wurk-integration/`](./skills/wurk-integration/) | WURK skill for job monetization |
| Monetization | [`MCP/wurk-mcp/`](./MCP/wurk-mcp/) | WURK MCP server for x402 payments |

### Notes

- [`tailclawd-backup/`](./tailclawd-backup/) is present in the repo but should be treated as backup or legacy material, not a primary stack layer.
- This file only maps directories that exist in this checkout. Hosted services and historical components may be referenced elsewhere, but they are intentionally not modeled here unless they have code in-tree.

---

## 3. Request flow

```text
user request
  -> surface
  -> clawdrouter
  -> runtime or agent
  -> skills and registry lookup
  -> Solana reads or signed actions
  -> payment verification and settlement
  -> response back to the surface
```

### Example path

```text
telegram or chrome-extension
  -> clawdrouter
  -> agents or solana-clawd runtime
  -> MCP tools + SKILL.md guidance
  -> Jupiter / Helius / Solana RPC
  -> x402 settlement where required
```

---

## 4. Model routing

ClawdRouter is the intended model entry point for the stack.

- Registry: [`clawdrouter/src/models/registry.ts`](./clawdrouter/src/models/registry.ts)
- OpenRouter mappings: [`clawdrouter/src/upstream/openrouter.ts`](./clawdrouter/src/upstream/openrouter.ts)
- Moonshot mappings: [`clawdrouter/src/upstream/moonshot.ts`](./clawdrouter/src/upstream/moonshot.ts)

The local model registry currently contains **57** models.

### Notable defaults in this repo

| Purpose | Model |
|---|---|
| Reasoning default | `xai/grok-4.20-beta` |
| Long-context default | `moonshot/kimi-k2.6` |
| Example premium coding route | `openai/gpt-5.3-codex` |
| Example premium reasoning route | `anthropic/claude-sonnet-4.6` |

### Environment-driven defaults

The repo-wide defaults are defined in [`.env.example`](./.env.example):

- `CLAWDROUTER_DEFAULT_SIMPLE`
- `CLAWDROUTER_DEFAULT_MEDIUM`
- `CLAWDROUTER_DEFAULT_COMPLEX`
- `CLAWDROUTER_DEFAULT_REASONING`
- `CLAWDROUTER_DEFAULT_LONGCTX`

If those values change, prefer updating `.env.example` and the router registry rather than copying model tables across multiple docs.

---

## 5. Payment and settlement path

The billing path is centered on Solana settlement.

| Component | Responsibility |
|---|---|
| [`clawdrouter/`](./clawdrouter/) | model routing, provider abstraction, payment-aware request flow |
| [`x402-openrouter-main/`](./x402-openrouter-main/) | x402 facilitator and Solana-native payment handling |
| [`workers/`](./workers/) | edge deployments and gateway entry points |
| [`services/`](./services/) | supporting processes for gateway-oriented behavior |

Protocols referenced in the repo:

- `x402`
- `MPP`
- `AP2`
- `A2A`

Core payment docs:

- [articles/ARTICLE_PAYMENTS.md](./articles/ARTICLE_PAYMENTS.md)
- [articles/x402-proxy-worker.md](./articles/x402-proxy-worker.md)
- [clawdrouter/README.md](./clawdrouter/README.md)

---

## 6. Skills and agent layer

The skills and agent system spans several directories:

| Directory | Purpose |
|---|---|
| [`skills/`](./skills/) | checked-in skill bundles |
| [`clawdhub/`](./clawdhub/) | search, install, publish, and marketplace flows |
| [`agents/`](./agents/) | 50-agent catalog and agent metadata |
| [`acp_registry/`](./acp_registry/) | registry JSON for agent discovery |

Primary references:

- [agents/README.md](./agents/README.md)
- [skills/README.md](./skills/README.md)
- [articles/AGENT_GUIDE.md](./articles/AGENT_GUIDE.md)
- [articles/ARTICLE_SKILLS.md](./articles/ARTICLE_SKILLS.md)

---

## 7. Environment contract

The shared env surface lives in [`.env.example`](./.env.example).

### Router and model keys

- `OPENROUTER_API_KEY`
- `CLAWDROUTER_BASE_URL`
- `CLAWDROUTER_API_KEY`
- `XAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `MOONSHOT_API_KEY`

### Runtime and sandboxing

- `E2B_API_KEY`
- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `HONCHO_URL`
- `HONCHO_API_KEY`

### Solana and data providers

- `HELIUS_API_KEY`
- `HELIUS_RPC_URL`
- `SOLANA_RPC_URL`
- `SOLANA_CLAWD_BASE_URL`
- `CLAWD_MINT`
- `BIRDEYE_API_KEY`
- `JUPITER_API_KEY`
- `SOLANA_TRACKER_KEY`
- `DFLOW_API_KEY`

### Surface-specific keys

- `TELEGRAM_BOT_TOKEN`
- `TAILSCALE_AUTH_KEY`

### Subproject env examples

- [`openclawd-stack/.env.example`](./openclawd-stack/.env.example)
- [`openclawd-stack/orchestrator/.env.example`](./openclawd-stack/orchestrator/.env.example)
- [`openclawd-stack/bridge/.env.example`](./openclawd-stack/bridge/.env.example)
- [`llm-wiki-tang/.env.example`](./llm-wiki-tang/.env.example)
- [`clawd-cloud-os/.env.example`](./clawd-cloud-os/.env.example)

---

## 8. How to read the repo

Use the docs in this order:

1. [README.md](./README.md) for product-level orientation.
2. This file for layer and directory mapping.
3. [articles/architecture.md](./articles/architecture.md) for deeper architecture notes.
4. Component READMEs such as [clawdrouter/README.md](./clawdrouter/README.md), [solana-clawd/README.md](./solana-clawd/README.md), [packages/clawd-wallet/README.md](./packages/clawd-wallet/README.md), and [tailclawd/README.md](./tailclawd/README.md).

---

## 9. High-signal entry points

- Product overview: [README.md](./README.md)
- Architecture article: [articles/architecture.md](./articles/architecture.md)
- Models: [articles/MODELS.md](./articles/MODELS.md)
- Payments: [articles/ARTICLE_PAYMENTS.md](./articles/ARTICLE_PAYMENTS.md)
- Agents: [agents/README.md](./agents/README.md)
- Skills: [skills/README.md](./skills/README.md)
- Router: [clawdrouter/README.md](./clawdrouter/README.md)
- Wallet: [packages/clawd-wallet/README.md](./packages/clawd-wallet/README.md)
- TailClawd: [tailclawd/README.md](./tailclawd/README.md)

---

## 10. Maintenance rule

When the repo changes, update this file to reflect:

- directories that actually exist
- the current shared env contract
- the current request path

Do not use this file as a product landing page. Keep it operational and structural.
