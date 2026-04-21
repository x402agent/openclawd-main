# OpenClawd — The Unified Stack

> One cohesive Solana AI agent stack. Every directory in this monorepo is a layer in a single pipeline: **Surface → Router → Runtime → Skills → Settlement → Chain**.

This document is the single source of truth for how all 33 projects fit together, what role each plays, and which models power each layer.

---

## 1. Stack at a Glance

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
                                     │ model routing + x402 settle
┌────────────────────────────────────▼─────────────────────────────────┐
│  RUNTIME                                                             │
│  src (engine) · agents (50) · MCP · openclawd-stack · CLI            │
│  clawd-cloud-os · API                                                │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │ SKILL.md · agent.json
┌────────────────────────────────────▼─────────────────────────────────┐
│  SKILLS + REGISTRY                                                   │
│  clawdhub · skills (100) · acp_registry · articles · llm-wiki-tang   │
└────────────────────────────────────┬─────────────────────────────────┘
                                     │ signed txns
┌────────────────────────────────────▼─────────────────────────────────┐
│  CHAIN                                                               │
│  solana-clawd · solana-go-main · gfx · packages · npm                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layers → Directories

| Layer | Directory | Role |
|-------|-----------|------|
| **Surface** | `chrome-extension/` | Browser-side page agent + MCP bridge |
| | `beepboop/` | macOS menu-bar companion (voice/vision/claw pointer) |
| | `WatchApp/` | watchOS wallet-state app |
| | `tailclawd/` + `tailclawd-backup/` | Claude Code in a browser via Tailscale |
| | `telegram/` | Telegram bot surface |
| | `x-bot/` | Twitter/X bot surface |
| | `bots/` | Pump.fun sniper + mayhem trader bots |
| | `chess/` | Wallet-signed chess hub |
| | `moltbook-agent/` | Educational agent surface |
| | `examples/` | Reference clients |
| **Gateway** | `clawdrouter/` | **Model router** — 57 models, 15-dim scoring, x402/MPP/AP2/A2A |
| | `x402-openrouter-main/` | Native x402 facilitator for Solana |
| | `workers/` | Cloudflare edge workers (agent-wallet, email, pumpfun-mcp) |
| | `plugin.delivery/` | Paid skill/plugin delivery |
| | `services/` | Gateway, bridge, monitoring |
| | `websocket-server/` | Real-time streams |
| **Runtime** | `src/` | Core TypeScript engine (commands, tools, memory, bridge) |
| | `agents/` | 50 production AI agents (MCP + REST) |
| | `MCP/` | Model Context Protocol servers |
| | `openclawd-stack/` | OpenShell + E2B + nemoClawd + Privy wallet runtime |
| | `CLI/` | `clawd` command-line |
| | `clawd-cloud-os/` | Browser-terminal cloud OS |
| | `API/` | BDS + Pump.fun API specs |
| **Skills** | `clawdhub/` | ClawdHub marketplace (search, publish, install) |
| | `skills/` | 100 bundled `SKILL.md` files |
| | `acp_registry/` | Project registry JSON |
| | `articles/` | 42 docs (architecture, payments, models, SEO) |
| | `llm-wiki-tang/` | Vector-indexed knowledge base |
| **Chain** | `solana-clawd/` | Go + TS agent framework with OODA loop |
| | `solana-go-main/` | Solana Go SDK |
| | `gfx/` | Visualizations / graphics |
| | `packages/` | Shared npm packages |
| | `npm/` | CLI installers |

Every request flows top-to-bottom. Every payment + on-chain effect flows bottom-up.

---

## 3. The One Request Flow

```
user @ chrome-extension
   │   "screen for rugs in this token"
   ▼
clawdrouter  ← picks model via 15-dim scorer, checks x402 payment
   │
   ├─→ xai/grok-4.20-beta           (default reasoning, 256K ctx, Solana-aware)
   ├─→ moonshot/kimi-k2.6            (long-context agentic tool use, 320K ctx)
   ├─→ anthropic/claude-sonnet-4.6   (deep audits, premium tier)
   ▼
agents / solana-clawd runtime  ← OODA loop, 31 MCP tools
   │
   ▼
skills (SKILL.md)  ← e.g. pumpfun-analytics, rug-screener
   │
   ▼
solana-clawd + solana-go-main  ← on-chain reads + signed txs
   │
   ▼
x402 settle  ← 70% owner / 15% $CLAWD buyback / 10% treasury / 5% operator
```

---

## 4. Unified Model Strategy

ClawdRouter is the **only** model entry point. Every surface (Chrome, Telegram, Watch, TailClawd, Beepboop, WatchApp, chess, bots) goes through it. The registry lives in [`clawdrouter/src/models/registry.ts`](clawdrouter/src/models/registry.ts).

### Default tier routing

