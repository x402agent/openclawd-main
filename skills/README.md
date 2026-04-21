# OpenClawd Skills

> 97 bundled SKILL.md files for AI agent capabilities

## Overview

This directory contains reusable skill definitions for the OpenClawd agent ecosystem. Each skill is a self-contained capability that agents can use to perform specific tasks.

## Categories

| Category | Skills | Examples |
|----------|--------|----------|
| Trading | 15+ | pumpfun-launcher, pumpfun-trading, pumpfun-analytics |
| AI / Agents | 10+ | swarm-orchestrator, claude-code-skill, coding-agent |
| DevOps / Infrastructure | 8+ | gateway-node-ops, e2b, docker |
| Solana / Blockchain | 12+ | solana-formal-verification, wallet-management |
| Media | 5+ | canvas, camsnap |
| Productivity | 15+ | apple-notes, apple-reminders, bear-notes |
| Communication | 8+ | discord, bluebubbles |

## Available Skills

### Trading

- `pumpfun-launcher` — Launch new tokens on Pump.fun
- `pumpfun-trading` — Buy/sell on Pump.fun bonding curves
- `pumpfun-analytics` — Monitor bonding curves and graduation
- `pumpfun-fees` — Configure creator fee sharing
- `swarm-orchestrator` — Orchestrate multi-bot trading swarms

### AI / Agents

- `claude-code-skill` — Control Claude Code via MCP
- `coding-agent` — AI coding assistance
- `cua` — Computer use agent capabilities
- `gemini` — Gemini AI integration
- `openclaw-claude-code-skill` — Clawd Claude Code integration

### DevOps

- `gateway-node-ops` — SolanaOS Gateway + Node workflow
- `e2b` — E2B sandbox integration
- `docker` — Docker container management
- `gateway-node-ops` — Node operations

### Solana

- `solana-formal-verification` — Formal verification with Lean 4 proofs

### Media

- `canvas` — Display HTML on SolanaOS nodes
- `camsnap` — Camera capture and processing

### Productivity

- `apple-notes` — Apple Notes integration
- `apple-reminders` — Apple Reminders integration
- `bear-notes` — Bear notes integration
- `1password` — 1Password integration

### Communication

- `discord` — Discord bot integration
- `bluebubbles` — iMessage via BlueBubbles

## Using Skills

Skills are loaded by agents at runtime. The SKILL.md file contains:
- Trigger conditions
- Required environment variables
- Step-by-step instructions
- Reference documentation

## Creating New Skills

```markdown
# SKILL.md — My New Skill

## Trigger
When the user asks about...

## Environment
- REQUIRED_API_KEY
- OPTIONAL_CONFIG

## Steps
1. First step...
2. Second step...

## References
- [Link to docs](https://...)
```

## Catalog

See `catalog.json` for a machine-readable list of all skills.

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)