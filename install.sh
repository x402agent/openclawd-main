#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  openclawd one-shot installer
#  Hosted at: https://solanaclawd.com/install.sh
#  Usage:     curl -fsSL https://solanaclawd.com/install.sh | bash
# ─────────────────────────────────────────────────────────────
set -euo pipefail

REPO="${OPENCLAWD_REPO:-https://github.com/x402agent/openclawd.git}"
BRANCH="${OPENCLAWD_BRANCH:-main}"
TARGET_DIR="${OPENCLAWD_DIR:-$HOME/.openclawd}"
SOLANA_CLAWD_BASE_URL="${SOLANA_CLAWD_BASE_URL:-https://solanaclawd.com}"

c_reset=$'\033[0m'; c_bold=$'\033[1m'; c_green=$'\033[32m'; c_cyan=$'\033[36m'; c_yellow=$'\033[33m'; c_red=$'\033[31m'
log()  { printf "%s▸%s %s\n" "$c_cyan"   "$c_reset" "$*"; }
ok()   { printf "%s✓%s %s\n" "$c_green"  "$c_reset" "$*"; }
warn() { printf "%s!%s %s\n" "$c_yellow" "$c_reset" "$*"; }
die()  { printf "%s✗%s %s\n" "$c_red"    "$c_reset" "$*" >&2; exit 1; }

banner() {
  cat <<'EOF'
   ____                   ___  _                _
  / __ \ ___  ___  ___   / _ \/ /__ ____    ____/ /
 / /_/ // _ \/ -_)/ _ \ / ___/ / _ `/\ \/\ / /_  _/
 \____// .__/\__// //_//_/  /_/\_,_//_/\_\/  /_/
      /_/                openclawd · solana-clawd stack
EOF
}

need() { command -v "$1" >/dev/null 2>&1 || die "missing required command: $1"; }

banner
log "Connecting to $SOLANA_CLAWD_BASE_URL"

need curl
need git
need node
need npm

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || die "node >= 18 required (have $(node -v))"

# 1. install the solana-clawd CLI globally
log "Installing solana-clawd CLI from npm…"
if npm i -g solana-clawd >/dev/null 2>&1; then
  ok "solana-clawd $(solana-clawd --version 2>/dev/null || echo installed)"
else
  warn "global npm install failed — retrying with sudo"
  sudo npm i -g solana-clawd
  ok "solana-clawd installed (sudo)"
fi

# 2. clone / update the monorepo into $TARGET_DIR
if [ -d "$TARGET_DIR/.git" ]; then
  log "Updating existing checkout at $TARGET_DIR"
  git -C "$TARGET_DIR" fetch --quiet origin "$BRANCH"
  git -C "$TARGET_DIR" checkout --quiet "$BRANCH"
  git -C "$TARGET_DIR" pull --ff-only --quiet origin "$BRANCH"
else
  log "Cloning $REPO → $TARGET_DIR"
  git clone --depth 1 --branch "$BRANCH" "$REPO" "$TARGET_DIR"
fi
ok "Repo ready at $TARGET_DIR"

# 3. scaffold a root .env from the example
if [ ! -f "$TARGET_DIR/.env" ]; then
  cp "$TARGET_DIR/.env.example" "$TARGET_DIR/.env"
  # prefill the Solana Clawd base URL so downstream services pick it up
  if grep -q '^SOLANA_CLAWD_BASE_URL=' "$TARGET_DIR/.env"; then
    sed -i.bak "s|^SOLANA_CLAWD_BASE_URL=.*|SOLANA_CLAWD_BASE_URL=$SOLANA_CLAWD_BASE_URL|" "$TARGET_DIR/.env"
    rm -f "$TARGET_DIR/.env.bak"
  fi
  ok "Created $TARGET_DIR/.env — fill in your provider keys"
else
  warn "$TARGET_DIR/.env already exists — leaving untouched"
fi

# 4. print next steps
cat <<EOF

${c_bold}Next steps${c_reset}
  1. Edit your env:      ${c_cyan}\$EDITOR $TARGET_DIR/.env${c_reset}
  2. Pair this device:   ${c_cyan}solana-clawd pair <CODE>${c_reset}
  3. Mint your agent:    ${c_cyan}solana-clawd mint${c_reset}
  4. Check status:       ${c_cyan}solana-clawd status${c_reset}

Docs
  • Stack overview:      $TARGET_DIR/STACK.md
  • Skills catalog:      $TARGET_DIR/skills/README.md
  • Website:             $SOLANA_CLAWD_BASE_URL

EOF
ok "openclawd installed."
