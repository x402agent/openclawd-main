#!/usr/bin/env bash
# =============================================================================
# Percolator 5 SOL Challenge - Analysis & Exploit Research Tool
# =============================================================================
# Analyzes an immutable Percolator market for exploitable vulnerabilities
#
# Usage:
#   ./challenge-analyze.sh <SLAB_PUBKEY> [--verbose] [--output FILE]
#   ./challenge-analyze.sh --auto   # Use deployed market from .env or config
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Configuration
PROGRAM_ID="2SSnp35m7FQ7cRLNKGdW5UzjYFF6RBUNq7d3m5mqNByp"
RPC_URL="${SOLANA_RPC_URL:-https://api.devnet.solana.com}"
VERBOSE=0
OUTPUT_FILE=""

# Parse arguments
SLAB_PUBKEY=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --auto)
            # Load from environment or config
            if [ -f ".env" ]; then
                source .env
            fi
            if [ -f "immutable-market-info.txt" ]; then
                source immutable-market-info.txt
            fi
            if [ -z "$MARKET_PUBKEY" ]; then
                echo -e "${RED}❌ No market deployed. Run deploy-immutable.sh first.${NC}"
                exit 1
            fi
            SLAB_PUBKEY="$MARKET_PUBKEY"
            shift
            ;;
        --verbose|-v)
            VERBOSE=1
            shift
            ;;
        --output|-o)
            OUTPUT_FILE="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 <SLAB_PUBKEY> [--verbose] [--output FILE]"
            echo "   or: $0 --auto [--verbose]"
            echo ""
            echo "Options:"
            echo "  --auto     Use deployed market from .env or config"
            echo "  --verbose  Show detailed output"
            echo "  --output   Save results to file"
            echo ""
            echo "Examples:"
            echo "  $0 --auto"
            echo "  $0 7RcEUzq9GLK3iCSDqW8M4c8jKjNQXx3wQg7kqZ5mMz8 --verbose"
            exit 0
            ;;
        *)
            if [ -z "$SLAB_PUBKEY" ]; then
                SLAB_PUBKEY="$1"
            fi
            shift
            ;;
    esac
done

