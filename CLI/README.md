# OpenClawd CLI

Command-line tools for the OpenClawd ecosystem.

## Tools

### clawd-register.ts

Agent registration tool for on-chain identity management.

### clawd-cli.sh

Main CLI wrapper for OpenClawd operations.

### clawd-connect.sh

Connection management script for gateway and node pairing.

## Installation

```bash
# Make scripts executable
chmod +x CLI/*.sh

# Add to PATH (optional)
export PATH="$PATH:$(pwd)/CLI"
```

## Usage

```bash
# Register an agent
ts-node CLI/clawd-register.ts --agent your-agent.json

# Connect to gateway
./CLI/clawd-connect.sh --bridge <TAILSCALE_IP>:18790

# Start CLI
./CLI/clawd-cli.sh
```

## Configuration

See `clawd-openclaw-config.json` for default configuration settings.

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)