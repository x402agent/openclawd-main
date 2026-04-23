# 🦞 OpenClawd Trading Guide

> **Complete guide to running autonomous Solana trading with OpenClawd**

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Wallet Setup](#wallet-setup)
3. [Running Your First Trade](#running-your-first-trade)
4. [Understanding the OODA Loop](#understanding-the-ooda-loop)
5. [Strategy Configuration](#strategy-configuration)
6. [Risk Management](#risk-management)
7. [Monitoring & Alerts](#monitoring--alerts)
8. [Advanced Usage](#advanced-usage)

---

## Prerequisites

### Required

- **Go 1.25+** — [Install Go](https://go.dev/doc/install)
- **Solana CLI** — `sh -c "$(curl -sSfL "https://release.solana.com/stable/install.sh")"`
- **RPC Provider** — Helius, Triton, or QuickNode

### Optional

- **Modulino® Hardware** — For physical alerts and controls
- **Tailscale** — For remote node access

---

## Wallet Setup

### 1. Generate Agent Wallet

```bash
# Create new wallet
solana-keygen new --outfile ~/.config/clawd/wallet.json

# Get public key
solana-keygen pubkey ~/.config/clawd/wallet.json
```

### 2. Fund Wallet

```bash
# Send SOL to the public key shown above
# Minimum recommended: 2-5 SOL for trading
```

### 3. Configure Private Key

```bash
# Export private key (KEEP SECURE!)
solana-keygen show ~/.config/clawd/wallet.json

# Or set environment variable
export SOLANA_PRIVATE_KEY="your-base58-private-key"
```

### 4. Verify Connection

```bash
clawd status
```

Expected output:
```
🖥️ solana-clawd Status

Solana:
  Helius:   ✓
  Wallet:   7x...abc
```

---

## Running Your First Trade

### Step 1: Simulated Trading (Recommended)

```bash
# Start with simulated trades (no real money)
clawd ooda --sim --interval 60
```

The agent will:
1. Observe market conditions
2. Generate signals for your watchlist
3. Simulate trades with fake positions
4. Log all decisions

### Step 2: Configure Watchlist

Edit `~/.config/clawd/config.yaml`:

```yaml
ooda:
  watchlist:
    - "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"  # BONK
    - "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN"  # JUP
    # Add more tokens...
```

### Step 3: Go Live

```bash
# Ensure wallet is funded (>1 SOL recommended)
# Start live trading
clawd ooda --interval 30
```

---

## Understanding the OODA Loop

The OODA (Observe-Orient-Decide-Act) loop is the core of OpenClawd's trading system.

### Observe

```
📡 OBSERVE:
├── Solana Tracker API
│   ├── Token prices
│   ├── 24h volume
│   ├── Liquidity
│   └── Holder count
├── Helius RPC
│   ├── Current slot
│   ├── Wallet balance
│   └── Transaction history
└── Aster Perps (optional)
    ├── Funding rates
    └── Open interest
```

### Orient

```
🧠 ORIENT:
├── Technical Indicators
│   ├── RSI (14-period)
│   ├── EMA (9/21-period)
│   └── ATR (14-period)
├── Volume Analysis
│   └── Volume spike detection
└── ClawVault Memory
    └── Historical patterns
```

### Decide

```
⚖️ DECIDE:
├── Signal Scoring
│   ├── RSI Score (0-1)
│   ├── EMA Score (0-1)
│   ├── Volume Score (0-1)
│   └── Momentum Score (0-1)
├── Confidence Calculation
│   └── Weighted average
└── Action Decision
    └── BUY / SELL / HOLD
```

### Act

```
⚡ ACT:
├── Entry Order (Jupiter Ultra)
│   └── MEV-protected swap
├── Stop Loss
│   └── ATR-based trailing
└── Take Profit
    └── 2:1 reward:risk ratio
```

---

## Strategy Configuration

### Default Strategy Parameters

```yaml
strategy:
  # RSI Settings
  rsi_overbought: 70      # Sell signal threshold
  rsi_oversold: 30        # Buy signal threshold
  
  # EMA Settings  
  ema_fast_period: 9     # Fast EMA periods
  ema_slow_period: 21     # Slow EMA periods
  
  # Risk Management
  stop_loss_pct: 0.02      # 2% stop loss
  take_profit_pct: 0.04   # 4% take profit
  position_size_pct: 0.10  # 10% of wallet per trade
  max_position_sol: 0.5    # Max SOL per position
  
  # Advanced
  use_perps: false         # Enable perpetual futures
  min_signal_strength: 0.5  # Minimum signal threshold
  min_confidence: 0.6      # Minimum confidence threshold
```

### Aggressive Strategy

```yaml
strategy:
  rsi_overbought: 65
  rsi_oversold: 35
  ema_fast_period: 5
  ema_slow_period: 13
  stop_loss_pct: 0.015
  take_profit_pct: 0.03
  position_size_pct: 0.15
  max_position_sol: 1.0
```

### Conservative Strategy

```yaml
strategy:
  rsi_overbought: 75
  rsi_oversold: 25
  ema_fast_period: 12
  ema_slow_period: 26
  stop_loss_pct: 0.03
  take_profit_pct: 0.06
  position_size_pct: 0.05
  max_position_sol: 0.25
```

---

## Risk Management

### Position Sizing

```
Position Size = min(
  Wallet Balance × Position Size %,
  Max Position SOL,
  Available SOL - Reserve
)

Reserve = 0.5 SOL (never traded)
```

### Stop Loss Logic

```python
if direction == "long":
    stop_loss = entry_price * (1 - stop_loss_pct)
elif direction == "short":
    stop_loss = entry_price * (1 + stop_loss_pct)
```

### Take Profit Logic

```python
if direction == "long":
    take_profit = entry_price * (1 + take_profit_pct)
elif direction == "short":
    take_profit = entry_price * (1 - take_profit_pct)
```

### Position Limits

| Limit | Default | Description |
|-------|---------|-------------|
| Max Positions | 3 | Simultaneous open positions |
| Max SOL/Position | 0.5 | Single position size |
| Min Position | 0.01 SOL | Minimum trade size |
| Reserve | 0.5 SOL | Always keep in wallet |

---

## Monitoring & Alerts

### CLI Monitoring

```bash
# Real-time status
clawd status

# Show open positions
clawd agent -m "show positions"

# Show trade history
clawd agent -m "recent trades"
```

### Memory Recall

```bash
# Query past trades
clawd memory recall "BONK trades last week"

# Query market analysis
clawd memory recall "pump.fun tokens"

# Query wallet activity
clawd memory recall "wallet 7x...abc"
```

### Hardware Alerts (Modulino®)

| Pixel | Meaning |
|-------|---------|
| 🟢 Green | Idle, watching |
| 🔵 Blue | Signal detected |
| 🟡 Yellow | Position open |
| 🔴 Red | Stop loss hit |
| 💰 Gold | Take profit hit |

---

## Advanced Usage

### Custom RPC Endpoint

```bash
clawd ooda --rpc https://your-custom-rpc.com
```

### Multiple Watchlists

```bash
# High risk tokens
clawd ooda --watchlist high-risk.txt

# Memecoin rotation
clawd ooda --watchlist memecoins.txt
```

### Hardware Integration

```bash
# Start with I2C hardware
clawd ooda --hw-bus 1

# Emergency stop
# Press Modulino Button C

# Trigger manual cycle
# Press Modulino Button A

# Adjust RSI threshold
# Turn Modulino Knob
```

### API Server

```bash
# Start REST API
clawd daemon --api-port 8080

# Query positions
curl http://localhost:8080/api/positions

# Query signals
curl http://localhost:8080/api/signals
```

---

## Troubleshooting

### "Wallet has 0 SOL"

```bash
# Check balance
solana balance

# If low, airdrop devnet SOL
solana airdrop 2
```

### "No actionable tokens"

Your watchlist contains only SOL/WSOL. Add real token mints.

### "RPC timeout"

Check your RPC provider status. Consider switching to a faster provider.

### "Trade blocked"

Check for trade blockers in the OODA logs. Common causes:
- Wallet balance below reserve
- No actionable tokens in watchlist
- RPC provider not configured

---

## Security Best Practices

1. **Never share private keys** — Use hardware wallets when possible
2. **Start small** — Test with 0.1-0.5 SOL before scaling
3. **Monitor logs** — Review all trading decisions
4. **Keep reserve** — Never trade your entire balance
5. **Use hardware killswitch** — Enable emergency stop

---

## Next Steps

- Read [SOUL.md](SOUL.md) — Agent identity and philosophy
- Read [STRATEGY.md](STRATEGY.md) — Deep dive into strategy engine
- Join [Telegram](https://t.me/clawdtoken) — Community support
- Follow [@clawddevs](https://x.com/clawddevs) — Updates and alpha

---

*OpenClawd Trading Guide · The Hermes of Web3*
