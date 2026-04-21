# Your AI, Your Machine, Every Device You Own

### How Solana Clawd just turned one wallet into a reverse tunnel that lets your phone talk to your home GPU — with no VPN, no open ports, and no account anywhere except Phantom.

---

## The one-sentence pitch

If you hold $CLAWD, the model running on your laptop will answer requests from your phone, another laptop, a teammate in another city, or an agent in a sandbox — securely routed through a hosted proxy that never sees your prompts, gated by the exact same wallet that lets you into the app.

That's the update. You already owned the compute. Now the wallet that proves you own it also tells it *where to listen from*.

---

## The story so far

A few weeks ago, [we shipped local AI](./ARTICLE_LOCAL_AI.md) — the ability to point the Vibe Coding Studio at an LLM running on your own machine, verified by the same $CLAWD check that gates the rest of the app. Your M2 does the math. Your fans spin up. OpenAI's bill does not go up.

It worked. For one machine.

But AI isn't just a thing you use sitting in front of one computer. It's something you want at your desk, on your phone waiting in line for coffee, in a sandbox where your agent is running a trade, on the laptop you pulled out of your bag at the conference. Up to this point, "local AI" meant "AI that only works when you are specifically in front of the one machine it lives on." That's half a solution.

Every fix we looked at had a tax:

- **Open a port on your router** — you shouldn't have to know what port forwarding is to use your own GPU, and the first time you get scanned by a bot you'll regret it.
- **Run a VPN like Tailscale** — great tool, but it's a second product to install, a second account to manage, and it expects you to understand tailnets before you can see your own models from your phone.
- **Rent a tunnel from someone** — ngrok, Cloudflare Tunnel, cloudflared — each one is "just sign up here" until you try to give it to a teammate and realize they have to sign up too.

We wanted something with the shape of *"click a button in the dashboard, paste a command on your other machine, done."* Wallet in, tunnel out. No extra accounts. No extra products. Just the $CLAWD you already hold, doing more work.

---

## What changed, in plain English

