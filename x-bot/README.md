# @clawddevs — Solana Clawd X agent

Autonomous X (Twitter) bot for **@clawddevs**, the public face of [solana-clawd](../SOUL.md) and the `$CLAWD` token.

## What it does

- **Autonomous posting** — writes dev-log / `$CLAWD` / ecosystem posts every `AUTO_POST_INTERVAL_MS` (default 2h). Model may choose `SKIP` → stays silent.
- **Autonomous replies** — polls mentions every `POLL_INTERVAL_MS` (default 60s) and replies in-character via OpenAI chat.
- **Slash commands in mentions:**
  - `/imagine <prompt>` — image via OpenAI `gpt-image-1.5`
  - `/art <prompt>` — image via FAL (`flux/schnell`) — faster, looser
  - `/video <prompt>` — short video via FAL Kling image-to-video (auto-keyframed)
  - `/x <question>` — text reply authored by xAI Grok (`grok-4.20-reasoning`)
- **Persona** — all text is conditioned on [SOUL_X.md](./SOUL_X.md). Edit that file to retune the voice.

## Quick start

```bash
cd x-bot
pnpm install   # or npm install
pnpm dev       # long-running bot

# one-shots
pnpm post                                  # autonomous post now
pnpm post "shipping a new MCP skill"        # prompted post
pnpm imagine "a clawd operator scanning the pump.fun bonding curve at 3am"
```

## Required env

See [.env](./.env). The live `.env` is **git-ignored** and already populated with the user-provided `@clawddevs` credentials.

| Var                       | Purpose |
|---------------------------|---------|
| `CONSUMER_API_KEY/SECRET` | X app key/secret (OAuth 1.0a) |
| `CONSUMER_ACCESS_TOKEN/SECRET` | X user access token/secret for @clawddevs |
| `OPENAI_API_KEY`          | GPT chat + `gpt-image-1.5` |
| `OPENAI_IMAGE_MODEL`      | Default `gpt-image-1.5` |
| `CLAWD_MINT`              | `$CLAWD` SPL mint (templated into SOUL_X.md) |
| `AUTO_POST_ENABLED`       | Kill switch for autonomous posts |
| `REPLY_ENABLED`           | Kill switch for reply engine |
| `IMAGINE_ENABLED`         | Kill switch for `/imagine` |

## Deploy to Fly.io (24/7)

One-time setup:

```bash
cd x-bot

# 1. create app (uses fly.toml)
fly launch --no-deploy --copy-config --name clawd-x-bot

# 2. persistent volume for state + media cache
fly volumes create clawd_x_data --size 1 --region ord

# 3. push secrets from .env (batched, one restart)
./scripts/fly-secrets.sh --dry-run   # preview
./scripts/fly-secrets.sh             # actually push

# 4. deploy
fly deploy
```

Day-to-day:

```bash
fly logs                              # tail
fly status                            # machine + health
fly ssh console                       # shell in
fly secrets set KEY=new_value         # rotate a single secret
fly scale count 1                     # ensure single instance (avoids double-posting)
```

**Kill switches (no deploy needed):**
```bash
fly secrets set AUTO_POST_ENABLED=false     # stop autonomous tweets
fly secrets set REPLY_ENABLED=false         # stop replying
fly secrets set VIDEO_ENABLED=false         # disable /video
```

**Config vs secrets split:** credentials live in Fly secrets (rotatable). Cadence/model names live in [fly.toml](./fly.toml) `[env]` — change them with `fly deploy`, not `fly secrets`.

**On Free X API tier:** keep `POLL_INTERVAL_MS=900000` (15m) — the Free tier read cap is 50/month. Drop to `60000` only on Basic+.

## Architecture

```
src/
  config.ts    # env parsing, typed config
  state.ts    # persisted cursor + ring buffer of handled tweet IDs
  twitter.ts  # twitter-api-v2 client, post/upload/mentions
  image.ts    # OpenAI gpt-image-1.5 + /imagine parser
  agent.ts    # SOUL_X.md-conditioned reply / post / caption generation
  loop.ts     # mention polling + auto-post cadence
  index.ts    # entrypoint
  cli-post.ts  # one-shot: generate + post a tweet
  cli-imagine.ts # one-shot: generate + post an image
```

## Safety

- Bot never posts private keys, seed phrases, or trade signals phrased as advice. Refusals are enforced in [SOUL_X.md](./SOUL_X.md).
- `/imagine` refuses real-person likeness w/o consent, gore, minors, or deceptive trademarked logos (guard rail lives in the soul and in OpenAI's `moderation: auto`).
- Rate-limit back-off is handled by `twitter-api-v2`. Errors are logged, never thrown out of the loop.
- Flip any behavior off via env: set `AUTO_POST_ENABLED=false`, `REPLY_ENABLED=false`, `IMAGINE_ENABLED=false`.

## Troubleshooting

### `pnpm verify` returns 403
The X app's user access token was minted before the app had **Read + Write** permissions. Fix:

1. https://developer.x.com → your app → **User authentication settings** → App permissions = **Read and write** (or Read/Write/DM).
2. Keys & tokens tab → **Regenerate** Access Token & Secret.
3. Paste the new values into `.env` (`CONSUMER_ACCESS_TOKEN`, `CONSUMER_ACCESS_SECRET`).
4. `pnpm verify` again.

The consumer API key/secret do not need to change — only the access pair.

### `pnpm verify` returns 401
Check `CONSUMER_API_KEY` / `CONSUMER_API_SECRET` are correct (not swapped with bearer token).

### `gpt-image-1.5` returns moderation error
The org may need [API Organization Verification](https://help.openai.com/en/articles/10910291-api-organization-verification). Fall back by setting `OPENAI_IMAGE_MODEL=gpt-image-1-mini` in `.env`.

## Rotate credentials

The credentials in `.env` were pasted in chat during initial setup. **Rotate them at https://developer.x.com** (regenerate access token + API secret) then update `.env`. The bot does not cache tokens — next restart picks up the new values.
