# solana-clawd

> Open-source Solana AI agent framework powered by xAI Grok · Built with Go + TypeScript

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

## What is solana-clawd?

**solana-clawd** is an open-source Solana AI agent framework combining:
- **Go runtime** with native gagliardetto/solana-go SDK for direct on-chain operations
- **OODA loop** trading engine (MawdBot) for Pump.fun and Solana spot
- **31+ MCP tools** for market data, trading, and wallet operations
- **OpenClawd integration** with OpenShell sandboxes and ClawdRouter API
- **Privy wallets** for agentic wallet management at birth (no API keys needed)

**Website:** [solanaclawd.com](https://solanaclawd.com)  
**$CLAWD Token:** [8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
**Dev Portal:** [docs.solanaclawd.com](https://docs.solanaclawd.com)

## Quick Start

### Go Daemon (Recommended)

```bash
cd solana-clawd
make install          # Install clawd, clawd-tui, slnc binaries

clawd daemon          # Start the daemon
clawd ooda --sim      # Simulated trading
clawd gateway start   # Start native gateway
```

### TypeScript MCP Server

```bash
git clone https://github.com/x402agent/Solana-Os-Go
cd solana-clawd
npm install
npm run build

# Configure environment
cp .env.example .env

# Run MCP server
npm start
```

## Project Structure

```
solana-clawd/
├── Makefile                 # Go build (clawd, slnc, orin cross-compile)
├── go.mod / go.sum          # Go dependencies + gagliardetto/solana-go
├── main.go                  # Go daemon entry point
├── hardware.go              # Modulino® I2C integration
├── memory_commands.go       # ClawVault memory commands
│
├── pkg/                     # Go packages
│   ├── solana/              # SolanaRPC wrapper for gagliardetto/solana-go
│   ├── agent/               # OODA loop agent
│   ├── config/              # Configuration
│   ├── gateway/             # TCP bridge gateway
│   └── ...
│
├── src/                     # TypeScript MCP server
├── skills/                  # 97 bundled SKILL.md files
├── docs/                    # Documentation
├── packages/                # npm packages
│
├── third_party/solana-go/   # gagliardetto/solana-go SDK
│   ├── rpc/                 # RPC client
│   ├── programs/            # Token, Stake, System programs
│   ├── cmd/slnc/            # slnc CLI tool
│   └── ...
│
└── tailclawd/              # TailClawd integration
```

## Core Components

### Go Runtime (slnc CLI)

The `slnc` tool provides direct access to the solana-go SDK:

```bash
# Build slnc
make slnc

# Use slnc
./build/slnc --help
```

Features:
- Account/Key management
- Transaction building and signing  
- RPC client operations
- Program instructions (Token, Stake, System, etc.)
- Address lookup tables

### MCP Server (31 tools)

| Category | Tools |
|----------|-------|
| Helius RPC | account_info, balance, transactions, priority_fee |
| Solana Market | price, trending, token_info, wallet_pnl |
| Trading | pump_token_scan, pump_buy_quote, pump_sell_quote |
| Memory | memory_recall, memory_write |
| Wallet | balance, address, transfer |
| Agent | agent_spawn, agent_list, agent_stop |

### MawdBot Trading Agent

```
OBSERVE  → prices, volume, holders, dev-wallet, bonding%
ORIENT   → RSI/EMA/ATR scoring, confidence model
DECIDE   → confidence ≥ 0.60 → size band
ACT      → Jupiter swap / Hyperliquid order / Aster order
LEARN    → persist to ClawVault, feed auto-optimizer
```

### Memory Tiers (ClawVault Epistemology)

| Tier | What it holds | Confidence |
|------|---------------|------------|
| **KNOWN** | API data, prices, balances, on-chain state | Verified, expires |
| **LEARNED** | Trade patterns, wallet behaviors, market correlations | Persistent, high trust |
| **INFERRED** | Derived signals, hypotheses, weak correlations | Tentative, revisable |

### OpenClawd Integration

The `openclawd-stack/` directory provides:
- **OpenShell Sandboxes** - Secure isolated execution (NVIDIA)
- **nemoClawd** - xAI Grok integration with 31 MCP tools
- **ClawdRouter API** - Unified API at birth (no API keys needed)
- **Privy wallets** - Agentic wallet integration

## npm Packages

| Package | Purpose |
|---------|---------|
| `@clawd/cli` | Main CLI installer |
| `@clawd/daemon` | Go daemon binary |
| `solanaos-cli` | SolanaOS compatibility |
| `nanosolana-cli` | Legacy nanosolana support |

Install via:
```bash
npm i -g @clawd/cli
clawd go
```

## Commands (Go Daemon)

```
clawd daemon              # Start the daemon
clawd ooda                # Start autonomous OODA loop
clawd ooda --sim          # Simulated trading mode
clawd ooda --hw-bus 1     # With Modulino® hardware
clawd gateway start       # Start native TCP gateway
clawd gateway setup-code  # Generate Seeker setup code
clawd node run            # Connect hardware node
clawd agent               # Interactive agent chat
clawd status              # Show system status
clawd hardware scan        # Scan I2C bus
```

## Environment Variables

```bash
# ClawdRouter (recommended - no API keys needed at birth)
CLAWDRouter_API_KEY=      # ClawdRouter unified API key

# Or individual providers (optional)
HELIUS_API_KEY=            # Helius RPC/DAS
HELIUS_RPC_URL=            # Helius mainnet RPC
XAI_API_KEY=              # xAI Grok
SOLANA_PRIVATE_KEY=       # Trading wallet (base58)
PRIVY_APP_ID=             # Privy app
HONCHO_API_KEY=           # Honcho v3 memory
OPENROUTER_API_KEY=       # OpenRouter
```

## Build Targets

```bash
make build          # Build clawd daemon
make slnc           # Build solana-go CLI
make tui            # Build TUI launcher
make slim           # Build slim daemon (<10MB)
make orin           # Cross-compile for NVIDIA Orin Nano
make install        # Install to /usr/local/bin
make docker         # Build Docker image
```

## OpenClawd Stack

For production deployments, see `../openclawd-stack/`:

```
openclawd-stack/
├── NemoClawd-main/        # xAI Grok + 31 MCP tools
├── orchestrator/          # MCP server + Privy wallet
├── deploy/e2b-solana-clawd/  # E2B cloud deployment
├── gateway/                # Gateway services
├── payments/               # Payment processing
└── SOLANA_CLAWD_SHELL.md   # Full architecture guide
```

## Related Projects

- [Solana-Os-Go](https://github.com/x402agent/Solana-Os-Go) — Main monorepo
- [SolanaOS](https://github.com/x402agent/SolanaOS) — Legacy operator runtime
- [x402 protocol](https://github.com/x402agent/x402-go) — HTTP 402 payments

## Documentation

- [SOUL.md](SOUL.md) — Agent identity and epistemology
- [SKILL.md](SKILL.md) — Complete skill documentation
- [STRATEGY.md](STRATEGY.md) — Multi-venue trading strategy
- [TRADE.md](TRADE.md) — MawdBot trading agent skill
- [openclawd-stack/SOLANA_CLAWD_SHELL.md](../openclawd-stack/SOLANA_CLAWD_SHELL.md) — Full stack integration

## License

MIT · [github.com/x402agent/solana-clawd](https://github.com/x402agent/solana-clawd)

---

*solana-clawd v1.0 · Go + TypeScript · MIT · x402 Protocol*
