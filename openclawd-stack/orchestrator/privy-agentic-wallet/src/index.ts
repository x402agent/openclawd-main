/**
 * Privy Agentic Wallet Integration
 *
 * Provides wallet authentication and transaction signing for Solana agents
 * using Privy's embedded wallet infrastructure with secure key management.
 *
 * Uses Privy's REST API directly for server-side wallet operations so this
 * module stays decoupled from any specific Privy SDK version. The surface is
 * intentionally narrow — create / list / sign / transfer. Anything richer
 * (delegated actions, policies) goes through the orchestrator directly.
 */

import {
  Connection,
  Transaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js';

// ─── config ──────────────────────────────────────────────────────────────
export interface AgenticWalletConfig {
  privyAppId: string;
  /** Privy app secret (server-side). */
  privyApiKey: string;
  /** Privy REST base. Defaults to https://api.privy.io. */
  privyBaseUrl?: string;
  rpcUrl?: string;
  connection?: Connection;
}

export interface WalletAccount {
  /** Privy wallet id — opaque handle used for signing. */
  id: string;
  /** Base58 Solana public key. */
  address: string;
  publicKey: Buffer;
  createdAt: Date;
  label?: string;
}

export interface TransactionRequest {
  instructions: TransactionInstruction[];
  signers?: PublicKey[];
  feePayer?: PublicKey;
  recentBlockhash?: string;
}

// ─── REST client (thin) ──────────────────────────────────────────────────
class PrivyRestClient {
  #appId: string;
  #apiKey: string;
  #base: string;

  constructor(appId: string, apiKey: string, base = 'https://api.privy.io') {
    this.#appId = appId;
    this.#apiKey = apiKey;
    this.#base = base.replace(/\/$/, '');
  }

  get #auth(): string {
    return 'Basic ' + Buffer.from(`${this.#appId}:${this.#apiKey}`).toString('base64');
  }

  async #fetch<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.#base}${path}`, {
      method,
      headers: {
        authorization: this.#auth,
        'privy-app-id': this.#appId,
        'content-type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      throw new Error(`privy ${method} ${path} → ${res.status}: ${await res.text()}`);
    }
    return (await res.json()) as T;
  }

  createWallet(chainType: 'solana'): Promise<{
    id: string;
    address: string;
    chain_type: string;
    public_key?: string;
  }> {
    return this.#fetch('POST', '/v1/wallets', { chain_type: chainType });
  }

  listWallets(): Promise<{ data: Array<{ id: string; address: string; chain_type: string; public_key?: string }> }> {
    return this.#fetch('GET', '/v1/wallets');
  }

  /** Returns a base64 signature. */
  signSolanaTransaction(walletId: string, transactionBase64: string): Promise<{ signature: string }> {
    return this.#fetch('POST', `/v1/wallets/${walletId}/rpc`, {
      method: 'signTransaction',
      params: { transaction: transactionBase64 },
    });
  }
}

// ─── main provider ───────────────────────────────────────────────────────
export class PrivyAgenticWallet {
  private privy: PrivyRestClient;
  private connection: Connection;
  private wallets: Map<string, WalletAccount> = new Map();
  private isInitialized = false;

  constructor(config: AgenticWalletConfig) {
    this.connection =
      config.connection ??
      new Connection(
        config.rpcUrl ??
          `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY ?? ''}`,
      );
    this.privy = new PrivyRestClient(config.privyAppId, config.privyApiKey, config.privyBaseUrl);
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    console.log('[PrivyAgenticWallet] initialized →', this.connection.rpcEndpoint);
    this.isInitialized = true;
  }

  async createWallet(label?: string): Promise<WalletAccount> {
    if (!this.isInitialized) await this.initialize();
    const wallet = await this.privy.createWallet('solana');
    const account: WalletAccount = {
      id: wallet.id,
      address: wallet.address,
      publicKey: wallet.public_key
        ? Buffer.from(wallet.public_key, 'base64')
        : new PublicKey(wallet.address).toBuffer(),
      createdAt: new Date(),
      label,
    };
    this.wallets.set(wallet.address, account);
    console.log(`[PrivyAgenticWallet] created wallet ${wallet.address}`);
    return account;
  }

  async getWallet(address: string): Promise<WalletAccount | undefined> {
    return this.wallets.get(address);
  }

  listWallets(): WalletAccount[] {
    return Array.from(this.wallets.values());
  }

