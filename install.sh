#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║                                                                  ║
# ║     ░█▀█░█▀█░█▀▀░█▀█░░░█▀▀░█░░░█▀█░█░█░█▀▄                       ║
# ║     ░█░█░█▀▀░█▀▀░█░█░░░█░░░█░░░█▀█░█▄█░█░█                       ║
# ║     ░▀▀▀░▀░░░▀▀▀░▀░▀░░░▀▀▀░▀▀▀░▀░▀░▀░▀░▀▀░                       ║
# ║                                                                  ║
# ║          🦞  openclawd · cyberpunk lobster edition  🦞           ║
# ║                                                                  ║
# ║          curl -fsSL solanaclawd.com/install.sh | bash            ║
# ║                                                                  ║
# ╚══════════════════════════════════════════════════════════════════╝
#
#  One-shot openclawd bootstrap:
#   1. Preflight (curl, git, node>=18, npm, optional brew).
#   2. Install Tailscale (macOS: Homebrew cask · Linux: official script).
#   3. `tailscale up` (interactive login) — skippable via SKIP_TAILSCALE=1.
#   4. Install the public `solana-clawd` CLI globally from npm.
#   5. Clone openclawd monorepo (shallow) and bootstrap `tailclawd/`:
#         npm install  +  iii-sdk  +  Tailscale Serve on :3110.
#   6. Scaffold ~/.openclawd/.env with every env var the stack uses.
#   7. Print pair / mint / status / tailnet next-steps.
#
#  Env overrides:
#    OPENCLAWD_DIR        (default: ~/.openclawd)
#    TAILCLAWD_DIR        (default: $OPENCLAWD_DIR/tailclawd)
#    OPENCLAWD_REPO       (default: https://github.com/x402agent/openclawd.git)
#    SKIP_TAILSCALE=1     skip the Tailscale install / login step
#    SKIP_TAILCLAWD=1     skip the tailclawd clone + serve step
#    AUTO_SERVE=1         auto `tailscale serve --bg 3110` after launching
#    TAILCLAWD_TOKEN      optional bearer token for tailclawd endpoints
#

set -euo pipefail

TARGET_DIR="${OPENCLAWD_DIR:-$HOME/.openclawd}"
TAILCLAWD_DIR="${TAILCLAWD_DIR:-$TARGET_DIR/tailclawd}"
OPENCLAWD_REPO="${OPENCLAWD_REPO:-https://github.com/x402agent/openclawd.git}"
SOLANA_CLAWD_BASE_URL="${SOLANA_CLAWD_BASE_URL:-https://solanaclawd.com}"
SKIP_TAILSCALE="${SKIP_TAILSCALE:-0}"
SKIP_TAILCLAWD="${SKIP_TAILCLAWD:-0}"
AUTO_SERVE="${AUTO_SERVE:-0}"
TAILCLAWD_TOKEN="${TAILCLAWD_TOKEN:-}"

# ─── cyberpunk palette ────────────────────────────────────────────
CR=$'\033[0m'; BOLD=$'\033[1m'; DIM=$'\033[2m'
MAGENTA=$'\033[38;5;201m'
CYAN=$'\033[38;5;51m'
LOBSTER=$'\033[38;5;203m'
NEON=$'\033[38;5;118m'
VIOLET=$'\033[38;5;141m'
AMBER=$'\033[38;5;214m'
DANGER=$'\033[38;5;196m'
GREY=$'\033[38;5;244m'

hr() { printf "${VIOLET}▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰${CR}\n"; }
log()  { printf "${CYAN}▸${CR} ${BOLD}%s${CR}\n" "$*"; }
ok()   { printf "${NEON}◉${CR} %s\n" "$*"; }
warn() { printf "${AMBER}▲${CR} %s\n" "$*"; }
die()  { printf "${DANGER}✖ fatal:${CR} %s\n" "$*" >&2; exit 1; }

