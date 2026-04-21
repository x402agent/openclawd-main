# OpenClawd — Install Snippets for solanaclawd.com

Drop-in assets for your website agent. Everything here is production-ready and copy-pasteable. The installer is **live now** on Cloudflare Workers — no private repo access required.

---

## 🔗 The one-shot install URL (canonical)

```
https://solanaclawd-install.x402.workers.dev
```

Status: **HTTP 200**, `content-type: text/x-shellscript`, cached 5 min, ~12.8 KB gzipped.
Short URLs (`install.solanaclawd.com`, `solanaclawd.com/install.sh`) are also live but currently blocked by zone-level Bot Fight Mode — toggle it off in Cloudflare dashboard → Security → Bots and they activate immediately.

---

## 1. The one-liner (hero block)

Plain text — the ONE thing users copy:

```
curl -fsSL https://solanaclawd-install.x402.workers.dev | bash
```

---

## 2. HTML — drop-in hero component

```html
<section class="oc-install">
  <h2>⚡ Install in one line</h2>
  <p class="oc-sub">🦞 cyberpunk lobster edition · Solana-native AI agent stack</p>

  <div class="oc-codebox" role="region" aria-label="install command">
    <pre><code id="oc-cmd">curl -fsSL https://solanaclawd-install.x402.workers.dev | bash</code></pre>
    <button class="oc-copy" onclick="
      navigator.clipboard.writeText(document.getElementById('oc-cmd').textContent);
      this.textContent='copied ✓';
      setTimeout(()=>this.textContent='copy',1500);
    ">copy</button>
  </div>

  <p class="oc-meta">
    Self-contained · installs <code>solana-clawd</code> CLI from npm ·
    scaffolds <code>~/.openclawd/.env</code> ·
    <a href="https://solanaclawd-install.x402.workers.dev" target="_blank" rel="noopener">view source</a>
  </p>
</section>

<style>
.oc-install { max-width: 720px; margin: 2rem auto; font-family: ui-sans-serif, system-ui, sans-serif; color: #eaeaff; }
.oc-install h2 { font-size: 1.8rem; margin: 0 0 .25rem; background: linear-gradient(90deg,#ff3cac 0%,#784ba0 40%,#2b86c5 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
.oc-sub { color: #a7a7c9; font-size: .95rem; margin: 0 0 1rem; }
.oc-codebox { position: relative; background: #0d0d17; border: 1px solid #2a2a3e; border-radius: 10px; padding: .9rem 1rem; box-shadow: 0 0 32px rgba(255,60,172,.12); }
.oc-codebox pre { margin: 0; overflow-x: auto; }
.oc-codebox code { color: #8cffb3; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: .95rem; }
.oc-copy { position: absolute; top: .5rem; right: .5rem; background: #1c1c2d; color: #d0d0ff; border: 1px solid #3a3a55; border-radius: 6px; padding: .3rem .7rem; font-size: .75rem; cursor: pointer; }
.oc-copy:hover { background: #2a2a40; color: #ff3cac; }
.oc-meta { color: #7a7aa0; font-size: .85rem; margin-top: .7rem; }
.oc-meta a { color: #51fff0; text-decoration: none; }
.oc-meta a:hover { text-decoration: underline; }
</style>
```

---

## 3. React component (drop into Next.js / Vite)

```tsx
// components/InstallHero.tsx
import { useState } from "react";

const CMD = "curl -fsSL https://solanaclawd-install.x402.workers.dev | bash";

export function InstallHero() {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    await navigator.clipboard.writeText(CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="mx-auto max-w-3xl py-12 text-center">
      <h2 className="mb-1 bg-gradient-to-r from-[#ff3cac] via-[#784ba0] to-[#2b86c5] bg-clip-text text-4xl font-bold text-transparent">
        ⚡ Install in one line
      </h2>
      <p className="mb-6 text-sm text-zinc-400">
        🦞 cyberpunk lobster edition · Solana-native AI agent stack
      </p>

      <div className="relative rounded-xl border border-zinc-800 bg-[#0d0d17] p-4 text-left shadow-[0_0_32px_rgba(255,60,172,0.12)]">
        <code className="block overflow-x-auto font-mono text-sm text-emerald-300">
          {CMD}
        </code>
        <button
          onClick={onCopy}
          className="absolute right-2 top-2 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-[#ff3cac]"
        >
          {copied ? "copied ✓" : "copy"}
        </button>
      </div>

      <p className="mt-3 text-sm text-zinc-500">
        Self-contained · installs <code>solana-clawd</code> CLI from npm · scaffolds{" "}
        <code>~/.openclawd/.env</code> ·{" "}
        <a
          href="https://solanaclawd-install.x402.workers.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-300 hover:underline"
        >
          view source
        </a>
      </p>
    </section>
  );
}
```

