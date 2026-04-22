# OpenClawd Directory Audit Report
**Date:** 2026-04-22  
**Purpose:** Identify cleanup candidates and security hardening opportunities

---

## 🚨 DELETE (Safe to Remove)

| Directory | Why Delete | Action |
|-----------|------------|--------|
| `tailclawd-backup/` | Identical copy of tailclawd/, no references in codebase | `rm -rf tailclawd-backup/` |
| `telegram/` | Empty placeholder - only README.md, no actual code | `rm -rf telegram/` |
| `docs/` | Redundant with `articles/` - partial copy of documentation | `rm -rf docs/` |
| `moltbook-agent/` | Standalone agent repo, not integrated | `rm -rf moltbook-agent/` |
| `llm-wiki-tang/` | External tool reference, not integrated | `rm -rf llm-wiki-tang/` |

---

## ⚠️ REVIEW (Need Investigation Before Delete)

| Directory | Concern | Action |
|-----------|---------|--------|
| `acp_registry/` | Legacy JSON templates vs live catalog in AGENTS/ | Archive JSON files, delete generate.mjs if unused |
| `OS/` | Misleading name - contains trading bots with sniper code | Review sniper bot security, rename to bots/ |
| `clawd-vault-master/` | Duplicates skills/clawd-vault/ - source or fork? | Verify deployment source, keep only one |
| `api-registrar/` | Deploys agent.json to static host - is this used? | Confirm no active references |
| `solana-go-main/` | Go SDK reference - is this actively used? | Check for Go code in project |
| `WatchApp/` | Disconnected watchOS Swift project, no references | Archive or delete if not maintained |
| `chrome-extension/` | Partial implementation - verify current status | Check if extension is published/active |

---

## ✅ KEEP (Core Infrastructure)

| Directory | Purpose |
|-----------|---------|
| `AGENTS/` | 50 production AI agents - CORE |
| `clawdhub/` | Main frontend (hub.solanaclawd.com) |
| `openclawd-stack/` | Runtime stack with orchestrator |
| `MCP/` | MCP server integrations |
| `skills/` | Skills marketplace (9.5MB) |
| `packages/` | Shared packages (311MB) |
| `plugin.delivery/` | Plugin system |
| `workers/` | Cloudflare edge workers |
| `x402-openrouter-main/` | Payment protocol gateway |
| `CLI/` | Command line tools |
| `src/` | Core TypeScript engine |
| `tailclawd/` | solana-clawd workspace |
| `solana-clawd/` | CLI package |
| `examples/` | Example scripts |
| `scripts/` | Build/deploy scripts |
| `NPM/` | npm packages |

---

## 🔒 Security Hardening Opportunities

### High Priority
1. **OS/trading-bots/**: Review sniper bot executor code for secure key handling
2. **api-registrar/**: Ensure agent.json doesn't expose sensitive data
3. **x402-openrouter-main/**: Verify Ed25519 signature validation is correct

### Medium Priority
1. **CLAWDRUNER**: Check 57-model router for rate limiting
2. **MCP/vault-mcp/**: Review credential handling
3. **skills/clawd-vault/**: Ensure audit logging is comprehensive

### Low Priority
1. **chrome-extension/**: Verify Privy wallet integration security
2. **WatchApp/**: If kept, review WalletState.swift key management

---

## 📋 Proposed Cleanup Commands

```bash
# DELETE (safe removal)
rm -rf tailclawd-backup/
rm -rf telegram/
rm -rf docs/
rm -rf moltbook-agent/
rm -rf llm-wiki-tang/

# RENAME (for clarity)
mv OS bots  # "OS" is misleading - it's trading bots

# ARCHIVE (move to archive for later review)
mkdir -p archive/acp_registry-legacy
mv acp_registry/agent*.json archive/acp_registry-legacy/
rm -f acp_registry/generate.mjs
```

---

## 📊 Size Summary (for reference)

| Directory | Approx Size | Type |
|-----------|-------------|------|
| packages/ | 311 MB | Core |
| solana-clawd/ | ~50 MB | Core |
| skills/ | 9.5 MB | Core |
| plugin.delivery/ | 7.8 MB | Active |
| openclawd-stack/ | ~15 MB | Core |
| clawd-vault-master/ | 564 KB | Review |
| clawdhub/ | ~20 MB | Core |
| workers/ | ~1 MB | Active |

---

## 🏗️ Project Structure After Cleanup

```
openclawd/
├── AGENTS/           # 50 AI agents (CORE)
├── clawdhub/         # Frontend marketplace (CORE)
├── openclawd-stack/  # Runtime stack (CORE)
├── MCP/              # MCP integrations (ACTIVE)
├── skills/           # Skills marketplace (ACTIVE)
├── CLI/              # Command line tools (ACTIVE)
├── workers/          # Edge workers (ACTIVE)
├── x402-openrouter/  # Payment gateway (ACTIVE)
├── packages/         # Shared packages (CORE)
├── plugin.delivery/  # Plugin system (ACTIVE)
├── src/              # Core engine (CORE)
├── tailclawd/        # solana-clawd (CORE)
├── solana-clawd/     # CLI package (CORE)
├── examples/         # Example scripts (ACTIVE)
├── scripts/          # Build scripts (ACTIVE)
├── api-registrar/    # Agent registration (REVIEW)
├── clawdrouter/      # Router service (KEEP)
├── clawd-cloud-os/   # Cloud OS (KEEP)
├── clawd-vault-master/ # Security vault (REVIEW)
└── ...
```

---

## Next Steps

1. **Immediate:** Delete the 5 safe directories
2. **This week:** Review the 8 "REVIEW" directories
3. **Security audit:** Deep-dive trading bots and payment systems
4. **Documentation:** Update README to reflect cleaner structure