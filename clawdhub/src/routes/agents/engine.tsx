import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/agents/engine')({
  head: () => ({
    meta: [{ title: 'Agent Engine — SolanaOS Hub' }],
  }),
  component: AgentEngineRoute,
})

// ---------------------------------------------------------------------------
// Data: solana-claude agent fleet, tools, buddies, OODA phases
// ---------------------------------------------------------------------------

const AGENTS = [
  {
    name: 'Explorer',
    type: 'Research',
    maxTurns: 10,
    effort: 'Low',
    memory: 'Session',
    permission: 'readOnly',
    description: 'Read-only research agent for codebase exploration and data lookup.',
    tools: ['Read', 'Grep', 'Glob', 'Skills'],
  },
  {
    name: 'Scanner',
    type: 'Monitoring',
    maxTurns: 25,
    effort: 'Base',
    memory: 'Project',
    permission: 'auto',
    description: 'Continuous token scanner with memory and agent spawning.',
    tools: ['Read', 'Memory', 'Agent Spawn', 'Pump Scanner'],
  },
  {
    name: 'OODA',
    type: 'Trading',
    maxTurns: 30,
    effort: 'High',
    memory: 'Session',
    permission: 'ask',
    description: 'Full OODA loop trading agent. All trades gated by permission engine.',
    tools: ['All (trades require approval)'],
  },
  {
    name: 'Dream',
    type: 'Memory Consolidation',
    maxTurns: 15,
    effort: 'Base',
    memory: 'User',
    permission: 'auto',
    description: 'Background memory consolidation — promotes INFERRED to LEARNED.',
    tools: ['Memory', 'Analysis'],
  },
  {
    name: 'Analyst',
    type: 'Deep Research',
    maxTurns: 20,
    effort: 'High',
    memory: 'Session',
    permission: 'readOnly',
    description: 'Deep research agent for cross-chain analysis and protocol review.',
    tools: ['All read-only'],
  },
  {
    name: 'Monitor',
    type: 'Continuous Listener',
    maxTurns: Infinity,
    effort: 'Low',
    memory: 'Project',
    permission: 'auto',
    description: 'Background Helius WebSocket listener for wallet and price events.',
    tools: ['Helius WebSockets'],
  },
  {
    name: 'Metaplex Agent',
    type: 'NFT Registry',
    maxTurns: 12,
    effort: 'Base',
    memory: 'Project',
    permission: 'auto',
    description: 'Agent identity minting and 014 Registry operations via Metaplex.',
    tools: ['Metaplex Tools'],
  },
]

const MCP_TOOLS: Record<string, string[]> = {
  'Solana Core': [
    'solana_price', 'solana_trending', 'solana_token_info', 'solana_wallet_pnl',
    'solana_search', 'solana_top_traders', 'solana_wallet_tokens', 'sol_price',
  ],
  'Helius Enhanced': [
    'helius_account_info', 'helius_balance', 'helius_transactions',
    'helius_priority_fee', 'helius_das_asset', 'helius_listener_setup',
    'helius_webhook_create', 'helius_webhook_list',
  ],
  'Pump.fun': [
    'pump_token_scan', 'pump_buy_quote', 'pump_sell_quote',
    'pump_graduation', 'pump_market_cap', 'pump_top_tokens',
  ],
  'Memory & Skills': ['memory_recall', 'memory_write', 'skill_list', 'skill_read'],
  'Agent Fleet': ['agent_spawn', 'agent_list', 'agent_stop'],
  'Metaplex NFT': [
    'metaplex_mint_agent', 'metaplex_register_identity', 'metaplex_read_agent',
    'metaplex_delegate_execution', 'metaplex_verify_mint', 'metaplex_agent_wallet',
  ],
  'x402 Payment': ['x402_payment'],
}

const BUDDY_SPECIES = [
  'soldog', 'bonk', 'wif', 'jupiter', 'raydium', 'whale', 'bull', 'bear',
  'shark', 'octopus', 'degod', 'y00t', 'okaybear', 'pepe', 'pumpfun',
  'sniper', 'validator', 'rpc',
]

