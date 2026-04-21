// ════════════════════════════════════════════════════════════════════
// $CLAWD Buy Bot
//
// Watches the $CLAWD mint over Helius WS (logsSubscribe), resolves each
// signature via the Helius Parse API, and emits a ClawdBuyEvent whenever
// a swap where SOL is exchanged for CLAWD is detected. Events are
// forwarded to (a) a Telegram chat and (b) an onBuy callback so the
// relay can broadcast to browser clients.
// ════════════════════════════════════════════════════════════════════

import WebSocket from 'ws';
import { heliusParseTransactions, type HeliusEnhancedTx } from './helius.js';

export interface ClawdBuyEvent {
  signature: string;
  buyer: string | null;
  solSpent: number;
  clawdReceived: number;
  timestamp: number;        // unix ms
  source: string | null;
  description: string | null;
}

interface ClawdBuyBot {
  start(): void;
  stop(): void;
}

const DEFAULT_MINT = '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump';
const SEEN_MAX = 2000;
const PARSE_DEBOUNCE_MS = 800;

export function createClawdBuyBotFromEnv(
  onBuy: (event: ClawdBuyEvent) => void,
): ClawdBuyBot | null {
  if (process.env.CLAWD_BUY_BOT_ENABLED !== 'true') return null;

  const mint = (process.env.CLAWD_MINT || DEFAULT_MINT).trim();
  const minBuySol = Number(process.env.CLAWD_MIN_BUY_SOL ?? '0') || 0;
  const botToken =
    process.env.TELEGRAM_CLAWD_BOT_TOKEN?.trim() ||
    process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const chatId =
    process.env.TELEGRAM_CLAWD_CHAT_ID?.trim() ||
    process.env.TELEGRAM_CHAT_ID?.trim() || '';
  const wsUrl =
    process.env.HELIUS_WSS_URL?.trim() ||
    (process.env.HELIUS_API_KEY
      ? `wss://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY.trim()}`
      : '');

  const missing: string[] = [];
  if (!wsUrl) missing.push('HELIUS_WSS_URL or HELIUS_API_KEY');
  if (!botToken) missing.push('TELEGRAM_CLAWD_BOT_TOKEN or TELEGRAM_BOT_TOKEN');
  if (!chatId) missing.push('TELEGRAM_CLAWD_CHAT_ID or TELEGRAM_CHAT_ID');
  if (!process.env.HELIUS_API_KEY) missing.push('HELIUS_API_KEY (needed for Parse API)');
  if (missing.length > 0) {
    console.warn(`[clawd-bot] disabled — missing: ${missing.join(', ')}`);
    return null;
  }

  return new ClawdBuyBotImpl({ mint, minBuySol, botToken, chatId, wsUrl, onBuy });
}

interface Config {
  mint: string;
  minBuySol: number;
  botToken: string;
  chatId: string;
  wsUrl: string;
  onBuy: (event: ClawdBuyEvent) => void;
}

class ClawdBuyBotImpl implements ClawdBuyBot {
  private ws: WebSocket | null = null;
  private subId: number | null = null;
  private alive = false;
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingSigs = new Set<string>();
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private seen = new Set<string>();

  constructor(private cfg: Config) {}

  start(): void {
    if (this.alive) return;
    this.alive = true;
    console.log(`[clawd-bot] watching mint ${this.cfg.mint} (min ${this.cfg.minBuySol} SOL)`);
    this.connect();
  }

