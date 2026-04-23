# 🦂 Percolator × OpenClawd Integration

## Executive Summary

This document outlines an innovative integration strategy that brings **Percolator's sophisticated on-chain risk engine** concepts into OpenClawd's autonomous OODA trading loop. The goal is to create a **hybrid DeFi trading system** that combines:

- **Percolator's risk engine** (margin tracking, liquidation circuits, funding awareness)
- **OpenClawd's OODA loop** (autonomousObserve-Orient-Decide-Act cycle)
- **Jupiter Ultra** (MEV-protected execution)
- **ClawVault memory** (persistent trading intelligence)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     PERCOLATOR × OPENCLAWD HYBRID                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     OODA TRADING LOOP                              │   │
│  │                                                                      │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐              │   │
│  │  │ OBSERVE │→ │ ORIENT  │→ │  DECIDE │→ │   ACT   │              │   │
│  │  │         │  │         │  │         │  │         │              │   │
│  │  │ • Price │  │ • RSI   │  │ • Signal│  │ • Swap  │              │   │
│  │  │ • Risk  │  │ • EWMA  │  │ • Size  │  │ • SL/TP │              │   │
│  │  │ • Flow  │  │ • Risk  │  │ • SL/TP │  │ • Log   │              │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘              │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
│                                   │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────┐   │
│  │                 PERCOLATOR RISK ENGINE (Go Port)                  │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │   │
│  │  │ Margin Track │  │ Liquidation  │  │   Funding Awareness  │    │   │
│  │  │              │  │   Circuits    │  │                      │    │   │
│  │  │ • Health    │  │ • Distance   │  │ • Mark/Index Delta   │    │   │
│  │  │ • Equity    │  │ • Circuit   │  │ • Premium Calc       │    │   │
│  │  │ • Reserved  │  │ • Auto-Liq  │  │ • Rate Accum        │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘    │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐    │   │
│  │  │ Insurance    │  │ EWMA Mark    │  │   Position Manager   │    │   │
│  │  │ Monitor     │  │ Tracking     │  │                      │    │   │
│  │  │              │  │              │  │ • Entry/Exit        │    │   │
│  │  │ • Balance   │  │ • Alpha      │  │ • Size/Exposure     │    │   │
│  │  │ • Coverage  │  │ • Halflife   │  │ • Correlation       │    │   │
│  │  │ • Drawdown  │  │ • Clamp      │  │ • Multi-Pos        │    │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘    │   │
│  └────────────────────────────────┬─────────────────────────────────┘   │
│                                   │                                      │
│  ┌────────────────────────────────▼─────────────────────────────────┐   │
│  │                      EXECUTION LAYER                               │   │
│  │                                                                      │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │   │
│  │  │   Jupiter Ultra │  │   Solana RPC     │  │   ClawVault     │   │   │
│  │  │   (MEV Prot.)  │  │   (gagliardetto)│  │   (Memory)     │   │   │
│  │  │                 │  │                 │  │                 │   │   │
│  │  │ • GET /order   │  │ • GetBalance    │  │ • Trade Recall │   │   │
│  │  │ • POST /execute│  │ • GetSignatures │  │ • Pattern Match│   │   │
│  │  │ • TP/SL Mon   │  │ • SendTx        │  │ • Learning     │   │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Percolator Risk Engine Port (Go)

### Core Types

