# 🤖 OpenClawd OpenAI Trading Bot — Cloudflare Worker

Telegram bot powered by **OpenAI GPT-5.4 / GPT-5.4-nano** with **Agents SDK** and **Responses API**.

## Features

- **Autonomous Trading** — GPT-5.4 as the brain, executing trades via pump.fun, Jupiter, and claiming fees
- **CUA (Computer Use Agent)** — Browser automation via `computer_use_preview` tool
- **Image Generation** — `/generate` command and natural language image requests via **GPT Image 2.0** (`gpt-image-1`) with `gpt-image-1-mini` fallback
- **Web Search** — Built-in `web_search` tool for real-time market data
- **Natural Language Agent** — GPT-5.4-nano for chat, agent assignment, and delegation
- **Tier-Gated Access** — Only `TELEGRAM_USER_ID` (default: `1740095485`) can use the bot
- **Agent Assignment** — Owner can assign the bot to other Telegram users via natural language

## Models Used

| Task | Model | Purpose |
|------|-------|---------|
| Trading decisions | `gpt-5.4` | Complex reasoning, trade execution |
| CUA / Browser automation | `computer-use-preview` | Click, type, screenshot via browser |
| Image generation | `gpt-image-1` | PnL cards, memes, visual content |
| Image fallback | `gpt-image-1-mini` | Backup image generation |
| Natural language chat | `gpt-5.4-nano` | Fast responses, agent delegation |

## Setup

```bash
cd workers/openai-trading-bot
npm install
cp .env.example .env  # add your keys
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler deploy
```

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message + tier info |
| `/generate <prompt>` | Generate image with GPT Image 2.0 |
| `/trade <token> <side> <amount>` | Execute trade via GPT-5.4 |
| `/pnl` | Generate PnL card with GPT Image |
| `/search <query>` | Web search via Responses API |
| `/assign @user` | Assign bot to another user |
| `/revoke @user` | Revoke user access |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `TELEGRAM_BOT_TOKEN` | ✅ | Telegram bot token from @BotFather |
| `TELEGRAM_USER_ID` | ✅ | Owner Telegram user ID (default: 1740095485) |
| `SOLANA_RPC_URL` | ❌ | Solana RPC endpoint |
| `HELIUS_API_KEY` | ❌ | Helius DAS API key |
| `JUPITER_API_KEY` | ❌ | Jupiter swap API key |

## Architecture

```
Telegram User ──→ Cloudflare Worker ──→ OpenAI Responses API
                        │                      │
                        │              ┌───────┴────────┐
                        │              │  Tools:         │
                        │              │  • web_search   │
                        │              │  • image_gen    │
                        │              │  • computer_use │
                        │              │  • function     │
                        │              │    (trading)    │
                        │              └────────────────┘
                        │
                        └──→ Solana (pump.fun, Jupiter, claims)