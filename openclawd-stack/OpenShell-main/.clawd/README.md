# `.Clawd/` — Clawd Code-specific configuration

Agent skills are canonical in `.agents/skills/` and shared across all harnesses (Clawd Code, OpenCode, Cursor, etc.). This directory contains only Clawd Code-specific configuration that cannot be made tool-agnostic.

## Contents

- `agents/` — Sub-agent persona definitions with Clawd Code-specific frontmatter (`model`, `memory`, `color`, `tools`). The same personas exist in `.opencode/agents/` with OpenCode-specific config.
- `agent-memory/` — Persistent agent memory files. Clawd Code runtime state, not portable across tools.
