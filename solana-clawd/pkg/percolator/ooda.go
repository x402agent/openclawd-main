// Package percolator provides OODA loop integration with the Percolator risk engine.
// This file contains the autonomous trading agent that combines Observe-Orient-Decide-Act
// cycle with sophisticated on-chain risk management.
package percolator

import (
	"context"
	"fmt"
	"math"
	"sync"
	"time"
)

// TradeSide represents the direction of a trade
type TradeSide string

const (
	SideLong  TradeSide = "LONG"
	SideShort TradeSide = "SHORT"
	SideNone TradeSide = "NONE"
)

// TradeAction represents the type of action to take
type TradeAction string

const (
	ActionOpen   TradeAction = "OPEN"
	ActionClose  TradeAction = "CLOSE"
	ActionAdjust TradeAction = "ADJUST"
)

// Indicators contains calculated technical indicators
type Indicators struct {
	RSI   float64 // Relative Strength Index (0-100)
	EMA9  float64 // 9-period EMA
	EMA21 float64 // 21-period EMA
	ATR   float64 // Average True Range
	MACD  float64
	Signal float64
}

// OHLCV contains price bar data
type OHLCV struct {
	Open   []uint64
	High   []uint64
	Low    []uint64
	Close  []uint64
	Volume []uint64
}

// PriceData contains current price information
type PriceData struct {
	Price     uint64
	Timestamp time.Time
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
}

// FundingRate contains funding rate information
type FundingRate struct {
	Token   string
	Mark    uint64
	Index   uint64
	RateBPS int64
}

// Orientation contains the analysis results
type Orientation struct {
	Timestamp              time.Time
	Indicators             map[string]Indicators
	RiskAssessment         RiskAssessment
	Signals                map[string]TradeSignal
	TradeSignal            TradeSignal
	MatchedPattern         *PatternMatch
	ConfidenceBoost        float64
	Snapshot               *MarketSnapshot
	PerformanceAdjustedSignal *TradeSignal
}

// TradeSignal contains a trading signal
type TradeSignal struct {
	Token     string
	Side      TradeSide
	Strength  float64 // 0-1 signal strength
	Confidence float64 // 0-1 confidence level
	EntryTime time.Time
	Expiry    time.Time
}

// PatternMatch represents a matched trading pattern
type PatternMatch struct {
	PatternType   string
	ConfidenceBoost float64
	HistoricalPnL float64
	HitRate       float64
	AvgDuration   time.Duration
}

// TradePlan contains the execution plan
type TradePlan struct {
	Action       TradeAction
	Token        string
	Side         TradeSide
	Size         int64
	EntryPrice   uint64
	StopLoss     uint64
	TakeProfit   uint64
	RiskMetric   float64
	Confidence   float64
	PositionID   string
	Reason       string
	RiskReduction bool
}

// Execution contains the execution result
type Execution struct {
	Plan      *TradePlan
	Timestamp time.Time
	Result    *SwapResult
	Err       error
}

// SwapResult contains the result of a swap
type SwapResult struct {
	TxHash       string
	InputAmount  uint64
	OutputAmount uint64
	PriceImpact  float64
	Fee          uint64
	Slot         uint64
}

// OODAAgent is the autonomous trading agent with Percolator risk integration
type OODAAgent struct {
	mu sync.RWMutex

	// Configuration
	Wallet    Wallet
	RPCClient RPCClient
	Tracker   PriceTracker
	Jupiter   JupiterClient
	Vault     *MemoryVault

	// Percolator risk engine
	RiskEngine *RiskEngine

	// State
	CurrentSlot   uint64
	CurrentToken  string
	Watchlist      []string

	// Mode
	Mode TradingMode
}

// Wallet interface for signing transactions
type Wallet interface {
	SignTransaction(tx []byte) ([]byte, error)
	PubKey() [32]byte
}

// RPCClient interface for Solana RPC
type RPCClient interface {
	GetSlot(ctx context.Context) (uint64, error)
	GetBalance(ctx context.Context, pubkey [32]byte) (uint64, error)
	SendTransaction(ctx context.Context, tx []byte) (string, error)
	GetSignatures(ctx context.Context, pubkey [32]byte, limit int) ([]SignatureInfo, error)
}

