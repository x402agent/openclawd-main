#!/usr/bin/env bash
set -euo pipefail

if [[ -f ".env.deploy" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.deploy
  set +a
fi

if ! command -v bun >/dev/null 2>&1; then
  echo "Error: bun is required but not installed." >&2
  exit 1
fi

if [[ -z "${CONVEX_DEPLOY_KEY:-}" ]]; then
  echo "Error: CONVEX_DEPLOY_KEY is not set." >&2
  exit 1
fi

if [[ -z "${CONVEX_SITE_URL:-}" ]]; then
  echo "Error: CONVEX_SITE_URL is not set." >&2
  exit 1
fi

if [[ -z "${VITE_CONVEX_URL:-}" ]]; then
  echo "Error: VITE_CONVEX_URL is not set." >&2
  exit 1
fi

if [[ -z "${VITE_CONVEX_SITE_URL:-}" ]]; then
  echo "Error: VITE_CONVEX_SITE_URL is not set." >&2
  exit 1
fi

if [[ -z "${SITE_URL:-}" ]]; then
  echo "Error: SITE_URL is not set." >&2
  exit 1
fi

DEPLOY_TARGET="${DEPLOY_TARGET:-}"
NITRO_PRESET="${NITRO_PRESET:-netlify}"

if [[ -z "$DEPLOY_TARGET" ]]; then
  case "$NITRO_PRESET" in
    netlify) DEPLOY_TARGET="netlify" ;;
    node-server) DEPLOY_TARGET="railway" ;;
    *) DEPLOY_TARGET="build-only" ;;
  esac
fi

if [[ -z "${VITE_APP_BUILD_SHA:-}" ]]; then
  if command -v git >/dev/null 2>&1; then
    VITE_APP_BUILD_SHA="$(git rev-parse --short HEAD)"
    export VITE_APP_BUILD_SHA
    echo "VITE_APP_BUILD_SHA not set; using git SHA: ${VITE_APP_BUILD_SHA}"
  else
    echo "Error: VITE_APP_BUILD_SHA is not set and git is unavailable to infer it." >&2
    exit 1
  fi
fi

echo "==> Installing dependencies"
bun install --frozen-lockfile

echo "==> Deploying Convex"
echo "==> Stamping Convex build metadata"
bunx convex env set APP_BUILD_SHA "$VITE_APP_BUILD_SHA" --prod
bunx convex env set APP_DEPLOYED_AT "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" --prod

echo "==> Deploying Convex functions"
bun run convex:deploy

echo "==> Verifying Convex contract"
bun run verify:convex-contract -- --prod

case "$DEPLOY_TARGET" in
  netlify)
    echo "==> Building Netlify artifact"
    export NITRO_PRESET=netlify
    bun run build:netlify

    if command -v netlify >/dev/null 2>&1 && [[ -n "${NETLIFY_AUTH_TOKEN:-}" && -n "${NETLIFY_SITE_ID:-}" ]]; then
      echo "==> Deploying frontend to Netlify"
      netlify deploy --dir=dist --prod --site="$NETLIFY_SITE_ID" --auth="$NETLIFY_AUTH_TOKEN"
    else
      echo "==> Netlify artifact ready in dist/"
      echo "Set NETLIFY_AUTH_TOKEN + NETLIFY_SITE_ID and install the Netlify CLI to upload automatically."
    fi
    ;;
  railway)
    echo "==> Building Railway artifact"
    export NITRO_PRESET=node-server
    bun run build

    if command -v railway >/dev/null 2>&1; then
      echo "==> Deploying frontend to Railway"
      railway up --detach
    else
      echo "==> Railway artifact ready in .output/"
      echo "Install the Railway CLI and link the service to upload automatically."
    fi
    ;;
  build-only)
    echo "==> Building web app"
    bun run build
    echo "==> Build artifacts ready. No frontend deploy target was selected."
    ;;
  *)
    echo "Error: unsupported DEPLOY_TARGET '$DEPLOY_TARGET'." >&2
    exit 1
    ;;
esac

echo "Deploy complete."
