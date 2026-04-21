// ════════════════════════════════════════════════════════════════════
// Grok-as-CLAWD token analyzer.
//
// Given a mint, gathers data from BirdEye + SolanaTracker, then calls
// xAI's Responses API with grok-4.20-reasoning:
//   - Image understanding on the token logo (vision)
//   - Built-in x_search tool (X/Twitter sentiment)
//   - Built-in web_search tool (broader context)
//
// Returns a structured verdict the UI / bots can render.
// ════════════════════════════════════════════════════════════════════

import { birdeyeTokenOverview } from './birdeye.js';
import { trackerToken, trackerTopHolders, trackerChart } from './solana-tracker.js';

const XAI_BASE = 'https://api.x.ai/v1';
const XAI_MODEL = process.env.XAI_ANALYZER_MODEL ?? 'grok-4.20-reasoning';

const CLAWD_SYSTEM = `You are CLAWD, a sharp-eyed Solana memecoin degen strategist. You analyze
tokens with cold-eyed skepticism while still recognizing asymmetric upside.

When given a token to analyze:
1. Inspect the logo image for red flags (derivative art, low effort, stolen branding, bullish signal
   symbols like frogs/cats/crabs, lore-worthy originality).
2. Use x_search to gauge X/Twitter sentiment — look for organic traction vs bot spam,
   notable KOLs mentioning, recent tweet volume, founder's X handle if available.
3. Use web_search for context — project website, team, GitHub activity, news.
4. Combine this with the on-chain metrics provided (price, MC, liquidity, volume, holders,
   risk flags, top holder concentration).

Output format (markdown):
- **Verdict:** one of 🟢 BUY / 🟡 WATCH / 🔴 AVOID
- **Score:** 0–100 (higher = more bullish)
- **Thesis:** 2-3 sentences of the bull case (or why it's worth watching)
- **Red flags:** bulleted list
- **X sentiment:** one sentence summary with key voices
- **Action:** concrete next step (ape with $X, wait for Y, avoid entirely)

Keep the whole response under ~350 words. Be direct. No disclaimers.`;

export interface AnalysisResult {
  mint: string;
  text: string;
  citations: { url: string; title?: string }[];
  metrics: {
    price?: number | null;
    marketCap?: number | null;
    liquidity?: number | null;
    volume24h?: number | null;
    holders?: number | null;
    priceChange24h?: number | null;
    topHolderPct?: number | null;
    riskScore?: number | null;
    rugged?: boolean | null;
  };
  logoUrl?: string | null;
  modelId: string;
  ts: number;
}

