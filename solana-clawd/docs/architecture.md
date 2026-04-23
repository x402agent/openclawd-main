# 🏗️ OpenClawd Architecture

> **Technical architecture of the autonomous Solana trading agent**

---

## Overview

OpenClawd is a Go-native autonomous trading agent that combines:

1. **gagliardetto/solana-go SDK** — Direct Solana blockchain operations
2. **OODA Loop** — Observe-Orient-Decide-Act trading cycle
3. **Jupiter Ultra** — MEV-protected swap execution
4. **ClawVault** — Persistent trading memory

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         OpenClawd System                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                        CLI Layer (main.go)                       │   │
│  │  clawd ooda │ clawd agent │ clawd gateway │ clawd status       │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
│                                   │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────┐ │
│  │                    Command Layer (cmd/clawd/)                     │  │
│  │  NewOODACommand() │ NewAgentCommand() │ NewGatewayCommand()     │  │
│  └────────────────────────────────┬─────────────────────────────────┘   │
│                                   │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────┐ │
│  │                      Package Layer (pkg/)                         │  │
│  │                                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │   agent/    │  │  onchain/   │  │      solana/           │   │  │
│  │  │             │  │             │  │                        │   │  │
│  │  │  • ooda.go │  │  • engine   │  │  • SolanaRPC (solana-go)│   │  │
│  │  │  • vault   │  │  • jupiter  │  │  • HeliusClient        │   │  │
│  │  │  • hooks   │  │  • swaps    │  │  • JupiterClient       │   │  │
│  │  │  • memory  │  │  • engine   │  │  • Wallet              │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │  │
│  │                                                                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │  strategy/  │  │   config/   │  │       memory/           │   │  │
│  │  │             │  │             │  │                        │   │  │
│  │  │  • rsi     │  │  • yaml     │  │  • ClawVault           │   │  │
│  │  │  • ema     │  │  • env      │  │  • Honcho integration  │   │  │
│  │  │  • atr     │  │  • defaults │  │  • persistence         │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘   │  │
│  └────────────────────────────────┬─────────────────────────────────┘   │
│                                   │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────┐ │
│  │                   External Dependencies                             │  │
│  │                                                                        │ │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │ │
│  │  │ gagliardetto/   │  │   Jupiter API   │  │   RPC Providers │    │ │
│  │  │ solana-go       │  │   (Ultra)       │  │   (Helius)      │    │ │
│  │  │                 │  │                 │  │                 │    │ │
│  │  │ • rpc           │  │ • GET /order    │  │ • HTTP JSON-RPC │    │ │
│  │  │ • programs      │  │ • POST /execute │  │ • WSS           │    │ │
│  │  │ • websocket     │  │ • RTSE          │  │ • DAS API       │    │ │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. OODA Agent (`pkg/agent/ooda.go`)

The OODA agent orchestrates the trading loop:

```go
type OODAAgent struct {
    // Solana clients
    tracker   *solana.SolanaTrackerClient  // Price/OHLCV data
    helius    *solana.HeliusClient         // RPC operations
    jupiter   *solana.JupiterClient        // Swap execution
    solanaRPC *solana.SolanaRPC             // Native solana-go RPC
    wallet    *solana.Wallet               // Agent wallet
    
    // On-chain engine
    onchain *onchain.Engine
    
    // Memory
    vault       *ClawVault
    honchoVault memory.Vault
    
    // State
    openPositions map[string]*Position
    tradeHistory  []Trade
    signals       []Signal
}
```

### 2. On-Chain Engine (`pkg/onchain/engine.go`)

Direct Solana blockchain operations:

```go
type Engine struct {
    cfg    Config
    rpc    *rpc.Client        // gagliardetto/solana-go
    wsConn *ws.Client         // WebSocket subscriptions
    http   *http.Client
}
```

Capabilities:
- SOL balance queries
- SPL token balances
- Transaction building & signing
- WebSocket account monitoring
- Priority fee estimation

### 3. Jupiter Ultra Integration (`pkg/onchain/jupiter.go`)

MEV-protected swap execution:

```go
// Swap Flow:
// 1. GET /ultra/v1/order → unsigned transaction
// 2. Sign locally with wallet private key
// 3. POST /ultra/v1/execute → Jupiter lands tx
// 4. Monitor for TP/SL conditions

type UltraOrderResponse struct {
    RequestID   string  // Request tracking ID
    InputMint   string  // Input token mint
    OutputMint  string  // Output token mint
    InAmount    string  // Input amount (lamports)
    OutAmount   string  // Estimated output
    Transaction string  // Base64 unsigned transaction
    PriceImpact float64 // Slippage estimate
}
```