```go
// pkg/percolator/engine.go

package percolator

import (
    "math/big"
    "sync"
)

// RiskEngine port from Rust/SBF to Go
// Mirrors the embedded risk engine architecture from Percolator

const (
    // Percolator constants (ported from Rust)
    POS_SCALE           = 1_000_000   // Position scaling factor
    U128_MAX            = ^uint64(0)  // Max value for U128-like operations
    MAX_ACCOUNTS        = 4096        // Max trading accounts
    MAINTENANCE_MARGIN  = 1000        // 10% maintenance margin (bps)
    INITIAL_MARGIN      = 2000        // 20% initial margin (bps)
    LIQUIDATION_FEE_BPS = 100         // 1% liquidation fee
    
    // EWMA parameters
    DEFAULT_HALFLIFE_SLOTS = 100      // ~40 sec at 2.5 slots/sec
    DEFAULT_CAP_E2BPS      = 10_000    // 1% max price change per slot
)

// U128 implements 128-bit unsigned integer operations
type U128 struct {
    lo, hi uint64
}

func NewU128(lo, hi uint64) *U128 { return &U128{lo, hi} }
func (u *U128) IsZero() bool { return u.lo == 0 && u.hi == 0 }

// Position represents a trading position
type Position struct {
    Mu         sync.RWMutex
    
    // Position data
    SizeQ      int64           // Position size in units
    EntryPx    uint64          // Entry price (e6)
    Capital    *U128           // Available capital
    PnL        int64           // Realized PnL
    Reserved   *U128           // Reserved margin
    
    // Risk metrics
    MarginHealth float64       // Health ratio (0-1)
    LiqDistance float64       // Distance to liquidation (0-1)
    
    // Funding
    FeeCredits  int64          // Accumulated fees
    FundingPaid int64         // Total funding paid
}

// RiskEngine is the core risk calculation engine
type RiskEngine struct {
    mu sync.RWMutex
    
    // Market parameters
    params    RiskParams
    collateral *big.Int        // Collateral token (lamports)
    
    // Price tracking
    lastOraclePx uint64        // Last oracle price
    markEWMA     uint64        // EWMA of execution prices
    indexPrice   uint64        // Index price (external oracle)
    
    // Market state
    currentSlot  uint64
    lastMarketSlot uint64
    insuranceFund *U128
    
    // Account tracking
    accounts  []*Account
    usedSlots []int           // Bitmap of used account slots
}

// RiskParams contains market risk parameters
type RiskParams struct {
    MaintenanceMarginBPS uint64
    InitialMarginBPS     uint64
    TradingFeeBPS        uint64
    MaxAccounts          uint64
    LiqFeeBPS            uint64
    LiqFeeCap            *U128
    HMin                 uint64  // Warmup horizon min
    HMax                 uint64  // Warmup horizon max
    ResolveDevBPS        uint64  // Resolution deviation band
}

// Account represents a trading account
type Account struct {
    owner    [32]byte
    capital  *U128
    position *Position
    
    // Matcher config (for CPI-based trading)
    matcherProgram [32]byte
    matcherContext [32]byte
    
    // Fee tracking
    lastFeeSlot  uint64
    feeCredits   int64
}
```

### Risk Calculations

