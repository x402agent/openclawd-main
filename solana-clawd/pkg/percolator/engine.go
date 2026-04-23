// Package percolator implements a Go port of the Percolator on-chain risk engine.
// It provides sophisticated risk management for autonomous trading agents.
//
// Key features:
//   - U128 arithmetic for precise calculations
//   - Margin tracking and liquidation circuits
//   - EWMA mark price tracking with fee weighting
//   - Funding rate calculations
//   - Insurance fund monitoring
//
// Reference: percolator-prog-main/src/percolator.rs
package percolator

import (
	"fmt"
	"math"
	"sync"
	"time"
)

// Percolator constants (ported from Rust)
const (
	POS_SCALE            = 1_000_000 // Position scaling factor
	MAX_ACCOUNTS         = 4096      // Max trading accounts
	MAINTENANCE_MARGIN   = 1000      // 10% maintenance margin (bps)
	INITIAL_MARGIN       = 2000      // 20% initial margin (bps)
	LIQUIDATION_FEE_BPS = 100       // 1% liquidation fee

	// EWMA parameters
	DEFAULT_HALFLIFE_SLOTS = 100   // ~40 sec at 2.5 slots/sec
	DEFAULT_CAP_E2BPS     = 10_000 // 1% max price change per slot

	// Insurance fund defaults
	DEFAULT_INSURANCE_MIN_COVERAGE = 5.0  // 5x minimum coverage
	DEFAULT_INSURANCE_MAX_DRAWDOWN  = 0.1  // 10% max drawdown

	// Funding parameters
	DEFAULT_FUNDING_HORIZON_SLOTS = 500 // ~4 min at 2.5 slots/sec
	DEFAULT_FUNDING_K_BPS         = 100 // 1.00x multiplier
	DEFAULT_FUNDING_MAX_PREMIUM   = 500 // 5% cap
)

// U128 implements 128-bit unsigned integer operations
// Ported from Rust's U128 wrapper for precise financial calculations
type U128 struct {
	lo uint64 // Lower 64 bits
	hi uint64 // Upper 64 bits
}

// NewU128 creates a new U128 from two uint64 values
func NewU128(lo, hi uint64) *U128 {
	return &U128{lo: lo, hi: hi}
}

// NewU128FromUint64 creates a U128 from a single uint64
func NewU128FromUint64(v uint64) *U128 {
	return &U128{lo: v, hi: 0}
}

// Zero returns a zero U128
func (u *U128) Zero() *U128 {
	return &U128{lo: 0, hi: 0}
}

// IsZero returns true if the value is zero
func (u *U128) IsZero() bool {
	return u.lo == 0 && u.hi == 0
}

// Lo returns the lower 64 bits
func (u *U128) Lo() uint64 {
	return u.lo
}

// Hi returns the upper 64 bits
func (u *U128) Hi() uint64 {
	return u.hi
}

// String returns the decimal string representation
func (u *U128) String() string {
	if u.IsZero() {
		return "0"
	}
	// Simplified - would need big.Int for full precision
	return fmt.Sprintf("%d%018d", u.hi, u.lo)
}

// Add performs unsigned addition with overflow detection
func (u *U128) Add(v *U128) (*U128, bool) {
	lo, carry := add64(u.lo, v.lo)
	hi, carry2 := add64WithCarry(u.hi, v.hi, carry)
	return &U128{lo: lo, hi: hi}, carry || carry2
}

// Sub performs unsigned subtraction with underflow detection
func (u *U128) Sub(v *U128) (*U128, bool) {
	lo, borrow := sub64(u.lo, v.lo)
	hi, borrow2 := sub64WithBorrow(u.hi, v.hi, borrow)
	return &U128{lo: lo, hi: hi}, borrow || borrow2
}

// Mul performs unsigned multiplication
func (u *U128) Mul(v *U128) *U128 {
	// Simplified implementation - would need schoolbook or better algorithm
	// for full 128x128=256 bit multiplication
	result := u.lo * v.lo
	return &U128{lo: result, hi: 0}
}

// Cmp compares two U128 values
func (u *U128) Cmp(v *U128) int {
	if u.hi < v.hi {
		return -1
	}
	if u.hi > v.hi {
		return 1
	}
	if u.lo < v.lo {
		return -1
	}
	if u.lo > v.lo {
		return 1
	}
	return 0
}

// Helper functions for 64-bit arithmetic with carry/borrow
func add64(a, b uint64) (uint64, bool) {
	c, ok := add64WithCarry(a, b, false)
	return c, ok
}

