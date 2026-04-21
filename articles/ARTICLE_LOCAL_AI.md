# Your AI, Your Machine, Your Tokens

### How Solana Clawd became the first Solana token where holders can route their own GPU through the same wallet that gates the app.

---

## The one-sentence pitch

If you hold $CLAWD, you can now point the Vibe Coding Studio at an AI model running on **your own laptop** — for free, offline, with none of your code ever leaving your machine — and the wallet that proves you hold the token is the same wallet that proves you're allowed in.

That's new. Not new for AI. Not new for Solana. New for the intersection.

---

## A brief history, told honestly

For most of Solana's history, tokens have meant one thing: something you trade. You buy, you sell, you watch a chart, you move on. The token itself doesn't *do* anything. It doesn't route you anywhere. It doesn't unlock anything real. A meme coin is a lottery ticket. A governance token is a forum pass with extra steps.

$CLAWD started in the same soil — a Solana SPL token, launched on pump.fun, with a chart like any other. But the project quietly built something underneath it: a whole AI terminal where holding the token unlocks agentic models, image generation, music generation, on-chain agent minting, and a research browser that can take over your tabs.

That alone was already unusual. Most token-gated products are a Discord and a spreadsheet. Clawd built a working product behind the gate.

But there was still a pipe going out the side: every AI call eventually hit someone else's datacenter. OpenAI's. Anthropic's. Z.AI's. OpenRouter's. Your code, your prompts, your screenshots — they all traveled over the wire to servers you don't own.

This update closes that pipe.

---

## What changed, in plain English

You can now run **local AI models** — models that live on your own computer and never phone home — through the exact same chat interface, gated by the exact same $CLAWD wallet check.

The plumbing works like this:

```
  Your browser
      │
      ▼
  Vibe Studio (on solanaclawd.com)
      │   "I am this wallet. I hold $CLAWD."
      ▼
  Site server (verifies your bag on-chain)
      │
      ▼
  ClawdRouter (proxy running on your laptop)
      │
      ▼
  Ollama  or  llama.cpp  (the model, running on your GPU)
```

The prompt you type in the browser goes all the way to the model on your laptop — and the reply streams back the same way. Your laptop's fan is the thing that spins up. Your Mac's M-series chip, or your RTX 4090, or your Ryzen with no GPU at all, is what does the math. OpenAI's bill does not go up. Anthropic does not see your code. Nothing leaves your house except the request that proves you hold $CLAWD.

And when you're not online, or when the site is down, you can still hit the router and model directly — because the only thing that ever needed the internet was the holder check.

---

## What is Ollama? What is llama.cpp?

Most people have never heard of these. Here's the honest summary.

**llama.cpp** is a small open-source project from a guy named Georgi Gerganov that figured out how to run LLMs *extremely efficiently* on normal hardware — no datacenter, no eight H100s, just your laptop. It's the C++ engine that basically all local AI builds on top of.

**Ollama** is a wrapper around llama.cpp that makes it stupid easy. You run one command and it acts like Docker, but for language models:

```
ollama pull llama3.1:8b      # download Meta's Llama 3.1, 8 billion parameters
ollama run llama3.1:8b        # chat with it
```

Both speak the **exact same API shape as OpenAI** — the same `/v1/chat/completions` endpoint, the same streaming format. That means anything built for ChatGPT works against them with a URL change.

This is the detail that makes the whole integration possible in ~400 lines of code.

---

## What is ClawdRouter, and why does the router matter?

ClawdRouter is a small proxy server. Think of it as a smart middleman that sits between "apps that want AI" and "places where AI lives." It already knew how to route to OpenRouter (which fans out to Anthropic, xAI, Google, DeepSeek, NVIDIA-hosted models, etc.). This update taught it a new trick:

> If the model name starts with `ollama/`, `local/`, or `llamacpp/` — don't go to the cloud. Go to the box sitting in front of the user.

It also learned how to **discover** what you have locally. Hit `GET /v1/local/models` and ClawdRouter asks your Ollama instance what's pulled, and hands back a list with model names, sizes, quantization levels — everything the UI needs to build a dropdown automatically.

