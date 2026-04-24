# clawd-tui

Open Clawd — a lobster-themed agent TUI built on `@openrouter/agent`.

```
 ██████╗██╗      █████╗ ██╗    ██╗██████╗
██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗
██║     ██║     ███████║██║ █╗ ██║██║  ██║
██║     ██║     ██╔══██║██║███╗██║██║  ██║
╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝
 ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝
```

A minimal, customizable agent terminal. Adaptive input block, streaming tool calls, session persistence, slash commands, approval gates for destructive actions.

## Install

```bash
npm install
cp .env.example .env
# set OPENROUTER_API_KEY in .env

npm start
```

Get an OpenRouter API key at [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).

## Tools

**Client-side:** `file_read`, `file_write`, `file_edit`, `glob`, `grep`, `list_dir`, `shell`

**Server-side (OpenRouter):** `web_search`, `datetime`

## Slash commands

- `/model <id>` — switch the model
- `/new` — start a fresh conversation
- `/session` — show session metadata + token usage
- `/help` — list commands

## Configuration

Edit `agent.config.json` (optional) or use env vars:

```json
{
  "model": "anthropic/claude-opus-4.7",
  "maxSteps": 20,
  "maxCost": 1.0,
  "display": {
    "inputStyle": "block",
    "toolDisplay": "grouped"
  },
  "showBanner": true,
  "requireApproval": ["shell", "file_write", "file_edit"]
}
```

Built from the [create-agent-tui](https://github.com/openrouter-agent) skill.