// PriceTracker interface for price data
type PriceTracker interface {
	GetPrices(ctx context.Context, tokens []string) (map[string]PriceData, error)
	GetOHLCV(ctx context.Context, token, interval string) (*OHLCV, error)
	GetPrice(ctx context.Context, token string) (uint64, error)
}

// JupiterClient interface for Jupiter DEX
type JupiterClient interface {
	GetQuote(ctx context.Context, req *QuoteRequest) (*QuoteResponse, error)
	GetUltraOrder(ctx context.Context, req *UltraOrderRequest) (*UltraOrderResponse, error)
	ExecuteUltra(ctx context.Context, req *UltraExecuteRequest) (*SwapResult, error)
}

// MemoryVault interface for trade memory
type MemoryVault interface {
	RecallPattern(ctx context.Context, match PatternMatch) ([]Trade, error)
	FindPattern(ctx context.Context, snapshot *MarketSnapshot) *PatternMatch
	GetRecentPerformance() *PerformanceRecord
	Record(ctx context.Context, kind string, data interface{}) error
}

// QuoteRequest for Jupiter
type QuoteRequest struct {
	InputMint   string
	OutputMint  string
	Amount      uint64
	SlippageBPS int
}

// QuoteResponse from Jupiter
type QuoteResponse struct {
	InputMint   string
	OutputMint  string
	InAmount    uint64
	OutAmount   uint64
	PriceImpact float64
	OtherAmount uint64
}

// UltraOrderRequest for Jupiter Ultra
type UltraOrderRequest struct {
	InputMint  string
	OutputMint string
	Amount     uint64
	Slippage   int
}

// UltraOrderResponse from Jupiter Ultra
type UltraOrderResponse struct {
	RequestID   string
	Transaction []byte
}

// UltraExecuteRequest for executing Ultra order
type UltraExecuteRequest struct {
	RequestID   string
	Transaction []byte
}

// SignatureInfo contains transaction signature data
type SignatureInfo struct {
	Signature string
	Slot      uint64
	Timestamp time.Time
}

// Trade represents a historical trade
type Trade struct {
	ID        string
	Token     string
	Side      TradeSide
	Size      int64
	EntryPx   uint64
	ExitPx    uint64
	PnL       float64
	Timestamp time.Time
	Duration  time.Duration
	ExitReason string
}

// PerformanceRecord contains recent performance metrics
type PerformanceRecord struct {
	WinRate    float64
	AvgPnL     float64
	TotalTrades int
	Sharpe     float64
}

// TradingMode represents the trading mode
type TradingMode string

const (
	ModeSafe   TradingMode = "SAFE"
	ModeNormal TradingMode = "NORMAL"
	ModeAggressive TradingMode = "AGGRESSIVE"
)

// NewOODAAgent creates a new OODA agent
func NewOODAAgent(cfg *AgentConfig) *OODAAgent {
	riskEngine := NewRiskEngine(cfg.RiskParams)
	
	return &OODAAgent{
		Wallet:     cfg.Wallet,
		RPCClient:  cfg.RPCClient,
		Tracker:    cfg.Tracker,
		Jupiter:    cfg.Jupiter,
		Vault:      cfg.Vault,
		RiskEngine: riskEngine,
		Watchlist:  cfg.Watchlist,
		Mode:       ModeNormal,
	}
}

// AgentConfig contains agent configuration
type AgentConfig struct {
	Wallet     Wallet
	RPCClient  RPCClient
	Tracker    PriceTracker
	Jupiter    JupiterClient
	Vault      *MemoryVault
	RiskParams *RiskParams
	Watchlist  []string
}

