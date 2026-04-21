# OpenClawd Engine

> Core TypeScript engine for AI agent orchestration

## Overview

This directory contains the core TypeScript engine that powers the OpenClawd agent runtime. It provides the foundation for command execution, tool management, memory, and agent coordination.

## Architecture

```
src/
├── commands/       # CLI command implementations
├── tools/          # Tool definitions and handlers
├── memory/         # Memory tier management (KNOWN/LEARNED/INFERRED)
├── bridge/         # Protocol bridges
├── gateway/        # TCP gateway services
├── coordinator/    # Multi-agent coordination
├── engine/         # Core execution engine
├── tasks/          # Task management
├── state/          # State management
├── skills/         # Skill loading and execution
├── plugins/        # Plugin system
├── daemon/        # Daemon mode operations
└── ...
```

## Core Components

### Engine

The core execution engine handles:
- Agent lifecycle management
- Tool invocation
- Permission enforcement
- Response streaming

### Commands

Command implementations for CLI operations:
- `help` — Show available commands
- `cd` — Change context/directory
- `run` — Execute tasks
- `skills` — Manage skills
- And more...

### Tools

Tool definitions for agent capabilities:
- File operations
- Shell execution
- API calls
- Blockchain interactions

### Memory

Memory tier system based on confidence levels:
- **KNOWN** — Verified facts with expiration
- **LEARNED** — Persistent patterns with high trust
- **INFERRED** — Derived signals with uncertainty

### Bridge

Protocol bridges for:
- MCP (Model Context Protocol)
- A2A (Agent-to-Agent)
- ClawdRouter API

### Gateway

TCP/IP gateway for:
- Node communication
- Remote execution
- Connection management

## Usage

```typescript
import { createEngine } from './src/engine';

const engine = await createEngine({
  model: 'claude-sonnet-4',
  tools: ['file', 'shell', 'http'],
});

await engine.start();
```

## Development

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Run tests
npm test
```

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)