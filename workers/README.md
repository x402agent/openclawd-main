# Cloudflare Workers

Edge worker implementations for the OpenClawd ecosystem.

## Projects

### agent-wallet

Agent wallet management worker for secure key operations.

### email-worker

Email notification and alert worker.

### pumpfun-mcp-worker

Pump.fun MCP integration worker for token scanning and trading.

## Deployment

```bash
cd workers/agent-wallet
npx wrangler deploy
```

## Configuration

See individual worker directories for required environment variables.

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)