  stop(): void {
    this.alive = false;
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.flushTimer)    { clearTimeout(this.flushTimer);    this.flushTimer = null; }
    if (this.ws) {
      try {
        if (this.subId !== null) {
          this.ws.send(JSON.stringify({
            jsonrpc: '2.0', id: 2, method: 'logsUnsubscribe', params: [this.subId],
          }));
        }
        this.ws.close();
      } catch { /* ignore */ }
      this.ws = null;
      this.subId = null;
    }
  }

  private connect(): void {
    if (!this.alive) return;
    this.ws = new WebSocket(this.cfg.wsUrl);

    this.ws.on('open', () => {
      this.reconnectDelay = 1000;
      this.ws!.send(JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'logsSubscribe',
        params: [
          { mentions: [this.cfg.mint] },
          { commitment: 'confirmed' },
        ],
      }));
    });

    this.ws.on('message', (data) => this.handleMessage(data.toString()));

    this.ws.on('error', (err) => {
      console.error('[clawd-bot] ws error:', err.message);
    });

    this.ws.on('close', (code) => {
      this.ws = null;
      this.subId = null;
      if (this.alive) {
        this.reconnectTimer = setTimeout(() => this.connect(), this.reconnectDelay);
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
        console.log(`[clawd-bot] ws disconnected (${code}), retrying in ${this.reconnectDelay}ms`);
      }
    });
  }

  private handleMessage(raw: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let msg: Record<string, any>;
    try { msg = JSON.parse(raw); } catch { return; }

    if (msg.id === 1 && typeof msg.result === 'number') {
      this.subId = msg.result;
      console.log(`[clawd-bot] subscribed (sub=${this.subId})`);
      return;
    }

    if (msg.method !== 'logsNotify') return;
    const sig = msg.params?.result?.value?.signature;
    const err = msg.params?.result?.value?.err;
    if (!sig || err) return;
    if (this.seen.has(sig)) return;
    this.seen.add(sig);
    this.pendingSigs.add(sig);
    this.scheduleFlush();
  }

  private scheduleFlush(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      this.flushTimer = null;
      void this.flushPending();
    }, PARSE_DEBOUNCE_MS);
  }

  private async flushPending(): Promise<void> {
    if (this.pendingSigs.size === 0) return;
    const batch = [...this.pendingSigs].slice(0, 100);
    batch.forEach((s) => this.pendingSigs.delete(s));

    let txs: HeliusEnhancedTx[] = [];
    try {
      txs = await heliusParseTransactions(batch);
    } catch (err) {
      console.error('[clawd-bot] parse failed:', err instanceof Error ? err.message : String(err));
      return;
    }

    for (const tx of txs) {
      const buy = this.extractBuy(tx);
      if (!buy) continue;
      if (buy.solSpent < this.cfg.minBuySol) continue;
      this.cfg.onBuy(buy);
      void this.postTelegram(buy);
    }

    if (this.seen.size > SEEN_MAX) {
      const arr = [...this.seen];
      this.seen = new Set(arr.slice(-Math.floor(SEEN_MAX / 2)));
    }
  }

  private extractBuy(tx: HeliusEnhancedTx): ClawdBuyEvent | null {
    if (!tx.signature) return null;
    const clawdIn = (tx.tokenTransfers ?? []).filter(
      (t) => t.mint === this.cfg.mint && Number(t.tokenAmount ?? 0) > 0,
    );
    if (clawdIn.length === 0) return null;

    // A buy is a transfer of CLAWD *to* an account that also paid out SOL
    // in the same tx. Pick the largest CLAWD receipt as the buyer.
    const topReceipt = clawdIn.reduce((acc, t) =>
      Number(t.tokenAmount ?? 0) > Number(acc.tokenAmount ?? 0) ? t : acc,
    );
    const buyer = topReceipt.toUserAccount ?? null;

    const solSpentLamports = (tx.nativeTransfers ?? [])
      .filter((n) => buyer && n.fromUserAccount === buyer)
      .reduce((sum, n) => sum + Number(n.amount ?? 0), 0);
    if (solSpentLamports <= 0) return null;

    return {
      signature:     tx.signature,
      buyer,
      solSpent:      solSpentLamports / 1e9,
      clawdReceived: Number(topReceipt.tokenAmount ?? 0),
      timestamp:     tx.timestamp ? tx.timestamp * 1000 : Date.now(),
      source:        tx.source ?? null,
      description:   tx.description ?? null,
    };
  }

  private async postTelegram(event: ClawdBuyEvent): Promise<void> {
    const solStr = event.solSpent.toFixed(3);
    const clawdStr = event.clawdReceived.toLocaleString(undefined, { maximumFractionDigits: 2 });
    const buyerShort = event.buyer ? `${event.buyer.slice(0, 4)}…${event.buyer.slice(-4)}` : 'unknown';
    const text =
      `🐾 <b>$CLAWD buy</b>\n` +
      `Spent: <b>${solStr} SOL</b>\n` +
      `Got: <b>${clawdStr} $CLAWD</b>\n` +
      `Buyer: <code>${buyerShort}</code>\n` +
      `<a href="https://solscan.io/tx/${event.signature}">tx</a>` +
      (event.source ? ` · via ${event.source}` : '');

    try {
      const res = await fetch(
        `https://api.telegram.org/bot${this.cfg.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: this.cfg.chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          }),
        },
      );
      if (!res.ok) {
        console.error(`[clawd-bot] telegram ${res.status}: ${await res.text().catch(() => '')}`);
      }
    } catch (err) {
      console.error('[clawd-bot] telegram post failed:', err instanceof Error ? err.message : String(err));
    }
  }
}
