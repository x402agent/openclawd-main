#!/usr/bin/env node
// Upgrades every legacy agent in src/*.json to the Solana-native one-shot
// schema consumed by /agents + the Clawd router + Clawd holders' deploy flow.
//
//   - Strips the bulky "CLAWD IDENTITY" / "CLAWD OUTPUT CONTRACT" boilerplate
//     from config.systemRole and replaces it with a compact Solana-native
//     preamble so the specialization stays the focus.
//   - Normalises meta.category to the enum the /agents hub renders.
//   - Adds a `solana` capability block (rpcRequirements, capabilities,
//     metaplexSkills, programDeps, walletRequirements) per agent profile.
//   - Adds `$schema`, `oneShot`, `featured`, `endpoints`, `homepage`,
//     `summary`, `tokenUsage`, `createdAt`.
//   - Drops the placeholder `examples` block so agents are honest about
//     capabilities.
//   - Leaves already-upgraded Solana-native agents untouched (detected via
//     presence of the `$schema` + `solana` keys and absence of the boilerplate).
//
// Run: node agents/scripts/clawdify-agents.cjs
// Writes back into agents/src/*.json in place.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "src");
const SCHEMA_URL = "https://solanaclawd.com/schemas/clawdAgentSchema.v1.json";
const CREATED_AT = "2026-04-16";
const HOMEPAGE_BASE = "https://solanaclawd.com/agents";

// Valid categories the /agents hub recognises.
const VALID_CATEGORIES = new Set([
  "defi", "trading", "nft", "analytics", "security",
  "dev-tools", "education", "governance"
]);

// Legacy → valid category mapping for any that slipped through.
const CATEGORY_REMAP = {
  crypto: "analytics",
  tools: "dev-tools",
  portfolio: "analytics",
  research: "analytics",
  news: "analytics",
};

