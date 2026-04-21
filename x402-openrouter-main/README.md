# Ekai Gateway - x402 Payment-Gated AI Chat

A full-stack AI chat application that uses the x402 payment protocol to provide pay-per-use access to OpenRouter AI models. Users pay $0.01 USDC per AI response without requiring accounts or subscriptions.

## 🚀 Features

- **🤖 AI Chat**: Access to 100+ AI models via OpenRouter (GPT-4, Claude, Llama, etc.)
- **💰 x402 Payments**: Automatic cryptocurrency payments for each AI response
- **🔐 No Authentication**: Pay-per-use without user accounts
- **📱 Modern UI**: Beautiful, responsive chat interface with markdown support
- **⚡ Real-time**: Streaming AI responses with live payment processing

## 🏗️ Architecture

```
├── frontend/          # Next.js 15 React application
│   ├── src/
│   │   ├── app/      # App router pages
│   │   ├── components/ # React components
│   │   ├── lib/      # Services and utilities
│   │   └── providers/ # Context providers
│   └── public/       # Static assets
└── backend/           # Express.js API server
    └── src/
        ├── index.ts   # Main server setup
        ├── openrouter-proxy.ts # OpenRouter API proxy
        └── models.ts  # Models endpoint
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Wagmi + RainbowKit** - Ethereum wallet integration
- **React Markdown** - Rich message rendering
- **Prism.js** - Syntax highlighting

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **x402-express** - Payment middleware
- **node-fetch** - HTTP client
- **CORS** - Cross-origin support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- OpenRouter API key
- Ethereum wallet with testnet funds

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd x402-openrouter-chat
pnpm install
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# PAYMENT_ADDRESS=0x...
# OPENROUTER_API_KEY=sk-...
# NETWORK=base-sepolia
pnpm run dev
```

### 3. Frontend Setup
```bash
cd frontend
# Create .env.local file with your configuration
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env
pnpm run dev
```

### 4. Connect Wallet & Chat
- Visit `http://localhost:3000`
- Connect your Base Sepolia wallet
- Start chatting with AI models!

## 📁 Project Structure

```
x402-openrouter-chat/
├── README.md                 # This file
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── index.ts         # Main server with x402 middleware
│   │   ├── openrouter-proxy.ts # OpenRouter API proxy
│   │   └── models.ts        # Models endpoint
│   ├── package.json         # Backend dependencies
│   ├── tsconfig.json        # TypeScript config
│   └── README.md            # Backend-specific docs
└── frontend/                # Next.js React app
    ├── src/
    │   ├── app/             # App router pages
    │   ├── components/       # React components
    │   ├── lib/             # Services (X402Service)
    │   ├── providers/       # Wagmi provider
    │   └── types/           # TypeScript types
    ├── public/              # Static assets
    ├── package.json         # Frontend dependencies
    ├── tsconfig.json        # TypeScript config
    └── README.md            # Frontend-specific docs
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
PAYMENT_ADDRESS=0x...        # Your x402 payment address
OPENROUTER_API_KEY=sk-...    # OpenRouter API key
NETWORK=base-sepolia         # Blockchain network
PORT=3001                    # Server port (optional)
PRICE=$0.01                  # Price per message (optional)
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: WalletConnect Project ID (for production)
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

## 💰 x402 Integration

The app uses the x402 protocol for automatic payment processing:

- **Payment Flow**: User sends message → x402 processes payment → AI generates response
- **Cost**: $0.01 USDC per AI response
- **Network**: Base Sepolia testnet (configurable)
- **Transparency**: Transaction hashes displayed for each response

## 🚀 Deployment

### Backend
- **Vercel**: Serverless functions with x402 middleware
- **Railway**: Node.js deployment
- **Docker**: Containerized deployment

### Frontend
- **Vercel**: Next.js deployment
- **Netlify**: Static site deployment
- **AWS S3**: Static hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **x402 Protocol**: [x402.org](https://x402.org)
- **OpenRouter API**: [OpenRouter documentation](https://openrouter.ai/docs)
- **Issues**: Open an issue in this repository

## 🙏 Acknowledgments

- [x402](https://x402.org) for the payment protocol
- [OpenRouter](https://openrouter.ai) for AI model access
- [Base](https://base.org) for the blockchain network
- [RainbowKit](https://rainbowkit.com) for wallet integration

---

Built with ❤️ for the x402 ecosystem
