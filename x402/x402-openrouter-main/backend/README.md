# Ekai Gateway - x402 OpenRouter Proxy

A payment-gated backend service that provides access to OpenRouter AI models using the x402 payment standard. Users pay in cryptocurrency to access AI chat completions without requiring accounts or subscriptions.

## Features

- 🔐 **x402 Payment Gateway**: Secure cryptocurrency payments using the x402 standard
- 🤖 **OpenRouter Integration**: Access to 100+ AI models through OpenRouter
- 💰 **Fixed Pricing**: $0.01 per message on Base Sepolia testnet
- 🔒 **No Authentication Required**: Pay-per-use without user accounts

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- OpenRouter API key
- Ethereum wallet with Base Sepolia testnet funds

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd x402-openrouter-proxy
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Start the server**
   ```bash
   # Development mode
   pnpm run dev
   
   # Production mode
   pnpm run build
   pnpm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `PAYMENT_ADDRESS` | x402 payment address | **Required** |
| `NETWORK` | Blockchain network | `base-sepolia` |
| `PRICE` | Price per message | `$0.01` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | **Required** |

## API Endpoints

### Health Check
```http
GET /health
```

### Get Available Models
```http
GET /v1/models
```
*Free endpoint - no payment required*

### Chat Completions
```http
POST /v1/chat/completions
```
*Protected by x402 payments - $0.01 per message*

## Development

### Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build TypeScript to JavaScript
- `pnpm start` - Start production server

### Project Structure

```
src/
├── index.ts           # Main server setup and x402 middleware
├── openrouter-proxy.ts # OpenRouter API proxy logic
└── models.ts          # Models endpoint handler
```

## Dependencies

- **Express.js** - Web framework
- **x402-express** - x402 payment middleware
- **node-fetch** - HTTP client for OpenRouter API
- **TypeScript** - Type safety and modern JavaScript features

## Deployment

### Vercel
This service is designed to work with Vercel's serverless functions. The x402 middleware handles payment verification automatically.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["npm", "start"]
```

## Security Considerations

- ✅ **No API keys exposed** - OpenRouter key stays server-side
- ✅ **Payment verification** - x402 middleware validates all payments
- ✅ **CORS configured** - Frontend-only access recommended
- ✅ **Environment isolation** - Sensitive data in .env files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues related to:
- **x402 payments**: Check [x402.org](https://x402.org)
- **OpenRouter API**: Check [OpenRouter documentation](https://openrouter.ai/docs)
- **This service**: Open an issue in this repository
