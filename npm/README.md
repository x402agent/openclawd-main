# npm Packages

npm package installers for the OpenClawd ecosystem — solanaclawd.com

## Packages

### clawdbot-installer

Installation scripts for the ClawdBot CLI tool.

### solanaos-installer

Installation scripts for the SolanaOS CLI tool.

## Usage

```bash
# Install ClawdBot (agents + skills CLI)
npm i -g @clawd/cli

# Install SolanaOS
npm i -g solanaos-cli

# Or use npx directly
npx clawdhub install <skill>
```

## ClawdHub CLI

```bash
# Install skills
npx clawdhub install pumpfun-trading
npx clawdhub install solana-clawd

# List installed skills
npx clawdhub list

# Search skills
npx clawdhub search solana

# Publish a skill
npx clawdhub publish ./my-skill --slug my-skill

# Update a skill
npx clawdhub update <skill-slug>
```

## Curl Commands

```bash
# Browse skills marketplace
curl https://solanaclawd.com/marketplace/skills | jq '.'

# Get skill details
curl https://solanaclawd.com/api/skills/pumpfun-trading

# List all skills
curl https://solanaclawd.com/api/skills | jq '.'

# Search skills
curl "https://solanaclawd.com/api/skills/search?q=solana"

# Get featured skills
curl https://solanaclawd.com/api/skills/featured

# Get marketplace trending
curl https://solanaclawd.com/api/marketplace/trending

# Install skill (download SKILL.md)
curl -s "https://solanaclawd.com/api/skills/pumpfun-trading/download" -o SKILL.md
```

## CLI Scripts

The [`../CLI/`](CLI/) directory contains shell scripts:

```bash
# Main CLI
./CLI/clawd-cli.sh skills:list
./CLI/clawd-cli.sh skills:install pumpfun-trading
./CLI/clawd-cli.sh marketplace:trending

# Connection script
./CLI/clawd-connect.sh skills:search solana
./CLI/clawd-connect.sh payment:supported
```

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)