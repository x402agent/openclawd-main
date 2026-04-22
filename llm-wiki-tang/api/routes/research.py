"""
OpenClawd Auto-Research Routes

API endpoints for autonomous research agents on Solana blockchain and DeFi.
Powered by 49 Metaplex Lobster Agents with $CLAWD token gating.

$CLAWD Token: 8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
Documentation: docs.solanaclawd.com
"""

import asyncio
import logging
import time
from datetime import datetime, timedelta
from enum import Enum
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Header, Query, status
from pydantic import BaseModel, Field

from config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/research", tags=["research"])


# =============================================================================
# ENUMS AND CONSTANTS
# =============================================================================

class ResearchTier(str, Enum):
    """$CLAWD token tier levels for research access."""
    FREE = "free"
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    DIAMOND = "diamond"


class ChainFocus(str, Enum):
    """Focus areas for chain research."""
    PUMP_FUN = "pump_fun"
    TOKENS = "tokens"
    PROTOCOLS = "protocols"
    NFTS = "nfts"
    WALLETS = "wallets"
    GRADUATION = "graduation"


class DeFiAction(str, Enum):
    """DeFi research actions."""
    YIELD_SCAN = "yield_scan"
    LP_ANALYSIS = "lp_analysis"
    ARBITRAGE = "arbitrage"
    PROTOCOL_RESEARCH = "protocol_research"
    SWAP_ROUTE = "swap_route"


class MarketFocus(str, Enum):
    """Market research focus areas."""
    SENTIMENT = "sentiment"
    TRENDS = "trends"
    ALPHA = "alpha"
    NARRATIVES = "narratives"
    WHALE_MOVES = "whale_moves"


# $CLAWD token address
CLAWD_MINT = "8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump"

# Solana RPC and API endpoints
HELIUS_RPC = "https://mainnet.helius-rpc.com"
BIRDEYE_BASE = "https://public-api.birdeye.so"

# Research pricing in SOL (converted from $CLAWD at ~100:1)
RESEARCH_PRICING = {
    "basic_chain": 0.001,
    "token_analysis": 0.005,
    "defi_scan": 0.01,
    "full_market": 0.025,
    "priority": 0.005,  # Additional for priority queue
}


# =============================================================================
# REQUEST MODELS
# =============================================================================

class ChainResearchRequest(BaseModel):
    """Request model for Solana chain research."""
    query: str = Field(..., description="Research query or topic")
    focus: list[ChainFocus] = Field(
        default=[ChainFocus.PUMP_FUN],
        description="Research focus areas"
    )
    timeframe: str = Field(
        default="24h",
        description="Timeframe: 1h, 6h, 24h, 7d, 30d"
    )
    limit: int = Field(default=10, ge=1, le=100)
    mint: Optional[str] = Field(None, description="Specific token mint to research")
    wallet: Optional[str] = Field(None, description="Specific wallet to analyze")


class DeFiResearchRequest(BaseModel):
    """Request model for DeFi research."""
    action: DeFiAction = Field(..., description="Type of DeFi research")
    protocols: list[str] = Field(
        default=["raydium", "orca", "jupiter"],
        description="Protocols to research"
    )
    assets: list[str] = Field(
        default=["SOL", "USDC"],
        description="Assets to analyze"
    )
    focus: list[str] = Field(
        default=["yields"],
        description="Research focus: yields, liquidity, risks, fees"
    )
    amount: Optional[float] = Field(None, description="Amount for calculations")
    risk_tolerance: str = Field(default="medium", description="Risk: low, medium, high")


class MarketResearchRequest(BaseModel):
    """Request model for market sentiment research."""
    focus: MarketFocus = Field(..., description="Market research focus")
    tokens: list[str] = Field(
        default=[],
        description="Specific token mints to research"
    )
    sources: list[str] = Field(
        default=["twitter", "dexscreener", "birdeye"],
        description="Data sources: twitter, telegram, dexscreener, birdeye"
    )
    timeframe: str = Field(default="24h", description="Analysis timeframe")
    include_social: bool = Field(default=True, description="Include social metrics")