```go
// pkg/percolator/risk.go

package percolator

import (
    "math"
    "time"
)

// CalculateMarginHealth computes the margin health ratio
// Health = (Equity - Reserved) / Equity
func (p *Position) CalculateMarginHealth() float64 {
    equity := p.Equity()
    if equity <= 0 {
        return 0
    }
    reserved := p.ReservedMargin()
    return math.Max(0, (equity-float64(reserved))/equity)
}

// Equity calculates total equity
func (p *Position) Equity() float64 {
    return float64(p.Capital.Lo()) + float64(p.PnL)
}

// ReservedMargin calculates required margin
func (p *Position) ReservedMargin() uint64 {
    if p.SizeQ == 0 {
        return 0
    }
    // margin = |size| * price * initial_margin_bps / 10000
    notional := math.Abs(float64(p.SizeQ)) * float64(p.EntryPx) / 1e6
    return uint64(notional * float64(INITIAL_MARGIN) / 10000)
}

// LiquidationDistance calculates distance to liquidation
func (p *Position) LiquidationDistance(markPrice uint64) float64 {
    if p.SizeQ == 0 {
        return 1.0 // No position = no liquidation risk
    }
    
    entryValue := float64(p.SizeQ) * float64(p.EntryPx) / 1e6
    if entryValue <= 0 {
        return 0
    }
    
    // Liquidation when equity <= maintenance_margin * notional
    liqThreshold := entryValue * float64(MAINTENANCE_MARGIN) / 10000
    
    var liqPrice float64
    if p.SizeQ > 0 {
        // Long: liq price = entry - (capital - liq_threshold) / size
        liqPrice = float64(p.EntryPx) - (float64(p.Capital.Lo()) - liqThreshold) / float64(p.SizeQ) * 1e6
    } else {
        // Short: liq price = entry + (capital - liq_threshold) / |size|
        liqPrice = float64(p.EntryPx) + (float64(p.Capital.Lo()) - liqThreshold) / math.Abs(float64(p.SizeQ)) * 1e6
    }
    
    if liqPrice <= 0 {
        return 0
    }
    
    distance := math.Abs(float64(markPrice) - liqPrice) / float64(markPrice)
    return math.Min(1.0, distance)
}

// CalculateRiskAdjustedSize determines position size based on risk parameters
func (e *RiskEngine) CalculateRiskAdjustedSize(
    signalStrength float64,  // 0-1
    confidence float64,       // 0-1  
    availableCapital uint64,
    markPrice uint64,
) (size int64, risk float64) {
    
    e.mu.RLock()
    defer e.mu.RUnlock()
    
    // Base size from capital (use 10% of available)
    baseSize := float64(availableCapital) * 0.10 / float64(markPrice) * 1e6
    
    // Adjust for signal strength
    adjustedSize := baseSize * signalStrength
    
    // Adjust for confidence
    adjustedSize *= confidence
    
    // Adjust for current margin health
    healthFactor := e.currentMarketHealth()
    adjustedSize *= healthFactor
    
    // Risk metric
    risk = 1.0 - healthFactor
    
    // Convert to int64
    size = int64(adjustedSize)
    
    // Clamp to reasonable bounds
    maxSize := float64(availableCapital) * 0.25 / float64(markPrice) * 1e6
    minSize := float64(availableCapital) * 0.01 / float64(markPrice) * 1e6
    
    if float64(size) > maxSize {
        size = int64(maxSize)
    }
    if float64(size) < minSize {
        size = 0 // Don't trade if too small
    }
    
    return size, risk
}

// currentMarketHealth aggregates health across all positions
func (e *RiskEngine) currentMarketHealth() float64 {
    var totalEquity, totalReserved float64
    
    for _, acc := range e.accounts {
        if acc == nil || acc.position == nil {
            continue
        }
        totalEquity += acc.position.Equity()
        totalReserved += float64(acc.position.ReservedMargin())
    }
    
    if totalEquity <= 0 {
        return 0
    }
    
    return math.Max(0, (totalEquity - totalReserved) / totalEquity)
}
```

### EWMA Mark Price (Percolator's Trade-Derived Mark)

```go
// pkg/percolator/ewma.go

package percolator

// MarkEWMA implements Percolator's fee-weighted exponential moving average
// This is the "trade-derived mark price" used for funding calculations

type MarkEWMA struct {
    // Current EWMA value
    value uint64
    
    // Slot tracking
    lastSlot     uint64
    halflifeSlots uint64
    
    // Fee weighting
    minFee uint64
}

// Update applies a new price observation with fee weighting
func (m *MarkEWMA) Update(price uint64, feePaid uint64, currentSlot uint64) uint64 {
    if price == 0 {
        return m.value
    }
    
    // First observation seeds the EWMA
    if m.value == 0 {
        if m.minFee == 0 || feePaid >= m.minFee {
            m.value = price
            m.lastSlot = currentSlot
        }
        return m.value
    }
    
    // Same-slot protection
    dt := currentSlot - m.lastSlot
    if dt == 0 {
        return m.value
    }
    
    // Calculate alpha: alpha ≈ dt / (dt + halflife)
    // Using Padé approximant of 1 - 2^(-dt/halflife)
    alphaBps := (10000 * dt) / (dt + m.halflifeSlots)
    
    // Apply fee weighting
    effectiveAlphaBps := alphaBps
    if m.minFee > 0 && feePaid < m.minFee {
        // Scale alpha by fee ratio
        effectiveAlphaBps = alphaBps * feePaid / m.minFee
    }
    
    // EWMA update: new = old + sign(delta) * |delta| * alpha
    if price >= m.value {
        delta := price - m.value
        m.value += delta * effectiveAlphaBps / 10000
    } else {
        delta := m.value - price
        m.value -= delta * effectiveAlphaBps / 10000
    }
    
    // Only full-weight observations advance the slot
    if m.minFee == 0 || feePaid >= m.minFee {
        m.lastSlot = currentSlot
    }
    
    return m.value
}

// ClampPrice applies Percolator's circuit breaker
func (m *MarkEWMA) ClampPrice(rawPrice, capE2BPS uint64) uint64 {
    if m.value == 0 || capE2BPS == 0 {
        return rawPrice
    }
    
    // max_delta = value * cap / 1_000_000
    maxDelta := m.value * capE2BPS / 1_000_000
    
    lower := m.value - maxDelta
    upper := m.value + maxDelta
    
    if rawPrice < lower {
        return lower
    }
    if rawPrice > upper {
        return upper
    }
    return rawPrice
}

// FundingRate calculates the funding rate from mark-index premium
func (m *MarkEWMA) FundingRate(indexPrice uint64, horizonSlots uint64) int64 {
    if m.value == 0 || indexPrice == 0 || horizonSlots == 0 {
        return 0
    }
    
    // Premium = (mark - index) / index
    diff := int64(m.value) - int64(indexPrice)
    premium := float64(diff) * 1_000_000 / float64(indexPrice) // in e6
    
    // Per-slot rate: premium / horizon
    perSlot := premium / float64(horizonSlots)
    
    // Convert to bps/slot (1 bps = 0.01%)
    bpsPerSlot := perSlot / 100
    
    // Clamp to reasonable bounds (±100 bps/slot)
    if bpsPerSlot > 100 {
        bpsPerSlot = 100
    }
    if bpsPerSlot < -100 {
        bpsPerSlot = -100
    }
    
    return int64(bpsPerSlot)
}
```

