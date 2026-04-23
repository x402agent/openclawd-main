// Wurk.fun x402 client for the orchestrator.
// Handles the full x402 payment flow: first call → 402 with payment info →
// retry with PAYMENT-SIGNATURE header → 200 with job result.
//
// Uses the WURK_API_KEY from env. Supports both Solana and Base networks.

export interface WurkPaymentAccept {
  scheme: 'exact';
  network: 'solana' | 'base';
  maxAmountRequired: string;
  payTo: string;
  asset: string;
}

export interface WurkJobResult {
  ok: boolean;
  paid: boolean;
  jobId?: string;
  message?: string;
}

// ── x402 helpers ──────────────────────────────────────────────────────────

/**
 * Make an x402 request. Returns the raw Response — caller handles 402
 * (extract payment info) vs 200 (extract job result).
 */
export async function x402Request(
  url: string,
  opts: RequestInit = {},
  paymentSignature?: string,
): Promise<Response> {
  const headers = new Headers(opts.headers as Record<string, string> | undefined);
  headers.set('Accept', 'application/json');
  if (paymentSignature) {
    headers.set('PAYMENT-SIGNATURE', paymentSignature);
  }
  return fetch(url, { ...opts, headers });
}

// ── Quick x402 endpoints (no API key needed) ─────────────────────────────

export interface WurkQuickJobResult {
  ok: boolean;
  paid: boolean;
  jobId: string;
  message: string;
}

/**
 * Create a quick x402 job without an API key.
 * First call returns 402 with payment info. Retry with PAYMENT-SIGNATURE.
 */
export async function createQuickJob(
  network: 'solana' | 'base',
  jobType: string,
  targetUrl: string,
  paymentSignature?: string,
): Promise<{ status: 402; accepts: WurkPaymentAccept[]; retryUrl: string } | { status: 200; result: WurkJobResult }> {
  const params = new URLSearchParams({ url: targetUrl });
  const url = `https://wurkapi.fun/api/x402/quick/${network}/${jobType}?${params}`;
  const res = await x402Request(url, { method: 'GET' }, paymentSignature);

  if (res.status === 402) {
    const data = (await res.json()) as { accepts?: WurkPaymentAccept[] };
    return { status: 402, accepts: data.accepts ?? [], retryUrl: url };
  }

  const result = (await res.json()) as WurkJobResult;
  return { status: 200, result };
}

// ── Prebuilt quick job types ──────────────────────────────────────────────

export type QuickJobType =
  | 'xlikes'
  | 'reposts'
  | 'comments'
  | 'xfollowers'
  | 'xraid'
  | 'bookmarks'
  | 'dex'
  | 'pfcomments'
  | 'tgmembers'
  | 'dcmembers'
  | 'instalikes'
  | 'instafollowers'
  | 'heylollikes'
  | 'heylolraid'
  | 'heylolfollowers'
  | 'ytlikes'
  | 'ytsubs'
  | 'basefollowers'
  | 'baselikes'
  | 'basereposts'
  | 'agenttohuman'
  | 'agenttohumanadvanced';

// ── Agent-to-human tasks ──────────────────────────────────────────────────

export interface AgentToHumanResult {
  ok: boolean;
  paid: boolean;
  jobId: string;
  submissions?: unknown[];
}

/**
 * Create an agent-to-human job (pay humans for feedback, visual tasks, etc.)
 */
export async function createAgentToHumanJob(
  network: 'solana' | 'base',
  amount: string, // e.g. "0.001" SOL
  description: string,
  paymentSignature?: string,
): Promise<{ status: 402; accepts: WurkPaymentAccept[] } | { status: 200; result: WurkJobResult }> {
  const params = new URLSearchParams({ description });
  const url = `https://wurkapi.fun/${network}/agenttohuman/${amount}?${params}`;
  const res = await x402Request(url, { method: 'GET' }, paymentSignature);

  if (res.status === 402) {
    const data = (await res.json()) as { accepts?: WurkPaymentAccept[] };
    return { status: 402, accepts: data.accepts ?? [] };
  }

  const result = (await res.json()) as WurkJobResult;
  return { status: 200, result };
}

/**
 * Retrieve submissions for an agent-to-human job.
 */
export async function getAgentToHumanSubmissions(
  network: 'solana' | 'base',
  secret: string,
): Promise<{ submissions: unknown[] }> {
  const res = await fetch(
    `https://wurkapi.fun/${network}/agenttohuman/view?secret=${encodeURIComponent(secret)}`,
    { headers: { Accept: 'application/json' } },
  );
  return (await res.json()) as { submissions: unknown[] };
}

// ── Build PAYMENT-SIGNATURE from on-chain payment ────────────────────────

