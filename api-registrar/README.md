# 🐾 OpenClawd API Registrar

API Key registration system for the OpenClawd ecosystem — verifies Solana wallet ownership via X (Twitter) verification and issues `clawd_sk_` API keys compatible with ClawdRouter.

Part of the ACP (Agent Communication Protocol) registry system with protocol 8004 integration.

## Flow

1. **Connect Wallet** - User connects their Solana wallet (Phantom, etc.)
2. **Generate Code** - System creates a unique `clawdXXXX` verification code
3. **Tweet Verification** - User tweets the code on X (Twitter)
4. **Paste URL** - User submits their tweet URL
5. **Get API Key** - System verifies and issues `clawd_sk_` API key

## Quick Start

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env

# Start the server
pnpm dev

# Build for production
pnpm build
```

## Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host/db
PORT=3001
CORS_ORIGIN=http://localhost:5173
X_API_BEARER_TOKEN=your_x_api_token
```

## API Endpoints

### POST /api/register/generate-code
Generate verification code for wallet.

```json
{
  "walletAddress": "SolanaWalletAddress...",
  "signature": "base64Signature"
}
```

Response:
```json
{
  "success": true,
  "verificationCode": "clawd1a2b3c4d",
  "expiresAt": "2024-01-01T00:30:00Z",
  "userId": 123
}
```

### POST /api/register/verify-tweet
Verify tweet and get API key.

```json
{
  "walletAddress": "SolanaWalletAddress...",
  "verificationCode": "clawd1a2b3c4d",
  "tweetUrl": "https://x.com/username/status/123456789"
}
```

Response:
```json
{
  "verified": true,
  "apiKey": "clawd_sk_...",
  "keyPrefix": "clawd_sk_01ab...",
  "expiresAt": "2025-01-01T00:00:00Z"
}
```

### GET /api/register/keys/:walletAddress
List all API keys for a wallet.

### DELETE /api/register/keys/:keyId
Revoke an API key.

## Database

Uses Drizzle ORM with PostgreSQL. Run migrations:

```bash
npx drizzle-kit push
```

## Integration with ClawdRouter

API keys generated here can be validated by ClawdRouter using the `clawd_sk_` prefix. See `clawdrouter/src/auth/api-keys.ts` for validation logic.

## ACP Registry Integration

This service is registered in the OpenClawd ACP registry (`acp_registry/registry.json`) as part of the infrastructure layer:

```json
{
  "id": "api-registrar",
  "name": "OpenClawd API Registrar",
  "category": "infrastructure",
  "keywords": ["api", "registrar", "x-verification", "wallet", "solana", "openclawd"]
}
```

Agents and services can query the registry to discover and integrate with the API Registrar.

## License

MIT
