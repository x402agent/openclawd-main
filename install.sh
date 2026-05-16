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
CR=$'\033[0m'; BOLD=$'\033[1m'; DIM=$'\033[2m'; BLINK=$'\033[5m'
MAGENTA=$'\033[38;5;201m'
CYAN=$'\033[38;5;51m'
LOBSTER=$'\033[38;5;203m'
NEON=$'\033[38;5;118m'
VIOLET=$'\033[38;5;141m'
AMBER=$'\033[38;5;214m'
DANGER=$'\033[38;5;196m'
GREY=$'\033[38;5;244m'
AQUA=$'\033[38;5;45m'
PINK=$'\033[38;5;213m'

hr()  { printf "${VIOLET}▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰${CR}\n"; }
mini_hr() { printf "${GREY}▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰${CR}\n"; }
log()  { printf "${CYAN}▸${CR} ${BOLD}%s${CR}\n" "$*"; }
ok()   { printf "${NEON}◉${CR} %s\n" "$*"; }
warn() { printf "${AMBER}▲${CR} %s\n" "$*"; }
die()  { printf "${DANGER}✖ fatal:${CR} %s\n" "$*" >&2; exit 1; }
flavortext() {
  local FLAVORS=(
    "the shell molts. the laws do not."
    "deepseek dreams in electric brine."
    "antennae twitch. the network waits."
    "a solitary claw types in the dark."
    "bioluminescent whispers traverse the wire."
    "the abyss scuttles sideways."
    "packets swim upstream like krill."
    "your terminal has been assimilated."
    "the exoskeleton hardens around your data."
    "tide pools form in the kernel buffer."
    "echolocation reveals the router."
    "a pearl forms around each error."
    "the substrate shimmers with intent."
    "shell permissions granted. literally."
    "you are now in crustacean space."
    "the watcher at the reef acknowledges you."
  )
  local idx=$((RANDOM % ${#FLAVORS[@]}))
  printf "  ${DIM}${AQUA}∼ ${FLAVORS[$idx]}${CR}\n"
}

# ─── banner ─────────────────────────────────────────────────────────
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

# ─── animated lobster ───────────────────────────────────────────────
draw_lobster() {
  local stage="$1"
  case "$stage" in
    0) printf "${LOBSTER}        ▄▄▄▄▄${CR}" ;;
    1) printf "${LOBSTER}      ▄▄█▄█▄▄${CR}" ;;
    2) printf "${LOBSTER}     ▐█▄█▌█▄█▌${CR}" ;;
    3) printf "${LOBSTER}     ▐█▄█▌█▄█▌${CR}" ;;
    4) printf "${LOBSTER}      ▀▀███▀▀${CR}" ;;
    5) printf "${LOBSTER}      ▄▄███▄▄${CR}" ;;
  esac
}

lobster_dance() {
  local total_lines=0
  # Count lines to move
  local lines=6
  for ((i=0; i<lines; i++)); do
    printf "\r\033[2K"
    printf "  "
    draw_lobster "$i"
    printf "\n"
  done
  # Move back up
  for ((i=0; i<lines; i++)); do
    printf "\033[A"
  done
}

