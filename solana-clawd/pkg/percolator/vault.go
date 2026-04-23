// Package percolator provides memory vault integration for risk pattern storage.
// ClawVault stores trading intelligence and provides pattern recall for the OODA loop.
package percolator

import (
	"context"
	"fmt"
	"sync"
	"time"
)

// PercolatorState records the state of the Percolator risk engine
type PercolatorState struct {
	Timestamp      time.Time
	Slot           uint64
	MarketHealth   float64
	InsuranceFund  uint64
	MarkEWMA       uint64
	IndexPrice     uint64
	ActiveAccounts int
}

// LearningRecord captures a trade outcome for pattern learning
type LearningRecord struct {
	Timestamp     time.Time
	EntryHealth   float64
	ExitReason    string
	PnL           float64
	DurationSlots uint64
	RiskTaken     float64
	SignalType    string
}

// MemoryVault stores and recalls trading patterns and risk states
type MemoryVault struct {
	mu sync.RWMutex

	// Storage
	percolatorStates []PercolatorState
	learningRecords  []LearningRecord
	trades           []Trade
	patterns         map[string]*PatternMatch

	// Performance tracking
	winCount   int
	totalCount int
	totalPnL   float64

	// Configuration
	maxRecords    int
	recallLimit   int
}

// NewMemoryVault creates a new memory vault
func NewMemoryVault() *MemoryVault {
	return &MemoryVault{
		percolatorStates: make([]PercolatorState, 0),
		learningRecords:  make([]LearningRecord, 0),
		trades:           make([]Trade, 0),
		patterns:         make(map[string]*PatternMatch),
		maxRecords:       10000,
		recallLimit:      10,
	}
}

// Record stores a new record in the vault
func (v *MemoryVault) Record(ctx context.Context, kind string, data interface{}) error {
	v.mu.Lock()
	defer v.mu.Unlock()

	switch kind {
	case "percolator_state":
		if state, ok := data.(PercolatorState); ok {
			v.percolatorStates = append(v.percolatorStates, state)
			if len(v.percolatorStates) > v.maxRecords {
				v.percolatorStates = v.percolatorStates[1:]
			}
		}
	case "learning":
		if record, ok := data.(LearningRecord); ok {
			v.learningRecords = append(v.learningRecords, record)
			if len(v.learningRecords) > v.maxRecords {
				v.learningRecords = v.learningRecords[1:]
			}
			// Update performance metrics
			v.totalCount++
			v.totalPnL += record.PnL
			if record.PnL > 0 {
				v.winCount++
			}
		}
	case "trade":
		if trade, ok := data.(Trade); ok {
			v.trades = append(v.trades, trade)
			if len(v.trades) > v.maxRecords {
				v.trades = v.trades[1:]
			}
		}
	case "execution":
		if exec, ok := data.(Execution); ok {
			trade := Trade{
				ID:        fmt.Sprintf("trade-%d", len(v.trades)),
				Token:     exec.Plan.Token,
				Side:      exec.Plan.Side,
				Size:      exec.Plan.Size,
				EntryPx:   exec.Plan.EntryPrice,
				Timestamp: exec.Timestamp,
			}
			v.trades = append(v.trades, trade)
		}
	}

	return nil
}

// RecallPattern recalls similar trading patterns
func (v *MemoryVault) RecallPattern(ctx context.Context, match PatternMatch) ([]Trade, error) {
	v.mu.RLock()
	defer v.mu.RUnlock()

	var results []Trade
	cutoff := time.Now().Add(-24 * time.Hour)

	for i := len(v.trades) - 1; i >= 0 && len(results) < v.recallLimit; i-- {
		trade := v.trades[i]
		if trade.Timestamp.After(cutoff) && trade.Token == match.PatternType {
			results = append(results, trade)
		}
	}

	return results, nil
}