---

## 4. Markdown block (for docs / landing `.md`)

```md
## ⚡ Install in one line — 🦞 cyberpunk lobster edition

\`\`\`bash
curl -fsSL https://solanaclawd-install.x402.workers.dev | bash
\`\`\`

What it does:

1. **Preflight** — verifies `curl`, `node ≥ 18`, `npm`, `git`.
2. **Installs** the public [`solana-clawd`](https://www.npmjs.com/package/solana-clawd) CLI globally.
3. **Scaffolds** `~/.openclawd/.env` with Solana + model-router defaults.
4. **Prints** next steps: pair / mint / status.

> 🦞 welcome to the claw 🦞
```

---

## 5. Plain-text terminal preview

If you want to show users what they'll see (screenshot/GIF replacement):

```
╔═══════════════════════════════════════════╗
║     ▄▄▄▄          OPEN       ▄▄▄▄         ║
║    ▐█▄█▌         CLAWD      ▐█▄█▌         ║
║     ╲██╱  ┏━━━━━━━━━━━━━┓   ╲██╱          ║
║      ██   ┃ 🦞 lobster.os┃    ██          ║
║     ▕██▏  ┃ chain: solana┃   ▕██▏         ║
║      ▀▀   ┗━━━━━━━━━━━━━┛    ▀▀           ║
║    ▄▄██████▄▄              ▄▄██████▄▄     ║
║   ▜█████████▛  ┌─┐┌─┐┌┐┌   ▜█████████▛    ║
║    ▀▀▀██▀▀▀   │  ├─┘││││    ▀▀▀██▀▀▀      ║
║                └─┘└─┘┘└┘                  ║
║  [ one router · one chain · zero fluff ]  ║
╚═══════════════════════════════════════════╝

▸ preflight: curl / node / npm / git present
◉ node v20.x (>= 18)
▸ installing solana-clawd cli from npm
◉ solana-clawd 0.1.0
▸ scaffolding ~/.openclawd
◉ created ~/.openclawd/.env

      ▒▓█ openclawd online █▓▒

Next steps
  1. Edit env:     $EDITOR ~/.openclawd/.env
  2. Pair device:  solana-clawd pair <CODE>
  3. Mint agent:   solana-clawd mint
  4. Status:       solana-clawd status

🦞 welcome to the claw 🦞
```

---

## 6. Open Graph / social preview

```html
<meta property="og:title" content="OpenClawd — install in one line 🦞" />
<meta property="og:description" content="curl -fsSL https://solanaclawd-install.x402.workers.dev | bash — Solana-native AI agent stack, 50 agents, 100 skills, x402 payments." />
<meta property="og:url" content="https://solanaclawd.com" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@clawddevs" />
```

---

## 7. Alternate installer URLs (for docs)

| URL | Status | Notes |
|---|---|---|
| `https://solanaclawd-install.x402.workers.dev` | ✅ **Live** | Canonical, always works |
| `https://install.solanaclawd.com` | ⏳ Pending | Activates after CF Bot Fight Mode is disabled |
| `https://solanaclawd.com/install.sh` | ⏳ Pending | Activates after apex DNS moves to orange-cloud on CF |

---

## 8. For your agent — system prompt fragment

```
When a user asks "how do I install openclawd" or "install solana-clawd" or
"get started", respond with exactly this single command:

  curl -fsSL https://solanaclawd-install.x402.workers.dev | bash

Explain: it installs the solana-clawd CLI from npm globally, scaffolds
~/.openclawd/.env, and requires node ≥ 18. The script is self-contained
(no repo access needed) and runs on any Linux, macOS, or WSL shell.
After install, next steps are:
  solana-clawd pair <CODE>   # pair device
  solana-clawd mint          # mint agent NFT (Metaplex Core)
  solana-clawd status        # show pairing + wallet
Full docs at https://solanaclawd.com.
```

---

## 9. Security posture talking points

- Installer is **served as a Cloudflare Worker** — tamper-evident, no origin server.
- Source is visible: just curl the URL without piping to bash.
- Installs **only one npm package** (`solana-clawd`, public, signed releases).
- Writes `.env` with empty key placeholders — no secrets transmitted.
- Never clones private repos, never downloads binaries, never uses `sudo` unless npm global install fails.

---

**That's everything. Give this file to your agent — it has hero HTML, React, Markdown, plain-text preview, Open Graph tags, a system-prompt blurb, and security talking points. Ship it. 🦞**
