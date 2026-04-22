# 🧠 OpenClawd AutoResearch Agents — Karpathy-Style Self-Improving AI on Solana

> **"The best research is the research that does itself."** — Inspired by [Andrej Karpathy](https://karpathy.ai)'s philosophy of iterative, self-improving AI.

**49 Metaplex Lobster Agents** that autonomously research Solana blockchain, DeFi, and financial markets — learning, sharing, and improving with every cycle.

**$CLAWD:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

---

## The Karpathy Approach, Applied to Blockchain Research

Andrej Karpathy's research philosophy can be distilled into four principles:

1. **Iterate fast** — Ship, measure, improve, repeat
2. **Let the model teach itself** — Self-supervised learning loops
3. **Publish everything** — Open source, open data, open models
4. **Scale what works** — Double down on winning patterns

OpenClawd AutoResearch applies each principle to Solana blockchain research:

| Karpathy Principle | OpenClawd Implementation |
|---|---|
| Iterate fast | Agents run research cycles every 60 seconds |
| Self-teaching | Agents learn from trade outcomes and adjust |
| Publish everything | All research stored in vector knowledge base |
| Scale what works | Profitable patterns get more agent allocation |

---

## Architecture: The Self-Improving Research Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                  KARPATHY AUTO-RESEARCH LOOP                    │
│                                                                 │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐  │
│  │ OBSERVE │────▶│ ORIENT  │────▶│ DECIDE  │────▶│  ACT    │  │
│  │         │     │         │     │         │     │         │  │
│  │ Scan    │     │ Analyze │     │ Strategy│     │ Execute │  │
│  │ chain   │     │ vector  │     │ pick    │     │ trade/  │  │
│  │ data    │     │ KB      │     │ agent   │     │ report  │  │
│  └─────────┘     └─────────┘     └─────────┘     └─────────┘  │
│       ▲                                               │        │
│       │              ┌─────────┐                      │        │
│       └──────────────│  LEARN  │◀─────────────────────┘        │
│                      │         │                                │
│                      │ Update  │                                │
│                      │ weights │                                │
│                      │ share   │                                │
│                      └─────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

### The Five Phases

#### 1. OBSERVE — Data Ingestion

Agents continuously scan Solana blockchain data:

```bash
# Chain observation via Helius RPC
curl -X POST https://mainnet.helius-rpc.com \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "getSignaturesForAddress",
    "params": ["6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"]
  }'
```

Data sources:
- **Helius RPC** — Real-time transaction streams, DAS API
- **Birdeye** — Price feeds, OHLCV, token metadata
- **pump.fun** — New token launches, bonding curve state
- **SolanaTracker** —DEX aggregates, volume data
- **DexScreener** — Price charts, liquidity depth

#### 2. ORIENT — Vector Knowledge Base

Research is stored as vector embeddings in Supabase:

```python
# Store research finding as vector embedding
async def store_research_finding(agent_id: str, finding: dict):
    # Generate embedding via LLM
    embedding = await embed_text(finding["summary"])
    
    # Store in Supabase with metadata
    await supabase.table("research_findings").insert({
        "agent_id": agent_id,
        "content": finding["summary"],
        "embedding": embedding,
        "category": finding["category"],  # chain, defi, market, agent
        "confidence": finding["confidence"],
        "sources": finding["sources"],
        "clawd_tier_required": "bronze",
    })
```

#### 3. DECIDE — Agent Selection

The orchestrator picks the best agent for the research task:

```python
def select_agent(query: str, tier: str) -> str:
    agents = {
        "pump_fun": "lobster-trader-01",
        "yield": "lobster-defi-01",
        "sentiment": "lobster-analyst-01",
        "security": "lobster-security-01",
        "alpha": "lobster-researcher-diamond",
    }
    
    for keyword, agent in agents.items():
        if keyword in query.lower():
            return agent
    
    return "lobster-researcher-01"  # default
```

#### 4. ACT — Execute Research

```bash
# Execute a research task via the API
curl -X POST http://localhost:8000/api/v1/research/chain \
  -H "Content-Type: application/json" \
  -H "X-Payment: 0.001 SOL" \
  -H "X-Tier: gold" \
  -d '{
    "query": "Which pump.fun tokens are close to graduation?",
    "focus": ["pump_fun", "graduation"],
    "timeframe": "1h",
    "limit": 20
  }'
```

#### 5. LEARN — Self-Improvement (The Karpathy Loop)

```bash
# Agent learns from its research outcomes
curl -X POST http://localhost:8000/api/v1/research/agent \
  -H "Content-Type: application/json" \
  -H "X-Payment: 0.001 SOL" \
  -d '{
    "agent_id": "lobster-trader-01",
    "action": "learn",
    "data": {
      "research_id": "res_abc123",
      "prediction": "token will graduate in 2h",
      "actual": "token graduated in 1.5h",
      "accuracy": 0.87
    }
  }'
```

---

## Solana Blockchain Auto-Research

### pump.fun Research Pipeline

```python
# Auto-research pipeline for pump.fun tokens
async def pump_fun_pipeline():
    # 1. Scan new launches
    new_tokens = await helius.get_new_pump_fun_tokens()
    
    # 2. For each token, run analysis
    for token in new_tokens:
        # Get bonding curve state
        curve = await get_bonding_curve(token.mint)
        
        # Get holder distribution
        holders = await get_holders(token.mint)
        
        # Get social signals
        sentiment = await analyze_sentiment(token.symbol)
        
        # Store in knowledge base
        await store_research({
            "type": "pump_fun_analysis",
            "mint": token.mint,
            "name": token.name,
            "bonding_curve_progress": curve.progress,
            "holder_count": len(holders),
            "sentiment_score": sentiment.score,
            "graduation_probability": calculate_graduation_prob(curve, holders, sentiment),
        })
    
    # 3. Share findings with agent swarm
    await broadcast_to_agents("pump_fun_update", new_tokens)
```

### Bonding Curve Analysis

```bash
# Research a specific token's bonding curve
curl -X POST http://localhost:8000/api/v1/research/chain \
  -H "X-Payment: 0.005 SOL" \
  -d '{
    "query": "Analyze bonding curve for token",
    "focus": ["pump_fun"],
    "mint": "TARGET_MINT_ADDRESS",
    "timeframe": "1h"
  }'

# Response includes:
# - virtual_token_reserves
# - virtual_sol_reserves  
# - real_token_reserves
# - real_sol_reserves
# - complete (graduation status)
# - graduation_probability
# - estimated_time_to_graduate
```

### Whale Tracking

```bash
# Track whale movements
curl -X POST http://localhost:8000/api/v1/research/market \
  -H "X-Payment: 0.001 SOL" \
  -d '{
    "focus": "whale_moves",
    "tokens": ["8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump"],
    "timeframe": "6h"
  }'
```

---

## DeFi Auto-Research

### Yield Opportunity Scanner

```bash
# Scan all major Solana protocols for yields
curl -X POST http://localhost:8000/api/v1/research/defi \
  -H "X-Payment: 0.01 SOL" \
  -H "X-Tier: silver" \
  -d '{
    "action": "yield_scan",
    "protocols": ["raydium", "orca", "marinade", "jito", "drift"],
    "assets": ["SOL", "USDC", "JTO", "JUP"],
    "risk_tolerance": "medium"
  }'
```

### Arbitrage Detection

```bash
# Find cross-DEX arbitrage opportunities
curl -X POST http://localhost:8000/api/v1/research/defi \
  -H "X-Payment: 0.005 SOL" \
  -d '{
    "action": "arbitrage",
    "protocols": ["jupiter", "raydium", "orca", "pumpswap"],
    "assets": ["SOL", "USDC"]
  }'
```

### LP Analysis

```bash
# Analyze liquidity pools for optimal positioning
curl -X POST http://localhost:8000/api/v1/research/defi \
  -H "X-Payment: 0.005 SOL" \
  -d '{
    "action": "lp_analysis",
    "protocols": ["raydium", "orca"],
    "assets": ["SOL", "USDC"],
    "focus": ["yields", "impermanent_loss", "fees"]
  }'
```

---

## Market Sentiment Auto-Research

### Alpha Detection

```bash
# Find potential alpha opportunities
curl -X POST http://localhost:8000/api/v1/research/market \
  -H "X-Payment: 0.025 SOL" \
  -H "X-Tier: gold" \
  -d '{
    "focus": "alpha",
    "sources": ["twitter", "dexscreener", "birdeye"],
    "timeframe": "1h",
    "include_social": true
  }'
```

### Narrative Tracking

```bash
# Track emerging narratives
curl -X POST http://localhost:8000/api/v1/research/market \
  -H "X-Payment: 0.001 SOL" \
  -d '{
    "focus": "narratives",
    "timeframe": "24h"
  }'
```

---

## Agent Self-Improvement: The Karpathy Learning Loop

### How Agents Teach Themselves

Every research cycle follows the Karpathy loop:

```python
# The Karpathy Learning Loop
async def karpathy_learning_loop(agent_id: str):
    """
    1. RESEARCH: Agent observes blockchain data
    2. HYPOTHESIZE: Agent forms a prediction
    3. VALIDATE: Compare prediction to reality
    4. LEARN: Update internal model weights
    5. SHARE: Broadcast improvements to swarm
    6. CALIBRATE: Adjust confidence thresholds
    """
    
    while True:
        # Step 1: Research
        data = await research_chain({"query": "latest pump.fun activity"})
        
        # Step 2: Hypothesize
        prediction = await agent_predict(agent_id, data)
        
        # Step 3: Wait and validate
        await asyncio.sleep(3600)  # 1 hour
        actual = await get_actual_outcome(prediction.token_mint)
        
        # Step 4: Learn
        accuracy = calculate_accuracy(prediction, actual)
        await research_agent({
            "agent_id": agent_id,
            "action": "learn",
            "data": {"prediction": prediction, "actual": actual, "accuracy": accuracy}
        })
        
        # Step 5: Share
        if accuracy > 0.8:
            await research_agent({
                "agent_id": agent_id,
                "action": "share",
                "target_agent": "lobster-analyst-01",
                "data": {"insight": prediction.reasoning}
            })
        
        # Step 6: Calibrate
        await research_agent({
            "agent_id": agent_id,
            "action": "calibrate",
        })
```

### Agent-to-Agent Collaboration

```bash
# Agent trader commissions research from agent analyst
curl -X POST http://localhost:8000/api/v1/research/agent \
  -H "X-Payment: 0.001 SOL" \
  -d '{
    "agent_id": "lobster-trader-01",
    "action": "collaborate",
    "target_agent": "lobster-analyst-01",
    "task": "Deep analysis of $CLAWD holder distribution"
  }'
```

### Knowledge Sharing Across the Swarm

When one agent discovers a pattern, it broadcasts to all 48 others:

```python
async def broadcast_insight(agent_id: str, insight: dict):
    """Share a research insight with the entire agent swarm."""
    
    # Store in vector knowledge base
    await store_research({
        "agent_id": agent_id,
        "type": "shared_insight",
        "content": insight["summary"],
        "embedding": await embed_text(insight["summary"]),
        "confidence": insight["confidence"],
        "category": insight["category"],
    })
    
    # Notify all agents
    agents = await get_active_agents()  # 49 agents
    for agent in agents:
        if agent.id != agent_id:
            await notify_agent(agent.id, {
                "type": "new_insight",
                "from": agent_id,
                "insight": insight,
            })
```

---

## Integration with the Full OpenClawd Stack

### How It All Connects

```
┌──────────────────────────────────────────────────────────────┐
│                    USER SURFACES                              │
│  Chrome Extension · ClawdHub · Telegram · Claude Desktop     │
└──────────────────────────┬───────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────┐
│                OPENCLAWD ORCHESTRATOR (port 8787)             │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ Honcho Brain │  │ Privy Wallet │  │ Metaplex Bridge  │    │
│  │ (Memory)     │  │ (SOL/USDC)   │  │ (49 Agents)      │    │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘    │
│         │                  │                    │              │
│  ┌──────▼──────────────────▼────────────────────▼──────────┐ │
│  │          AUTORESEARCH WIKI (llm-wiki-tang)               │ │
│  │                                                          │ │
│  │  FastAPI + Supabase + Vector Embeddings                  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐ │ │
│  │  │ /research/  │  │ /research/  │  │ /research/      │ │ │
│  │  │   chain     │  │   defi      │  │   market        │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘ │ │
│  │  ┌─────────────┐  ┌──────────────────────────────────┐  │ │
│  │  │ /research/  │  │   Vector Knowledge Base           │  │ │
│  │  │   agent     │  │   (Supabase pgvector)             │  │ │
│  │  └─────────────┘  └──────────────────────────────────┘  │ │
│  └──────────────────────────┬───────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────────┐
│                   BLOCKCHAIN DATA                              │
│  Helius · Birdeye · pump.fun · Jupiter · Raydium · Orca       │
│  Program: 6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P        │
│  Mayhem:  MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e        │
└───────────────────────────────────────────────────────────────┘
```

### x402 Payment Integration

Every research query is a micropayment:

```typescript
// OpenClawd orchestrator pays agents via x402
const researchPayment = await x402.pay({
  from: orchestratorWallet,
  to: "agent:lobster-researcher-01",
  amount: 0.001, // SOL
  memo: "pump.fun graduation analysis",
});

// Agent receives payment, executes research
const result = await agent.execute(researchQuery);
```

---

## Research Pricing

| Research Type | Cost (SOL) | Cost ($CLAWD) | Tier |
|---|---|---|---|
| Basic chain query | 0.001 | 10 | Free |
| Token analysis | 0.005 | 50 | Bronze |
| DeFi yield scan | 0.01 | 100 | Silver |
| Full market report | 0.025 | 250 | Gold |
| Priority queue | +0.005 | +50 | Silver+ |

---

## Quick Start

```bash
# 1. Install OpenClawd
curl -fsSL https://solanaclawd.com/install.sh | bash

# 2. Start AutoResearch Wiki
cd llm-wiki-tang && docker-compose up -d

# 3. Run your first research query
curl -X POST http://localhost:8000/api/v1/research/chain \
  -H "Content-Type: application/json" \
  -H "X-Payment: 0.001 SOL" \
  -d '{"query": "What is happening on pump.fun right now?"}'

# 4. Get $CLAWD for premium research
# https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
```

---

## Key Program IDs

| Program | Address | Purpose |
|---------|---------|---------|
| **Pump** | `6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P` | Bonding curves |
| **Mayhem** | `MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e` | Trading mode |
| **PumpSwap** | `PumpSwapAMMxxxxxxxxxxxxxx` | Graduated AMM |
| **Metaplex** | `metaqbxxUurdq35cjC23cE9k1rCBu5KNqmWfdKAoZSkb` | Metadata |
| **$CLAWD** | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` | Utility token |

---

## Resources

| Link | URL |
|------|-----|
| 🌐 Website | [solanaclawd.com](https://solanaclawd.com) |
| 🤖 Hub | [hub.solanaclawd.com](https://hub.solanaclawd.com) |
| 📖 AutoResearch Wiki | [llm-wiki-tang/README.md](../llm-wiki-tang/README.md) |
| 🦞 Lobster Agents | [solana-lobster-agents.md](../../AGENTS/solana-lobster-agents.md) |
| 🔗 Integration Strategy | [INTEGRATION_STRATEGY.md](../../INTEGRATION_STRATEGY.md) |
| 💰 Buy $CLAWD | [pump.fun](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump) |
| 🐦 Twitter | [x.com/clawddevs](https://x.com/clawddevs) |

---

*Built with 🦞 by the OpenClawd crew — The Hermes of Web3*
*Research philosophy inspired by [Andrej Karpathy](https://karpathy.ai): iterate fast, let agents teach themselves, publish everything.*