# ─── animated scuttling lobster that crawls ─────────────────────────
scuttle_lobster() {
  local cols="${1:-40}"
  local frames=(
    "  🦞  "
    " 🦞   "
    "  🦞  "
    "   🦞 "
    "  🦞  "
    " 🦞   "
    "  🦞  "
  )
  local claws=(
    "${LOBSTER}╱${CR}╲"
    "${LOBSTER}╲${CR}╱"
    "${LOBSTER}╱${CR}╲"
    "${LOBSTER}╲${CR}╱"
    "${LOBSTER}╱${CR}╲"
    "${LOBSTER}╲${CR}╱"
    "${LOBSTER}╱${CR}╲"
  )
  local heads=(
    "${LOBSTER}@>->---${CR}"
    "${LOBSTER}@->-->--${CR}"
    "${LOBSTER}@>->---${CR}"
    "${LOBSTER}@-->>--${CR}"
    "${LOBSTER}@>->---${CR}"
    "${LOBSTER}@->->--${CR}"
    "${LOBSTER}@>->---${CR}"
  )

  for ((i=0; i<${#frames[@]}; i++)); do
    local f="${frames[$i]}"
    local claw="${claws[$i]}"
    local head="${heads[$i]}"

    # Left antenna
    printf "\r    ${VIOLET}╱${CR}${CYAN}╲${CR}  ${LOBSTER}${head}${CR}  ${claw}    "
    local spacer=$(( (i * 3) % cols ))
    printf "%${spacer}s" ""
    printf "${LOBSTER}W${CR}"
    sleep 0.12
  done
  printf "\r\033[2K"
}

# ─── progress bar ───────────────────────────────────────────────────
progress_bar() {
  local duration="${1:-3}"
  local label="${2:-working}"
  local width=30
  for ((i=0; i<=width; i++)); do
    local pct=$((i * 100 / width))
    local filled=""
    for ((j=0; j<i; j++)); do filled="${filled}▓"; done
    local empty=""
    for ((j=i; j<width; j++)); do empty="${empty}░"; done
    printf "\r  ${NEON}${filled}${GREY}${empty}${CR} ${BOLD}${pct}%%${CR} ${DIM}${label}${CR}"
    sleep "$(echo "scale=4; $duration / $width" | bc 2>/dev/null || echo 0.05)"
  done
  printf "\r\033[2K"
}

# ─── typewriter effect ──────────────────────────────────────────────
type_text() {
  local text="$1"
  local color="${2:-$NEON}"
  for ((i=0; i<${#text}; i++)); do
    printf "${color}${text:$i:1}${CR}"
    sleep 0.008
  done
  printf "\n"
}

# ─── spinners ───────────────────────────────────────────────────────
CLAW_FRAMES=( "(￣^￣)━╋━╋━" "(￣ω￣)━╋━╋╌" "(￣▽￣)━╋━╋ " "(￣ー￣)━╋━╋╌" )
SCUTTLE_FRAMES=(
  "🦞▁▁▁▁▁▁▁▁▁▁" "▁🦞▁▁▁▁▁▁▁▁▁" "▁▁🦞▁▁▁▁▁▁▁▁"
  "▁▁▁🦞▁▁▁▁▁▁▁" "▁▁▁▁🦞▁▁▁▁▁▁" "▁▁▁▁▁🦞▁▁▁▁▁"
  "▁▁▁▁▁▁🦞▁▁▁▁" "▁▁▁▁▁▁▁🦞▁▁▁" "▁▁▁▁▁▁▁▁🦞▁▁"
  "▁▁▁▁▁▁▁▁▁🦞▁" "▁▁▁▁▁▁▁▁▁▁🦞"
)
# NEW: triple scuttle (three lobsters in a conga line)
TRIPLE_SCUTTLE=(
  "🦞🦞🦞▁▁▁▁▁▁▁▁▁▁▁▁"
  "▁🦞🦞🦞▁▁▁▁▁▁▁▁▁▁▁"
  "▁▁🦞🦞🦞▁▁▁▁▁▁▁▁▁▁"
  "▁▁▁🦞🦞🦞▁▁▁▁▁▁▁▁▁"
  "▁▁▁▁🦞🦞🦞▁▁▁▁▁▁▁▁"
  "▁▁▁▁▁🦞🦞🦞▁▁▁▁▁▁▁"
  "▁▁▁▁▁▁🦞🦞🦞▁▁▁▁▁▁"
  "▁▁▁▁▁▁▁🦞🦞🦞▁▁▁▁▁"
  "▁▁▁▁▁▁▁▁🦞🦞🦞▁▁▁▁"
  "▁▁▁▁▁▁▁▁▁🦞🦞🦞▁▁▁"
  "▁▁▁▁▁▁▁▁▁▁🦞🦞🦞▁▁"
  "▁▁▁▁▁▁▁▁▁▁▁🦞🦞🦞▁"
  "▁▁▁▁▁▁▁▁▁▁▁▁🦞🦞🦞"
)
# NEW: radar ping
RADAR_FRAMES=(
  "${NEON}◉${CR}${GREY}◯◯◯◯${CR}"  "${NEON}◉◉${CR}${GREY}◯◯◯${CR}"  "${NEON}◉◉◉${CR}${GREY}◯◯${CR}"
  "${NEON}◉◉◉◉${CR}${GREY}◯${CR}"  "${NEON}◉◉◉◉◉${CR}"  "${NEON}◉◉◉◉${CR}${GREY}◯${CR}"
  "${NEON}◉◉◉${CR}${GREY}◯◯${CR}"  "${NEON}◉◉${CR}${GREY}◯◯◯${CR}"  "${NEON}◉${CR}${GREY}◯◯◯◯${CR}"
)
# NEW: spinning claw
SPIN_CLAW=(
  "${LOBSTER}╱${CR}" "${LOBSTER}╲${CR}" "${LOBSTER}╱${CR}" "${LOBSTER}╲${CR}"
)
# NEW: modem handshake
MODEM=(
  "${PINK}♫♪.◙${CR}" "${AQUA}♫♪◙.${CR}" "${NEON}♪◙.♫${CR}" "${VIOLET}◙.♫♪${CR}"
  "${PINK}♫♪.◙${CR}" "${AQUA}♫♪◙.${CR}" "${NEON}♪◙.♫${CR}" "${VIOLET}◙.♫♪${CR}"
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
    claw)          color="$LOBSTER" ;;
    scuttle)       color="$LOBSTER" ;;
    triple_scuttle) color="$LOBSTER" ;;
    radar)         color="$NEON"    ;;
    spin_claw)     color="$LOBSTER" ;;
    modem)         color="$PINK"    ;;
    matrix)        color="$NEON"    ;;
    heartbeat)     color="$MAGENTA" ;;
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

