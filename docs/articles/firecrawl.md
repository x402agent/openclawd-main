# Firecrawl — web research for Clawd agents

Every OpenClawd sandbox boots with a [Firecrawl](https://firecrawl.dev) tool surface wired into the agent loop. Agents can fetch a single URL, search the open web, enumerate every URL on a site, or kick off a full async crawl — all without a local Chromium, all returning clean markdown the model can reason over.

This page covers the tool surface, the wiring inside the stack, the prepackaged agent + template, and how to call it from the gateway, the orchestrator, or your own code.

---

## Why Firecrawl in the sandbox

- **No local browser needed.** Every scrape runs in a remote isolated sandbox upstream. No Chromium installs in the E2B image, no driver conflicts, no RAM pressure.
- **Real parallelism.** Many browser sessions at once without local resource fights. An agent can fan out across multiple sites in one turn.
- **Token-economical results.** The agent gets back markdown and metadata, not raw DOMs. We cap each tool result at ~16 KB and per-hit markdown at ~4 KB before it ever touches the model context.
- **Cached upstream.** Scrapes use `maxAge: 3_600_000` so a repeat fetch within an hour is ~500% faster.

---

## Tool surface

All five tools are registered in [`openclawd-stack/gateway/tools/registry.ts`](../openclawd-stack/gateway/tools/registry.ts) and dispatched to the wrappers in [`openclawd-stack/gateway/tools/firecrawl.ts`](../openclawd-stack/gateway/tools/firecrawl.ts).

| Tool | Purpose | Cost shape |
| --- | --- | --- |
| `web_scrape(url, screenshot?)` | Fetch one URL → `{ title, description, markdown, screenshot?, cached }`. | 1 scrape credit; cached for 1 h. |
| `web_search(query, limit?, scrape?)` | Top results. With `scrape: true` each hit is also returned as markdown. | 1 search + N scrape credits if `scrape`. |
| `web_map(url, search?, limit?, includeSubdomains?)` | Enumerate every URL on a site. Useful before a crawl, or to find a docs/blog/pricing section. | 1 map credit. |
| `web_crawl(url, limit?, maxDepth?, includePaths?, excludePaths?, allowSubdomains?)` | Kick off an async crawl. Returns a job `id` immediately. | N scrape credits (caps at 1000 pages per call). |
| `web_crawl_status(id)` | Poll a crawl job. Returns `status / completed / total / creditsUsed` and the first batch of pages as markdown. | Free. |

The wrapper enforces three guardrails so a runaway model can't burn upstream budget:

- `web_scrape` markdown is truncated to 16 KB.
- `web_search` per-hit markdown is truncated to 4 KB.
- `web_crawl` is hard-capped at 1000 pages, `web_map` at 5000 links.

---

## Env

Inject these into the sandbox at launch. The orchestrator's `SANDBOX_PASSTHROUGH_ENVS` already forwards both:

```sh
FIRECRAWL_API_KEY=fc-...                              # required for any web_* tool
FIRECRAWL_BASE_URL=https://api.firecrawl.dev         # optional override
```

If `FIRECRAWL_API_KEY` is unset, the tools throw on call but the rest of the agent loop is unaffected.

---

## Prepackaged agent + template

| Catalog id | Kind | Use it for |
| --- | --- | --- |
| [`clawd-firecrawl`](../agents/src/clawd-firecrawl.json) | One-shot agent | General web research with a sourced-summary output contract. Picks the smallest tool that answers the question (scrape > search > map > crawl). |
| [`firecrawl-researcher`](../agents/templates/firecrawl-researcher.template.json) | Configurable template | Spin up a site-locked researcher. Variables: `AGENT_TITLE`, `PRIMARY_DOMAIN`, `SECONDARY_DOMAINS`, `RESEARCH_GOAL`, `MAX_CRAWL_PAGES`. |

Both surface in the agent catalog at `GET /api/agents/catalog` and render in [`OpenClawdDeployPanel`](../client/src/components/OpenClawdDeployPanel.tsx) on `/deploy`.

---

## Calling the tools

### From inside the sandbox

The agent loop in [`gateway/agents/registry.ts`](../openclawd-stack/gateway/agents/registry.ts) advertises the schemas to the model on every turn. The model emits `tool_calls`, the dispatcher executes them, and results are appended to the conversation as `role: "tool"` messages.

```ts
// What the model sees in its tools array:
{ name: 'web_scrape', parameters: { url, screenshot? } }
{ name: 'web_search', parameters: { query, limit?, scrape? } }
{ name: 'web_map',    parameters: { url, search?, limit?, includeSubdomains? } }
{ name: 'web_crawl',  parameters: { url, limit?, maxDepth?, includePaths?, excludePaths?, allowSubdomains? } }
{ name: 'web_crawl_status', parameters: { id } }
```

### Direct from the gateway HTTP surface

The gateway proxies any tool call through the agent's chat loop, so the simplest pattern is:

```bash
curl -X POST https://$SANDBOX:18789/v1/agents/clawd-firecrawl/chat \
  -H "Authorization: Bearer $GATEWAY_TOKEN" \
  -d '{ "prompt": "Scrape https://docs.solana.com/developing/programming-model and summarize" }'
```

### Standalone wrapper

If you want to call Firecrawl outside the agent loop (e.g. from a custom worker), import the wrapper directly:

```ts
import { scrapeUrl, searchWeb, mapSite, startCrawl, crawlStatus } from './tools/firecrawl.js';

const page = await scrapeUrl('https://example.com', { screenshot: true });
const hits = await searchWeb('latest openclawd docs', { limit: 5, scrape: true });
const links = await mapSite('https://docs.example.com', { search: 'pricing' });
const job = await startCrawl('https://docs.example.com', { limit: 50 });
const status = await crawlStatus(job.id);
```

---

## Frontend surfaces

- [`/fire`](../client/src/pages/Fire.tsx) — interactive Firecrawl playground (scrape / search / map / crawl with the same wrappers).
- [`/deploy`](../client/src/pages/Deploy.tsx) — pick `clawd-firecrawl` (or instantiate `firecrawl-researcher`) and launch a sandbox with `FIRECRAWL_API_KEY` already injected.

---

## Output contract for the prepackaged agent

`clawd-firecrawl` always returns:

```
## TL;DR
[1–2 sentence answer]

## Key findings
- [Finding] — [URL]

## Sources
1. [Title](URL)
```

Never invent sources. Every claim cites a URL returned by a tool call. If `web_search` returned nothing useful, the agent says so rather than fabricating a citation.
