# 🦞 OpenClawd Workers

Edge worker implementations for the OpenClawd ecosystem — deployed on Cloudflare Workers.

All workers are TypeScript, use Hono or raw `fetch`, and integrate with the OpenClawd gateway, vault, and agent registry.

---

## 🤖 openai-trading-bot

**GPT-5.4 Responses API trading agent with Telegram interface.**

- Dual-model routing: `gpt-5.4` (trading) + `gpt-5.4-nano` (fast chat)
- Built-in web_search tool via Responses API
- 5 trading tools: `execute_swap`, `get_token_analysis`, `get_trending`, `get_wallet_status`, `generate_image`
- Image generation with `gpt-image-1` (GPT Image 2.0) + `gpt-image-1-mini` fallback
- KV-backed conversation memory with `previous_response_id` chaining
- Owner-gated Telegram access with `/assign` + `/revoke`

Commands: `/start`, `/generate`, `/search`, `/trending`, `/trade`, `/pnl`

```bash
cd workers/openai-trading-bot
npm install
wrangler deploy
```

---

## 💼 agent-wallet

**OpenClawd Agent Wallet — deployable agentic wallet vault on the edge.**

- AES-256-GCM encrypted keys in KV (Web Crypto API, no external crypto libs)
- Solana (tweetnacl + raw JSON-RPC) + EVM (Ethereum, Base, Arbitrum, Optimism, Polygon, BSC)
- Privy managed wallet proxy for delegated custody
- E2B sandbox deployment for ephemeral agent runners
- Pause / unpause kill-switch per wallet
- Sign + transfer routes, balance queries across chains

```bash
cd workers/agent-wallet
npm install
wrangler deploy
```

Endpoints: `POST /v1/wallets`, `GET /v1/wallets/:id/balance`, `POST /v1/wallets/:id/transfer`, `POST /v1/wallets/:id/sign`, `POST /v1/wallets/:id/pause`

---

## 📧 email-worker

**Clawd Email Worker — handles `clawd@solanaclawd.com` inbox.**

- Forwards every email to the configured owner address
- AI auto-reply via Claude (contextual, no boilerplate)
- Subaddressing: `clawd+noreply@` (no reply), `clawd+drop@` (silent drop), `clawd+*@` (forward + reply)
- Optional Discord/Slack webhook ping on new mail

```bash
cd workers/email-worker
npm install
wrangler deploy
```

Cloudflare Email Routing sends inbound mail via the `email` handler; outbound replies use the `send_email` binding.

---

## 📦 install-worker

**solanaclawd-install — serves `https://solanaclawd.com/install.sh`.**

- One-shot installer for the entire OpenClawd stack
- Installer body embedded in the worker (works with private repos)
- Deployed at custom domain `solanaclawd.com/install.sh`

```bash
curl -sSf https://solanaclawd.com/install.sh | bash
```

Pair with the `sync.mjs` script to keep the embedded `install-script.ts` in sync with the repo's top-level `install.sh`.

---

## 🔥 pumpfun-mcp-worker

**OpenClawd Remote MCP server for pump.fun token scanning.**

- Exposes MCP tools via Streamable HTTP at `POST /mcp`
- Cron Trigger runs every 15 minutes for automated scans
- Stores scan results in KV, pushes live data to Convex
- Sends Telegram digests + auto-generates tweet threads
- Blocklist filtering (rugs, scams, flagged deployers)
- Dashboard at `GET /` (HTML)

```bash
cd workers/pumpfun-mcp-worker
npm install
wrangler deploy
```

Tools exposed over MCP: `scan_pumpfun`, `get_trending`, `get_blocklist`, `generate_pump_md`.

---

## 🚀 Deployment

Each worker has its own `wrangler.toml` — deploy individually:

```bash
cd workers/<worker-name>
npx wrangler deploy
```

Or deploy all at once:

```bash
for w in workers/*/; do
  [ -f "$w/wrangler.toml" ] && (cd "$w" && npx wrangler deploy)
done
```

## 🔑 Environment Variables

Each worker's `wrangler.toml` lists the required secrets. Common bindings:

- `OPENAI_API_KEY` — OpenAI Responses API
- `TELEGRAM_BOT_TOKEN` — Telegram bot token
- `GATEWAY_URL` — OpenClawd gateway URL (defaults to sandbox URL)
- `OWNER_CHAT_ID` — Privileged Telegram chat ID
- `VAULT_PASSPHRASE` — AES-256-GCM key derivation passphrase (agent-wallet)
- `PRIVY_APP_ID` / `PRIVY_APP_SECRET` — Privy managed wallets
- `E2B_API_KEY` — E2B sandbox deployment

Set via:

```bash
wrangler secret put OPENAI_API_KEY
```

---

## 🧩 Integration with the OpenClawd Gateway

All workers can route Solana/tool queries back to the OpenClawd gateway at `GATEWAY_URL/v1/brain/ask` — the gateway dispatches to the agent registry (mawdbot, defi-scanner, openai-trader, fire-crawler, vibe-coder, clawd-trader) and returns the aggregated reply.

The `openai-trader` agent (registered in `/openclawd-stack/gateway/agents/openai-trading.ts`) shares the same Responses API pattern as the `openai-trading-bot` worker — so you can run the trading logic either at the edge (worker) or inside the sandbox (gateway).

## 📄 License

MIT — See [`../LICENSE.md`](../LICENSE.md)
