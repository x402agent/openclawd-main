# solana-clawd-go

> **Open-source Solana AI agent framework powered by xAI Grok.**
> Go daemon + TypeScript MCP server + ClawdRouter for zero-config deployment.

- **Website:** [solanaclawd.com](https://solanaclawd.com)
- **Dev portal:** [docs.solanaclawd.com](https://docs.solanaclawd.com)
- **$CLAWD token:** [8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
- **Source:** [github.com/x402agent/solana-clawd](https://github.com/x402agent/solana-clawd)

---

## One-command install

### cURL (one-shot)

```bash
curl -fsSL https://solanaclawd.com/install | sh
```

The installer is served straight from this site — `/install` returns a signed shell script that picks your platform (macOS arm64, macOS x86_64, linux x86_64, linux arm64), pulls the matching binary, and drops `clawd`, `slnc`, and `clawd-tui` into `~/.local/bin`.

### NPM

```bash
npm i -g @clawd/cli
```

### Homebrew

```bash
brew install x402agent/tap/solana-clawd
```

---

## Quick start

```bash
# 1. clone + build
git clone https://github.com/x402agent/solana-clawd.git
cd solana-clawd/solana-clawd
make install

# 2. start trading
clawd daemon            # start the daemon
clawd ooda --sim        # simulated OODA loop (no money at risk)

# 3. or use ClawdRouter (zero-config, no API keys at birth)
clawd go
```

---

## cURL API examples

Every endpoint below is served through the hosted ClawdRouter at `api.solanaclawd.com` and is fronted by the same $CLAWD wallet gate used by the app.

### Balance check

```bash
curl -X POST https://api.solanaclawd.com/v1/rpc \
  -H "Authorization: Bearer $CLAWDRouter_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"method":"getBalance","params":["<wallet_pubkey>"]}'
```

### Token price

```bash
curl -X POST https://api.solanaclawd.com/v1/market/price \
  -H "Authorization: Bearer $CLAWDRouter_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"mint":"So11111111111111111111111111111111111111112"}'
```

### Pump.fun token scan

```bash
curl -X POST https://api.solanaclawd.com/v1/trading/scan \
  -H "Authorization: Bearer $CLAWDRouter_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"limit":20}'
```

### Jupiter swap quote

```bash
curl -X POST https://api.solanaclawd.com/v1/trading/quote \
  -H "Authorization: Bearer $CLAWDRouter_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"inputMint":"So11111111111111111111111111111111111111112",
       "outputMint":"<token_mint>",
       "amount":1000000000}'
```

Mint a key (and optionally enroll your own Ollama as a tunnel spoke) at [/keys](/keys).

---

## Binaries

| Binary | Purpose |
|--------|---------|
| `clawd` | Main daemon with OODA loop trading |
| `slnc` | solana-go CLI for direct RPC operations |
| `clawd-tui` | Terminal UI launcher |

Build targets:

```bash
make build        # clawd daemon
make slnc         # solana-go CLI
make tui          # TUI launcher
make slim         # slim profile (<10MB)
make orin         # cross-compile for NVIDIA Orin Nano
```

---

## MCP server (31+ tools)

| Category | Tools |
|----------|-------|
| Helius RPC | `account_info`, `balance`, `transactions`, `priority_fee` |
| Solana market | `price`, `trending`, `token_info`, `wallet_pnl` |
| Trading | `pump_token_scan`, `pump_buy_quote`, `pump_sell_quote` |
| Memory | `memory_recall`, `memory_write` |
| Wallet | `balance`, `address`, `transfer` |
| Agent | `agent_spawn`, `agent_list`, `agent_stop` |

---

## MawdBot OODA loop

```
OBSERVE → prices, volume, holders, dev-wallet, bonding%
ORIENT  → RSI/EMA/ATR scoring, confidence model
DECIDE  → confidence ≥ 0.60 → size band
ACT     → Jupiter swap / Hyperliquid / Aster
LEARN   → persist to ClawVault, feed auto-optimizer
```

---

## ClawVault memory tiers

| Tier | What it holds | Confidence |
|------|---------------|------------|
| **KNOWN** | API data, prices, balances, on-chain state | Verified, expires |
| **LEARNED** | Trade patterns, wallet behaviors, market correlations | Persistent, high trust |
| **INFERRED** | Derived signals, hypotheses, weak correlations | Tentative, revisable |

---

## Environment variables

### ClawdRouter (recommended — zero config)

```bash
CLAWDRouter_API_KEY=   # the only variable you need
```

### Individual providers (optional)

```bash
HELIUS_API_KEY=
HELIUS_RPC_URL=
XAI_API_KEY=
SOLANA_PRIVATE_KEY=
PRIVY_APP_ID=
HONCHO_API_KEY=
OPENROUTER_API_KEY=
```

---

## Drawdown cascade

| Drawdown | Action |
|----------|--------|
| 5% | Reduce weakest exposure, block high-risk pump.fun |
| 8% | Close all perp positions, revert to spot-only |
| 12% | Full halt on new risk until manual review |

---

## Packages

| Package | Purpose |
|---------|---------|
| `@clawd/cli` | Main CLI installer (clawd, nanosolana, solanaos aliases) |
| `@clawd/computer` | Full runtime package |
| `@clawd/installer` | One-command installer with ClawdRouter |
| `solanaos-cli` | Legacy SolanaOS compatibility |
| `nanosolana-cli` | Legacy nanosolana support |

---

## Related docs

- [CLAWD_ROUTER.md](./CLAWD_ROUTER.md) — router architecture
- [CLAWD_ROUTER_TUNNEL.md](./CLAWD_ROUTER_TUNNEL.md) — reverse WebSocket tunnel
- [clawd-brain-honcho.md](./clawd-brain-honcho.md) — persistent agent memory
- [monetize-agents-openclawd.md](./monetize-agents-openclawd.md) — payments
- [ARTICLE_PAYMENTS.md](../ARTICLE_PAYMENTS.md) — x402 / MPP / AP2 / A2A loop
- [ARTICLE_TUNNELS.md](../ARTICLE_TUNNELS.md) — wallet-gated tunnel walkthrough

---

*solana-clawd-go · Go + TypeScript · x402 protocol · solanaclawd.com*
