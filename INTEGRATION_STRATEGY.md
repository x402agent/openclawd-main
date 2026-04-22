# OpenClawd × SolanaOS Integration Strategy

## Overview

This document outlines how to connect the **OpenClawd** monorepo (TypeScript/Node.js) with the **SolanaOS** binary (Go) into a unified autonomous AI agent system.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        OpenClawd System                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────┐   │
│  │ Chrome Ext  │───▶│ OpenClawd        │◀───│ Claude Desktop │   │
│  │ pAGENT      │    │ Orchestrator     │    │ MCP Client    │   │
│  │ (Browser)   │    │ (Node.js/Hono)   │    │               │   │
│  └─────────────┘    └────────┬─────────┘    └────────────────┘   │
│                              │                                   │
│  ┌─────────────┐    ┌────────▼─────────┐    ┌────────────────┐   │
│  │ ClawdHub    │◀───│ MCP Bridge       │───▶│ 49 Agents      │   │
│  │ (React)     │    │ (Port 3001)      │    │ (Metaplex)     │   │
│  └─────────────┘    └────────┬─────────┘    └────────────────┘   │
│                              │                                   │
│  ┌─────────────┐    ┌────────▼─────────┐    ┌────────────────┐   │
│  │ Honcho      │    │ Wallet Bridge    │───▶│ Privy Wallet   │   │
│  │ Memory      │    │ (Port 8421)      │    │ (E2B Sandbox)  │   │
│  └─────────────┘    └────────┬─────────┘    └────────────────┘   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    SolanaOS        │
                    │    (Go Binary)      │
                    │    Port 18790       │
                    ├─────────────────────┤
                    │ • OODA Trading Loop │
                    │ • Telegram Bot      │
                    │ • Wallet Vault      │
                    │ • Honcho Memory     │
                    │ • x402 Payments    │
                    └─────────────────────┘