// FindPattern finds matching patterns in market snapshot
func (v *MemoryVault) FindPattern(snapshot *MarketSnapshot) *PatternMatch {
	v.mu.RLock()
	defer v.mu.RUnlock()

	pattern := &PatternMatch{
		PatternType:     "DEFAULT",
		ConfidenceBoost: 1.0,
	}

	// Analyze recent trades for patterns
	var similarTrades int
	cutoff := time.Now().Add(-1 * time.Hour)

	for _, trade := range v.trades {
		if trade.Timestamp.After(cutoff) {
			similarTrades++
		}
	}

	// Adjust confidence based on pattern detection
	if similarTrades > 5 {
		pattern.ConfidenceBoost = 1.1
		pattern.PatternType = "HIGH_ACTIVITY"
	}

	// Calculate historical performance for this pattern
	if len(v.learningRecords) > 0 {
		var totalPnL float64
		var count int
		for _, rec := range v.learningRecords[len(v.learningRecords)-min(100, len(v.learningRecords)):] {
			totalPnL += rec.PnL
			count++
		}
		if count > 0 {
			pattern.HistoricalPnL = totalPnL / float64(count)
			if pattern.HistoricalPnL > 0 {
				pattern.ConfidenceBoost *= 1.05
			}
		}
	}

	return pattern
}

// GetRecentPerformance returns recent trading performance
func (v *MemoryVault) GetRecentPerformance() *PerformanceRecord {
	v.mu.RLock()
	defer v.mu.RUnlock()

	records := v.learningRecords
	if len(records) > 100 {
		records = records[len(records)-100:]
	}

	var wins, total float64
	var totalPnL float64
	for _, rec := range records {
		total++
		if rec.PnL > 0 {
			wins++
		}
		totalPnL += rec.PnL
	}

	winRate := 0.0
	avgPnL := 0.0
	if total > 0 {
		winRate = wins / total
		avgPnL = totalPnL / total
	}

	return &PerformanceRecord{
		WinRate:     winRate,
		AvgPnL:      avgPnL,
		TotalTrades: v.totalCount,
		Sharpe:      v.calculateSharpe(records),
	}
}

// calculateSharpe computes Sharpe ratio from records
func (v *MemoryVault) calculateSharpe(records []LearningRecord) float64 {
	if len(records) < 2 {
		return 0
	}

	var sum, sqSum float64
	for _, rec := range records {
		sum += rec.PnL
		sqSum += rec.PnL * rec.PnL
	}

	n := float64(len(records))
	mean := sum / n
	variance := (sqSum / n) - (mean * mean)
	stdDev := variance
	if stdDev > 0 {
		stdDev = sqrt(stdDev)
	}

	if stdDev == 0 {
		return 0
	}

	// Annualized Sharpe (assuming 1-hour periods)
	return (mean / stdDev) * sqrt(8760)
}

// sqrt helper
func sqrt(x float64) float64 {
	if x < 0 {
		return 0
	}
	z := x / 2
	for i := 0; i < 10; i++ {
		z = (z + x/z) / 2
	}
	return z
}

// RecallRiskPattern recalls similar risk states for learning
func (v *MemoryVault) RecallRiskPattern(ctx context.Context, health float64, timeframe time.Duration) ([]PercolatorState, error) {
	v.mu.RLock()
	defer v.mu.RUnlock()

	var results []PercolatorState
	cutoff := time.Now().Add(-timeframe)

	for i := len(v.percolatorStates) - 1; i >= 0; i-- {
		state := v.percolatorStates[i]
		if state.Timestamp.After(cutoff) {
			if state.MarketHealth >= health-0.1 && state.MarketHealth <= health+0.1 {
				results = append(results, state)
				if len(results) >= v.recallLimit {
					break
				}
			}
		}
	}

	return results, nil
}

