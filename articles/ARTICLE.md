# Clawd Terminal: The AI Trading Computer Powered by $CLAWD and Solana

*A deep dive into every feature of the Solana Clawd ecosystem — the terminal, the burn mechanism, the autonomous browser agent, and why this changes everything for on-chain AI.*

---

## What Is Clawd Terminal?

Clawd Terminal is a full-stack Solana AI trading computer that lives in your browser. Think Bloomberg Terminal meets ChatGPT meets a DEX — except it burns tokens every time you use it, it can take over your browser to research tokens for you, and it mints AI agents as on-chain assets.

It is built on three pillars:

1. **$CLAWD token** — the deflationary fuel that powers every AI interaction
2. **Autonomous browser agent** — an AI that navigates the web, analyzes tokens, and controls your wallet
3. **On-chain agent registry** — AI agents minted as Metaplex assets on Solana

This article walks through every feature, where to find it, what it does, and why it matters.

---

## The Dashboard: Your Command Center

When you open the terminal at `/terminal`, you see a three-column layout:

### Left: Wallet Sidebar

The wallet sidebar shows everything about your connected Solana wallet at a glance.

**What you see:**
- Your wallet address with one-click copy
- **SOL balance** and its USD value
- **Portfolio value** pulled from Birdeye or Helius (whichever has better data)
- **$CLAWD price** with live Birdeye feed indicator
- **$CLAWD balance** — your token holdings
- **Token count** — how many tokens you hold across your wallet
- **Token holder verification** — green shield if you hold $CLAWD, red warning if you don't
- **Top assets** — your highest-value holdings ranked by USD

**Where:** Left sidebar, always visible on desktop. On mobile, swipe from the left edge or tap the hamburger menu.

**Data sources:** Birdeye API for portfolio and pricing, Helius DAS API for asset enumeration, Solana RPC for balances.

### Center: AI Chat Panel

The center panel is where you talk to AI models. This is the heart of the terminal.

**What you can do:**
- Chat with **8+ AI models** including Grok 4.20 Reasoning, Claude Opus 4.6, MiniMax M2.7, GPT-5.4 Nano, GLM 5.1, and Gemma 4
- **Stream responses** in real-time with full Markdown rendering
- **Attach images** — drag and drop or paste screenshots for vision analysis
- **Live Vision mode** — capture your screen or webcam and send frames to the AI
- **Generate images** — create art with Seedance, DALL-E, or Flux
- **Generate video** — Seedance 2.0 text-to-video and image-to-video
- **Generate music** — MiniMax Music 2.6 for AI-composed tracks
- **Session management** — switch between chat sessions, view history, delete old ones

**Starter prompts** change based on the selected model. Grok gets research-oriented prompts. MiniMax gets coding prompts. General models get trading prompts.

**Where:** Center column, always visible. Takes up remaining space between wallet and data panels.

### Right: Data Panels (12 Tabs)

The right sidebar is a tabbed panel system with 12 specialized views. You can dock it, widen it, or pop it out as an overlay.

**STUDIO** — MiniMax vibe-coding presets. Pick a coding style (vibe, architect, debug, plan) and launch directly into the chat with the right model and prompt.

**DEX** — Trending tokens from Birdeye with price, volume, and 24h change. Includes an embedded Jupiter swap panel — swap tokens without leaving the terminal.

**REPO** — GitHub repository viewer. Browse the solana-clawd codebase, view files, and see recent commits.

**GEN** — Image generation panel. Type a prompt, pick a model (Seedance, DALL-E, Flux), and generate. Results display inline with download buttons.

**VIDEO** — Video generation with Seedance 2.0. Text-to-video and image-to-video modes.

**MUSIC** — AI music generation via MiniMax Music 2.6. Describe a track, generate it, play it back in the built-in player.

**FEED** — X/Twitter social feed integration. See what people are saying about $CLAWD and Solana.

**AGENT** — On-chain agent trading panel. View agent metadata, send messages, manage delegations.

**TRADES** — Trade history viewer. See your recent swaps and transactions.

**BROWSE** — The autonomous browser agent panel. This is new and we cover it in depth below.

**PREDICT** — Jupiter prediction markets. Browse events, place predictions, track positions, and view leaderboards across crypto, politics, sports, tech, and more.