Crucially, because you're paying for the compute yourself (your laptop is doing the work), local models skip the $CLAWD tier gate *inside* ClawdRouter. The holder gate still exists at the site level — you have to hold $CLAWD to get into Vibe Studio at all — but once you're in, you're not paying per-token fees against your bag. Your GPU is free. Your electricity isn't, but that's between you and your power company.

---

## Why this matters for Solana specifically

Here's the history-of-Solana framing, stripped of marketing:

**Solana is the chain where the block happens before you finish your sentence.** Its whole value proposition is that interaction should feel instant. Everything else — NFTs, DePIN, DeFi, memes — is a consequence of that one technical choice.

Meme coins ran with that speed. So did trading apps. So did Phantom. What didn't run with it, historically, was anything involving real compute — because real compute is slow, expensive, centralized, and lives on someone else's cloud.

This is the first time (to our knowledge) a Solana SPL token plugs cleanly into a **user's own compute** and treats the wallet as the gate. Not "the project runs GPT-4 behind a token gate." Everyone has done that. *This* is "the project routes your prompt to the model running on your laptop, and the only thing the token does is verify you're a holder."

Two things that have never shared a sentence — "your Solana bag" and "your laptop's GPU" — are now in the same sentence. That's the headline.

---

## Setup for normies (five commands, ten minutes)

You need three things: Ollama, a pulled model, and the router running.

**1. Install Ollama** (macOS or Linux)

```
curl -fsSL https://ollama.com/install.sh | sh
```

