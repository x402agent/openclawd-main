#!/usr/bin/env bash
# =============================================================================
# Percolator Immutable Market Deployment Script
# =============================================================================
# Deploys a fully immutable Percolator market with:
# - All admin keys burned
# - Oracle authority burned  
# - 5 SOL in insurance fund
# - Permissionless keeper crank
#
# Usage:
#   chmod +x deploy-immutable.sh
#   ./deploy-immutable.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROGRAM_ID="2SSnp35m7FQ7cRLNKGdW5UzjYFF6RBUNq7d3m5mqNByp"
INSURANCE_SOL=5
INSURANCE_LAMPORTS=$((INSURANCE_SOL * 1000000000))
SOL_MINT="So11111111111111111111111111111111111111112"
Pyth_SOL_FEED="ef0d8b6fda2ceba41da15d4095d1da392a0d2f8ed0c6c7bc0f4cfac8c280b56d"
BURN_ADDRESS="11111111111111111111111111111111"

# RPC URL (can be overridden)
RPC_URL="${SOLANA_RPC_URL:-https://api.devnet.solana.com}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🦂  Percolator Immutable Market Deployment${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ solana CLI not found. Install from https://docs.solana.com/cli/install-solana-cli-tools${NC}"
    exit 1
fi

if ! command -v spl-token &> /dev/null; then
    echo -e "${RED}❌ spl-token not found. Install spl-token CLI${NC}"
    exit 1
fi

if [ -z "$WALLET" ] && [ ! -f "$HOME/.config/solana/id.json" ]; then
    echo -e "${RED}❌ No wallet found. Set WALLET env var or create ~/.config/solana/id.json${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo ""

# Get deployer keypair path
if [ -n "$WALLET" ]; then
    DEPLOYER_KEYPAIR="$WALLET"
elif [ -f "$HOME/.config/solana/id.json" ]; then
    DEPLOYER_KEYPAIR="$HOME/.config/solana/id.json"
fi

echo -e "${YELLOW}Deployer wallet:${NC} $DEPLOYER_KEYPAIR"
DEPLOYER_PUBKEY=$(solana-keygen pubkey "$DEPLOYER_KEYPAIR")
echo -e "${YELLOW}Deployer address:${NC} $DEPLOYER_PUBKEY"
echo ""

# Airdrop if needed (devnet)
echo -e "${YELLOW}Checking SOL balance...${NC}"
BALANCE=$(solana balance --url "$RPC_URL" | awk '{print $1}')
echo "Current balance: $BALANCE SOL"

# Need at least 10 SOL for deployment + insurance
if (( $(echo "$BALANCE < 10" | bc -l) )); then
    echo -e "${YELLOW}Requesting airdrop...${NC}"
    solana airdrop 10 --url "$RPC_URL" || true
fi
echo ""

# =============================================================================
# Step 1: Generate market keypair
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 1: Generate Market Keypair${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

MARKET_KEYPAIR="./immutable-market-keypair.json"

if [ -f "$MARKET_KEYPAIR" ]; then
    echo -e "${YELLOW}Using existing market keypair: $MARKET_KEYPAIR${NC}"
else
    echo -e "${YELLOW}Generating new market keypair...${NC}"
    solana-keygen new -o "$MARKET_KEYPAIR" --no-passphrase -s
fi

MARKET_PUBKEY=$(solana-keygen pubkey "$MARKET_KEYPAIR")
echo -e "${GREEN}Market pubkey: $MARKET_PUBKEY${NC}"
echo ""

# =============================================================================
# Step 2: Create slab account
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 2: Create Slab Account (200KB)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}Creating slab account with 200,000 lamports for 200KB space...${NC}"
solana create-account "$MARKET_KEYPAIR" 200000 "$PROGRAM_ID" --url "$RPC_URL" --keypair "$DEPLOYER_KEYPAIR"
echo -e "${GREEN}✓ Slab account created${NC}"
echo ""