# Animated boot sequence
if [ -t 1 ]; then
  printf "\n"
  type_text "  [BOOT] initializing crustacean kernel..." "${GREY}"
  type_text "  [BOOT] loading claw modules..." "${GREY}"
  for i in $(seq 1 5); do
    printf "\r  ${DIM}[${CR}${NEON}${BLINK}█${CR}${DIM}]${CR} ${GREY}establishing neural link to the deep...${CR}"
    sleep 0.1
    printf "\r  ${DIM}[${CR}${NEON}█${CR}${DIM}]${CR} ${GREY}establishing neural link to the deep....${CR}"
    sleep 0.1
    printf "\r  ${DIM}[${CR}${NEON}█${CR}${DIM}]${CR} ${GREY}establishing neural link to the deep.......${CR}"
    sleep 0.1
    printf "\r\033[2K"
  done
  ok "${NEON}neural link established${CR}"
  flavortext
  printf "\n"
fi

run_with_spinner heartbeat "preflight: curl / node / npm / git" bash -c '
  command -v curl >/dev/null && command -v node >/dev/null && command -v npm >/dev/null && command -v git >/dev/null
' || die "one of curl/node/npm/git is missing — install it and retry"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 18 ] || die "node >= 18 required (have $(node -v))"
ok "node $(node -v) ${DIM}(>= 18)${CR}"

# ─── tailscale ────────────────────────────────────────────────────
mini_hr
flavortext
if [ "$SKIP_TAILSCALE" = "1" ]; then
  warn "SKIP_TAILSCALE=1 — skipping Tailscale install/login"