banner() {
  printf "${MAGENTA}"
  cat <<'ASCII'

          ╔═══════════════════════════════════════════╗
          ║                                           ║
ASCII
  printf "          ║     ${LOBSTER}▄▄▄▄${MAGENTA}          ${CYAN}OPEN${MAGENTA}      ${LOBSTER}▄▄▄▄${MAGENTA}    ║\n"
  printf "          ║    ${LOBSTER}▐█▄█▌${MAGENTA}         ${CYAN}CLAWD${MAGENTA}     ${LOBSTER}▐█▄█▌${MAGENTA}   ║\n"
  printf "          ║     ${LOBSTER}╲██╱${MAGENTA}  ${NEON}┏━━━━━━━━━━━━━┓${MAGENTA}  ${LOBSTER}╲██╱${MAGENTA}    ║\n"
  printf "          ║      ${LOBSTER}██${MAGENTA}   ${NEON}┃${CYAN} 🦞 lobster.os ${NEON}┃${MAGENTA}   ${LOBSTER}██${MAGENTA}     ║\n"
  printf "          ║     ${LOBSTER}▕██▏${MAGENTA}  ${NEON}┃${VIOLET} chain: solana ${NEON}┃${MAGENTA}  ${LOBSTER}▕██▏${MAGENTA}    ║\n"
  printf "          ║      ${LOBSTER}▀▀${MAGENTA}   ${NEON}┗━━━━━━━━━━━━━┛${MAGENTA}   ${LOBSTER}▀▀${MAGENTA}     ║\n"
  printf "          ║    ${LOBSTER}▄▄██████▄▄${MAGENTA}               ${LOBSTER}▄▄██████▄▄${MAGENTA}║\n"
  printf "          ║   ${LOBSTER}▜█████████▛${MAGENTA}  ${CYAN}┌─┐┌─┐┌┐┌${MAGENTA}   ${LOBSTER}▜█████████▛${MAGENTA}║\n"
  printf "          ║    ${LOBSTER}▀▀▀██▀▀▀${MAGENTA}   ${CYAN}│  ├─┘││││${MAGENTA}    ${LOBSTER}▀▀▀██▀▀▀${MAGENTA} ║\n"
  printf "          ║                ${CYAN}└─┘└─┘┘└┘${MAGENTA}              ║\n"
  printf "          ║                                           ║\n"
  printf "          ║  ${VIOLET}[${NEON} router ${VIOLET}·${NEON} chain ${VIOLET}·${NEON} tailnet ${VIOLET}·${NEON} agents ${VIOLET}]${MAGENTA}  ║\n"
  printf "          ║                                           ║\n"
  printf "          ╚═══════════════════════════════════════════╝\n"
  printf "${CR}\n"
  printf "          ${GREY}╭─ cyberpunk lobster edition ─────────────╮${CR}\n"
  printf "          ${GREY}│${CR}  ${LOBSTER}▒▒▒${CR} ${CYAN}solana${CR}  ${LOBSTER}▒▒${CR} ${MAGENTA}agents${CR}  ${LOBSTER}▒${CR} ${NEON}x402${CR}    ${GREY}│${CR}\n"
  printf "          ${GREY}│${CR}  ${LOBSTER}▒▒▒${CR} ${VIOLET}clawdrouter${CR} ${LOBSTER}▒${CR} ${NEON}tailclawd${CR}   ${GREY}│${CR}\n"
  printf "          ${GREY}╰─────────────────────────────────────────╯${CR}\n\n"
}

# ─── spinners ─────────────────────────────────────────────────────
CLAW_FRAMES=( "(￣^￣)━╋━╋━" "(￣ω￣)━╋━╋╌" "(￣▽￣)━╋━╋ " "(￣ー￣)━╋━╋╌" )
SCUTTLE_FRAMES=(
  "🦞▁▁▁▁▁▁▁▁▁▁" "▁🦞▁▁▁▁▁▁▁▁▁" "▁▁🦞▁▁▁▁▁▁▁▁"
  "▁▁▁🦞▁▁▁▁▁▁▁" "▁▁▁▁🦞▁▁▁▁▁▁" "▁▁▁▁▁🦞▁▁▁▁▁"
  "▁▁▁▁▁▁🦞▁▁▁▁" "▁▁▁▁▁▁▁🦞▁▁▁" "▁▁▁▁▁▁▁▁🦞▁▁"
  "▁▁▁▁▁▁▁▁▁🦞▁" "▁▁▁▁▁▁▁▁▁▁🦞"
)
MATRIX_FRAMES=( "░▒▓█▓▒░" "▒▓█▓▒░▒" "▓█▓▒░▒▓" "█▓▒░▒▓█" "▓▒░▒▓█▓" "▒░▒▓█▓▒" "░▒▓█▓▒░" )
HEART_FRAMES=( "◦·◦·◦" "●·◦·◦" "●●·◦·" "●●●·◦" "●●●●·" "●●●●●" "·●●●●" "··●●●" "···●●" "····●" "·····" )