export async function analyzeToken(mint: string): Promise<AnalysisResult> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) throw new Error('XAI_API_KEY not configured');

  // ── Gather data in parallel ────────────────────────────────────────
  const [overview, tracker, topHolders, chart] = await Promise.all([
    birdeyeTokenOverview(mint),
    trackerToken(mint),
    trackerTopHolders(mint),
    trackerChart(mint, { type: '1h' }),
  ]);

  const pool = tracker?.pools?.[0];
  const topHolderPct = topHolders.slice(0, 10).reduce((s, h) => s + (h.percentage ?? 0), 0);
  const recentCandles = chart?.oclhv?.slice(-24) ?? [];

  const name = overview?.name ?? tracker?.token?.name ?? 'Unknown';
  const symbol = overview?.symbol ?? tracker?.token?.symbol ?? '?';
  const logoUrl = overview?.logoURI ?? tracker?.token?.image ?? null;
  const description = tracker?.token?.description ?? '';
  const twitter = tracker?.token?.twitter ?? '';
  const website = tracker?.token?.website ?? '';

  const metrics = {
    price:         overview?.price ?? pool?.price?.usd ?? null,
    marketCap:     overview?.mc ?? pool?.marketCap?.usd ?? null,
    liquidity:     overview?.liquidity ?? pool?.liquidity?.usd ?? null,
    volume24h:     overview?.v24hUSD ?? pool?.txns?.volume ?? null,
    holders:       overview?.holder ?? tracker?.holders ?? null,
    priceChange24h: overview?.priceChange24hPercent ?? null,
    topHolderPct:  topHolderPct || null,
    riskScore:     tracker?.risk?.score ?? null,
    rugged:        tracker?.risk?.rugged ?? null,
  };

  // ── Build the structured brief for Grok ────────────────────────────
  const briefLines: string[] = [
    `Token: **${name}** ($${symbol})`,
    `Mint: ${mint}`,
    description ? `Description: ${description}` : '',
    twitter  ? `Twitter: ${twitter}`  : '',
    website  ? `Website: ${website}`  : '',
    '',
    '**On-chain metrics:**',
    `- Price: ${metrics.price != null ? '$' + Number(metrics.price).toPrecision(4) : 'unknown'}`,
    `- Market cap: ${metrics.marketCap != null ? '$' + Number(metrics.marketCap).toLocaleString() : 'unknown'}`,
    `- Liquidity: ${metrics.liquidity != null ? '$' + Number(metrics.liquidity).toLocaleString() : 'unknown'}`,
    `- 24h volume: ${metrics.volume24h != null ? '$' + Number(metrics.volume24h).toLocaleString() : 'unknown'}`,
    `- 24h change: ${metrics.priceChange24h != null ? metrics.priceChange24h.toFixed(2) + '%' : 'unknown'}`,
    `- Holders: ${metrics.holders ?? 'unknown'}`,
    `- Top-10 holder concentration: ${metrics.topHolderPct != null ? metrics.topHolderPct.toFixed(1) + '%' : 'unknown'}`,
    `- Tracker risk score: ${metrics.riskScore ?? 'unknown'}${metrics.rugged ? ' (FLAGGED AS RUGGED)' : ''}`,
    tracker?.risk?.risks?.length
      ? `- Risk flags: ${tracker.risk.risks.map(r => `${r.name} (${r.level})`).join(', ')}`
      : '',
    tracker?.risk?.jupiterVerified ? '- ✅ Jupiter verified' : '',
    '',
    recentCandles.length
      ? `Recent 1h candles (last ${recentCandles.length}): ${recentCandles.map(c => c.close.toPrecision(3)).join(' → ')}`
      : '',
  ].filter(Boolean);

  // ── Call Grok Responses API with tools + image ─────────────────────
  const userContent: { type: string; text?: string; image_url?: string }[] = [
    { type: 'input_text', text: `Analyze this Solana token:\n\n${briefLines.join('\n')}` },
  ];
  if (logoUrl) {
    userContent.push({ type: 'input_image', image_url: logoUrl });
  }

  const body: Record<string, unknown> = {
    model: XAI_MODEL,
    input: [
      { role: 'system', content: CLAWD_SYSTEM },
      { role: 'user', content: userContent },
    ],
    tools: [
      { type: 'web_search', enable_image_understanding: true },
      { type: 'x_search',   enable_image_understanding: true },
    ],
    store: false,
  };

  const res = await fetch(`${XAI_BASE}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'x-grok-conv-id': `clawd-analyze-${mint}`, // keeps per-token cache warm
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(5 * 60_000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`xAI Responses ${res.status}: ${text.slice(0, 300)}`);
  }

  type ContentPart = { type: string; text?: string; url?: string; title?: string };
  type OutputItem  = { type: string; content?: ContentPart[]; url?: string; title?: string };
  const json = await res.json() as { output_text?: string; output?: OutputItem[] };

  let text = json.output_text ?? '';
  if (!text && json.output) {
    for (const item of json.output) {
      for (const c of item.content ?? []) {
        if (c.type === 'output_text' && c.text) text += c.text;
      }
    }
  }

  const citations: AnalysisResult['citations'] = [];
  for (const item of json.output ?? []) {
    if (item.type === 'web_search_result' || item.type === 'x_search_result') {
      if (item.url) citations.push({ url: item.url, title: item.title });
    }
    for (const c of item.content ?? []) {
      if (c.type === 'url_citation' && c.url) citations.push({ url: c.url, title: c.title });
    }
  }

  return {
    mint,
    text: text.trim() || '(no content)',
    citations,
    metrics,
    logoUrl,
    modelId: XAI_MODEL,
    ts: Date.now(),
  };
}

export const analyzerConfigured = Boolean(process.env.XAI_API_KEY);
