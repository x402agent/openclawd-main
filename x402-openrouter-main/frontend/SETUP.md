# Ekai Gateway Setup Guide

## Prerequisites

1. **Base Network Wallet**: Make sure you have a wallet with some ETH on Base network
2. **Backend Server**: The backend server should be running on `localhost:3001`

## Environment Configuration

Create a `.env.local` file in the frontend directory with:

```bash
# WalletConnect Project ID - Get this from https://cloud.walletconnect.com
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Backend API URL (optional - defaults to localhost:3001)
NEXT_PUBLIC_API_URL=http://localhost:3001

# Base Network RPC URL (optional - uses default if not set)
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

## Getting WalletConnect Project ID

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/)
2. Sign up/Login
3. Create a new project
4. Copy the Project ID
5. Paste it in your `.env.local` file

## Base Network Setup

The app is configured to prioritize Base network. Make sure your wallet:

1. **Supports Base network** (MetaMask, Rainbow, etc.)
2. **Has some ETH** for gas fees and x402 payments
3. **Is connected to Base mainnet** (not testnet)

## Running the Application

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Connect your wallet** and start chatting!

## How It Works

1. **Connect Wallet**: Use the WalletConnect button to connect your Base wallet
2. **Select Model**: Choose from various AI models (GPT-4, Claude, Llama, etc.)
3. **Send Message**: Type your message and send
4. **Automatic Payment**: x402 automatically handles payment for each AI response
5. **View Transactions**: See payment details below each AI response

## Troubleshooting

- **"Wallet not connected"**: Make sure your wallet is connected to Base network
- **"Request failed"**: Check if the backend server is running
- **Payment errors**: Ensure you have enough ETH for gas fees
- **Network issues**: Try switching to Base Sepolia testnet for testing

## Supported Models

- **OpenAI**: GPT-4o, GPT-4o Mini
- **Anthropic**: Claude 3 Haiku, Claude 3 Sonnet
- **Meta**: Llama 3.1 8B Instruct
- **And more** via OpenRouter

## x402 Integration

The app uses x402 for automatic payment processing:
- Each AI response triggers a payment
- Payments are processed on Base network
- Transaction hashes are displayed for transparency
- No manual payment setup required