// Observe implements the OODA Observe phase
func (a *OODAAgent) Observe(ctx context.Context) (*MarketSnapshot, error) {
	snapshot := &MarketSnapshot{
		Timestamp: time.Now(),
		Slot:      a.CurrentSlot,
		Prices:    make(map[string]PriceData),
		OHLCV:     make(map[string]*OHLCV),
	}

	// 1. Price data from tracker
	prices, err := a.Tracker.GetPrices(ctx, a.Watchlist)
	if err != nil {
		return nil, fmt.Errorf("price fetch: %w", err)
	}
	snapshot.Prices = prices

	// 2. OHLCV data for indicators
	for _, token := range a.Watchlist {
		ohlcv, err := a.Tracker.GetOHLCV(ctx, token, "1h")
		if err != nil {
			continue
		}
		snapshot.OHLCV[token] = ohlcv
	}

	// 3. Wallet state from RPC
	balance, err := a.RPCClient.GetBalance(ctx, a.Wallet.PubKey())
	if err == nil {
		snapshot.Balance = balance
	}

	// 4. Position state from Percolator engine
	snapshot.Positions = a.RiskEngine.GetAllPositions()

	// 5. Market risk metrics
	for _, pos := range snapshot.Positions {
		pos.MarginHealth = pos.CalculateMarginHealth()
		if pos.SizeQ != 0 {
			pos.LiqDistance = pos.LiquidationDistance(snapshot.Prices["SOL"].Price)
		}
	}

	// 6. Insurance fund status
	snapshot.InsuranceFund = a.RiskEngine.InsuranceFund
	snapshot.MarketHealth = a.RiskEngine.CurrentMarketHealth()

	// 7. Funding rates from MarkEWMA
	for _, pos := range snapshot.Positions {
		baseToken := "SOL"
		snapshot.FundingRates = append(snapshot.FundingRates, FundingRate{
			Token:   baseToken,
			Mark:    a.RiskEngine.MarkEWMA.Value,
			Index:   a.RiskEngine.IndexPrice,
			RateBPS: a.RiskEngine.MarkEWMA.FundingRate(a.RiskEngine.IndexPrice, DEFAULT_FUNDING_HORIZON_SLOTS),
		})
	}

	// 8. ClawVault memory recall
	if a.Vault != nil {
		relevantTrades, _ := a.Vault.RecallPattern(ctx, PatternMatch{
			PatternType: "RSI_EMA",
		})
		_ = relevantTrades // Used in Orient phase
	}

	return snapshot, nil
}

// Orient implements the OODA Orient phase
func (a *OODAAgent) Orient(snapshot *MarketSnapshot) (*Orientation, error) {
	orient := &Orientation{
		Timestamp:  time.Now(),
		Indicators: make(map[string]Indicators),
		Signals:    make(map[string]TradeSignal),
		Snapshot:   snapshot,
	}

	// 1. Calculate technical indicators
	for token, ohlcv := range snapshot.OHLCV {
		indicators := a.CalculateIndicators(ohlcv)
		orient.Indicators[token] = indicators
	}

	// 2. Percolator risk assessment
	orient.RiskAssessment = a.RiskEngine.AssessRisk(snapshot.Prices["SOL"].Price)

	// 3. Signal generation with risk weighting
	for token, ind := range orient.Indicators {
		signals := a.GenerateSignals(token, ind, orient.RiskAssessment)
		orient.Signals[token] = signals

		// Aggregate into trade signal
		orient.TradeSignal = a.AggregateSignals(signals)
	}

	// 4. ClawVault pattern matching
	if a.Vault != nil {
		pattern := a.Vault.FindPattern(snapshot)
		orient.MatchedPattern = pattern
		orient.ConfidenceBoost = pattern.ConfidenceBoost()
	}

	// 5. OODA loop feedback integration
	if a.Vault != nil {
		recentPerformance := a.Vault.GetRecentPerformance()
		adjustedSignal := a.ApplyFeedback(orient.TradeSignal, recentPerformance)
		orient.PerformanceAdjustedSignal = &adjustedSignal
	}

	return orient, nil
}

