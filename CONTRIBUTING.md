# Contributing to OpenClawd

Thank you for your interest in contributing to OpenClawd! This is an open-source monorepo for the Solana AI agent ecosystem. We welcome contributions of all kinds — new agents, documentation, bug fixes, and features.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Agents](#contributing-agents)
- [Contributing Code](#contributing-code)
- [Documentation](#documentation)
- [Code Style](#code-style)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [License](#license)

## 🎯 Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/openclawd.git
   cd openclawd
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/x402agent/openclawd.git
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+
- npm or pnpm
- Go 1.21+ (for solana-clawd)
- Git

### Installing Dependencies

```bash
# Install agents dependencies
cd agents && npm install

# Install solana-clawd dependencies
cd ../solana-clawd && npm install

# Install tailclawd dependencies
cd ../tailclawd && npm install
```

## 📁 Project Structure

```
openclawd/
├── agents/              # AI agent definitions (JSON + TypeScript)
├── solana-clawd/        # Go + TypeScript agent framework
├── tailclawd/           # Web interface (Node.js + iii engine)
├── clawdhub/            # Registry hub (TanStack + Convex)
├── skills/              # SKILL.md bundles
├── MCP/                 # MCP server implementations
├── CLI/                 # Command-line tools
├── src/                 # Core TypeScript engine
├── workers/             # Cloudflare Workers
├── chrome-extension/    # Browser extension
└── acp_registry/        # Project registry
```

## 🤖 Contributing Agents

The [`agents/`](agents/) directory contains 50 AI agents. Each agent is a JSON file following the `clawdAgentSchema.v1.json` schema.

### Agent Schema

```json
{
  "$schema": "https://solanaclawd.com/schemas/clawdAgentSchema.v1.json",
  "identifier": "your-agent-name",
  "schemaVersion": 1,
  "meta": {
    "title": "Your Agent Title",
    "category": "defi",
    "tags": ["solana", "clawd"]
  },
  "config": {
    "systemRole": "You are a specialist...",
    "openingMessage": "Hello! How can I help?",
    "openingQuestions": ["Question 1", "Question 2"]
  },
  "solana": {
    "capabilities": ["read-only", "a2a-message"],
    "metaplexSkills": ["agent-registry"],
    "programDeps": []
  }
}
```

### Categories

Agents must be filed into one of these categories:
- `defi` — Yield, lending, LP, stablecoins
- `trading` — Routing, alpha, memecoins
- `analytics` — Portfolios, treasuries, revenue
- `security` — Risk scoring, audits, MEV
- `education` — Onboarding, yield math, staking
- `dev-tools` — SDK expertise, priority fee math
- `governance` — Realms, proposals, delegation
- `nft` — MPL Core launches, NFT liquidity

### Quality Checklist

- ✅ Specific to a Solana protocol / domain
- ✅ Solana-native vocabulary (lamports, CU, priority fees, Jito tips, PDAs)
- ✅ Output format is consistent and scannable
- ✅ Explicit risk framing
- ✅ Valid `$schema` from `clawdAgentSchema.v1.json`
- ✅ `endpoints.a2a`, `mint-as-agent`, `catalog` wired for CLAWD Router

### Build Tools

```bash
# Regenerate the catalog
node build-catalog.cjs

# Upgrade legacy agents to Solana-native schema
node scripts/clawdify-agents.cjs

# Cosmetic pass (summary + featured)
node scripts/patch-agents.cjs
```

## 💻 Contributing Code

### New MCP Server

Create a new MCP server in the `MCP/` directory:

```bash
cd MCP
mkdir your-server
cd your-server
npm init
# Add your implementation
```

### New Skill

Add a skill to the `skills/` directory:

```bash
cd skills
mkdir your-skill
cd your-skill
# Create SKILL.md with your skill definition
# Add any necessary files
```

### New Worker

Create a new Cloudflare Worker in `workers/`:

```bash
cd workers
mkdir your-worker
cd your-worker
npm init
npx wrangler init
# Add your implementation
```

## 📚 Documentation

We maintain documentation in several places:
- **Inline code comments** — Explain "why" not just "what"
- **Project READMEs** — Each sub-project has its own README
- **SKILL.md files** — Agent capabilities and workflows

When adding documentation:
- Use clear, concise language
- Include code examples where applicable
- Update the relevant README if changing functionality

## 🎨 Code Style

### TypeScript/JavaScript

- Use descriptive variable and method names
- Prefer clarity over concision
- Add comments for non-obvious code
- Use async/await for all asynchronous operations
- Use `@MainActor` for SwiftUI state updates

### Go

- Follow Go idioms and standard library patterns
- Use `gagliardetto/solana-go` for Solana operations
- Include error handling for all operations

### Swift

- Use SwiftUI for all UI unless AppKit-only feature
- Follow Apple HIG for design guidelines
- Use MVVM with `@StateObject` / `@Published`

### General

- **Do**: Write clear, well-documented code
- **Do**: Use consistent naming conventions
- **Do**: Add comments explaining complex logic
- **Don't**: Add unnecessary abstractions
- **Don't**: Fix known non-blocking warnings
- **Don't**: Rename existing projects/schemes

## 📝 Commit Messages

Follow these guidelines for commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation changes
- `style` — Code style changes (formatting, etc.)
- `refactor` — Code refactoring
- `test` — Adding or updating tests
- `chore` — Maintenance tasks

### Examples

```
feat(agents): add pump.fun screener agent
fix(solana-clawd): correct priority fee calculation
docs(tailclawd): update quick start instructions
refactor(mcp): simplify tool registration
```

## 🔄 Pull Request Process

1. **Create a branch** for your changes
2. **Make your changes** following the code style guidelines
3. **Write tests** for new functionality
4. **Update documentation** as needed
5. **Run the build** to ensure nothing is broken:
   ```bash
   # Test agents
   cd agents && node build-catalog.cjs
   ```
6. **Submit a PR** with a clear description of changes
7. **Address feedback** from reviewers

### PR Template

```markdown
## Summary
Brief description of the changes.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Refactoring

## Testing
Describe testing performed.

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Build passes
```

## 🔒 Security

For security-related contributions:
- **Never** commit API keys or secrets
- Use environment variables for sensitive data
- Follow Solana security best practices
- Report vulnerabilities via private disclosure

## 📜 License

By contributing to OpenClawd, you agree that your contributions will be licensed under the MIT License. See [`LICENSE`](LICENSE) for details.

## 🙏 Thank You!

Thank you for contributing to OpenClawd. Your work helps make Solana AI agents accessible to everyone.

Questions? Open an issue or reach out on [Twitter](https://x.com/clawddevs).