```

---

## Connection Points

### 1. Gateway Bridge (Port 18790 ↔ 7777)

The SolanaOS daemon exposes a WebSocket gateway at port 18790. The OpenClawd orchestrator can connect as a client:

```typescript
// openclawd-stack/orchestrator/gateway-bridge.ts
export async function connectToSolanaOS() {
  const gateway = new WebSocket('ws://localhost:18790');
  
  gateway.on('message', (data) => {
    // Route gateway events to OpenClawd agents
    orchestrator.broadcast(data);
  });
  
  gateway.on('send', (msg) => {
    // Forward OpenClawd commands to SolanaOS
    gateway.send(JSON.stringify(msg));
  });
}
```

### 2. Wallet API Integration (Port 8421)

SolanaOS has a wallet vault at port 8421. OpenClawd can use this for trading:

```typescript
// openclawd-stack/orchestrator/wallet-bridge.ts
export async function executeTradeViaSolanaOS(params: {
  inputMint: string;
  outputMint: string;
  amountSol: number;
}) {
  const response = await fetch('http://localhost:8421/v1/wallets/trade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  return response.json();
}
```

### 3. MCP Server Coordination (Port 3001)

Both systems expose MCP servers. Coordinate via shared tools:

| Tool | SolanaOS MCP | OpenClawd MCP |
|------|--------------|---------------|
| solana.price | ✅ | ✅ |
| solana.trading | ✅ | ✅ |
| agent.spawn | ❌ | ✅ |
| memory.recall | ✅ | ✅ |
| wallet.execute | ✅ | ✅ |

### 4. Memory Layer (Honcho v3)

Both systems use Honcho for cross-session memory:

```typescript
// Unified memory layer
export async function unifiedRecall(query: string) {
  // Check OpenClawd vault first
  const openclawdMem = await openclawdVault.recall(query);
  
  // Then check SolanaOS Honcho
  const solanaosMem = await honchoClient.search({ query });
  
  // Merge and deduplicate
  return mergeMemory([openclawdMem, solanaosMem]);
}
```

### 5. x402 Payment Integration

Both systems support x402 for agent-to-agent payments:

```typescript
// Payment routing
export async function routePayment(payment: {
  amount: number;
  recipient: string;
  chain: 'solana' | 'base';
}) {
  // Use OpenClawd x402 if available, fall back to SolanaOS
  if (openclawdX402.isReady()) {
    return openclawdX402.pay(payment);
  }
  return solanaosX402.pay(payment);
}
```

---

## Unified Agent Catalog

Both systems share the same 49-agent Metaplex catalog:

```
openclawd/AGENTS/agents-catalog.json
    │
    ├──▶ OpenClawd Orchestrator (Node.js)
    │         │
    │         └──▶ MCP Bridge (port 3001)
    │                   │
    │                   └──▶ Claude Desktop / Cursor
    │
    └──▶ SolanaOS (Go)
              │
              └──▶ Telegram Bot
                        │
                        └──▶ User
```

---

## Installation Flow

### One-Shot Install Command

```bash
# Clone both repos
git clone https://github.com/x402agent/openclawd.git
git clone https://github.com/x402agent/SolanaOS.git

# Run OpenClawd installer
cd openclawd
bash chrome-extension/install-openclawd.sh

# Run SolanaOS installer
cd ../SolanaOS
bash start.sh

# Connect them together
openclawd connect --solanaos ~/SolanaOS
```

### Auto-Connection

The installer can auto-detect and connect:

1. **Scan for SolanaOS binary** at `~/SolanaOS/solanaos`
2. **Read config** at `~/.solanaos/solanaos.json`
3. **Extract gateway port** (default 18790)
4. **Configure OpenClawd** to connect

```bash
#!/usr/bin/env bash
# auto-connect.sh

SOLANAOS_PATH="${1:-$HOME/SolanaOS}"
GATEWAY_PORT="${2:-18790}"

# Check if SolanaOS is running
if pgrep -f solanaos > /dev/null; then
  echo "SolanaOS daemon found"
else
  echo "Starting SolanaOS..."
  (cd "$SOLANAOS_PATH" && ./solanaos daemon &)
fi

# Configure OpenClawd
cat > openclawd-stack/orchestrator/.env.local << EOF
SOLANAOS_GATEWAY_URL=ws://localhost:$GATEWAY_PORT
SOLANAOS_CONFIG_PATH=$HOME/.solanaos/solanaos.json
HONCHO_API_KEY=$HONCHO_API_KEY
PRIVY_APP_ID=$PRIVY_APP_ID
EOF

echo "OpenClawd connected to SolanaOS at localhost:$GATEWAY_PORT"
```

---

## Shared Data Structures

### Agent Identity (8004 Registry)

Both systems use the same ACP registry format:

```json
{
  "schema_version": "1.0",
  "name": "openclawd-solanaos-hybrid",
  "display_name": "OpenClawd × SolanaOS",
  "services": {
    "gateway": "ws://localhost:18790",
    "orchestrator": "http://localhost:3001",
    "wallet": "http://localhost:8421"
  },
  "capabilities": ["trading", "memory", "payments", "browser"]
}
```

### Memory Format (KNOWN/LEARNED/INFERRED)

Both systems use the same epistemology:

```
vault/
├── known/       # API data (prices, OHLCV)
├── learned/     # Trading insights (patterns, mistakes)
├── inferred/    # Cross-domain synthesis
└── inbox/       # Pending items
```

---

## Feature Parity Matrix

| Feature | OpenClawd | SolanaOS | Unified |
|---------|-----------|----------|---------|
| OODA Trading | ✅ (via agents) | ✅ (native) | ✅ |
| Wallet Vault | ✅ (Privy) | ✅ (Go) | ✅ |
| Honcho Memory | ✅ | ✅ | ✅ |
| MCP Bridge | ✅ (port 3001) | ✅ (port 3001) | ✅ |
| Telegram Bot | ❌ | ✅ | ✅ |
| Chrome Extension | ✅ | ❌ | ✅ |
| x402 Payments | ✅ | ✅ | ✅ |
| Metaplex Agents | ✅ (49) | ❌ | ✅ |
| BitAxe Mining | ❌ | ✅ | ✅ |
| Seeker Mobile | ❌ | ✅ | ✅ |

---

## Migration Path

### Phase 1: Loose Coupling (Current)
- SolanaOS runs as standalone Go binary
- OpenClawd connects via gateway WebSocket
- No shared state yet

### Phase 2: Shared Memory
- Both systems use same Honcho workspace
- Unified vault structure
- Cross-referencing agent identities

### Phase 3: Unified Control
- OpenClawd orchestrator controls SolanaOS
- Single CLI (`openclawd`) manages both
- Shared agent catalog

### Phase 4: Merged Binary
- Compile SolanaOS into OpenClawd
- Single Go+Node hybrid binary
- Unified frontend at hub.solanaclawd.com

---

## CLI Integration

### Unified Command

```bash
# openclawd CLI
openclawd start              # Start OpenClawd orchestrator
openclawd start solanaos     # Start SolanaOS daemon
openclawd status             # Show both systems
openclawd connect            # Auto-detect and connect
openclawd agent spawn        # Spawn 49 agents
openclawd wallet swap        # Execute swap
openclawd memory recall      # Query vault
openclawd agents list        # Show agent catalog
```

### Status Command

```bash
$ openclawd status

🦞 OpenClawd System Status
━━━━━━━━━━━━━━━━━━━━━━━━━

OpenClawd Orchestrator
  Status: 🟢 Running
  Port: 3001
  Agents: 49/49 active

SolanaOS Daemon
  Status: 🟢 Running
  Gateway: ws://localhost:18790
  Mode: LIVE

Wallet Bridge
  Status: 🟢 Connected
  Port: 8421

Memory Layer
  Honcho: 🟢 Connected
  Vault: 🟢 1,247 entries

━━━━━━━━━━━━━━━━━━━━━━━━━
$CLAWD: 1,234.56 SOL equivalent
```

---

## Security Model

### Air-Gapped Keys
- SolanaOS generates keys with AES-256-GCM encryption
- OpenClawd wallet bridge uses same encryption
- Keys never leave localhost

### x402 Gating
- Agent-to-agent payments via x402 protocol
- Both systems support Solana USDC + Base ETH
- Payment verification on-chain

### MCP Security
- Local-only MCP servers
- No remote tool execution
- User approval for trades

---

## Future: Merge Repos

Eventually, merge SolanaOS into openclawd:

```
openclawd/
├── chrome-extension/     # Browser integration
├── clawdhub/             # Web frontend
├── openclawd-stack/      # Runtime orchestrator
├── solanaos/             # ← SolanaOS Go binary (merged)
│   ├── cmd/              # CLI entrypoints
│   ├── pkg/              # 55 Go packages
│   └── services/
├── AGENTS/               # 49 AI agents
├── skills/               # Skills marketplace
└── ...
```

Run as single command:
```bash
openclawd start --all   # Starts everything
```

---

## Next Steps

1. ✅ Chrome extension rebranded to OpenClawd
2. ✅ One-shot installer created
3. 🔲 Connect orchestrator to SolanaOS gateway
4. 🔲 Share memory layer (Honcho)
5. 🔲 Unified CLI (`openclawd start --solanaos`)
6. 🔲 Test full integration
7. 🔲 Document merge strategy