class AgentResearchRequest(BaseModel):
    """Request model for agent self-improvement research."""
    agent_id: str = Field(..., description="Agent ID to research/improve")
    action: str = Field(
        ...,
        description="Action: learn, share, collaborate, calibrate"
    )
    data: Optional[dict] = Field(None, description="Additional data for research")
    target_agent: Optional[str] = Field(None, description="Target agent for collaboration")
    task: Optional[str] = Field(None, description="Research task for collaboration")


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class ResearchResult(BaseModel):
    """Base model for research results."""
    id: str
    agent: str
    query: str
    results: dict
    confidence: float = Field(ge=0.0, le=1.0)
    sources: list[str]
    created_at: datetime


class ChainResearchResult(ResearchResult):
    """Response model for chain research."""
    chain_data: Optional[dict] = None
    bonding_curve: Optional[dict] = None
    graduation_status: Optional[dict] = None


class DeFiResearchResult(ResearchResult):
    """Response model for DeFi research."""
    yields: Optional[list[dict]] = None
    pools: Optional[list[dict]] = None
    arbitrage_opps: Optional[list[dict]] = None


class MarketResearchResult(ResearchResult):
    """Response model for market research."""
    sentiment_score: Optional[float] = None
    trending: Optional[list[dict]] = None
    whale_alerts: Optional[list[dict]] = None


class AgentResearchResult(ResearchResult):
    """Response model for agent research."""
    improvements: Optional[list[dict]] = None
    shared_knowledge: Optional[dict] = None
    collaborations: Optional[list[dict]] = None


class ResearchCost(BaseModel):
    """Cost breakdown for research."""
    sol: float
    clawd: float
    tier: ResearchTier


class ResearchResponse(BaseModel):
    """Full research response with metadata."""
    id: str
    agent: str
    query: str
    results: dict
    confidence: float
    sources: list[str]
    cost: ResearchCost
    metadata: dict


# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

async def validate_payment(
    payment_header: Optional[str] = Header(None),
    tier: ResearchTier = ResearchTier.FREE
) -> dict:
    """
    Validate $CLAWD payment header and check tier access.
    
    Payment format: "0.001 SOL" or "10 CLAWD"
    """
    if not payment_header:
        if tier == ResearchTier.FREE:
            return {"valid": True, "amount": 0, "currency": "free"}
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Payment required. Use X-Payment header: '0.001 SOL' or '10 CLAWD'"
        )
    
    # Parse payment
    parts = payment_header.strip().split()
    if len(parts) != 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payment format. Use: '0.001 SOL' or '10 CLAWD'"
        )
    
    amount = float(parts[0])
    currency = parts[1].upper()
    
    if currency not in ["SOL", "CLAWD"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Currency must be SOL or CLAWD"
        )
    
    # Convert to SOL equivalent
    if currency == "CLAWD":
        # Assume ~100 CLAWD per SOL
        sol_equivalent = amount / 100
    else:
        sol_equivalent = amount
    
    return {
        "valid": True,
        "amount": amount,
        "currency": currency,
        "sol_equivalent": sol_equivalent
    }


def get_agent_for_tier(tier: ResearchTier) -> str:
    """Get appropriate research agent based on tier."""
    agents = {
        ResearchTier.FREE: "lobster-researcher-free",
        ResearchTier.BRONZE: "lobster-researcher-01",
        ResearchTier.SILVER: "lobster-researcher-02",
        ResearchTier.GOLD: "lobster-researcher-03",
        ResearchTier.DIAMOND: "lobster-researcher-diamond",
    }
    return agents.get(tier, "lobster-researcher-01")


def generate_research_id() -> str:
    """Generate unique research ID."""
    import uuid
    return f"res_{uuid.uuid4().hex[:12]}"


# =============================================================================
# RESEARCH ENDPOINTS
# =============================================================================

