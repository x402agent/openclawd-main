# 🦞 Clawd Code CLI

<div align="center">

**A lobster-themed AI terminal operator for coding, system ops & Solana**

[![Solana](https://img.shields.io/badge/Solana-Blockchain-14F195)](https://solana.com)
[![npm](https://img.shields.io/badge/npm-clawd--code--cli-CB3837)](https://www.npmjs.com/package/clawd-code-cli)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

🦞 *"Claws that code, brains that deploy"* 🦞

</div>

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄      ║
║  ╱▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╲     ║
║ ║  █████╗   ║                                              ║    ║
║ ║ ██╔══██╗  ║   🦞  CLAWD CODE CLI  🦞                   ║    ║
║ ║ ╚══█╔═╝  ║                                              ║    ║
║ ║   ██║     ║   "Claws that code, brains that deploy"     ║    ║
║ ║   ██║     ║                                              ║    ║
║ ║   ╚═╝     ║   Multi-Provider AI Terminal Operator        ║    ║
║ ║  ▄█████╗  ║   Grok · Ollama · OpenRouter · OpenAI       ║    ║
║ ║ ██╔══██╗║   Solana · MCP · File Tools                  ║    ║
║ ║ ╚══█╔═╝  ║                                              ║    ║
║ ║   ██║     ║   CLAWD Token: 8cHzQHUS2s2h8TzCmfqPKYiM4   ║    ║
║ ║   ╚═╝     ║   dSt4roa3n7MyRLApump                        ║    ║
║  ╲▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔╱     ║
║   ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀      ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🦞 About

**Clawd Code CLI** is a lobster-themed AI terminal agent built for Solana operators, developers, and degen builders. It speaks to you through a retro ASCII terminal, runs entirely in your terminal, and lets you switch between Grok, Ollama (local), OpenRouter, and OpenAI backends on the fly — no restart needed.

**CLAWD Token**: `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

---

## Features

- 🦞 **Lobster-branded UI** — ASCII art logo, per-provider spinner animations, themed loading messages
- ⚡ **Multi-Provider Routing** — Grok · Ollama · OpenRouter · OpenAI · custom, switched live via `/models`
- 🔧 **AI File Operations** — view_file, create_file, str_replace_editor (no overwrite accidents)
- 💻 **Bash + Shell Tools** — execute commands, grep, find, navigate
- 📋 **Todo Lists** — plan and track tasks with visual priority flags
- 🔌 **MCP Support** — extend with any Model Context Protocol server
- 🪙 **Solana Tools** — query assets, prices, wallet balances via Helius DAS API + Birdeye
- 🌐 **Web Search** — real-time search for Grok models (auto-detected)
- 🔐 **Persistent Settings** — `~/.clawd/user-settings.json` remembers your API keys and model preferences

---

## Installation

```bash
# Recommended
npm install -g clawd-code-cli

# Or with bun
bun add -g clawd-code-cli
```

The `clawd` and `claw` aliases are registered automatically.

---

## Quick Start

```bash
clawd
```

On first run it will prompt for your Grok API key (from [xAI](https://x.ai)). Or set it once:

```bash
# From inside clawd:
/config grok key xai-your-key-here

# Or as environment variable
export GROK_API_KEY=xai-your-key-here
clawd
```

---

## Multi-Provider Setup

### OpenRouter (Claude, Gemini, Llama, DeepSeek...)

```bash
# Inside clawd:
/config openrouter key sk-or-v1-your-key-here

# Then switch to any OpenRouter model:
/models
# or
/config add model openrouter/anthropic/claude-opus-4.7
/config set defaultModel openrouter/anthropic/claude-opus-4.7
```

### Ollama (Local Models)

```bash
# Inside clawd:
/config ollama baseURL http://localhost:11434/v1

# Default Ollama models are already in the list:
# ollama/gemma4:latest, ollama/DeepSolana:latest, etc.
/models
```

### OpenAI

```bash
/config openai key sk-your-key-here
/config add model openai/gpt-4o
/config set defaultModel openai/gpt-4o
```

---

## CLI Commands

| Command | Description |
|---------|-------------|
| `/models` | Open interactive model selector |
| `/models <name>` | Switch directly to a model by name |
| `/config` | Show all provider configs (keys masked) |
| `/config <provider> key <key>` | Set API key for a provider |
| `/config <provider> baseURL <url>` | Set base URL for a provider |
| `/config add model <name>` | Add a model to the available list |
| `/config set defaultModel <model>` | Set the default model (also switches active session) |
| `/provider` | Show active model's provider, base URL, and masked key |
| `/clear` | Clear chat history |
| `/help` | Show full help |
| `/commit-and-push` | AI-generated git commit + push |
| `/exit` | Exit |

**Shortcuts**: `↑/↓` navigate history, `Tab` complete suggestions, `Shift+Tab` toggle auto-edit, `Esc` abort.

---

## Command Line Options

```bash
clawd [options]

Options:
  -V, --version           output the version number
  -d, --directory <dir>   working directory
  -k, --api-key <key>    Grok API key
  -u, --base-url <url>    Grok API base URL
  -m, --model <model>     default model
  -p, --prompt <prompt>   headless mode — one prompt, then exit
  --max-tool-rounds <n>   max tool loops (default: 400)
  -h, --help              show help
```

---

## Provider Model Reference

### Grok (xAI) — default
```
grok-4-1-fast-reasoning
grok-4-fast-reasoning
grok-4-fast-non-reasoning
grok-4
grok-3
grok-3-fast
grok-code-fast-1
```

### OpenRouter
```
openrouter/anthropic/claude-opus-4.7
openrouter/anthropic/claude-sonnet-4
openrouter/anthropic/claude-3.5-sonnet
openrouter/google/gemini-2.5-pro
openrouter/google/gemini-2.0-flash
openrouter/meta-llama/llama-4-maverick
openrouter/deepseek/deepseek-chat-v3
openrouter/deepseek/deepseek-coder
openrouter/x-ai/grok-3
openrouter/qwen/qwen-3
```

### OpenAI
```
openai/gpt-4.5
openai/gpt-4o
openai/gpt-4o-mini
openai/o3
openai/o3-mini
openai/o4-mini
```

### Ollama (localhost:11434)
```
ollama/gemma4:latest
ollama/DeepSolana:latest
ollama/minimax-m2.7:cloud
ollama/glm-5.1:cloud
ollama/mxbai-embed-large:latest
```

---

## Solana Integration

```bash
# Set environment variables
export HELIUS_API_KEY=your_helius_key
export BIRDEYE_API_KEY=your_birdeye_key

# Then inside clawd you can ask:
"show me my Solana wallet balance"
"get the price of $BONK"
"look up this NFT asset ..."
```

---

## Local Development

```bash
git clone https://github.com/8bit/clawd-code-cli.git
cd clawd-code-cli
npm install
npm run build
npm link   # symlink locally for testing
clawd
```

---

## 🦞 CLAWD Token

**CLAWD** is the token of the Clawd ecosystem.持有 CLAWD to access premium features, agent minting, and governance.

- **Mint**: `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
- **Blockchain**: Solana
- **CLI Integration**: Use the Solana tools in clawd to query CLAWD token data, balances, and more.

---

## License

MIT
