# Trading Bots

Automated trading bots for the OpenClawd ecosystem.

## Projects

### pumpfun-mayhem-ai-trading-bot-main

AI-powered trading bot for Pump.fun tokens with intelligent entry/exit strategies.

### pumpfun-mayhem-sniper-main

High-speed sniper bot for Pump.fun token acquisitions.

## Features

- **OODA Loop Trading** — Observe, Orient, Decide, Act
- **Pump.fun Integration** — Direct bonding curve interaction
- **Risk Management** — Position sizing, stop losses, drawdown protection
- **Real-time Analysis** — Token scanning, holder tracking, graduation watches

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your HELIUS_API_KEY and SOLANA_PRIVATE_KEY

# Run in simulation mode
npm run sim

# Run in live trading mode (careful!)
npm run trade
```

## Safety

⚠️ **Live trading involves real funds. Always:**
- Test in simulation mode first
- Set appropriate position limits
- Monitor bot activity
- Understand the risks

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)