# Validate
if [ -z "$SLAB_PUBKEY" ]; then
    echo -e "${RED}❌ Missing SLAB_PUBKEY${NC}"
    echo "Usage: $0 <SLAB_PUBKEY> [--verbose]"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🦂 Percolator 5 SOL Challenge - Security Analysis${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Target Market:${NC} $SLAB_PUBKEY"
echo -e "${YELLOW}RPC URL:${NC} $RPC_URL"
echo ""

# Check if CLI is available
CLI_CMD=""
if [ -f "./dist/index.js" ]; then
    CLI_CMD="node ./dist/index.js"
elif command -v npx &> /dev/null; then
    CLI_CMD="npx tsx src/cli.ts"
fi

if [ -z "$CLI_CMD" ]; then
    echo -e "${RED}❌ CLI not available. Run from percolator-cli-master directory.${NC}"
    exit 1
fi

# Output function
output() {
    echo -e "$1"
    if [ -n "$OUTPUT_FILE" ]; then
        echo -e "$1" | sed 's/\x1b\[[0-9;]*m//g' >> "$OUTPUT_FILE"
    fi
}

# Run command and capture output
run_cmd() {
    local cmd="$1"
    local capture="${2:-yes}"
    
    if [ "$capture" = "yes" ]; then
        if [ "$VERBOSE" = "1" ]; then
            echo -e "${CYAN}$ $cmd${NC}"
        fi
        eval "$cmd" 2>&1
    else
        echo -e "${CYAN}$ $cmd${NC}"
        eval "$cmd" 2>&1 || true
    fi
}

# =============================================================================
# PHASE 1: RECONNAISSANCE
# =============================================================================
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${MAGENTA}PHASE 1: RECONNAISSANCE${NC}"
echo -e "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# 1.1: Fetch market config
output "${YELLOW}[1.1] Fetching Market Configuration...${NC}"
echo ""

CONFIG=$($CLI_CMD slab-config --slab "$SLAB_PUBKEY" --url "$RPC_URL" 2>/dev/null || echo "")
if [ -z "$CONFIG" ]; then
    output "${RED}❌ Failed to fetch config. Market may not exist.${NC}"
    exit 1
fi

echo "$CONFIG"
echo ""

# Extract key info
ADMIN=$(echo "$CONFIG" | grep -i "admin" | awk '{print $NF}' || echo "")
ORACLE_AUTH=$(echo "$CONFIG" | grep -i "oracle" | awk '{print $NF}' || echo "")
echo ""

if [ "$ADMIN" = "11111111111111111111111111111111" ]; then
    output "${GREEN}✓ Admin is BURNED (correct)${NC}"
else
    output "${RED}⚠ Admin is NOT burned: $ADMIN${NC}"
fi

if [ "$ORACLE_AUTH" = "11111111111111111111111111111111" ]; then
    output "${GREEN}✓ Oracle authority is BURNED (correct)${NC}"
else
    output "${RED}⚠ Oracle authority is NOT burned: $ORACLE_AUTH${NC}"
fi

# 1.2: Fetch engine state
output ""
output "${YELLOW}[1.2] Fetching Engine State...${NC}"
echo ""

ENGINE=$($CLI_CMD slab-engine --slab "$SLAB_PUBKEY" --url "$RPC_URL" 2>/dev/null || echo "")
echo "$ENGINE"
echo ""

# Extract insurance info
INSURANCE=$(echo "$ENGINE" | grep -i "insurance" || echo "")
echo ""

# 1.3: Fetch parameters
output "${YELLOW}[1.3] Fetching Risk Parameters...${NC}"
echo ""

PARAMS=$($CLI_CMD slab-params --slab "$SLAB_PUBKEY" --url "$RPC_URL" 2>/dev/null || echo "")
echo "$PARAMS"
echo ""

# Extract key params
MARGIN=$(echo "$PARAMS" | grep -i "maintenance" | head -1 || echo "")
LIQ_FEE=$(echo "$PARAMS" | grep -i "liquidation.fee" || echo "")
THRESHOLD=$(echo "$PARAMS" | grep -i "threshold" | head -1 || echo "")
echo ""

# =============================================================================
# PHASE 2: ACCOUNT ANALYSIS
# =============================================================================
output "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
output "${MAGENTA}PHASE 2: ACCOUNT ANALYSIS${NC}"
output "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# 2.1: List all accounts
output "${YELLOW}[2.1] Enumerating Market Accounts...${NC}"
echo ""

ACCOUNTS=$($CLI_CMD slab-accounts --slab "$SLAB_PUBKEY" --url "$RPC_URL" 2>/dev/null || echo "")
echo "$ACCOUNTS"
echo ""

# Count accounts
ACCOUNT_COUNT=$(echo "$ACCOUNTS" | grep -c "Index:" || echo "0")
LP_COUNT=$(echo "$ACCOUNTS" | grep -c "LP" || echo "0")
USER_COUNT=$(echo "$ACCOUNTS" | grep -c "USER" || echo "0")

output "${CYAN}Account Summary:${NC}"
output "  Total Accounts: $ACCOUNT_COUNT"
output "  LP Accounts: $LP_COUNT"
output "  User Accounts: $USER_COUNT"
echo ""

# 2.2: Find exploitable positions
output "${YELLOW}[2.2] Analyzing Positions for Exploitation...${NC}"
echo ""

# Parse positions for potential targets
POSITIONS=$(echo "$ACCOUNTS" | grep -A10 "Index:" || echo "")
echo "$POSITIONS" | head -50
echo ""

# =============================================================================
# PHASE 3: VULNERABILITY SCANNING
# =============================================================================
output "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
output "${MAGENTA}PHASE 3: VULNERABILITY SCANNING${NC}"
output "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# 3.1: Oracle Analysis
output "${YELLOW}[3.1] Oracle Manipulation Assessment${NC}"
output "${CYAN}Checking for exploitable oracle conditions...${NC}"
echo ""

# Check oracle staleness
STALENESS=$(echo "$ENGINE" | grep -i "last" | head -3 || echo "")
output "Last Oracle Updates:"
echo "$STALENESS"
echo ""

# Check confidence filter
CONF_FILTER=$(echo "$PARAMS" | grep -i "conf" | head -1 || echo "")
output "Confidence Filter: $CONF_FILTER"
echo ""

# Check max staleness
MAX_STALE=$(echo "$PARAMS" | grep -i "staleness" | head -1 || echo "")
output "Max Staleness: $MAX_STALE"
echo ""

ORACLE_EXPLOIT="LOW"
if echo "$MAX_STALE" | grep -qE "600|3600"; then
    output "${YELLOW}⚠ High staleness threshold - oracle manipulation possible${NC}"
    ORACLE_EXPLOIT="MEDIUM"
fi

# 3.2: Liquidation Circuit Analysis
output "${YELLOW}[3.2] Liquidation Circuit Analysis${NC}"
output "${CYAN}Checking for liquidation edge cases...${NC}"
echo ""

output "Liquidation Fee Parameters:"
echo "$LIQ_FEE"
echo ""

# Check fee caps
LIQ_CAP=$(echo "$PARAMS" | grep -i "fee.cap" || echo "")
output "Fee Cap: $LIQ_CAP"
echo ""

# Check buffer
LIQ_BUFFER=$(echo "$PARAMS" | grep -i "buffer" || echo "")
output "Liquidation Buffer: $LIQ_BUFFER"
echo ""

# Check min liquidation
MIN_LIQ=$(echo "$PARAMS" | grep -i "min.liq" || echo "")
output "Min Liquidation: $MIN_LIQ"
echo ""

LIQ_EXPLOIT="LOW"
if echo "$LIQ_CAP" | grep -qE "0|100000"; then
    output "${YELLOW}⚠ Extreme fee cap values detected${NC}"
    LIQ_EXPLOIT="MEDIUM"
fi

# 3.3: Funding Rate Analysis
output "${YELLOW}[3.3] Funding Rate Analysis${NC}"
output "${CYAN}Checking EWMA and funding parameters...${NC}"
echo ""

FUNDING=$(echo "$ENGINE" | grep -i "funding" | head -5 || echo "")
output "Funding State:"
echo "$FUNDING"
echo ""

FUNDING_PARAMS=$(echo "$PARAMS" | grep -i "funding" | head -5 || echo "")
output "Funding Parameters:"
echo "$FUNDING_PARAMS"
echo ""

# Check for mark-index divergence
MARK=$(echo "$ENGINE" | grep -i "mark" | head -3 || echo "")
INDEX=$(echo "$ENGINE" | grep -i "index" | head -3 || echo "")
output "Mark Price: $MARK"
output "Index Price: $INDEX"
echo ""

# 3.4: Math Edge Cases
output "${YELLOW}[3.4] Math Edge Case Analysis${NC}"
output "${CYAN}Looking for U128 boundary conditions...${NC}"
echo ""

# Check position sizes for large values
LARGE_POS=$(echo "$ACCOUNTS" | grep -E "Size: [0-9]{10,}" || echo "")
if [ -n "$LARGE_POS" ]; then
    output "${YELLOW}⚠ Large position sizes detected - potential overflow targets${NC}"
    echo "$LARGE_POS"
else
    output "${GREEN}✓ No excessively large position sizes found${NC}"
fi
echo ""

# 3.5: Slot Management
output "${YELLOW}[3.5] Slot Management Analysis${NC}"
output "${CYAN}Checking freelist and bitmap consistency...${NC}"
echo ""

# Look for freed slots
FREED=$(echo "$ENGINE" | grep -i "free" | head -5 || echo "")
output "Freelist State: $FREED"
echo ""

# 3.6: CPI/Matcher Analysis
output "${YELLOW}[3.6] CPI & Matcher Analysis${NC}"
output "${CYAN}Finding matcher programs for exploitation...${NC}"
echo ""

MATCHERS=$(echo "$ACCOUNTS" | grep -i "matcher" | head -10 || echo "")
if [ -n "$MATCHERS" ]; then
    output "${YELLOW}⚠ External matcher programs found${NC}"
    echo "$MATCHERS"
else
    output "${GREEN}✓ No custom matchers (requires CPI exploitation)${NC}"
fi
echo ""

# =============================================================================
# PHASE 4: EXPLOIT PATHWAY ANALYSIS
# =============================================================================
output "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
output "${MAGENTA}PHASE 4: EXPLOIT PATHWAY ANALYSIS${NC}"
output "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

output "${CYAN}Calculating optimal attack vectors...${NC}"
echo ""

# Pathway 1: Oracle Manipulation
output "${YELLOW}[PATHWAY 1] Oracle Manipulation${NC}"
output "  Difficulty: $ORACLE_EXPLOIT"
output "  Attack: Manipulate Pyth price to trigger liquidations"
output "  Reward: Insurance fund via cascading liquidations"
output "  Command:"
output "    # Check oracle feeds"
output "    # Monitor price confidence intervals"
output "    # Execute when confidence is low"
echo ""

# Pathway 2: Liquidation Exploit
output "${YELLOW}[PATHWAY 2] Liquidation Circuit Exploit${NC}"
output "  Difficulty: $LIQ_EXPLOIT"
output "  Attack: Find undercollateralized positions"
output "  Reward: Liquidate and claim insurance fees"
output "  Command:"
output "    $CLI_CMD liquidate-at-oracle --slab $SLAB_PUBKEY --target-idx <IDX> --oracle <ORACLE>"
echo ""

# Pathway 3: Math Exploit
output "${YELLOW}[PATHWAY 3] U128 Math Overflow${NC}"
output "  Difficulty: HIGH"
output "  Attack: Find positions with boundary values"
output "  Reward: Arbitrary value extraction"
output "  Requires: Source code audit + boundary testing"
echo ""

# Pathway 4: Funding Rate
output "${YELLOW}[PATHWAY 4] Funding Rate Exploit${NC}"
output "  Difficulty: MEDIUM"
output "  Attack: Exploit mark-index divergence for arbitrage"
output "  Reward: Passive income + position profits"
output "  Command:"
output "    # Monitor funding rates"
output "    # Trade in direction of funding"
output "    # Let funding accrue"
echo ""

# Pathway 5: Slot Collision
output "${YELLOW}[PATHWAY 5] Slot Collision/Management${NC}"
output "  Difficulty: MEDIUM-HIGH"
output "  Attack: Exploit freelist vs bitmap mismatch"
output "  Reward: State corruption + fund extraction"
output "  Requires: Deep protocol understanding"
echo ""

# =============================================================================
# PHASE 5: RECOMMENDED ACTIONS
# =============================================================================
output "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
output "${MAGENTA}PHASE 5: RECOMMENDED EXPLOITATION STEPS${NC}"
output "${MAGENTA}═══════════════════════════════════════════════════════════════${NC}"
echo ""

output "${GREEN}[IMMEDIATE] Quick Wins:${NC}"
output "  1. Run keeper crank to observe behavior:"
output "     $CLI_CMD keeper-crank --slab $SLAB_PUBKEY --oracle <ORACLE>"
output "  2. Get best prices:"
output "     $CLI_CMD best-price --slab $SLAB_PUBKEY"
output "  3. Monitor for undercollateralized accounts"
output ""
output "${YELLOW}[SHORT TERM] Research:${NC}"
output "  1. Analyze source code for identified vulnerabilities"
output "  2. Test liquidation edge cases on devnet"
output "  3. Monitor mark-index spread patterns"
output ""
output "${RED}[LONG TERM] Complex Exploits:${NC}"
output "  1. U128 overflow analysis"
output "  2. CPI/matcher program vulnerabilities"
output "  3. Cross-program invocation attacks"
output ""

# =============================================================================
# SUMMARY
# =============================================================================
output "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
output "${BLUE}ANALYSIS COMPLETE${NC}"
output "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
output ""
output "${CYAN}Next Steps:${NC}"
output "  1. Review identified attack vectors above"
output "  2. Deploy test positions to probe behavior"
output "  3. Audit source code for specific vulnerabilities"
output "  4. Develop proof-of-concept exploits"
output ""
output "${YELLOW}Market Info Saved To:${NC}"
if [ -n "$OUTPUT_FILE" ]; then
    output "  $OUTPUT_FILE"
else
    output "  ./analysis-[TIMESTAMP].txt"
fi
output ""

# Save raw data
DATA_FILE="challenge-raw-data-$(date +%s).txt"
echo "# Percolator Challenge Analysis - Raw Data" > "$DATA_FILE"
echo "# Generated: $(date)" >> "$DATA_FILE"
echo "# Market: $SLAB_PUBKEY" >> "$DATA_FILE"
echo "" >> "$DATA_FILE"
echo "=== CONFIG ===" >> "$DATA_FILE"
echo "$CONFIG" >> "$DATA_FILE"
echo "" >> "$DATA_FILE"
echo "=== ENGINE ===" >> "$DATA_FILE"
echo "$ENGINE" >> "$DATA_FILE"
echo "" >> "$DATA_FILE"
echo "=== PARAMS ===" >> "$DATA_FILE"
echo "$PARAMS" >> "$DATA_FILE"
echo "" >> "$DATA_FILE"
echo "=== ACCOUNTS ===" >> "$DATA_FILE"
echo "$ACCOUNTS" >> "$DATA_FILE"

output "${GREEN}✓ Raw data saved to $DATA_FILE${NC}"
