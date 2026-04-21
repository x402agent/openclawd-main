import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { paymentMiddleware } from 'x402-express';
import { openRouterProxy } from './openrouter-proxy.js';
import { getModels } from './models.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS;
const NETWORK = (process.env.NETWORK || 'base-sepolia') as 'base-sepolia' | 'base' | 'avalanche-fuji' | 'avalanche' | 'iotex';
const PRICE = process.env.PRICE || '$0.01';

if (!PAYMENT_ADDRESS) {
  console.error('❌ PAYMENT_ADDRESS environment variable is required');
  process.exit(1);
}

// Validate payment address format
if (!PAYMENT_ADDRESS.startsWith('0x') || PAYMENT_ADDRESS.length !== 42) {
  console.error('PAYMENT_ADDRESS must be a valid 0x-prefixed Ethereum address');
  process.exit(1);
}

// Enable CORS for all origins (hackathon mode)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Models endpoint (free)
app.get('/v1/models', getModels);

// Apply x402 payment middleware for chat endpoint with facilitator
app.use(paymentMiddleware(PAYMENT_ADDRESS as `0x${string}`, {
  'POST /v1/chat/completions': {
    price: PRICE, // Configurable price per message
    network: NETWORK, // Configurable network
    config: {
      description: 'Chat with AI models via OpenRouter'
    }
  }
}, {
  url: 'https://x402.org/facilitator' // Base Sepolia facilitator
}));

// Protected chat endpoint
app.post('/v1/chat/completions', openRouterProxy);

app.listen(PORT, () => {
  console.log(`🚀 Ekai Gateway Backend running on port ${PORT}`);
  console.log(`💰 Payment address: ${PAYMENT_ADDRESS}`);
  console.log(`🔗 Network: ${NETWORK}`);
  console.log(`💵 Price per message: ${PRICE}`);
});