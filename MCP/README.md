# Model Context Protocol Servers

MCP server implementations for the OpenClawd ecosystem.

## Overview

The Model Context Protocol (MCP) enables AI agents to interact with tools and data sources through a standardized interface.

## Available Servers

### solana-clawd-mcp

31+ tools for Solana operations:
- **Helius RPC** — account_info, balance, transactions, priority_fee
- **Solana Market** — price, trending, token_info, wallet_pnl
- **Trading** — pump_token_scan, pump_buy_quote, pump_sell_quote
- **Memory** — memory_recall, memory_write
- **Wallet** — balance, address, transfer

## Installation

```bash
npm install
npm run build
```

## Usage

Add to your MCP client configuration:

```json
{
  "mcpServers": {
    "solana-clawd": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

## Development

```bash
npm run dev    # Development mode with hot reload
npm run build  # Production build
npm start      # Run production server
```

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)