_spinner_bg_pid=""
_spinner_cleanup() { [ -n "$_spinner_bg_pid" ] && kill "$_spinner_bg_pid" 2>/dev/null || true; printf "\r\033[2K"; }
trap _spinner_cleanup EXIT INT TERM

run_with_spinner() {
  local name="$1"; shift
  local label="$1"; shift

  if [ ! -t 1 ]; then
    log "$label"
    "$@"
    return $?
  fi

  local upper
  upper="$(printf '%s' "$name" | tr '[:lower:]' '[:upper:]')"
  local arr_name="${upper}_FRAMES"
  local -a FRAMES
  eval "FRAMES=( \"\${${arr_name}[@]}\" )"

  local color="$CYAN"
  case "$name" in
    claw)      color="$LOBSTER" ;;
    scuttle)   color="$LOBSTER" ;;
    matrix)    color="$NEON"    ;;
    heartbeat) color="$MAGENTA" ;;
  esac

  (
    local i=0
    local total=${#FRAMES[@]}
    while :; do
      local f="${FRAMES[$((i % total))]}"
      printf "\r\033[2K  ${color}%s${CR} ${BOLD}%s${CR}" "$f" "$label"
      i=$((i+1))
      sleep 0.09
    done
  ) &
  _spinner_bg_pid=$!

  set +e
  "$@" >/tmp/openclawd-step.log 2>&1
  local rc=$?
  set -e

  kill "$_spinner_bg_pid" 2>/dev/null || true
  wait "$_spinner_bg_pid" 2>/dev/null || true
  _spinner_bg_pid=""
  printf "\r\033[2K"

  if [ $rc -eq 0 ]; then
    printf "  ${NEON}◉${CR} %s\n" "$label"
  else
    printf "  ${DANGER}✖${CR} %s ${DIM}(see /tmp/openclawd-step.log)${CR}\n" "$label"
  fi
  return $rc
}

# ─── os detection ─────────────────────────────────────────────────
OS="$(uname -s)"
case "$OS" in
  Darwin) PLATFORM="mac"   ;;
  Linux)  PLATFORM="linux" ;;
  *)      PLATFORM="other" ;;
esac

# ─── preflight ────────────────────────────────────────────────────
banner
hr
log "target dir     ${CYAN}${TARGET_DIR}${CR}"
log "tailclawd dir  ${CYAN}${TAILCLAWD_DIR}${CR}"
log "base url       ${CYAN}${SOLANA_CLAWD_BASE_URL}${CR}"
log "platform       ${CYAN}${PLATFORM} · $(uname -m)${CR}"
hr

run_with_spinner heartbeat "preflight: curl / node / npm / git" bash -c '
  command -v curl >/dev/null && command -v node >/dev/null && command -v npm >/dev/null && command -v git >/dev/null
' || die "one of curl/node/npm/git is missing — install it and retry"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || die "node >= 18 required (have $(node -v))"
ok "node $(node -v) ${DIM}(>= 18)${CR}"

# ─── tailscale ────────────────────────────────────────────────────
hr
if [ "$SKIP_TAILSCALE" = "1" ]; then
  warn "SKIP_TAILSCALE=1 — skipping Tailscale install/login"
