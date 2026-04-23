// Package percolator provides CLI commands for Percolator risk engine monitoring.
package percolator

import (
	"context"
	"fmt"
	"os"
	"text/tabwriter"

	"github.com/charmbracelet/lipgloss"
)

// CLI provides command-line interface for the Percolator risk engine
type CLI struct {
	engine *RiskEngine
	vault  *MemoryVault
}

// NewCLI creates a new CLI instance
func NewCLI(engine *RiskEngine, vault *MemoryVault) *CLI {
	return &CLI{
		engine: engine,
		vault:  vault,
	}
}

// Color styles for terminal output
var (
	titleStyle = lipgloss.NewStyle().
			Bold(true).
			Foreground(lipgloss.Color("86")).
			Background(lipgloss.Color("235"))

	greenStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("82"))

	yellowStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("226"))

	redStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("196"))

	cyanStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("51"))

	dimStyle = lipgloss.NewStyle().
			Foreground(lipgloss.Color("245"))
)

// StatusCommand displays the current risk status
func (c *CLI) StatusCommand(ctx context.Context) error {
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	defer w.Flush()

	// Title
	fmt.Fprintln(w, titleStyle.Render("🦂 Percolator Risk Engine Status"))
	fmt.Fprintln(w, "")
	
	// Market Health
	health := c.engine.CurrentMarketHealth()
	healthColor := greenStyle
	if health < 0.5 {
		healthColor = yellowStyle
	}
	if health < 0.2 {
		healthColor = redStyle
	}
	fmt.Fprintf(w, "Market Health:\t%s %.2f%%\n", healthColor.Render("●"), health*100)
	
	// Risk Verdict
	assess := c.engine.AssessRisk(c.engine.LastOraclePx)
	verdictColor := greenStyle
	switch assess.Verdict {
	case RiskVerdictCaution:
		verdictColor = yellowStyle
	case RiskVerdictHigh, RiskVerdictCritical:
		verdictColor = redStyle
	}
	fmt.Fprintf(w, "Risk Verdict:\t%s %s\n", verdictColor.Render("●"), assess.Verdict)
	
	// Positions
	positions := c.engine.GetAllPositions()
	fmt.Fprintf(w, "Active Positions:\t%d\n", len(positions))
	
	// Insurance Fund
	insurance := float64(c.engine.InsuranceFund.Lo()) / 1e6
	fmt.Fprintf(w, "Insurance Fund:\t%.2f USDC\n", insurance)
	fmt.Fprintf(w, "Insurance Coverage:\t%.2fx\n", assess.InsuranceCoverage)
	
	// Mark Price
	fmt.Fprintf(w, "Mark Price (EWMA):\t%.6f\n", float64(c.engine.MarkEWMA.Value)/1e6)
	fmt.Fprintf(w, "Index Price:\t%.6f\n", float64(c.engine.IndexPrice)/1e6)
	
	// Funding Rate
	fundingRate := c.engine.MarkEWMA.FundingRate(c.engine.IndexPrice, DEFAULT_FUNDING_HORIZON_SLOTS)
	fundingColor := greenStyle
	if fundingRate > 0 {
		fundingColor = redStyle // Longs pay shorts
	}
	fmt.Fprintf(w, "Funding Rate:\t%s %d bps/slot\n", fundingColor.Render("●"), fundingRate)
	
	fmt.Fprintln(w, "")

	// Position details
	if len(positions) > 0 {
		fmt.Fprintln(w, dimStyle.Render("Position Details:"))
		for i, pos := range positions {
			marginColor := greenStyle
			if pos.MarginHealth < 0.3 {
				marginColor = redStyle
			}
			liqColor := greenStyle
			if pos.LiqDistance < 0.2 {
				liqColor = redStyle
			}
			fmt.Fprintf(w, " [%d] %s | Size: %d | Health: %s%.2f%% | Liq Dist: %s%.2f%%\n",
				i+1, pos.ID, pos.SizeQ,
				marginColor.Render(""), pos.MarginHealth*100,
				liqColor.Render(""), pos.LiqDistance*100)
		}
	}

	return nil
}