func add64WithCarry(a, b uint64, carry bool) (uint64, bool) {
	r := a + b
	overflow := r < a
	if carry {
		r2, overflow2 := add64WithCarry(r, 1, false)
		return r2, overflow || overflow2
	}
	return r, overflow
}

func sub64(a, b uint64) (uint64, bool) {
	r, borrow := sub64WithBorrow(a, b, false)
	return r, borrow
}

func sub64WithBorrow(a, b uint64, borrow bool) (uint64, bool) {
	r := a - b
	underflow := r > a
	if borrow {
		r2, borrow2 := sub64WithBorrow(r, 1, false)
		return r2, underflow || borrow2
	}
	return r, underflow
}

// RiskParams contains market risk parameters
type RiskParams struct {
	MaintenanceMarginBPS uint64 // Maintenance margin in basis points
	InitialMarginBPS   uint64 // Initial margin in basis points
	TradingFeeBPS      uint64 // Trading fee in basis points
	MaxAccounts        uint64 // Maximum number of accounts
	LiqFeeBPS          uint64 // Liquidation fee in basis points
	LiqFeeCap          *U128  // Maximum liquidation fee
	HMin               uint64 // Warmup horizon minimum slots
	HMax               uint64 // Warmup horizon maximum slots
	ResolveDevBPS      uint64 // Resolution deviation band
}

// DefaultRiskParams returns sensible defaults
func DefaultRiskParams() *RiskParams {
	return &RiskParams{
		MaintenanceMarginBPS: MAINTENANCE_MARGIN,
		InitialMarginBPS:     INITIAL_MARGIN,
		TradingFeeBPS:        10, // 0.1%
		MaxAccounts:          MAX_ACCOUNTS,
		LiqFeeBPS:           LIQUIDATION_FEE_BPS,
		LiqFeeCap:           NewU128FromUint64(1_000_000), // 1 USDC cap
		HMin:                100,
		HMax:                1000,
		ResolveDevBPS:       5000, // 50%
	}
}

// Position represents a trading position
type Position struct {
	Mu sync.RWMutex

	// Position data
	ID       string // Unique identifier
	SizeQ    int64  // Position size in units
	EntryPx  uint64 // Entry price (e6 format)
	Capital  *U128  // Available capital
	PnL      int64  // Realized PnL
	Reserved *U128  // Reserved margin

	// Risk metrics (computed)
	MarginHealth float64 // Health ratio (0-1)
	LiqDistance float64 // Distance to liquidation (0-1)

	// Funding
	FeeCredits  int64 // Accumulated fees
	FundingPaid int64 // Total funding paid

	// Timestamps
	OpenedSlot   uint64
	OpenedTime   time.Time
	LastUpdateSlot uint64
}

// NewPosition creates a new position
func NewPosition(id string, sizeQ int64, entryPx uint64, capital uint64) *Position {
	return &Position{
		ID:         id,
		SizeQ:      sizeQ,
		EntryPx:    entryPx,
		Capital:    NewU128FromUint64(capital),
		Reserved:   NewU128(0, 0),
		OpenedTime: time.Now(),
	}
}

// Equity calculates total equity
func (p *Position) Equity() float64 {
	p.Mu.RLock()
	defer p.Mu.RUnlock()
	
	capital := float64(p.Capital.Lo())
	return capital + float64(p.PnL)
}

// ReservedMargin calculates required margin based on position size
func (p *Position) ReservedMargin() uint64 {
	p.Mu.RLock()
	defer p.Mu.RUnlock()
	
	if p.SizeQ == 0 {
		return 0
	}
	
	// margin = |size| * price * initial_margin_bps / 10000
	notional := math.Abs(float64(p.SizeQ)) * float64(p.EntryPx) / 1e6
	return uint64(notional * float64(INITIAL_MARGIN) / 10000)
}

// MaintenanceMarginRequired calculates maintenance margin
func (p *Position) MaintenanceMarginRequired() uint64 {
	p.Mu.RLock()
	defer p.Mu.RUnlock()
	
	if p.SizeQ == 0 {
		return 0
	}
	
	notional := math.Abs(float64(p.SizeQ)) * float64(p.EntryPx) / 1e6
	return uint64(notional * float64(MAINTENANCE_MARGIN) / 10000)
}

// CalculateMarginHealth computes the margin health ratio
// Health = (Equity - Reserved) / Equity
func (p *Position) CalculateMarginHealth() float64 {
	p.Mu.Lock()
	defer p.Mu.Unlock()
	
	equity := p.Equity()
	if equity <= 0 {
		p.MarginHealth = 0
		return 0
	}
	
	reserved := float64(p.ReservedMargin())
	health := math.Max(0, (equity-reserved)/equity)
	p.MarginHealth = health
	return health
}