const PERSONALITIES = [
  'diamond_hands', 'degen', 'sniper', 'whale', 'bot', 'ape', 'ninja', 'paper_hands',
]

const OODA_PHASES = [
  { phase: 'OBSERVE', color: '#3b82f6', icon: '\u{1F441}', description: 'Fetch live market data: SOL price, trending tokens, network fees, KNOWN memory.' },
  { phase: 'ORIENT', color: '#eab308', icon: '\u{1F9ED}', description: 'Contextualize with LEARNED memory, calculate confidence scores, cross-reference signals.' },
  { phase: 'DECIDE', color: '#a855f7', icon: '\u{1F3AF}', description: 'Apply threshold logic (min 60/100). Size multiplier: 0.5x\u20131.5x based on score.' },
  { phase: 'ACT', color: '#ef4444', icon: '\u26A1', description: 'Execute trade (gated by permission engine). Paper trading when no real key.' },
  { phase: 'LEARN', color: '#22c55e', icon: '\u{1F9E0}', description: 'Extract memories, promote INFERRED to LEARNED on repetition, consolidate vault.' },
]

const MEMORY_TIERS = [
  { tier: 'KNOWN', ttl: '~60s', description: 'Live API snapshots \u2014 prices, block heights, slot numbers. Auto-expires.', color: '#3b82f6' },
  { tier: 'LEARNED', ttl: 'Durable', description: 'User preferences, patterns, repeated observations. Syncs to Honcho persistent store.', color: '#22c55e' },
  { tier: 'INFERRED', ttl: 'Local vault', description: 'Hypotheses, weak correlations, speculative analysis. Revisable, searchable markdown.', color: '#eab308' },
]

const GATEWAY_COMMANDS = [
  { cmd: '/wallet', desc: 'Show wallet balance & tokens' },
  { cmd: '/balance', desc: 'SOL balance' },
  { cmd: '/tokens', desc: 'Token holdings' },
  { cmd: '/txs', desc: 'Recent transactions' },
  { cmd: '/price <mint>', desc: 'Token price (Birdeye)' },
  { cmd: '/search <query>', desc: 'Search tokens' },
  { cmd: '/slot', desc: 'Current Solana slot' },
  { cmd: '/assets', desc: 'Helius DAS assets' },
  { cmd: '/watch <mint>', desc: 'Watch token price' },
  { cmd: '/whales <min>', desc: 'Large trade alerts' },
  { cmd: '/newpairs', desc: 'New pair listings' },
  { cmd: '/newlistings', desc: 'New token listings' },
]

