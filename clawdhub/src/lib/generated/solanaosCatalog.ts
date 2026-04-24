export const solanaOsCatalog = {
  "generatedAt": "2026-04-24T01:05:18.482Z",
  "repositoryUrl": "https://github.com/x402agent/SolanaOS",
  "siteUrl": "https://seeker.solanaos.net",
  "skillsHubUrl": "https://seeker.solanaos.net/solanaos",
  "troubleshootingUrl": "https://seeker.solanaos.net/setup/troubleshooting",
  "packageCount": 60,
  "skillCount": 94,
  "bundledMobileSkills": [
    {
      "slug": "seeker-daemon-ops",
      "title": "Daemon Ops",
      "summary": "Bring up the Seeker daemon, validate commands, and recover common runtime issues."
    },
    {
      "slug": "session-logs",
      "title": "Session Logs",
      "summary": "Recover historical context from local SolanaOS session logs."
    },
    {
      "slug": "solana-research-brief",
      "title": "Research Brief",
      "summary": "Produce compact token briefs directly from the runtime."
    },
    {
      "slug": "pumpfun-trading",
      "title": "Pump Trading",
      "summary": "Reference pump.fun trade flow and risk controls from mobile."
    },
    {
      "slug": "github",
      "title": "GitHub",
      "summary": "Operate PRs, issues, and CI from a phone-first terminal flow."
    },
    {
      "slug": "summarize",
      "title": "Summarize",
      "summary": "Summarize articles, files, and videos without leaving the device."
    },
    {
      "slug": "weather",
      "title": "Weather",
      "summary": "Fast current weather and short forecast checks."
    },
    {
      "slug": "solana-formal-verification",
      "title": "Formal Verification",
      "summary": "Mathematically prove Solana program correctness with Lean 4 proofs and QEDGen."
    }
  ],
  "featuredSections": [
    {
      "title": "Core Runtime",
      "summary": "The main SolanaOS computer loop: agent state, config, sessions, storage, and orchestration.",
      "packages": [
        "agent",
        "agentregistry",
        "config",
        "daemon",
        "routing",
        "runtimeenv",
        "session",
        "state",
        "storage"
      ]
    },
    {
      "title": "Gateway & API",
      "summary": "Public and private control surfaces for apps, dashboards, remote gateways, and Seeker pairing.",
      "packages": [
        "gateway",
        "controlapi",
        "node",
        "identity",
        "health"
      ]
    },
    {
      "title": "Seeker & Mobile",
      "summary": "Phone-native packages for Seeker bridge, mobile voice, and the on-device SolanaOS experience.",
      "packages": [
        "seeker",
        "voice",
        "channels",
        "nanobot"
      ]
    },
    {
      "title": "Markets & Trading",
      "summary": "Chain access, market data, strategies, launches, perps, payments, and miner-linked finance flows.",
      "packages": [
        "solana",
        "onchain",
        "strategy",
        "hyperliquid",
        "aster",
        "pumplaunch",
        "x402",
        "bitaxe",
        "tamagochi"
      ]
    },
    {
      "title": "solana-claude Engine",
      "summary": "Agentic engine with OODA loops, 31 MCP tools, 7 agents, blockchain buddies, 3-tier memory, 128-bit risk engine, and AgentWallet vault.",
      "packages": [
        "agent",
        "memory",
        "solana",
        "onchain",
        "strategy",
        "x402"
      ]
    }
  ],
  "packages": [
    {
      "name": "acp",
      "path": "pkg/acp",
      "importPath": "github.com/x402agent/SolanaOS/pkg/acp",
      "fileCount": 3,
      "sizeBytes": 14019,
      "category": "Utilities",
      "summary": "acp package from the SolanaOS computer runtime.",
      "keyFiles": [
        "compressor.go",
        "redact.go",
        "server.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/acp"
    },
    {
      "name": "agent",
      "path": "pkg/agent",
      "importPath": "github.com/x402agent/SolanaOS/pkg/agent",
      "fileCount": 17,
      "sizeBytes": 117867,
      "category": "Core Runtime",
      "summary": "Iterative agent loop, prompts, scratchpad, tool execution, and live OODA context.",
      "keyFiles": [
        "agent.go",
        "channels.go",
        "compressor.go",
        "hooks.go",
        "insights.go",
        "killswitch.go",
        "live_context.go",
        "model_metadata.go",
        "ooda.go",
        "prompt_caching.go",
        "prompts.go",
        "redact.go",
        "runtime_snapshot.go",
        "scratchpad.go",
        "smart_routing.go",
        "title_generator.go",
        "toolexec.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/agent"
    },
    {
      "name": "agentregistry",
      "path": "pkg/agentregistry",
      "importPath": "github.com/x402agent/SolanaOS/pkg/agentregistry",
      "fileCount": 3,
      "sizeBytes": 18461,
      "category": "Core Runtime",
      "summary": "On-chain agent registration, sync state, and public Seeker hub metadata wiring.",
      "keyFiles": [
        "handlers.go",
        "service.go",
        "state.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/agentregistry"
    },
    {
      "name": "aster",
      "path": "pkg/aster",
      "importPath": "github.com/x402agent/SolanaOS/pkg/aster",
      "fileCount": 27,
      "sizeBytes": 1163714,
      "category": "Markets",
      "summary": "Aster market integrations, docs, and perpetuals data access.",
      "keyFiles": [
        "client.go",
        "futures.go",
        "market.go",
        "tools.go",
        "trader.go",
        "types.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/aster"
    },
    {
      "name": "auth",
      "path": "pkg/auth",
      "importPath": "github.com/x402agent/SolanaOS/pkg/auth",
      "fileCount": 1,
      "sizeBytes": 1926,
      "category": "Operator Interfaces",
      "summary": "Authentication helpers for runtime and linked surfaces.",
      "keyFiles": [
        "auth.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/auth"
    },
    {
      "name": "autoreply",
      "path": "pkg/autoreply",
      "importPath": "github.com/x402agent/SolanaOS/pkg/autoreply",
      "fileCount": 2,
      "sizeBytes": 6583,
      "category": "Operator Interfaces",
      "summary": "Automatic reply behaviors for chat and operator command flows.",
      "keyFiles": [
        "autoreply_test.go",
        "autoreply.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/autoreply"
    },
    {
      "name": "bitaxe",
      "path": "pkg/bitaxe",
      "importPath": "github.com/x402agent/SolanaOS/pkg/bitaxe",
      "fileCount": 3,
      "sizeBytes": 27968,
      "category": "Hardware",
      "summary": "Bitaxe miner APIs, monitoring, and miner control primitives.",
      "keyFiles": [
        "agent.go",
        "client.go",
        "pet.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/bitaxe"
    },
    {
      "name": "blockchain",
      "path": "pkg/blockchain",
      "importPath": "github.com/x402agent/SolanaOS/pkg/blockchain",
      "fileCount": 1,
      "sizeBytes": 27913,
      "category": "Utilities",
      "summary": "blockchain package from the SolanaOS computer runtime.",
      "keyFiles": [
        "queries.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/blockchain"
    },
    {
      "name": "browseruse",
      "path": "pkg/browseruse",
      "importPath": "github.com/x402agent/SolanaOS/pkg/browseruse",
      "fileCount": 3,
      "sizeBytes": 27662,
      "category": "Operator Interfaces",
      "summary": "Browser-use integration for agentic browser tasks and automation.",
      "keyFiles": [
        "browseruse_test.go",
        "browseruse.go",
        "providers.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/browseruse"
    },
    {
      "name": "bus",
      "path": "pkg/bus",
      "importPath": "github.com/x402agent/SolanaOS/pkg/bus",
      "fileCount": 1,
      "sizeBytes": 4541,
      "category": "Core Runtime",
      "summary": "Internal event bus used across daemon, node, and operator flows.",
      "keyFiles": [
        "bus.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/bus"
    },
    {
      "name": "channels",
      "path": "pkg/channels",
      "importPath": "github.com/x402agent/SolanaOS/pkg/channels",
      "fileCount": 8,
      "sizeBytes": 69915,
      "category": "Operator Interfaces",
      "summary": "Telegram, Discord, and X channel formatting and delivery logic.",
      "keyFiles": [
        "channels.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/channels"
    },
    {
      "name": "commands",
      "path": "pkg/commands",
      "importPath": "github.com/x402agent/SolanaOS/pkg/commands",
      "fileCount": 1,
      "sizeBytes": 5436,
      "category": "Core Runtime",
      "summary": "Shared command definitions and runtime invocation helpers.",
      "keyFiles": [
        "commands.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/commands"
    },
    {
      "name": "config",
      "path": "pkg/config",
      "importPath": "github.com/x402agent/SolanaOS/pkg/config",
      "fileCount": 5,
      "sizeBytes": 79764,
      "category": "Core Runtime",
      "summary": "Global SolanaOS configuration, defaults, public site URLs, and env overrides.",
      "keyFiles": [
        "config_test.go",
        "config.go",
        "dotenv.go",
        "site.go",
        "version.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/config"
    },
    {
      "name": "constants",
      "path": "pkg/constants",
      "importPath": "github.com/x402agent/SolanaOS/pkg/constants",
      "fileCount": 1,
      "sizeBytes": 1068,
      "category": "Core Runtime",
      "summary": "Shared constants for runtime-wide behavior and naming.",
      "keyFiles": [
        "constants.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/constants"
    },
    {
      "name": "controlapi",
      "path": "pkg/controlapi",
      "importPath": "github.com/x402agent/SolanaOS/pkg/controlapi",
      "fileCount": 18,
      "sizeBytes": 46666,
      "category": "Gateway & API",
      "summary": "Public control API services exposed to apps, dashboards, and remote clients.",
      "keyFiles": [
        "router_test.go",
        "router.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/controlapi"
    },
    {
      "name": "cron",
      "path": "pkg/cron",
      "importPath": "github.com/x402agent/SolanaOS/pkg/cron",
      "fileCount": 2,
      "sizeBytes": 2014,
      "category": "Automation",
      "summary": "Scheduled job execution support for recurring runtime tasks.",
      "keyFiles": [
        "cron.go",
        "schedule.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/cron"
    },
    {
      "name": "daemon",
      "path": "pkg/daemon",
      "importPath": "github.com/x402agent/SolanaOS/pkg/daemon",
      "fileCount": 19,
      "sizeBytes": 513059,
      "category": "Gateway & API",
      "summary": "The operator daemon: chat, miner commands, gateway orchestration, and runtime control.",
      "keyFiles": [
        "browseruse_handlers.go",
        "chart_rug_scope_handlers.go",
        "coding_nl.go",
        "cua_handlers.go",
        "daemon_test.go",
        "daemon.go",
        "desktop_handlers.go",
        "e2b_handlers.go",
        "github_handlers.go",
        "hl_handlers.go",
        "hl_stream.go",
        "honcho_handlers.go",
        "media_nl.go",
        "pair_handlers.go",
        "personality.go",
        "remote_control_handlers.go",
        "skill_handlers.go",
        "twitter_gateway.go",
        "x_commands.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/daemon"
    },
    {
      "name": "delegation",
      "path": "pkg/delegation",
      "importPath": "github.com/x402agent/SolanaOS/pkg/delegation",
      "fileCount": 1,
      "sizeBytes": 7029,
      "category": "Automation",
      "summary": "Subtask delegation and parallel execution helpers.",
      "keyFiles": [
        "delegation.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/delegation"
    },
    {
      "name": "devices",
      "path": "pkg/devices",
      "importPath": "github.com/x402agent/SolanaOS/pkg/devices",
      "fileCount": 1,
      "sizeBytes": 3226,
      "category": "Hardware",
      "summary": "Device models and capability descriptors for runtime-managed hardware.",
      "keyFiles": [
        "devices.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/devices"
    },
    {
      "name": "e2b",
      "path": "pkg/e2b",
      "importPath": "github.com/x402agent/SolanaOS/pkg/e2b",
      "fileCount": 3,
      "sizeBytes": 32504,
      "category": "Automation",
      "summary": "E2B integration for isolated execution environments.",
      "keyFiles": [
        "browser_agent.go",
        "client.go",
        "desktop.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/e2b"
    },
    {
      "name": "fileutil",
      "path": "pkg/fileutil",
      "importPath": "github.com/x402agent/SolanaOS/pkg/fileutil",
      "fileCount": 1,
      "sizeBytes": 1657,
      "category": "Utilities",
      "summary": "Filesystem helpers for runtime-safe file operations.",
      "keyFiles": [
        "fileutil.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/fileutil"
    },
    {
      "name": "gateway",
      "path": "pkg/gateway",
      "importPath": "github.com/x402agent/SolanaOS/pkg/gateway",
      "fileCount": 14,
      "sizeBytes": 83625,
      "category": "Gateway & API",
      "summary": "Gateway transport, discovery, auth, pairing, and remote connection handling.",
      "keyFiles": [
        "bridge_test.go",
        "bridge.go",
        "coding_sessions_test.go",
        "coding_sessions.go",
        "contracts_test.go",
        "contracts.go",
        "convex.go",
        "mesh_ipfs.go",
        "remote_test.go",
        "remote.go",
        "spawn.go",
        "tailscale_test.go",
        "tailscale.go",
        "ws.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/gateway"
    },
    {
      "name": "hardware",
      "path": "pkg/hardware",
      "importPath": "github.com/x402agent/SolanaOS/pkg/hardware",
      "fileCount": 2,
      "sizeBytes": 35648,
      "category": "Hardware",
      "summary": "Hardware abstractions and device-level integration points.",
      "keyFiles": [
        "adapter.go",
        "modulino.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/hardware"
    },
    {
      "name": "health",
      "path": "pkg/health",
      "importPath": "github.com/x402agent/SolanaOS/pkg/health",
      "fileCount": 2,
      "sizeBytes": 3328,
      "category": "Gateway & API",
      "summary": "Health checks and readiness reporting for runtime services.",
      "keyFiles": [
        "health.go",
        "summary.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/health"
    },
    {
      "name": "heartbeat",
      "path": "pkg/heartbeat",
      "importPath": "github.com/x402agent/SolanaOS/pkg/heartbeat",
      "fileCount": 1,
      "sizeBytes": 1738,
      "category": "Automation",
      "summary": "Heartbeat writing and liveness signaling for agents and devices.",
      "keyFiles": [
        "heartbeat.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/heartbeat"
    },
    {
      "name": "honcho",
      "path": "pkg/honcho",
      "importPath": "github.com/x402agent/SolanaOS/pkg/honcho",
      "fileCount": 2,
      "sizeBytes": 29616,
      "category": "Intelligence",
      "summary": "Honcho memory and social cognition integration.",
      "keyFiles": [
        "client_test.go",
        "client.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/honcho"
    },
    {
      "name": "hyperliquid",
      "path": "pkg/hyperliquid",
      "importPath": "github.com/x402agent/SolanaOS/pkg/hyperliquid",
      "fileCount": 5,
      "sizeBytes": 36022,
      "category": "Markets",
      "summary": "Hyperliquid streams, triggers, and perp-side market execution helpers.",
      "keyFiles": [
        "api.go",
        "hl.go",
        "signing.go",
        "types.go",
        "ws.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/hyperliquid"
    },
    {
      "name": "identity",
      "path": "pkg/identity",
      "importPath": "github.com/x402agent/SolanaOS/pkg/identity",
      "fileCount": 1,
      "sizeBytes": 1478,
      "category": "Gateway & API",
      "summary": "Identity primitives for device, gateway, and agent ownership.",
      "keyFiles": [
        "identity.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/identity"
    },
    {
      "name": "learning",
      "path": "pkg/learning",
      "importPath": "github.com/x402agent/SolanaOS/pkg/learning",
      "fileCount": 6,
      "sizeBytes": 35692,
      "category": "Intelligence",
      "summary": "Learning loops, evidence capture, and skill improvement state.",
      "keyFiles": [
        "learning.go",
        "review.go",
        "session_search.go",
        "skillforge.go",
        "user_model.go",
        "util.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/learning"
    },
    {
      "name": "llm",
      "path": "pkg/llm",
      "importPath": "github.com/x402agent/SolanaOS/pkg/llm",
      "fileCount": 7,
      "sizeBytes": 81947,
      "category": "Intelligence",
      "summary": "LLM clients, orchestration helpers, and model-facing runtime utilities.",
      "keyFiles": [
        "anthropic.go",
        "llamacpp.go",
        "mistral_audio.go",
        "openrouter_test.go",
        "openrouter.go",
        "xai_test.go",
        "xai.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/llm"
    },
    {
      "name": "logger",
      "path": "pkg/logger",
      "importPath": "github.com/x402agent/SolanaOS/pkg/logger",
      "fileCount": 1,
      "sizeBytes": 2373,
      "category": "Utilities",
      "summary": "Structured logging helpers for SolanaOS services.",
      "keyFiles": [
        "logger.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/logger"
    },
    {
      "name": "mcp",
      "path": "pkg/mcp",
      "importPath": "github.com/x402agent/SolanaOS/pkg/mcp",
      "fileCount": 1,
      "sizeBytes": 2528,
      "category": "Operator Interfaces",
      "summary": "Model Context Protocol glue for exposing runtime tools.",
      "keyFiles": [
        "mcp.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/mcp"
    },
    {
      "name": "media",
      "path": "pkg/media",
      "importPath": "github.com/x402agent/SolanaOS/pkg/media",
      "fileCount": 2,
      "sizeBytes": 10355,
      "category": "Operator Interfaces",
      "summary": "Media parsing and attachment handling helpers.",
      "keyFiles": [
        "media.go",
        "pdf.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/media"
    },
    {
      "name": "memory",
      "path": "pkg/memory",
      "importPath": "github.com/x402agent/SolanaOS/pkg/memory",
      "fileCount": 7,
      "sizeBytes": 58676,
      "category": "Intelligence",
      "summary": "Persistent epistemic memory engine for known, learned, and inferred state.",
      "keyFiles": [
        "epistemological.go",
        "honcho_adapter.go",
        "honcho_vault.go",
        "memory.go",
        "recorder.go",
        "types.go",
        "vault.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/memory"
    },
    {
      "name": "migrate",
      "path": "pkg/migrate",
      "importPath": "github.com/x402agent/SolanaOS/pkg/migrate",
      "fileCount": 1,
      "sizeBytes": 2052,
      "category": "Utilities",
      "summary": "Migration helpers for runtime state and storage evolution.",
      "keyFiles": [
        "migrate.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/migrate"
    },
    {
      "name": "nanobot",
      "path": "pkg/nanobot",
      "importPath": "github.com/x402agent/SolanaOS/pkg/nanobot",
      "fileCount": 5,
      "sizeBytes": 81357,
      "category": "Operator Interfaces",
      "summary": "NanoBot server and web API layers for SolanaOS bot experiences.",
      "keyFiles": [
        "auth.go",
        "das_api.go",
        "server.go",
        "wallet_api.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/nanobot"
    },
    {
      "name": "node",
      "path": "pkg/node",
      "importPath": "github.com/x402agent/SolanaOS/pkg/node",
      "fileCount": 3,
      "sizeBytes": 21674,
      "category": "Gateway & API",
      "summary": "Node bridge logic used by the mobile/desktop runtime surfaces.",
      "keyFiles": [
        "client.go",
        "mdns.go",
        "state.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/node"
    },
    {
      "name": "onchain",
      "path": "pkg/onchain",
      "importPath": "github.com/x402agent/SolanaOS/pkg/onchain",
      "fileCount": 6,
      "sizeBytes": 53335,
      "category": "Markets",
      "summary": "On-chain engine and registry-facing Solana execution primitives.",
      "keyFiles": [
        "engine.go",
        "jupiter.go",
        "pinata.go",
        "registration_file.go",
        "registry_mainnet.go",
        "registry.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/onchain"
    },
    {
      "name": "percolator",
      "path": "pkg/percolator",
      "importPath": "github.com/x402agent/SolanaOS/pkg/percolator",
      "fileCount": 5,
      "sizeBytes": 64384,
      "category": "Utilities",
      "summary": "percolator package from the SolanaOS computer runtime.",
      "keyFiles": [
        "cli.go",
        "engine.go",
        "main.go",
        "ooda.go",
        "vault.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/percolator"
    },
    {
      "name": "pinata",
      "path": "pkg/pinata",
      "importPath": "github.com/x402agent/SolanaOS/pkg/pinata",
      "fileCount": 5,
      "sizeBytes": 49591,
      "category": "Utilities",
      "summary": "pinata package from the SolanaOS computer runtime.",
      "keyFiles": [
        "client.go",
        "deploy.go",
        "groups.go",
        "hub.go",
        "mesh.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/pinata"
    },
    {
      "name": "providers",
      "path": "pkg/providers",
      "importPath": "github.com/x402agent/SolanaOS/pkg/providers",
      "fileCount": 1,
      "sizeBytes": 6053,
      "category": "Intelligence",
      "summary": "Model provider abstractions for OpenAI, OpenRouter, and other backends.",
      "keyFiles": [
        "providers.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/providers"
    },
    {
      "name": "pumplaunch",
      "path": "pkg/pumplaunch",
      "importPath": "github.com/x402agent/SolanaOS/pkg/pumplaunch",
      "fileCount": 2,
      "sizeBytes": 6003,
      "category": "Markets",
      "summary": "Pump launch flows, state, and token launch orchestration.",
      "keyFiles": [
        "service.go",
        "state.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/pumplaunch"
    },
    {
      "name": "research",
      "path": "pkg/research",
      "importPath": "github.com/x402agent/SolanaOS/pkg/research",
      "fileCount": 2,
      "sizeBytes": 18947,
      "category": "Intelligence",
      "summary": "Research trajectory capture and research-ready data tooling.",
      "keyFiles": [
        "research.go",
        "trajectories.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/research"
    },
    {
      "name": "routing",
      "path": "pkg/routing",
      "importPath": "github.com/x402agent/SolanaOS/pkg/routing",
      "fileCount": 1,
      "sizeBytes": 3493,
      "category": "Core Runtime",
      "summary": "Routing logic for requests, sessions, and runtime pathways.",
      "keyFiles": [
        "routing.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/routing"
    },
    {
      "name": "runtimeenv",
      "path": "pkg/runtimeenv",
      "importPath": "github.com/x402agent/SolanaOS/pkg/runtimeenv",
      "fileCount": 1,
      "sizeBytes": 4110,
      "category": "Core Runtime",
      "summary": "Runtime environment resolution and execution context helpers.",
      "keyFiles": [
        "runtimeenv.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/runtimeenv"
    },
    {
      "name": "seeker",
      "path": "pkg/seeker",
      "importPath": "github.com/x402agent/SolanaOS/pkg/seeker",
      "fileCount": 4,
      "sizeBytes": 25032,
      "category": "Seeker & Mobile",
      "summary": "Solana Seeker bridge, mobile integration, and Seeker-specific runtime hooks.",
      "keyFiles": [
        "agent.go",
        "bridge.go",
        "deploy.go",
        "ipfs.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/seeker"
    },
    {
      "name": "session",
      "path": "pkg/session",
      "importPath": "github.com/x402agent/SolanaOS/pkg/session",
      "fileCount": 2,
      "sizeBytes": 3712,
      "category": "Core Runtime",
      "summary": "Session state and conversation lifecycle management.",
      "keyFiles": [
        "session.go",
        "types.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/session"
    },
    {
      "name": "skills",
      "path": "pkg/skills",
      "importPath": "github.com/x402agent/SolanaOS/pkg/skills",
      "fileCount": 2,
      "sizeBytes": 24924,
      "category": "Operator Interfaces",
      "summary": "Skill loading, indexing, and install-time package discovery.",
      "keyFiles": [
        "manager.go",
        "skills.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/skills"
    },
    {
      "name": "solana",
      "path": "pkg/solana",
      "importPath": "github.com/x402agent/SolanaOS/pkg/solana",
      "fileCount": 15,
      "sizeBytes": 251522,
      "category": "Markets",
      "summary": "Solana clients, wallets, trackers, Jupiter, RPC, and market data plumbing.",
      "keyFiles": [
        "birdeye_pair_list.go",
        "birdeye_tools.go",
        "birdeye_types.go",
        "birdeye_v3.go",
        "birdeye_ws_parse.go",
        "birdeye_ws_subscriptions.go",
        "birdeye_ws.go",
        "clients.go",
        "datastream.go",
        "programs.go",
        "rpc.go",
        "solanatracker.go",
        "tracker_swap.go",
        "tx.go",
        "wallet.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/solana"
    },
    {
      "name": "state",
      "path": "pkg/state",
      "importPath": "github.com/x402agent/SolanaOS/pkg/state",
      "fileCount": 1,
      "sizeBytes": 1562,
      "category": "Core Runtime",
      "summary": "Shared state containers for runtime components.",
      "keyFiles": [
        "state.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/state"
    },
    {
      "name": "steel",
      "path": "pkg/steel",
      "importPath": "github.com/x402agent/SolanaOS/pkg/steel",
      "fileCount": 1,
      "sizeBytes": 9422,
      "category": "Utilities",
      "summary": "steel package from the SolanaOS computer runtime.",
      "keyFiles": [
        "client.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/steel"
    },
    {
      "name": "storage",
      "path": "pkg/storage",
      "importPath": "github.com/x402agent/SolanaOS/pkg/storage",
      "fileCount": 1,
      "sizeBytes": 4006,
      "category": "Core Runtime",
      "summary": "Storage backends and persistence helpers.",
      "keyFiles": [
        "supabase.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/storage"
    },
    {
      "name": "strategy",
      "path": "pkg/strategy",
      "importPath": "github.com/x402agent/SolanaOS/pkg/strategy",
      "fileCount": 1,
      "sizeBytes": 10922,
      "category": "Markets",
      "summary": "Trading strategy configuration, heuristics, and decision inputs.",
      "keyFiles": [
        "strategy.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/strategy"
    },
    {
      "name": "tailscale",
      "path": "pkg/tailscale",
      "importPath": "github.com/x402agent/SolanaOS/pkg/tailscale",
      "fileCount": 1,
      "sizeBytes": 4081,
      "category": "Utilities",
      "summary": "tailscale package from the SolanaOS computer runtime.",
      "keyFiles": [
        "mesh.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/tailscale"
    },
    {
      "name": "tamagochi",
      "path": "pkg/tamagochi",
      "importPath": "github.com/x402agent/SolanaOS/pkg/tamagochi",
      "fileCount": 1,
      "sizeBytes": 12484,
      "category": "Hardware",
      "summary": "TamaGOchi miner companion logic and pet state.",
      "keyFiles": [
        "tamagochi.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/tamagochi"
    },
    {
      "name": "tools",
      "path": "pkg/tools",
      "importPath": "github.com/x402agent/SolanaOS/pkg/tools",
      "fileCount": 1,
      "sizeBytes": 6691,
      "category": "Intelligence",
      "summary": "Tool registry and execution surface for agents.",
      "keyFiles": [
        "tools.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/tools"
    },
    {
      "name": "trading",
      "path": "pkg/trading",
      "importPath": "github.com/x402agent/SolanaOS/pkg/trading",
      "fileCount": 1,
      "sizeBytes": 17050,
      "category": "Utilities",
      "summary": "trading package from the SolanaOS computer runtime.",
      "keyFiles": [
        "engine.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/trading"
    },
    {
      "name": "utils",
      "path": "pkg/utils",
      "importPath": "github.com/x402agent/SolanaOS/pkg/utils",
      "fileCount": 1,
      "sizeBytes": 2392,
      "category": "Utilities",
      "summary": "General-purpose utility helpers shared across the runtime.",
      "keyFiles": [
        "utils.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/utils"
    },
    {
      "name": "voice",
      "path": "pkg/voice",
      "importPath": "github.com/x402agent/SolanaOS/pkg/voice",
      "fileCount": 3,
      "sizeBytes": 12717,
      "category": "Seeker & Mobile",
      "summary": "Voice capture, wake flow, realtime voice, and TTS integration.",
      "keyFiles": [
        "hume.go",
        "twilio.go",
        "voice.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/voice"
    },
    {
      "name": "x402",
      "path": "pkg/x402",
      "importPath": "github.com/x402agent/SolanaOS/pkg/x402",
      "fileCount": 1,
      "sizeBytes": 17145,
      "category": "Markets",
      "summary": "x402 payment, monetization, and facilitator integration.",
      "keyFiles": [
        "x402.go"
      ],
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/pkg/x402"
    }
  ],
  "skills": [
    {
      "name": "1password",
      "path": "skills/1password",
      "fileCount": 3,
      "sizeBytes": 4340,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/1password",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/1password.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-1password",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install 1password",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install 1password",
        "bun": "bunx @nanosolana/nanohub@latest install 1password"
      }
    },
    {
      "name": "apple-notes",
      "path": "skills/apple-notes",
      "fileCount": 1,
      "sizeBytes": 2090,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/apple-notes",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/apple-notes.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-apple-notes",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install apple-notes",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install apple-notes",
        "bun": "bunx @nanosolana/nanohub@latest install apple-notes"
      }
    },
    {
      "name": "apple-reminders",
      "path": "skills/apple-reminders",
      "fileCount": 1,
      "sizeBytes": 3127,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/apple-reminders",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/apple-reminders.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-apple-reminders",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install apple-reminders",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install apple-reminders",
        "bun": "bunx @nanosolana/nanohub@latest install apple-reminders"
      }
    },
    {
      "name": "bear-notes",
      "path": "skills/bear-notes",
      "fileCount": 1,
      "sizeBytes": 2662,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/bear-notes",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/bear-notes.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-bear-notes",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install bear-notes",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install bear-notes",
        "bun": "bunx @nanosolana/nanohub@latest install bear-notes"
      }
    },
    {
      "name": "blogwatcher",
      "path": "skills/blogwatcher",
      "fileCount": 1,
      "sizeBytes": 1415,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/blogwatcher",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/blogwatcher.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-blogwatcher",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install blogwatcher",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install blogwatcher",
        "bun": "bunx @nanosolana/nanohub@latest install blogwatcher"
      }
    },
    {
      "name": "blucli",
      "path": "skills/blucli",
      "fileCount": 1,
      "sizeBytes": 1020,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/blucli",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/blucli.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-blucli",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install blucli",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install blucli",
        "bun": "bunx @nanosolana/nanohub@latest install blucli"
      }
    },
    {
      "name": "bluebubbles",
      "path": "skills/bluebubbles",
      "fileCount": 1,
      "sizeBytes": 4880,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/bluebubbles",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/bluebubbles.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-bluebubbles",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install bluebubbles",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install bluebubbles",
        "bun": "bunx @nanosolana/nanohub@latest install bluebubbles"
      }
    },
    {
      "name": "browse",
      "path": "skills/browse",
      "fileCount": 1,
      "sizeBytes": 9685,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/browse",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/browse.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-browse",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install browse",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install browse",
        "bun": "bunx @nanosolana/nanohub@latest install browse"
      }
    },
    {
      "name": "browser_base",
      "path": "skills/browser_base",
      "fileCount": 43,
      "sizeBytes": 370572,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/browser_base",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/browser_base.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-browser_base",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install browser_base",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install browser_base",
        "bun": "bunx @nanosolana/nanohub@latest install browser_base"
      }
    },
    {
      "name": "camsnap",
      "path": "skills/camsnap",
      "fileCount": 1,
      "sizeBytes": 1089,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/camsnap",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/camsnap.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-camsnap",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install camsnap",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install camsnap",
        "bun": "bunx @nanosolana/nanohub@latest install camsnap"
      }
    },
    {
      "name": "canvas",
      "path": "skills/canvas",
      "fileCount": 1,
      "sizeBytes": 5505,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/canvas",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/canvas.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-canvas",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install canvas",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install canvas",
        "bun": "bunx @nanosolana/nanohub@latest install canvas"
      }
    },
    {
      "name": "clawd-vault",
      "path": "skills/clawd-vault",
      "fileCount": 2,
      "sizeBytes": 7178,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/clawd-vault",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/clawd-vault.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-clawd-vault",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install clawd-vault",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install clawd-vault",
        "bun": "bunx @nanosolana/nanohub@latest install clawd-vault"
      }
    },
    {
      "name": "clawdhub",
      "path": "skills/clawdhub",
      "fileCount": 1,
      "sizeBytes": 1613,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/clawdhub",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/clawdhub.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-clawdhub",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install clawdhub",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install clawdhub",
        "bun": "bunx @nanosolana/nanohub@latest install clawdhub"
      }
    },
    {
      "name": "coding-agent",
      "path": "skills/coding-agent",
      "fileCount": 1,
      "sizeBytes": 12928,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/coding-agent",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/coding-agent.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-coding-agent",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install coding-agent",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install coding-agent",
        "bun": "bunx @nanosolana/nanohub@latest install coding-agent"
      }
    },
    {
      "name": "cua",
      "path": "skills/cua",
      "fileCount": 1,
      "sizeBytes": 14745,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/cua",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/cua.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-cua",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install cua",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install cua",
        "bun": "bunx @nanosolana/nanohub@latest install cua"
      }
    },
    {
      "name": "discord",
      "path": "skills/discord",
      "fileCount": 1,
      "sizeBytes": 3446,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/discord",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/discord.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-discord",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install discord",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install discord",
        "bun": "bunx @nanosolana/nanohub@latest install discord"
      }
    },
    {
      "name": "e2b",
      "path": "skills/e2b",
      "fileCount": 1,
      "sizeBytes": 10660,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/e2b",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/e2b.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-e2b",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install e2b",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install e2b",
        "bun": "bunx @nanosolana/nanohub@latest install e2b"
      }
    },
    {
      "name": "eightctl",
      "path": "skills/eightctl",
      "fileCount": 1,
      "sizeBytes": 1094,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/eightctl",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/eightctl.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-eightctl",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install eightctl",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install eightctl",
        "bun": "bunx @nanosolana/nanohub@latest install eightctl"
      }
    },
    {
      "name": "gateway-node-ops",
      "path": "skills/gateway-node-ops",
      "fileCount": 1,
      "sizeBytes": 2171,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/gateway-node-ops",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/gateway-node-ops.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-gateway-node-ops",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gateway-node-ops",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gateway-node-ops",
        "bun": "bunx @nanosolana/nanohub@latest install gateway-node-ops"
      }
    },
    {
      "name": "gemini",
      "path": "skills/gemini",
      "fileCount": 1,
      "sizeBytes": 934,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/gemini",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/gemini.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-gemini",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gemini",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gemini",
        "bun": "bunx @nanosolana/nanohub@latest install gemini"
      }
    },
    {
      "name": "gh-issues",
      "path": "skills/gh-issues",
      "fileCount": 1,
      "sizeBytes": 34293,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/gh-issues",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/gh-issues.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-gh-issues",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gh-issues",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gh-issues",
        "bun": "bunx @nanosolana/nanohub@latest install gh-issues"
      }
    },
    {
      "name": "gifgrep",
      "path": "skills/gifgrep",
      "fileCount": 1,
      "sizeBytes": 2185,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/gifgrep",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/gifgrep.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-gifgrep",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gifgrep",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gifgrep",
        "bun": "bunx @nanosolana/nanohub@latest install gifgrep"
      }
    },
    {
      "name": "github",
      "path": "skills/github",
      "fileCount": 1,
      "sizeBytes": 4125,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/github",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/github.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-github",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install github",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install github",
        "bun": "bunx @nanosolana/nanohub@latest install github"
      }
    },
    {
      "name": "gog",
      "path": "skills/gog",
      "fileCount": 1,
      "sizeBytes": 4572,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/gog",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/gog.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-gog",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install gog",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install gog",
        "bun": "bunx @nanosolana/nanohub@latest install gog"
      }
    },
    {
      "name": "goplaces",
      "path": "skills/goplaces",
      "fileCount": 1,
      "sizeBytes": 1538,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/goplaces",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/goplaces.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-goplaces",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install goplaces",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install goplaces",
        "bun": "bunx @nanosolana/nanohub@latest install goplaces"
      }
    },
    {
      "name": "healthcheck",
      "path": "skills/healthcheck",
      "fileCount": 1,
      "sizeBytes": 10538,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/healthcheck",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/healthcheck.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-healthcheck",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install healthcheck",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install healthcheck",
        "bun": "bunx @nanosolana/nanohub@latest install healthcheck"
      }
    },
    {
      "name": "himalaya",
      "path": "skills/himalaya",
      "fileCount": 3,
      "sizeBytes": 12499,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/himalaya",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/himalaya.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-himalaya",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install himalaya",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install himalaya",
        "bun": "bunx @nanosolana/nanohub@latest install himalaya"
      }
    },
    {
      "name": "imsg",
      "path": "skills/imsg",
      "fileCount": 1,
      "sizeBytes": 2977,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/imsg",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/imsg.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-imsg",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install imsg",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install imsg",
        "bun": "bunx @nanosolana/nanohub@latest install imsg"
      }
    },
    {
      "name": "mcporter",
      "path": "skills/mcporter",
      "fileCount": 1,
      "sizeBytes": 1674,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/mcporter",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/mcporter.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-mcporter",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install mcporter",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install mcporter",
        "bun": "bunx @nanosolana/nanohub@latest install mcporter"
      }
    },
    {
      "name": "model-usage",
      "path": "skills/model-usage",
      "fileCount": 4,
      "sizeBytes": 15447,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/model-usage",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/model-usage.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-model-usage",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install model-usage",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install model-usage",
        "bun": "bunx @nanosolana/nanohub@latest install model-usage"
      }
    },
    {
      "name": "nano-banana-pro",
      "path": "skills/nano-banana-pro",
      "fileCount": 3,
      "sizeBytes": 10869,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/nano-banana-pro",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/nano-banana-pro.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-nano-banana-pro",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install nano-banana-pro",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install nano-banana-pro",
        "bun": "bunx @nanosolana/nanohub@latest install nano-banana-pro"
      }
    },
    {
      "name": "nano-pdf",
      "path": "skills/nano-pdf",
      "fileCount": 1,
      "sizeBytes": 954,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/nano-pdf",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/nano-pdf.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-nano-pdf",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install nano-pdf",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install nano-pdf",
        "bun": "bunx @nanosolana/nanohub@latest install nano-pdf"
      }
    },
    {
      "name": "notion",
      "path": "skills/notion",
      "fileCount": 1,
      "sizeBytes": 5381,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/notion",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/notion.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-notion",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install notion",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install notion",
        "bun": "bunx @nanosolana/nanohub@latest install notion"
      }
    },
    {
      "name": "obsidian",
      "path": "skills/obsidian",
      "fileCount": 1,
      "sizeBytes": 2531,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/obsidian",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/obsidian.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-obsidian",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install obsidian",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install obsidian",
        "bun": "bunx @nanosolana/nanohub@latest install obsidian"
      }
    },
    {
      "name": "openai-image-gen",
      "path": "skills/openai-image-gen",
      "fileCount": 3,
      "sizeBytes": 19331,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/openai-image-gen",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/openai-image-gen.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-openai-image-gen",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openai-image-gen",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openai-image-gen",
        "bun": "bunx @nanosolana/nanohub@latest install openai-image-gen"
      }
    },
    {
      "name": "openai-whisper",
      "path": "skills/openai-whisper",
      "fileCount": 1,
      "sizeBytes": 912,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/openai-whisper",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/openai-whisper.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-openai-whisper",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openai-whisper",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openai-whisper",
        "bun": "bunx @nanosolana/nanohub@latest install openai-whisper"
      }
    },
    {
      "name": "openai-whisper-api",
      "path": "skills/openai-whisper-api",
      "fileCount": 2,
      "sizeBytes": 2635,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/openai-whisper-api",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/openai-whisper-api.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-openai-whisper-api",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openai-whisper-api",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openai-whisper-api",
        "bun": "bunx @nanosolana/nanohub@latest install openai-whisper-api"
      }
    },
    {
      "name": "openclawd-codeskill",
      "path": "skills/openclawd-codeskill",
      "fileCount": 21,
      "sizeBytes": 119776,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/openclawd-codeskill",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/openclawd-codeskill.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-openclawd-codeskill",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openclawd-codeskill",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openclawd-codeskill",
        "bun": "bunx @nanosolana/nanohub@latest install openclawd-codeskill"
      }
    },
    {
      "name": "openhue",
      "path": "skills/openhue",
      "fileCount": 1,
      "sizeBytes": 2460,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/openhue",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/openhue.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-openhue",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install openhue",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install openhue",
        "bun": "bunx @nanosolana/nanohub@latest install openhue"
      }
    },
    {
      "name": "oracle",
      "path": "skills/oracle",
      "fileCount": 1,
      "sizeBytes": 5073,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/oracle",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/oracle.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-oracle",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install oracle",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install oracle",
        "bun": "bunx @nanosolana/nanohub@latest install oracle"
      }
    },
    {
      "name": "ordercli",
      "path": "skills/ordercli",
      "fileCount": 1,
      "sizeBytes": 2389,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/ordercli",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/ordercli.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-ordercli",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install ordercli",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install ordercli",
        "bun": "bunx @nanosolana/nanohub@latest install ordercli"
      }
    },
    {
      "name": "pdf-to-markdown",
      "path": "skills/pdf-to-markdown",
      "fileCount": 1,
      "sizeBytes": 6521,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pdf-to-markdown",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pdf-to-markdown.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pdf-to-markdown",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pdf-to-markdown",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pdf-to-markdown",
        "bun": "bunx @nanosolana/nanohub@latest install pdf-to-markdown"
      }
    },
    {
      "name": "peekaboo",
      "path": "skills/peekaboo",
      "fileCount": 1,
      "sizeBytes": 5970,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/peekaboo",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/peekaboo.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-peekaboo",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install peekaboo",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install peekaboo",
        "bun": "bunx @nanosolana/nanohub@latest install peekaboo"
      }
    },
    {
      "name": "percolator",
      "path": "skills/percolator",
      "fileCount": 2,
      "sizeBytes": 16678,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/percolator",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/percolator.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-percolator",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install percolator",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install percolator",
        "bun": "bunx @nanosolana/nanohub@latest install percolator"
      }
    },
    {
      "name": "pump-admin-ops",
      "path": "skills/pump-admin-ops",
      "fileCount": 1,
      "sizeBytes": 2743,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-admin-ops",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-admin-ops.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-admin-ops",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-admin-ops",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-admin-ops",
        "bun": "bunx @nanosolana/nanohub@latest install pump-admin-ops"
      }
    },
    {
      "name": "pump-ai-agents",
      "path": "skills/pump-ai-agents",
      "fileCount": 1,
      "sizeBytes": 3272,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-ai-agents",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-ai-agents.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-ai-agents",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-ai-agents",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-ai-agents",
        "bun": "bunx @nanosolana/nanohub@latest install pump-ai-agents"
      }
    },
    {
      "name": "pump-bonding-curve",
      "path": "skills/pump-bonding-curve",
      "fileCount": 1,
      "sizeBytes": 4936,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-bonding-curve",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-bonding-curve.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-bonding-curve",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-bonding-curve",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-bonding-curve",
        "bun": "bunx @nanosolana/nanohub@latest install pump-bonding-curve"
      }
    },
    {
      "name": "pump-build-release",
      "path": "skills/pump-build-release",
      "fileCount": 1,
      "sizeBytes": 2504,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-build-release",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-build-release.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-build-release",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-build-release",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-build-release",
        "bun": "bunx @nanosolana/nanohub@latest install pump-build-release"
      }
    },
    {
      "name": "pump-claims-readonly",
      "path": "skills/pump-claims-readonly",
      "fileCount": 1,
      "sizeBytes": 8245,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-claims-readonly",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-claims-readonly.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-claims-readonly",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-claims-readonly",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-claims-readonly",
        "bun": "bunx @nanosolana/nanohub@latest install pump-claims-readonly"
      }
    },
    {
      "name": "pump-fee-sharing",
      "path": "skills/pump-fee-sharing",
      "fileCount": 1,
      "sizeBytes": 3561,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-fee-sharing",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-fee-sharing.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-fee-sharing",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-fee-sharing",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-fee-sharing",
        "bun": "bunx @nanosolana/nanohub@latest install pump-fee-sharing"
      }
    },
    {
      "name": "pump-fee-system",
      "path": "skills/pump-fee-system",
      "fileCount": 1,
      "sizeBytes": 3253,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-fee-system",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-fee-system.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-fee-system",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-fee-system",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-fee-system",
        "bun": "bunx @nanosolana/nanohub@latest install pump-fee-system"
      }
    },
    {
      "name": "pump-mcp-server",
      "path": "skills/pump-mcp-server",
      "fileCount": 1,
      "sizeBytes": 3175,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-mcp-server",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-mcp-server.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-mcp-server",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-mcp-server",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-mcp-server",
        "bun": "bunx @nanosolana/nanohub@latest install pump-mcp-server"
      }
    },
    {
      "name": "pump-rust-vanity",
      "path": "skills/pump-rust-vanity",
      "fileCount": 1,
      "sizeBytes": 4029,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-rust-vanity",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-rust-vanity.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-rust-vanity",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-rust-vanity",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-rust-vanity",
        "bun": "bunx @nanosolana/nanohub@latest install pump-rust-vanity"
      }
    },
    {
      "name": "pump-sdk-core",
      "path": "skills/pump-sdk-core",
      "fileCount": 1,
      "sizeBytes": 4131,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-sdk-core",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-sdk-core.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-sdk-core",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-sdk-core",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-sdk-core",
        "bun": "bunx @nanosolana/nanohub@latest install pump-sdk-core"
      }
    },
    {
      "name": "pump-security",
      "path": "skills/pump-security",
      "fileCount": 1,
      "sizeBytes": 3580,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-security",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-security.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-security",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-security",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-security",
        "bun": "bunx @nanosolana/nanohub@latest install pump-security"
      }
    },
    {
      "name": "pump-shell-scripts",
      "path": "skills/pump-shell-scripts",
      "fileCount": 1,
      "sizeBytes": 2861,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-shell-scripts",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-shell-scripts.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-shell-scripts",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-shell-scripts",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-shell-scripts",
        "bun": "bunx @nanosolana/nanohub@latest install pump-shell-scripts"
      }
    },
    {
      "name": "pump-solana-architecture",
      "path": "skills/pump-solana-architecture",
      "fileCount": 1,
      "sizeBytes": 4071,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-solana-architecture",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-solana-architecture.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-solana-architecture",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-solana-architecture",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-solana-architecture",
        "bun": "bunx @nanosolana/nanohub@latest install pump-solana-architecture"
      }
    },
    {
      "name": "pump-solana-dev",
      "path": "skills/pump-solana-dev",
      "fileCount": 1,
      "sizeBytes": 3666,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-solana-dev",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-solana-dev.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-solana-dev",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-solana-dev",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-solana-dev",
        "bun": "bunx @nanosolana/nanohub@latest install pump-solana-dev"
      }
    },
    {
      "name": "pump-solana-wallet",
      "path": "skills/pump-solana-wallet",
      "fileCount": 1,
      "sizeBytes": 3047,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-solana-wallet",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-solana-wallet.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-solana-wallet",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-solana-wallet",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-solana-wallet",
        "bun": "bunx @nanosolana/nanohub@latest install pump-solana-wallet"
      }
    },
    {
      "name": "pump-testing",
      "path": "skills/pump-testing",
      "fileCount": 1,
      "sizeBytes": 2839,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-testing",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-testing.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-testing",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-testing",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-testing",
        "bun": "bunx @nanosolana/nanohub@latest install pump-testing"
      }
    },
    {
      "name": "pump-token-incentives",
      "path": "skills/pump-token-incentives",
      "fileCount": 1,
      "sizeBytes": 3153,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-token-incentives",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-token-incentives.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-token-incentives",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-token-incentives",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-token-incentives",
        "bun": "bunx @nanosolana/nanohub@latest install pump-token-incentives"
      }
    },
    {
      "name": "pump-token-lifecycle",
      "path": "skills/pump-token-lifecycle",
      "fileCount": 1,
      "sizeBytes": 4758,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-token-lifecycle",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-token-lifecycle.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-token-lifecycle",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-token-lifecycle",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-token-lifecycle",
        "bun": "bunx @nanosolana/nanohub@latest install pump-token-lifecycle"
      }
    },
    {
      "name": "pump-ts-vanity",
      "path": "skills/pump-ts-vanity",
      "fileCount": 1,
      "sizeBytes": 2969,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-ts-vanity",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-ts-vanity.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-ts-vanity",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-ts-vanity",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-ts-vanity",
        "bun": "bunx @nanosolana/nanohub@latest install pump-ts-vanity"
      }
    },
    {
      "name": "pump-website",
      "path": "skills/pump-website",
      "fileCount": 1,
      "sizeBytes": 3522,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pump-website",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pump-website.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pump-website",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pump-website",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pump-website",
        "bun": "bunx @nanosolana/nanohub@latest install pump-website"
      }
    },
    {
      "name": "pumpfun-analytics",
      "path": "skills/pumpfun-analytics",
      "fileCount": 1,
      "sizeBytes": 3232,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pumpfun-analytics",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pumpfun-analytics.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pumpfun-analytics",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-analytics",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-analytics",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-analytics"
      }
    },
    {
      "name": "pumpfun-fees",
      "path": "skills/pumpfun-fees",
      "fileCount": 1,
      "sizeBytes": 2466,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pumpfun-fees",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pumpfun-fees.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pumpfun-fees",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-fees",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-fees",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-fees"
      }
    },
    {
      "name": "pumpfun-launcher",
      "path": "skills/pumpfun-launcher",
      "fileCount": 1,
      "sizeBytes": 2537,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pumpfun-launcher",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pumpfun-launcher.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pumpfun-launcher",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-launcher",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-launcher",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-launcher"
      }
    },
    {
      "name": "pumpfun-token-scanner",
      "path": "skills/pumpfun-token-scanner",
      "fileCount": 10,
      "sizeBytes": 83284,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pumpfun-token-scanner",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pumpfun-token-scanner.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pumpfun-token-scanner",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-token-scanner",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-token-scanner",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-token-scanner"
      }
    },
    {
      "name": "pumpfun-trading",
      "path": "skills/pumpfun-trading",
      "fileCount": 1,
      "sizeBytes": 2659,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/pumpfun-trading",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/pumpfun-trading.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-pumpfun-trading",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install pumpfun-trading",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install pumpfun-trading",
        "bun": "bunx @nanosolana/nanohub@latest install pumpfun-trading"
      }
    },
    {
      "name": "sag",
      "path": "skills/sag",
      "fileCount": 1,
      "sizeBytes": 2297,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/sag",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/sag.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-sag",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install sag",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install sag",
        "bun": "bunx @nanosolana/nanohub@latest install sag"
      }
    },
    {
      "name": "seeker-daemon-ops",
      "path": "skills/seeker-daemon-ops",
      "fileCount": 1,
      "sizeBytes": 866,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/seeker-daemon-ops",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/seeker-daemon-ops.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-seeker-daemon-ops",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install seeker-daemon-ops",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install seeker-daemon-ops",
        "bun": "bunx @nanosolana/nanohub@latest install seeker-daemon-ops"
      }
    },
    {
      "name": "session-logs",
      "path": "skills/session-logs",
      "fileCount": 1,
      "sizeBytes": 3429,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/session-logs",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/session-logs.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-session-logs",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install session-logs",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install session-logs",
        "bun": "bunx @nanosolana/nanohub@latest install session-logs"
      }
    },
    {
      "name": "sherpa-onnx-tts",
      "path": "skills/sherpa-onnx-tts",
      "fileCount": 2,
      "sizeBytes": 8212,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/sherpa-onnx-tts",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/sherpa-onnx-tts.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-sherpa-onnx-tts",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install sherpa-onnx-tts",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install sherpa-onnx-tts",
        "bun": "bunx @nanosolana/nanohub@latest install sherpa-onnx-tts"
      }
    },
    {
      "name": "skill-creator",
      "path": "skills/skill-creator",
      "fileCount": 7,
      "sizeBytes": 61486,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/skill-creator",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/skill-creator.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-skill-creator",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install skill-creator",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install skill-creator",
        "bun": "bunx @nanosolana/nanohub@latest install skill-creator"
      }
    },
    {
      "name": "slack",
      "path": "skills/slack",
      "fileCount": 1,
      "sizeBytes": 2501,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/slack",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/slack.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-slack",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install slack",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install slack",
        "bun": "bunx @nanosolana/nanohub@latest install slack"
      }
    },
    {
      "name": "solana-attestation-skill",
      "path": "skills/solana-attestation-skill",
      "fileCount": 1,
      "sizeBytes": 12653,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/solana-attestation-skill",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/solana-attestation-skill.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-solana-attestation-skill",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solana-attestation-skill",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solana-attestation-skill",
        "bun": "bunx @nanosolana/nanohub@latest install solana-attestation-skill"
      }
    },
    {
      "name": "solana-dev-skill-main",
      "path": "skills/solana-dev-skill-main",
      "fileCount": 14,
      "sizeBytes": 64146,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/solana-dev-skill-main",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/solana-dev-skill-main.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-solana-dev-skill-main",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solana-dev-skill-main",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solana-dev-skill-main",
        "bun": "bunx @nanosolana/nanohub@latest install solana-dev-skill-main"
      }
    },
    {
      "name": "solana-formal-verification",
      "path": "skills/solana-formal-verification",
      "fileCount": 119,
      "sizeBytes": 8021275,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/solana-formal-verification",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/solana-formal-verification.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-solana-formal-verification",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solana-formal-verification",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solana-formal-verification",
        "bun": "bunx @nanosolana/nanohub@latest install solana-formal-verification"
      }
    },
    {
      "name": "solana-research-brief",
      "path": "skills/solana-research-brief",
      "fileCount": 1,
      "sizeBytes": 814,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/solana-research-brief",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/solana-research-brief.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-solana-research-brief",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solana-research-brief",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solana-research-brief",
        "bun": "bunx @nanosolana/nanohub@latest install solana-research-brief"
      }
    },
    {
      "name": "solanaos",
      "path": "skills/solanaos",
      "fileCount": 1,
      "sizeBytes": 6231,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/solanaos",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/solanaos.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-solanaos",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install solanaos",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install solanaos",
        "bun": "bunx @nanosolana/nanohub@latest install solanaos"
      }
    },
    {
      "name": "songsee",
      "path": "skills/songsee",
      "fileCount": 1,
      "sizeBytes": 1314,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/songsee",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/songsee.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-songsee",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install songsee",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install songsee",
        "bun": "bunx @nanosolana/nanohub@latest install songsee"
      }
    },
    {
      "name": "sonoscli",
      "path": "skills/sonoscli",
      "fileCount": 1,
      "sizeBytes": 2455,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/sonoscli",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/sonoscli.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-sonoscli",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install sonoscli",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install sonoscli",
        "bun": "bunx @nanosolana/nanohub@latest install sonoscli"
      }
    },
    {
      "name": "spotify-player",
      "path": "skills/spotify-player",
      "fileCount": 1,
      "sizeBytes": 1686,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/spotify-player",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/spotify-player.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-spotify-player",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install spotify-player",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install spotify-player",
        "bun": "bunx @nanosolana/nanohub@latest install spotify-player"
      }
    },
    {
      "name": "summarize",
      "path": "skills/summarize",
      "fileCount": 1,
      "sizeBytes": 2232,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/summarize",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/summarize.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-summarize",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install summarize",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install summarize",
        "bun": "bunx @nanosolana/nanohub@latest install summarize"
      }
    },
    {
      "name": "swarm-orchestrator",
      "path": "skills/swarm-orchestrator",
      "fileCount": 1,
      "sizeBytes": 3629,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/swarm-orchestrator",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/swarm-orchestrator.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-swarm-orchestrator",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install swarm-orchestrator",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install swarm-orchestrator",
        "bun": "bunx @nanosolana/nanohub@latest install swarm-orchestrator"
      }
    },
    {
      "name": "things-mac",
      "path": "skills/things-mac",
      "fileCount": 1,
      "sizeBytes": 3555,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/things-mac",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/things-mac.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-things-mac",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install things-mac",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install things-mac",
        "bun": "bunx @nanosolana/nanohub@latest install things-mac"
      }
    },
    {
      "name": "tmux",
      "path": "skills/tmux",
      "fileCount": 3,
      "sizeBytes": 8599,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/tmux",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/tmux.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-tmux",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install tmux",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install tmux",
        "bun": "bunx @nanosolana/nanohub@latest install tmux"
      }
    },
    {
      "name": "trello",
      "path": "skills/trello",
      "fileCount": 1,
      "sizeBytes": 2687,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/trello",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/trello.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-trello",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install trello",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install trello",
        "bun": "bunx @nanosolana/nanohub@latest install trello"
      }
    },
    {
      "name": "video-frames",
      "path": "skills/video-frames",
      "fileCount": 2,
      "sizeBytes": 2308,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/video-frames",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/video-frames.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-video-frames",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install video-frames",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install video-frames",
        "bun": "bunx @nanosolana/nanohub@latest install video-frames"
      }
    },
    {
      "name": "voice-call",
      "path": "skills/voice-call",
      "fileCount": 1,
      "sizeBytes": 1159,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/voice-call",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/voice-call.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-voice-call",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install voice-call",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install voice-call",
        "bun": "bunx @nanosolana/nanohub@latest install voice-call"
      }
    },
    {
      "name": "wacli",
      "path": "skills/wacli",
      "fileCount": 1,
      "sizeBytes": 2385,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/wacli",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/wacli.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-wacli",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install wacli",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install wacli",
        "bun": "bunx @nanosolana/nanohub@latest install wacli"
      }
    },
    {
      "name": "weather",
      "path": "skills/weather",
      "fileCount": 1,
      "sizeBytes": 2287,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/weather",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/weather.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-weather",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install weather",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install weather",
        "bun": "bunx @nanosolana/nanohub@latest install weather"
      }
    },
    {
      "name": "wurk-integration",
      "path": "skills/wurk-integration",
      "fileCount": 1,
      "sizeBytes": 6524,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/wurk-integration",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/wurk-integration.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-wurk-integration",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install wurk-integration",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install wurk-integration",
        "bun": "bunx @nanosolana/nanohub@latest install wurk-integration"
      }
    },
    {
      "name": "xurl",
      "path": "skills/xurl",
      "fileCount": 1,
      "sizeBytes": 14720,
      "sourceUrl": "https://github.com/x402agent/SolanaOS/tree/main/skills/xurl",
      "downloadUrl": "https://seeker.solanaos.net/downloads/skills/xurl.zip",
      "catalogUrl": "https://seeker.solanaos.net/solanaos#skill-xurl",
      "install": {
        "npm": "npx @nanosolana/nanohub@latest install xurl",
        "pnpm": "pnpm dlx @nanosolana/nanohub@latest install xurl",
        "bun": "bunx @nanosolana/nanohub@latest install xurl"
      }
    }
  ],
  "backend": {
    "recommended": true,
    "summary": "Use web/backend as the public SolanaOS control/API layer. Keep the backend .env private and expose only the built service, not raw secrets.",
    "entries": [
      {
        "name": "main.go",
        "path": "web/backend/main.go",
        "sourceUrl": "https://github.com/x402agent/SolanaOS/blob/main/web/backend/main.go",
        "role": "HTTP server and dashboard bootstrap"
      },
      {
        "name": "gateway_access.go",
        "path": "web/backend/gateway_access.go",
        "sourceUrl": "https://github.com/x402agent/SolanaOS/blob/main/web/backend/gateway_access.go",
        "role": "Gateway auth and access wiring"
      },
      {
        "name": "Dockerfile",
        "path": "web/backend/Dockerfile",
        "sourceUrl": "https://github.com/x402agent/SolanaOS/blob/main/web/backend/Dockerfile",
        "role": "Container entrypoint for deploys"
      }
    ]
  }
} as const
