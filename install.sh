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
#  What it does:
#   1. Verifies node >= 18, git, npm.
#   2. Installs the public `solana-clawd` CLI globally from npm.
#   3. Writes a scaffolded ~/.openclawd/.env with sensible defaults.
#   4. Prints pair / mint / status next steps.
#
#  Self-contained: does NOT require access to the openclawd monorepo.
#  Full monorepo (if you have access):
#     gh repo clone x402agent/openclawd ~/.openclawd
#

set -euo pipefail

TARGET_DIR="${OPENCLAWD_DIR:-$HOME/.openclawd}"
SOLANA_CLAWD_BASE_URL="${SOLANA_CLAWD_BASE_URL:-https://solanaclawd.com}"

# ─── cyberpunk palette ────────────────────────────────────────────
# neon magenta / cyan / red-orange lobster / electric green
CR=$'\033[0m'; BOLD=$'\033[1m'; DIM=$'\033[2m'
MAGENTA=$'\033[38;5;201m'   # neon pink
CYAN=$'\033[38;5;51m'       # electric cyan
LOBSTER=$'\033[38;5;203m'   # claw red-orange
NEON=$'\033[38;5;118m'      # matrix green
VIOLET=$'\033[38;5;141m'
AMBER=$'\033[38;5;214m'
DANGER=$'\033[38;5;196m'
GREY=$'\033[38;5;244m'

hr() { printf "${VIOLET}▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰${CR}\n"; }
log()  { printf "${CYAN}▸${CR} ${BOLD}%s${CR}\n" "$*"; }
ok()   { printf "${NEON}◉${CR} %s\n" "$*"; }
warn() { printf "${AMBER}▲${CR} %s\n" "$*"; }
die()  { printf "${DANGER}✖ fatal:${CR} %s\n" "$*" >&2; exit 1; }

# ─── openclawd cyberpunk lobster banner ───────────────────────────
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
  printf "          ║  ${VIOLET}[${NEON} one router ${VIOLET}·${NEON} one chain ${VIOLET}·${NEON} zero fluff ${VIOLET}]${MAGENTA}   ║\n"
  printf "          ║                                           ║\n"
  printf "          ╚═══════════════════════════════════════════╝\n"
  printf "${CR}\n"
  printf "          ${GREY}╭─ cyberpunk lobster edition ─────────────╮${CR}\n"
  printf "          ${GREY}│${CR}  ${LOBSTER}▒▒▒${CR} ${CYAN}solana${CR}  ${LOBSTER}▒▒${CR} ${MAGENTA}agents${CR}  ${LOBSTER}▒${CR} ${NEON}x402${CR}    ${GREY}│${CR}\n"
  printf "          ${GREY}╰─────────────────────────────────────────╯${CR}\n\n"
}

# ─── openclawd unicode spinner animations ─────────────────────────
# 4 custom cyberpunk spinners — no deps, raw bash.
#
#   claw       — snapping lobster claw
#   scuttle    — lobster walking along the seafloor
#   matrix     — neon rain columns
#   heartbeat  — solana block pulse
#
# Usage:
#   run_with_spinner <spinner_name> "label" command args...
#
# If stdout is not a TTY (piped / CI), falls back to a plain log line.

# claw frames: snapping cyberpunk claw
CLAW_FRAMES=( "(￣^￣)━╋━╋━" "(￣ω￣)━╋━╋╌" "(￣▽￣)━╋━╋ " "(￣ー￣)━╋━╋╌" )
# scuttle frames: lobster traveling left-to-right along a wire
SCUTTLE_FRAMES=(
  "🦞▁▁▁▁▁▁▁▁▁▁" "▁🦞▁▁▁▁▁▁▁▁▁" "▁▁🦞▁▁▁▁▁▁▁▁"
  "▁▁▁🦞▁▁▁▁▁▁▁" "▁▁▁▁🦞▁▁▁▁▁▁" "▁▁▁▁▁🦞▁▁▁▁▁"
  "▁▁▁▁▁▁🦞▁▁▁▁" "▁▁▁▁▁▁▁🦞▁▁▁" "▁▁▁▁▁▁▁▁🦞▁▁"
  "▁▁▁▁▁▁▁▁▁🦞▁" "▁▁▁▁▁▁▁▁▁▁🦞"
)
# matrix frames: neon rain columns
MATRIX_FRAMES=(
  "░▒▓█▓▒░" "▒▓█▓▒░▒" "▓█▓▒░▒▓" "█▓▒░▒▓█"
  "▓▒░▒▓█▓" "▒░▒▓█▓▒" "░▒▓█▓▒░"
)
# heartbeat frames: solana block pulse
HEART_FRAMES=( "◦·◦·◦" "●·◦·◦" "●●·◦·" "●●●·◦" "●●●●·" "●●●●●" "·●●●●" "··●●●" "···●●" "····●" "·····" )

