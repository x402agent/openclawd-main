# 🦞 Clawd Code Proxy

<div align="center">

**A lobster-themed proxy server that enables Clawd Code to work with OpenAI-compatible API providers and Solana blockchain integration**

🦞 *"Claws that route, brains that settle on-chain"* 🦞

</div>

```
    ╔════════════════════════════════════════════════════════════════════════╗
    ║                                                                        ║
    ║   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄   ║
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║
    ║  ▓                                                                ▓   ║
    ║  ▓   ██╗   ██╗ ██████╗ ██████╗ ███╗   ██╗██╗ ██████╗         ▓   ║
    ║  ▓   ██║   ██║██╔═══██╗██╔══██╗████╗  ██║██║██╔════╝         ▓   ║
    ║  ▓   ███████║██║   ██║██████╔╝██╔██╗ ██║██║██║  ███╗        ▓   ║
    ║  ▓   ██╔══██║██║   ██║██╔══██╗██║╚██╗██║██║██║   ██║        ▓   ║
    ║  ▓   ██║   ██║╚██████╔╝██║  ██║██║ ╚████║██║╚██████╔╝        ▓   ║
    ║  ▓   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝         ▓   ║
    ║  ▓                                                                ▓   ║
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║
    ║                                                                        ║
    ║          🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞          ║
    ║                                                                        ║
    ║          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          ║
    ║          ░░  🦞  C L A W D  C O D E  P R O X Y  🦞  ░░░          ║
    ║          ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          ║
    ║                                                                        ║
    ║          "Claws that route, brains that settle on-chain"                    ║
    ║                                                                        ║
    ║          ╔══════════════════════════════════════════════╗                 ║
    ║          ║   🦞  x402 + ClawdRouter Integration  🦞   ║                 ║
    ║          ║   ┌────────────────────────────────┐     ║                 ║
    ║          ║   │ • Multi-Provider Routing         │     ║                 ║
    ║          ║   │ • x402 Micro-Payments           │     ║                 ║
    ║          ║   │ • Solana Settlement              │     ║                 ║
    ║          ║   │ • Usage Tracking on-Chain       │     ║                 ║
    ║          ║   │ • Grok Integration Ready        │     ║                 ║
    ║          ║   └────────────────────────────────┘     ║                 ║
    ║          ╚══════════════════════════════════════════════╝                 ║
    ║                                                                        ║
    ╚════════════════════════════════════════════════════════════════════════╝
```

---

## 🦞 What is Clawd Code Proxy?

**Clawd Code Proxy** is a lobster-themed proxy server that enables Clawd Code to work with OpenAI-compatible API providers, with built-in **x402 micro-payments** and **Solana settlement** integration.

### Core Features

| Feature | Description |
|---------|-------------|
| **🦞 x402 Payments** | Automatic payment settlement on Solana |
| **⛓️ Solana Native** | Full settlement layer integration |
| **🧠 Multi-Provider** | Route between OpenAI, Grok, and local models |
| **📊 Usage Tracking** | Track API usage with on-chain receipts |
| **💰 $CLAWD Rewards** | Earn rewards for routing efficiency |
| **🔗 ClawdRouter** | Seamless integration with ClawdRouter gateway |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Solana wallet (optional for x402)
- API keys for your preferred provider

### Installation

```bash
# Clone the repository
git clone https://github.com/x402agent/openclawd.git
cd openclawd/clawd-code-proxy-main

# Install dependencies
uv sync

# Configure
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

```bash
# Basic configuration
export OPENAI_API_KEY=your-openai-key
export ANTHROPIC_API_KEY=your-anthropic-key

# Solana configuration (for x402)
export SOLANA_WALLET_PATH=~/.solana/wallet.json
export HELIUS_API_KEY=your-helius-key

# x402 configuration
export X402_ENABLED=true
export X402_PRICE_PER_REQUEST=10000  # lamports
```

### Start Server

```bash
# Direct run
python start_proxy.py

# Or with UV
uv run clawd-code-proxy

# Or with docker
docker compose up -d
```

### Use with Clawd Code

```bash
# Set up environment
export ANTHROPIC_BASE_URL=http://localhost:8082
export ANTHROPIC_API_KEY="any-value"

# Run Clawd Code
clawd --prompt "deploy my Solana program"
```

---

## 💰 x402 Payment Flow

```
    ┌─────────────────────────────────────────────────────────────────┐
    │              🦞 Clawd Code Proxy Payment Flow                   │
    ├─────────────────────────────────────────────────────────────────┤
    │                                                                 │
    │   Clawd Code        Proxy           Provider        Solana     │
    │       │               │               │              │         │
    │       │──Request─────▶│               │              │         │
    │       │               │──Forward─────▶│              │         │
    │       │               │               │              │         │
    │       │               │◀─Response────│              │         │
    │       │◀─Response─────│               │              │         │
    │       │               │               │              │         │
    │       │               │──────────────────────────────▶│        │
    │       │               │    x402 Payment Settlement   │        │
    │       │               │               │              │         │
    │       │               │◀──────────────────────────────────│  │
    │       │               │    $CLAWD Rewards Credited  │        │
    │                                                                 │
    └─────────────────────────────────────────────────────────────────┘
