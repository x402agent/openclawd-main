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
NITRO_PRESET="${NITRO_PRESET:-vercel}"

if [[ -z "$DEPLOY_TARGET" ]]; then
  case "$NITRO_PRESET" in
    vercel) DEPLOY_TARGET="vercel" ;;
    node-server) DEPLOY_TARGET="fly" ;;
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
  vercel)
    echo "==> Building Vercel artifact"
    export NITRO_PRESET=vercel
    bun run build:vercel

    if command -v vercel >/dev/null 2>&1 && [[ -n "${VERCEL_TOKEN:-}" ]]; then
      echo "==> Deploying frontend to Vercel"
      vercel deploy --prod --token="$VERCEL_TOKEN" ${VERCEL_SCOPE:+--scope="$VERCEL_SCOPE"} ${VERCEL_PROJECT_NAME:+--name="$VERCEL_PROJECT_NAME"}
    else
      echo "==> Vercel artifact ready in .vercel/output/"
      echo "Set VERCEL_TOKEN (and optionally VERCEL_SCOPE/VERCEL_PROJECT_NAME) and install the Vercel CLI to upload automatically."
    fi
    ;;
  fly)
    echo "==> Building Fly artifact"
    export NITRO_PRESET=node-server
    bun run build:fly

    if command -v flyctl >/dev/null 2>&1 && [[ -n "${FLY_API_TOKEN:-}" ]]; then
      echo "==> Deploying frontend to Fly"
      flyctl deploy --remote-only ${FLY_APP:+--app "$FLY_APP"}
    else
      echo "==> Fly artifact ready in .output/"
      echo "Install flyctl, set FLY_API_TOKEN (and FLY_APP), and run 'flyctl deploy' to upload."
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
