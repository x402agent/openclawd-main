# Security & Public Release Notes

This repository is published for the community to build on. Before you fork,
clone, deploy, or commit, please read the following.

## No Secrets, No Proprietary Keys

The codebase ships **without** any real credentials. Every API key, token,
private key, account ID, Convex deployment, Supabase project, OpenAI / Privy /
Helius / Solana Tracker / QuickNode / BrowserBase / Pinata / Netlify / Vercel /
Cloudflare credential, etc. has been replaced with a placeholder such as:

- `<your-openai-api-key>`
- `<your-helius-api-key>`
- `<your-cloudflare-account-id>`
- `YOUR-DEPLOYMENT.convex.site`
- `sk-proj-...`

If you see a real-looking secret anywhere in the tree, **please open an issue
immediately** — we treat it as a P0.

## Configure Your Own Environment

1. Copy the root `.env.example` to `.env` (and any sub-project `.env.example`
   files to `.env` / `.env.local`). Fill in your own keys.
2. Never commit your `.env`. The `.gitignore` blocks every common location, but
   assume the ignore file can fail and keep secrets out of the repo.
3. For Cloudflare Workers, use `wrangler secret put <NAME>` instead of placing
   secrets in `wrangler.toml`.
4. For Convex / Netlify / Vercel / Supabase, set environment variables in the
   provider dashboard — not in checked-in files.

## Proprietary Tech & Branded Endpoints

Openclawd is intentionally vendor-neutral. If a file references a branded URL
or deployment (e.g. `solanaclawd.com`, `clawdrouter.com`, `solanaos.net`), it
is being used as a default example — you can and should swap these out for
your own infrastructure. Nothing in the code requires you to talk to a
specific hosted service to run the stack locally or on your own cloud.

## Reporting a Vulnerability

If you discover a secret leak, a credential still active in git history, or a
security vulnerability, please email the maintainers via the contact on the
`agents/SECURITY.md` (or open a private security advisory on GitHub).

## Git History

This public release starts from a clean working tree. If you are cloning from a
fork that predates the cleanup, **rotate every credential** you find in the
history and scrub the blob with `git filter-repo` / `bfg` before re-publishing.