// LiquidationDistance calculates distance to liquidation
func (p *Position) LiquidationDistance(markPrice uint64) float64 {
	p.Mu.Lock()
	defer p.Mu.Unlock()
	
	if p.SizeQ == 0 {
		p.LiqDistance = 1.0
		return 1.0 // No position = no liquidation risk
	}
	
	entryValue := math.Abs(float64(p.SizeQ)) * float64(p.EntryPx) / 1e6
	if entryValue <= 0 {
		p.LiqDistance = 0
		return 0
	}
	
	// Liquidation when equity <= maintenance_margin * notional
	capital := float64(p.Capital.Lo())
	liqThreshold := entryValue * float64(MAINTENANCE_MARGIN) / 10000
	
	var liqPrice float64
	if p.SizeQ > 0 {
		// Long: liq price = entry - (capital - liq_threshold) / size
		liqPrice = float64(p.EntryPx) - (capital - liqThreshold) / float64(p.SizeQ) * 1e6
	} else {
		// Short: liq price = entry + (capital - liq_threshold) / |size|
		liqPrice = float64(p.EntryPx) + (capital - liqThreshold) / math.Abs(float64(p.SizeQ)) * 1e6
	}
	
	if liqPrice <= 0 {
		p.LiqDistance = 0
		return 0
	}
	
	distance := math.Abs(float64(markPrice) - liqPrice) / float64(markPrice)
	p.LiqDistance = math.Min(1.0, distance)
	return p.LiqDistance
}

// Account represents a trading account
type Account struct {
	Mu sync.RWMutex

	Owner [32]byte // Owner public key

	Capital  *U128 // Available capital
	Position *Position

	// Matcher config (for CPI-based trading)
	MatcherProgram [32]byte
	MatcherContext [32]byte

	// Fee tracking
	LastFeeSlot uint64
	FeeCredits int64
}

// NewAccount creates a new account
func NewAccount(owner [32]byte, initialCapital uint64) *Account {
	return &Account{
		Owner:   owner,
		Capital: NewU128FromUint64(initialCapital),
		Position: &Position{
			Capital: NewU128FromUint64(initialCapital),
		},
	}
}

// RiskEngine is the core risk calculation engine
type RiskEngine struct {
	mu sync.RWMutex

	// Market parameters
	Params *RiskParams

	// Price tracking
	LastOraclePx uint64 // Last oracle price
	MarkEWMA    *MarkEWMA
	IndexPrice  uint64 // Index price (external oracle)

	// Market state
	CurrentSlot    uint64
	LastMarketSlot uint64

	// Insurance fund
	InsuranceFund *U128

	// Account tracking
	Accounts []*Account
	UsedSlot bitmap // Bitmap of used account slots
}

// bitmap is a simple bitmap for tracking used slots
type bitmap []uint64

func newBitmap(size int) bitmap {
	words := (size + 63) / 64
	return make(bitmap, words)
}

func (b bitmap) Set(slot int) {
	word := slot / 64
	bit := slot % 64
	if word < len(b) {
		b[word] |= 1 << bit
	}
}

func (b bitmap) Clear(slot int) {
	word := slot / 64
	bit := slot % 64
	if word < len(b) {
		b[word] &^= 1 << bit
	}
}

func (b bitmap) IsSet(slot int) bool {
	word := slot / 64
	bit := slot % 64
	if word < len(b) {
		return b[word]&(1<<bit) != 0
	}
	return false
}

// MarkEWMA implements Percolator's fee-weighted exponential moving average
type MarkEWMA struct {
	Mu sync.RWMutex

	Value        uint64 // Current EWMA value
	LastSlot     uint64 // Last update slot
	HalflifeSlots uint64 // Half-life in slots

	MinFee uint64 // Minimum fee for full weight
	CapE2BPS uint64 // Circuit breaker cap (e2bps)
}

// NewMarkEWMA creates a new MarkEWMA
func NewMarkEWMA(halflifeSlots, minFee, capE2BPS uint64) *MarkEWMA {
	return &MarkEWMA{
		HalflifeSlots: halflifeSlots,
		MinFee:        minFee,
		CapE2BPS:     capE2BPS,
	}
}