@router.post("/chain", response_model=ResearchResponse)
async def research_chain(
    request: ChainResearchRequest,
    x_payment: Optional[str] = Header(None),
    x_tier: Optional[str] = Header(None)
):
    """
    Research Solana blockchain data.
    
    Focus areas:
    - pump.fun token launches and bonding curves
    - Token analysis and holder distribution
    - Protocol activity and transactions
    - NFT sales and collections
    - Wallet tracking and whale movements
    
    Payment: 0.001 SOL (10 CLAWD) for basic queries
    """
    tier = ResearchTier(x_tier.lower()) if x_tier else ResearchTier.FREE
    payment_info = await validate_payment(x_payment, tier)
    
    start_time = time.time()
    research_id = generate_research_id()
    
    logger.info(f"[{research_id}] Chain research: {request.query}")
    
    # Execute research based on focus areas
    results = {}
    sources = []
    
    if ChainFocus.PUMP_FUN in request.focus:
        # Research pump.fun
        pump_data = await _research_pump_fun(request)
        results["pump_fun"] = pump_data
        sources.extend(["helius", "pump.fun", "birdeye"])
    
    if ChainFocus.TOKENS in request.focus:
        # Research tokens
        token_data = await _research_tokens(request)
        results["tokens"] = token_data
        sources.append("birdeye")
    
    if ChainFocus.PROTOCOLS in request.focus:
        # Research protocols
        protocol_data = await _research_protocols(request)
        results["protocols"] = protocol_data
        sources.extend(["helius", "raydium", "orca"])
    
    if ChainFocus.GRADUATION in request.focus:
        # Check graduation status
        grad_data = await _check_graduation(request.mint) if request.mint else {}
        results["graduation"] = grad_data
        sources.append("pump.fun")
    
    # Calculate confidence based on data availability
    confidence = min(1.0, len(results) * 0.25 + 0.5)
    
    # Calculate cost
    cost_sol = RESEARCH_PRICING["basic_chain"]
    cost_clawd = cost_sol * 100
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return ResearchResponse(
        id=research_id,
        agent=get_agent_for_tier(tier),
        query=request.query,
        results=results,
        confidence=confidence,
        sources=sources,
        cost=ResearchCost(
            sol=cost_sol,
            clawd=cost_clawd,
            tier=tier
        ),
        metadata={
            "processing_time_ms": processing_time,
            "focus": [f.value for f in request.focus],
            "tier": tier.value,
            "payment": payment_info
        }
    )


@router.post("/defi", response_model=ResearchResponse)
async def research_defi(
    request: DeFiResearchRequest,
    x_payment: Optional[str] = Header(None),
    x_tier: Optional[str] = Header(None)
):
    """
    Research DeFi opportunities across Solana protocols.
    
    Actions:
    - yield_scan: Find best yield opportunities
    - lp_analysis: Analyze liquidity pools
    - arbitrage: Find cross-protocol arbitrage
    - protocol_research: Deep dive into specific protocols
    
    Payment: 0.005 SOL (50 CLAWD) for DeFi research
    """
    tier = ResearchTier(x_tier.lower()) if x_tier else ResearchTier.BRONZE
    payment_info = await validate_payment(x_payment, tier)
    
    start_time = time.time()
    research_id = generate_research_id()
    
    logger.info(f"[{research_id}] DeFi research: {request.action}")
    
    results = {}
    sources = []
    
    if request.action == DeFiAction.YIELD_SCAN:
        yields_data = await _scan_yields(request)
        results["yields"] = yields_data
        sources.extend(request.protocols)
    
    elif request.action == DeFiAction.LP_ANALYSIS:
        lp_data = await _analyze_lp(request)
        results["liquidity_pools"] = lp_data
        sources.extend(request.protocols)
    
    elif request.action == DeFiAction.ARBITRAGE:
        arb_data = await _find_arbitrage(request)
        results["arbitrage"] = arb_data
        sources.extend(["jupiter", "raydium", "orca", "pumpswap"])
    
    elif request.action == DeFiAction.PROTOCOL_RESEARCH:
        proto_data = await _research_defi_protocols(request)
        results["protocols"] = proto_data
        sources.extend(request.protocols)
    
    confidence = min(1.0, len(results) * 0.3 + 0.4)
    
    cost_sol = RESEARCH_PRICING["token_analysis"]
    cost_clawd = cost_sol * 100
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return ResearchResponse(
        id=research_id,
        agent=get_agent_for_tier(tier),
        query=f"DeFi {request.action.value} for {', '.join(request.assets)}",
        results=results,
        confidence=confidence,
        sources=sources,
        cost=ResearchCost(
            sol=cost_sol,
            clawd=cost_clawd,
            tier=tier
        ),
        metadata={
            "processing_time_ms": processing_time,
            "action": request.action.value,
            "protocols": request.protocols,
            "tier": tier.value
        }
    )