---

## OODA Loop Enhancement

### Enhanced Observe Phase

```go
// pkg/agent/ooda.go (enhanced)

func (a *OODAAgent) Observe(ctx context.Context) (*MarketSnapshot, error) {
    snapshot := &MarketSnapshot{
        Timestamp: time.Now(),
        Slot:      a.currentSlot,
    }
    
    // 1. Price data from Solana Tracker
    prices, err := a.tracker.GetPrices(ctx, a.watchlist)
    if err != nil {
        return nil, fmt.Errorf("price fetch: %w", err)
    }
    snapshot.Prices = prices
    
    // 2. OHLCV data for indicators
    for _, token := range a.watchlist {
        ohlcv, err := a.tracker.GetOHLCV(ctx, token, "1h")
        if err != nil {
            continue
        }
        snapshot.OHLCV[token] = ohlcv
    }
    
    // 3. Wallet state from Helius
    balance, err := a.helius.GetBalance(ctx, a.wallet.PubKey())
    if err == nil {
        snapshot.Balance = balance
    }
    
    // 4. Position state from Percolator engine
    snapshot.Positions = a.riskEngine.GetAllPositions()
    
    // 5. Market risk metrics
    for _, pos := range snapshot.Positions {
        pos.MarginHealth = pos.CalculateMarginHealth()
        if pos.SizeQ != 0 {
            pos.LiqDistance = pos.LiquidationDistance(snapshot.Prices[baseToken])
        }
    }
    
    // 6. Insurance fund status (Percolator feature)
    snapshot.InsuranceFund = a.riskEngine.InsuranceFund()
    snapshot.MarketHealth = a.riskEngine.currentMarketHealth()
    
    // 7. Funding rates
    for _, pos := range snapshot.Positions {
        snapshot.FundingRates = append(snapshot.FundingRates, FundingRate{
            Token:    baseToken,
            Mark:     a.markEWMA.value,
            Index:    a.riskEngine.indexPrice,
            RateBPS:  a.markEWMA.FundingRate(a.riskEngine.indexPrice, 500),
        })
    }
    
    // 8. ClawVault memory recall
    relevantTrades, _ := a.vault.RecallPattern(ctx, PatternMatch{
        Token:    a.currentToken,
        Signals:  []SignalType{SignalRSI, SignalEMA},
        Recency:  24 * time.Hour,
    })
    snapshot.RecentTrades = relevantTrades
    
    return snapshot, nil
}

// MarketSnapshot contains all observed market data
type MarketSnapshot struct {
    Timestamp     time.Time
    Slot          uint64
    Prices        map[string]PriceData
    OHLCV         map[string]*OHLCV
    Balance       uint64
    Positions     []*Position
    InsuranceFund *U128
    MarketHealth  float64
    FundingRates  []FundingRate
    RecentTrades  []Trade
}

type FundingRate struct {
    Token   string
    Mark    uint64
    Index   uint64
    RateBPS int64 // Signed: positive = longs pay shorts
}
```