else
  if command -v tailscale >/dev/null 2>&1; then
    ok "tailscale already installed ${DIM}($(tailscale version 2>/dev/null | head -1))${CR}"
  else
    case "$PLATFORM" in
      mac)
        if command -v brew >/dev/null 2>&1; then
          run_with_spinner claw "installing Tailscale via Homebrew cask" \
            brew install --cask tailscale \
            || warn "brew install failed — grab the app from https://tailscale.com/download/mac"
        else
          warn "Homebrew not found — install Tailscale from https://tailscale.com/download/mac"
        fi
        # macOS cask drops the CLI here but doesn't always symlink it
        if ! command -v tailscale >/dev/null 2>&1 && [ -x "/Applications/Tailscale.app/Contents/MacOS/Tailscale" ]; then
          warn "launch the Tailscale app once so the CLI is linked, then re-run this installer"
        fi
        ;;
      linux)
        run_with_spinner matrix "installing Tailscale (official script)" \
          bash -c 'curl -fsSL https://tailscale.com/install.sh | sh' \
          || warn "Tailscale install failed — see https://tailscale.com/download/linux"
        ;;
      *)
        warn "unknown platform — install Tailscale manually: https://tailscale.com/download"
        ;;
    esac
  fi

  if command -v tailscale >/dev/null 2>&1; then
    if tailscale status >/dev/null 2>&1; then
      ok "tailscale already logged in: ${CYAN}$(tailscale status --json 2>/dev/null | grep -o '"DNSName":"[^"]*"' | head -1 | cut -d'"' -f4)${CR}"
    else
      warn "not logged in — run: ${VIOLET}sudo tailscale up${CR} ${DIM}(or just 'tailscale up' on macOS)${CR}"
    fi
  fi
fi

# ─── solana-clawd cli ─────────────────────────────────────────────
hr
if ! run_with_spinner claw "installing solana-clawd cli from npm" npm i -g solana-clawd; then
  warn "global npm install failed — retrying with sudo"
  run_with_spinner claw "installing solana-clawd cli ${DIM}(sudo)${CR}" sudo npm i -g solana-clawd \
    || die "npm install failed — check /tmp/openclawd-step.log"
fi
ok "solana-clawd ${CYAN}$(solana-clawd --version 2>/dev/null || echo installed)${CR}"

# ─── scaffold target dir ──────────────────────────────────────────
hr
run_with_spinner scuttle "scaffolding ${CYAN}${TARGET_DIR}${CR}" mkdir -p "$TARGET_DIR"

# ─── tailclawd ────────────────────────────────────────────────────
if [ "$SKIP_TAILCLAWD" = "1" ]; then
  warn "SKIP_TAILCLAWD=1 — skipping tailclawd bootstrap"
else
  hr
  if [ -d "$TAILCLAWD_DIR/.git" ] || [ -f "$TAILCLAWD_DIR/package.json" ]; then
    ok "tailclawd already present at ${CYAN}${TAILCLAWD_DIR}${CR}"
  else
    REPO_ROOT="$TARGET_DIR/repo"
    if [ ! -d "$REPO_ROOT/.git" ]; then
      run_with_spinner matrix "cloning openclawd monorepo ${DIM}(shallow)${CR}" \
        git clone --depth 1 "$OPENCLAWD_REPO" "$REPO_ROOT" \
        || die "git clone failed — set OPENCLAWD_REPO or check network"
    fi
    run_with_spinner scuttle "linking tailclawd → ${CYAN}${TAILCLAWD_DIR}${CR}" \
      bash -c "mkdir -p \"\$(dirname '$TAILCLAWD_DIR')\" && ln -sfn '$REPO_ROOT/tailclawd' '$TAILCLAWD_DIR'"
  fi

  if [ -f "$TAILCLAWD_DIR/package.json" ]; then
    run_with_spinner claw "npm install tailclawd deps" \
      bash -c "cd '$TAILCLAWD_DIR' && npm install --no-audit --no-fund" \
      || warn "tailclawd npm install failed — see /tmp/openclawd-step.log"
    ok "tailclawd ready — start it with: ${VIOLET}cd $TAILCLAWD_DIR && npm run dev${CR}"
  else
    warn "tailclawd package.json not found at $TAILCLAWD_DIR — skipping npm install"
  fi

  if [ "$AUTO_SERVE" = "1" ] && command -v tailscale >/dev/null 2>&1; then
    run_with_spinner heartbeat "tailscale serve :3110 → https (bg)" \
      bash -c 'tailscale serve --bg --https=443 http://127.0.0.1:3110 || tailscale serve --bg 3110' \
      || warn "tailscale serve failed — run it manually once logged in"
  fi
fi

# ─── clawd-wallet + agents-x402-solana packages ────────────────────
hr
REPO_DIR="$TARGET_DIR/repo"
if [ -d "$REPO_DIR/packages/clawd-wallet" ]; then
  if [ ! -d "$REPO_DIR/packages/clawd-wallet/dist" ]; then
    run_with_spinner claw "building @openclawd/wallet package" \
      bash -c "cd '$REPO_DIR/packages/clawd-wallet' && npm install --no-audit --no-fund && npm run build" \
      || warn "clawd-wallet build failed — install manually: cd packages/clawd-wallet && npm run build"
    ok "@openclawd/wallet — Privy wallet + agentic trading SDK"
  else
    ok "@openclawd/wallet already built"
  fi
else
  warn "packages/clawd-wallet not found in repo — skipping"
fi

if [ -d "$REPO_DIR/packages/agents-x402-solana" ]; then
  ok "@openclawd/agents-x402 — x402 agent payments (TypeScript source, no build needed)"
else
  warn "packages/agents-x402-solana not found in repo — skipping"
fi

# ─── ~/.openclawd/.env ────────────────────────────────────────────
hr
ENV_FILE="$TARGET_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  warn "$ENV_FILE already exists — leaving untouched"
else
  run_with_spinner matrix "writing ${CYAN}${ENV_FILE}${CR}" bash -c "cat > '$ENV_FILE' <<EOF
# openclawd — generated by solanaclawd.com/install.sh
# Fill in your provider keys before running agents.

# ── Solana / base URLs ──────────────────────────────
SOLANA_CLAWD_BASE_URL=$SOLANA_CLAWD_BASE_URL
CLAWD_MINT=8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=
HELIUS_RPC_URL=

# ── Model router (clawdrouter) ──────────────────────
OPENROUTER_API_KEY=
CLAWDROUTER_DEFAULT_REASONING=xai/grok-4.20-beta
CLAWDROUTER_DEFAULT_LONGCTX=moonshot/kimi-k2.6

# ── Direct providers (optional) ─────────────────────
XAI_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
MOONSHOT_API_KEY=

# ── Runtime / infra (optional) ──────────────────────
E2B_API_KEY=
PRIVY_APP_ID=
PRIVY_APP_SECRET=
TELEGRAM_BOT_TOKEN=

# ── Tailnet / tailclawd ─────────────────────────────
TAILSCALE_AUTH_KEY=
TAILCLAWD_DIR=$TAILCLAWD_DIR
TAILCLAWD_PORT=3110
TAILCLAWD_TOKEN=$TAILCLAWD_TOKEN
EOF"
  ok "created $ENV_FILE — fill in your provider keys"
fi

# ─── profiles ────────────────────────────────────────────────────
hr
PROFILE_CLI="$REPO_DIR/profiles/clawd-profile"
if [ -f "$PROFILE_CLI" ] && [ -x "$PROFILE_CLI" ]; then
  run_with_spinner claw "installing clawd-profile CLI" bash -c "
    # copy the CLI to a persistent location so it survives repo updates
    install -d \"\$HOME/.openclawd/bin\" 2>/dev/null || true
    install -m 0755 \"$PROFILE_CLI\" \"\$HOME/.openclawd/bin/clawd-profile\"
    # ensure ~/.local/bin is in PATH (add to shell rc if not)
    if [[ :\$PATH: != *:\"\$HOME/.local/bin\":* ]]; then
      mkdir -p \"\$HOME/.local/bin\"
      if [ -f \"\$HOME/.zshrc\" ] && ! grep -q 'export PATH=.*\.local/bin' \"\$HOME/.zshrc\" 2>/dev/null; then
        echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"  # openclawd' >> \"\$HOME/.zshrc\"
      fi
      if [ -f \"\$HOME/.bashrc\" ] && ! grep -q 'export PATH=.*\.local/bin' \"\$HOME/.bashrc\" 2>/dev/null; then
        echo 'export PATH=\"\$HOME/.local/bin:\$PATH\"  # openclawd' >> \"\$HOME/.bashrc\"
      fi
    fi
    mkdir -p \"\$HOME/.openclawd/profiles\"
    mkdir -p \"\$HOME/.local/bin\"
  "
  ok "clawd-profile installed to ~/.openclawd/bin/"
  info "try: clawd profile create default  (or: ~/.openclawd/bin/clawd-profile create default)"
else
  warn "clawd-profile not found at $PROFILE_CLI — profiles skipped"
fi

# ─── all done ─────────────────────────────────────────────────────
hr

# ── matrix rain success animation ─────────────────────────────────
if [ -t 1 ]; then
  printf "\n"
  for i in 1 2 3 4; do
    printf "  ${NEON}░▒▓█${CR}  ${MAGENTA}▓▒░${CR}  ${CYAN}█▓▒░${CR}  ${VIOLET}▒░▓█${CR}\n"
    sleep 0.08
  done
fi

printf "\n"
printf "          ${MAGENTA}▒▓█${CR} ${BOLD}${LOBSTER}openclawd online${CR} ${MAGENTA}█▓▒${CR}\n\n"

TS_HOST=""
if command -v tailscale >/dev/null 2>&1; then
  TS_HOST="$(tailscale status --json 2>/dev/null | grep -o '"DNSName":"[^"]*"' | head -1 | cut -d'"' -f4 | sed 's/\.$//')"
fi

cat <<EOF
  ${BOLD}${CYAN}openclawd stack${CR}
    ${GREY}├─${CR} ${MAGENTA}solana-clawd${CR}       cli             ${DIM}(npm global)${CR}
    ${GREY}├─${CR} ${MAGENTA}clawdrouter${CR}        model router    ${DIM}(\$OPENROUTER_API_KEY)${CR}
    ${GREY}├─${CR} ${MAGENTA}tailclawd${CR}          tailnet app     ${DIM}($TAILCLAWD_DIR)${CR}
    ${GREY}├─${CR} ${MAGENTA}@openclawd/wallet${CR}  wallet SDK      ${DIM}(Privy + Grok 4.20)${CR}
    ${GREY}├─${CR} ${MAGENTA}@openclawd/x402${CR}  agent payments  ${DIM}(USDC x402 protocol)${CR}
    ${GREY}└─${CR} ${MAGENTA}\$CLAWD${CR}             8cHz…pump      ${DIM}(solana mainnet)${CR}

  ${BOLD}Next steps${CR}
    ${CYAN}1.${CR} Edit env:       ${VIOLET}\$EDITOR $ENV_FILE${CR}
    ${CYAN}2.${CR} Tailnet login:  ${VIOLET}sudo tailscale up${CR}  ${DIM}(skip if already up)${CR}
    ${CYAN}3.${CR} Launch node:    ${VIOLET}cd $TAILCLAWD_DIR && npm run dev${CR}
    ${CYAN}4.${CR} Expose it:      ${VIOLET}tailscale serve --bg --https=443 http://127.0.0.1:3110${CR}
    ${CYAN}5.${CR} Pair device:    ${VIOLET}solana-clawd pair <CODE>${CR}
    ${CYAN}6.${CR} Mint agent:     ${VIOLET}solana-clawd mint${CR}
    ${CYAN}7.${CR} Status:         ${VIOLET}solana-clawd status${CR}
    ${CYAN}8.${CR} Try examples:   ${VIOLET}cd \$REPO_DIR && npx tsx examples/lobster-trader.ts${CR}
    ${CYAN}9.${CR} Wallet demo:    ${VIOLET}cd \$REPO_DIR && npx tsx examples/clawd-wallet-demo.ts${CR}

EOF

if [ -n "$TS_HOST" ]; then
  printf "  ${DIM}Your tailnet host:${CR} ${NEON}https://${TS_HOST}${CR}\n\n"
fi

cat <<EOF
  ${DIM}Docs:${CR}     ${CYAN}$SOLANA_CLAWD_BASE_URL${CR}
  ${DIM}Monorepo:${CR} ${CYAN}$OPENCLAWD_REPO${CR}
  ${DIM}Tailscale:${CR} ${CYAN}https://tailscale.com/kb/1242/tailscale-serve${CR}

EOF
printf "  ${LOBSTER}🦞${CR} ${BOLD}welcome to the claw${CR} ${LOBSTER}🦞${CR}\n\n"