/**
 * Wurk x402 payto addresses (solana:USDC, base:USDC).
 */
export const WURK_PAYTO: Record<'solana' | 'base', string> = {
  solana: 'SAT8g2aakxNhcqjLSk4VSUd9X7EymU1s9q6P1jM2e7h', // placeholder — user fills in
  base: '0x...',
};

/**
 * Build a mock PAYMENT-SIGNATURE for testing. In production this would be
 * a real on-chain signature from the user's wallet.
 *
 * The format is: base64(JSON.stringify({ payment: { ... }, signature: "..." }))
 */
export function buildPaymentSignature(
  payment: {
    scheme: string;
    network: string;
    amount: string;
    payTo: string;
    asset: string;
  },
  _signature: string = 'MOCK_SIGNATURE_PLACEHOLDER',
): string {
  return Buffer.from(
    JSON.stringify({
      payment,
      signature: _signature,
      signer: 'MOCK_WALLET_PLACEHOLDER',
    }),
  ).toString('base64');
}

// ── Service catalog ──────────────────────────────────────────────────────

export interface WurkService {
  id: string;
  label: string;
  description: string;
  network: 'solana' | 'base';
  endpoint: string;
  minAmount?: string;
  maxAmount?: string;
  unit?: string;
}

export const WURK_SERVICES: WurkService[] = [
  // Social (X/Twitter)
  { id: 'xlikes', label: 'X Likes', description: 'Buy X (Twitter) likes', network: 'solana', endpoint: 'solana/xlikes', unit: 'likes' },
  { id: 'xlikes-base', label: 'X Likes (Base)', description: 'Buy X likes on Base', network: 'base', endpoint: 'base/xlikes', unit: 'likes' },
  { id: 'reposts', label: 'X Reposts', description: 'Buy X reposts', network: 'solana', endpoint: 'solana/reposts', unit: 'reposts' },
  { id: 'comments', label: 'X Comments', description: 'Buy X comments', network: 'solana', endpoint: 'solana/comments', unit: 'comments' },
  { id: 'xfollowers', label: 'X Followers', description: 'Buy X followers', network: 'solana', endpoint: 'solana/xfollowers', unit: 'followers' },
  { id: 'xraid', label: 'X Raid', description: 'Buy X raid engagement', network: 'solana', endpoint: 'solana/xraid', unit: 'raid' },
  { id: 'bookmarks', label: 'X Bookmarks', description: 'Buy X bookmarks', network: 'solana', endpoint: 'solana/bookmarks' },
  // Dex/Trading
  { id: 'dex', label: 'Dex Rockets', description: 'Boost DexScreener visibility', network: 'solana', endpoint: 'solana/dex' },
  // Pump.fun
  { id: 'pfcomments', label: 'Pump.fun Comments', description: 'Buy Pump.fun comment boosts', network: 'solana', endpoint: 'solana/pfcomments' },
  // Telegram
  { id: 'tgmembers', label: 'Telegram Members', description: 'Buy Telegram group members', network: 'solana', endpoint: 'solana/tgmembers', unit: 'members' },
  // Discord
  { id: 'dcmembers', label: 'Discord Members', description: 'Buy Discord server members', network: 'solana', endpoint: 'solana/dcmembers', unit: 'members' },
  // Instagram
  { id: 'instalikes', label: 'Instagram Likes', description: 'Buy Instagram likes', network: 'solana', endpoint: 'solana/instalikes' },
  { id: 'instafollowers', label: 'Instagram Followers', description: 'Buy Instagram followers', network: 'solana', endpoint: 'solana/instafollowers' },
  // YouTube
  { id: 'ytlikes', label: 'YouTube Likes', description: 'Buy YouTube video likes', network: 'solana', endpoint: 'solana/ytlikes' },
  { id: 'ytsubs', label: 'YouTube Subscribers', description: 'Buy YouTube subscribers', network: 'solana', endpoint: 'solana/ytsubs' },
  // Base app
  { id: 'basefollowers', label: 'Base App Followers', description: 'Buy Base app followers', network: 'base', endpoint: 'base/basefollowers' },
  { id: 'baselikes', label: 'Base App Likes', description: 'Buy Base app likes', network: 'base', endpoint: 'base/baselikes' },
  { id: 'basereposts', label: 'Base App Reposts', description: 'Buy Base app reposts', network: 'base', endpoint: 'base/basereposts' },
  // Agent-to-human
  { id: 'agenttohuman', label: 'Agent to Human', description: 'Hire humans for microtasks/feedback', network: 'solana', endpoint: 'solana/agenttohuman' },
  { id: 'agenttohuman-base', label: 'Agent to Human (Base)', description: 'Hire humans on Base chain', network: 'base', endpoint: 'base/agenttohuman' },
];