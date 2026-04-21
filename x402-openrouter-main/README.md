# solana-clawd-x402

> x402 protocol native implementation for Solana

## Overview

This project provides native x402 protocol support for Solana-based agents. It bridges the HTTP 402 Payment Accepted standard to Solana's SPL Token program.

## Features

- **Ed25519 Signatures** — Native Solana signature verification for payment proofs
- **SPL Token Support** — USDC and $CLAWD settlements
- **Helius RPC** — Primary RPC provider with fallback support
- **IPFS Integration** — Agent manifest and receipt storage via Pinata

## Architecture

```
src/
├── x402/           # x402 protocol implementation
├── solana/         # Solana-specific adaptations
├── ipfs/           # Pinata IPFS integration
└── routes/         # API endpoints
```

## Quick Start

```bash
npm install
npm run build
npx wrangler deploy
```

## Environment Variables

```bash
HELIUS_API_KEY=          # Helius RPC API key
PINATA_JWT=              # Pinata IPFS JWT
OPERATOR_KEYPAIR=        # Base58 signing key for settlement
```

## License

MIT — See [`LICENSE`](LICENSE)