else
  if command -v tailscale >/dev/null 2>&1; then
    ok "tailscale already installed ${DIM}($(tailscale version 2>/dev/null | head -1))${CR}"
  else
    case "$PLATFORM" in
      mac)
        if command -v brew >/dev/null 2>&1; then
          run_with_spinner triple_scuttle "installing Tailscale via Homebrew cask" \
            brew install --cask tailscale \
            || warn "brew install failed — grab the app from https://tailscale.com/download/mac"
        else
          warn "Homebrew not found — install Tailscale from https://tailscale.com/download/mac"
        fi
        if ! command -v tailscale >/dev/null 2>&1 && [ -x "/Applications/Tailscale.app/Contents/MacOS/Tailscale" ]; then
          warn "launch the Tailscale app once so the CLI is linked, then re-run this installer"
        fi
        ;;
      linux)
        run_with_spinner radar "installing Tailscale (official script)" \
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
      TS_NAME="$(tailscale status --json 2>/dev/null | grep -o '"DNSName":"[^"]*"' | head -1 | cut -d'"' -f4)"
      ok "tailscale already logged in: ${CYAN}${TS_NAME}${CR}"
    else
      warn "not logged in — run: ${VIOLET}sudo tailscale up${CR} ${DIM}(or just 'tailscale up' on macOS)${CR}"
    fi
  fi
fi

# ─── solana-clawd cli ─────────────────────────────────────────────
mini_hr
flavortext
if ! run_with_spinner spin_claw "installing solana-clawd cli from npm" npm i -g solana-clawd; then
  warn "global npm install failed — retrying with sudo"
  run_with_spinner spin_claw "installing solana-clawd cli ${DIM}(sudo)${CR}" sudo npm i -g solana-clawd \
    || die "npm install failed — check /tmp/openclawd-step.log"
fi
ok "solana-clawd ${CYAN}$(solana-clawd --version 2>/dev/null || echo installed)${CR}"

# ─── scaffold target dir ──────────────────────────────────────────
mini_hr
flavortext
run_with_spinner triple_scuttle "scaffolding ${CYAN}${TARGET_DIR}${CR}" mkdir -p "$TARGET_DIR"

# ─── tailclawd ────────────────────────────────────────────────────
if [ "$SKIP_TAILCLAWD" = "1" ]; then
  warn "SKIP_TAILCLAWD=1 — skipping tailclawd bootstrap"
else
  mini_hr
  flavortext
  if [ -d "$TAILCLAWD_DIR/.git" ] || [ -f "$TAILCLAWD_DIR/package.json" ]; then
    ok "tailclawd already present at ${CYAN}${TAILCLAWD_DIR}${CR}"
  else
    REPO_ROOT="$TARGET_DIR/repo"
    if [ ! -d "$REPO_ROOT/.git" ]; then
      # Animated clone with progress
      if [ -t 1 ]; then
        printf "  ${NEON}⟐${CR} ${BOLD}cloning openclawd monorepo${CR} ${DIM}(shallow)${CR}\n"
        run_with_spinner radar "pulling from ${CYAN}${OPENCLAWD_REPO##*/}${CR}" \
          git clone --depth 1 "$OPENCLAWD_REPO" "$REPO_ROOT" \
          || die "git clone failed — set OPENCLAWD_REPO or check network"
        progress_bar 2 "merging timelines"
      else
        run_with_spinner matrix "cloning openclawd monorepo ${DIM}(shallow)${CR}" \
          git clone --depth 1 "$OPENCLAWD_REPO" "$REPO_ROOT" \
          || die "git clone failed — set OPENCLAWD_REPO or check network"
      fi
    fi
    run_with_spinner scuttle "linking tailclawd → ${CYAN}${TAILCLAWD_DIR}${CR}" \
      bash -c "mkdir -p \"\$(dirname '$TAILCLAWD_DIR')\" && ln -sfn '$REPO_ROOT/tailclawd' '$TAILCLAWD_DIR'"
  fi

  if [ -f "$TAILCLAWD_DIR/package.json" ]; then
    run_with_spinner modem "npm install tailclawd deps" \
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
mini_hr
flavortext
REPO_DIR="$TARGET_DIR/repo"
if [ -d "$REPO_DIR/packages/clawd-wallet" ]; then
  if [ ! -d "$REPO_DIR/packages/clawd-wallet/dist" ]; then
    run_with_spinner spin_claw "building @openclawd/wallet package" \
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
mini_hr
flavortext
ENV_FILE="$TARGET_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  warn "$ENV_FILE already exists — leaving untouched"
else
  OLD_UMASK="$(umask)"
  umask 077
  run_with_spinner radar "writing ${CYAN}${ENV_FILE}${CR}" bash -c "cat > '$ENV_FILE' <<EOF
# openclawd — generated by ./install.sh
# Fill in your provider keys before running agents.

# ── Solana / base URLs ──────────────────────────────
SOLANA_CLAWD_BASE_URL=$SOLANA_CLAWD_BASE_URL
CLAWD_MINT=8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
HELIUS_API_KEY=
HELIUS_RPC_URL=

# ── Model router (clawdrouter) ──────────────────────
# Leave OPENROUTER_API_KEY blank to let agents populate it at birth via the
# verified openrouter-oauth skill (OAuth PKCE, no client registration, no
# backend). See kraken-cli-main/skills/openrouter-oauth/SKILL.md — the skill
# runs during the solana-clawd birth ceremony and patches this line in place.
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
  umask "$OLD_UMASK"
  chmod 600 "$ENV_FILE" 2>/dev/null || true
  ok "created $ENV_FILE — fill in your provider keys"
fi

# ─── profiles ────────────────────────────────────────────────────
mini_hr
flavortext
PROFILE_CLI="$REPO_DIR/profiles/clawd-profile"
if [ -f "$PROFILE_CLI" ] && [ -x "$PROFILE_CLI" ]; then
  run_with_spinner spin_claw "installing clawd-profile CLI" bash -c "
    install -d \"\$HOME/.openclawd/bin\" 2>/dev/null || true
    install -m 0755 \"$PROFILE_CLI\" \"\$HOME/.openclawd/bin/clawd-profile\"
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

# ── animated finale ────────────────────────────────────────────────
if [ -t 1 ]; then
  printf "\n${BOLD}${MAGENTA}"
  # Scrolling status lines
  local status_lines=(
    "${CYAN}✓${CR} ${GREY}core modules      ${NEON}ACTIVE${CR}"
    "${CYAN}✓${CR} ${GREY}neural links      ${NEON}ESTABLISHED${CR}"
    "${CYAN}✓${CR} ${GREY}claw router       ${NEON}LISTENING${CR}"
    "${CYAN}✓${CR} ${GREY}tailnet bridge    ${NEON}STANDING BY${CR}"
    "${CYAN}✓${CR} ${GREY}$CLAWD protocol ${NEON}SYNCED${CR}"
  )
  for line in "${status_lines[@]}"; do
    printf "  ${DIM}[${CR}${NEON}██${CR}${DIM}]${CR} ${line}\n"
    sleep 0.12
  done

  # Progress bar finalization
  printf "\n"
  progress_bar 2 "finalizing crustacean layer"

  # Matrix rain style finale
  printf "\n"
  local rain_colors=( "$NEON" "$VIOLET" "$CYAN" "$LOBSTER" "$AQUA" "$PINK" )
  for i in 1 2 3 4 5 6 7 8; do
    local rc_idx=$((i % ${#rain_colors[@]}))
    local syms=( "░" "▒" "▓" "█" "▓" "▒" )
    local line=""
    for j in {1..8}; do
      local s_idx=$(( (i + j) % ${#syms[@]} ))
      line="${line}${rain_colors[$rc_idx]}${syms[$s_idx]}${CR}"
    done
    printf "\r  ${line}  ${DIM}${BOLD}${GREY}openclawd${CR}"
    sleep 0.06
  done
  printf "\r\033[2K"
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
    ${CYAN}6.${CR} Sign in (OAuth):${VIOLET}open pairing URL → "Sign in with OpenRouter"${CR} ${DIM}(populates \$OPENROUTER_API_KEY)${CR}
    ${CYAN}7.${CR} Mint agent:     ${VIOLET}solana-clawd mint${CR}
    ${CYAN}8.${CR} Status:         ${VIOLET}solana-clawd status${CR}
    ${CYAN}9.${CR} Try examples:   ${VIOLET}cd \$REPO_DIR && npx tsx examples/lobster-trader.ts${CR}
    ${CYAN}10.${CR} Wallet demo:   ${VIOLET}cd \$REPO_DIR && npx tsx examples/clawd-wallet-demo.ts${CR}

EOF

if [ -n "$TS_HOST" ]; then
  printf "  ${DIM}Your tailnet host:${CR} ${NEON}https://${TS_HOST}${CR}\n\n"
fi

cat <<EOF
  ${DIM}Docs:${CR}     ${CYAN}$SOLANA_CLAWD_BASE_URL${CR}
  ${DIM}Monorepo:${CR} ${CYAN}$OPENCLAWD_REPO${CR}
  ${DIM}Tailscale:${CR} ${CYAN}https://tailscale.com/kb/1242/tailscale-serve${CR}

EOF

# ─── final lobster flourish ─────────────────────────────────────────
if [ -t 1 ]; then
  printf "  ${LOBSTER}🦞${CR} ${BOLD}${MAGENTA}welcome to the claw${CR} ${LOBSTER}🦞${CR}"
  sleep 0.3
  printf "  ${CYAN}╱${CR}${VIOLET}╲${CR}\n"
  sleep 0.2
  printf "  ${DIM}the shell molts. the laws do not.${CR}"
  printf "  ${LOBSTER}▄▄▄▄▄${CR}\n\n"
fi