### Enhanced Orient Phase

```go
// pkg/strategy/orient.go

func (a *OODAAgent) Orient(snapshot *MarketSnapshot) (*Orientation, error) {
    orient := &Orientation{
        Timestamp: time.Now(),
    }
    
    // 1. Calculate technical indicators
    for token, ohlcv := range snapshot.OHLCV {
        indicators := a.calculateIndicators(ohlcv)
        orient.Indicators[token] = indicators
    }
    
    // 2. Percolator risk assessment
    orient.RiskAssessment = a.riskEngine.AssessRisk(snapshot)
    
    // 3. Signal generation with risk weighting
    for token, ind := range orient.Indicators {
        signals := a.generateSignals(token, ind, orient.RiskAssessment)
        orient.Signals[token] = signals
        
        // Aggregate into trade signal
        orient.TradeSignal = a.aggregateSignals(signals)
    }
    
    // 4. ClawVault pattern matching
    pattern := a.vault.FindPattern(snapshot)
    orient.MatchedPattern = pattern
    orient.ConfidenceBoost = pattern.ConfidenceBoost()
    
    // 5. OODA loop feedback integration
    recentPerformance := a.vault.GetRecentPerformance()
    orient.PerformanceAdjustedSignal = orient.TradeSignal.ApplyFeedback(recentPerformance)
    
    return orient, nil
}

// calculateIndicators computes RSI, EMA, ATR, etc.
func (a *OODAAgent) calculateIndicators(ohlcv *OHLCV) Indicators {
    closes := make([]float64, len(ohlcv.Closes))
    for i, c := range ohlcv.Closes {
        closes[i] = float64(c) / 1e6
    }
    
    return Indicators{
        RSI:     CalculateRSI(closes, 14),
        EMA9:    CalculateEMA(closes, 9),
        EMA21:   CalculateEMA(closes, 21),
        ATR:     CalculateATR(ohlcv, 14),
        Volume:  calculateVolumeRatio(ohlcv),
    }
}

// AssessRisk implements Percolator-style risk assessment
func (e *RiskEngine) AssessRisk(snapshot *MarketSnapshot) RiskAssessment {
    assess := RiskAssessment{
        Timestamp: time.Now(),
    }
    
    // Market-wide health
    assess.MarketHealth = e.currentMarketHealth()
    
    // Per-position risk
    for _, pos := range snapshot.Positions {
        posRisk := PositionRisk{
            PositionID:    pos.ID,
            MarginHealth:  pos.CalculateMarginHealth(),
            LiqDistance:   pos.LiquidationDistance(snapshot.Prices["SOL"]),
            FundingRate:   e.markEWMA.FundingRate(e.indexPrice, 500),
            TimeToLiqSlots: calculateTimeToLiq(pos, snapshot.Prices["SOL"]),
        }
        assess.PositionRisks = append(assess.PositionRisks, posRisk)
    }
    
    // Insurance fund health
    assess.InsuranceCoverage = calculateInsuranceCoverage(e, snapshot)
    
    // Risk verdict
    assess.Verdict = determineRiskVerdict(assess)
    
    return assess
}

type RiskAssessment struct {
    Timestamp       time.Time
    MarketHealth   float64
    PositionRisks  []PositionRisk
    InsuranceCoverage float64
    Verdict        RiskVerdict
}

type PositionRisk struct {
    PositionID       string
    MarginHealth     float64
    LiqDistance      float64  // 0-1, higher = safer
    FundingRateBPS   int64
    TimeToLiqSlots   uint64
}

type RiskVerdict string

const (
    RiskVerdictSafe       RiskVerdict = "SAFE"
    RiskVerdictCaution    RiskVerdict = "CAUTION"
    RiskVerdictHigh       RiskVerdict = "HIGH"
    RiskVerdictCritical   RiskVerdict = "CRITICAL"
)
```