Open [solanaclawd.com/keys](https://solanaclawd.com/keys). Sign in with Phantom. You'll see a new cyan button: **+ New device.**

Click it, optionally label the device ("home-mac", "studio-gpu"), and sign a challenge. The dashboard hands you a line like this:

```
clawdrouter enroll https://clawdrouter.x402.workers.dev/v1/enroll/xyz123
```

Copy it. Paste it on the machine that has Ollama. Press enter. Your config gets written. Run `clawdrouter`. A tunnel opens, quietly, to the ClawdRouter on Fly.io.

From that moment on, any device with your API key — your phone, your other laptop, the sandbox where your agent lives — can ask the hosted router for your local models, and the hosted router will reach over the tunnel to your laptop and fetch them. The prompt travels from your caller → Fly.io → the open WebSocket → your laptop → Ollama → back the same way.

Fly.io never touches OpenAI. Anthropic never sees the prompt. Your laptop never exposes itself to the public internet. The only thing that had to be true for this to work was: you hold $CLAWD.

---

## Why is this hard? A short digression

A home computer behind a router is, on purpose, unreachable from the internet. Your ISP gives you one IP address that your whole house shares. Your router runs NAT — it translates "someone on the internet wants to talk to 192.168.1.47" into "nope." That's the default, and it's the right default. A machine no one can reach is a machine that can't be attacked.

But you still want it *reachable by you*. Specifically: reachable by requests that already passed a lock (your $CLAWD wallet) *somewhere else* (the hosted app).

There are three ways to do this and we picked the boring one.

**(1) Poke a hole in the router.** Port forward 11434. Now your Ollama is on the internet. Everyone can hit it. Everyone. Next.

**(2) Build a mesh.** Tailscale, WireGuard, ZeroTier. These are excellent. They are also full products — tens of thousands of lines of code, their own ACL systems, their own mental model. Building the tunnel feature on top of a mesh means asking every user to learn the mesh first. Scale that to a commercial product and you've just added a dependency on another company's signup flow.

**(3) The reverse WebSocket tunnel.** The customer's machine dials *out* — the one thing NAT is actively designed to permit, because that's how browsers work. It holds the connection open forever. When the hosted router has a request for that customer's tenant, it sends it down the existing connection. The spoke answers, and the reply goes back up the same pipe. Your firewall sees one outbound TCP/443 connection, same as if you had Slack open.

Same privacy shape as Tailscale Funnel, 1/10th the code, no dependency on a product the user doesn't already use.

---

## The three pieces

There are three machines involved. Each one owns exactly one job.

**Cloudflare Worker — the bouncer.** Lives at `clawdrouter.x402.workers.dev`. Knows nothing about AI. Knows everything about who's allowed. When you sign a challenge with Phantom, this is what validates it. When you mint a key, this is where the hash lives. When the hub needs to verify a bearer token, it asks here. Runs at the edge, caches nothing interesting, boring on purpose.

**Fly.io Hub — the switchboard.** Lives at `clawdrouter.fly.dev`. This is the thing the internet talks to. It receives inbound HTTP, it receives outbound WebSockets from spokes. When a request comes in, it asks Cloudflare "is this bearer valid?", gets back a tenant ID, looks up which WebSocket belongs to that tenant, and forwards the request down the tube. It's a JavaScript process that's basically a very simple post office — no persistent state, no database, a 5-minute in-memory cache of verified keys. If it dies, it comes back up in 30 seconds and every spoke reconnects. The whole file is 250 lines.

**Your laptop — the spoke.** This is the `clawdrouter` binary. It reads `~/.clawd/clawdrouter/device.json`, dials the hub, holds the WebSocket open with a 30-second heartbeat, and reacts to whatever "please do this HTTP request" frames come down. The only HTTP it makes is to `http://127.0.0.1:11434` — your own Ollama. If your wifi drops, it reconnects with exponential backoff. If you close the lid, the tunnel pauses, and the hub returns "offline" to anyone asking until you open it again.

The magic of the whole system is that none of these three pieces has to trust any of the others to do more than their job. The worker only vouches for identities. The hub only shuttles bytes. The spoke only handles its own local traffic.

---

## What it actually looks like in use

On your phone, in the browser, on a free unsecured wifi in an airport:

```bash
curl https://clawdrouter.fly.dev/v1/local/models \
  -H "Authorization: Bearer ck_live_your_key_here"
```

You get JSON back. A list of every model your laptop at home has pulled. `gemma4:latest`, `llama3.1:8b`, `deepseek-r1:14b`, whatever. The phone never touched those files. The phone doesn't know what your laptop is. The laptop doesn't know what the phone is. Neither of them knows who you are.

What they both know is: *this request carries a key that Cloudflare said is valid, and Cloudflare said its tenant is the one attached to this particular WebSocket.*

Now ask a real question:

```bash
curl https://clawdrouter.fly.dev/v1/local/chat/completions \
  -H "Authorization: Bearer ck_live_your_key_here" \
  -H "content-type: application/json" \
  -d '{"model":"gemma4:latest","messages":[{"role":"user","content":"what is a unix pipe"}]}'
```

Your laptop's fan spins up. Your M2 chip warms. A reply streams back to the airport. The data center in Virginia that your phone happened to hit did not generate a single token. OpenAI's billing counter did not tick. Anthropic did not see the prompt. Your ISP saw an outbound WebSocket connection from your laptop — which, if they looked, would be indistinguishable from you having Spotify open.

That's what "AI you own" actually means when it's done right.

---

## The wallet is still the key

Nothing in the enrollment flow works without your wallet. You cannot mint a key, cannot generate an enrollment URL, cannot revoke a device, cannot list your devices — without Phantom signing a challenge. The hash of your signature is what proves you hold $CLAWD. The same check that lets you into the app is what lets you into the tunnel.

Which means:

- Sell your $CLAWD, your gate closes. Your tunnel closes with it, on the next 5-minute cache expiry.
- Rotate your wallet, everything follows — your keys are tied to the new wallet address the moment you sign a new challenge.
- Revoke a key on the dashboard. The device using that key loses its tunnel within 5 minutes. The other devices keep working.
- Give someone your enrollment URL. They have 15 minutes and one shot. If they don't use it, or they use it and you revoke the key, they have nothing.

There is no "reset password" button. There is no email. There is no "forgot your key" flow. If you lose your Phantom seed, you lose your keys, your gate, and your tunnels. This is fine. It's the same deal as everything else in Solana: the wallet is the authority, and if you can't sign, you are not you.

---

## What you can do with this now

- Leave your gaming PC running in the spare room with Ollama pulled. Work from the couch, the kitchen, the car, the conference. Your laptop doesn't need the model anymore. Your laptop just needs the wallet.
- Give an agent running in an E2B sandbox a key scoped to your wallet. It can query your home GPU without ever phoning OpenAI.
- Hand a teammate their own enrollment URL from their own $CLAWD wallet, pointed at a machine in their own apartment, and watch them get the same workflow you have.
- Build a coding tool that runs on a phone but calls a real model. The phone is not trying to load a 7B model into 4GB of RAM. The phone is talking to the 70B model on your workstation.
- Keep all of this working when the hosted app is down. The ClawdRouter on Fly.io could fall over and — for users that have both a hosted hub *and* a local one — the tunnel path fails, but hitting the local clawdrouter directly still works. It's a fallback, not a single point of failure.

---

## What's next

This is v1. It works. It's in production. It has 64 passing tests. You can use it today.

It is also genuinely limited in a couple of specific ways, and we'd rather tell you now than have you find out later:

**Streaming.** When you ask a model a question, good LLM chat interfaces show you tokens as they're generated. The current tunnel buffers the full response on the spoke and sends it as a single frame. For a 50-token reply that's fine. For a 4,000-token code generation, it feels like talking to a modem. We have the frame types in the protocol (`res.start`, `res.chunk`, `res.end`) — the spoke and hub just need to wire them up. That's the next PR.

**Scale.** Each fly.io machine caps at about 500 concurrent tunnels. Beyond that you need "sticky routing" — requests for tenant X always land on the machine where tenant X's WebSocket lives. That's a v2 concern, not a today concern, and the code is structured to slot it in when the time comes.

**Queueing.** If your spoke is offline when a request comes in, the hub returns "503 tunnel offline" immediately. We don't queue requests waiting for your laptop to come back from sleep. Most agents don't want stale requests replayed five minutes later — and the ones that do can retry themselves. We chose the sharper, simpler behavior.

Everything else — request forwarding, heartbeats, authentication, revocation, enrollment, device labeling, reconnection, graceful shutdown — works today.

---

## How to try it

Two commands. Literally.

On the machine running Ollama:

```
# once, to install:
git clone https://github.com/x402agent/solana-clawd.git
cd solana-clawd/clawdrouter && npm install && npm run build
sudo ln -s "$PWD/dist/index.js" /usr/local/bin/clawdrouter
```

Then, in the browser, go to [solanaclawd.com/keys](https://solanaclawd.com/keys), sign in, click **+ New device**, copy the command, paste it into a terminal on your Ollama machine, and run:

```
clawdrouter enroll <that-url>
clawdrouter
```

Second shell, anywhere:

```
curl https://clawdrouter.fly.dev/v1/local/models \
  -H "Authorization: Bearer ck_live_your_key"
```

If you see models, you're done.

---

## The bigger picture

We said it in the last article and it's still true: the real shift is what a token *is* allowed to mean.

When you hold $CLAWD, you are not just holding a bet on a chart. You are holding a key. In the first version of this story, the key unlocked a door to an app. In the second, the key unlocked the local-AI path — so you could bring your own compute and still be verifiably *you*. In this version, the key becomes a *routing authority*: it tells the hosted router where your compute lives, and the hosted router, not knowing anything about you, nonetheless knows enough to send the right request to the right WebSocket.

Every other flavor of this feature requires you to sign up for something else — a VPN provider, a tunnel service, an identity broker. With $CLAWD, the wallet you already have and the token you already hold is all the authority the system needs.

Most tokens end at the chart. This one opens a tunnel.

---

## Links

- Technical walkthrough: [`docs/CLAWD_ROUTER_TUNNEL.md`](./docs/CLAWD_ROUTER_TUNNEL.md)
- Dashboard (start here): [solanaclawd.com/keys](https://solanaclawd.com/keys)
- Hub health + stats: [clawdrouter.fly.dev/v1/tunnel/stats](https://clawdrouter.fly.dev/v1/tunnel/stats)
- Previous article: [`ARTICLE_LOCAL_AI.md`](./ARTICLE_LOCAL_AI.md)
- Source: [github.com/x402agent/solana-clawd/tree/main/clawdrouter](https://github.com/x402agent/solana-clawd/tree/main/clawdrouter)
