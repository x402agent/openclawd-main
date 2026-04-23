#!/bin/bash
# 🦞 Clawd Code Local — One-command setup
# Run self-improving AI coding agents on your Apple Silicon Mac
# Usage: bash setup.sh

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🦞 CLAWD CODE LOCAL 🦞                                ║"
echo "║                                                            ║"
echo "║   Self-Improving AI on Apple Silicon                      ║"
echo "║   Privacy-First • No Cloud • No Fees                    ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Detect memory
MEM_GB=$(sysctl -n hw.memsize 2>/dev/null | awk '{print int($1/1073741824)}')
echo "Detected: $(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo 'Apple Silicon')"
echo "Memory: ${MEM_GB} GB"
echo ""

# Check for Apple Silicon
if [[ $(uname -m) != "arm64" ]]; then
  echo "ERROR: 🦞 Clawd Code Local requires Apple Silicon (M1 or later)."
  exit 1
fi

# Install Homebrew if missing
if ! command -v brew &>/dev/null; then
  echo "Installing Homebrew..."
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# Install Ollama
if ! command -v ollama &>/dev/null; then
  echo "Installing Ollama..."
  brew install ollama
fi

# Start Ollama
if ! pgrep -x "ollama" >/dev/null 2>&1; then
  echo "Starting Ollama..."
  ollama serve >/dev/null 2>&1 &
  sleep 3
fi

# Choose model based on RAM
echo "Selecting model for your ${MEM_GB} GB Mac..."
if [ "$MEM_GB" -ge 96 ]; then
  MODEL="qwen3.5:122b"
  MODEL_DESC="27B (81 GB) — full power"
elif [ "$MEM_GB" -ge 32 ]; then
  MODEL="qwen3.5:32b"
  MODEL_DESC="27B (20 GB) — great coding"
else
  MODEL="qwen3.5:4b"
  MODEL_DESC="4B (3.4 GB) — lightweight"
fi

echo "Selected: $MODEL — $MODEL_DESC"
echo ""

# Pull models
echo "Downloading $MODEL (this may take a while)..."
ollama pull "$MODEL"

# Always pull the small model for browser agent
if [ "$MODEL" != "qwen3.5:4b" ]; then
  echo "Downloading qwen3.5:4b for browser agent..."
  ollama pull qwen3.5:4b
fi

# Set up proxy
PROXY_DIR="$HOME/.local/clawd-local-proxy"
mkdir -p "$PROXY_DIR"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/proxy/proxy.py" "$PROXY_DIR/proxy.py"

# Update MODEL_MAP if not using 122b
if [ "$MODEL" != "qwen3.5:122b" ]; then
  sed -i '' "s/qwen3.5:122b/$MODEL/g" "$PROXY_DIR/proxy.py"
fi

# Create desktop launcher
CLAUDE_BIN=$(which clawd 2>/dev/null || which clawd 2>/dev/null || echo "$HOME/.local/bin/clawd")
if [ ! -f "$CLAUDE_BIN" ]; then
  echo ""
  echo "WARNING: Clawd Code not found. Install it with:"
  echo "  bun add -g clawd-code-cli"
  echo ""
  CLAUDE_BIN="\$HOME/.local/bin/clawd"
fi

cat > "$HOME/Desktop/Clawd Local.command" << LAUNCHER
#!/bin/bash
# 🦞 Clawd Code — Local AI
CLAUDE_BIN="$CLAUDE_BIN"
PROXY="$PROXY_DIR/proxy.py"

if ! pgrep -x "ollama" >/dev/null 2>&1; then
  ollama serve >/dev/null 2>&1 &
  sleep 3
fi

if ! lsof -i :4000 >/dev/null 2>&1; then
  python3 "\$PROXY" >/dev/null 2>&1 &
  sleep 2
fi

clear
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║   🦞 CLAWD CODE LOCAL 🦞                                ║"
echo "║                                                            ║"
echo "║   → Local AI: $MODEL"
echo "║   → Running on your Mac — no cloud, no API fees"
echo "║   → OODA Loop Self-Improvement Active"
echo "║                                                            ║"
echo "║   🦞 Claws that learn locally, brains that evolve         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ANTHROPIC_BASE_URL=http://localhost:4000 \\
ANTHROPIC_API_KEY=sk-local \\
exec "\$CLAUDE_BIN" --model claude-sonnet-4-6
LAUNCHER

chmod +x "$HOME/Desktop/Clawd Local.command"

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🦞 Setup Complete! 🦞                                ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║                                                            ║"
echo "║  Model: $MODEL"
echo "║  Proxy: $PROXY_DIR/proxy.py"
echo "║  Launcher: ~/Desktop/Clawd Local.command"
echo "║                                                            ║"
echo "║  Features:                                                ║"
echo "║  • OODA Loop Self-Improvement                            ║"
echo "║  • Local Skill Storage                                    ║"
echo "║  • Optional Solana Sync                                   ║"
echo "║                                                            ║"
echo "║  Double-click 'Clawd Local' on your Desktop             ║"
echo "║  to start coding with local AI.                           ║"
echo "║                                                            ║"
echo "║  🦞 Claws that learn locally, brains that evolve         ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