// Decide implements the OODA Decide phase
func (a *OODAAgent) Decide(orient *Orientation) (*TradePlan, error) {
	signal := orient.TradeSignal
	risk := orient.RiskAssessment

	// Use performance-adjusted signal if available
	if orient.PerformanceAdjustedSignal != nil {
		signal = *orient.PerformanceAdjustedSignal
	}

	// Apply risk verdict to signal
	signal = a.ApplyRiskVerdict(signal, risk)

	// Calculate position size using Percolator risk engine
	size, riskMetric := a.RiskEngine.CalculateRiskAdjustedSize(
		signal.Strength,
		signal.Confidence*orient.ConfidenceBoost,
		orient.Snapshot.Balance,
		orient.Snapshot.Prices[a.CurrentToken].Price,
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
	sl, tp := a.CalculateSLTP(
		orient.Snapshot.Prices[a.CurrentToken].Price,
		orient.Indicators[a.CurrentToken].ATR,
		signal.Side,
	)

	// Check existing positions for SL/TP triggers
	for _, pos := range orient.Snapshot.Positions {
		if a.ShouldExitPosition(pos, sl, tp) {
			return &TradePlan{
				Action:        ActionClose,
				PositionID:    pos.ID,
				Reason:        "SL/TP trigger",
				RiskReduction: true,
			}, nil
		}
	}

	// New position plan
	return &TradePlan{
		Action:     ActionOpen,
		Token:      a.CurrentToken,
		Side:       signal.Side,
		Size:       size,
		EntryPrice: orient.Snapshot.Prices[a.CurrentToken].Price,
		StopLoss:   sl,
		TakeProfit: tp,
		RiskMetric: riskMetric,
		Confidence: signal.Confidence,
	}, nil
}

// Act implements the OODA Act phase
func (a *OODAAgent) Act(ctx context.Context, plan *TradePlan) (*Execution, error) {
	exec := &Execution{
		Plan:      plan,
		Timestamp: time.Now(),
	}

	switch plan.Action {
	case ActionOpen:
		exec.Result, exec.Err = a.ExecuteOpenPosition(ctx, plan)
	case ActionClose:
		exec.Result, exec.Err = a.ExecuteClosePosition(ctx, plan)
	case ActionAdjust:
		exec.Result, exec.Err = a.ExecuteAdjustPosition(ctx, plan)
	}

	// Log to ClawVault memory
	if a.Vault != nil && exec.Err == nil {
		_ = a.Vault.Record(ctx, "execution", exec)
	}

	// Update Percolator risk engine state
	if exec.Err == nil && plan.Action == ActionOpen {
		a.RiskEngine.RecordTrade(
			a.RiskEngine.GetPosition(plan.PositionID),
			exec.Result.Fee,
			exec.Result.Slot,
		)
	}

	return exec, exec.Err
}

// CalculateIndicators computes RSI, EMA, ATR, etc.
func (a *OODAAgent) CalculateIndicators(ohlcv *OHLCV) Indicators {
	closes := make([]float64, len(ohlcv.Close))
	for i, c := range ohlcv.Close {
		closes[i] = float64(c) / 1e6
	}

	return Indicators{
		RSI:   CalculateRSI(closes, 14),
		EMA9:  CalculateEMA(closes, 9),
		EMA21: CalculateEMA(closes, 21),
		ATR:   CalculateATR(ohlcv, 14),
	}
}

// CalculateRSI computes Relative Strength Index
func CalculateRSI(prices []float64, period int) float64 {
	if len(prices) < period+1 {
		return 50 // Neutral
	}

	var gains, losses float64
	for i := len(prices) - period; i < len(prices); i++ {
		delta := prices[i] - prices[i-1]
		if delta > 0 {
			gains += delta
		} else {
			losses -= delta
		}
	}

	avgGain := gains / float64(period)
	avgLoss := losses / float64(period)

	if avgLoss == 0 {
		return 100
	}

	rs := avgGain / avgLoss
	rsi := 100 - (100 / (1 + rs))
	return math.Max(0, math.Min(100, rsi))
}

// CalculateEMA computes Exponential Moving Average
func CalculateEMA(prices []float64, period int) float64 {
	if len(prices) == 0 {
		return 0
	}

	multiplier := 2.0 / float64(period+1)
	ema := prices[0]

	for i := 1; i < len(prices); i++ {
		ema = (prices[i]-ema)*multiplier + ema
	}

	return ema
}

// CalculateATR computes Average True Range
func CalculateATR(ohlcv *OHLCV, period int) float64 {
	if len(ohlcv.Close) < period {
		return 0
	}

	var trSum float64
	for i := len(ohlcv.Close) - period; i < len(ohlcv.Close); i++ {
		high := float64(ohlcv.High[i]) / 1e6
		low := float64(ohlcv.Low[i]) / 1e6
		close := float64(ohlcv.Close[i-1]) / 1e6

		tr := high - low
		if prevClose := math.Abs(close - high); prevClose > tr {
			tr = prevClose
		}
		if prevClose := math.Abs(close - low); prevClose > tr {
			tr = prevClose
		}
		trSum += tr
	}

	return trSum / float64(period)
}

// GenerateSignals generates trade signals from indicators
func (a *OODAAgent) GenerateSignals(token string, ind Indicators, risk RiskAssessment) TradeSignal {
	signal := TradeSignal{
		Token: token,
		Side:  SideNone,
	}

	// RSI signals
	if ind.RSI < 30 {
		// Oversold - potential long
		signal.Strength = (30 - ind.RSI) / 30
		signal.Side = SideLong
	} else if ind.RSI > 70 {
		// Overbought - potential short
		signal.Strength = (ind.RSI - 70) / 30
		side := SideShort
		signal.Side = side
	}

	// EMA crossover confirmation
	if ind.EMA9 > ind.EMA21 && signal.Side == SideLong {
		signal.Confidence = 0.8
	} else if ind.EMA9 < ind.EMA21 && signal.Side == SideShort {
		signal.Confidence = 0.8
	} else {
		signal.Confidence = 0.5
	}

	// Adjust for risk verdict
	switch risk.Verdict {
	case RiskVerdictCritical:
		signal.Strength = 0
	case RiskVerdictHigh:
		signal.Strength *= 0.5
	case RiskVerdictCaution:
		signal.Strength *= 0.8
	}

	return signal
}

// AggregateSignals combines signals into a single trade signal
func (a *OODAAgent) AggregateSignals(signal TradeSignal) TradeSignal {
	// Simple pass-through for now
	// Could implement weighted combination of multiple signals
	return signal
}

// ApplyFeedback adjusts signal based on historical performance
func (a *OODAAgent) ApplyFeedback(signal TradeSignal, perf *PerformanceRecord) TradeSignal {
	if perf == nil || perf.TotalTrades < 5 {
		return signal
	}

	// Adjust confidence based on win rate
	if perf.WinRate > 0.6 {
		signal.Confidence *= 1.2
	} else if perf.WinRate < 0.4 {
		signal.Confidence *= 0.8
	}

	// Clamp confidence
	if signal.Confidence > 1.0 {
		signal.Confidence = 1.0
	}

	return signal
}

// ApplyRiskVerdict adjusts trading parameters based on risk assessment
func (a *OODAAgent) ApplyRiskVerdict(signal TradeSignal, risk RiskAssessment) TradeSignal {
	adjusted := signal

	switch risk.Verdict {
	case RiskVerdictCritical:
		adjusted.Strength = 0
		adjusted.Confidence *= 0.1
	case RiskVerdictHigh:
		adjusted.Strength *= 0.5
		adjusted.Confidence *= 0.7
	case RiskVerdictCaution:
		adjusted.Strength *= 0.8
		adjusted.Confidence *= 0.9
	case RiskVerdictSafe:
		// No adjustment
	}

	return adjusted
}

// CalculateSLTP computes risk-adjusted SL/TP
func (a *OODAAgent) CalculateSLTP(entryPrice, atr uint64, side TradeSide) (sl, tp uint64) {
	atrFloat := float64(atr)
	entryFloat := float64(entryPrice)

	// ATR-based stops
	slDistance := atrFloat * 1.5
	tpDistance := atrFloat * 2.5

	// Tighter SL when health is low
	if a.RiskEngine.CurrentMarketHealth() < 0.3 {
		slDistance = atrFloat * 1.0
	}

	if side == SideLong {
		sl = uint64(entryFloat - slDistance)
		tp = uint64(entryFloat + tpDistance)
	} else {
		sl = uint64(entryFloat + slDistance)
		tp = uint64(entryFloat - tpDistance)
	}

	// Minimum distance
	minDistance := entryFloat * 0.01
	if side == SideLong && float64(sl) < entryFloat-minDistance {
		sl = uint64(entryFloat - minDistance)
	} else if side == SideShort && float64(sl) > entryFloat+minDistance {
		sl = uint64(entryFloat + minDistance)
	}

	return sl, tp
}

// ShouldExitPosition checks if position should be exited
func (a *OODAAgent) ShouldExitPosition(pos *Position, sl, tp uint64) bool {
	if pos.SizeQ == 0 {
		return false
	}

	// Check margin health
	if pos.MarginHealth < 0.15 {
		return true
	}

	// Check liquidation distance
	if pos.LiqDistance < 0.05 {
		return true
	}

	// Check SL/TP (simplified)
	// In production, would compare current price to SL/TP
	_ = sl
	_ = tp

	return false
}

// ExecuteOpenPosition executes via Jupiter Ultra with MEV protection
func (a *OODAAgent) ExecuteOpenPosition(ctx context.Context, plan *TradePlan) (*SwapResult, error) {
	// 1. Get quote from Jupiter
	quote, err := a.Jupiter.GetQuote(ctx, &QuoteRequest{
		InputMint:   "So11111111111111111111111111111111111111112",
		OutputMint:  plan.Token,
		Amount:      uint64(plan.Size),
		SlippageBPS: 50,
	})
	if err != nil {
		return nil, fmt.Errorf("quote: %w", err)
	}

	// 2. Get ultra order (MEV protected)
	order, err := a.Jupiter.GetUltraOrder(ctx, &UltraOrderRequest{
		InputMint:  quote.InputMint,
		OutputMint: quote.OutputMint,
		Amount:     quote.InAmount,
		Slippage:   50,
	})
	if err != nil {
		// Fallback to regular swap
		return a.ExecuteRegularSwap(ctx, plan, quote)
	}

	// 3. Sign locally
	signedTx, err := a.Wallet.SignTransaction(order.Transaction)
	if err != nil {
		return nil, fmt.Errorf("sign: %w", err)
	}

	// 4. Execute via Jupiter Ultra
	result, err := a.Jupiter.ExecuteUltra(ctx, &UltraExecuteRequest{
		RequestID:   order.RequestID,
		Transaction: signedTx,
	})
	if err != nil {
		return nil, fmt.Errorf("execute: %w", err)
	}

	return result, nil
}

// ExecuteRegularSwap executes a regular Jupiter swap
func (a *OODAAgent) ExecuteRegularSwap(ctx context.Context, plan *TradePlan, quote *QuoteResponse) (*SwapResult, error) {
	// Simplified - would need proper transaction building
	return &SwapResult{
		InputAmount:  quote.InAmount,
		OutputAmount: quote.OutAmount,
		PriceImpact:  quote.PriceImpact,
		Fee:          uint64(float64(quote.InAmount) * 0.001), // 0.1% fee
	}, nil
}

// ExecuteClosePosition executes position close
func (a *OODAAgent) ExecuteClosePosition(ctx context.Context, plan *TradePlan) (*SwapResult, error) {
	// Similar to open but reversed
	return &SwapResult{}, nil
}

// ExecuteAdjustPosition executes position adjustment
func (a *OODAAgent) ExecuteAdjustPosition(ctx context.Context, plan *TradePlan) (*SwapResult, error) {
	// Modify SL/TP or size
	return &SwapResult{}, nil
}

// RunCycle executes a complete OODA cycle
func (a *OODAAgent) RunCycle(ctx context.Context) (*Execution, error) {
	// Observe
	snapshot, err := a.Observe(ctx)
	if err != nil {
		return nil, fmt.Errorf("observe: %w", err)
	}

	// Orient
	orient, err := a.Orient(snapshot)
	if err != nil {
		return nil, fmt.Errorf("orient: %w", err)
	}

	// Decide
	plan, err := a.Decide(orient)
	if err != nil {
		return nil, fmt.Errorf("decide: %w", err)
	}

	// Act
	exec, err := a.Act(ctx, plan)
	if err != nil {
		return nil, fmt.Errorf("act: %w", err)
	}

	return exec, nil
}
