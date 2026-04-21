# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# Enable pnpm via corepack
RUN corepack enable

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile=false

COPY tsconfig.json ./
COPY src/ src/
COPY SOUL_X.md ./
RUN pnpm build

# ── Production stage ───────────────────────────────────────────────────────────
FROM node:20-alpine

LABEL org.opencontainers.image.title="Clawd X Bot"
LABEL org.opencontainers.image.description="@clawddevs — solana-clawd soul agent for X. Autonomous posts, /imagine /art /video /x."

WORKDIR /app

RUN corepack enable
RUN addgroup -S bot && adduser -S bot -G bot

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile=false && pnpm store prune

COPY --from=build /app/dist dist/
COPY SOUL_X.md ./

# Persistent state directory (mount a volume here on Fly)
RUN mkdir -p /app/data && chown -R bot:bot /app/data /app

EXPOSE 8080

USER bot

ENV NODE_ENV=production
ENV PORT=8080
ENV STATE_FILE=/app/data/state.json

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