_spinner_bg_pid=""
_spinner_cleanup() { [ -n "$_spinner_bg_pid" ] && kill "$_spinner_bg_pid" 2>/dev/null || true; printf "\r\033[2K"; }
trap _spinner_cleanup EXIT INT TERM

run_with_spinner() {
  local name="$1"; shift
  local label="$1"; shift

  # Non-interactive? Just log + run.
  if [ ! -t 1 ]; then
    log "$label"
    "$@"
    return $?
  fi

  # Gather frames by indirect reference (bash 3.2-compatible, no namerefs)
  local upper
  upper="$(printf '%s' "$name" | tr '[:lower:]' '[:upper:]')"
  local arr_name="${upper}_FRAMES"
  local frames_str
  eval "frames_str=\"\${${arr_name}[*]//\$'\n'/ }\""
  # Re-split into an indexed array we can iterate safely
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

# ─── preflight checks ─────────────────────────────────────────────
banner
hr

log "target dir     ${CYAN}${TARGET_DIR}${CR}"
log "base url       ${CYAN}${SOLANA_CLAWD_BASE_URL}${CR}"
log "arch / os      ${CYAN}$(uname -sm)${CR}"
hr

need() { command -v "$1" >/dev/null 2>&1 || die "missing required command: $1 — install it first"; }
run_with_spinner heartbeat "preflight: curl / node / npm / git present" bash -c '
  command -v curl >/dev/null && command -v node >/dev/null && command -v npm >/dev/null && command -v git >/dev/null
' || die "one of curl/node/npm/git is missing — install the missing tool and retry"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || die "node >= 18 required (have $(node -v))"
ok "node $(node -v) ${DIM}(>= 18)${CR}"

# ─── install solana-clawd cli ─────────────────────────────────────
hr
if ! run_with_spinner claw "installing solana-clawd cli from npm" npm i -g solana-clawd; then
  warn "global npm install failed — retrying with sudo"
  run_with_spinner claw "installing solana-clawd cli ${DIM}(sudo)${CR}" sudo npm i -g solana-clawd \
    || die "npm install failed — check /tmp/openclawd-step.log"
fi
ok "solana-clawd ${CYAN}$(solana-clawd --version 2>/dev/null || echo installed)${CR}"

# ─── scaffold ~/.openclawd/.env ───────────────────────────────────
hr
run_with_spinner scuttle "scaffolding ${CYAN}${TARGET_DIR}${CR}" mkdir -p "$TARGET_DIR"

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

# ── Model router ────────────────────────────────────
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
TAILSCALE_AUTH_KEY=
EOF"
  ok "created $ENV_FILE — fill in your provider keys"
fi

# ─── all done ─────────────────────────────────────────────────────
hr
printf "\n"
printf "          ${MAGENTA}▒▓█${CR} ${BOLD}${LOBSTER}openclawd online${CR} ${MAGENTA}█▓▒${CR}\n\n"
cat <<EOF
  ${BOLD}Next steps${CR}
    ${CYAN}1.${CR} Edit env:     ${VIOLET}\$EDITOR $ENV_FILE${CR}
    ${CYAN}2.${CR} Pair device:  ${VIOLET}solana-clawd pair <CODE>${CR}
    ${CYAN}3.${CR} Mint agent:   ${VIOLET}solana-clawd mint${CR}
    ${CYAN}4.${CR} Status:       ${VIOLET}solana-clawd status${CR}

  ${DIM}Optional — full monorepo (requires repo access):${CR}
    ${GREY}gh repo clone x402agent/openclawd $TARGET_DIR/repo${CR}

  ${DIM}Docs & website:${CR} ${CYAN}$SOLANA_CLAWD_BASE_URL${CR}

EOF
printf "  ${LOBSTER}🦞${CR} ${BOLD}welcome to the claw${CR} ${LOBSTER}🦞${CR}\n\n"