Windows users: grab the installer at [ollama.com/download](https://ollama.com/download).

**2. Pull a model**

A good starter — about 5GB, runs on anything with 16GB RAM:

```
ollama pull llama3.1:8b
```

Or if you only have an older laptop, go smaller:

```
ollama pull llama3.2:3b
```

Or if you want the best local code model in 2026:

```
ollama pull qwen2.5-coder:7b
```

**3. Start Ollama** (it usually auto-starts on macOS, but just in case)

```
ollama serve
```

It listens on `http://127.0.0.1:11434`.

**4. Start ClawdRouter locally**

From the repo root:

```
cd clawdrouter
pnpm install
pnpm dev
```

Router comes up on `http://127.0.0.1:8402` and prints a banner with your Solana wallet address.

**5. Point the site at your local router**

In your `.env` at the repo root:

```
CLAWDROUTER_URL=http://127.0.0.1:8402
```

Restart the dev server (`pnpm dev` at the repo root). Open `/vibe`, connect Phantom, make sure you hold $CLAWD, and click the **Local** tab in the provider switcher.

The model dropdown will populate automatically with whatever you've pulled. Type a prompt. Hit send. Your GPU fans will get louder. The reply streams back exactly like OpenAI, except nothing left your machine.

---

## What model should a normie pick?

Honest recommendations, by hardware class:

| Your machine | Model to pull | Why |
|---|---|---|
| 16GB RAM MacBook Air | `llama3.2:3b` | Fast, solid for general chat |
| 32GB+ Mac or mid gaming PC | `llama3.1:8b` | The default — versatile, strong |
| Anything for code | `qwen2.5-coder:7b` | Best open code model in its size class |
| You have a 4090 or better | `deepseek-r1:14b` | Actual reasoning, comparable to GPT-4 on many tasks |
| Curious about small but capable | `phi-3.5:3.8b` | Microsoft's small-but-smart model |

Switching is a one-liner: `ollama pull <name>`. Then hit the refresh button in the Vibe Studio's Local tab.

---

## What does it actually feel like?

The UI is identical to using Z.AI or OpenAI in Vibe. Same streaming, same code blocks, same chat history, same Markdown rendering. The only visual tell that you're on local is a small cyan "local" chip in the status bar and a "Local via ClawdRouter" strip under the header showing model counts.

First-token latency is usually **faster than the cloud models** once the model is warm — because it's not going through four network hops. Throughput depends on your hardware: a Mac M3 Pro will generate roughly 40-60 tokens per second on an 8B model, comparable to what you feel on chatgpt.com.

---

## Why hold $CLAWD for a local-first product?

Fair question. If the model's free and on your laptop, why is the token still gating the door?

Three reasons, in order of honesty:

1. **The product isn't just the inference.** Vibe Studio's system prompt is tuned for this stack (Solana, Metaplex, Jupiter, Privy, Helius, tRPC, Convex). Its presets, its code-first response format, its on-chain agent integration — that's the value. Local AI plugs *into* that; it doesn't replace it.

2. **The router does real work.** ClawdRouter handles smart model selection, $CLAWD holder verification, rate limiting, usage tracking, and the x402 fallback for non-holders. That infrastructure exists whether you route to Llama on your laptop or GPT-5.4 in the cloud.

3. **The token is the identity.** Solana is where the authentication happens. Your wallet is your login, your payment rail, and your social proof all in one. Removing that is removing the only thing making this a Solana project instead of "just another local AI wrapper."

---

## Troubleshooting (the top three things that will go wrong)

**"No local models found."**
Ollama isn't running. On macOS, open the Ollama app once. On Linux, `systemctl start ollama` or just `ollama serve` in a terminal.

**"502 from ClawdRouter."**
Your `CLAWDROUTER_URL` is still pointing at `https://clawdrouter.fly.dev` (the hosted default). That router can't reach your localhost. Set it to `http://127.0.0.1:8402` and restart the site dev server.

**"Holder-only" error.**
The wallet you connected doesn't have $CLAWD. Acquire some at `/swap` (Jupiter under the hood), or connect a different wallet.

---

## Under the hood, for the curious

The flow, end to end, in eight steps:

1. You type in the browser. Vibe Studio POSTs to `/api/local/chat/stream` with model `ollama/llama3.1:8b`.
2. The site server pulls your wallet out of the request, hits Helius to verify your $CLAWD balance is above zero.
3. If you hold, it forwards the request to `${CLAWDROUTER_URL}/v1/chat/completions` with an `X-Clawd-Wallet` header.
4. ClawdRouter sees the `ollama/` prefix, skips its classifier and OpenRouter path entirely, and resolves the routing to `http://127.0.0.1:11434/v1/chat/completions`.
5. Ollama loads the model (if not already warm) and starts generating.
6. Tokens stream back as Server-Sent Events: ClawdRouter → site server → your browser.
7. The Vibe Studio's SSE parser (the same one that handles Z.AI GLM) splits the stream into token deltas and renders them live into a Markdown code-highlighted bubble.
8. Nothing gets logged to a third party. Your session history is in your browser's `localStorage`. Usage tracking on the site is anonymized token counts tied to your wallet — that's it.

---

## The quiet part

The reason this took a minute to build, despite being ~400 lines of code, is that every piece of infrastructure it depends on was already there. The holder gate was there. The router was there. The OpenAI-compatible API shape was there. The Vibe Studio was there. All we did was wire a new upstream into a proxy that was already routing requests.

That's usually a sign something is working. Good primitives compound.

And it's also the reason "first Solana token that routes to your own GPU" is an honest headline, not a marketing one — because every other Solana project that could have built this first, could have built it with the same ease. They just didn't. Clawd did. First.

---

## What's next

The same local-first pattern wants to extend to the rest of the stack:

- **Voice** — local Whisper for transcription, so your voice notes don't hit OpenAI's servers.
- **Images** — Stable Diffusion or Flux.1 running on your GPU for the Vibe image-gen tool.
- **Embeddings** — local `nomic-embed-text` for the research browser, so your research context stays on your machine.
- **Browser use** — the autonomous agent uses local models when you're on a trusted network, cloud models when you're not.

All of it gated by the same wallet. All of it running on compute you already paid for.

---

## Try it

```
1. ollama pull llama3.1:8b
2. pnpm --filter clawdrouter dev
3. Open /vibe
4. Click "Local"
```

That's the whole thing.

Hold the token. Run the model. Own the loop.
