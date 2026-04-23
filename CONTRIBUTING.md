# Contributing to OpenClawd

OpenClawd is a monorepo. Contributions are welcome across runtime code, packages, workers, docs, skills, and agent definitions.

## Before You Start

Use the exact directory casing shown in this repo. `AGENTS/` is not the same as `agents/` on Linux or CI.

Minimum local toolchain:

- Node `20+`
- npm `10+`
- `pnpm` on your `PATH`
- Git

## Setup

```bash
git clone https://github.com/x402agent/openclawd.git
cd openclawd
cp .env.example .env
npm run hooks:install
npm run doctor
npm run install:all
```

Common development commands:

```bash
npm run build:catalog
npm run dev:router
npm run dev:registrar
npm run dev:cli
npm run dev:orchestrator
```

## Where to Contribute

| Area | Path | Notes |
| --- | --- | --- |
| Agent catalog | [`AGENTS/`](./AGENTS/) | Agent metadata, catalog generation, docs |
| Skills | [`skills/`](./skills/) | Add new `SKILL.md` bundles or references |
| Runtime | [`openclawd-stack/`](./openclawd-stack/), [`src/`](./src/) | Core orchestration and runtime work |
| Router | [`clawdrouter/`](./clawdrouter/) | Model routing and payment flow |
| Packages | [`packages/`](./packages/) | Shared SDKs and libraries |
| Edge services | [`workers/`](./workers/) | Cloudflare Workers |
| Browser/UI | [`chrome-extension/`](./chrome-extension/), [`tailclawd/`](./tailclawd/) | User-facing surfaces |
| Docs | [`docs/articles/`](./docs/articles/) | Architecture, guides, tutorials |

## Contribution Rules

1. Keep secrets out of git. Never commit `.env`, private keys, API tokens, or provider exports.
2. Use the root scripts when they exist. They document the supported entry points for new contributors.
3. Keep changes scoped. Large cross-cutting refactors should explain the migration path in the PR.
4. Update docs when behavior changes. A stale install or onboarding path is treated as a bug.
5. Preserve existing user changes in the worktree unless a task explicitly asks you to overwrite them.

## Testing and Release Checks

Run the checks relevant to your change before opening a PR:

```bash
npm run guard:worktree
npm run doctor
npm run release:check
npm run build:catalog
npm run lint
npm run typecheck
```

If your change touches a subproject with its own test suite, run that suite from the subproject as well and include the exact command in the PR.

## Pull Requests

Each PR should include:

- a clear summary of what changed
- the commands you ran to verify it
- screenshots or terminal output when the change affects user-facing surfaces
- any follow-up work or known limitations

Prefer small, reviewable PRs over bundle drops.

## Skills and Agents

For agent or skill contributions:

- use [`AGENTS/README.md`](./AGENTS/README.md) for agent-specific expectations
- use [`skills/README.md`](./skills/README.md) for skill structure and publishing context
- keep naming, metadata, and examples consistent with the rest of the tree

## Security Reporting

Do not open a public issue for a secret leak or exploitable vulnerability. Use the process in [SECURITY.md](./SECURITY.md) instead.

## License

By contributing, you agree that your contributions will be licensed under the MIT license in [LICENSE.md](./LICENSE.md).