### 4. Native Solana RPC (`pkg/solana/rpc.go`)

Wrapper around gagliardetto/solana-go:

```go
type SolanaRPC struct {
    client  *rpc.Client  // gagliardetto/solana-go
    wallet  *Wallet
    network string       // "mainnet", "devnet"
}

// Key operations:
// - GetBalance()
// - GetSlot()
// - GetLatestBlockhash()
// - SendTransaction()
// - GetAccountInfo()
// - GetSignaturesForAddress()
// - SimulateTransaction()
```

---

## Solana-Go SDK Integration

### Module Structure

```
solana-go-main/
├── rpc/                    # RPC client
│   ├── client.go          # Base HTTP client
│   ├── ws/                # WebSocket subscriptions
│   └── sendAndConfirmTransaction/  # Confirmation logic
├── programs/              # On-chain programs
│   ├── system/            # System program (create, transfer)
│   ├── token/            # SPL Token program
│   ├── associated-token-account/  # ATA program
│   └── ...
├── account.go             # Account types
├── transaction.go         # Transaction building
├── message.go            # Message parsing
└── keys.go                # Key pair operations
```

### Transaction Flow

```go
// 1. Get recent blockhash
recent, _ := client.GetLatestBlockhash(ctx, CommitmentFinalized)

// 2. Build transaction
tx, _ := solana.NewTransaction(
    []solana.Instruction{
        system.NewTransferInstruction(
            lamports,
            from.PublicKey(),
            to,
        ).Build(),
    },
    recent.Value.Blockhash,
    solana.TransactionPayer(from.PublicKey()),
)

// 3. Sign
tx.Sign(func(key solana.PublicKey) *solana.PrivateKey {
    if key.Equals(from.PublicKey()) {
        return &from
    }
    return nil
})

// 4. Send
sig, _ := client.SendTransaction(ctx, tx)
```

### Token Swap Flow

```go
// 1. Get swap quote from Jupiter
quote, _ := jupiter.GetQuote(ctx, inputMint, outputMint, amount)

// 2. Get swap transaction from Jupiter
swapTx, _ := jupiter.GetSwapTransaction(ctx, quote)

// 3. Deserialize and sign
tx, _ := solana.TransactionFromBytes(swapTx)
tx.Sign(signer)

// 4. Submit
sig, _ := client.SendTransaction(ctx, tx)
```

---

## Data Flow

### Trading Cycle

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OODA Trading Cycle                             │
└─────────────────────────────────────────────────────────────────────┘

     ┌─────────────────────────────────────────┐
     │           1. OBSERVE                    │
     │                                         │
     │  ┌─────────────────────────────────┐   │
     │  │ Solana Tracker API              │   │
     │  │ • Token prices                 │   │
     │  │ • OHLCV data                   │   │
     │  │ • Trending tokens              │   │
     │  └─────────────────────────────────┘   │
     │                                         │
     │  ┌─────────────────────────────────┐   │
     │  │ Helius RPC                      │   │
     │  │ • Current slot                 │   │
     │  │ • Wallet balance               │   │
     │  │ • Transaction history          │   │
     │  └─────────────────────────────────┘   │
     └─────────────────┬───────────────────────┘
                       │
                       ▼
     ┌─────────────────────────────────────────┐
     │           2. ORIENT                      │
     │                                         │
     │  ┌─────────────────────────────────┐   │
     │  │ Strategy Engine                  │   │
     │  │ • Calculate RSI                 │   │
     │  │ • Calculate EMA                │   │
     │  │ • Calculate ATR                │   │
     │  │ • Score signals                │   │
     │  └─────────────────────────────────┘   │
     │                                         │
     │  ┌─────────────────────────────────┐   │
     │  │ ClawVault Memory                │   │
     │  │ • Recall past patterns          │   │
     │  │ • Check historical trades      │   │
     │  └─────────────────────────────────┘   │
     └─────────────────┬───────────────────────┘
                       │
                       ▼
     ┌─────────────────────────────────────────┐
     │           3. DECIDE                      │
     │                                         │
     │  ┌─────────────────────────────────┐   │
     │  │ Signal Evaluation                │   │
     │  │                                  │   │
     │  │ Strength = weighted_score()      │   │
     │  │ Confidence = base + indicators   │   │
     │  │                                  │   │
     │  │ IF Strength >= 0.5              │   │
     │  │    AND Confidence >= 0.6        │   │
     │  │    THEN: Generate Action         │   │
     │  └─────────────────────────────────┘   │
     └─────────────────┬───────────────────────┘
                       │
                       ▼
     ┌─────────────────────────────────────────┐
     │           4. ACT                        │
     │                                         │
     │  ┌─────────────────────────────────┐   │
     │  │ Jupiter Ultra Swap               │   │
     │  │                                  │   │
     │  │ 1. GET /ultra/v1/order          │   │
     │  │ 2. Sign transaction             │   │
     │  │ 3. POST /ultra/v1/execute       │   │
     │  │ 4. Monitor for TP/SL            │   │
     │  └─────────────────────────────────┘   │
     │                                         │
     │  ┌─────────────────────────────────┐   │
     │  │ ClawVault Update                │   │
     │  │ • Record trade                 │   │
     │  │ • Store position              │   │
     │  │ • Update memory               │   │
     │  └─────────────────────────────────┘   │
     └─────────────────┬───────────────────────┘