### Enhanced Decide Phase

```go
// pkg/strategy/decide.go

func (a *OODAAgent) Decide(orient *Orientation) (*TradePlan, error) {
    signal := orient.TradeSignal
    risk := orient.RiskAssessment
    
    // Apply risk verdict to signal
    signal = a.applyRiskVerdict(signal, risk)
    
    // Calculate position size using Percolator risk engine
    size, riskMetric := a.riskEngine.CalculateRiskAdjustedSize(
        signal.Strength,
        signal.Confidence * orient.ConfidenceBoost,
        orient.Snapshot.Balance,
        orient.Snapshot.Prices[a.currentToken].Price,
    )
    
    // Risk limit check
    if risk.Verdict == RiskVerdictCritical {
        return nil, fmt.Errorf("risk verdict CRITICAL: no new positions")
    }
    
    if risk.Verdict == RiskVerdictHigh && signal.Side == SideLong {
        // Reduce long exposure in high-risk conditions
        size = size / 2
    }
    
    // Generate stop-loss and take-profit
    sl, tp := a.calculateSLTP(
        orient.Snapshot.Prices[a.currentToken].Price,
        orient.Indicators[a.currentToken].ATR,
        signal.Side,
    )
    
    // Check existing positions for SL/TP triggers
    for _, pos := range orient.Snapshot.Positions {
        if shouldExitPosition(pos, sl, tp) {
            return &TradePlan{
                Action:       ActionClose,
                PositionID:   pos.ID,
                Reason:       "SL/TP trigger",
                RiskReduction: true,
            }, nil
        }
    }
    
    // New position plan
    return &TradePlan{
        Action:     ActionOpen,
        Token:      a.currentToken,
        Side:       signal.Side,
        Size:       size,
        EntryPrice: orient.Snapshot.Prices[a.currentToken].Price,
        StopLoss:   sl,
        TakeProfit: tp,
        RiskMetric: riskMetric,
        Confidence: signal.Confidence,
        Mode:       a.mode,
    }, nil
}

// calculateSLTP computes Percolator-style risk-adjusted SL/TP
func (a *OODAAgent) calculateSLTP(entryPrice, atr uint64, side Side) (sl, tp uint64) {
    atrFloat := float64(atr)
    entryFloat := float64(entryPrice)
    
    // ATR-based stops (1.5x ATR for SL, 2.5x ATR for TP)
    slDistance := atrFloat * 1.5
    tpDistance := atrFloat * 2.5
    
    // Percolator-inspired: tighter SL when health is low
    if a.riskEngine.currentMarketHealth() < 0.3 {
        slDistance = atrFloat * 1.0 // Tighter stop
    }
    
    if side == SideLong {
        sl = uint64(entryFloat - slDistance)
        tp = uint64(entryFloat + tpDistance)
    } else {
        sl = uint64(entryFloat + slDistance)
        tp = uint64(entryFloat - tpDistance)
    }
    
    // Ensure minimum distance
    minDistance := entryFloat * 0.01 // 1% minimum
    if float64(sl) < entryFloat-minDistance {
        sl = uint64(entryFloat - minDistance)
    }
    
    return sl, tp
}

// applyRiskVerdict adjusts trading parameters based on risk assessment
func (a *OODAAgent) applyRiskVerdict(signal TradeSignal, risk RiskAssessment) TradeSignal {
    adjusted := signal
    
    switch risk.Verdict {
    case RiskVerdictCritical:
        // No trading in critical conditions
        adjusted.Strength = 0
        adjusted.Confidence *= 0.1
        
    case RiskVerdictHigh:
        // Reduce position sizes
        adjusted.Strength *= 0.5
        adjusted.Confidence *= 0.7
        
    case RiskVerdictCaution:
        // Moderate reduction
        adjusted.Strength *= 0.8
        adjusted.Confidence *= 0.9
        
    case RiskVerdictSafe:
        // Full signal
        // No adjustment needed
    }
    
    return adjusted
}
```

