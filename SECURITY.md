# Security Policy

OpenClawd is designed to be forked and deployed publicly. Treat repo hygiene as part of the security model.

## Supported Branch

| Branch | Supported |
| --- | --- |
| `main` | Yes |

## Reporting a Vulnerability

If you find a vulnerability, a leaked secret, or a credential that appears live:

1. Do not open a public issue.
2. Open a private GitHub security advisory for this repository.
3. Include impact, affected paths, reproduction steps, and any suggested mitigation.
4. If the issue is a secret leak, rotate the credential immediately before doing anything else.

## What Counts as a Security Issue

- committed secrets or deploy credentials
- wallet or signing-flow bugs
- auth or session bypasses
- unsafe remote code execution paths
- MCP tool exposure without proper controls
- payment-verification bugs in x402 or gateway flows

## Secret Handling Rules

- Use `.env.example` files as templates only.
- Never commit `.env`, `.env.local`, private keys, or provider exports.
- For hosted deployments, store secrets in provider dashboards or secret stores.
- If a secret lands in git history, rotate it first and then scrub history with `git filter-repo` or BFG before republishing.

## Public Release Checklist

Run these before merging release-facing changes or publishing a fork:

```bash
npm run doctor
npm run release:check
```

`release:check` is intended to catch:

- tracked env files
- likely committed secrets
- broken top-level doc references
- junk files that should not ship in a public repo

## Scope and Expectations

OpenClawd contains multiple subprojects and experimental areas. Not every directory is production-ready, but every public-facing path should remain safe to clone, inspect, and build without exposing real credentials.

If you are unsure whether something is sensitive, assume it is and report it privately.