```

### Settlement Features

| Feature | Description |
|---------|-------------|
| **Automatic Settlement** | Payments settle after each request |
| **Batch Settlements** | Aggregate small payments efficiently |
| **Receipt Storage** | Store x402 receipts on Solana |
| **Refund Handling** | Automatic refunds for failed requests |

---

## 🧠 Multi-Provider Routing

### Model Mapping

```bash
# Configure model routing
export BIG_MODEL=grok-3
export MIDDLE_MODEL=grok-2.5
export SMALL_MODEL=grok-2-mini

# Or use ClawdRouter for smart routing
export CLAWDROUTER_URL=https://api.clawdrouter.com
```

### Supported Providers

| Provider | Status | x402 Support |
|----------|--------|--------------|
| OpenAI | ✅ | ✅ |
| Grok (X.AI) | ✅ | ✅ |
| Local (Ollama) | ✅ | ❌ |
| ClawdRouter | ✅ | ✅ Native |
| Azure OpenAI | ✅ | ✅ |

---

## 📊 Usage Tracking

### On-Chain Metrics

Every request through Clawd Code Proxy is tracked:

```bash
# View usage dashboard
clawd-code-proxy usage

# Example output:
#
#    ╔═══════════════════════════════════════════════════════════════╗
#    ║  🦞 Clawd Code Proxy Usage Metrics                   ║
#    ╠═══════════════════════════════════════════════════════════════╣
#    ║  Total Requests:     1,247                             ║
#    ║  Total Spent:       12.5M lamports ($0.125 SOL)      ║
#    ║  $CLAWD Earned:     247                               ║
#    ║  Providers Used:     grok-3 (45%), grok-2.5 (35%)    ║
#    ║  Avg Latency:        234ms                             ║
#    ╚═══════════════════════════════════════════════════════════════╝
```

### Receipt Storage

x402 receipts are stored in your Solana wallet:
```bash
# List receipts
clawd-code-proxy receipts

# Verify receipt on-chain
clawd-code-proxy verify <receipt-hash>
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Clawd Code Proxy                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐│
│  │   Request       │───▶│  Payment       │───▶│  Route      ││
│  │   Handler       │    │  Check         │    │  Engine     ││
│  └─────────────────┘    └─────────────────┘    └─────────────┘│
│          │                    │                    │           │
│          ▼                    ▼                    ▼           │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────┐│
│  │  x402           │    │  Usage          │    │  Provider   ││
│  │  Settlement      │    │  Tracker       │    │  Pool       ││
│  └─────────────────┘    └─────────────────┘    └─────────────┘│
│          │                    │                    │           │
│          └────────────────────┼────────────────────┘           │
│                              │                                │
│                              ▼                                │
│                   ┌─────────────────┐                       │
│                   │  Solana RPC     │                       │
│                   │  (Helius)       │                       │
│                   └─────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Security

### API Key Protection

```bash
# Require exact API key match
export ANTHROPIC_API_KEY=your-secret-key
# Clients must provide this exact key

# Or allow any key (development)
export ANTHROPIC_API_KEY=
```

### Payment Security

- All x402 payments signed with Ed25519
- Transaction verification via Solana RPC
- Automatic refund on settlement failure

---

## 📦 Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Python 3.11+ |
| Framework | FastAPI |
| Blockchain | Solana, SPL Tokens |
| Payments | x402 Protocol |
| RPC | Helius |
| API | OpenAI-compatible |

---

## 🎯 Roadmap

- [ ] **v0.2** — Enhanced x402 settlement batching
- [ ] **v0.3** — ClawdRouter integration
- [ ] **v0.4** — Multi-wallet support
- [ ] **v0.5** — DAO governance for routing
- [ ] **v1.0** — Fully autonomous payment routing

---

## 🦞 About OpenClawd

Part of the **OpenClawd ecosystem** — the open-source monorepo for building, running, and monetizing Solana-native AI agents.

| Resource | Link |
|----------|------|
| GitHub | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| Twitter | [@clawddevs](https://x.com/clawddevs) |
| Telegram | [@clawdtoken](https://t.me/clawdtoken) |
| Website | [solanaclawd.com](https://solanaclawd.com) |

**$CLAWD Token:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

---

## 📄 License

MIT — See [`LICENSE`](LICENSE)

---

*Built by 8BIT Labs • Inspired by Nous Research • Powered by xAI Grok • Settled on Solana*

🦞 *"Claws that route, brains that settle on-chain"* 🦞