### Enhanced Act Phase

```go
// pkg/agent/execution.go

func (a *OODAAgent) Act(ctx context.Context, plan *TradePlan) (*Execution, error) {
    exec := &Execution{
        Plan:      plan,
        Timestamp: time.Now(),
    }
    
    switch plan.Action {
    case ActionOpen:
        // Execute new position via Jupiter Ultra
        exec.Result, exec.Err = a.executeOpenPosition(ctx, plan)
        
    case ActionClose:
        // Close existing position
        exec.Result, exec.Err = a.executeClosePosition(ctx, plan)
        
    case ActionAdjust:
        // Modify SL/TP or size
        exec.Result, exec.Err = a.executeAdjustPosition(ctx, plan)
    }
    
    // Log to ClawVault memory
    a.recordExecution(ctx, exec)
    
    // Update Percolator risk engine state
    if exec.Err == nil && plan.Action == ActionOpen {
        a.riskEngine.RecordTrade(ctx, plan)
    }
    
    return exec, exec.Err
}

// executeOpenPosition executes via Jupiter Ultra with MEV protection
func (a *OODAAgent) executeOpenPosition(ctx context.Context, plan *TradePlan) (*SwapResult, error) {
    // 1. Get quote from Jupiter
    quote, err := a.jupiter.GetQuote(ctx, &QuoteRequest{
        InputMint:   "So11111111111111111111111111111111111111112", // SOL
        OutputMint: plan.Token,
        Amount:      plan.Size,
        SlippageBPS: 50,
    })
    if err != nil {
        return nil, fmt.Errorf("quote: %w", err)
    }
    
    // 2. Get ultra order (MEV protected)
    order, err := a.jupiter.GetUltraOrder(ctx, &UltraOrderRequest{
        InputMint:  quote.InputMint,
        OutputMint: quote.OutputMint,
        Amount:     quote.InAmount,
        Slippage:   plan.SlippageBPS,
    })
    if err != nil {
        // Fallback to regular swap
        return a.executeRegularSwap(ctx, plan, quote)
    }
    
    // 3. Sign locally (keys never leave agent)
    signedTx, err := a.wallet.SignTransaction(order.Transaction)
    if err != nil {
        return nil, fmt.Errorf("sign: %w", err)
    }
    
    // 4. Execute via Jupiter Ultra
    result, err := a.jupiter.ExecuteUltra(ctx, &UltraExecuteRequest{
        RequestID: order.RequestID,
        Transaction: signedTx,
    })
    if err != nil {
        return nil, fmt.Errorf("execute: %w", err)
    }
    
    // 5. Monitor for TP/SL conditions
    go a.monitorPosition(ctx, plan.PositionID, plan.StopLoss, plan.TakeProfit)
    
    return result, nil
}

// monitorPosition watches position for SL/TP triggers
func (a *OODAAgent) monitorPosition(ctx context.Context, posID string, sl, tp uint64) {
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()
    
    for {
        select {
        case <-ctx.Done():
            return
        case <-ticker.C:
            price, err := a.tracker.GetPrice(ctx, a.currentToken)
            if err != nil {
                continue
            }
            
            // Check SL/TP
            if price <= sl || price >= tp {
                a.triggerExit(ctx, posID, "SL/TP")
                return
            }
            
            // Percolator health check
            pos := a.riskEngine.GetPosition(posID)
            if pos != nil && pos.MarginHealth < 0.2 {
                a.triggerExit(ctx, posID, "LOW_MARGIN")
                return
            }
        }
    }
}
```

---

## ClawVault Memory Integration

