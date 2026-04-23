# 🦞 OpenClawd — Autonomous Solana Trading Agent

> **Open-source Solana AI agent framework powered by xAI Grok · Built with Go + TypeScript**

```
   _____       __                        ________                    __
  / ___/____  / /___ _____  ____ _     / ____/ /___ __      ______/ /
  \__ \/ __ \/ / __ `/ __ \/ __ `/    / /   / / __ `/ | /| / / /_/ /
 ___/ / /_/ / / /_/ / / / / /_/ /    / /___/ / /_/ /| |/ |/ / /_/ /
/____/\____/_/\__,_/_/ /_/\__,_/     \____/_/\__,_/ |__/|__/\__,_/

                    ╔══════════════════════════╗
                    ║   POWERED BY xAI GROK  ║
                    ╚══════════════════════════╝
```

## What is OpenClawd?

**OpenClawd** is an autonomous Solana trading agent combining:

- **🦞 Native Go Runtime** — Built on `gagliardetto/solana-go` SDK for direct on-chain operations
- **📊 OODA Trading Loop** — Observe → Orient → Decide → Act autonomous cycle
- **🔗 Jupiter Ultra** — MEV-protected swap execution via Jupiter's Ultra API
- **🧠 ClawVault Memory** — Persistent trading memory with KNOWN/LEARNED/INFERRED tiers
- **💰 x402 Payments** — Native HTTP 402 protocol for Solana micropayments
- **📡 49 Metaplex Lobster Agents** — Swarm intelligence for market research

**$CLAWD Token:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
**Website:** [solanaclawd.com](https://solanaclawd.com)

---

## Quick Start

### Install (One Command)

```bash
curl -fsSL https://raw.githubusercontent.com/x402agent/openclawd/main/solana-clawd/install.sh | bash
```

### Build from Source

```bash
cd solana-clawd
make install          # Build and install clawd binary
clawd version         # Verify installation
```

### Run Autonomous Trading

```bash
# Simulated mode (no real trades)
clawd ooda --sim --interval 60

# Live trading (requires wallet funding)
clawd ooda --interval 30

# With Modulino® hardware
clawd ooda --hw-bus 1
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     OpenClawd Trading Agent                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              OODA Loop (Observe → Orient → Decide → Act)  │    │
│  │                                                          │    │
│  │  OBSERVE: Solana Tracker + Helius RPC + Birdeye         │    │
│  │  ORIENT:  RSI/EMA/ATR strategy engine                   │    │
│  │  DECIDE:  Signal scoring + confidence threshold         │    │
│  │  ACT:     Jupiter Ultra swaps + position tracking        │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│  ┌──────────────────────────┼──────────────────────────────┐   │
│  │                    Go Runtime                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │   │
│  │  │ solana-go   │  │ ClawVault   │  │ OnChain     │     │   │
│  │  │ SDK         │  │ Memory      │  │ Engine      │     │   │
│  │  │ (native RPC)│  │ (persist)   │  │ (Jupiter)   │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                    │
│  ┌──────────────────────────┼──────────────────────────────┐   │
│  │                  Solana Blockchain                        │   │
│  │  Helius RPC · Jupiter Ultra · pump.fun · Raydium        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │          49 Metaplex Lobster Agents (AutoResearch)      │    │
│  │  🦞 lobster-trader-01  🦞 lobster-analyst-02  ...       │    │
│  │  Research pump.fun, Birdeye, wallet clusters 24/7       │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## CLI Commands

### OODA Trading Loop

```bash
clawd ooda [flags]

Flags:
  --interval int    Cycle interval in seconds (default: 60)
  --sim             Simulated mode (no live trades)
  --hw-bus int      I2C bus for Modulino® hardware
  --no-hw           Disable hardware integration
```

### Gateway & Networking

```bash
clawd gateway start           # Start TCP bridge gateway
clawd gateway setup-code     # Generate Solana Seeker setup code
clawd node run              # Connect hardware node
```

### Agent Chat

```bash
clawd agent -m "What's the current SOL price?"
clawd agent                  # Interactive chat mode
```

### Status & Monitoring

```bash
clawd status                 # Show system status
clawd status --hw-bus 1      # With hardware scan
clawd hardware scan          # Scan I2C sensors
```

---

## Configuration

### Environment Variables

```bash
# RPC Providers (at least one required)
HELIUS_API_KEY=              # Helius RPC/DAS API key
HELIUS_RPC_URL=              # Helius RPC endpoint
HELIUS_WSS_URL=              # Helius WebSocket
SOLANA_TRACKER_API_KEY=      # SolanaTracker API key
SOLANA_TRACKER_RPC_URL=      # SolanaTracker RPC

# Trading
SOLANA_PRIVATE_KEY=          # Trading wallet (base58)
MAX_POSITION_SOL=0.1         # Max position size in SOL

# Jupiter
JUPITER_API_KEY=             # Jupiter API key (optional)

# AI / Memory
XAI_API_KEY=                 # xAI Grok API key
HONCHO_API_KEY=              # Honcho memory API

# x402 Payments
CLAWDRouter_API_KEY=         # ClawdRouter unified API
```