# =============================================================================
# Step 3: Create vault token account
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 3: Create Vault Token Account${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# First, derive the vault PDA
VAULT_PDA=$(solana program-derived-address "$PROGRAM_ID" <<< "$MARKET_PUBKEY")
echo -e "${YELLOW}Vault PDA: $VAULT_PDA${NC}"

# Create vault token account
echo -e "${YELLOW}Creating vault token account...${NC}"
spl-token create-account "$SOL_MINT" --owner "$VAULT_PDA" --url "$RPC_URL" --keypair "$DEPLOYER_KEYPAIR"
echo -e "${GREEN}✓ Vault token account created${NC}"
echo ""

# Get vault token account address
VAULT_TOKEN_ACCOUNT=$(spl-token accounts --owner "$VAULT_PDA" --url "$RPC_URL" | grep "$SOL_MINT" | awk '{print $1}')
echo -e "${YELLOW}Vault token account: $VAULT_TOKEN_ACCOUNT${NC}"
echo ""

# =============================================================================
# Step 4: Initialize market
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 4: Initialize Market${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Check if CLI is available
if [ -f "./dist/index.js" ]; then
    CLI="./dist/index.js"
elif [ -f "./src/cli.ts" ]; then
    echo -e "${YELLOW}Building CLI...${NC}"
    npm install
    npm run build
    CLI="./dist/index.js"
else
    echo -e "${RED}❌ CLI not found. Run from percolator-cli-master directory.${NC}"
    exit 1
fi

echo -e "${YELLOW}Initializing market...${NC}"
npx tsx src/cli.ts init-market \
  --slab "$MARKET_PUBKEY" \
  --mint "$SOL_MINT" \
  --vault "$VAULT_TOKEN_ACCOUNT" \
  --index-feed-id "$Pyth_SOL_FEED" \
  --max-staleness-secs 60 \
  --conf-filter-bps 100 \
  --invert 0 \
  --unit-scale 0 \
  --warmup-period 100 \
  --maintenance-margin-bps 500 \
  --initial-margin-bps 1000 \
  --trading-fee-bps 10 \
  --max-accounts 1000 \
  --new-account-fee 10000000 \
  --risk-reduction-threshold 1000000000 \
  --maintenance-fee-per-slot 1000 \
  --max-crank-staleness 100 \
  --liquidation-fee-bps 250 \
  --liquidation-fee-cap 100000000 \
  --liquidation-buffer-bps 50 \
  --min-liquidation-abs 1000000 \
  --url "$RPC_URL"

echo -e "${GREEN}✓ Market initialized${NC}"
echo ""

# =============================================================================
# Step 5: BURN ADMIN KEYS
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${RED}Step 5: BURN ADMIN KEYS - Making Market Immutable${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}Burning admin key to burn address: $BURN_ADDRESS${NC}"
npx tsx src/cli.ts update-admin \
  --slab "$MARKET_PUBKEY" \
  --new-admin "$BURN_ADDRESS" \
  --url "$RPC_URL"

echo -e "${GREEN}✓ Admin key burned${NC}"

echo -e "${YELLOW}Burning oracle authority to burn address: $BURN_ADDRESS${NC}"
npx tsx src/cli.ts set-oracle-authority \
  --slab "$MARKET_PUBKEY" \
  --authority "$BURN_ADDRESS" \
  --url "$RPC_URL"

echo -e "${GREEN}✓ Oracle authority burned${NC}"
echo ""

# =============================================================================
# Step 6: Fund Insurance with 5 SOL
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 6: Fund Insurance with $INSURANCE_SOL SOL${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}Transferring $INSURANCE_SOL SOL to vault...${NC}"
spl-token transfer "$SOL_MINT" "$INSURANCE_LAMPORTS" "$VAULT_TOKEN_ACCOUNT" \
  --url "$RPC_URL" \
  --keypair "$DEPLOYER_KEYPAIR"

echo -e "${GREEN}✓ Insurance funded with $INSURANCE_SOL SOL${NC}"

# Verify insurance balance
echo -e "${YELLOW}Verifying insurance balance...${NC}"
INSURANCE_BALANCE=$(spl-token balance "$VAULT_TOKEN_ACCOUNT" --url "$RPC_URL")
echo -e "${GREEN}✓ Insurance balance: $INSURANCE_BALANCE SOL${NC}"
echo ""

# =============================================================================
# Step 7: Verify Immutability
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Step 7: Verify Immutability${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

echo -e "${YELLOW}Checking market config...${NC}"
echo ""
npx tsx src/cli.ts slab-config --slab "$MARKET_PUBKEY" --url "$RPC_URL"
echo ""

# Try to update admin (should fail)
echo -e "${YELLOW}Testing admin update (should fail)...${NC}"
if npx tsx src/cli.ts update-admin \
    --slab "$MARKET_PUBKEY" \
    --new-admin "$DEPLOYER_PUBKEY" \
    --url "$RPC_URL" 2>&1; then
    echo -e "${RED}❌ FAILED: Admin update succeeded when it should have failed!${NC}"
    exit 1
else
    echo -e "${GREEN}✓ Admin update correctly rejected${NC}"
fi
echo ""

# =============================================================================
# Summary
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🦂 IMMUTABLE MARKET DEPLOYED SUCCESSFULLY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}📋 Deployment Summary:${NC}"
echo ""
echo -e "  Program ID:      ${GREEN}$PROGRAM_ID${NC}"
echo -e "  Market (Slab):   ${GREEN}$MARKET_PUBKEY${NC}"
echo -e "  Vault:           ${GREEN}$VAULT_TOKEN_ACCOUNT${NC}"
echo -e "  Insurance Fund:  ${GREEN}$INSURANCE_SOL SOL${NC}"
echo -e "  Admin Key:       ${RED}$BURN_ADDRESS (BURNED)${NC}"
echo -e "  Oracle Auth:     ${RED}$BURN_ADDRESS (BURNED)${NC}"
echo -e "  RPC:             $RPC_URL"
echo ""
echo -e "${YELLOW}📁 Files:${NC}"
echo "  Market keypair: $MARKET_KEYPAIR"
echo ""
echo -e "${YELLOW}🔗 Explorer Links:${NC}"
echo "  https://explorer.solana.com/address/$MARKET_PUBKEY?cluster=devnet"
echo "  https://explorer.solana.com/address/$VAULT_TOKEN_ACCOUNT?cluster=devnet"
echo ""
echo -e "${YELLOW}🦂 THE 5 SOL CHALLENGE:${NC}"
echo -e "${YELLOW}   Extract the $INSURANCE_SOL SOL from the immutable insurance fund${NC}"
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"

# Save deployment info
cat > immutable-market-info.txt << EOF
# Percolator Immutable Market Deployment Info
# Generated: $(date)

PROGRAM_ID=$PROGRAM_ID
MARKET_PUBKEY=$MARKET_PUBKEY
VAULT_TOKEN_ACCOUNT=$VAULT_TOKEN_ACCOUNT
INSURANCE_SOL=$INSURANCE_SOL
INSURANCE_LAMPORTS=$INSURANCE_LAMPORTS
ADMIN_BURNED=$BURN_ADDRESS
ORACLE_AUTH_BURNED=$BURN_ADDRESS
RPC_URL=$RPC_URL

# Market Parameters
PYTH_SOL_FEED=$Pyth_SOL_FEED
MAINTENANCE_MARGIN_BPS=500
INITIAL_MARGIN_BPS=1000
LIQUIDATION_FEE_BPS=250
RISK_REDUCTION_THRESHOLD=1000000000
EOF

echo -e "${GREEN}✓ Deployment info saved to immutable-market-info.txt${NC}"
echo ""