| Tier | Eco | Auto | Premium |
|------|-----|------|---------|
| `SIMPLE` | `nvidia/gpt-oss-120b` (free) | `google/gemini-2.5-flash` | `nvidia/kimi-k2.5` |
| `MEDIUM` | `google/gemini-2.5-flash-lite` | `nvidia/kimi-k2.5` | `openai/gpt-5.3-codex` |
| `COMPLEX` | `google/gemini-2.5-flash-lite` | `google/gemini-3.1-pro` | `anthropic/claude-opus-4.6` |
| `REASONING` | `xai/grok-4-1-fast` | **`xai/grok-4.20-beta`** 🆕 | `anthropic/claude-sonnet-4.6` |

### 🆕 Newly added flagship models

| Model | ID | Context | Strengths | Tier |
|-------|-----|---------|-----------|------|
| **Grok 4.20 Beta** | `xai/grok-4.20-beta` | 256K | Solana-aware, reasoning+vision+agentic+tools, fast | budget → auto reasoning default |
| **Kimi K2.6** | `moonshot/kimi-k2.6` | 320K | Agentic tool-use, long-context code + audit, multimodal | budget → agentic workflows |

Both are available through the standard aliases:

```bash
# Grok 4.20 Beta
clawd chat --model grok          # → xai/grok-4.20-beta
clawd chat --model grok-4.20
clawd chat --model grok-beta

# Kimi K2.6
clawd chat --model kimi          # → moonshot/kimi-k2.6
clawd chat --model kimi-k2
clawd chat --model kimi-k2.6
```

OpenRouter upstream IDs are wired in [`clawdrouter/src/upstream/openrouter.ts`](clawdrouter/src/upstream/openrouter.ts):
- `xai/grok-4.20-beta` → `x-ai/grok-4.20-beta`
- `moonshot/kimi-k2.6` → `moonshotai/kimi-k2.6-instruct`

### NemoClawd + ClawdHub Godmode

Both downstream consumers now default to the new models:

- `openclawd-stack/NemoClawd-main/Pump-Fun/lair-tg` → `OPENROUTER_MODEL=x-ai/grok-4.20-beta`
- `clawdhub/server/routes/api/godmode/chat.post.ts` ultraplinian race includes **Grok 4.20 Beta** and **Kimi K2.6** in the fast tier.

---

## 5. Single Environment Contract

Every component reads the same env surface:

```bash
# ── Gateway / Router ────────────────────────────
OPENROUTER_API_KEY=       # clawdrouter, clawdhub godmode, nemoclawd
OPENROUTER_MODEL=x-ai/grok-4.20-beta  # default for pass-through callers
CLAWD_API=https://solanaclawd.com/api
GATEWAY=https://solanaclawd.com/x402

# ── Chain ───────────────────────────────────────
HELIUS_API_KEY=
HELIUS_RPC_URL=https://mainnet.helius-rpc.com
SOLANA_PRIVATE_KEY=
PRIVY_APP_ID=

# ── AI (fallbacks) ──────────────────────────────
XAI_API_KEY=              # direct xAI for grok-4.20-beta
ANTHROPIC_API_KEY=        # direct Anthropic
MOONSHOT_API_KEY=         # direct Kimi

# ── Infra ───────────────────────────────────────
TAILSCALE_AUTH_KEY=
E2B_API_KEY=
```

---

## 6. Single Quick Start (whole stack)

```bash
git clone https://github.com/x402agent/openclawd.git
cd openclawd

# 1. Core env
cp .env.example .env  # fill OPENROUTER_API_KEY, HELIUS_API_KEY, etc.

# 2. Install router (models + x402 gateway)
cd clawdrouter && pnpm install && pnpm build && cd ..

# 3. Install Solana runtime (OODA + MCP)
cd solana-clawd && make install && cd ..

# 4. Install ClawdHub + skills
npx clawdhub install pumpfun-trading solana-clawd swarm-orchestrator

# 5. Launch the stack
clawd daemon                  # solana-clawd runtime
pnpm --filter clawdrouter dev # model router on :8787
pnpm --filter clawdhub dev    # marketplace on :3000
```

Any surface (Chrome, Telegram, Watch, etc.) points at `http://localhost:8787` (or `https://solanaclawd.com/x402`) and the whole stack is live.

---

## 7. Where to go next

- Full architecture: [`articles/architecture.md`](articles/architecture.md)
- Model tuning: [`articles/MODELS.md`](articles/MODELS.md)
- Payments: [`articles/ARTICLE_PAYMENTS.md`](articles/ARTICLE_PAYMENTS.md)
- Skills: [`skills/README.md`](skills/README.md)
- x402 integration: [`articles/x402-proxy-worker.md`](articles/x402-proxy-worker.md)
- Registry: [`acp_registry/registry.json`](acp_registry/registry.json)

---

**One monorepo. One router. One settlement layer. Grok 4.20 Beta + Kimi K2.6 added. All 33 projects, one stack.**