// InspectCommand shows detailed position information
func (c *CLI) InspectCommand(ctx context.Context, positionID string) error {
	pos := c.engine.GetPosition(positionID)
	if pos == nil {
		return fmt.Errorf("position not found: %s", positionID)
	}

	w := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	defer w.Flush()

	fmt.Fprintln(w, titleStyle.Render(fmt.Sprintf("📊 Position: %s", positionID)))
	fmt.Fprintln(w, "")
	
	fmt.Fprintf(w, "Size:\t\t%d units\n", pos.SizeQ)
	fmt.Fprintf(w, "Entry Price:\t%.6f\n", float64(pos.EntryPx)/1e6)
	fmt.Fprintf(w, "Equity:\t\t%.2f USDC\n", pos.Equity())
	fmt.Fprintf(w, "Reserved Margin:\t%d lamports\n", pos.ReservedMargin())
	
	marginColor := greenStyle
	if pos.MarginHealth < 0.3 {
		marginColor = redStyle
	}
	fmt.Fprintf(w, "Margin Health:\t%s %.2f%%\n", marginColor.Render("●"), pos.MarginHealth*100)
	
	liqColor := greenStyle
	if pos.LiqDistance < 0.2 {
		liqColor = redStyle
	}
	fmt.Fprintf(w, "Liq. Distance:\t%s %.2f%%\n", liqColor.Render("●"), pos.LiqDistance*100)
	
	fmt.Fprintf(w, "PnL:\t\t%.2f USDC\n", float64(pos.PnL)/1e6)
	fmt.Fprintf(w, "Opened:\t\t%s\n", pos.OpenedTime.Format("2006-01-02 15:04:05"))
	fmt.Fprintf(w, "Funding Paid:\t%d\n", pos.FundingPaid)

	return nil
}

// MarkCommand displays EWMA mark tracking
func (c *CLI) MarkCommand(ctx context.Context, token string) error {
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	defer w.Flush()

	fmt.Fprintln(w, titleStyle.Render("📈 Mark Price Tracking"))
	fmt.Fprintln(w, "")

	ewma := c.engine.MarkEWMA
	fmt.Fprintf(w, "Current Mark (EWMA):\t%.6f\n", float64(ewma.Value)/1e6)
	fmt.Fprintf(w, "Index Price:\t\t%.6f\n", float64(c.engine.IndexPrice)/1e6)
	
	if ewma.Value > 0 && c.engine.IndexPrice > 0 {
		premium := (float64(ewma.Value) - float64(c.engine.IndexPrice)) / float64(c.engine.IndexPrice) * 100
		premiumColor := dimStyle
		if premium > 0 {
			premiumColor = redStyle
		} else if premium < 0 {
			premiumColor = greenStyle
		}
		fmt.Fprintf(w, "Premium:\t\t%s %.4f%%\n", premiumColor.Render(""), premium)
	}
	
	fmt.Fprintf(w, "Last Update Slot:\t%d\n", ewma.LastSlot)
	fmt.Fprintf(w, "Halflife Slots:\t\t%d\n", ewma.HalflifeSlots)
	fmt.Fprintf(w, "Circuit Cap:\t\t%d e2bps\n", ewma.CapE2BPS)
	
	// Funding calculation
	fundingRate := ewma.FundingRate(c.engine.IndexPrice, DEFAULT_FUNDING_HORIZON_SLOTS)
	fundingColor := greenStyle
	if fundingRate > 0 {
		fundingColor = redStyle
	}
	fmt.Fprintf(w, "\nFunding Rate:\t\t%s %d bps/slot\n", fundingColor.Render("●"), fundingRate)
	fmt.Fprintf(w, "Annualized:\t\t%s %.2f%%\n", fundingColor.Render(""), float64(fundingRate)*3600*24*365/10000)

	return nil
}

// InsuranceCommand shows insurance fund status
func (c *CLI) InsuranceCommand(ctx context.Context) error {
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	defer w.Flush()

	fmt.Fprintln(w, titleStyle.Render("🛡️ Insurance Fund"))
	fmt.Fprintln(w, "")

	balance := float64(c.engine.InsuranceFund.Lo()) / 1e6
	fmt.Fprintf(w, "Balance:\t\t%.2f USDC\n", balance)
	
	// Calculate total exposure
	var totalNotional float64
	for _, pos := range c.engine.GetAllPositions() {
		if pos.SizeQ != 0 {
			notional := float64(pos.SizeQ) * float64(c.engine.LastOraclePx) / 1e6
			totalNotional += notional
		}
	}
	
	fmt.Fprintf(w, "Total Exposure:\t\t%.2f USDC\n", totalNotional)
	
	if totalNotional > 0 {
		coverage := balance / totalNotional
		coverageColor := greenStyle
		if coverage < 5.0 {
			coverageColor = yellowStyle
		}
		if coverage < 2.0 {
			coverageColor = redStyle
		}
		fmt.Fprintf(w, "Coverage Ratio:\t\t%s %.2fx\n", coverageColor.Render("●"), coverage)
		
		minCoverage := DEFAULT_INSURANCE_MIN_COVERAGE
		if coverage < minCoverage {
			fmt.Fprintf(w, "\n%s WARNING: Coverage below minimum (%.1fx)\n", 
				redStyle.Render("⚠"), minCoverage)
		}
	}

	return nil
}