**BURN** — The burn scoreboard. See top burners, your session stats, burn history with model/tokens/cost tracking, and the live burn leaderboard.

### Bottom: Status Bar

A thin status bar at the bottom of the terminal shows:
- System status (ONLINE)
- Daemon status (RUNNING)
- OODA mode (AUTONOMOUS)
- **pAGENT status** — shows READY, RUNNING, or OFFLINE with a color-coded indicator
- Token usage stats (total tokens consumed, total API requests)
- Version number

---

## The Burn Mechanism: Why It Changes Tokenomics

This is the feature that makes $CLAWD fundamentally different from every other AI token.

### How Burning Works

When you toggle **Burn Mode** (the fire button in the chat header), every AI message you send requires a $CLAWD token burn. Not a transfer. Not a fee. A **permanent, irreversible SPL token burn** that removes tokens from the total supply forever.

Here is the exact flow:

1. You type a message and hit send
2. The system checks which AI model you selected and looks up its pricing tier
3. It fetches the current $CLAWD price from Birdeye (updates every 30 seconds)
4. It calculates the burn amount: `burn_tokens = tier_cost_in_usd / clawd_price_in_usd`
5. It builds a Solana `VersionedTransaction` containing a `BurnChecked` instruction from `@solana/spl-token`
6. Your Phantom wallet pops up asking you to sign the burn transaction
7. The transaction is sent to Helius RPC and confirmed on-chain
8. Only after the burn is confirmed does the AI request proceed
9. Your balance updates in real-time

### Why This Is Revolutionary

**Traditional AI tokens** charge fees that go to a treasury, a team wallet, or a staking pool. The tokens move but they never disappear. Supply stays the same or inflates.

**$CLAWD burns are permanent.** Every message, every image, every video, every music track — they all destroy tokens. The supply can only go down.

This creates a simple but powerful dynamic:

- More users = more burns = less supply
- Less supply + same or growing demand = price appreciation
- Price appreciation = fewer tokens burned per message (since burn is USD-denominated)
- This creates a self-balancing flywheel where increased usage drives deflation

The pricing is USD-denominated, which means:
- If $CLAWD price is low, more tokens are burned per message (accelerating deflation)
- If $CLAWD price is high, fewer tokens are burned per message (slowing deflation)
- This natural feedback loop prevents runaway burning while maintaining continuous deflation

### Burn Tiers

The burn amount depends on which AI model you use:

| Tier | Per Message | What You Get |
|------|-----------|--------------|
| **Free** | $0.000 | Basic models (llama-3.1-8b) — no burn required |
| **Standard** | $0.001 | Claude Sonnet, GPT-4o-mini |
| **Premium** | $0.005 | Claude Opus 4.6, GPT-4-turbo, MiniMax M2.7 |
| **Ultra** | $0.010 | o1-preview, Grok Mega |

Media generation has its own pricing: images ($0.04), video ($0.20), music ($0.10), web search ($0.002).

### Burn Scoreboard

The **BURN** tab in the data panels shows:
- **Top burners** — leaderboard of who has burned the most
- **Session stats** — your current session's burn total
- **Burn history** — every burn transaction with model used, tokens burned, USD cost
- **Session summary** — aggregate stats for your usage

### Where to Find It

- **Toggle:** Fire button in the chat panel header
- **Cost badge:** Shows next to the send button before you send
- **Scoreboard:** BURN tab in the right data panels
- **Balance:** Wallet sidebar shows your $CLAWD balance

---

## Autonomous Browser Agent (pAGENT)

This is the feature that turns Clawd from a chat terminal into an autonomous computer operator.

### What It Does

The pAGENT can **take control of your browser** and perform complex multi-step tasks using natural language. You tell it what to do, and it:

1. **Navigates** to any URL — DEXes, explorers, DeFi protocols, token pages
2. **Reads** the page — extracts text, interactive elements, and visual content
3. **Interacts** — clicks buttons, fills forms, scrolls, types, selects dropdowns
4. **Extracts data** — scrapes prices, holder info, transaction tables, structured data
5. **Controls your wallet** — checks Phantom balance, signs messages, views transactions
6. **Reports back** — compiles findings and returns a structured response

