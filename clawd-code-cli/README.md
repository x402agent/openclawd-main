# 🦞 Clawd Code CLI

<div align="center">

**A lobster-themed AI agent CLI with Solana blockchain integration**

[![Solana](https://img.shields.io/badge/Solana-Blockchain-14F195)](https://solana.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

🦞 *"Claws that code, brains that deploy"* 🦞

</div>

```
    ╔═══════════════════════════════════════════════════════════╗
    ║                                                           ║
    ║     ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄     ║
    ║   ╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲    ║
    ║  ║  █████╗  ║                                           ║   ║
    ║  ║ ██╔══██╗ ║   🦞 CLAWD CODE CLI 🦞                   ║   ║
    ║  ║ ╚══█╔═╝ ║                                           ║   ║
    ║  ║   ██║   ║   "Claws that code, brains that deploy"    ║   ║
    ║  ║   ██║   ║                                           ║   ║
    ║  ║   ╚═╝   ║   ┌─────────────────────────────────┐     ║   ║
    ║  ║         ║   │ AI-Powered CLI for Solana       │     ║   ║
    ║  ║  ▄█████╗ ║   │ Terminal • Blockchain • Deploy  │     ║   ║
    ║  ║ ██╔══██╗║   └─────────────────────────────────┘     ║   ║
    ║  ║ ╚══█╔═╝ ║                                           ║   ║
    ║  ║   ██║   ║   Type 'clawd --help' to get started      ║   ║
    ║  ║   ╚═╝   ║                                           ║   ║
    ║   ╲▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╱    ║
    ║     ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀     ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
```

## Features

- **🤖 Conversational AI**: Natural language interface powered by Grok
- **📝 Smart File Operations**: AI automatically uses tools to view, create, and edit files
- **⚡ Bash Integration**: Execute shell commands through natural conversation
- **🔌 MCP Tools**: Extend capabilities with Model Context Protocol servers
- **💬 Interactive UI**: Beautiful terminal interface with ASCII art
- **🌍 Global Installation**: Install and use anywhere with `bun add -g clawd-code-cli`
- **🪙 Solana Integration**: Query Solana assets, token prices, and wallet data using Helius DAS API and Birdeye

## Installation

### Prerequisites
- Bun 1.0+ (or Node.js 18+ as fallback)
- Grok API key from X.AI
- (Optional) Helius API key for Solana DAS API integration
- (Optional) Birdeye API key for Solana token price data

### Global Installation (Recommended)
```bash
bun add -g clawd-code-cli
```

Or with npm (fallback):
```bash
npm install -g clawd-code-cli
```

### Local Development
```bash
git clone <repository>
cd clawd-code-cli
bun install
bun run build
bun link
```

## Usage

### Interactive Mode

Start the conversational AI assistant:
```bash
clawd
# or
claw
```

### Headless Mode

Process a single prompt and exit:
```bash
clawd --prompt "show me the package.json file"
clawd -p "create a new file called example.ts with a hello world function"
```

### Command Line Options

```bash
clawd [options]

Options:
  -V, --version          output the version number
  -d, --directory <dir>  set working directory
  -k, --api-key <key>    API key (or set API_KEY env var)
  -u, --base-url <url>   API base URL (or set BASE_URL env var)
  -m, --model <model>    AI model to use
  -p, --prompt <prompt>  process a single prompt and exit (headless mode)
  --max-tool-rounds <rounds>  maximum number of tool execution rounds (default: 400)
  -h, --help             display help for command
```

### Git Integration

```bash
# AI-powered git commit and push
clawd git commit-and-push
```

### MCP Tools

```bash
# Add MCP server
clawd mcp add my-server --transport stdio --command "bun" --args server.js

# List configured servers
clawd mcp list
```

## Setup

1. Get your Grok API key from [X.AI](https://x.ai)

2. Set up your API key (choose one method):

**Method 1: Environment Variable**
```bash
export API_KEY=your_api_key_here
```

**Method 2: .env File**
```bash
cp .env.example .env
# Edit .env and add your API key
```

**Method 3: Command Line Flag**
```bash
clawd --api-key your_api_key_here
```

### Solana Blockchain Integration (Optional)

#### Helius DAS API

1. Get your Helius API key from [Helius Dashboard](https://dashboard.helius.dev/api-keys)

2. Set up environment variables:
```bash
export HELIUS_API_KEY=your_helius_api_key_here
export HELIUS_RPC_URL=https://mainnet.helius-rpc.com
```

#### Birdeye Price API

1. Get your Birdeye API key from [Birdeye Dashboard](https://birdeye.so)

2. Set up:
```bash
export BIRDEYE_API_KEY=your_birdeye_api_key_here
```

## Development

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Build project
bun run build

# Run linter
bun run lint
```

## License

MIT
