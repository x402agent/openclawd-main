---
summary: 'Deploy checklist: Convex backend + Netlify/Railway web app.'
read_when:
  - Shipping to production
  - Debugging /api routing
---

# Deploy

NanoHub (ClawHub runtime) is two deployables:

- Web app (TanStack Start) → Netlify or Railway.
- Convex backend → Convex deployment (serves `/api/...` routes).

## Fast path (single command)

From repo root (`nanohub/`):

```bash
cp .env.deploy.example .env.deploy
# fill in production values
bun run deploy:prod
```

`deploy:prod` will:

1. stamp Convex metadata (`APP_BUILD_SHA`, `APP_DEPLOYED_AT`)
2. deploy Convex
3. verify backend/frontend contract
4. build the frontend for the selected runtime target
5. optionally upload when the matching CLI and env are configured

## 1) Deploy Convex

From your local machine:

```bash
bunx convex env set APP_BUILD_SHA "$(git rev-parse HEAD)" --prod
bunx convex env set APP_DEPLOYED_AT "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" --prod
bunx convex deploy
```

Or use the GitHub Actions pipeline:

```bash
gh workflow run deploy.yml
```

GitHub Actions secrets required for `deploy.yml`:

- `CONVEX_DEPLOY_KEY`

Ensure Convex env is set (auth + embeddings):

- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `CONVEX_SITE_URL`
- `JWT_PRIVATE_KEY`
- `JWKS`
- `TOGETHER_API_KEY`
- `OPENAI_API_KEY`
- `SITE_URL` (your web app URL)
- Optional webhook env (see `docs/webhook.md`)
- Optional: `GITHUB_TOKEN` (recommended; raises GitHub account lookup limit used by publish gate)

## 2) Deploy web app

Set env vars:

- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL` (Convex “site” URL)
- `CONVEX_SITE_URL` (same value; used by auth provider config)
- `SITE_URL` (web app URL)
- `VITE_APP_BUILD_SHA` (set to the same commit SHA stamped into Convex)
- `VITE_WALLET_API_URL` if you enable the agent wallet vault UI

Deploy order:

1. Convex
2. contract verify
3. web
4. host upload / host auto-deploy

### Netlify

- Use `bun run build:netlify`.
- Netlify serves `dist/` and routes SSR traffic through `/.netlify/functions/server`.
- `scripts/deploy-prod.sh` will upload automatically only if `netlify` CLI, `NETLIFY_AUTH_TOKEN`, and `NETLIFY_SITE_ID` are available.

### Railway

- Set `NITRO_PRESET=node-server`.
- Use `bun run build` so Nitro emits `.output/server/index.mjs`.
- `scripts/deploy-prod.sh` will run `railway up --detach` when the Railway CLI is installed and the service is linked.

## 3) Route `/api/*` to Convex

- On Railway, Nitro proxies `/api/*` through `server/routes/api/[...path].ts`.
- On Netlify, the generated server function handles the same proxy path and `dist/_redirects` sends requests to it.

## 4) Registry discovery

The CLI can discover the API base from:

- `/.well-known/clawhub.json` (preferred)
- `/.well-known/clawdhub.json` (legacy)

If you don’t serve that file, users must set:

```bash
export CLAWHUB_REGISTRY=https://your-site.example
```

## 5) Post-deploy checks

```bash
curl -i "https://<site>/api/v1/search?q=test"
curl -i "https://<site>/api/v1/skills/gifgrep"
```

Then:

```bash
clawhub login --site https://<site>
clawhub whoami
```

Rate-limit sanity checks:

```bash
curl -i "https://<site>/api/v1/download?slug=gifgrep"
```

Confirm headers are present:

- `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
- `Retry-After` on `429`

Drift checks:

```bash
bun run verify:convex-contract -- --prod
PLAYWRIGHT_BASE_URL=https://<site> bunx playwright test e2e/menu-smoke.pw.test.ts e2e/upload-auth-smoke.pw.test.ts
```

The Playwright smoke suite should fail on visible error UI, page errors, and
browser console errors.

Proxy/IP caveat:

- Default IP source is `cf-connecting-ip`.
- For non-Cloudflare trusted proxy setups, set `TRUST_FORWARDED_IPS=true`.
- If proxy headers are not forwarded/trusted correctly, multiple users may collapse into one IP and hit false-positive rate limits.
