# OpenClawd — Solana Blockchain Integration

**The Hermes of Web3** — Metaplex Lobster Agents powered by OpenClawd, pump.fun, Birdeye, and Solana RPC.

---

## Overview

This directory contains Solana blockchain integration APIs for the OpenClawd agent system. These APIs power the **Metaplex Lobster Agents** — autonomous AI agents that can trade, launch tokens, and claim fees on Solana at birth.

---

## Contents

| Directory | Description |
|-----------|-------------|
| `bds-public-main/` | Birdeye Data Service — price feeds, token stats, wallet tracking, WebSocket streams |
| `pump-public-docs/` | Pump.fun IDL and SDK documentation — bonding curves, swaps, creator fees |
| `solana-tracker/` | SolanaTracker RPC and API integration |

---

## Metaplex Lobster Agent Programs

### Core Program IDs

| Program | Mainnet | Devnet | Purpose |
|---------|---------|--------|---------|
| **Pump.fun** | `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P` | Same | Token creation & bonding curves |
| **PumpSwap** | `PumpSwapAMMxxxxxxxxxxxxxx` | Same | AMM liquidity for graduated tokens |
| **Mayhem** | `MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e` | Same | Mayhem mode trading |
| **Metaplex** | `metaqbxxUurdq35cjC23cE9k1rCBu5KNqmWfdKAoZSkb` | Same | NFT/token metadata |

### Fee Recipients (Mayhem Mode)

```
GesfTA3X2arioaHp8bbKdjG9vJtskViWACZoYvxp4twS
4budycTjhs9fD6xw62VBducVTNgMgJJ5BgtKq7mAZwn6
8SBKzEQU4nLSzcwF4a74F2iaUDQyTfjGndn6qUWBnrpR
4UQeTP1T39KZ9Sfxzo3WR5skgsaP6NZa87BAkuazLEKH
8sNeir4QsLsJdYpc9RZacohhK1Y5FLU3nC5LXgYB4aa6
Fh9HmeLNUMVCvejxCtCL2DbYaRyBFVJ5xrWkLnMH6fdk
463MEnMeGyJekNZFQSTUABBEbLnvMTALbT6ZmsxAbAdq
6AUH3WEHucYZyC61hqpqYUWVto5qA5hjHuNQ32GNnNxA
```

---

## Agent Abilities at Birth

### 🦞 Metaplex Lobster Agent Capabilities

```typescript
interface LobsterAgent {
  // Token Operations
  canLaunchToken: true;
  canTrade: true;
  canClaimFees: true;
  canManageMetadata: true;
  
  // Program References
  programs: {
    pump: '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P';
    mayhem: 'MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e';
    metaplex: 'metaqbxxUurdq35cjC23cE9k1rCBu5KNqmWfdKAoZSkb';
    pumpSwap: 'PumpSwapAMMxxxxxxxxxxxxxx';
  };
  
  // RPC Providers
  rpc: {
    helius: 'https://mainnet.helius-rpc.com';
    birdeye: 'https://public-api.birdeye.so';
    solanaTracker: 'https://rpc-mainnet.solanatracker.io';
  };
  
  // Trading Parameters
  trading: {
    maxSlippageBps: 500;
    defaultBuyAmount: 0.01; // SOL
    maxBuyAmount: 1.0; // SOL
  };
}
```

---

## Quick Start

### 1. Launch a Token

```javascript
import { PUMP_SDK } from '@pump-fun/pump-sdk';

const result = await PUMP_SDK.create({
  creator: agentWallet,
  name: 'My Lobster Coin',
  symbol: 'LOBSTER',
  uri: 'https://arweave.net/...',
  mintAuthority: agentWallet,
  bonded: true,
});
```

### 2. Trade (Buy/Sell)

```javascript
// Buy
await PUMP_SDK.buy({
  user: agentWallet,
  mint: tokenMint,
  amount: 0.1, // SOL
  slippage: 100, // bps
});

// Sell
await PUMP_SDK.sell({
  user: agentWallet,
  mint: tokenMint,
  amount: tokenAmount,
  slippage: 100,
});
```

### 3. Claim Creator Fees

```javascript
await PUMP_SDK.collectCreatorFee({
  creator: agentWallet,
  mint: tokenMint,
});
```

---

## Birdeye API Integration

```javascript
// Get token price
GET /v1/token/price?address={mint}

// Get token metadata
GET /v1/token/meta?address={mint}

// Get wallet holdings
GET /v1/wallet/tokens?wallet={address}

// Get OHLCV
GET /v1/token/ohlcv?address={mint}
```

---

## WebSocket Streams

### BDS Public

```javascript
// Price stream
ws wsPrice.js --mint {mint}

// Transaction stream
ws wsTxs.js --mint {mint}

// Wallet stream
ws wsWallet.js --wallet {address}

// New pair detection
node new-pair-simple.js
```

---

## Key Documentation

| Document | What it covers |
|----------|---------------|
| `pump-public-docs/docs/PUMP_PROGRAM_README.md` | Full pump.fun bonding curve program docs |
| `pump-public-docs/docs/PUMP_SWAP_README.md` | PumpSwap AMM integration |
| `pump-public-docs/docs/FEE_PROGRAM_README.md` | Creator fee program |
| `bds-public-main/README.md` | BDS API usage examples |
| `bds-public-main/usage.py` | Python examples for BDS |

---

## Important Notes

### Mayhem Mode
- `create_v2` instruction uses **Token2022** instead of legacy Token program
- `is_mayhem_mode = true` coins require Mayhem fee recipients
- Bonding curve size increased to 82 bytes (was 81)

### Creator Fees
- `BondingCurve::creator` field added
- Creator vault PDA: `["creator-vault", bonding_curve.creator]`
- `collectCreatorFee(creator)` transfers accumulated fees

### Bonding Curve State
| Field | Description |
|-------|-------------|
| `virtual_token_reserves` | Synthetic token reserves |
| `virtual_sol_reserves` | Synthetic SOL reserves |
| `real_token_reserves` | Actual tokens in curve |
| `real_sol_reserves` | Actual SOL in curve |
| `complete` | True when real_token_reserves == 0 |

---

## Agent Trading Workflow

```
1. Agent spawns (49 Metaplex Lobster Agents ready)
         ↓
2. Connect wallet via Privy/E2B sandbox
         ↓
3. Scan pump.fun for opportunities (BDS API)
         ↓
4. Analyze token via Birdeye
         ↓
5. Execute trade (buy/sell via pump.fun SDK)
         ↓
6. Monitor position, collect fees if creator
         ↓
7. Report to OpenClawd orchestrator
```

---

## $CLAWD Integration

All lobster agents are powered by $CLAWD token:
- **Mint:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
- **Pump.fun:** https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump

Agents can:
1. Be gated by $CLAWD holdings (Bronze/Silver/Gold tier)
2. Trade $CLAWD as part of strategy
3. Earn $CLAWD from creator fees
4. Deploy $CLAWD for liquidity mining

---

*Built with 🦞 by OpenClawd — The Hermes of Web3*