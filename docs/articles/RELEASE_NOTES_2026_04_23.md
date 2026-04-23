# 🦞 OpenClawd Release Notes — April 23, 2026

> **The Lobster Evolution** — Unified branding, ClawdRouter integration, and the 5 SOL Percolator Challenge

---

## 🦞 Unified Lobster Branding

Today marks the beginning of OpenClawd's **Lobster Evolution** — a unified visual identity across all CLI tools and services.

### Clawd Code CLI Gets Lobster-Themed ASCII Art

The `clawd-code-cli` now features stunning lobster-themed ASCII art:

```
    ╔═══════════════════════════════════════════════════════════════════════╗
    ║                                                                       ║
    ║   ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄   ║
    ║  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓   ║
    ║  ▓   ██╗   ██╗ ██████╗ ██████╗ ███╗   ██╗██╗ ██████╗         ▓   ║
    ║  ▓   ██║   ██║██╔═══██╗██╔══██╗████╗  ██║██║██╔════╝         ▓   ║
    ║  ▓   ███████║██║   ██║██████╔╝██╔██╗ ██║██║██║  ███╗        ▓   ║
    ║  ▓   ██╔══██║██║   ██║██╔══██╗██║╚██╗██║██║██║   ██║        ▓   ║
    ║  ▓   ██║   ██║╚██████╔╝██║  ██║██║ ╚████║██║╚██████╔╝        ▓   ║
    ║  ▓   ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝ ╚═════╝         ▓   ║
    ║                                                                       ║
    ║          🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞🦞          ║
    ║          ░  🦞  C L A W D  C O D E  C L I  🦞  ░          ║
    ║          "Claws that code, brains that deploy"                        ║
    ╚═══════════════════════════════════════════════════════════════════════╝
```

**Features:**
- Block letter "CLAWD" branding
- 20-lobster emoji row
- Shell-style borders with `▓` characters
- Solana integration highlights (OODA Loop, MCP, Deploy, Wallet)
- Enhanced welcome messages with crab emoji (🦀) variety

### ClawdRouter Joins the Lobster Party

The `clawdrouter` now shares the same lobster-themed startup experience:

```bash
cd clawdrouter
npm run dev
```

**ClawdRouter Features:**
- 55+ models across 9 providers
- USDC x402 micropayments
- Ed25519 wallet authentication
- <1ms smart routing
- OODA Loop strategy support

---

## 🦂 The 5 SOL Percolator Challenge

**Can you extract 5 SOL from an immutable Percolator market?**

We've created a security-focused challenge that invites whitehat hackers to test the Percolator perpetuals protocol:

### Quick Start

```bash
cd percolator-cli-master

# Deploy immutable market with 5 SOL insurance
chmod +x scripts/deploy-immutable.sh
./scripts/deploy-immutable.sh

# Analyze for vulnerabilities
./scripts/challenge-analyze.sh --auto
```

### Market Properties

| Property | Value |
|----------|-------|
| Admin Key | BURNED (11111111111111111111111111111111) |
| Oracle Authority | BURNED |
| Insurance Fund | 5,000,000,000 lamports (5 SOL) |
| Crank | Permissionless |

### Attack Vectors

1. **Oracle Manipulation** — Pyth price feed exploitation
2. **Liquidation Circuit Bugs** — Fee calculation edge cases
3. **U128 Math Overflow** — Boundary condition exploits
4. **Funding Rate** — EWMA mark manipulation
5. **Slot Management** — Freelist vs bitmap mismatches
6. **CPI Attacks** — Matcher program vulnerabilities

### Documentation

- `PERCOLATOR_INTEGRATION.md` — Architecture guide
- `PERCOLATOR_SECURITY_AUDIT.md` — Full security audit
- `skills/percolator/CLAUDE.md` — Skill guide

---

## 📦 Package Updates

### @openclawd/percolator

New npm package for Percolator perpetuals CLI:

```bash
npm i @openclawd/percolator
```

**30 commands for perpetuals trading:**
- Market Management — `init-market`, `init-lp`, `list-markets`
- Trading — `init-user`, `deposit`, `withdraw`, `trade-cpi`
- Oracle — `push-oracle-price`, `set-oracle-authority`
- Insurance — `topup-insurance`, `withdraw-insurance`, `resolve-market`
- Inspection — `slab:get/header/config/nonce/engine`

---

## 🛠️ Developer Experience

### Updated ONBOARDING.md

New section added to help contributors get started with CLI tools:

```bash
# Clawd Code CLI - AI-powered coding assistant
cd clawd-code-cli && npm install && bun run dev
clawd --prompt "deploy my Solana program"

# ClawdRouter - LLM routing gateway
cd clawdrouter && npm install && npm run dev
clawdrouter models    # List all available models
clawdrouter doctor    # Run diagnostics
```

---

## 🎯 What's Next?

- [ ] More lobster-themed ASCII art across the ecosystem
- [ ] ClawdHub marketplace integration
- [ ] Additional Percolator challenge levels
- [ ] Enhanced OODA loop visualizations

---

## 🦞 About OpenClawd

OpenClawd is the **open-source monorepo for building, running, and monetizing Solana-native AI agents**. Inspired by Nous Research's Hermes philosophy — agents that think, act, and settle autonomously on-chain.

| Resource | Link |
|----------|------|
| GitHub | [github.com/x402agent/openclawd](https://github.com/x402agent/openclawd) |
| Twitter | [@clawddevs](https://x.com/clawddevs) |
| Telegram | [@clawdtoken](https://t.me/clawdtoken) |
| Website | [solanaclawd.com](https://solanaclawd.com) |

**$CLAWD Token:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

---

*Built by 8BIT Labs • Inspired by Nous Research • Powered by xAI Grok • Settled on Solana*