// Update applies a new price observation with fee weighting
func (m *MarkEWMA) Update(price, feePaid, currentSlot uint64) uint64 {
	m.Mu.Lock()
	defer m.Mu.Unlock()
	
	if price == 0 {
		return m.Value
	}
	
	// First observation seeds the EWMA
	if m.Value == 0 {
		if m.MinFee == 0 || feePaid >= m.MinFee {
			m.Value = price
			m.LastSlot = currentSlot
		}
		return m.Value
	}
	
	// Same-slot protection
	dt := currentSlot - m.LastSlot
	if dt == 0 {
		return m.Value
	}
	
	// Calculate alpha: alpha ≈ dt / (dt + halflife)
	// Using Padé approximant of 1 - 2^(-dt/halflife)
	alphaBps := (10000 * dt) / (dt + m.HalflifeSlots)
	if m.HalflifeSlots == 0 {
		alphaBps = 10000 // Instant update
	}
	
	// Apply fee weighting
	effectiveAlphaBps := alphaBps
	if m.MinFee > 0 && feePaid < m.MinFee {
		// Scale alpha by fee ratio
		effectiveAlphaBps = alphaBps * feePaid / m.MinFee
	}
	
	// EWMA update: new = old + sign(delta) * |delta| * alpha
	if price >= m.Value {
		delta := price - m.Value
		m.Value += delta * effectiveAlphaBps / 10000
	} else {
		delta := m.Value - price
		m.Value -= delta * effectiveAlphaBps / 10000
	}
	
	// Only full-weight observations advance the slot
	if m.MinFee == 0 || feePaid >= m.MinFee {
		m.LastSlot = currentSlot
	}
	
	return m.Value
}

// ClampPrice applies Percolator's circuit breaker
func (m *MarkEWMA) ClampPrice(rawPrice uint64) uint64 {
	m.Mu.RLock()
	defer m.Mu.RUnlock()
	
	if m.Value == 0 || m.CapE2BPS == 0 {
		return rawPrice
	}
	
	// max_delta = value * cap / 1_000_000
	maxDelta := m.Value * m.CapE2BPS / 1_000_000
	
	lower := m.Value - maxDelta
	upper := m.Value + maxDelta
	
	if rawPrice < lower {
		return lower
	}
	if rawPrice > upper {
		return upper
	}
	return rawPrice
}