### Config File

```bash
~/.config/clawd/config.yaml
```

---

## OODA Strategy Engine

The trading loop uses a multi-indicator strategy:

### Indicators

| Indicator | Purpose | Default |
|----------|---------|---------|
| RSI | Overbought/Oversold | 70/30 |
| EMA | Trend direction | Fast: 9, Slow: 21 |
| ATR | Volatility-based stops | 14 periods |
| Volume | Liquidity filter | >$500K 24h |

### Signal Generation

```
Signal Strength = (RSI_score × 0.3) + (EMA_score × 0.4) + (Volume_score × 0.2) + (Momentum × 0.1)

Confidence = Base(0.4) + Indicator_Agreement(0.2) + Volume_Confirmation(0.2) + Historical_Performance(0.2)

Action = IF Confidence ≥ 0.60 AND Strength ≥ 0.50 THEN Trade
```

---

## ClawVault Memory

OpenClawd maintains persistent trading memory across sessions:

### Memory Tiers

| Tier | Content | Persistence |
|------|---------|-------------|
| **KNOWN** | Prices, balances, on-chain state | Expires |
| **LEARNED** | Trade patterns, wallet behaviors | Persistent |
| **INFERRED** | Hypotheses, weak correlations | Revisable |

### Memory Commands

```bash
clawd memory recall "recent trades"
clawd memory write "SOL showing strength"
clawd memory ls
```

---

## x402 Protocol Integration

OpenClawd supports native HTTP 402 payments for:

- **Priority RPC queries** — Pay per request
- **Premium agent access** — xAI Grok tiers
- **Swap fee sharing** — Revenue sharing with Jupiter

```bash
# Start with x402
clawd daemon --x402-enabled

# Check balance
clawd wallet balance
```

---

## Jupiter Ultra Integration

OpenClawd uses Jupiter Ultra for MEV-protected swaps:

### Swap Flow

```
1. OODA decides to BUY token X with 0.1 SOL
2. Engine calls GET /ultra/v1/order
3. Jupiter returns unsigned transaction
4. Agent signs locally with wallet
5. Agent submits via POST /ultra/v1/execute
6. Jupiter handles landing + confirmation
7. Agent monitors for TP/SL conditions
```

### Supported Routes

- SOL → SPL tokens
- USDC → SPL tokens
- Any Jupiter-supported pair

---

## Development

### Build

```bash
make build          # Build clawd binary
make slnc           # Build solana-go CLI
make tui            # Build TUI launcher
make slim           # Build slim daemon (<10MB)
make docker         # Build Docker image
make orin           # Cross-compile for NVIDIA Orin Nano
```

### Test

```bash
go test ./...           # Run all tests
go test -v ./pkg/agent  # Test agent package
clawd ooda --sim        # Manual testing
```

### Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code style guidelines
- Commit message format
- Testing requirements

---

## Directory Structure

```
solana-clawd/
├── main.go                  # Go daemon entry point
├── go.mod / go.sum          # Dependencies (gagliardetto/solana-go)
├── Makefile                 # Build targets
│
├── pkg/                     # Go packages
│   ├── agent/               # OODA trading loop
│   │   ├── ooda.go         # Main OODA agent
│   │   ├── vault.go        # ClawVault memory
│   │   └── hooks.go        # Hardware hooks
│   ├── solana/             # Solana SDK wrapper
│   │   ├── rpc.go          # Native solana-go RPC
│   │   ├── wallet.go       # Agent wallet
│   │   └── clients.go      # API clients
│   ├── onchain/            # On-chain operations
│   │   ├── engine.go       # RPC + WSS
│   │   └── jupiter.go      # Jupiter Ultra
│   ├── strategy/           # Trading strategy
│   ├── config/             # Configuration
│   └── memory/             # Memory persistence
│
├── cmd/clawd/              # CLI commands
├── src/                    # TypeScript MCP server
├── skills/                 # 97 bundled SKILL files
├── docs/                   # Documentation
└── examples/               # Usage examples
```

---

## Related Projects

| Project | Description |
|---------|-------------|
| [openclawd](https://github.com/x402agent/openclawd) | Main monorepo |
| [llm-wiki-tang](https://github.com/x402agent/openclawd/tree/main/llm-wiki-tang) | AutoResearch Wiki |
| [x402-go](https://github.com/x402agent/x402-go) | HTTP 402 payments |
| [pump.fun](https://pump.fun) | Solana memecoins |
| [Jupiter](https://jup.ag) | Solana DEX aggregator |

---

## License

MIT · [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd)

---

*OpenClawd v1.0 · Go + TypeScript · MIT · The Hermes of Web3*
