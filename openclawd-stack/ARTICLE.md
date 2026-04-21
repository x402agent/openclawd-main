# solana-clawd: The Complete Guide to the Solana AI Agent Runtime

> **Everything you need to know about the most powerful autonomous Solana trading agent**

---

## 🎯 What Is solana-clawd?

**solana-clawd** is an open-source Solana AI agent framework that lets you run autonomous trading agents on your machine. Powered by xAI Grok, it combines the OODA (Observe-Orient-Decide-Act) loop with ClawVault memory to make intelligent trading decisions 24/7.

### Key Stats

| Metric | Value |
|--------|-------|
| **Runtime** | Go + TypeScript |
| **RAM Usage** | < 10MB |
| **MCP Tools** | 31+ |
| **Trading Venues** | Jupiter, Pump.fun, Hyperliquid, Aster |
| **Memory Tiers** | KNOWN / LEARNED / INFERRED |
| **Install Time** | < 10 seconds |

---

## 🚀 Install Now

### Option 1: cURL (Instant)
```bash
curl -fsSL https://solanaclawd.com/install | sh
```

### Option 2: NPM
```bash
npm i -g @clawd/cli
```

### Option 3: Homebrew
```bash
brew install x402agent/tap/solana-clawd
```

---

## 📋 What's New in v1.0

### Summary of Changes

| Change | Impact |
|--------|--------|
| **gagliardetto/solana-go SDK** | Native on-chain operations at Go speeds |
| **slnc CLI** | Direct RPC access from command line |
| **Updated npm packages** | Modern `@clawd/cli` naming |
| **OpenClawd Stack** | Production-ready deployment |
| **ClawdRouter API** | Zero-config mode (no API keys needed) |
| **One-command install** | `curl -fsSL https://solanaclawd.com/install \| sh` |

---

## 1️⃣ Go Runtime & slnc CLI

### What is slnc?

The `slnc` (Solana CLI) binary provides direct access to the gagliardetto/solana-go SDK. It's built from the `third_party/solana-go/` directory and gives you:

- ✅ Account and key management
- ✅ Transaction building and signing
- ✅ RPC client operations
- ✅ Token, Stake, System program instructions
- ✅ Address lookup tables

### Build slnc

```bash
cd solana-clawd
make slnc
./build/slnc --help
```

### All Build Targets

```bash
make build        # Build clawd daemon
make slnc         # Build solana-go CLI
make tui          # Build TUI launcher
make slim         # Build slim profile (<10MB)
make orin         # Cross-compile for NVIDIA Orin Nano
make install      # Install all binaries
```

---

## 2️⃣ Updated NPM Packages

### Package Rename Table

| Old Name | New Name | Purpose |
|----------|----------|---------|
| `clawdbot-installer` | `@clawd/cli` | Main CLI installer |
| `solanaos` | `@clawd/computer` | Full runtime |
| `solanaos-installer` | `@clawd/installer` | One-command installer |

### Installation

```bash
# Main CLI
npm i -g @clawd/cli

# Full computer package
npm i -g @clawd/computer

# One-shot installer
npm i -g @clawd/installer
```

### Binary Aliases

All packages create these aliases:
- `clawd` — Main command
- `nanosolana` — Legacy alias
- `solanaos` — Legacy alias

---

## 3️⃣ ClawdRouter API (Zero-Config!)

### The Problem (Before)

Setting up solana-clawd required **5-10 API keys**:

```bash
HELIUS_API_KEY=xxx
HELIUS_RPC_URL=xxx
XAI_API_KEY=xxx
PRIVY_APP_ID=xxx
OPENROUTER_API_KEY=xxx
# ... and more
```

### The Solution (Now)

**ClawdRouter API** gives you everything with **one key**:

```bash
CLAWDRouter_API_KEY=xxx  # That's it!
```

### Start with Zero-Config

```bash
clawd go    # Automatically uses ClawdRouter at birth
```

---

## 4️⃣ OpenClawd Stack

### What's Included

| Component | Description |
|-----------|-------------|
| **OpenShell Sandboxes** | Secure, isolated execution (NVIDIA) |
| **nemoClawd** | xAI Grok integration with 31 MCP tools |
| **ClawdRouter API** | Unified API at birth |
| **Privy Wallets** | Agentic wallet integration |
| **E2B Deployment** | Cloud sandbox deployment |

### Project Structure

```
openclawd-stack/
├── NemoClawd-main/           # xAI Grok + MCP
├── orchestrator/             # MCP server + Privy
├── deploy/e2b-solana-clawd/  # Cloud deployment
├── gateway/                  # Gateway services
├── payments/                 # Payment processing
└── SOLANA_CLAWD_SHELL.md     # Architecture guide
```

### Use the Stack

```bash
cd openclawd-stack
npx @clawd/cli go
```

---

## 5️⃣ cURL API Examples

### Check Balance
```bash
curl -X POST https://api.solanaclawd.com/v1/rpc \
  -H "Authorization: Bearer $CLAWDRouter_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"method":"getBalance","params":["<wallet_pubkey>"]}'
```

### Get Token Price
```bash
curl -X POST https://api.solanaclawd.com/v1/market/price \
  -H "Authorization: Bearer $CLAWDRouter_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mint":"So11111111111111111111111111111111111111112"}'
```

### Scan Pump.fun
```bash
curl -X POST https://api.solanaclawd.com/v1/trading/scan \
  -H "Authorization: Bearer $CLAWDRouter_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit":20}'
```

### Get Jupiter Quote
```bash
curl -X POST https://api.solanaclawd.com/v1/trading/quote \
  -H "Authorization: Bearer $CLAWDRouter_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "<token_mint>",
    "amount": 1000000000
  }'
```