  async getBalance(address: string): Promise<number> {
    const balance = await this.connection.getBalance(new PublicKey(address));
    return balance / 1e9;
  }

  async signTransaction(address: string, transaction: Transaction): Promise<Transaction> {
    const account = this.wallets.get(address);
    if (!account) throw new Error(`Wallet ${address} not found`);

    if (!transaction.recentBlockhash) {
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
    }
    if (!transaction.feePayer) transaction.feePayer = new PublicKey(address);

    const messageBytes = transaction.serializeMessage();
    const { signature } = await this.privy.signSolanaTransaction(
      account.id,
      messageBytes.toString('base64'),
    );
    transaction.addSignature(new PublicKey(address), Buffer.from(signature, 'base64'));
    return transaction;
  }

  async signAndSendTransaction(address: string, transaction: Transaction): Promise<string> {
    const signedTx = await this.signTransaction(address, transaction);
    const sig = await this.connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed',
    });
    console.log(`[PrivyAgenticWallet] tx ${sig}`);
    return sig;
  }

  async signTransactions(address: string, transactions: Transaction[]): Promise<Transaction[]> {
    return Promise.all(transactions.map((tx) => this.signTransaction(address, tx)));
  }

  async confirmTransaction(signature: string): Promise<boolean> {
    const res = await this.connection.confirmTransaction(signature, 'confirmed');
    return !res.value.err;
  }

  createTransferInstruction(from: PublicKey, to: PublicKey, lamports: number): TransactionInstruction {
    return SystemProgram.transfer({ fromPubkey: from, toPubkey: to, lamports });
  }

  async getTransactionHistory(address: string, limit = 10): Promise<unknown[]> {
    return this.connection.getSignaturesForAddress(new PublicKey(address), { limit });
  }

  async walletExists(address: string): Promise<boolean> {
    try {
      return (await this.connection.getAccountInfo(new PublicKey(address))) !== null;
    } catch {
      return false;
    }
  }
}

// ─── manager (approval workflow + multi-wallet) ──────────────────────────
export class AgenticWalletManager {
  private provider: PrivyAgenticWallet;
  private agentId: string;
  private wallets: Map<string, { wallet: WalletAccount; autoSign: boolean }> = new Map();

  constructor(config: AgenticWalletConfig, agentId: string) {
    this.provider = new PrivyAgenticWallet(config);
    this.agentId = agentId;
  }

  async initialize(): Promise<void> {
    await this.provider.initialize();
  }

  async registerWallet(address: string, label?: string, autoSign = false): Promise<WalletAccount> {
    const account = await this.provider.createWallet(label);
    this.wallets.set(account.address, { wallet: account, autoSign });
    return account;
  }

  getDefaultWallet(): WalletAccount | undefined {
    const entries = Array.from(this.wallets.values());
    return entries.find((w) => w.autoSign)?.wallet ?? entries[0]?.wallet;
  }

  async executeTransfer(
    to: string,
    lamports: number,
    requireApproval = true,
  ): Promise<{ signature?: string; pending: boolean }> {
    const wallet = this.getDefaultWallet();
    if (!wallet) throw new Error('No default wallet configured');

    const transaction = new Transaction();
    transaction.add(
      this.provider.createTransferInstruction(
        new PublicKey(wallet.address),
        new PublicKey(to),
        lamports,
      ),
    );

    if (requireApproval) return { pending: true };

    const signature = await this.provider.signAndSendTransaction(wallet.address, transaction);
    return { signature, pending: false };
  }

  async getAllBalances(): Promise<Map<string, number>> {
    const balances = new Map<string, number>();
    for (const [address] of this.wallets) {
      try {
        balances.set(address, await this.provider.getBalance(address));
      } catch {
        balances.set(address, 0);
      }
    }
    return balances;
  }

  getAgentId(): string {
    return this.agentId;
  }
}

// ─── factories ───────────────────────────────────────────────────────────
export async function createPrivyAgenticWallet(
  config: AgenticWalletConfig,
): Promise<PrivyAgenticWallet> {
  const w = new PrivyAgenticWallet(config);
  await w.initialize();
  return w;
}

export async function createAgenticWalletManager(
  config: AgenticWalletConfig,
  agentId: string,
): Promise<AgenticWalletManager> {
  const m = new AgenticWalletManager(config, agentId);
  await m.initialize();
  return m;
}
