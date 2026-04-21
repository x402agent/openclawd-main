/**
 * Helius Webhook + Parse API integration.
 *
 * The websocket-server exposes a single POST endpoint that Helius calls when
 * configured transactions land on-chain. We validate the auth header, normalize
 * the payload, and hand it back to the relay so it can broadcast to browsers.
 *
 * Docs: https://www.helius.dev/docs/webhooks
 */

const AUTH = process.env.HELIUS_WEBHOOK_AUTH ?? '';
const HELIUS_KEY = process.env.HELIUS_API_KEY ?? '';
const HELIUS_NETWORK = (process.env.HELIUS_NETWORK ?? 'mainnet').toLowerCase();
const DEFAULT_PARSE_BASE =
  HELIUS_NETWORK === 'devnet'
    ? 'https://api-devnet.helius-rpc.com/v0/transactions/'
    : 'https://api-mainnet.helius-rpc.com/v0/transactions/';
const PARSE_URL =
  process.env.HELIUS_PARSE_URL ??
  (HELIUS_KEY ? `${DEFAULT_PARSE_BASE}?api-key=${HELIUS_KEY}` : '');

export const heliusConfigured       = Boolean(HELIUS_KEY);
export const heliusWebhookEnabled   = Boolean(AUTH);

/** Shape of a single enhanced Helius transaction (the fields we care about). */
export interface HeliusEnhancedTx {
  signature:    string;
  type?:        string;
  source?:      string;
  slot?:        number;
  timestamp?:   number;   // unix seconds
  fee?:         number;
  feePayer?:    string;
  description?: string;
  nativeTransfers?: Array<{
    fromUserAccount: string;
    toUserAccount:   string;
    amount:          number;
  }>;
  tokenTransfers?: Array<{
    fromUserAccount?: string;
    toUserAccount?:   string;
    fromTokenAccount?: string;
    toTokenAccount?:   string;
    tokenAmount?:      number;
    mint?:             string;
  }>;
  accountData?: unknown;
  events?:       unknown;
}

/** Verify the incoming webhook's Authorization header against the shared secret. */
export function verifyHeliusAuth(headerValue: string | undefined): boolean {
  if (!AUTH) return true;     // no secret configured → accept (dev mode)
  if (!headerValue) return false;
  // Helius sends the secret verbatim in the Authorization header.
  return headerValue === AUTH;
}

/** Fetch a fully-parsed transaction from Helius' Parse API (fallback for raw sigs). */
export async function heliusParseTransactions(signatures: string[]): Promise<HeliusEnhancedTx[]> {
  if (!PARSE_URL || !signatures.length) return [];
  const res = await fetch(PARSE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactions: signatures }),
  });
  if (!res.ok) {
    throw new Error(`Helius parse ${res.status}: ${await res.text().catch(() => '')}`);
  }
  const data = (await res.json()) as HeliusEnhancedTx[] | { transactions?: HeliusEnhancedTx[] };
  if (Array.isArray(data)) return data;
  return data.transactions ?? [];
}

/** Collapse an enhanced tx into a compact shape we broadcast to browser clients. */
export function summarizeHeliusTx(tx: HeliusEnhancedTx) {
  const largestTokenTransfer = (tx.tokenTransfers ?? []).reduce<{ amount: number; mint?: string } | null>(
    (acc, t) => {
      const amt = Number(t.tokenAmount ?? 0);
      if (!acc || amt > acc.amount) return { amount: amt, mint: t.mint };
      return acc;
    },
    null,
  );
  const nativeTotalLamports = (tx.nativeTransfers ?? []).reduce(
    (sum, n) => sum + Number(n.amount ?? 0),
    0,
  );
  return {
    signature:    tx.signature,
    type:         tx.type ?? null,
    source:       tx.source ?? null,
    slot:         tx.slot ?? null,
    timestamp:    tx.timestamp ? tx.timestamp * 1000 : null,
    feePayer:     tx.feePayer ?? null,
    description:  tx.description ?? null,
    nativeSol:    nativeTotalLamports / 1e9,
    topTokenMint: largestTokenTransfer?.mint ?? null,
    topTokenAmt:  largestTokenTransfer?.amount ?? null,
    tokenTransferCount:  (tx.tokenTransfers ?? []).length,
    nativeTransferCount: (tx.nativeTransfers ?? []).length,
  };
}
