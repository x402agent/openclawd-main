// Bridges the orchestrator HTTP surface to the Privy agentic wallet package
// (./privy-agentic-wallet). Exposes a thin typed surface so routes.ts doesn't
// need to know about the underlying Privy SDK shape.
//
// The underlying `@solana-clawd/privy-agentic-wallet` package expects the same
// PRIVY_APP_ID + PRIVY_APP_SECRET the rest of the orchestrator already uses.
// This bridge is keyed by Privy sub so each user sees only their own wallets.

import type { Connection } from '@solana/web3.js';

/**
 * Lazy-loaded handle onto the privy-agentic-wallet package. We import it
 * dynamically so the orchestrator still boots when the sub-package isn't
 * built (`pnpm --filter @solana-clawd/privy-agentic-wallet build`).
 */
type AgenticWalletModule = typeof import('./privy-agentic-wallet/src/index.js');

export interface WalletBridgeOpts {
  connection: Connection;
  privyAppId: string;
  privyApiKey: string;
  /** Helius RPC override — otherwise derived from `connection`. */
  rpcUrl?: string;
}

export interface CreateWalletArgs {
  privySub: string;
  label?: string;
}

export interface WalletBalance {
  address: string;
  sol: number;
}

export interface TransferArgs {
  privySub: string;
  from: string;
  to: string;
  lamports: number;
  /** If true, send immediately. If false, return unsigned + require approval. */
  autoSign?: boolean;
}

export class WalletBridge {
  #opts: WalletBridgeOpts;
  #modPromise: Promise<AgenticWalletModule> | null = null;
  /** privySub -> manager */
  #managers = new Map<string, Awaited<ReturnType<AgenticWalletModule['createAgenticWalletManager']>>>();

  constructor(opts: WalletBridgeOpts) {
    this.#opts = opts;
  }

  async #mod(): Promise<AgenticWalletModule> {
    if (!this.#modPromise) {
      this.#modPromise = import('./privy-agentic-wallet/src/index.js') as Promise<AgenticWalletModule>;
    }
    return this.#modPromise;
  }

  async #managerFor(privySub: string) {
    let m = this.#managers.get(privySub);
    if (!m) {
      const mod = await this.#mod();
      m = await mod.createAgenticWalletManager(
        {
          privyAppId: this.#opts.privyAppId,
          privyApiKey: this.#opts.privyApiKey,
          rpcUrl: this.#opts.rpcUrl,
          connection: this.#opts.connection,
        },
        `agent-${privySub}`,
      );
      this.#managers.set(privySub, m);
    }
    return m;
  }

  async createWallet(args: CreateWalletArgs): Promise<{ address: string; label?: string }> {
    const mgr = await this.#managerFor(args.privySub);
    const acct = await mgr.registerWallet(args.privySub, args.label, false);
    return { address: acct.address, label: acct.label };
  }

  async listWallets(privySub: string): Promise<Array<{ address: string }>> {
    const mgr = await this.#managerFor(privySub);
    const balances = await mgr.getAllBalances();
    return Array.from(balances.keys()).map((address) => ({ address }));
  }

  async listBalances(privySub: string): Promise<WalletBalance[]> {
    const mgr = await this.#managerFor(privySub);
    const balances = await mgr.getAllBalances();
    return Array.from(balances.entries()).map(([address, sol]) => ({ address, sol }));
  }

  async transfer(args: TransferArgs): Promise<{ signature?: string; pending: boolean }> {
    const mgr = await this.#managerFor(args.privySub);
    return mgr.executeTransfer(args.to, args.lamports, !args.autoSign);
  }
}