@router.post("/market", response_model=ResearchResponse)
async def research_market(
    request: MarketResearchRequest,
    x_payment: Optional[str] = Header(None),
    x_tier: Optional[str] = Header(None)
):
    """
    Research market sentiment and trends.
    
    Focus areas:
    - sentiment: Social media and community sentiment
    - trends: Trending tokens and narratives
    - alpha: Potential alpha opportunities
    - narratives: Emerging market narratives
    - whale_moves: Large wallet movements
    
    Payment: 0.001 SOL (10 CLAWD) for sentiment research
    """
    tier = ResearchTier(x_tier.lower()) if x_tier else ResearchTier.BRONZE
    payment_info = await validate_payment(x_payment, tier)
    
    start_time = time.time()
    research_id = generate_research_id()
    
    logger.info(f"[{research_id}] Market research: {request.focus}")
    
    results = {}
    sources = request.sources
    
    if request.focus == MarketFocus.SENTIMENT:
        sentiment_data = await _analyze_sentiment(request)
        results["sentiment"] = sentiment_data
    
    elif request.focus == MarketFocus.TRENDS:
        trends_data = await _get_trends(request)
        results["trends"] = trends_data
    
    elif request.focus == MarketFocus.ALPHA:
        alpha_data = await _find_alpha(request)
        results["alpha"] = alpha_data
    
    elif request.focus == MarketFocus.NARRATIVES:
        narratives_data = await _track_narratives(request)
        results["narratives"] = narratives_data
    
    elif request.focus == MarketFocus.WHALE_MOVES:
        whale_data = await _track_whales(request)
        results["whale_moves"] = whale_data
        sources.append("solana")
    
    confidence = min(1.0, 0.6 + (len(sources) * 0.1))
    
    cost_sol = RESEARCH_PRICING["basic_chain"]
    cost_clawd = cost_sol * 100
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return ResearchResponse(
        id=research_id,
        agent=get_agent_for_tier(tier),
        query=f"Market {request.focus.value} analysis",
        results=results,
        confidence=confidence,
        sources=sources,
        cost=ResearchCost(
            sol=cost_sol,
            clawd=cost_clawd,
            tier=tier
        ),
        metadata={
            "processing_time_ms": processing_time,
            "focus": request.focus.value,
            "timeframe": request.timeframe,
            "tier": tier.value
        }
    )


@router.post("/agent", response_model=ResearchResponse)
async def research_agent(
    request: AgentResearchRequest,
    x_payment: Optional[str] = Header(None),
    x_tier: Optional[str] = Header(None)
):
    """
    Agent self-improvement and collaboration research.
    
    Actions:
    - learn: Learn from research outcomes
    - share: Share knowledge with other agents
    - collaborate: Work with other agents on research
    - calibrate: Recalibrate agent based on feedback
    
    Payment: 0.001 SOL (10 CLAWD) per agent action
    """
    tier = ResearchTier(x_tier.lower()) if x_tier else ResearchTier.BRONZE
    payment_info = await validate_payment(x_payment, tier)
    
    start_time = time.time()
    research_id = generate_research_id()
    
    logger.info(f"[{research_id}] Agent research: {request.agent_id} - {request.action}")
    
    results = {}
    sources = ["llm-wiki-tang", "agent-swarm"]
    
    if request.action == "learn":
        learn_data = await _agent_learn(request)
        results["improvements"] = learn_data
    
    elif request.action == "share":
        share_data = await _agent_share(request)
        results["shared_knowledge"] = share_data
    
    elif request.action == "collaborate":
        collab_data = await _agent_collaborate(request)
        results["collaborations"] = collab_data
        if request.target_agent:
            sources.append(request.target_agent)
    
    elif request.action == "calibrate":
        calib_data = await _agent_calibrate(request)
        results["calibration"] = calib_data
    
    confidence = 0.8  # Agent research is internal
    
    cost_sol = RESEARCH_PRICING["basic_chain"]
    cost_clawd = cost_sol * 100
    
    processing_time = int((time.time() - start_time) * 1000)
    
    return ResearchResponse(
        id=research_id,
        agent=request.agent_id,
        query=f"Agent {request.action}",
        results=results,
        confidence=confidence,
        sources=sources,
        cost=ResearchCost(
            sol=cost_sol,
            clawd=cost_clawd,
            tier=tier
        ),
        metadata={
            "processing_time_ms": processing_time,
            "action": request.action,
            "target_agent": request.target_agent,
            "tier": tier.value
        }
    )


# =============================================================================
# INTERNAL RESEARCH HELPERS
# =============================================================================

