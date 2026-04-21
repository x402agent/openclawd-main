// ════════════════════════════════════════════════════════════════════
// Shared types for the PumpFun WebSocket relay
// ════════════════════════════════════════════════════════════════════

/** A parsed token launch event broadcast to browser clients */
export interface TokenLaunchEvent {
  type: 'token-launch';
  signature: string;
  time: string;        // ISO timestamp
  name: string | null;
  symbol: string | null;
  metadataUri: string | null;
  mint: string | null;
  creator: string | null;
  isV2: boolean;
  hasGithub: boolean;
  githubUrls: string[];
  imageUri: string | null;
  description: string | null;
  marketCapSol: number | null;
  website: string | null;
  twitter: string | null;
  telegram: string | null;
}

// ════════════════════════════════════════════════════════════════════
// Fee Claim Events
// ════════════════════════════════════════════════════════════════════

export type ClaimType =
  | 'collect_creator_fee'
  | 'claim_cashback'
  | 'collect_coin_creator_fee'
  | 'distribute_creator_fees'
  | 'transfer_creator_fees_to_pump'
  | 'claim_social_fee_pda';

/** A parsed fee claim event broadcast to all clients */
export interface FeeClaimEvent {
  type: 'fee-claim';
  txSignature: string;
  slot: number;
  timestamp: number;
  claimerWallet: string;
  tokenMint: string;
  tokenName?: string;
  tokenSymbol?: string;
  amountSol: number;
  amountLamports: number;
  claimType: ClaimType;
  isCashback: boolean;
  programId: string;
  claimLabel: string;
}

/** Server status broadcast */
export interface ServerStatus {
  type: 'status';
  connected: boolean;
  uptime: number;       // seconds
  totalLaunches: number;
  githubLaunches: number;
  totalClaims: number;
  clients: number;
}

/** Heartbeat / ping */
export interface Heartbeat {
  type: 'heartbeat';
  ts: number;
}

/** BirdEye enrichment for a token launch — sent after the initial launch event */
export interface TokenEnrichedEvent {
  type: 'token-enriched';
  mint: string;
  signature: string;         // matches the original TokenLaunchEvent
  priceUsd: number | null;
  priceChange24hPct: number | null;
  marketCapUsd: number | null;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  holders: number | null;
  uniqueWallet24h: number | null;
  trade24h: number | null;
  buy24h: number | null;
  sell24h: number | null;
  logoUri: string | null;
  source: 'birdeye';
  ts: number;
}

/** Jupiter prediction market snapshot — broadcast periodically when enabled */
export interface JupiterPredictionSnapshot {
  type: 'jupiter-prediction';
  ts: number;
  events: Array<{
    id: string;
    title: string;
    category: string | null;
    status: string;
    volume: number | null;
    openInterest: number | null;
    closeTime: number | null;
    topMarket: {
      id: string;
      title: string;
      yesPrice: number | null;
      noPrice: number | null;
      volume: number | null;
    } | null;
  }>;
}

/** Jupiter token price tick — broadcast periodically for a tracked basket (SOL, JUP, etc) */
export interface JupiterPriceTick {
  type: 'jupiter-price';
  ts: number;
  prices: Record<string, { usdPrice: number; priceChange24h: number | null }>;
}

/** Helius enhanced transaction — pushed via webhook, broadcast live */
export interface HeliusWebhookEvent {
  type: 'helius-webhook';
  ts: number;
  source: 'helius';
  transactions: Array<{
    signature: string;
    type: string | null;
    source: string | null;
    slot: number | null;
    timestamp: number | null;
    feePayer: string | null;
    description: string | null;
    nativeSol: number;
    topTokenMint: string | null;
    topTokenAmt: number | null;
    tokenTransferCount: number;
    nativeTransferCount: number;
  }>;
}

export type RelayMessage =
  | TokenLaunchEvent
  | FeeClaimEvent
  | ServerStatus
  | Heartbeat
  | TokenEnrichedEvent
  | JupiterPredictionSnapshot
  | JupiterPriceTick
  | HeliusWebhookEvent;

