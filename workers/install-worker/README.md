# solanaclawd-install (Cloudflare Worker)

Serves the openclawd installer at `https://solanaclawd.com/install.sh` by
proxying the latest [`install.sh`](../../install.sh) from the GitHub repo.
Cached at the edge (5-minute TTL) so updates propagate quickly.

## Why this exists

`curl -fsSL https://solanaclawd.com/install.sh | bash` is the advertised
entry-point for the stack. If the apex domain doesn't have a route serving
that path, users hit `500`. This worker is the canonical route.

## Deploy

```bash
cd workers/install-worker
npm install
npx wrangler@latest login           # once
npx wrangler@latest deploy
```

The route `solanaclawd.com/install.sh` is declared in
[`wrangler.toml`](./wrangler.toml); the `solanaclawd.com` zone must be in
the same Cloudflare account.

## Test

```bash
curl -fsSL https://solanaclawd.com/install.sh | head
curl -I  https://solanaclawd.com/install.sh
curl     https://solanaclawd.com/install/healthz   # -> "ok"
```

## Fallback

If the worker is down or the zone isn't configured yet, users can still
install via the raw GitHub URL:

```bash
curl -fsSL https://raw.githubusercontent.com/x402agent/openclawd/main/install.sh | bash
```