// LearnFromOutcome updates risk parameters based on outcomes
func (v *MemoryVault) LearnFromOutcome(ctx context.Context, outcome *TradeOutcome) error {
	v.mu.Lock()
	defer v.mu.Unlock()

	record := LearningRecord{
		Timestamp:     time.Now(),
		EntryHealth:    outcome.EntryHealth,
		ExitReason:     outcome.ExitReason,
		PnL:            outcome.PnL,
		DurationSlots:  outcome.DurationSlots,
		RiskTaken:      outcome.RiskTaken,
		SignalType:    outcome.SignalType,
	}

	v.learningRecords = append(v.learningRecords, record)
	if len(v.learningRecords) > v.maxRecords {
		v.learningRecords = v.learningRecords[1:]
	}

	// Update performance metrics
	v.totalCount++
	v.totalPnL += outcome.PnL
	if outcome.PnL > 0 {
		v.winCount++
	}

	// Analyze patterns and update risk parameters
	patterns := v.analyzePatterns()
	v.updateRiskParams(patterns)

	return nil
}

// TradeOutcome contains outcome data for learning
type TradeOutcome struct {
	EntryHealth   float64
	ExitReason    string
	PnL           float64
	DurationSlots uint64
	RiskTaken     float64
	SignalType    string
}

// analyzePatterns finds patterns in learning records
func (v *MemoryVault) analyzePatterns() map[string]float64 {
	v.mu.RLock()
	defer v.mu.RUnlock()

	patterns := make(map[string]float64)
	
	// Group by risk taken ranges
	var lowRiskPnL, medRiskPnL, highRiskPnL float64
	var lowRiskCount, medRiskCount, highRiskCount int

	for _, rec := range v.learningRecords {
		if rec.RiskTaken < 0.1 {
			lowRiskPnL += rec.PnL
			lowRiskCount++
		} else if rec.RiskTaken < 0.25 {
			medRiskPnL += rec.PnL
			medRiskCount++
		} else {
			highRiskPnL += rec.PnL
			highRiskCount++
		}
	}

	if lowRiskCount > 0 {
		patterns["low_risk"] = lowRiskPnL / float64(lowRiskCount)
	}
	if medRiskCount > 0 {
		patterns["med_risk"] = medRiskPnL / float64(medRiskCount)
	}
	if highRiskCount > 0 {
		patterns["high_risk"] = highRiskPnL / float64(highRiskCount)
	}

	return patterns
}

// updateRiskParams adjusts risk parameters based on learned patterns
func (v *MemoryVault) updateRiskParams(patterns map[string]float64) {
	// This would update the risk engine parameters
	// based on learned patterns
	// For now, just a placeholder
	_ = patterns
}

// RecordPercolatorState records the current risk engine state
func (v *MemoryVault) RecordPercolatorState(ctx context.Context, engine *RiskEngine) error {
	v.mu.Lock()
	defer v.mu.Unlock()

	record := PercolatorState{
		Timestamp:      time.Now(),
		Slot:           engine.CurrentSlot,
		MarketHealth:   engine.CurrentMarketHealth(),
		InsuranceFund:  engine.InsuranceFund.Lo(),
		MarkEWMA:       engine.MarkEWMA.Value,
		IndexPrice:     engine.IndexPrice,
		ActiveAccounts: len(engine.GetAllPositions()),
	}

	v.percolatorStates = append(v.percolatorStates, record)
	if len(v.percolatorStates) > v.maxRecords {
		v.percolatorStates = v.percolatorStates[1:]
	}

	return nil
}

// GetStats returns vault statistics
func (v *MemoryVault) GetStats() VaultStats {
	v.mu.RLock()
	defer v.mu.RUnlock()

	return VaultStats{
		TotalStates:   len(v.percolatorStates),
		TotalRecords:  len(v.learningRecords),
		TotalTrades:   len(v.trades),
		WinRate:       v.getWinRate(),
		TotalPnL:      v.totalPnL,
	}
}

// VaultStats contains vault statistics
type VaultStats struct {
	TotalStates   int
	TotalRecords  int
	TotalTrades   int
	WinRate       float64
	TotalPnL       float64
}

func (v *MemoryVault) getWinRate() float64 {
	if v.totalCount == 0 {
		return 0
	}
	return float64(v.winCount) / float64(v.totalCount)
}

// min helper
func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