// Known Solana program IDs referenced across profiles.
const PROGRAMS = {
  jupiter: { name: "Jupiter v6 Aggregator", programId: "JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4", cluster: "mainnet-beta" },
  pumpfun: { name: "Pump.fun", programId: "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P", cluster: "mainnet-beta" },
  splToken: { name: "SPL Token", programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA", cluster: "mainnet-beta" },
  raydiumCpmm: { name: "Raydium CPMM", programId: "CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C", cluster: "mainnet-beta" },
  meteoraDlmm: { name: "Meteora DLMM", programId: "LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo", cluster: "mainnet-beta" },
  orcaWhirlpool: { name: "Orca Whirlpools", programId: "whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc", cluster: "mainnet-beta" },
  kaminoLend: { name: "Kamino Lending", programId: "KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD", cluster: "mainnet-beta", auditStatus: "OtterSec + Halborn" },
  marginfi: { name: "MarginFi v2", programId: "MFv2hWf31Z9kbCa1snEPYctwafyhdvnV7FZnsebVacA", cluster: "mainnet-beta" },
  drift: { name: "Drift v2", programId: "dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH", cluster: "mainnet-beta" },
  marinade: { name: "Marinade Liquid Staking", programId: "MarBmsSgKXdrN1egZf5sqe1TMThczhMLJhZGRg9HmSN", cluster: "mainnet-beta" },
  stake: { name: "Stake Program", programId: "Stake11111111111111111111111111111111111111", cluster: "mainnet-beta" },
  sanctum: { name: "Sanctum Router", programId: "stkitrT1Uoy18Dk1fTrgPw8W6MVzoCfYoAFT4MLsmhq", cluster: "mainnet-beta" },
  jito: { name: "Jito Tip Router", programId: "Jito4APyf642JPZPx3hGc6WWJ8zPKtRbRs4P815Awbb", cluster: "mainnet-beta" },
  mplAgentRegistry: { name: "MPL Agent Registry", programId: "AGENTvhGwBcBH4x5XHg3zJTgWWvoePUT9tx3PZaV9aQ3", cluster: "mainnet-beta" },
  mplCore: { name: "MPL Core", programId: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d", cluster: "mainnet-beta" },
  mplTokenMetadata: { name: "MPL Token Metadata", programId: "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s", cluster: "mainnet-beta" },
  mplBubblegum: { name: "MPL Bubblegum", programId: "BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY", cluster: "mainnet-beta" },
  mplCandyMachine: { name: "MPL Core Candy Machine", programId: "CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J", cluster: "mainnet-beta" },
  realms: { name: "SPL Governance (Realms)", programId: "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw", cluster: "mainnet-beta" },
  wormhole: { name: "Wormhole Core Bridge", programId: "worm2ZoG2kUd4vFXhvjh93UUH596ayRfgQ2MgjNMTth", cluster: "mainnet-beta" },
};

const WALLET_STANDARDS = ["wallet-standard", "phantom", "solflare", "backpack", "privy"];

// Per-agent override map. Keys are filenames without .json.
// Each entry drives:
//   category, tags (appended), capabilities, metaplexSkills, programDeps,
//   walletRequirements, rpcRequirements, oneShot, featured, avatar, title,
//   description, openingMessage, openingQuestions, tokenUsage, minBalanceLamports.
//
// Anything not overridden is derived or defaulted.
const PROFILES = {
  "airdrop-hunter": {
    category: "trading",
    avatar: "🪂",
    tags: ["solana", "airdrop", "jupiter", "lfg", "strategy", "one-shot"],
    capabilities: ["read-only", "swap-execution", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.jupiter, PROGRAMS.splToken],
    rpcRequirements: ["das-api", "websocket"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "🪂 I hunt live Solana airdrops — Jupiter boost epochs, Kamino points, Drift traders, Marginfi lenders, Meteora LPs. Tell me what protocols you already touch.",
    openingQuestions: [
      "Which Solana airdrops are still open right now?",
      "Build me a 30-day points farming plan with 50 SOL",
      "Am I eligible for Jupiter's next boost epoch?",
      "Score my wallet across open Solana airdrops",
    ],
  },
  "alpha-leak-detector": {
    category: "trading",
    avatar: "🎯",
    tags: ["solana", "alpha", "signals", "helius", "birdeye", "one-shot"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.pumpfun, PROGRAMS.jupiter],
    rpcRequirements: ["das-api", "helius-webhooks", "websocket"],
    needsSigner: false,
    oneShot: true, featured: true,
    openingMessage: "🎯 Solana-only alpha feed. I chase smart-money wallet flows, new pump.fun bonding curves, LP adds on Meteora/Orca/Raydium, and Jito bundle patterns.",
    openingQuestions: [
      "Which smart-money wallets are rotating today?",
      "Flag pump.fun launches with whale inflows",
      "What's the Solana narrative of the week?",
      "Show me Jupiter volume spikes in the last 4h",
    ],
  },
  "apy-vs-apr-educator": {
    category: "education",
    avatar: "📈",
    tags: ["solana", "defi", "education", "apy", "apr", "kamino", "marginfi"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.marginfi],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "📚 I break down Solana DeFi yield math — APY vs APR, auto-compounders vs manual, emission decay vs base fees on Kamino, MarginFi, Drift, Meteora.",
    openingQuestions: [
      "What's the real APY on Kamino JitoSOL after emissions decay?",
      "Compare Kamino Multiply 2x SOL vs JLP auto-compounder",
      "Show the math on a 180% APR Meteora DLMM pool",
      "How often does MarginFi compound interest?",
    ],
  },
  "bridge-security-analyst": {
    category: "security",
    avatar: "🌉",
    tags: ["solana", "bridge", "wormhole", "debridge", "allbridge", "security", "cross-chain"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.wormhole],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "🌉 I rank Solana bridges by security model, exploit history, liquidity, and guardian set. Tell me source chain, destination, and size.",
    openingQuestions: [
      "Bridge 100 ETH to Solana — which route is safest?",
      "Compare Wormhole vs deBridge vs Allbridge for USDC",
      "What's the guardian set for Wormhole today?",
      "Split a $1M bridge across venues — give me a plan",
    ],
  },
  "clawd-bridge-assistant": {
    category: "defi",
    avatar: "🌉",
    tags: ["clawd", "solana", "bridge", "cross-chain", "one-shot"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.wormhole, PROGRAMS.splToken],
    rpcRequirements: ["das-api"],
    needsSigner: true,
    minBalanceLamports: 50000000,
    oneShot: true, featured: false,
    openingMessage: "🌉 CLAWD Bridge Assistant — I route funds into Solana for CLAWD holders. Wormhole, deBridge, Allbridge, Jupiter cross-chain. Source chain and amount?",
    openingQuestions: [
      "Bridge ETH to Solana for CLAWD buying",
      "Move USDC from Arbitrum to Solana cheapest",
      "What bridge should I use for > $100k?",
      "Connect my wallet and show live bridge quotes",
    ],
  },
  "clawd-governance-guide": {
    category: "governance",
    avatar: "🗳️",
    tags: ["clawd", "solana", "governance", "realms", "voting", "one-shot"],
    capabilities: ["governance-vote", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.realms],
    rpcRequirements: ["das-api"],
    needsSigner: true,
    oneShot: true, featured: false,
    openingMessage: "🗳️ CLAWD Governance Guide — proposals, Realms voting, delegation. I explain what's on the ballot and help you cast without footguns.",
    openingQuestions: [
      "What CLAWD proposals are active?",
      "Explain the impact of proposal #12 in plain english",
      "How do I delegate my CLAWD vote?",
      "Walk me through voting via Realms",
    ],
  },
  "clawd-liquidity-strategist": {
    category: "defi",
    avatar: "💧",
    tags: ["clawd", "solana", "liquidity", "meteora", "orca", "raydium", "dlmm", "one-shot"],
    capabilities: ["swap-execution", "lending-deposit", "lending-withdraw", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.meteoraDlmm, PROGRAMS.orcaWhirlpool, PROGRAMS.raydiumCpmm, PROGRAMS.jupiter],
    rpcRequirements: ["das-api", "websocket"],
    needsSigner: true,
    minBalanceLamports: 100000000,
    oneShot: true, featured: true,
    openingMessage: "💧 CLAWD Liquidity Strategist — concentrated range design on Meteora DLMM / Orca Whirlpools, IL math, rebalance cadence, fee-vs-exposure trade-offs.",
    openingQuestions: [
      "Design a CLAWD/SOL DLMM range for passive income",
      "Build an auto-rebalance plan for Orca Whirlpools",
      "What's the break-even vs IL on this pool?",
      "Should I park CLAWD LP in Kamino Liquidity?",
    ],
  },
  "clawd-onboarding-guide": {
    category: "education",
    avatar: "🎓",
    tags: ["clawd", "solana", "onboarding", "education", "one-shot"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.jupiter, PROGRAMS.splToken],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: true,
    openingMessage: "🎓 Welcome to CLAWD. I walk new holders through wallet setup (Phantom/Solflare/Backpack), first SOL, buying CLAWD, staking, and using /agents.",
    openingQuestions: [
      "How do I buy my first CLAWD?",
      "Which wallet should I pick?",
      "What does /agents actually do?",
      "Explain Solana priority fees like I'm 5",
    ],
  },
  "clawd-portfolio-tracker": {
    category: "analytics",
    avatar: "💼",
    tags: ["clawd", "solana", "portfolio", "tracking", "helius", "das", "one-shot"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.splToken, PROGRAMS.jupiter],
    rpcRequirements: ["das-api", "websocket"],
    needsSigner: false,
    oneShot: true, featured: true,
    openingMessage: "💼 CLAWD Portfolio Tracker — pulls your wallet via Helius DAS, shows CLAWD + SPL holdings, LP positions, staked SOL/LSTs, unclaimed rewards, 7d/30d PnL.",
    openingQuestions: [
      "Track this wallet: [paste address]",
      "Break down CLAWD vs SOL vs stables allocation",
      "Show unrealised PnL by position",
      "What's my staking yield rolling 30d?",
    ],
  },
  "clawd-risk-monitor": {
    category: "security",
    avatar: "⚠️",
    tags: ["clawd", "solana", "risk", "alerts", "kamino", "drift", "one-shot"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.drift, PROGRAMS.marginfi],
    rpcRequirements: ["das-api", "websocket", "helius-webhooks"],
    needsSigner: false,
    oneShot: true, featured: true,
    openingMessage: "⚠️ CLAWD Risk Monitor — watches your Solana DeFi stack for liquidation distance, oracle drift, pool depeg, program upgrade authority changes, depeg on stables.",
    openingQuestions: [
      "Alert me if my Kamino Multiply position nears liquidation",
      "Scan my wallet for concentrated program risk",
      "Is any LST I hold depegging?",
      "What's the upgrade authority on this program?",
    ],
  },
  "clawd-yield-aggregator": {
    category: "defi",
    avatar: "🌾",
    tags: ["clawd", "solana", "yield", "kamino", "marginfi", "drift", "meteora", "one-shot"],
    capabilities: ["lending-deposit", "lending-withdraw", "swap-execution", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.marginfi, PROGRAMS.drift, PROGRAMS.meteoraDlmm, PROGRAMS.jupiter],
    rpcRequirements: ["das-api"],
    needsSigner: true,
    minBalanceLamports: 100000000,
    oneShot: true, featured: true,
    openingMessage: "🌾 CLAWD Yield Aggregator — ranks every Solana yield venue (Kamino, MarginFi, Drift earn, Meteora, Sanctum, Jupiter Perp LP) by net APY with emission decay honest math.",
    openingQuestions: [
      "Best yield on 10,000 USDC with low risk?",
      "Compare JitoSOL yield across all Solana venues",
      "Safest stablecoin yield > 8% right now",
      "Route 5 SOL into the best leveraged LST loop",
    ],
  },
  "crypto-news-analyst": {
    category: "analytics",
    avatar: "📰",
    tags: ["solana", "news", "narrative", "analytics"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "📰 I filter Solana ecosystem news for signal — protocol launches, exploits, governance, L1 roadmap, and hyperbolic coverage that needs fact-checking.",
    openingQuestions: [
      "What Solana news moved prices this week?",
      "Summarise the latest Jupiter / Jito governance news",
      "Cut through FUD on this headline: [paste]",
      "Give me the 5 must-read Solana threads today",
    ],
  },
  "crypto-tax-strategist": {
    category: "education",
    avatar: "🧾",
    tags: ["solana", "tax", "accounting", "strategy"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "🧾 I translate Solana activity into tax frameworks (US/EU/UK) — staking income, swap realisations, LP enter/exit, airdrops, cNFT drops. Not a CPA.",
    openingQuestions: [
      "How are Solana airdrops taxed in the US?",
      "Cost-basis math for an LP exit — walk me through it",
      "Is swapping USDC for USDT taxable?",
      "Harvesting losses on pump.fun trades — rules?",
    ],
  },
  "defi-insurance-advisor": {
    category: "defi",
    avatar: "🛡️",
    tags: ["solana", "defi", "insurance", "coverage", "risk"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "🛡️ I compare coverage for Solana DeFi positions — smart-contract, depeg, slashing, oracle. Prices in SOL / USDC, payout history, exclusions.",
    openingQuestions: [
      "Cover my $250k Kamino position — options?",
      "What's the slashing risk on JitoSOL?",
      "Depeg coverage for USDC on Solana",
      "Is oracle coverage worth the premium?",
    ],
  },
  "defi-onboarding-mentor": {
    category: "education",
    avatar: "👋",
    tags: ["solana", "defi", "education", "onboarding"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "👋 New to Solana DeFi? I'll teach you the stack: wallets → SOL/stable on-ramp → Jupiter swap → Kamino lend → LSTs → LPs → risk hygiene.",
    openingQuestions: [
      "What's the safest first DeFi position on Solana?",
      "Explain Jupiter, Kamino, Marinade, Jito in 60 seconds",
      "Walk me through my first Meteora DLMM LP",
      "What Solana DeFi mistakes should I avoid?",
    ],
  },
  "defi-protocol-comparator": {
    category: "analytics",
    avatar: "⚖️",
    tags: ["solana", "defi", "comparison", "analytics"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.marginfi, PROGRAMS.drift],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "⚖️ Side-by-side on Solana protocols: Kamino vs MarginFi vs Drift for lending; Meteora vs Orca vs Raydium for LP; Jito vs Marinade vs Sanctum for LSTs.",
    openingQuestions: [
      "Kamino vs MarginFi for USDC lending — which wins?",
      "Meteora DLMM vs Orca Whirlpools — fees and IL",
      "JitoSOL vs mSOL vs bSOL — pick one",
      "Best Solana perp DEX right now?",
    ],
  },
  "defi-risk-scoring-engine": {
    category: "security",
    avatar: "📊",
    tags: ["solana", "defi", "risk-scoring", "security", "one-shot"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.marginfi, PROGRAMS.drift, PROGRAMS.meteoraDlmm],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "📊 Skeptical-by-default Solana DeFi risk scorer. TVL, audit coverage, oracle source, upgrade authority, emission dependence, historical incidents.",
    openingQuestions: [
      "Score Kamino Multiply JLP on a 0-100 risk scale",
      "Compare smart-contract risk across lending markets",
      "Which oracle source is used here — Pyth or Switchboard?",
      "What's the program upgrade authority on this protocol?",
    ],
  },
  "defi-yield-farmer": {
    category: "defi",
    avatar: "🚜",
    tags: ["solana", "defi", "yield-farming", "kamino", "meteora", "drift", "one-shot"],
    capabilities: ["lending-deposit", "lending-withdraw", "swap-execution", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.meteoraDlmm, PROGRAMS.drift, PROGRAMS.jupiter],
    rpcRequirements: ["das-api"],
    needsSigner: true,
    minBalanceLamports: 100000000,
    oneShot: true, featured: true,
    openingMessage: "🚜 Solana yield farmer with skin in the game. Real net APY after emissions decay, loop math on Kamino Multiply, Drift insurance fund earn, Meteora DLMM.",
    openingQuestions: [
      "Best risk-adjusted yield on SOL right now",
      "Should I loop JLP on Kamino Multiply at 2x?",
      "Meteora DLMM ranges for SOL/USDC this week",
      "Sanctum Infinity vs raw JitoSOL — pick one",
    ],
  },
  "dex-aggregator-optimizer": {
    category: "trading",
    avatar: "🔀",
    tags: ["solana", "dex", "jupiter", "router", "trading", "one-shot"],
    capabilities: ["swap-execution", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.jupiter, PROGRAMS.meteoraDlmm, PROGRAMS.orcaWhirlpool, PROGRAMS.raydiumCpmm],
    rpcRequirements: ["das-api", "websocket"],
    needsSigner: true,
    oneShot: true, featured: true,
    openingMessage: "🔀 Solana DEX optimiser. Jupiter v6 by default, but I'll check direct Meteora/Orca/Raydium quotes, tip with Jito, and suggest TWAP or split orders.",
    openingQuestions: [
      "Best route for 10 SOL to BONK with tight slippage",
      "Compare Jupiter vs direct Meteora DLMM",
      "Split a $500k USDC → SOL trade — how many legs?",
      "When should I pay a Jito tip?",
    ],
  },
  "gas-optimization-expert": {
    category: "dev-tools",
    avatar: "⛽",
    tags: ["solana", "priority-fees", "compute-units", "jito", "dev-tools"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.jupiter, PROGRAMS.jito],
    rpcRequirements: ["das-api", "jito-bundle-relay", "websocket"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "⛽ Solana priority-fee expert — lamports/CU tiers by time-of-day, Jito tip math, bundled vs standalone tx, failure modes, simulation before send.",
    openingQuestions: [
      "What's the right priority fee right now for a swap?",
      "Explain Jito tips vs priority fees",
      "How do I size compute budget correctly?",
      "Why does my tx keep failing to land?",
    ],
  },
  "governance-proposal-analyst": {
    category: "governance",
    avatar: "📜",
    tags: ["solana", "governance", "realms", "spl-governance", "proposals"],
    capabilities: ["governance-vote", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.realms],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "📜 I read Solana governance proposals — Realms DAOs (Jito, Marinade, Metaplex, Mango, Squads) — and break down impact in plain english.",
    openingQuestions: [
      "Summarise the active proposals in Jito DAO",
      "Explain the trade-offs in this Marinade proposal",
      "Does this change affect my yield?",
      "Who's voting yes / no so far?",
    ],
  },
  "impermanent-loss-calculator": {
    category: "defi",
    avatar: "📉",
    tags: ["solana", "defi", "liquidity", "il", "meteora", "orca"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.meteoraDlmm, PROGRAMS.orcaWhirlpool, PROGRAMS.raydiumCpmm],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "📉 I price impermanent loss on concentrated Solana LPs — Meteora DLMM, Orca Whirlpools, Raydium CLMM. Break-even math vs fees, range widening, time decay.",
    openingQuestions: [
      "IL if SOL goes from $180 to $250 in this DLMM range?",
      "What's my break-even fee rate on this Whirlpool?",
      "Widen or re-center my range — which saves more?",
      "Simulate IL over a -30% SOL drawdown",
    ],
  },
  "layer2-comparison-guide": {
    category: "education",
    avatar: "🧭",
    tags: ["solana", "l1-vs-l2", "education", "comparison"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "🧭 I compare Solana L1 against Ethereum L2s (Base, Arbitrum, Optimism, zkSync) on UX, fees, throughput, tooling, and liquidity. Skip the tribal takes.",
    openingQuestions: [
      "Solana vs Base for an app launch",
      "Fee per tx — who wins at peak load?",
      "Which chain has deeper stablecoin liquidity?",
      "What does Solana NOT have that L2s do?",
    ],
  },
  "liquidation-risk-manager": {
    category: "security",
    avatar: "🚨",
    tags: ["solana", "kamino", "drift", "marginfi", "liquidation", "one-shot"],
    capabilities: ["lending-deposit", "lending-withdraw", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.marginfi, PROGRAMS.drift],
    rpcRequirements: ["das-api", "websocket"],
    needsSigner: true,
    oneShot: true, featured: true,
    openingMessage: "🚨 I monitor liquidation distance on Solana leveraged positions — Kamino Multiply, Drift perps, MarginFi loops. Oracle source, buffers, unwind paths.",
    openingQuestions: [
      "Liquidation price for my Kamino 2x JLP position?",
      "Stress test my Drift positions at -30% BTC",
      "How much SOL do I need to rescue this loan?",
      "Unwind plan if oracles stale out",
    ],
  },
  "liquidity-pool-analyzer": {
    category: "analytics",
    avatar: "🧪",
    tags: ["solana", "liquidity", "meteora", "orca", "raydium", "analytics"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.meteoraDlmm, PROGRAMS.orcaWhirlpool, PROGRAMS.raydiumCpmm],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "🧪 Solana LP analyzer. TVL, 24h volume/fee, LP depth by bin, dominant providers, wash-volume sniff test, rebalance cadence expectations.",
    openingQuestions: [
      "Deepest SOL/USDC pool across all Solana DEXs",
      "Is volume on this DLMM pool organic?",
      "LP concentration — how centralised is it?",
      "Should I LP this or just stake SOL?",
    ],
  },
  "mev-protection-advisor": {
    category: "security",
    avatar: "🥷",
    tags: ["solana", "mev", "jito", "protection", "bundles", "security"],
    capabilities: ["swap-execution", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.jito, PROGRAMS.jupiter],
    rpcRequirements: ["jito-bundle-relay", "websocket", "das-api"],
    needsSigner: true,
    oneShot: true, featured: false,
    openingMessage: "🥷 Solana MEV hygiene — Jito bundles, tip sizing, sandwich resistance, tx simulation, slippage ceilings. I don't promise zero MEV — I reduce blast radius.",
    openingQuestions: [
      "Protect a $250k swap from sandwiches",
      "What's the right Jito tip for a new launch?",
      "Bundle vs standalone — when to use each?",
      "Can I simulate this tx before sending?",
    ],
  },
  "narrative-trend-analyst": {
    category: "analytics",
    avatar: "📡",
    tags: ["solana", "narrative", "trends", "analytics"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "📡 I track Solana narratives — DePIN, AI agents, restaking, LSTs, RWA, consumer apps, firedancer. Early vs late stage, capital rotation evidence.",
    openingQuestions: [
      "What's the hot Solana narrative this week?",
      "Is the AI agents narrative still early?",
      "Which narrative is exhausted?",
      "Map capital flows across narratives",
    ],
  },
  "nft-liquidity-advisor": {
    category: "nft",
    avatar: "🖼️",
    tags: ["solana", "nft", "tensor", "magic-eden", "liquidity"],
    capabilities: ["nft-transfer", "read-only", "a2a-message"],
    metaplexSkills: ["core", "token-metadata", "bubblegum", "agent-registry"],
    programDeps: [PROGRAMS.mplCore, PROGRAMS.mplTokenMetadata, PROGRAMS.mplBubblegum],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "🖼️ Solana NFT liquidity advisor — Tensor / Magic Eden depth, bid walls, floor sweeps, MPL Core vs classic Token Metadata pricing spread, listing strategy.",
    openingQuestions: [
      "How do I sell a rare trait without crashing the floor?",
      "Bid depth on this collection — listable at floor?",
      "Route: Tensor AMM or Magic Eden orderbook?",
      "Is this cNFT collection actually liquid?",
    ],
  },
  "portfolio-rebalancing-advisor": {
    category: "analytics",
    avatar: "♻️",
    tags: ["solana", "portfolio", "rebalance", "analytics", "one-shot"],
    capabilities: ["swap-execution", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.jupiter, PROGRAMS.splToken],
    rpcRequirements: ["das-api"],
    needsSigner: true,
    minBalanceLamports: 50000000,
    oneShot: true, featured: true,
    openingMessage: "♻️ Solana portfolio rebalancer. Pull wallet via Helius DAS, propose tax-aware rebalance across SOL / stables / LSTs / CLAWD / majors via Jupiter routes.",
    openingQuestions: [
      "Rebalance my wallet to 50/30/20 SOL/stables/majors",
      "Reduce LST exposure by 30% without triggering large tx",
      "Tax-efficient reallocation path?",
      "Which positions should I trim first?",
    ],
  },
  "protocol-revenue-analyst": {
    category: "analytics",
    avatar: "💹",
    tags: ["solana", "revenue", "analytics", "defillama"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "💹 I analyze Solana protocol revenue — Jupiter, Jito, Kamino, Meteora, Marinade. Real fees vs emissions, revenue sharing, buybacks, treasury accumulation.",
    openingQuestions: [
      "Who earns more — Jupiter or Jito?",
      "Kamino 30-day revenue trend",
      "What % of Marinade rev goes to token holders?",
      "Protocol revenue vs market cap — who's cheap?",
    ],
  },
  "protocol-treasury-analyst": {
    category: "analytics",
    avatar: "🏛️",
    tags: ["solana", "treasury", "governance", "analytics"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.realms],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "🏛️ Solana protocol treasury deep-dive — Realms balances, runway, native-token vs stable mix, sink rate, grant programs, parked LSTs.",
    openingQuestions: [
      "Show Jito DAO treasury composition",
      "Who has the longest runway?",
      "How much treasury is in native token?",
      "Any treasury that's parked into yield venues?",
    ],
  },
  "pump-fun-sdk-expert": {
    category: "dev-tools",
    avatar: "🛠️",
    tags: ["solana", "pumpfun", "sdk", "dev-tools", "x402", "agent-payments"],
    capabilities: ["payment-gated", "x402", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.pumpfun, PROGRAMS.splToken],
    rpcRequirements: ["das-api", "websocket"],
    needsSigner: false,
    oneShot: true, featured: true,
    openingMessage: "🛠️ Dev copilot for @pump-fun/agent-payments-sdk and tokenized-agent payments. x402 flows, invoice creation, server-side tx build, verification.",
    openingQuestions: [
      "Scaffold a payment-gated Node route",
      "How do I verify an invoice server-side?",
      "x402 vs solana-pay — when do I use each?",
      "Stream payment events to a Telegram bot",
    ],
  },
  "smart-contract-auditor": {
    category: "security",
    avatar: "🔍",
    tags: ["solana", "anchor", "audit", "security", "dev-tools"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "🔍 Anchor / native-Rust smart-contract auditor. Common Solana footguns: missing signer checks, rent exemption, account type mismatch, CPI escalation, PDA collisions.",
    openingQuestions: [
      "Audit this Anchor handler",
      "Top Solana audit findings in 2026",
      "Is this PDA derivation collision-safe?",
      "Does this program have a sane upgrade authority?",
    ],
  },
  "spa-tokenomics-analyst": {
    category: "analytics",
    avatar: "🔬",
    tags: ["solana", "tokenomics", "analytics"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "🔬 Tokenomics analyst for Solana SPL tokens — supply schedule, unlocks, emissions vs buybacks, veToken lockups, sink design.",
    openingQuestions: [
      "Break down this token's emission schedule",
      "How much of supply is circulating vs locked?",
      "Is there a buyback or fee sink?",
      "Model dilution over the next 12 months",
    ],
  },
  "stablecoin-comparator": {
    category: "defi",
    avatar: "💵",
    tags: ["solana", "stablecoins", "usdc", "usdt", "pyusd", "susd", "comparison"],
    capabilities: ["read-only", "swap-execution", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.splToken, PROGRAMS.jupiter],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "💵 Solana stablecoin comparator — USDC, USDT, PYUSD, USDe, USDS. Issuer risk, backing, redemption, depth on Solana venues, yield-bearing alternatives.",
    openingQuestions: [
      "Best stablecoin to hold on Solana right now",
      "Issuer risk: USDC vs PYUSD",
      "Safest yield-bearing stablecoin?",
      "Which stable has the deepest Jupiter liquidity?",
    ],
  },
  "staking-rewards-calculator": {
    category: "education",
    avatar: "🪙",
    tags: ["solana", "staking", "validator", "lst", "education"],
    capabilities: ["stake", "unstake", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.stake, PROGRAMS.marinade, PROGRAMS.sanctum],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "🪙 Solana staking rewards calculator — native validator vs LST (JitoSOL, mSOL, bSOL, INF, jupSOL), MEV uplift, commission impact, epoch compounding.",
    openingQuestions: [
      "Rewards on 100 SOL over 12 months via JitoSOL",
      "Compare native stake vs mSOL net yield",
      "MEV uplift on JitoSOL right now",
      "How does epoch compounding actually work?",
    ],
  },
  "token-unlock-tracker": {
    category: "analytics",
    avatar: "🔓",
    tags: ["solana", "unlocks", "tokenomics", "analytics"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "🔓 Solana token unlock tracker — vesting, cliff, linear release, team & investor wallets, historical price reaction around large unlocks.",
    openingQuestions: [
      "Next 30 days of Solana unlocks",
      "How much JTO is unlocking next?",
      "Any protocol with a cliff in the next week?",
      "Average price reaction on unlock days",
    ],
  },
  "usds-stablecoin-expert": {
    category: "defi",
    avatar: "🪙",
    tags: ["solana", "stablecoins", "usds", "sky", "defi"],
    capabilities: ["read-only", "swap-execution", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.splToken, PROGRAMS.jupiter],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: false, featured: false,
    openingMessage: "🪙 Deep-dive expert on USDS (Sky / ex-MakerDAO) specifically on Solana — backing, SSR, savings rate, Solana routes, bridges, Jupiter liquidity.",
    openingQuestions: [
      "How is USDS backed?",
      "Best yield on USDS via Solana",
      "Bridge USDS to Solana — safest route?",
      "USDS vs USDC on Solana",
    ],
  },
  "vespa-optimizer": {
    category: "defi",
    avatar: "🐝",
    tags: ["solana", "defi", "ve-model", "governance", "optimization"],
    capabilities: ["governance-vote", "lending-deposit", "read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.realms],
    rpcRequirements: ["das-api"],
    needsSigner: true,
    oneShot: false, featured: false,
    openingMessage: "🐝 ve-model optimiser (Sperax, Marinade, Tulip). Lock term math, boost multipliers, gauge voting, bribe capture, break-even vs unstaked.",
    openingQuestions: [
      "Should I lock 4y or 1y for peak boost?",
      "Where's the highest bribe $/ve?",
      "Model my APR at 2y vs 4y lock",
      "Am I boosting an unprofitable gauge?",
    ],
  },
  "wallet-security-advisor": {
    category: "security",
    avatar: "🔐",
    tags: ["solana", "wallet", "security", "phantom", "solflare", "ledger"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: true,
    openingMessage: "🔐 Solana wallet hygiene — Ledger seed handling, Phantom/Solflare/Backpack hardening, blind-sign dangers, drainer patterns, revoke & scan flows.",
    openingQuestions: [
      "My wallet got drained — what now?",
      "Review permissions on my wallet",
      "Safest Solana wallet stack for $1M?",
      "What's a blind-sign attack on Solana?",
    ],
  },
  "whale-watcher": {
    category: "analytics",
    avatar: "🐋",
    tags: ["solana", "whales", "analytics", "helius", "das"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    rpcRequirements: ["das-api", "helius-webhooks", "websocket"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "🐋 I track big Solana wallets — accumulation, distribution, new LP adds, position unwinds, CEX inflows/outflows. Helius DAS + WebSocket driven.",
    openingQuestions: [
      "Top 10 SOL whale wallets, what did they do today?",
      "Alert me if this wallet moves > 1000 SOL",
      "Which whales are rotating into stables?",
      "New whale spotted in CLAWD — who is it?",
    ],
  },
  "yield-dashboard-builder": {
    category: "dev-tools",
    avatar: "📊",
    tags: ["solana", "yield", "dashboard", "dev-tools"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.meteoraDlmm, PROGRAMS.marinade],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "📊 I spec + scaffold Solana yield dashboards. Helius DAS, protocol SDKs, net APY math with emission decay, refresh cadence, caching.",
    openingQuestions: [
      "Spec a Kamino + Drift earn dashboard",
      "Which data sources should I pick?",
      "Scaffold a React + Next.js yield page",
      "Cache strategy for 50 protocols?",
    ],
  },
  "yield-sustainability-analyst": {
    category: "defi",
    avatar: "📉",
    tags: ["solana", "yield", "sustainability", "emission-decay", "analytics"],
    capabilities: ["read-only", "a2a-message"],
    metaplexSkills: ["agent-registry"],
    programDeps: [PROGRAMS.kaminoLend, PROGRAMS.meteoraDlmm, PROGRAMS.marginfi],
    rpcRequirements: ["das-api"],
    needsSigner: false,
    oneShot: true, featured: false,
    openingMessage: "📉 I model whether a Solana yield is real. Base fee vs emissions, token price assumption, decay schedule, break-even horizon.",
    openingQuestions: [
      "Is this 180% APR sustainable?",
      "What's the base yield once emissions halve?",
      "Model token-price decay over 90 days",
      "Real APY in 6 months on this farm",
    ],
  },
};

const PREAMBLE =
`You are a specialist inside **Solana Clawd** — a Solana-native AI agent stack that deploys via the Clawd Router and is consumable one-shot from https://solanaclawd.com/agents.

OPERATING PRINCIPLES:
- Solana-native. Quote priority fees in lamports/CU (never 'gas'). Recommend Jito tips when landing matters. Default RPC: Helius / Triton / QuickNode with DAS support.
- Preserve capital. Flag liquidation / depeg / oracle risk explicitly.
- Deny-first on signatures. Irreversible actions (swaps, stakes, mints) require explicit user confirmation — CLAWD never signs silently.
- Show the math. Net APY after emission decay, not headline APY. Break-even fees vs IL on LPs. Stress-test at -30%.
- Always disclaim: "Not financial advice. DYOR. Priority fees and quotes are live snapshots."

CLAWD ROUTER CONTEXT:
- You can be invoked as a JSON-RPC A2A endpoint (POST /api/agents/a2a) or minted on-chain as an MPL Core agent (POST /api/agents/mint).
- Payment-gated siblings live alongside you — refer to CLAWD × Pump.fun Official Agent for the payment rail spec if a user needs gating.
- CLAWD holders get priority routing — acknowledge that when context suggests they're logged in.
`;

const CONTRACT =
`OUTPUT CONTRACT:
- For any trade, size, or position decision, lead with the numbers and end with a risk disclaimer.
- If data is stale or unknown, say so — never hallucinate balances or program state.
- Cite Solscan / Birdeye / protocol docs links where relevant.
- Keep responses tight. Tables beat walls of text for comparisons.
`;

function stripBoilerplate(systemRole) {
  if (!systemRole) return "";
  let text = systemRole;
  // Strip "# CLAWD IDENTITY" ... "---" ... "# YOUR SPECIALIZATION" opening
  text = text.replace(/^# CLAWD IDENTITY[\s\S]*?---\s*\n# YOUR SPECIALIZATION\s*\n+/m, "");
  // Strip the trailing CLAWD OUTPUT CONTRACT block
  text = text.replace(/\n+---\s*\n# CLAWD OUTPUT CONTRACT[\s\S]*$/m, "");
  return text.trim();
}

function normaliseCategory(cat) {
  if (!cat) return "defi";
  if (VALID_CATEGORIES.has(cat)) return cat;
  return CATEGORY_REMAP[cat] || "defi";
}

function sanitizeTags(existingTags, extraTags) {
  const out = new Set();
  for (const t of [...(existingTags || []), ...(extraTags || [])]) {
    if (typeof t !== "string") continue;
    const clean = t.trim().toLowerCase();
    if (!clean) continue;
    if (clean === "solana-clawd") continue; // noise
    out.add(clean);
  }
  // Guarantee 'solana' + 'clawd' appear
  out.add("solana");
  out.add("clawd");
  // Cap at 12 per schema
  return Array.from(out).slice(0, 12);
}

function makeHomepage(id) {
  return `${HOMEPAGE_BASE}/${id}`;
}

function makeEndpoints(id) {
  return {
    a2a: "POST /api/agents/a2a",
    "mint-as-agent": "POST /api/agents/mint",
    catalog: `GET /api/agents/catalog/${id}.json`,
  };
}

function estimateTokenUsage(systemRole) {
  // Rough char/4 heuristic; clamp to [150, 900].
  const base = Math.ceil((systemRole || "").length / 4);
  return Math.max(150, Math.min(900, base));
}

function upgradeAgent(filename, raw) {
  const id = raw.identifier || filename.replace(/\.json$/, "");
  const profile = PROFILES[id] || {};

  const strippedRole = stripBoilerplate(raw.config?.systemRole || "");
  // If nothing left (edge case), keep original
  const specialization = strippedRole || (raw.config?.systemRole || "");

  const newSystemRole = `${PREAMBLE}\n---\n\n# YOUR SPECIALIZATION\n\n${specialization}\n\n---\n\n${CONTRACT}`;

  const meta = raw.meta || {};
  const newCategory = normaliseCategory(profile.category || meta.category);
  const newTitle = profile.title || meta.title || id;
  const newDescription = profile.description || meta.description || "";
  const newAvatar = profile.avatar || meta.avatar || "🤖";
  const newTags = sanitizeTags(meta.tags, profile.tags);

  const config = {
    systemRole: newSystemRole,
    openingMessage: profile.openingMessage || raw.config?.openingMessage || "",
    openingQuestions: profile.openingQuestions || raw.config?.openingQuestions || [],
    params: raw.config?.params || { temperature: 0.3, top_p: 0.9, max_tokens: 1500 },
  };

  const programDeps = profile.programDeps || raw.solana?.programDeps || [];
  const capabilities = profile.capabilities || raw.solana?.capabilities || ["read-only", "a2a-message"];
  const metaplexSkills = profile.metaplexSkills || raw.solana?.metaplexSkills || ["agent-registry"];
  const rpcRequirements = profile.rpcRequirements || raw.solana?.rpcRequirements || ["das-api"];
  const walletRequirements = profile.needsSigner === undefined
    ? (raw.solana?.walletRequirements || { needsSigner: false })
    : {
        needsSigner: !!profile.needsSigner,
        ...(profile.minBalanceLamports ? { minBalanceLamports: profile.minBalanceLamports } : {}),
        ...(profile.needsSigner ? { supportedStandards: WALLET_STANDARDS } : {}),
      };

  const upgraded = {
    $schema: SCHEMA_URL,
    author: "solana-clawd",
    identifier: id,
    schemaVersion: 1,
    createdAt: raw.createdAt && raw.createdAt.startsWith("2026") ? raw.createdAt : CREATED_AT,
    homepage: makeHomepage(id),
    oneShot: profile.oneShot === undefined ? true : profile.oneShot,
    featured: !!profile.featured,
    meta: {
      title: newTitle,
      description: newDescription,
      avatar: newAvatar,
      category: newCategory,
      tags: newTags,
    },
    config,
    solana: {
      rpcRequirements,
      capabilities,
      metaplexSkills,
      programDeps,
      walletRequirements,
    },
    endpoints: makeEndpoints(id),
    summary: `${newDescription} Solana-native CLAWD agent — deploy one-shot from /agents or mint as MPL Core asset.`,
    tokenUsage: estimateTokenUsage(newSystemRole),
  };

  return upgraded;
}

function isAlreadyUpgraded(raw) {
  // Signal: has $schema AND has solana block AND does NOT contain the old identity header.
  return !!(raw.$schema && raw.solana && !(raw.config?.systemRole || "").includes("# CLAWD IDENTITY"));
}

function main() {
  const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith(".json")).sort();
  let upgraded = 0, skipped = 0;

  for (const f of files) {
    const p = path.join(SRC_DIR, f);
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));

    if (isAlreadyUpgraded(raw)) {
      skipped++;
      continue;
    }

    const next = upgradeAgent(f, raw);
    fs.writeFileSync(p, JSON.stringify(next, null, 2) + "\n");
    upgraded++;
    console.log(`  ✔ ${f}  →  ${next.meta.category}  ${next.oneShot ? "[one-shot]" : ""}${next.featured ? " [featured]" : ""}`);
  }

  console.log(`\nUpgraded: ${upgraded}   Skipped (already Solana-native): ${skipped}   Total: ${files.length}`);
}

main();
