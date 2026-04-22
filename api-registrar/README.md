# 🐾 OpenClawd API Registrar

> API Key registration system for the OpenClawd ecosystem — verifies Solana wallet ownership via X (Twitter) verification and issues `clawd_sk_` API keys compatible with ClawdRouter.

Part of the **ACP (Agent Communication Protocol)** registry system with protocol 8004 integration.

---

## 🌟 Features

- **Wallet Verification** — Verify Solana wallet ownership via X (Twitter)
- **API Key Generation** — Issue `clawd_sk_` prefixed API keys
- **ClawdRouter Integration** — Keys validated by ClawdRouter for AI calls
- **Scope-based Permissions** — Fine-grained access control
- **Secure Storage** — API keys hashed (SHA-256) before storage
- **ACP Registry** — Service discovery for OpenClawd ecosystem

---

## 📋 Verification Flow

```text
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│ 1. Connect   │────▶│ 2. Generate  │────▶│ 3. Tweet     │
│    Wallet    │     │    Code       │     │    Code      │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                     ┌──────────────┐            │
                     │ 5. Get API   │◀───────────┘
                     │    Key       │
                     └──────────────┘
                     ┌──────────────┐
                     │ 4. Submit    │◀───────────┘
                     │    URL       │
                     └──────────────┘
```

1. **Connect Wallet** — User connects Solana wallet (Phantom, etc.)
2. **Generate Code** — System creates unique `clawdXXXX` code
3. **Tweet Verification** — User tweets the code on X (Twitter)
4. **Paste URL** — User submits tweet URL
5. **Get API Key** — System verifies and issues `clawd_sk_` key

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set environment variables
cp .env.example .env

# Start development server
pnpm dev

# Start production server
pnpm build && pnpm server

# Database migrations
pnpm db:push
```

---

## 🔧 Configuration

### Environment Variables

```env
# Database (PostgreSQL/Neon)
DATABASE_URL=postgresql://user:pass@host:5432/solanaclawd

# Server
PORT=3001
HOST=0.0.0.0
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# X (Twitter) API for tweet verification
X_API_BEARER_TOKEN=your_x_api_token

# Internal secret for ClawdRouter validation
CLAWDROUTER_INTERNAL_SECRET=your_internal_secret_here
```

---

## 🔌 API Endpoints

### Public Endpoints

#### GET /health
Health check endpoint.

```json
{
  "status": "ok",
  "service": "openclawd-api-registrar",
  "version": "1.0.0",
  "ecosystem": "OpenClawd"
}
```

#### GET /api
API information and available endpoints.

#### POST /api/register/generate-code
Generate verification code for wallet.

```bash
curl -X POST http://localhost:3001/api/register/generate-code \
  -H "Content-Type: application/json" \
  -d '{"walletAddress": "SolanaWalletAddress..."}'
```

Response:
```json
{
  "success": true,
  "verificationCode": "clawd1a2b3c4d",
  "expiresAt": "2024-01-01T00:30:00Z",
  "userId": 123,
  "instructions": {
    "step": 1,
    "action": "tweet",
    "content": "Verifying my Solana wallet for @clawddevs: clawd1a2b3c4d"
  }
}
```

#### POST /api/register/verify-tweet
Verify tweet and get API key.

```bash
curl -X POST http://localhost:3001/api/register/verify-tweet \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "SolanaWalletAddress...",
    "verificationCode": "clawd1a2b3c4d",
    "tweetUrl": "https://x.com/username/status/123456789"
  }'
```

Response:
```json
{
  "verified": true,
  "apiKey": "clawd_sk_xxxxxxxxxxxx",
  "keyPrefix": "clawd_sk_01ab",
  "expiresAt": "2025-01-01T00:00:00Z",
  "usage": {
    "header": "Authorization",
    "format": "Bearer clawd_sk_..."
  }
}
```

#### GET /api/register/keys/:walletAddress
List all API keys for a wallet.

#### DELETE /api/register/keys/:keyId
Revoke an API key.

### Protected Endpoints (Require API Key)

#### GET /api/register/stats
Get registration statistics.

```bash
curl http://localhost:3001/api/register/stats \
  -H "Authorization: Bearer clawd_sk_xxxxxxxxxxxx"
```

---

## 🔐 Authentication

### API Key Format

```
clawd_sk_<base64-encoded-random-bytes>
```

Example:
```
clawd_sk_01ab2cd3efgh4ijkl5mnop6qrst7uvwx
```

### Using API Keys

```bash
# Include in Authorization header
curl https://api.hub.solanaclawd.com/chat \
  -H "Authorization: Bearer clawd_sk_xxxxxxxxxxxx"
```

### Scopes

| Scope | Description |
|-------|-------------|
| `chat:read` | Read chat history |
| `chat:write` | Send messages |
| `skills:read` | Browse skills |
| `admin` | Full access |

---

## 🗄️ Database Schema

Uses Drizzle ORM with PostgreSQL. Tables:

- `users` — Wallet users with role
- `x_verification_codes` — X verification records
- `registrar_api_keys` — Generated API keys

### Run Migrations

```bash
pnpm db:push
pnpm db:studio  # Visual database editor
```

---

## 🤝 Integration

### ClawdRouter

API keys generated here are validated by ClawdRouter using the `clawd_sk_` prefix.

```typescript
// In ClawdRouter auth middleware
if (apiKey.startsWith('clawd_sk_')) {
  // Validate against API Registrar
  const response = await fetch('https://registrar.hub.solanaclawd.com/validate', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
}
```

### ACP Registry

This service is registered in the OpenClawd ACP registry:

```json
{
  "id": "api-registrar",
  "name": "OpenClawd API Registrar",
  "category": "infrastructure",
  "keywords": ["api", "registrar", "x-verification", "wallet", "solana", "openclawd"]
}
```

---

## 📁 Project Structure

```
api-registrar/
├── src/
│   ├── server.ts          # Main server
│   ├── routes/
│   │   └── register.ts    # Registration routes
│   └── lib/
│       ├── db.ts          # Database schema
│       ├── auth.ts        # Authentication middleware
│       └── verification.ts # X verification logic
├── drizzle/               # Database migrations
├── public/               # Static assets
└── .env.example          # Environment template
```

---

## 🛡️ Security

- API keys are hashed (SHA-256) before storage
- Keys expire after 1 year
- Keys can be revoked at any time
- Rate limiting recommended for production
- X API verification (when token provided)

---

## 📜 License

MIT — See [`../LICENSE.md`](../LICENSE.md)