It does this through a **ReAct loop** (Reasoning + Acting): at every step, the AI observes the page, thinks about what to do next, takes an action, and repeats until the task is done or it runs out of steps (max 40).

### How to Use It

**Step 1:** Install the [Clawd pAGENT Chrome Extension](https://chromewebstore.google.com/detail/solana-clawd-pagent/ccalceefjldibjloiknckgbkajmjfokd)

**Step 2:** Open the terminal and click the **BROWSE** tab in the right data panel

**Step 3:** You will see:
- **Connection status** — green "pAGENT READY" if the extension is running, red "EXTENSION OFFLINE" if not
- **Autonomous Task input** — type any task in natural language
- **Token Analysis input** — paste a token mint address for instant multi-source analysis
- **Quick Wallet Actions** — one-click buttons for Check Wallet, SOL Balance, Recent TXs, Connect Wallet
- **Browse Presets** — pre-built tasks like "Trending on Birdeye", "pump.fun New Launches", "Jupiter Swap Page", "Solana DeFi Overview"

**Step 4:** Type a task and press Enter. Examples:

- "Go to birdeye.so and find the top gaining token today"
- "Navigate to dexscreener.com/solana and extract the top 5 trending pairs"
- "Check my Phantom wallet balance and recent transactions"
- "Go to pump.fun and find the newest launches with the highest market caps"

**Step 5:** Watch the agent work. You will see:
- A "AGENT RUNNING" indicator with elapsed time
- A stop button to cancel at any time
- Results appear in the task history when complete

### Token Analysis

Paste any Solana token mint address into the **Token Analysis** field and click ANALYZE. The agent will:

1. Navigate to Birdeye and extract: name, symbol, price, 24h volume, market cap, liquidity
2. Navigate to DexScreener and extract: pair info, additional price data, chart patterns
3. Compile a comprehensive analysis and return it

### Quick Wallet Actions

Four one-click buttons:
- **Check Wallet** — detects if Phantom is installed and connected
- **SOL Balance** — checks your SOL balance via RPC
- **Recent TXs** — fetches your last 5 transactions with status and slot info
- **Connect Wallet** — triggers the Phantom connection popup

### Task History

Every completed task is saved in the history tab with:
- Success/failure status (green check or red X)
- The original task description
- Timestamp and duration
- Expandable result text

### Where to Find It

- **BROWSE tab** in the right data panels
- **Status bar** at the bottom shows pAGENT status
- Extension must be installed and running for connection

---

## On-Chain Agent Registry

The **AGENT** tab (accessible at `/agents/:address` or via the AGENT tab in data panels) lets you mint, manage, and interact with AI agents as on-chain Metaplex assets.

### What You Can Do

**Mint an agent:** Create a new on-chain agent identity. You provide a name, image URL, description, and list of services. The system mints a Metaplex Core asset with your metadata.

**View agent details:** Load any agent by its asset address. See its name, image, description, services, wallet address, and delegation status.

**Delegate execution:** Grant another wallet permission to execute actions on your agent's behalf. This is the foundation for autonomous agent-to-agent communication.

**Revoke delegation:** Remove execution permissions.

**Message agents:** Send A2A (agent-to-agent), MCP (Model Context Protocol), or x402 protocol messages to agents.

**Track balance:** View the agent's wallet balance and monitor its on-chain activity.

### Why It Matters

On-chain agents are the next step beyond chatbots. When your AI agent has a Solana wallet, a public identity, and the ability to receive delegated permissions, it can:

- Accept tasks from other agents or users
- Execute transactions with proper authorization
- Build reputation through on-chain activity history
- Participate in decentralized agent marketplaces

### Where to Find It

- **AGENT tab** in the right data panels
- **AGENTS button** in the mobile bottom navigation
- **Direct URL:** `/agents/mint` for minting, `/agents/:address` for viewing

---

## Wallet Integration

Clawd Terminal supports two wallet providers with a unified interface:

### Phantom (Primary)

- Browser extension and embedded wallet
- Sign-in flow with challenge/response verification
- Transaction signing for burn mode and agent operations
- Token gating: must hold $CLAWD to access the terminal

### Jupiter Wallet Adapter

- Primary connection method for advanced users
- Supports all Solana wallet adapters
- Used for Jupiter swap integration

### Reown (Mobile)

- Optional mobile wallet bridge
- Enables mobile users to connect from phones

### Token Gating

The terminal requires a positive $CLAWD balance to access. When you connect your wallet:

1. The system checks your $CLAWD token account via DAS API
2. If balance > 0, you see a green "TOKEN HOLDER VERIFIED" badge
3. If balance = 0, you see a red warning and are prompted to buy $CLAWD

### Where to Find It

- **Wallet sidebar** — left panel on desktop, hamburger menu on mobile
- **Auth callback** — `/auth/callback` handles the Phantom sign-in flow
- **Top bar** — wallet connect button (mobile)

---

## Media Generation Studio

The terminal includes three media generation engines:

### Image Generation (GEN tab)

- **Seedance 2.0** — Bytedance's latest image model
- **DALL-E 3** — OpenAI's image generation
- **Flux** — Open-source image model via Fal.ai
- Results display inline with download buttons
- Burns $0.04 in $CLAWD per generation (in burn mode)

### Video Generation (VIDEO tab)

- **Seedance 2.0** — text-to-video and image-to-video
- Fast mode for quick previews
- Burns $0.20 in $CLAWD per generation

### Music Generation (MUSIC tab)

- **MiniMax Music 2.6** — AI music composition
- Describe the track you want and generate it
- Built-in audio player for playback
- Burns $0.10 in $CLAWD per generation

The **Clawd Music Player** (accessible from the top bar) lets you play generated tracks while using the terminal.

---

## Prediction Markets (PREDICT tab)

Integrated with Jupiter's prediction market platform:

- **Browse events** — crypto, politics, sports, tech, economics, culture
- **Filter and search** — trending, newest, volume-weighted
- **View markets** — see odds, volume, and resolution dates
- **Track positions** — view your open predictions
- **Leaderboard** — weekly PnL rankings
- **Trading status** — live connection to Jupiter prediction API

---

## Getting Started

### For New Users

1. **Get $CLAWD:** Buy on [pump.fun](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump), [Jupiter](https://jup.ag), or [Raydium](https://raydium.io)
2. **Connect wallet:** Visit the terminal and connect your Phantom wallet
3. **Explore the terminal:** Chat with AI, check trending tokens, browse the DEX
4. **Try burn mode:** Toggle the fire button and send a premium AI message
5. **Install the extension:** Get the [Chrome extension](https://chromewebstore.google.com/detail/solana-clawd-pagent/ccalceefjldibjloiknckgbkajmjfokd) for autonomous browsing
6. **Analyze a token:** Paste a mint address in the BROWSE tab and watch the agent work

### For Developers

1. Clone the repo: `git clone https://github.com/x402agent/solana-clawd`
2. Install: `pnpm install`
3. Copy env: `cp .env.example .env` and fill in your API keys
4. Run dev: `pnpm dev`
5. The terminal runs on `localhost:5000` (or your configured port)

### For Extension Users

1. Install from the Chrome Web Store or load unpacked from `chrome-extension/`
2. Pin the extension and click the claw icon
3. Configure your OpenRouter API key in settings
4. The pAGENT connects automatically when the terminal's BROWSE tab is open

---

## Token Information

| Property | Value |
|----------|-------|
| **Name** | $CLAWD |
| **Chain** | Solana |
| **Mint** | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |
| **Decimals** | 6 |
| **Launch** | pump.fun |
| **Mechanism** | Deflationary (burn on AI usage) |

### Where to Buy

- [pump.fun](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
- [Jupiter](https://jup.ag)
- [Raydium](https://raydium.io)
- [Birdeye](https://birdeye.so/token/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump?chain=solana)
- [DexScreener](https://dexscreener.com/solana/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)

---

## Links

- **Website:** [solanaclawd.com](https://solanaclawd.com)
- **GitHub:** [github.com/x402agent/solana-clawd](https://github.com/x402agent/solana-clawd)
- **X/Twitter:** [@solanaclawd](https://x.com/solanaclawd)
- **SolanaOS Hub:** [seeker.solanaos.net](https://seeker.solanaos.net)

---

*$CLAWD is an open-source project. MIT licensed. No investment advice. DYOR.*
