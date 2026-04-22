# 🦞 OpenClawd Examples

Example code and demonstrations for the OpenClawd ecosystem.

**$CLAWD:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

---

## Available Examples

| Example | Description | Category |
|---------|-------------|----------|
| `blockchain-buddies-demo.ts` | Blockchain companions with unique wallets and trading styles | Agents |
| `listen-wallet.ts` | Wallet event listener for monitoring on-chain activity | Wallet |
| `ooda-loop.ts` | OODA (Observe-Orient-Decide-Act) autonomous trading loop | Trading |
| `x402-solana.ts` | x402 payment protocol integration for Solana | Payments |
| `auto-research-client.ts` | Karpathy-style self-improving research Wiki API client | Research |
| `lobster-trader.ts` | pump.fun bonding curve math, token analysis, and trade simulation | Trading |
| `orchestrator-client.ts` | Orchestrator API integration (agents, MCP tools, wallet, Metaplex) | Infrastructure |

### Blockchain Buddies Demo

```bash
npx tsx examples/blockchain-buddies-demo.ts
```

Fun demo showing off Solana-native trading companions with unique wallets, personalities, and trading styles.

### Listen Wallet

```bash
npx tsx examples/listen-wallet.ts
```

Wallet event listener for monitoring on-chain activity in real-time.

### OODA Loop

```bash
npx tsx examples/ooda-loop.ts
```

Full OODA (Observe-Orient-Decide-Act) autonomous trading loop — the core of the Lobster Agent architecture.

### x402 Solana

```bash
npx tsx examples/x402-solana.ts
```

x402 payment protocol integration for agent-to-agent payments on Solana.

### AutoResearch Client *(new)*

```bash
# Requires AutoResearch Wiki running at localhost:8000
npx tsx examples/auto-research-client.ts
```

Karpathy-style self-improving research client. Demonstrates chain research (pump.fun graduation scans), DeFi yield scanning, market sentiment analysis, and agent learning loops. See `docs/articles/AUTO_RESEARCH_AGENTS.md` for the full architecture.

### Lobster Trader *(new)*

```bash
npx tsx examples/lobster-trader.ts
```

pump.fun bonding curve trading simulation. Shows constant product AMM math (`x * y = k`), buy/sell calculations, graduation progress tracking, token analysis scoring, and Mayhem program fee recipient configuration. No live wallet required — runs entirely with mock data.

### Orchestrator Client *(new)*

```bash
# Requires orchestrator running at localhost:8787
npx tsx examples/orchestrator-client.ts
```

Full Orchestrator API integration demo. Shows how to connect to the OpenClawd Orchestrator for agent catalog browsing, MCP tool discovery, wallet management, and Metaplex Core asset operations (lobster agents, token launches, trades).

---

## Quick Reference

```bash
# Run any example
npx tsx examples/<example-name>.ts

# With environment overrides
ORCHESTRATOR_URL=http://localhost:8787 npx tsx examples/orchestrator-client.ts
RESEARCH_API_URL=http://localhost:8000 npx tsx examples/auto-research-client.ts
```

## Related

| Resource | Path |
|----------|------|
| Moltbook Agent Template | `moltbook-agent/` |
| AutoResearch Wiki | `llm-wiki-tang/` |
| Orchestrator Stack | `openclawd-stack/` |
| Agent Catalog | `AGENTS/agents-catalog.json` |
| MCP Server | `MCP/` |
| Skills Library | `skills/` |

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)
