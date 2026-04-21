# OpenClawd Skills Hub

> **100 SKILL.md bundles** — The largest open-source skill marketplace for AI agents on Solana

## 🌐 Skills Hub & Marketplace

The OpenClawd Skills Hub is your central destination for discovering, publishing, and installing AI agent capabilities.

| Resource | URL |
|----------|-----|
| **Skills Hub** | [solanaos.net/skills](https://solanaos.net/skills) |
| **Marketplace** | [solanaclawd.com/marketplace](https://solanaclawd.com/marketplace) |
| **Registry** | [clawdhub](https://github.com/x402agent/openclawd/tree/main/clawdhub) |

### ClawdHub

ClawdHub is the registry and web hub for SKILL.md and SOUL.md bundles:
- **Browse** skills and souls
- **Publish** versioned updates
- **Search** with vector embeddings
- **Install** via CLI or UI

```bash
# Install a skill
npx nanohub install pumpfun-trading

# Publish a skill
npx nanohub publish ./my-skill --slug my-skill
```

---

## 📦 100 Skills Catalog

### 🤖 Clawd Ecosystem (7 skills)

| Skill | Description |
|-------|-------------|
| `clawdhub` | Browse, publish, and install SKILL.md bundles |
| `openclawd-codeskill` | OpenClawd agent integration |
| `claude-code-skill` | Claude Code via MCP protocol |
| `skill-creator` | Create new SKILL.md files |
| `swarm-orchestrator` | Multi-bot trading swarms |
| `coding-agent` | AI coding assistant |
| `cua` | Computer use agent |

### 💰 Pump.fun / Token Launch (26 skills)

| Skill | Description |
|-------|-------------|
| `pumpfun-launcher` | Launch tokens on Pump.fun |
| `pumpfun-trading` | Buy/sell on bonding curves |
| `pumpfun-analytics` | Monitor graduation progress |
| `pumpfun-fees` | Creator fee sharing |
| `pumpfun-token-scanner` | Scan for opportunities |
| `pump-sdk-core` | Core SDK integration |
| `pump-bonding-curve` | Bonding curve mathematics |
| `pump-security` | Security auditing |
| `pump-solana-dev` | Solana dev guide |
| `pump-solana-wallet` | Wallet management |
| `pump-mcp-server` | MCP server for Pump.fun |
| `pump-fee-system` | Fee collection system |
| `pump-fee-sharing` | Fee distribution |
| `pump-admin-ops` | Administrative operations |
| `pump-ai-agents` | AI agent frameworks |
| `pump-build-release` | Build pipelines |
| `pump-claims-readonly` | Claims access |
| `pump-rust-vanity` | Rust vanity addresses |
| `pump-shell-scripts` | Shell utilities |
| `pump-testing` | Testing strategies |
| `pump-token-incentives` | Token incentives |
| `pump-token-lifecycle` | Token lifecycle |
| `pump-ts-vanity` | TypeScript vanity |
| `pump-website` | Website templates |
| `pump-solana-architecture` | Architecture guide |

### ⛓️ Solana / Blockchain (6 skills)

| Skill | Description |
|-------|-------------|
| `solana-clawd` | OODA loop trading + 31 MCP tools |
| `solana-dev` | Development toolkit |
| `solana-dev-skill-main` | Comprehensive dev guide |
| `solana-formal-verification` | Lean 4 proofs |
| `solana-research-brief` | Research and analysis |
| `solanaos` | SolanaOS operator runtime |
| `metaplex` | NFT standard integration |
| `honcho-integration` | Memory and persistence |

### 🎯 AI / Agents (10 skills)

| Skill | Description |
|-------|-------------|
| `gemini` | Google Gemini integration |
| `coding-agent` | Code generation and debugging |
| `cua` | Autonomous web browsing |
| `openai-image-gen` | DALL-E image generation |
| `openai-whisper` | Speech-to-text |
| `openai-whisper-api` | Whisper API |
| `model-usage` | Track AI model usage |
| `swarm-orchestrator` | Multi-agent orchestration |

### 🛠️ DevOps / Infrastructure (5 skills)

| Skill | Description |
|-------|-------------|
| `gateway-node-ops` | SolanaOS Gateway + Node |
| `seeker-daemon-ops` | Seeker daemon management |
| `e2b` | E2B sandbox integration |
| `tmux` | Terminal multiplexer |

### 📝 Productivity (15 skills)

| Skill | Description |
|-------|-------------|
| `browse` | Web browsing |
| `summarize` | Text summarization |
| `notion` | Notion integration |
| `obsidian` | Obsidian vault |
| `apple-notes` | Apple Notes |
| `apple-reminders` | Apple Reminders |
| `bear-notes` | Bear notes |
| `things-mac` | Things task manager |
| `trello` | Trello boards |
| `weather` | Weather forecasts |
| `blogwatcher` | Blog monitoring |
| `xurl` | URL expansion |
| `goplaces` | Travel planning |

### 💬 Communication (8 skills)

| Skill | Description |
|-------|-------------|
| `discord` | Discord bot |
| `slack` | Slack workspace |
| `himalaya` | Email management |
| `wacli` | WhatsApp messaging |
| `bluebubbles` | iMessage via BlueBubbles |
| `imsg` | iMessage direct |
| `voice-call` | Voice transcription |

### 🎨 Media (10 skills)

| Skill | Description |
|-------|-------------|
| `canvas` | HTML display on nodes |
| `camsnap` | Camera capture |
| `video-frames` | Frame extraction |
| `spotify-player` | Spotify control |
| `songsee` | Music recognition |
| `gifgrep` | GIF discovery |
| `sherpa-onnx-tts` | On-device TTS |

### 🔧 Developer Tools (12 skills)

| Skill | Description |
|-------|-------------|
| `github` | GitHub management |
| `gh-issues` | Issues and PRs |
| `pdf-to-markdown` | PDF conversion |
| `nano-pdf` | PDF processing |
| `mcporter` | Package migration |
| `oracle` | Database integration |
| `session-logs` | Log management |

### 🔐 Security (1 skill)

| Skill | Description |
|-------|-------------|
| `1password` | Credential management |

### 💡 IoT / System (7 skills)

| Skill | Description |
|-------|-------------|
| `eightctl` | Eight sleep control |
| `openhue` | Philips Hue control |
| `sonoscli` | Sonos speaker control |
| `blucli` | Bluetooth management |
| `peekaboo` | Screen monitoring |
| `healthcheck` | Health monitoring |
| `sag` | System admin guide |

---

## 🚀 Using Skills

### CLI Installation

```bash
# Install a skill
npx nanohub install pumpfun-trading
npx nanohub install solana-clawd
npx nanohub install swarm-orchestrator

# List installed skills
npx nanohub list

# Update a skill
npx nanohub update pumpfun-trading

# Search skills
npx nanohub search trading
```

### MCP Integration

```json
{
  "mcpServers": {
    "clawd-skills": {
      "type": "http",
      "url": "https://modelcontextprotocol.name/mcp/skills"
    }
  }
}
```

---

## 🏪 Marketplace

Skills can be published to the marketplace for discovery and monetization:

1. **Create** — Write a SKILL.md file
2. **Publish** — `npx nanohub publish`
3. **Discover** — Browse at solanaclawd.com/marketplace
4. **Install** — One-click install from any client

### Monetization

Skills can be integrated with the ClawdRouter payment system for:
- Per-call payments
- Subscription models
- $CLAWD holder discounts

---

## 📁 Skill Structure

Each skill is a directory containing:

```
skill-name/
├── SKILL.md           # Main skill definition
├── README.md          # Documentation
└── references/       # Additional files
    └── setup.md       # Setup guide
```

### SKILL.md Template

```markdown
# SKILL.md — {Skill Name}

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

---

## 🤝 Contributing

See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) for:
- Skill creation guidelines
- Quality standards
- Submission process

---

## 📜 License

MIT — See [`../LICENSE.md`](../LICENSE.md)