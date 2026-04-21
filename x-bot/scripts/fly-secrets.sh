#!/usr/bin/env bash
# Push every secret from .env to Fly.io as a secret.
#
# Only pushes KEYS that should be secrets (creds, API keys). Plain config
# (model names, intervals) lives in fly.toml [env] instead — that way you
# can change cadence without a secret rotation.
#
# Usage:
#   cd x-bot
#   ./scripts/fly-secrets.sh                  # push all SECRET_KEYS from .env
#   ./scripts/fly-secrets.sh --dry-run        # print what would be set
#   ./scripts/fly-secrets.sh KEY1 KEY2        # push only these keys

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v fly >/dev/null 2>&1; then
    echo "error: fly CLI not found. install from https://fly.io/docs/flyctl/install/" >&2
    exit 1
fi

if [ ! -f .env ]; then
    echo "error: .env not found in $(pwd)" >&2
    exit 1
fi

# Keys that should be uploaded as Fly secrets. Everything else is non-secret config.
SECRET_KEYS=(
    CONSUMER_API_KEY
    CONSUMER_API_SECRET
    CONSUMER_BEARER_TOKEN
    CONSUMER_ACCESS_TOKEN
    CONSUMER_ACCESS_SECRET
    TWITTER_CLIENT_ID
    TWITTER_CLIENT_SECRET
    OPENAI_API_KEY
    ANTHROPIC_API_KEY
    XAI_API_KEY
    FAL_API_KEY
    HELIUS_RPC_URL
    CLAWD_MINT
)

DRY_RUN=false
if [ "${1:-}" = "--dry-run" ]; then
    DRY_RUN=true
    shift
fi

# If args passed, only push those keys
if [ $# -gt 0 ]; then
    SECRET_KEYS=("$@")
fi

args=()
for key in "${SECRET_KEYS[@]}"; do
    # Grep the key=... line, strip the KEY= prefix, keep the rest as-is.
    line=$(grep -E "^${key}=" .env || true)
    if [ -z "$line" ]; then
        echo "  skip $key (not in .env)"
        continue
    fi
    value="${line#${key}=}"
    if [ -z "$value" ]; then
        echo "  skip $key (empty)"
        continue
    fi
    args+=("$key=$value")
    echo "  queued $key"
done

if [ ${#args[@]} -eq 0 ]; then
    echo "nothing to push."
    exit 0
fi

if $DRY_RUN; then
    echo ""
    echo "dry-run — would run (single batched call, one restart):"
    echo "  fly secrets set \\"
    for a in "${args[@]}"; do echo "    ${a%%=*}=<redacted> \\"; done
    echo ""
    exit 0
fi

echo ""
echo "pushing ${#args[@]} secrets to Fly..."
fly secrets set "${args[@]}"
echo "done. fly will restart the app to pick up the new secrets."