```

---

## Configuration Schema

```yaml
# ~/.config/clawd/config.yaml

version: "1.0"

# OODA Loop Settings
ooda:
  mode: "simulated"          # "simulated" or "live"
  interval_seconds: 60        # Cycle interval
  max_positions: 3            # Simultaneous positions
  position_size_pct: 0.10    # 10% of wallet
  min_signal_strength: 0.5   # Signal threshold
  min_confidence: 0.6        # Confidence threshold
  auto_optimize: true       # Auto-adjust params
  learn_interval_min: 30     # Learning cycle
  watchlist:
    - "token-mint-1"
    - "token-mint-2"

# Trading Strategy
strategy:
  rsi_overbought: 70
  rsi_oversold: 30
  ema_fast_period: 9
  ema_slow_period: 21
  stop_loss_pct: 0.02        # 2%
  take_profit_pct: 0.04      # 4%
  use_perps: false

# Solana Configuration
solana:
  helius_api_key: ""
  helius_rpc_url: ""
  helius_wss_url: ""
  solana_tracker_api_key: ""
  wallet_pubkey: ""
  wallet_key_path: "~/.config/clawd/wallet.json"
  max_position_sol: 0.5

# Gateway Settings
gateway:
  host: "0.0.0.0"
  port: 18790
  auth:
    mode: "token"
    token: ""
```

---

## API Reference

### CLI Commands

| Command | Description |
|---------|-------------|
| `clawd ooda` | Start OODA trading loop |
| `clawd agent` | Chat with AI agent |
| `clawd status` | Show system status |
| `clawd gateway` | Manage gateway |
| `clawd memory` | Query/manage memory |

### Internal APIs

```go
// Agent
agent.Start()               // Start trading loop
agent.Stop()                // Stop trading loop
agent.TriggerCycle()        // Force immediate cycle
agent.SetMode("live")       // Switch modes

// On-chain
engine.GetSOLBalance(ctx, pubkey)
engine.SendSOL(ctx, from, to, lamports)
engine.GetSwapQuote(ctx, input, output, amount)
engine.ExecuteSwap(ctx, input, output, amount, privKey)

// RPC
rpc.GetBalance(pubkey)
rpc.GetSlot()
rpc.GetLatestBlockhash()
rpc.SendTransaction(tx)
```

---

## Security Model

### Wallet Security

1. **Local Signing** — Private keys never leave the agent
2. **Key Storage** — Encrypted wallet file with passphrase
3. **Reserve Balance** — Never trade entire wallet
4. **Hardware Support** — Ledger/Trezor integration planned

### Transaction Security

1. **Simulation** — All trades simulated before execution
2. **Confirmation** — Wait for finality before proceeding
3. **Retry Logic** — Exponential backoff on failures
4. **Error Handling** — Graceful degradation on RPC issues

---

## Performance

### Memory Usage

- **Daemon**: ~10MB RAM
- **With MCP**: ~50MB RAM
- **Boot time**: <1 second

### RPC Rate Limits

| Provider | Free Tier | Paid Tier |
|----------|-----------|-----------|
| Helius | 100K credits | 1M+ credits |
| Solana Tracker | 10 req/s | 100 req/s |
| QuickNode | Limited | Unlimited |

---

## Future Enhancements

- [ ] Ledger/Trezor hardware wallet support
- [ ] Multi-wallet trading pools
- [ ] GMGN.ai integration for sniping
- [ ] DEX arbitrage between Raydium/Orca
- [ ] Cross-chain bridges (Ethereum, Arbitrum)
- [ ] AI-powered signal generation with Grok

---

*Architecture documentation · OpenClawd · The Hermes of Web3*