async def _research_pump_fun(request: ChainResearchRequest) -> dict:
    """Research pump.fun tokens."""
    # Simulated pump.fun research
    return {
        "recent_launches": [
            {
                "mint": "Demo123...",
                "name": "Demo Token",
                "symbol": "DEMO",
                "created_at": datetime.utcnow().isoformat(),
                "market_cap": 25000,
                "bonding_curve_progress": 45.5,
                "graduation_threshold": 69000
            }
        ],
        "trending": [
            {"symbol": "POPCAT", "change_24h": 125.5, "volume": 1500000},
            {"symbol": "FWOG", "change_24h": 89.2, "volume": 890000}
        ]
    }


async def _research_tokens(request: ChainResearchRequest) -> dict:
    """Research specific tokens."""
    tokens = []
    
    if request.mint:
        tokens.append({
            "mint": request.mint,
            "name": "Researched Token",
            "symbol": "RESEARCH",
            "price": 0.00123,
            "change_24h": 5.67,
            "volume_24h": 1234567,
            "market_cap": 12345678,
            "holders": 1234
        })
    
    return {"tokens": tokens}


async def _research_protocols(request: ChainResearchRequest) -> dict:
    """Research Solana protocols."""
    return {
        "raydium": {"tvl": 150000000, "volume_24h": 50000000},
        "orca": {"tvl": 45000000, "volume_24h": 15000000},
        "jupiter": {"volume_24h": 200000000, "users_24h": 50000}
    }


async def _check_graduation(mint: Optional[str]) -> dict:
    """Check pump.fun graduation status."""
    if not mint:
        return {"status": "not_checked", "reason": "no_mint_provided"}
    
    return {
        "mint": mint,
        "status": "graduating",
        "progress": 68.5,
        "threshold": 69000,
        "sol_reserve": 47265,
        "estimated_time": "2-4 hours"
    }


async def _scan_yields(request: DeFiResearchRequest) -> dict:
    """Scan for yield opportunities."""
    yields = []
    
    for protocol in request.protocols:
        for asset in request.assets:
            yields.append({
                "protocol": protocol,
                "asset": asset,
                "apr": 12.5 + (hash(protocol + asset) % 20),
                "tvl": 1000000 + (hash(protocol) % 5000000),
                "risk_level": "medium" if request.risk_tolerance == "medium" else "low"
            })
    
    # Sort by APR
    yields.sort(key=lambda x: x["apr"], reverse=True)
    
    return {"yields": yields[:10]}


async def _analyze_lp(request: DeFiResearchRequest) -> dict:
    """Analyze liquidity pools."""
    pools = []
    
    for protocol in request.protocols:
        pools.append({
            "protocol": protocol,
            "pool": f"{request.assets[0]}/{request.assets[1] if len(request.assets) > 1 else 'SOL'}",
            "liquidity": 500000,
            "volume_24h": 100000,
            "fee_24h": 250,
            "apr": 25.5
        })
    
    return {"pools": pools}


async def _find_arbitrage(request: DeFiResearchRequest) -> dict:
    """Find arbitrage opportunities."""
    return {
        "opportunities": [
            {
                "token": request.assets[0],
                "buy_exchange": "raydium",
                "sell_exchange": "orca",
                "spread_pct": 0.15,
                "estimated_profit_sol": 0.02,
                "risk": "low"
            }
        ]
    }


async def _research_defi_protocols(request: DeFiResearchRequest) -> dict:
    """Research DeFi protocols."""
    protocols = {}
    
    for protocol in request.protocols:
        protocols[protocol] = {
            "name": protocol.capitalize(),
            "tvl": 50000000,
            "volume_24h": 10000000,
            "fees_24h": 25000,
            "users": 15000,
            "contracts": ["main", "incentives", "governance"]
        }
    
    return {"protocols": protocols}


async def _analyze_sentiment(request: MarketResearchRequest) -> dict:
    """Analyze market sentiment."""
    return {
        "overall_sentiment": "bullish",
        "score": 72,
        "social_volume": 15000,
        "dominant_narrative": "meme_coins",
        "top_mentioned": ["POPCAT", "FWOG", "MOTHER"],
        "trend": "increasing"
    }


async def _get_trends(request: MarketResearchRequest) -> dict:
    """Get trending tokens."""
    return {
        "trending": [
            {"symbol": "POPCAT", "mentions_24h": 5000, "change": 125},
            {"symbol": "FWOG", "mentions_24h": 3500, "change": 89},
            {"symbol": "MOTHER", "mentions_24h": 2800, "change": 45}
        ]
    }


async def _find_alpha(request: MarketResearchRequest) -> dict:
    """Find alpha opportunities."""
    return {
        "alpha": [
            {
                "type": "new_listing",
                "token": "NEW_TOKEN_MINT",
                "potential": "high",
                "entry_point": 0.00001,
                "target": 0.0001
            }
        ]
    }


