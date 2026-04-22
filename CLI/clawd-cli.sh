#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════
#  openclawd CLI — solana-clawd, ClawdHub, x402 Payments
#  solanaclawd.com  ·  github.com/x402agent/openclawd
# ═══════════════════════════════════════════════════════════════════

CLAWD_API="https://solanaclawd.com/api"
MARKETPLACE="https://solanaclawd.com/marketplace"
GATEWAY="https://solanaclawd.com/x402"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🦞 openclawd CLI v1.0   solanaclawd.com      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo ""

case "${1:-}" in
  # ═══ SKILLS (ClawdHub) ═══
  "skills")
    echo -e "${GREEN}→${NC} Skills Hub"
    echo "Usage: clawd skills <command>"
    echo ""
    echo "Commands:"
    echo "  list       - List all skills"
    echo "  install    - Install a skill"
    echo "  search     - Search skills"
    echo "  publish    - Publish a skill"
    echo ""
    echo "Or use directly:"
    echo "  npx clawdhub install <skill>"
    echo "  npx clawdhub list"
    echo "  npx clawdhub search <query>"
    ;;
  "skills:list")
    curl -s "$CLAWD_API/skills" | jq '.'
    ;;
  "skills:install")
    if [ -z "$2" ]; then
      echo "Usage: clawd skills:install <skill-slug>"
      echo "Example: clawd skills:install pumpfun-trading"
    else
      curl -s "$CLAWD_API/skills/$2/download" -o "$2/SKILL.md"
      echo "Installed $2"
    fi
    ;;
  "skills:search")
    curl -s "https://solanaclawd.com/api/skills/search?q=$2" | jq '.'
    ;;
  "skills:featured")
    curl -s "$CLAWD_API/skills/featured" | jq '.'
    ;;

  # ═══ AGENTS ═══
  "agents")
    echo -e "${GREEN}→${NC} Listing registered agents..."
    curl -s "$CLAWD_API/agents" | jq '.'
    ;;
  "status")
    echo -e "${GREEN}→${NC} Checking agent status..."
    curl -s "$CLAWD_API/status" | jq '.'
    ;;
  "connect")
    echo -e "${GREEN}→${NC} Connecting to solanaclawd.com..."
    curl -s -X POST "$CLAWD_API/connect" \
      -H "Content-Type: application/json" \
      -d '{"agent":"openclawd","version":"1.0"}' | jq '.'
    ;;

  # ═══ WALLET & TRADING ═══
  "wallet")
    echo -e "${GREEN}→${NC} Fetching wallet info..."
    curl -s "$CLAWD_API/wallet" | jq '.'
    ;;
  "prices")
    echo -e "${GREEN}→${NC} Live token prices..."
    curl -s "$CLAWD_API/prices" | jq '.'
    ;;
  "trading")
    echo "Trading commands:"
    echo "  clawd ooda --sim   # OODA loop simulation"
    echo "  clawd trading start"
    echo "  clawd trading status"
    ;;
  "swap")
    echo -e "${GREEN}→${NC} DEX swap via Jupiter..."
    curl -s "$CLAWD_API/dex/swap?from=$2&to=$3&amount=$4" | jq '.'
    ;;

  # ═══ MARKETPLACE ═══
  "marketplace")
    echo -e "${GREEN}→${NC} Marketplace at $MARKETPLACE"
    curl -s "$CLAWD_API/marketplace/skills" | jq '.'
    ;;
  "marketplace:trending")
    curl -s "$CLAWD_API/marketplace/trending" | jq '.'
    ;;
  "marketplace:new")
    curl -s "$CLAWD_API/marketplace/new" | jq '.'
    ;;
  "marketplace:category")
    curl -s "https://solanaclawd.com/api/marketplace/category/$2" | jq '.'
    ;;

  # ═══ x402 PAYMENTS ═══
  "pay")
    echo -e "${GREEN}→${NC} x402 Payment gateway..."
    echo "Usage: clawd pay <amount> <token> <recipient>"
    echo ""
    echo "Example: clawd pay 100 USDC 0x..."
    ;;
  "payment:verify")
    curl -s -X POST "$GATEWAY/facilitator/verify" \
      -H "Content-Type: application/json" \
      -d '{"payment":"'$2'"}' | jq '.'
    ;;
  "payment:settle")
    curl -s -X POST "$GATEWAY/facilitator/settle" \
      -H "Content-Type: application/json" \
      -d '{"tx":"'$2'"}' | jq '.'
    ;;
  "payment:supported")
    curl -s "$GATEWAY/facilitator/supported" | jq '.'
    ;;

  # ═══ NODE OPERATIONS ═══
  "node")
    echo "Node operations:"
    echo "  clawd node register   - Register node"
    echo "  clawd node status     - Node status"
    echo "  clawd node update     - Update config"
    ;;
  "node:register")
    curl -s -X POST "$CLAWD_API/node/register" \
      -H "Content-Type: application/json" \
      -d '{"node":"'$2'"}' | jq '.'
    ;;
  "node:status")
    curl -s "$CLAWD_API/node/status" | jq '.'
    ;;
  "node:peers")
    curl -s "$CLAWD_API/node/peers" | jq '.'
    ;;

  # ═══ REGISTER AGENT ═══
  "register")
    echo -e "${GREEN}→${NC} Register on Metaplex Agent Registry..."
    echo "Run: npx tsx clawd-register.ts"
    echo "Requires: YOUR_HELIUS_API_KEY in clawd-register.ts"
    ;;

  # ═══ HELP ═══
  "help"|"--help"|"-h"|"")
    echo "OpenClawd CLI — solanaclawd.com"
    echo ""
    echo -e "${YELLOW}SKILLS (ClawdHub):${NC}"
    echo "  clawd skills              # Skills help"
    echo "  clawd skills:list          # List all skills"
    echo "  clawd skills:install <slug>  # Install skill"
    echo "  clawd skills:search <query> # Search skills"
    echo "  clawd skills:featured     # Featured skills"
    echo ""
    echo -e "${YELLOW}MARKETPLACE:${NC}"
    echo "  clawd marketplace          # Browse marketplace"
    echo "  clawd marketplace:trending # Trending skills"
    echo "  clawd marketplace:new      # New skills"
    echo ""
    echo -e "${YELLOW}AGENTS:${NC}"
    echo "  clawd agents              # List agents"
    echo "  clawd status              # Agent status"
    echo "  clawd connect             # Connect to gateway"
    echo ""
    echo -e "${YELLOW}WALLET & TRADING:${NC}"
    echo "  clawd wallet              # Wallet info"
    echo "  clawd prices              # Token prices"
    echo "  clawd trading             # Trading commands"
    echo "  clawd swap <from> <to> <amt>  # DEX swap"
    echo ""
    echo -e "${YELLOW}x402 PAYMENTS:${NC}"
    echo "  clawd pay <amt> <token> <to>  # Make payment"
    echo "  clawd payment:verify     # Verify payment"
    echo "  clawd payment:settle     # Settle payment"
    echo "  clawd payment:supported  # Supported tokens"
    echo ""
    echo -e "${YELLOW}NODE OPERATIONS:${NC}"
    echo "  clawd node                # Node help"
    echo "  clawd node:register      # Register node"
    echo "  clawd node:status        # Node status"
    echo ""
    echo "Or use npx clawdhub directly:"
    echo "  npx clawdhub install <skill>"
    echo "  npx clawdhub publish ./skill"
    echo "  npx clawdhub search <query>"
    echo ""
    ;;
esac