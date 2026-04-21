#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  publish.sh — release the solana-clawd CLI to npm
#
#  Requirements:
#    export NPM_TOKEN=npm_xxxxxxxxxxxxxxxxxxxxxxxx
#  (never commit the token — the .npmrc.example uses ${NPM_TOKEN}
#   which npm expands at read time.)
#
#  Usage:
#    ./scripts/publish.sh                 # publish solana-clawd from ./solana-clawd
#    PKG_DIR=./solana-clawd ./scripts/publish.sh
# ─────────────────────────────────────────────────────────────
set -euo pipefail

PKG_DIR="${PKG_DIR:-solana-clawd}"
: "${NPM_TOKEN:?NPM_TOKEN is required — export it in your shell before publishing}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/$PKG_DIR"

# Write an ephemeral .npmrc that references $NPM_TOKEN (expanded at read-time)
TMP_NPMRC="$(mktemp)"
cat > "$TMP_NPMRC" <<'EOF'
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
access=public
EOF
trap 'rm -f "$TMP_NPMRC"' EXIT

echo "▸ Publishing $(node -p "require('./package.json').name")@$(node -p "require('./package.json').version")"
npm publish --userconfig "$TMP_NPMRC" --access public "$@"
echo "✓ Published."