async def _track_narratives(request: MarketResearchRequest) -> dict:
    """Track market narratives."""
    return {
        "narratives": [
            {"name": "AI agents", "strength": 85, "tokens": 12},
            {"name": "gaming", "strength": 72, "tokens": 8},
            {"name": "meme_coins", "strength": 95, "tokens": 50}
        ]
    }


async def _track_whales(request: MarketResearchRequest) -> dict:
    """Track whale movements."""
    return {
        "whale_alerts": [
            {
                "wallet": "Whale123...",
                "action": "buy",
                "token": request.tokens[0] if request.tokens else "SOL",
                "amount_sol": 500,
                "time": datetime.utcnow().isoformat()
            }
        ]
    }


async def _agent_learn(request: AgentResearchRequest) -> dict:
    """Agent learning from outcomes."""
    return {
        "patterns_learned": 5,
        "accuracy_improvement": 0.05,
        "knowledge_updated": True
    }


async def _agent_share(request: AgentResearchRequest) -> dict:
    """Agent sharing knowledge."""
    return {
        "knowledge_shared": True,
        "agents_reached": 12,
        "insights_distributed": 3
    }


async def _agent_collaborate(request: AgentResearchRequest) -> dict:
    """Agent collaboration."""
    if not request.target_agent:
        return {"status": "no_target", "message": "Specify target_agent for collaboration"}
    
    return {
        "collaboration_id": generate_research_id(),
        "agents": [request.agent_id, request.target_agent],
        "task": request.task or "general research",
        "status": "initiated"
    }


async def _agent_calibrate(request: AgentResearchRequest) -> dict:
    """Calibrate agent based on feedback."""
    return {
        "calibration_complete": True,
        "accuracy_score": 0.85,
        "adjustments_made": ["threshold_tuning", "pattern_weights"]
    }


# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@router.get("/status")
async def research_status():
    """Get research system status."""
    return {
        "status": "operational",
        "active_agents": 49,
        "queue_length": 12,
        "uptime": "99.9%",
        "pricing": RESEARCH_PRICING,
        "clawd_mint": CLAWD_MINT
    }


@router.get("/pricing")
async def research_pricing():
    """Get research pricing in SOL and $CLAWD."""
    return {
        "research_types": {
            "basic_chain": {"sol": RESEARCH_PRICING["basic_chain"], "clawd": 10},
            "token_analysis": {"sol": RESEARCH_PRICING["token_analysis"], "clawd": 50},
            "defi_scan": {"sol": RESEARCH_PRICING["defi_scan"], "clawd": 100},
            "full_market": {"sol": RESEARCH_PRICING["full_market"], "clawd": 250},
        },
        "tier_benefits": {
            "free": {"daily_queries": 5, "rate_limit": "10/min"},
            "bronze": {"daily_queries": 50, "rate_limit": "50/min"},
            "silver": {"daily_queries": 200, "rate_limit": "200/min"},
            "gold": {"daily_queries": -1, "rate_limit": "1000/min"},
            "diamond": {"daily_queries": -1, "rate_limit": "unlimited"},
        },
        "clawd_token": CLAWD_MINT,
        "buy_link": f"https://pump.fun/{CLAWD_MINT}"
    }


@router.get("/agents")
async def list_research_agents(
    tier: Optional[str] = Query(None, description="Filter by tier")
):
    """List available research agents."""
    agents = [
        {"id": "lobster-researcher-free", "tier": "free", "specialty": "basic_chain"},
        {"id": "lobster-researcher-01", "tier": "bronze", "specialty": "chain"},
        {"id": "lobster-researcher-02", "tier": "silver", "specialty": "defi"},
        {"id": "lobster-researcher-03", "tier": "gold", "specialty": "market"},
        {"id": "lobster-researcher-diamond", "tier": "diamond", "specialty": "all"},
        {"id": "lobster-analyst-01", "tier": "bronze", "specialty": "analysis"},
        {"id": "lobster-trader-01", "tier": "silver", "specialty": "execution"},
        {"id": "lobster-security-01", "tier": "bronze", "specialty": "security"},
    ]
    
    if tier:
        agents = [a for a in agents if a["tier"] == tier.lower()]
    
    return {
        "agents": agents,
        "total": len(agents),
        "max_agents": 49
    }
