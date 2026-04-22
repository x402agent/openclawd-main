# 🐾 OpenClawd Contributor Onboarding Guide

> Everything you need to know to get started contributing to OpenClawd.

---

## Table of Contents

1. [What is OpenClawd?](#what-is-openclawd)
2. [Quick Start](#quick-start)
3. [Project Overview](#project-overview)
4. [Key Directories](#key-directories)
5. [Development Workflow](#development-workflow)
6. [Working with Skills](#working-with-skills)
7. [Working with Agents](#working-with-agents)
8. [Security Requirements](#security-requirements)
9. [Testing & Building](#testing--building)
10. [Submitting Changes](#submitting-changes)

---

## What is OpenClawd?

OpenClawd is an **open-source monorepo** for building, deploying, and monetizing Solana-native AI agents. It provides:

- **ClawdRouter** — 57-model routing with x402/MPP/AP2/A2A payments
- **50+ AI Agents** — Trading, DeFi, NFTs, security, and more
- **90+ Skills** — Bundled SKILL.md for agent capabilities
- **$CLAWD Token** — Settlement and holder discounts (10-50%)

**Stack Flow:** `Surface → Router → Runtime → Skills → Settlement → Chain`

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/x402agent/openclawd.git
cd openclawd
```

### 2. Set Up Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with your API keys (at minimum):
# - OPENROUTER_API_KEY
# - HELIUS_API_KEY or SOLANA_RPC_URL
```

### 3. Install Dependencies

```bash
# Full monorepo
npm install

# Or individual packages
cd agents && npm install
cd ../clawdrouter && npm install
cd ../skills && npm install
```

### 4. Start Developing

```bash
# Run agents catalog build
cd agents && node build-catalog.cjs

# Run ClawdRouter
cd ../clawdrouter && npm run dev

# Run API Registrar
cd ../api-registrar && npm run dev
```

---

## Project Overview

### Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ Surfaces                                                     │
│ chrome-extension · telegram · tailclawd · WatchApp            │
│ beepboop · chess · moltbook-agent                            │
└────────────────────────────┬─────────────────────────────────┘
                              │
┌────────────────────────────▼─────────────────────────────────┐
│ Router & Payments                                            │
│ clawdrouter · x402-openrouter-main · api-registrar           │
└────────────────────────────┬─────────────────────────────────┘
                              │
┌────────────────────────────▼─────────────────────────────────┐
│ Runtime                                                      │
│ src · solana-clawd · agents · MCP · packages                  │
└────────────────────────────┬─────────────────────────────────┘
                              │
┌────────────────────────────▼─────────────────────────────────┐
│ Skills & Registry                                            │
│ clawdhub · skills · acp_registry · articles                  │
└──────────────────────────────────────────────────────────────┘
```

### Technologies

| Layer | Technologies |
|-------|-------------|
| Models | xAI Grok, Claude, GPT, Kimi |
| Chain | Solana, SPL Tokens, Jupiter |
| Payments | x402, MPP, AP2, A2A |
| Runtime | TypeScript, Go, Python |
| UI | React, SwiftUI |
| Infrastructure | Cloudflare Workers, E2B, Tailscale |

---

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `agents/` | 50 AI agent definitions (JSON) |
| `skills/` | 90+ SKILL.md bundles |
| `clawdrouter/` | Model routing & payment gateway |
| `api-registrar/` | API key registration (X verification) |
| `solana-clawd/` | Go + TypeScript agent framework |
| `MCP/` | MCP server implementations |
| `clawdhub/` | Skills marketplace |
| `src/` | Core TypeScript engine |
| `packages/` | Shared npm packages |
| `acp_registry/` | Project registry (JSON) |
| `articles/` | Documentation |
| `services/` | Backend services |
| `workers/` | Cloudflare Workers |

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Changes

**Adding a new skill:**
```bash
cd skills
mkdir my-awesome-skill
cd my-awesome-skill
# Create SKILL.md
```

**Adding a new agent:**
```bash
cd agents
# Create my-agent.json following the schema
# See agent-template-full.json for reference
```

**Working on a service:**
```bash
cd api-registrar
pnpm install
pnpm dev  # Start development server
```

### 3. Test Your Changes

```bash
# Build agents catalog
cd agents && node build-catalog.cjs

# Run linting
cd .. && npm run lint

# Type check
npm run typecheck
```

### 4. Commit & Push

```bash
git add .
git commit -m "feat(skills): add my-awesome-skill"
git push origin feature/your-feature-name
```

### 5. Submit Pull Request

Open a PR on GitHub with:
- Clear description of changes
- Testing performed
- Screenshots (if UI changes)

---

## Working with Skills

### Skill Structure

```
skills/my-skill/
├── SKILL.md           # Required: Main skill definition
├── README.md          # Optional: Documentation
└── references/        # Optional: Additional files
```

### SKILL.md Template

```markdown
# SKILL.md — My Awesome Skill

## Trigger
When the user asks about...

## Environment
- REQUIRED_API_KEY
- OPTIONAL_CONFIG

## Steps
1. First step...
2. Second step...

## Security
- No secrets in code
- Minimal permissions
- Vault certified: pending

## References
- [Link to docs](https://...)
```

### Security Requirements

All skills must:
- ✅ Pass ClawdVault security scan
- ✅ Have score >= 80/100
- ✅ Have no critical issues
- ✅ Use placeholder variables (`{{API_KEY}}`) not real keys

### Publishing

```bash
# Via CLI
npx clawdhub publish ./skills/my-skill --slug my-skill

# Or submit PR and let maintainers review
```

---

## Working with Agents

### Agent Schema

Each agent is a JSON file with:

```json
{
  "$schema": "./agent-template-full.json",
  "name": "my-agent",
  "displayName": "My Agent",
  "version": "1.0.0",
  "description": "What this agent does",
  "ecosystem": "OpenClawd",
  "skills": [
    {
      "name": "relevant-skill",
      "enabled": true,
      "priority": "primary"
    }
  ],
  "capabilities": {
    "skills": ["trading"],
    "x402_support": true
  },
  "metadata": {
    "tags": ["solana", "trading"],
    "category": "trading"
  }
}
```

### Agent Categories

- `defi` — Yield, lending, LP, stablecoins
- `trading` — Routing, alpha, memecoins
- `analytics` — Portfolios, treasuries, revenue
- `security` — Risk scoring, audits, MEV
- `education` — Onboarding, yield math, staking
- `dev-tools` — SDK expertise, priority fee math
- `governance` — Realms, proposals, delegation
- `nft` — MPL Core launches, NFT liquidity

### Building Agents Catalog

```bash
cd agents
node build-catalog.cjs
```

---

## Security Requirements

### For All Contributions

- ❌ **NEVER** commit API keys or secrets
- ❌ **NEVER** commit `.env` files
- ✅ Use environment variables for all secrets
- ✅ Run ClawdVault before publishing skills
- ✅ Follow the `.gitignore` patterns

### API Keys & Secrets

```bash
# .env.example is safe to commit
# .env is NOT safe to commit

# If you accidentally commit secrets:
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all
```

### ClawdVault Scanning

```bash
# Scan skills before publishing
cd services/hermes-vault
python -m hermes_vault.cli scan ../../skills/my-skill
```

---

## Testing & Building

### Quick Validation

```bash
# Validate agent JSONs
cd agents && node build-catalog.cjs

# Type check TypeScript
npm run typecheck

# Run tests (if available)
npm test
```

### Service-Specific

```bash
# API Registrar
cd api-registrar
pnpm install
pnpm db:push  # Run migrations
pnpm dev      # Start server

# ClawdRouter
cd clawdrouter
pnpm install
pnpm dev

# Skills Marketplace
cd clawdhub
pnpm install
pnpm dev
```

---

## Submitting Changes

### PR Checklist

- [ ] Branch from `main`
- [ ] Descriptive commit message
- [ ] Code follows style guidelines
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Build passes

### Commit Message Format

```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: agents, skills, api-registrar, clawdrouter, etc.
```

**Examples:**
```
feat(skills): add trading advisor skill
fix(api-registrar): correct tweet verification
docs(agents): update agent templates
refactor(clawdrouter): simplify model scoring
```

### Where to Get Help

| Resource | Link |
|----------|------|
| Issues | [GitHub Issues](https://github.com/x402agent/openclawd/issues) |
| Discussions | [GitHub Discussions](https://github.com/x402agent/openclawd/discussions) |
| Twitter | [@clawddevs](https://x.com/clawddevs) |
| Telegram | [@clawdtoken](https://t.me/clawdtoken) |

---

## Next Steps

Once you're comfortable with the basics:

1. **Explore existing agents** in `agents/`
2. **Browse skills** in `skills/`
3. **Read the architecture** in `articles/architecture.md`
4. **Join the community** on Twitter/Telegram
5. **Pick a "good first issue"** from GitHub

---

## Resources

| Resource | Description |
|----------|-------------|
| [README.md](./README.md) | Project overview |
| [STACK.md](./STACK.md) | Technical architecture |
| [articles/](./articles/) | Deep-dive documentation |
| [agents/README.md](./agents/README.md) | Agent development |
| [skills/README.md](./skills/README.md) | Skill development |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Contribution guidelines |

---

**Welcome to OpenClawd!** 🐾