// SizeCommand calculates risk-adjusted position size
func (c *CLI) SizeCommand(ctx context.Context, signalStrength, confidence, capital float64) error {
	w := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	defer w.Flush()

	fmt.Fprintln(w, titleStyle.Render("📐 Risk-Adjusted Position Sizing"))
	fmt.Fprintln(w, "")
	
	fmt.Fprintf(w, "Input Signal Strength:\t%.2f\n", signalStrength)
	fmt.Fprintf(w, "Confidence:\t\t%.2f\n", confidence)
	fmt.Fprintf(w, "Available Capital:\t%.2f USDC\n", capital/1e6)
	
	// Get current market health
	health := c.engine.CurrentMarketHealth()
	healthFactor := health
	if healthFactor == 0 {
		healthFactor = 1.0
	}
	
	fmt.Fprintf(w, "Market Health Factor:\t%.2f\n", healthFactor)
	
	// Calculate adjusted size
	adjustedStrength := signalStrength * confidence * healthFactor
	adjustedCapital := capital * 0.10 * adjustedStrength
	size := int64(adjustedCapital)
	
	fmt.Fprintln(w, "")
	fmt.Fprintf(w, "Adjusted Strength:\t%.4f\n", adjustedStrength)
	fmt.Fprintf(w, "Position Size:\t\t%d lamports\n", size)
	fmt.Fprintf(w, "Capital Used:\t\t%.2f USDC (10%% max)\n", adjustedCapital/1e6)
	
	// Risk assessment
	risk := 1.0 - healthFactor
	riskColor := greenStyle
	if risk > 0.3 {
		riskColor = yellowStyle
	}
	if risk > 0.5 {
		riskColor = redStyle
	}
	fmt.Fprintf(w, "Risk Metric:\t\t%s %.2f%%\n", riskColor.Render(""), risk*100)
	
	// Clamping info
	maxSize := capital * 0.25
	fmt.Fprintf(w, "\nClamping:\n")
	fmt.Fprintf(w, "  Max (25%%):\t%d lamports\n", int64(maxSize))
	fmt.Fprintf(w, "  Min (1%%):\t%d lamports\n", int64(capital*0.01))
	
	return nil
}

// VaultCommand shows ClawVault statistics
func (c *CLI) VaultCommand(ctx context.Context) error {
	if c.vault == nil {
		return fmt.Errorf("vault not initialized")
	}

	stats := c.vault.GetStats()
	perf := c.vault.GetRecentPerformance()

	w := tabwriter.NewWriter(os.Stdout, 0, 8, 2, ' ', 0)
	defer w.Flush()

	fmt.Fprintln(w, titleStyle.Render("🧠 ClawVault Memory"))
	fmt.Fprintln(w, "")
	
	fmt.Fprintf(w, "Total Records:\t\t%d\n", stats.TotalRecords)
	fmt.Fprintf(w, "Total Trades:\t\t%d\n", stats.TotalTrades)
	fmt.Fprintf(w, "Risk States:\t\t%d\n", stats.TotalStates)
	
	fmt.Fprintln(w, "")
	fmt.Fprintln(w, dimStyle.Render("Performance:"))
	
	winColor := greenStyle
	if perf.WinRate < 0.5 {
		winColor = yellowStyle
	}
	if perf.WinRate < 0.4 {
		winColor = redStyle
	}
	fmt.Fprintf(w, "Win Rate:\t\t%s %.1f%%\n", winColor.Render("●"), perf.WinRate*100)
	fmt.Fprintf(w, "Average PnL:\t\t%.4f USDC\n", perf.AvgPnL)
	fmt.Fprintf(w, "Sharpe Ratio:\t\t%.2f\n", perf.Sharpe)
	fmt.Fprintf(w, "Total PnL:\t\t%.2f USDC\n", stats.TotalPnL)

	return nil
}

// RunAll runs all monitoring commands
func (c *CLI) RunAll(ctx context.Context) error {
	if err := c.StatusCommand(ctx); err != nil {
		return err
	}
	fmt.Println()
	if err := c.InsuranceCommand(ctx); err != nil {
		return err
	}
	fmt.Println()
	return c.VaultCommand(ctx)
}
