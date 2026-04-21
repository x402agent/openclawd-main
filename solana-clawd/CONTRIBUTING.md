# Contributing to solana-clawd

> **The Open-Source Solana AI Agent Runtime**

Thank you for contributing to solana-clawd! This is the open-source runtime for autonomous Solana trading, powered by xAI Grok with OODA loop intelligence.

## 🚀 Quick Setup

```bash
# 1. Fork and clone
git clone https://github.com/x402agent/Solana-Os-Go.git
cd Solana-Os-Go/solana-clawd

# 2. Set up your environment
cp .env.example .env
# Edit .env — or use ClawdRouter for zero-config: CLAWDRouter_API_KEY=xxx

# 3. Build
make build

# 4. Run in simulated mode (no real money)
./build/clawd ooda --sim --interval 60

# 5. Run tests
make test
```

## 📁 Project Structure

```
solana-clawd/
├── Makefile                # Build targets (clawd, slnc, orin, etc.)
├── go.mod / go.sum         # Go dependencies + gagliardetto/solana-go
├── main.go                 # CLI entry (cobra commands)
├── hardware.go             # Modulino® I2C integration
├── memory_commands.go      # ClawVault commands
│
├── pkg/                    # Core packages
│   ├── agent/              # OODA trading loop
│   ├── config/              # Configuration + env overrides
│   ├── daemon/              # Daemon orchestrator
│   ├── solana/              # Solana clients (Helius, gagliardetto, Jupiter)
│   ├── strategy/            # RSI/EMA/ATR signal engine
│   ├── gateway/             # TCP bridge gateway
│   ├── hardware/            # Arduino Modulino® I2C
│   └── ...
│
├── src/                    # TypeScript MCP server
├── skills/                 # 97 bundled SKILL.md files
├── third_party/solana-go/  # gagliardetto/solana-go SDK
│   ├── rpc/                # RPC client
│   ├── programs/            # Token, Stake, System programs
│   └── cmd/slnc/           # slnc CLI tool
│
└── .env.example            # Environment template
```

## 🔒 Security Rules

**Non-negotiable for a trading agent:**

1. **Never hardcode API keys, tokens, or secrets** in source code
2. **Never commit `.env` files** — they're gitignored
3. **All secrets must come from environment variables** (see `pkg/config/config.go`)
4. **Never log secrets** — only log public keys, truncated URLs, boolean status
5. **Before every PR, verify** no secrets leaked:
   ```bash
   # Quick check
   grep -rn "sk-\|api_key.*=.*[A-Za-z0-9]\{20\}" --include="*.go" pkg/ cmd/ main.go
   ```

See [SECURITY.md](SECURITY.md) for the full security policy.

## 🧪 Testing

```bash
# Run all tests
make test

# Run specific package tests
go test -v ./pkg/config/...
go test -v ./pkg/strategy/...

# Run with race detector
go test -race ./...
```

## 📝 Code Style

- **Go standard formatting**: run `gofmt -s -w .` before committing
- **Meaningful package comments**: every package should have a doc comment
- **Error handling**: wrap errors with `fmt.Errorf("context: %w", err)`
- **Logging**: use component-tagged logs and keep secrets out of output
- **Naming**: follow Go conventions (exported = PascalCase, unexported = camelCase)

## 🔀 Pull Request Process

1. **Fork** the repo
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** with tests
4. **Run the full check**:
   ```bash
   make build && make test
   ```
5. **Commit** with a descriptive message:
   ```
   feat: add websocket streaming for real-time signals
   
   - Added pkg/ws/server.go with WebSocket endpoint
   - Integrated with OODA agent hooks for live updates
   - Added tests for connection handling and message routing
   ```
6. **Push** and submit a **PR** to `main`

## 💡 Good First Issues

Look for issues labeled `good first issue` — these are excellent starting points:

- **New CLI commands** — adding subcommands to `main.go`
- **Strategy improvements** — new indicators in `pkg/strategy/`
- **slnc tool improvements** — enhancing solana-go CLI
- **OpenClawd integration** — connecting to openclawd-stack
- **Documentation** — improving README, adding examples
- **Testing** — increasing test coverage for existing packages

## 🎯 Build Targets

| Target | Purpose |
|--------|---------|
| `make build` | Build clawd daemon |
| `make slnc` | Build solana-go CLI |
| `make tui` | Build TUI launcher |
| `make slim` | Build slim profile (<10MB) |
| `make orin` | Cross-compile for NVIDIA Orin Nano |
| `make install` | Install all to /usr/local/bin |
| `make docker` | Build Docker image |

## ❓ Questions?

- Open a [Discussion](https://github.com/x402agent/Solana-Os-Go/discussions)
- Tag maintainers in your PR for review
- Follow [@clawddevs](https://x.com/clawddevs) for updates

**Build clean. Ship small. Stay operator-grade.**

---

*solana-clawd · Go + TypeScript · x402 Protocol · solanaclawd.com*