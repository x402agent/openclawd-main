// Package percolator provides Percolator-inspired risk engine for autonomous trading.
// This is the main entry point demonstrating the complete integration.
//
// Features:
//   - U128 arithmetic for precise financial calculations
//   - Risk engine with margin tracking and liquidation circuits
//   - EWMA mark price tracking with fee weighting
//   - OODA loop integration for autonomous trading
//   - ClawVault memory for pattern learning
//
// Usage:
//
//	engine := percolator.NewRiskEngine(nil)
//	vault := percolator.NewMemoryVault()
//	cli := percolator.NewCLI(engine, vault)
//
//	// Run status
//	cli.StatusCommand(context.Background())
package percolator

import (
	"context"
	"fmt"
	"time"
)

// Example demonstrates the complete Percolator risk engine integration
func Example() {
	// Create risk engine with defaults
	engine := NewRiskEngine(DefaultRiskParams())
	
	// Create memory vault
	vault := NewMemoryVault()
	
	// Create CLI
	cli := NewCLI(engine, vault)
	
	// Simulate some positions
	ctx := context.Background()
	
	// Position 1: Long SOL
	pos1 := NewPosition("pos-001", 1000000, 150000000, 1000000000) // 1M units, $150 entry, 1000 USDC capital
	engine.Accounts[0] = &Account{
		Position: pos1,
	}
	
	// Simulate some trades
	engine.MarkEWMA.Value = 151000000 // Mark at $151
	engine.IndexPrice = 150500000      // Index at $150.50
	engine.LastOraclePx = 151000000
	
	// Update position metrics
	pos1.CalculateMarginHealth()
	pos1.LiquidationDistance(engine.MarkEWMA.Value)
	
	// Run assessment
	assess := engine.AssessRisk(engine.MarkEWMA.Value)
	fmt.Printf("Risk Verdict: %s\n", assess.Verdict)
	fmt.Printf("Market Health: %.2f%%\n", assess.MarketHealth*100)
	
	// Calculate risk-adjusted size
	size, risk := engine.CalculateRiskAdjustedSize(0.7, 0.8, 1000000000, 151000000)
	fmt.Printf("Risk-Adjusted Size: %d, Risk: %.2f\n", size, risk)
	
	// Record to vault
	vault.Record(ctx, "percolator_state", PercolatorState{
		Timestamp:    time.Now(),
		Slot:         1000000,
		MarketHealth: assess.MarketHealth,
	})
	
	// Show vault stats
	stats := vault.GetStats()
	fmt.Printf("Vault Records: %d\n", stats.TotalRecords)
	
	// Run CLI commands
	fmt.Println("\n--- Status ---")
	cli.StatusCommand(ctx)
	
	fmt.Println("\n--- Mark ---")
	cli.MarkCommand(ctx, "SOL")
	
	fmt.Println("\n--- Vault ---")
	cli.VaultCommand(ctx)
}

// DemoRiskAssessment demonstrates the risk assessment flow
func DemoRiskAssessment() {
	engine := NewRiskEngine(nil)
	
	// Create test position
	pos := NewPosition("test-001", 500000, 100000000, 500000000)
	engine.Accounts[0] = &Account{Position: pos}
	
	// Set prices
	engine.MarkEWMA.Value = 101000000
	engine.IndexPrice = 100500000
	engine.LastOraclePx = 101000000
	
	// Update position
	pos.CalculateMarginHealth()
	pos.LiquidationDistance(engine.MarkEWMA.Value)
	
	// Run assessment
	assess := engine.AssessRisk(engine.MarkEWMA.Value)
	
	fmt.Println("=== Risk Assessment Demo ===")
	fmt.Printf("Market Health: %.2f%%\n", assess.MarketHealth*100)
	fmt.Printf("Position Health: %.2f%%\n", assess.PositionRisks[0].MarginHealth*100)
	fmt.Printf("Liq Distance: %.2f%%\n", assess.PositionRisks[0].LiqDistance*100)
	fmt.Printf("Verdict: %s\n", assess.Verdict)
	
	// Determine funding
	fundingRate := engine.MarkEWMA.FundingRate(engine.IndexPrice, DEFAULT_FUNDING_HORIZON_SLOTS)
	fmt.Printf("Funding Rate: %d bps/slot\n", fundingRate)
}

// DemoSLTPCalculation demonstrates stop-loss/take-profit calculation
func DemoSLTPCalculation() {
	engine := NewRiskEngine(nil)
	agent := &OODAAgent{RiskEngine: engine}
	
	// Test data
	entryPrice := uint64(100000000) // $100
	atr := uint64(2000000)          // $2 ATR
	
	// Calculate SL/TP for long
	sl, tp := agent.CalculateSLTP(entryPrice, atr, SideLong)
	fmt.Println("=== SL/TP Demo (Long) ===")
	fmt.Printf("Entry: $%.2f\n", float64(entryPrice)/1e6)
	fmt.Printf("ATR: $%.2f\n", float64(atr)/1e6)
	fmt.Printf("Stop Loss: $%.2f (Distance: $%.2f)\n", float64(sl)/1e6, float64(entryPrice-sl)/1e6)
	fmt.Printf("Take Profit: $%.2f (Distance: $%.2f)\n", float64(tp)/1e6, float64(tp-entryPrice)/1e6)
	
	// Calculate SL/TP for short
	sl, tp = agent.CalculateSLTP(entryPrice, atr, SideShort)
	fmt.Println("\n=== SL/TP Demo (Short) ===")
	fmt.Printf("Entry: $%.2f\n", float64(entryPrice)/1e6)
	fmt.Printf("Stop Loss: $%.2f (Distance: $%.2f)\n", float64(sl)/1e6, float64(sl-entryPrice)/1e6)
	fmt.Printf("Take Profit: $%.2f (Distance: $%.2f)\n", float64(tp)/1e6, float64(entryPrice-tp)/1e6)
}