---

## 6️⃣ Go Daemon Commands

### Core Commands

```bash
clawd daemon              # Start the daemon
clawd status              # System status
clawd agent               # Interactive agent chat
```

### OODA Loop

```bash
clawd ooda               # Start live trading
clawd ooda --sim         # Simulated (no real money)
clawd ooda --hw-bus 1    # With Modulino hardware
```

### Gateway

```bash
clawd gateway start       # Start native TCP gateway
clawd gateway setup-code  # Generate setup code for Seeker
```

---

## 7️⃣ How OODA Trading Works

### The Loop

```
OBSERVE  → prices, volume, holders, dev-wallet, bonding%
ORIENT   → RSI/EMA/ATR scoring, confidence model
DECIDE   → confidence ≥ 0.60 → size band
ACT      → Jupiter swap / Hyperliquid order / Aster order
LEARN    → persist to ClawVault, feed auto-optimizer
```

### What Happens Each Cycle

1. **OBSERVE** — Bot watches Solana market data
2. **ORIENT** — Analyzes RSI, EMA, ATR signals
3. **DECIDE** — Confidence score triggers trade or skip
4. **ACT** — Executes via Jupiter (spot) or Hyperliquid/Aster (perps)
5. **LEARN** — Saves insights to ClawVault for future

---

## 8️⃣ ClawVault Memory Tiers

### Three-Tier System

| Tier | Content | Confidence |
|------|---------|------------|
| **KNOWN** | API data, prices, balances, on-chain state | Verified, expires |
| **LEARNED** | Trade patterns, wallet behaviors, correlations | Persistent, high trust |
| **INFERRED** | Derived signals, hypotheses, weak correlations | Tentative, revisable |

### Why It Matters

- **KNOWN**: Fast, verified data from APIs
- **LEARNED**: Patterns the bot discovers over time
- **INFERRED**: Hypotheses to test without risking real money

---

## 9️⃣ Risk Management (Drawdown Cascade)

### Automatic Protection

| Drawdown | Action |
|----------|--------|
| **5%** | Reduce weakest position, block high-risk Pump.fun |
| **8%** | Close all perp positions, revert to spot-only |
| **12%** | Full halt, require manual review to resume |

---

## 🔧 Getting Started Checklist

### Step 1: Install (Pick One)

```bash
# cURL (Fastest)
curl -fsSL https://solanaclawd.com/install | sh

# NPM
npm i -g @clawd/cli

# Homebrew
brew install x402agent/tap/solana-clawd
```

### Step 2: Build from Source (Optional)

```bash
git clone https://github.com/x402agent/Solana-Os-Go.git
cd Solana-Os-Go/solana-clawd
make install
```

### Step 3: Start Trading

```bash
# Recommended for first time
clawd daemon
clawd ooda --sim

# Or use zero-config
clawd go
```

### Step 4: Customize (Optional)

```bash
# Single key (ClawdRouter)
CLAWDRouter_API_KEY=your_key_here

# Or individual providers
HELIUS_API_KEY=your_helius_key
XAI_API_KEY=your_xai_key
SOLANA_PRIVATE_KEY=your_wallet_key
```

---

## 🏗️ Architecture Overview

```
╔══════════════════════════════════════════════════════════════╗
║                  solana-clawd Architecture                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   ┌──────────┐    ┌──────────┐    ┌─────────────┐          ║
║   │  Go CLI  │◄──►│ 31+ MCP  │◄──►│ OpenClawd   │          ║
║   │ clawd/   │    │  Tools   │    │   Stack     │          ║
║   │  slnc    │    └──────────┘    └─────────────┘          ║
║   └──────────┘          │                  │               ║
║         │               │                  │               ║
║   ══════╪══════════════╪══════════════════╪═════════════   ║
║         │               │                  │               ║
║   ┌─────┴───────────────┴──────────────────┴─────────┐     ║
║   │              ClawdRouter API                     │     ║
║   │         (Zero-Config · One Key)                 │     ║
║   └──────────────────────────────────────────────────┘     ║
║                              │                              ║
║              ┌──────────────┴──────────────┐             ║
║              │     Privy + x402 Wallets     │             ║
║              └──────────────────────────────┘             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 📚 Full Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Quick start and overview |
| [SOUL.md](solana-clawd/SOUL.md) | Agent identity & epistemology |
| [SKILL.md](solana-clawd/SKILL.md) | Complete skill documentation |
| [STRATEGY.md](solana-clawd/STRATEGY.md) | Multi-venue trading strategy |
| [TRADE.md](solana-clawd/TRADE.md) | MawdBot trading agent |
| [DAEMON.md](solana-clawd/DAEMON.md) | Go daemon operation |
| [SECURITY.md](solana-clawd/SECURITY.md) | Security best practices |

---

## 🔗 Resources

| Resource | Link |
|----------|------|
| **Website** | [solanaclawd.com](https://solanaclawd.com) |
| **Docs** | [docs.solanaclawd.com](https://docs.solanaclawd.com) |
| **$CLAWD Token** | [pump.fun](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump) |
| **Twitter** | [x.com/clawddevs](https://x.com/clawddevs) |
| **GitHub** | [github.com/x402agent/solana-clawd](https://github.com/x402agent/solana-clawd) |

---

## 🚀 Next Steps

1. **Install**: `curl -fsSL https://solanaclawd.com/install | sh`
2. **Simulate**: `clawd ooda --sim`
3. **Go Live**: `clawd ooda`
4. **Customize**: Edit `.env` with your keys

---

## ⚖️ License

MIT License — See [LICENSE](LICENSE)

---

*solana-clawd v1.0 · Built with xAI Grok · solanaclawd.com*