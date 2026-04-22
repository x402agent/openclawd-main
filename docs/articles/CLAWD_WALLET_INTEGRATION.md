# Clawd Wallet Integration Guide

**Add Privy-powered embedded Solana wallets to your website — private keys never leave the user's device.**

This guide shows how to integrate `@openclawd/wallet` into any React website, Next.js app, or Node.js backend. Clawd Wallet gives your users self-custodial Solana wallets with built-in Jupiter DEX swaps and Grok 4.20 Beta transaction screening.

---

## Table of Contents

1. [What is Clawd Wallet?](#what-is-clawd-wallet)
2. [How it works](#how-it-works)
3. [Prerequisites](#prerequisites)
4. [Quick Start (5 minutes)](#quick-start-5-minutes)
5. [React Integration](#react-integration)
6. [Next.js Integration](#nextjs-integration)
7. [Node.js / CLI Integration](#nodejs--cli-integration)
8. [Agentic Trading Setup](#agentic-trading-setup)
9. [Custom Tokens](#custom-tokens)
10. [Styling & Theming](#styling--theming)
11. [Troubleshooting](#troubleshooting)

---

## What is Clawd Wallet?

Clawd Wallet (`@openclawd/wallet`) is an npm package that wraps [Privy](https://privy.io) embedded wallets with:

- **Jupiter DEX** for swap execution (SOL, USDC, USDT, WBTC, WETH, BONK, WIF, POPCAT, and any SPL token)
- **Grok 4.20 Beta** for AI transaction pre-screening
- **Deny-first permissions** — the agent must ask before spending
- **No seedphrase exposure** — private keys live in Privy's secure TEE, not your server

---

## How it works

```
User clicks "Connect Wallet"
        ↓
Privy modal → user enters email or social login
        ↓
Privy creates embedded Solana wallet in browser TEE
        ↓
Your app receives wallet address (never the private key)
        ↓
User initiates swap
        ↓
Grok 4.20 Beta screens the transaction
        ↓
User approves in Privy modal
        ↓
Privy signs the transaction in the TEE
        ↓
Transaction submitted to Solana
```

**Key invariant:** your server never sees the private key. The key material is AES-256-GCM encrypted inside Privy's TEE (Trusted Execution Environment).

---

## Prerequisites

1. **Privy account** — [dashboard.privy.io](https://dashboard.privy.io) → Create app → note your App ID
2. **Solana RPC** — Helius (recommended): [helius.xyz](https://helius.xyz) → API Keys
3. **xAI API key** (optional) — [console.x.ai](https://console.x.ai) for Grok transaction screening

---

## Quick Start (5 minutes)

### 1. Install

```bash
npm install @openclawd/wallet
```

### 2. Wrap your app

```tsx
import { PrivyProvider } from "@openclawd/wallet/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <PrivyProvider
          appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
          embeddedWallets
          loginMethods={["google", "discord", "email"]}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}
```

### 3. Access the wallet

```tsx
import { useClawdWallet } from "@openclawd/wallet/react";

function WalletButton() {
  const { wallet, authenticated, connectWallet, disconnect } = useClawdWallet();

  if (!wallet) {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  }

  return (
    <div>
      <p>{wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}</p>
      <p>{wallet.ready ? "✅ Ready" : "⏳ Loading..."}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

That's it — you now have a fully functional embedded Solana wallet.

---

## React Integration

### Full swap UI

```tsx
import { useState } from "react";
import { useClawdWallet } from "@openclawd/wallet/react";
import { SwapService } from "@openclawd/wallet";

function SwapPanel() {
  const { wallet } = useClawdWallet();
  const [input, setInput] = useState("SOL");
  const [output, setOutput] = useState("USDC");
  const [amount, setAmount] = useState("0.1");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ signature: string; explorerUrl: string } | null>(null);

  async function handleSwap() {
    if (!wallet?.ready) return;
    setLoading(true);

    try {
      const swap = new SwapService();
      const inputToken = { SOL: "So11111111111111111111111111111111111111112", USDC: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" };
      const rawAmount = BigInt(parseFloat(amount) * 1e9); // lamports

      const quote = await swap.quote({
        inputToken: input,
        outputToken: output,
        amount: rawAmount.toString(),
        slippageBps: 50,
      });

      // Build ClawdWallet from Privy wallet (pseudo-code — adapt to your Privy wallet object)
      const { ClawdWallet } = await import("@openclawd/wallet");
      const cw = new ClawdWallet(privyWalletObject, { chain: "mainnet" });

      const execResult = await swap.execute(cw, {
        inputToken: input,
        outputToken: output,
        amount: rawAmount.toString(),
        slippageBps: 50,
      });

      setResult(execResult);
    } catch (err) {
      console.error("Swap failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h3>Swap</h3>
      <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.1" />
      <select value={input} onChange={(e) => setInput(e.target.value)}>
        <option value="SOL">SOL</option>
        <option value="USDC">USDC</option>
      </select>
      <span>→</span>
      <select value={output} onChange={(e) => setOutput(e.target.value)}>
        <option value="USDC">USDC</option>
        <option value="SOL">SOL</option>
      </select>
      <button onClick={handleSwap} disabled={!wallet?.ready || loading}>
        {loading ? "Swapping..." : "Swap"}
      </button>
      {result && (
        <a href={result.explorerUrl} target="_blank" rel="noreferrer">
          View on Explorer ↗
        </a>
      )}
    </div>
  );
}
```

---

## Next.js Integration

**Important:** Privy requires the `window` object, so wrap providers in a client component guard.

```tsx
// app/providers.tsx
"use client";

import { PrivyProvider } from "@openclawd/wallet/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      embeddedWallets
      loginMethods={["google", "email"]}
    >
      {children}
    </PrivyProvider>
  );
}
```

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Environment variable:**
```bash
# .env.local
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id-from-dashboard.privy.io
```

---

## Node.js / CLI Integration

For server-side or CLI use (balance checks, quote fetching, non-signing operations):

```ts
import { ClawdWallet, SwapService } from "@openclawd/wallet";

// Check any wallet's balance (no signing required)
const wallet = new ClawdWallet({ address: "7EYj9...Abc" }, { chain: "mainnet" });
const balance = await wallet.getBalanceInSOL();
console.log(`${balance.toFixed(4)} SOL`);

// Get a Jupiter swap quote (no signing required)
const swap = new SwapService();
const quote = await swap.quote({
  inputToken: "SOL",
  outputToken: "USDC",
  amount: (0.1 * 1e9).toString(), // 0.1 SOL in lamports
  slippageBps: 50,
});
console.log(`You'd receive: ${quote.outAmount} USDC`);
console.log(`Price impact: ${quote.priceImpactPct.toFixed(4)}%`);
```

### CLI commands

```bash
npm i -g @openclawd/wallet

# Check balance
clawd-wallet balance 7EYj9...Abc

# Get quote
clawd-wallet quote SOL USDC 0.1

# List tokens
clawd-wallet tokens

# Help
clawd-wallet info
```

---

## Agentic Trading Setup

Give your AI agent a wallet it can use for autonomous trading, with Grok 4.20 Beta screening every transaction.

```ts
import { AgenticWallet, DEFAULT_PERMISSIONS } from "@openclawd/wallet";

// Initialize with the user's Privy wallet
const agent = new AgenticWallet(privyWalletObject, {
  privyAppId: process.env.PRIVY_APP_ID!,
  grokApiKey: process.env.XAI_API_KEY!,
  permissions: {
    ...DEFAULT_PERMISSIONS,
    swap: "ask",        // agent asks before each swap
    maxSwapUsd: 50,     // cap at $50 per swap
  },
  onTransactionStatus: (tx) => {
    console.log(`[${tx.status}] ${tx.description}`);
  },
});

// Agent wants to swap 0.1 SOL → USDC
const { signature, explorerUrl } = await agent.agentSwap({
  inputToken: "SOL",
  outputToken: "USDC",
  amount: (0.1 * 1e9).toString(),
  slippageBps: 50,
});

console.log(`Swap confirmed: ${explorerUrl}`);
```

**Permission levels:**

| Permission | Behavior |
|---|---|
| `deny` | Always block — requires user approval |
| `ask` (default) | Grok screens → user prompt → sign |
| `allow` | Auto-sign up to `maxSwapUsd` |

---

## Custom Tokens

Swap any SPL token by passing the mint address directly:

```ts
const quote = await swap.quote({
  inputToken: "SOL",
  outputToken: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", // BONK mint
  amount: (1 * 1e9).toString(),
  slippageBps: 100,
});
```

---

## Styling & Theming

Privy's embedded wallet modal is themed via the `appearance` config:

```tsx
<PrivyProvider
  appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
  config={{
    appearance: {
      theme: "dark",
      accentColor: "#7C3AED", // violet
      logo: "https://yoursite.com/logo.png",
    },
  }}
>
  {children}
</PrivyProvider>
```

---

## Troubleshooting

### "Wallet not ready"

```tsx
// Wait for Privy to finish loading
const { wallet } = useClawdWallet();

if (!wallet) return <div>Loading wallet...</div>;
if (!wallet.ready) return <div>Initializing secure wallet...</div>;
```

### Swap fails with "Blockhash not found"

Your RPC is stale. Use a faster RPC:

```ts
// Recommended: Helius
const wallet = new ClawdWallet(privyWallet, {
  chain: "mainnet",
  rpcUrl: "https://mainnet.helius-rpc.com/?api-key=YOUR_KEY",
});
```

### Privy modal doesn't appear

Check that `embeddedWallets` is set to `true` and the user is authenticated:

```tsx
const { authenticated } = useClawdWallet();
if (!authenticated) return <button onClick={connectWallet}>Sign in first</button>;
```

---

## Related

- [`packages/clawd-wallet/`](https://github.com/x402agent/openclawd/tree/main/packages/clawd-wallet) — package source
- [`clawdhub/`](https://github.com/x402agent/openclawd/tree/main/clawdhub) — install skills via `npx clawdhub`
- [`articles/ARTICLE_PAYMENTS.md`](./ARTICLE_PAYMENTS.md) — x402 payment infrastructure
- [`articles/monetize-agents-openclawd.md`](./monetize-agents-openclawd.md) — monetize your agent