```go
// pkg/memory/vault.go (enhanced with Percolator concepts)

func (v *Vault) RecordPercolatorState(ctx context.Context, engine *percolator.RiskEngine) error {
    record := &PercolatorState{
        Timestamp:      time.Now(),
        Slot:           engine.currentSlot,
        MarketHealth:   engine.currentMarketHealth(),
        InsuranceFund:  engine.InsuranceFund().Lo(),
        MarkEWMA:       engine.MarkEWMA(),
        IndexPrice:     engine.IndexPrice(),
        ActiveAccounts: engine.CountActiveAccounts(),
    }
    
    return v.Record(ctx, "percolator_state", record)
}

// RecallRiskPattern recalls similar risk states for learning
func (v *Vault) RecallRiskPattern(ctx context.Context, health float64, timeframe time.Duration) ([]PercolatorState, error) {
    query := PercolatorState{}
    
    results, err := v.db.Query(ctx, PercolatorStateTable, Query{
        Where:   "market_health BETWEEN ? AND ?",
        Args:    []interface{}{health - 0.1, health + 0.1},
        Since:   time.Now().Add(-timeframe),
        OrderBy: "timestamp DESC",
        Limit:   10,
    })
    
    return results, err
}

// LearnFromOutcome updates risk parameters based on outcomes
func (v *Vault) LearnFromOutcome(ctx context.Context, outcome *TradeOutcome) error {
    record := &LearningRecord{
        Timestamp:     time.Now(),
        EntryHealth:    outcome.EntryHealth,
        ExitReason:    outcome.ExitReason,
        PnL:           outcome.PnL,
        DurationSlots: outcome.DurationSlots,
        RiskTaken:     outcome.RiskTaken,
    }
    
    // Analyze patterns
    patterns := v.analyzePatterns([]*LearningRecord{record})
    
    // Update risk parameters
    v.updateRiskParams(patterns)
    
    return v.Record(ctx, "learning", record)
}
```

---

## Configuration

```yaml
# percolator section in config.yaml

percolator:
  enabled: true
  
  # Risk parameters (mirrors Percolator constants)
  risk:
    maintenance_margin_bps: 1000   # 10%
    initial_margin_bps:     2000   # 20%
    trading_fee_bps:       10      # 0.1%
    liquidation_fee_bps:   100    # 1%
    
  # EWMA settings
  ewma:
    halflife_slots: 100           # ~40 seconds
    min_fee: 1000                 # Minimum fee for full weight
    cap_e2bps: 10000              # 1% circuit breaker
    
  # Funding
  funding:
    horizon_slots: 500            # ~4 minutes
    k_bps: 100                    # 1.00x multiplier
    max_premium_bps: 500          # 5% cap
    
  # Insurance
  insurance:
    min_coverage: 5.0             # 5x minimum coverage
    max_drawdown: 0.1             # 10% max drawdown
    
  # Position limits
  limits:
    max_positions: 3
    max_position_pct: 0.25         # 25% of wallet per position
    max_risk_per_trade: 0.05       # 5% risk per trade
```

---

## CLI Commands

```bash
# Percolator risk status
clawd percolator status

# Detailed risk engine state
clawd percolator inspect --position <id>

# EWMA mark tracking
clawd percolator mark --token <token>

# Insurance fund status
clawd percolator insurance

# Risk-adjusted position sizing demo
clawd percolator size --signal 0.7 --confidence 0.8 --capital 1000000000
```

---

## Implementation Roadmap

### Phase 1: Core Engine (Week 1-2)
- [ ] Port U128 arithmetic to Go
- [ ] Implement RiskEngine struct
- [ ] Basic margin calculations
- [ ] Liquidation distance tracking

### Phase 2: EWMA Integration (Week 2-3)
- [ ] MarkEWMA implementation
- [ ] Fee-weighted updates
- [ ] Circuit breaker logic
- [ ] Funding rate calculations

### Phase 3: OODA Enhancement (Week 3-4)
- [ ] Observe phase integration
- [ ] Orient phase with risk assessment
- [ ] Decide phase with risk-adjusted sizing
- [ ] Act phase with health monitoring

### Phase 4: Memory & Learning (Week 4-5)
- [ ] ClawVault Percolator state recording
- [ ] Risk pattern recall
- [ ] Adaptive parameter updates
- [ ] Performance feedback loop

---

## References

- Percolator Program: `percolator-prog-main/src/percolator.rs`
- OpenClawd OODA: `solana-clawd/pkg/agent/ooda.go`
- Risk Engine: `solana-clawd/pkg/strategy/`
- ClawVault: `solana-clawd/pkg/memory/vault.go`

---

*Percolator × OpenClawd: Autonomous DeFi Risk Management*