// FundingRate calculates the funding rate from mark-index premium
func (m *MarkEWMA) FundingRate(indexPrice, horizonSlots uint64) int64 {
	m.Mu.RLock()
	defer m.Mu.RUnlock()
	
	if m.Value == 0 || indexPrice == 0 || horizonSlots == 0 {
		return 0
	}
	
	// Premium = (mark - index) / index
	diff := int64(m.Value) - int64(indexPrice)
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

// NewRiskEngine creates a new risk engine
func NewRiskEngine(params *RiskParams) *RiskEngine {
	if params == nil {
		params = DefaultRiskParams()
	}
	
	return &RiskEngine{
		Params:        params,
		MarkEWMA:      NewMarkEWMA(DEFAULT_HALFLIFE_SLOTS, 0, DEFAULT_CAP_E2BPS),
		InsuranceFund: NewU128(0, 0),
		Accounts:      make([]*Account, params.MaxAccounts),
		UsedSlot:      newBitmap(int(params.MaxAccounts)),
	}
}

// GetAllPositions returns all active positions
func (e *RiskEngine) GetAllPositions() []*Position {
	e.mu.RLock()
	defer e.mu.RUnlock()
	
	var positions []*Position
	for _, acc := range e.Accounts {
		if acc != nil && acc.Position != nil && acc.Position.SizeQ != 0 {
			positions = append(positions, acc.Position)
		}
	}
	return positions
}

// GetPosition returns a position by ID
func (e *RiskEngine) GetPosition(id string) *Position {
	e.mu.RLock()
	defer e.mu.RUnlock()
	
	for _, acc := range e.Accounts {
		if acc != nil && acc.Position != nil && acc.Position.ID == id {
			return acc.Position
		}
	}
	return nil
}

// CurrentMarketHealth aggregates health across all positions
func (e *RiskEngine) CurrentMarketHealth() float64 {
	e.mu.RLock()
	defer e.mu.RUnlock()
	
	var totalEquity, totalReserved float64
	
	for _, acc := range e.Accounts {
		if acc == nil || acc.Position == nil {
			continue
		}
		totalEquity += acc.Position.Equity()
		totalReserved += float64(acc.Position.ReservedMargin())
	}
	
	if totalEquity <= 0 {
		return 0
	}
	
	return math.Max(0, (totalEquity - totalReserved) / totalEquity)
}

// CalculateRiskAdjustedSize determines position size based on risk parameters
func (e *RiskEngine) CalculateRiskAdjustedSize(
	signalStrength, confidence float64, // 0-1
	availableCapital, markPrice uint64,
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
	healthFactor := e.CurrentMarketHealth()
	if healthFactor == 0 {
		healthFactor = 1.0 // Default to full size if no positions
	}
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

// RecordTrade updates the risk engine with a new trade
func (e *RiskEngine) RecordTrade(position *Position, feePaid uint64, slot uint64) {
	e.mu.Lock()
	defer e.mu.Unlock()
	
	e.CurrentSlot = slot
	
	// Update mark EWMA
	e.MarkEWMA.Update(position.EntryPx, feePaid, slot)
	
	// Update position metrics
	position.LastUpdateSlot = slot
	position.CalculateMarginHealth()
}

// AssessRisk implements Percolator-style risk assessment
func (e *RiskEngine) AssessRisk(markPrice uint64) RiskAssessment {
	e.mu.RLock()
	defer e.mu.RUnlock()
	
	assess := RiskAssessment{
		Timestamp: time.Now(),
	}
	
	// Market-wide health
	assess.MarketHealth = e.CurrentMarketHealth()
	
	// Per-position risk
	for _, acc := range e.Accounts {
		if acc == nil || acc.Position == nil || acc.Position.SizeQ == 0 {
			continue
		}
		
		posRisk := PositionRisk{
			PositionID:     acc.Position.ID,
			MarginHealth:    acc.Position.CalculateMarginHealth(),
			LiqDistance:     acc.Position.LiquidationDistance(markPrice),
			FundingRateBPS: e.MarkEWMA.FundingRate(e.IndexPrice, DEFAULT_FUNDING_HORIZON_SLOTS),
		}
		assess.PositionRisks = append(assess.PositionRisks, posRisk)
	}
	
	// Insurance fund health
	assess.InsuranceCoverage = e.InsuranceCoverage()
	
	// Risk verdict
	assess.Verdict = e.DetermineRiskVerdict(assess)
	
	return assess
}

// InsuranceCoverage calculates insurance fund coverage ratio
func (e *RiskEngine) InsuranceCoverage() float64 {
	e.mu.RLock()
	defer e.mu.RUnlock()
	
	var totalNotional float64
	for _, acc := range e.Accounts {
		if acc == nil || acc.Position == nil || acc.Position.SizeQ == 0 {
			continue
		}
		notional := math.Abs(float64(acc.Position.SizeQ)) * float64(e.LastOraclePx) / 1e6
		totalNotional += notional
	}
	
	if totalNotional == 0 {
		return 0 // No positions = infinite coverage
	}
	
	insurance := float64(e.InsuranceFund.Lo())
	return insurance / totalNotional
}

// DetermineRiskVerdict returns the overall risk verdict
func (e *RiskEngine) DetermineRiskVerdict(assess RiskAssessment) RiskVerdict {
	// Critical conditions
	if assess.MarketHealth < 0.1 {
		return RiskVerdictCritical
	}
	
	// Check for any position below critical threshold
	for _, pos := range assess.PositionRisks {
		if pos.LiqDistance < 0.05 || pos.MarginHealth < 0.1 {
			return RiskVerdictCritical
		}
	}
	
	// High risk conditions
	if assess.MarketHealth < 0.3 {
		return RiskVerdictHigh
	}
	
	for _, pos := range assess.PositionRisks {
		if pos.LiqDistance < 0.15 || pos.MarginHealth < 0.2 {
			return RiskVerdictHigh
		}
	}
	
	// Caution conditions
	if assess.MarketHealth < 0.5 {
		return RiskVerdictCaution
	}
	
	// Insurance fund check
	if assess.InsuranceCoverage < DEFAULT_INSURANCE_MIN_COVERAGE {
		return RiskVerdictCaution
	}
	
	return RiskVerdictSafe
}

// RiskAssessment contains the result of a risk assessment
type RiskAssessment struct {
	Timestamp          time.Time
	MarketHealth       float64
	PositionRisks      []PositionRisk
	InsuranceCoverage   float64
	Verdict            RiskVerdict
}

// PositionRisk contains risk metrics for a single position
type PositionRisk struct {
	PositionID     string
	MarginHealth   float64
	LiqDistance    float64  // 0-1, higher = safer
	FundingRateBPS int64
}

// RiskVerdict represents the overall risk verdict
type RiskVerdict string

const (
	RiskVerdictSafe     RiskVerdict = "SAFE"
	RiskVerdictCaution RiskVerdict = "CAUTION"
	RiskVerdictHigh    RiskVerdict = "HIGH"
	RiskVerdictCritical RiskVerdict = "CRITICAL"
)
