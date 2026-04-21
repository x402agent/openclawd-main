/**
 * On-chain $CLAWD holder verification for the ClawdRouter worker.
 *
 * The Express server has its own `clawdHolding.ts`; this is the Worker-side
 * twin (uses `fetch` directly instead of axios, surfaces rpcOk so callers can
 * distinguish RPC failure from a confirmed zero balance).
 */

export interface ClawdHoldingEnv {
  CLAWD_TOKEN_ADDRESS?: string;
  HELIUS_RPC_URL?: string;
  SOLANA_RPC_URL?: string;
  CLAWD_MIN_BALANCE?: string;
  CLAWD_GATE_ENABLED?: string;
  CLAWD_ADMIN_WALLETS?: string;
}

const DEFAULT_CLAWD_MINT = '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump';
const DEFAULT_MIN_BALANCE = 1;

export interface HolderCheck {
  walletAddress: string;
  mint: string;
  uiAmount: number;
  meetsMinimum: boolean;
  rpcOk: boolean;
  rpcError?: string;
}

function rpcUrl(env: ClawdHoldingEnv): string {
  return (
    env.HELIUS_RPC_URL ??
    env.SOLANA_RPC_URL ??
    'https://api.mainnet-beta.solana.com'
  );
}

function clawdMint(env: ClawdHoldingEnv): string {
  return env.CLAWD_TOKEN_ADDRESS ?? DEFAULT_CLAWD_MINT;
}

function minBalance(env: ClawdHoldingEnv): number {
  const parsed = Number(env.CLAWD_MIN_BALANCE ?? DEFAULT_MIN_BALANCE);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : DEFAULT_MIN_BALANCE;
}

export function gateEnabled(env: ClawdHoldingEnv): boolean {
  // Default ON in the Worker — this is a paid LLM router, it should be
  // closed by default. Explicit opt-out via CLAWD_GATE_ENABLED=false.
  const v = env.CLAWD_GATE_ENABLED;
  if (v === undefined) return true;
  return /^(1|true|yes|on)$/i.test(String(v).trim());
}

export function isAdminWallet(env: ClawdHoldingEnv, wallet: string): boolean {
  const raw = env.CLAWD_ADMIN_WALLETS ?? '';
  const set = new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  return set.has(wallet);
}

export async function verifyClawdHolding(
  wallet: string,
  env: ClawdHoldingEnv,
): Promise<HolderCheck> {
  const mint = clawdMint(env);
  const min = minBalance(env);
  let uiAmount = 0;
  let rpcOk = false;
  let rpcError: string | undefined;

  try {
    const res = await fetch(rpcUrl(env), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'clawd-verify',
        method: 'getTokenAccountsByOwner',
        params: [wallet, { mint }, { encoding: 'jsonParsed' }],
      }),
      signal: AbortSignal.timeout(15_000),
    });

    const data = (await res.json()) as {
      error?: { message?: string };
      result?: { value?: Array<{ account?: { data?: { parsed?: { info?: { tokenAmount?: { uiAmount?: number } } } } } }> };
    };

    if (data.error) {
      rpcError = `RPC error: ${data.error.message ?? 'unknown'}`;
    } else {
      const accounts = data.result?.value ?? [];
      for (const acct of accounts) {
        const ui = acct?.account?.data?.parsed?.info?.tokenAmount?.uiAmount;
        if (typeof ui === 'number' && Number.isFinite(ui)) uiAmount += ui;
      }
      rpcOk = true;
    }
  } catch (err) {
    rpcError = `RPC unreachable: ${err instanceof Error ? err.message : 'unknown'}`;
  }

  return {
    walletAddress: wallet,
    mint,
    uiAmount,
    meetsMinimum: rpcOk && uiAmount >= min,
    rpcOk,
    rpcError,
  };
}
