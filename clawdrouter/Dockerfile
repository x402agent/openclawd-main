# ClawdRouter — Fly.io Deployment Image
# Solana-native LLM router with API key auth + smart routing
FROM node:22-slim AS base
WORKDIR /app

# Install deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy prebuilt dist only (src excluded by .dockerignore)
COPY dist/ dist/

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:8402/health').then(r=>{if(!r.ok)throw 1}).catch(()=>process.exit(1))"

# Default port
ENV CLAWDROUTER_PORT=8402
ENV CLAWDROUTER_HOSTED=true
ENV NODE_ENV=production

EXPOSE 8402

CMD ["node", "dist/index.js"]
