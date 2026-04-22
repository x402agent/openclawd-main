# ClawdVault - Security Vault Integration

## Overview

This document describes the integration of **Hermes Vault** into the OpenClawd codebase as **ClawdVault** - a security-focused agent skill that transforms the codebase into a hardened, threat-monitored vault.

## What is ClawdVault?

ClawdVault is the OpenClawd implementation of Hermes Vault, providing:

- 🔍 **Security Risk Scanner** - Scans entire codebase for secrets, vulnerabilities, and misconfigurations
- 🛡️ **Auto-Hardening** - Automatically fixes common security issues
- 🔐 **Credential Vault** - Secure credential management with AES-GCM encryption
- 📋 **Policy Enforcement** - Enforces security policies across agents
- 🐾 **Clawd Persona** - Security-focused agent with vault/guardian theming

## Architecture

```
openclawd/
├── skills/
│   ├── clawd-vault/              # Main vault skill
│   │   ├── SKILL.md            # Core vault operations
│   │   ├── security-scanner.md # Code scanning capabilities
│   │   └── auto-hardener.md    # Auto-hardening rules
├── agents/
│   └── vault-agent.json         # Vault guardian agent config
├── MCP/
│   └── vault-mcp/              # MCP server for vault tools
│       ├── src/
│       └── package.json
└── services/
    └── hermes-vault/           # Python backend (optional)
```

## Components

### 1. ClawdVault Skill
The main skill that provides security scanning and vault operations.

### 2. Vault Agent
A pre-configured agent persona embodying the vault guardian theme.

### 3. MCP Server (Optional)
TypeScript MCP server exposing vault tools to agents.

## Usage

```bash
# Run a security scan
npx claudette vault scan --path . --full

# Scan for secrets
npx claudette vault scan --secrets

# Auto-harden codebase
npx claudette vault harden --auto

# Check policy compliance
npx claudette vault policy --check
```

## Security Checks Performed

1. **Secret Detection**
   - API keys (AWS, GCP, Azure, Stripe, etc.)
   - Private keys (SSH, GPG, Solana, Ethereum)
   - Database credentials
   - Environment variables with sensitive data
   - Hardcoded passwords

2. **Vulnerability Detection**
   - SQL injection patterns
   - XSS vulnerabilities
   - Insecure deserialization
   - Path traversal risks
   - Dependency vulnerabilities

3. **Configuration Hardening**
   - File permissions
   - Git history exposure
   - Debug mode left enabled
   - CORS misconfigurations
   - Insecure protocols

4. **Code Quality Security**
   - Unsafe eval() usage
   - Dynamic code execution
   - Insecure random number generation
   - Hardcoded credentials in code

## Integration with OpenClawd

ClawdVault integrates with OpenClawd through:

- **Skills System**: Full skill with markdown documentation
- **Agent Persona**: Pre-configured vault guardian agent
- **MCP Tools**: Security scanning tools available to all agents
- **Policy System**: Security policies enforced by the system

## Files Created

- `skills/clawd-vault/SKILL.md` - Main vault skill
- `agents/vault-agent.json` - Vault agent configuration
- `MCP/vault-mcp/` - MCP server package
- `services/hermes-vault/` - Python integration (symlink or copy)