const RISK_ENGINE_FEATURES = [
  'Native 128-bit base-10 scaling (no floating point)',
  'Protected principal for flat accounts',
  'Lazy ADL without global scans',
  'Oracle manipulation resistance',
  'Bounded insolvency handling',
  'Profit-first haircuts under undercollateralization',
  'Live premium-based funding (not fixed rates)',
  'Off-chain shortlist keeper pattern',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Tab = 'overview' | 'agents' | 'tools' | 'buddies' | 'ooda' | 'gateway' | 'risk' | 'wallet' | 'examples'

function AgentEngineRoute() {
  const [tab, setTab] = useState<Tab>('overview')

  return (
    <main>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-copy fade-up" data-delay="1">
            <span className="hero-badge">solana-claude / Agent Engine</span>
            <h1 className="hero-title">
              Solana-native agentic engine with OODA loops, blockchain buddies, and 31+ MCP tools.
            </h1>
            <p className="hero-subtitle">
              Built on the Claude Code QueryEngine architecture. 3-tier epistemological memory,
              permission-gated trading, 128-bit risk engine, and zero-friction onchain integration.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
              <Link to="/tracker" className="btn btn-primary">Live Charts</Link>
              <Link to="/scanner" className="btn">Pump Scanner</Link>
              <Link to="/wallet" className="btn">Wallet</Link>
              <Link to="/agents" className="btn">Agent Directory</Link>
            </div>
          </div>
          <div className="hero-card hero-search-card fade-up" data-delay="2">
            <div className="catalog-stats-grid">
              <div className="card"><div className="stat">Built-in agents</div><strong>7</strong></div>
              <div className="card"><div className="stat">MCP tools</div><strong>31</strong></div>
              <div className="card"><div className="stat">Skills</div><strong>95</strong></div>
              <div className="card"><div className="stat">Buddy species</div><strong>18</strong></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="skills-toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
          {(['overview', 'agents', 'tools', 'buddies', 'ooda', 'gateway', 'risk', 'wallet', 'examples'] as const).map((t) => (
            <button
              key={t}
              className={`btn ${tab === t ? 'btn-primary' : ''}`}
              onClick={() => setTab(t)}
              type="button"
              style={{ textTransform: 'capitalize' }}
            >
              {t === 'ooda' ? 'OODA Loop' : t === 'risk' ? 'Risk Engine' : t}
            </button>
          ))}
        </div>
      </section>

      {tab === 'overview' && <OverviewTab />}
      {tab === 'agents' && <AgentFleetTab />}
      {tab === 'tools' && <MCPToolsTab />}
      {tab === 'buddies' && <BuddiesTab />}
      {tab === 'ooda' && <OODATab />}
      {tab === 'gateway' && <GatewayTab />}
      {tab === 'risk' && <RiskEngineTab />}
      {tab === 'wallet' && <WalletVaultTab />}
      {tab === 'examples' && <ExamplesTab />}
    </main>
  )
}

function OverviewTab() {
  return (
    <>
      <section className="section">
        <h2 className="section-title">Architecture Overview</h2>
        <p className="section-subtitle">
          solana-claude is a Solana-native agentic engine adapted from Claude Code's QueryEngine.
          Multi-provider LLM support, permission-gated tool execution, 3-tier memory, and OODA loops.
        </p>
        <div className="grid">
          {[
            { title: 'Core Engine', text: 'QueryEngine with Zod validation, timeout/retry, concurrency safety, and streaming cost tracking. Supports OpenRouter, Anthropic, xAI, Mistral, and local MLX.' },
            { title: 'Permission Engine', text: 'Deny-first evaluation with glob patterns. 21 auto-approved read-only tools. Destructive tools require explicit approval. Modes: ask, auto, readOnly, bypassAll.' },
            { title: '3-Tier Memory', text: 'KNOWN (ephemeral ~60s), LEARNED (Honcho-backed durable), INFERRED (local markdown vault). Automatic extraction and tier promotion.' },
            { title: 'Coordinator', text: 'Multi-agent orchestration \u2014 spawns agents, manages task queues and turn budgets, fans out work, collects and consolidates results.' },
            { title: 'Data Sources', text: 'Helius RPC/DAS/WebSocket/Webhooks, Pump.fun Scanner, Jupiter/Raydium, SolanaTracker, Birdeye alerts, CoinGecko, and wallet PnL APIs.' },
            { title: 'Deployment', text: 'CLI (local), Telegram Gateway, MCP Server (stdio), TailClaude (web UI), React dashboard. No private key required to start.' },
          ].map((item) => (
            <article key={item.title} className="card solanaos-feature-card">
              <h3 className="skill-card-title">{item.title}</h3>
              <p className="stat" style={{ margin: 0 }}>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section">
        <div className="card solanaos-home-cta" style={{ borderLeft: '3px solid #14f195' }}>
          <div>
            <h2 className="section-title" style={{ marginBottom: 8 }}>Integrated into SolanaOS</h2>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>
              The solana-claude engine is bundled as <code>solana-claude/</code> in the SolanaOS monorepo.
              Gateway, AgentWallet vault, TailClaude, 95 skills, and 4 runnable examples all available.
            </p>
          </div>
          <div className="solanaos-home-cta-actions">
            <Link to="/solanaos" className="btn btn-primary">SolanaOS Catalog</Link>
            <Link to="/tracker" className="btn">Live Charts</Link>
          </div>
        </div>
      </section>
    </>
  )
}

function AgentFleetTab() {
  return (
    <section className="section" id="agent-fleet">
      <h2 className="section-title">Built-in Agent Fleet</h2>
      <p className="section-subtitle">7 purpose-built agents with turn budgets, effort levels, and scoped permissions.</p>
      <div className="grid">
        {AGENTS.map((agent) => (
          <article key={agent.name} className="card catalog-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">{agent.name}</h3>
              <span className="tag tag-accent">{agent.type}</span>
            </div>
            <p className="stat" style={{ margin: 0 }}>{agent.description}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <span className="tag">Max turns: {agent.maxTurns === Infinity ? '\u221E' : agent.maxTurns}</span>
              <span className="tag">Effort: {agent.effort}</span>
              <span className="tag">Memory: {agent.memory}</span>
              <span className="tag">Permission: {agent.permission}</span>
            </div>
            <div className="solanaos-chip-row" style={{ marginTop: 8 }}>
              {agent.tools.map((tool) => (
                <span key={tool} className="tag solanaos-package-chip">{tool}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function MCPToolsTab() {
  return (
    <section className="section" id="mcp-tools">
      <h2 className="section-title">MCP Tool Registry (31 Tools)</h2>
      <p className="section-subtitle">Standardized MCP interface \u2014 works with Claude.app, Cursor, VS Code, and any MCP client.</p>
      <div className="grid">
        {Object.entries(MCP_TOOLS).map(([category, tools]) => (
          <article key={category} className="card catalog-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">{category}</h3>
              <span className="tag tag-accent">{tools.length} tools</span>
            </div>
            <div className="solanaos-chip-row" style={{ marginTop: 8 }}>
              {tools.map((tool) => <code key={tool} className="tag">{tool}</code>)}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function BuddiesTab() {
  return (
    <section className="section">
      <h2 className="section-title">Blockchain Buddies</h2>
      <p className="section-subtitle">18 Solana-native trading companions with unique wallets, personalities, and stats.</p>
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="skill-card-title" style={{ marginBottom: 12 }}>Species ({BUDDY_SPECIES.length})</h3>
        <div className="solanaos-chip-row">
          {BUDDY_SPECIES.map((s) => <span key={s} className="tag tag-accent">{s}</span>)}
        </div>
      </div>
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="skill-card-title" style={{ marginBottom: 12 }}>Trading Personalities</h3>
        <div className="solanaos-chip-row">
          {PERSONALITIES.map((p) => <span key={p} className="tag">{p.replace('_', ' ')}</span>)}
        </div>
      </div>
      <div className="grid">
        {[
          { title: 'Per-Buddy State', text: 'Unique wallet, 8 stats (ALPHA, GAS_EFF, RUG_DETECT, TIMING, SIZE, PATIENCE, CHAOS, SNARK), rarity tiers, PnL, level & XP.' },
          { title: 'Rarity Tiers', text: 'Common (60%), Uncommon (25%), Rare (10%), Epic (4%), Legendary (1%). Rarity affects stat ranges.' },
          { title: 'Birth Ceremony', text: 'Animated sequence: heartbeat, wallet generation, stat reveal, ASCII sprite with eyes and hats. 9 custom unicode spinners.' },
          { title: 'Trade Simulation', text: 'Position sizing from stats, PnL by token, leaderboard ranking, win rate, collection management.' },
        ].map((item) => (
          <article key={item.title} className="card solanaos-feature-card">
            <h3 className="skill-card-title">{item.title}</h3>
            <p className="stat" style={{ margin: 0 }}>{item.text}</p>
          </article>
        ))}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="skill-card-title" style={{ marginBottom: 8 }}>Quick Start</h3>
        <code className="catalog-command">npx tsx examples/blockchain-buddies-demo.ts</code>
      </div>
    </section>
  )
}

function OODATab() {
  return (
    <section className="section">
      <h2 className="section-title">OODA Trading Loop</h2>
      <p className="section-subtitle">Military OODA decision framework for Solana trading. Permission-gated, memory-integrated.</p>
      <div className="grid" style={{ marginBottom: 24 }}>
        {OODA_PHASES.map((phase) => (
          <article key={phase.phase} className="card catalog-card" style={{ borderLeft: `3px solid ${phase.color}` }}>
            <div className="catalog-card-top">
              <h3 className="skill-card-title">{phase.icon} {phase.phase}</h3>
            </div>
            <p className="stat" style={{ margin: 0 }}>{phase.description}</p>
          </article>
        ))}
      </div>
      <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Memory Integration</h3>
      <div className="grid" style={{ marginBottom: 24 }}>
        {MEMORY_TIERS.map((tier) => (
          <article key={tier.tier} className="card catalog-card" style={{ borderLeft: `3px solid ${tier.color}` }}>
            <div className="catalog-card-top">
              <h3 className="skill-card-title">{tier.tier}</h3>
              <span className="tag">{tier.ttl}</span>
            </div>
            <p className="stat" style={{ margin: 0 }}>{tier.description}</p>
          </article>
        ))}
      </div>
      <div className="card">
        <h3 className="skill-card-title" style={{ marginBottom: 8 }}>Configuration</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['Cycle: 30s default', 'Min score: 60/100', 'Size: 0.5x-1.5x', 'Learn after ACT: optional', 'Auto-start: disabled'].map(
            (c) => <span key={c} className="tag">{c}</span>,
          )}
        </div>
        <code className="catalog-command" style={{ marginTop: 12, display: 'block' }}>npx tsx examples/ooda-loop.ts</code>
      </div>
    </section>
  )
}

function GatewayTab() {
  return (
    <section className="section">
      <h2 className="section-title">CLAWD Gateway</h2>
      <p className="section-subtitle">Telegram bot + HTTP API with Solana/Helius/Birdeye integration.</p>
      <div className="grid" style={{ marginBottom: 24 }}>
        <article className="card solanaos-feature-card">
          <h3 className="skill-card-title">HTTP API</h3>
          <p className="stat" style={{ margin: 0 }}>Express server with balance, tokens, transactions, assets (Helius DAS), price (Birdeye), and token search.</p>
          <div className="solanaos-chip-row" style={{ marginTop: 8 }}>
            {['/api/balance', '/api/tokens', '/api/transactions', '/api/assets', '/api/price', '/api/search'].map(
              (ep) => <code key={ep} className="tag">{ep}</code>,
            )}
          </div>
        </article>
        <article className="card solanaos-feature-card">
          <h3 className="skill-card-title">Birdeye WebSocket</h3>
          <p className="stat" style={{ margin: 0 }}>Real-time price, transactions, new listings, new pairs, large trades, and wallet activity with auto-reconnect.</p>
        </article>
      </div>
      <h3 className="section-title" style={{ fontSize: '1.1rem' }}>Telegram Commands</h3>
      <div className="grid">
        {GATEWAY_COMMANDS.map((c) => (
          <article key={c.cmd} className="card catalog-card" style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <code style={{ fontWeight: 700 }}>{c.cmd}</code>
              <span className="stat" style={{ margin: 0 }}>{c.desc}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <h3 className="skill-card-title" style={{ marginBottom: 8 }}>Required Environment</h3>
        <div className="solanaos-chip-row">
          {['HELIUS_RPC_URL', 'HELIUS_API_KEY', 'BIRDEYE_API_KEY', 'TELEGRAM_BOT_TOKEN', 'SOLANA_PRIVATE_KEY'].map(
            (env) => <code key={env} className="tag">{env}</code>,
          )}
        </div>
      </div>
    </section>
  )
}

function RiskEngineTab() {
  return (
    <section className="section">
      <h2 className="section-title">128-bit Risk Engine</h2>
      <p className="section-subtitle">Perpetual DEX risk engine (v12.0.2). Single quote-token vault, native 128-bit scaling.</p>
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 className="skill-card-title" style={{ marginBottom: 12 }}>Security Goals (Normative)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {RISK_ENGINE_FEATURES.map((f) => (
            <div key={f} className="stat" style={{ margin: 0, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <span style={{ color: '#14f195', flexShrink: 0 }}>&#10003;</span>{f}
            </div>
          ))}
        </div>
      </div>
      <div className="grid">
        {[
          { title: 'Types & Scaling', text: 'u128 for amounts, i128 for PnL. POS_SCALE = 1,000,000. ADL_ONE = 1,000,000.' },
          { title: 'Funding Model', text: 'Live premium-based rates. Conservative floor semantics. Oracle timing normatively specified.' },
          { title: 'ADL', text: 'Lazy A/K side indices. Off-chain shortlist keeper, on-chain crank revalidation.' },
        ].map((item) => (
          <article key={item.title} className="card solanaos-feature-card">
            <h3 className="skill-card-title">{item.title}</h3>
            <p className="stat" style={{ margin: 0 }}>{item.text}</p>
          </article>
        ))}
      </div>
      <div className="card" style={{ marginTop: 24 }}>
        <p className="stat" style={{ margin: 0 }}>Full spec: <code>solana-claude/docs/risk-engine-spec.md</code></p>
      </div>
    </section>
  )
}

function WalletVaultTab() {
  return (
    <section className="section">
      <h2 className="section-title">AgentWallet Vault</h2>
      <p className="section-subtitle">Encrypted Solana + EVM keypair management with AES-256-GCM.</p>
      <div className="grid">
        {[
          { title: 'Encrypted Storage', text: 'AES-256-GCM with passphrase-derived key. Vault at ~/.agentwallet/vault/wallets.enc.json (mode 0o600).' },
          { title: 'Multi-Chain', text: 'Solana (Ed25519) and EVM (secp256k1). Base58, hex, byte-array formats.' },
          {
            title: 'REST API', text: 'Express server with Bearer auth and CORS.',
            endpoints: ['POST /wallets', 'GET /wallets', 'POST /wallets/import', 'GET /wallets/:id/private-key', 'POST /wallets/:id/pause'],
          },
          { title: 'Deployment', text: 'Deploy to E2B sandboxes or Cloudflare Workers. Export/import encrypted vault for backup.' },
        ].map((item) => (
          <article key={item.title} className="card solanaos-feature-card">
            <h3 className="skill-card-title">{item.title}</h3>
            <p className="stat" style={{ margin: 0 }}>{item.text}</p>
            {'endpoints' in item && item.endpoints ? (
              <div className="solanaos-chip-row" style={{ marginTop: 8 }}>
                {item.endpoints.map((ep) => <code key={ep} className="tag">{ep}</code>)}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function ExamplesTab() {
  const examples = [
    { name: 'OODA Loop', file: 'examples/ooda-loop.ts', command: 'npx tsx examples/ooda-loop.ts', description: 'Full OODA cycle: OBSERVE market, ORIENT with memory, DECIDE threshold, ACT (permission-gated), LEARN. No key required.' },
    { name: 'Blockchain Buddies', file: 'examples/blockchain-buddies-demo.ts', command: 'npx tsx examples/blockchain-buddies-demo.ts', description: 'Hatch a buddy, view sprite + stats, simulate trades, create collection, see leaderboard.' },
    { name: 'Wallet Listener', file: 'examples/listen-wallet.ts', command: 'npx tsx examples/listen-wallet.ts <WALLET>', description: 'Real-time Helius WebSocket: balance changes, tx stream, slot heartbeat, auto KNOWN memory writes.' },
    { name: 'x402 Payment', file: 'examples/x402-solana.ts', command: 'npx tsx examples/x402-solana.ts --server', description: 'HTTP 402 + Solana USDC micropayments. Server returns 402, client signs, retries with X-Payment header.' },
  ]
  return (
    <section className="section">
      <h2 className="section-title">Runnable Examples</h2>
      <p className="section-subtitle">Run from <code>solana-claude/</code>. No private key required for demos.</p>
      <div className="grid">
        {examples.map((ex) => (
          <article key={ex.name} className="card catalog-card">
            <div className="catalog-card-top">
              <h3 className="skill-card-title">{ex.name}</h3>
              <code className="tag">{ex.file}</code>
            </div>
            <p className="stat" style={{ margin: 0 }}>{ex.description}</p>
            <code className="catalog-command" style={{ marginTop: 8, display: 'block' }}>{ex.command}</code>
          </article>
        ))}
      </div>
    </section>
  )
}
