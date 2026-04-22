# Changelog

All notable changes to **OpenClawd** are documented in this file.

The format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-04-22 · 🦞 Official Release

The first official, tagged release of OpenClawd — the cypherpunk Solana AI
agent monorepo. Everything below is now stable and documented.

### ✨ Added

- **👤 Profiles System (`profiles/`)** — Hermes-inspired multi-agent profile
  manager. Run isolated Clawd agents side-by-side, each with its own
  `CLAW.md` charter, scoped `.env`, `config.yaml`, and alias wrapper.
  - `clawd-profile` bash CLI with `create`, `list`, `show`, `use`, `delete`,
    `rename`, `clone`, `export`, `import`, `path`
  - Templates: `CLAW.md` (lobster personality charter), `config.yaml`,
    `.env.example`
  - Profiles live under `~/.openclawd/profiles/<name>/`
  - Alias wrappers installed into `~/.local/bin/`
- **☁️ E2B Cloud Sandboxes** — First-class support for three public E2B
  templates, invokable from the one-shot installer:
  - `theordlibrary/clawd-v2` (id `ibyiv77pobbc6mv8luif`)
  - `theordlibrary/clawd` (id `srsbqb24j095xwd4fiad`)
  - `theordlibrary/solana-dev-env` (id `stbd55taifr4ajbxzulu`)
- **🖥️ Interactive Demo Page (`docs/demo.html`)** — Standalone terminal
  experience showcasing the `curl | sh` install, the 6-step onboarding
  grid, E2B templates, and live profile commands. Scanline CRT effect,
  matrix rain, copy-to-clipboard snippets.
- **🛠️ Cypherpunk Installer (`install.sh`)** — Fully rewritten one-shot
  installer with:
  - Lobster + matrix-rain ANSI animations
  - 256-color palette (LOBSTER 203, NEON 118, CYAN 51, MAGENTA 201, VIOLET 141)
  - Auto profile bootstrap (`default` profile created on first run)
  - Shell integration for `zsh` and `bash` (PATH + completions)
- **🤖 OpenAI Trading Agent** — Reference Solana trading agent wired to
  OpenAI tool-calls with x402 micro-payments.
- **🌐 Cloudflare Workers Fleet** — Edge-deployed MCP + x402 routers.
- **🧠 ACP Registry & Agent Manifests** — `acp_registry/`, `AGENTS/`
  catalog, and `agents-manifest.json` aggregator.
- **🔐 Clawd Vault** — Secrets + policy engine (`clawd-vault-master/`).
- **🧩 Chrome Extension** — Page agent + MCP bridge.
- **📲 WatchApp** — SwiftUI Apple Watch companion (`WatchApp/`).
- **📟 CLI** — `clawd-cli.sh`, `clawd-connect.sh`, registration helpers.

### 📚 Documentation

- Top-level `README.md` expanded with install, E2B, profiles, and demo
  sections.
- `profiles/README.md` — full Hermes-adapted user guide.
- `ONBOARDING.md`, `STACK.md`, `SECURITY.md`, `CONTRIBUTING.md`,
  `INSTALL_SNIPPETS.md` finalized.
- `SECURITY_VAULT_INTEGRATION.md` describing vault ↔ agent wiring.

### 🔒 Security

- Scoped per-profile secrets (no global `.env` leakage across agents).
- Vault policy example (`clawd-vault-master/policy.example.yaml`).

### 🧪 Known Limitations

- Windows support is best-effort via WSL2.
- E2B templates require a valid `E2B_API_KEY`.

---

## Pre-1.0

Earlier iterations were developed in-tree without semantic tags. The
`1.0.0` release represents the first stabilized, publicly-supported
surface.

[1.0.0]: https://github.com/x402agent/openclawd/releases/tag/v1.0.0
