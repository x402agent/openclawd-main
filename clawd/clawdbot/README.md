# 🦞 mawd

> Lobster-powered CLI with stunning Unicode braille animation startup

A beautiful terminal experience with animated braille art, multi-phase boot sequences, and an interactive REPL — all lobster-themed.

## Install

```bash
npm install -g mawd
```

## Usage

```bash
mawd
```

That's it. Type `mawd` and watch the lobster materialize.

## What happens when you run `mawd`

1. **🌊 Particle Convergence** — Scattered braille dots converge into a lobster shape across 6 animation frames
2. **〰️ Water Wave** — Animated wave separator ripples across the screen
3. **🔤 Logo Typewriter** — The MAWD block-letter logo reveals line-by-line with a red→coral→amber→gold gradient
4. **🦞 Claw Snap** — The lobster's claws animate in an idle snapping loop
5. **⚡ Boot Sequence** — 6 unique Unicode spinners cycle through boot messages using `unicode-animations`
6. **✅ Ready Prompt** — Drops you into an interactive REPL with the `🦞 mawd ❯` prompt

## REPL Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all available commands |
| `/predict <token>` | Get a price prediction |
| `/status` | System & network status |
| `/markets` | Browse prediction markets |
| `/portfolio` | View your positions |
| `/quit` | Exit mawd |

## Preview

```
 🦞 MAWD  Lobster-Powered Prediction Engine               v1.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                ⠀⠀⠀⠈⠉⠉⠉⠉⠑⠒⠒⠀⠀⠀⠀⠒⠒⠑⠉⠉⠉⠉⠁⠀⠀⠀
                ⠀⠀⠀⠀⠀⣤⣤⡀⠀⠀⠀⠑⢆⡰⠊⠀⠀⠀⢀⣤⣤⠀⠀⠀⠀⠀
                ⠀⠀⠀⠀⠘⠿⠿⠃⣠⣤⣤⣤⣼⣧⣤⣤⣤⣄⠘⠿⠿⠃⠀⠀⠀⠀
                ⠀⠀⠀⠀⠀⠀⠀⠘⠛⠛⠛⣁⣼⣧⣁⠛⠛⠛⠃⠀⠀⠀⠀⠀⠀⠀
                ⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⣿⣿⣿⣿⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀
                ⠀⠀⠀⠀⠀⠀⠀⠀⢀⣾⠋⠙⠻⠟⠋⠙⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀
                ⠀⠀⠀⠀⠀⠀⠀⠐⠉⠀⠀⠀⠀⠀⠀⠀⠀⠉⠂⠀⠀⠀⠀⠀⠀⠀

                 ~≈~~~~≈~~≈~~~~≈~~≈~~~~≈~
            ███╗███╗ █████╗ ██╗    ██╗██████╗
           ████╗████║██╔══██╗██║    ██║██╔══██╗
          ██╔████╔██║███████║██║ █╗ ██║██║  ██║
          ██║╚██╔╝██║██╔══██║██║███╗██║██║  ██║
          ██║ ╚═╝ ██║██║  ██║╚███╔███╔╝██████╔╝
          ╚═╝     ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝

           🦞 lobster-powered prediction engine

  ✔ Initializing lobster core
  ✔ Connecting to Solana mainnet
  ✔ Calibrating claw algorithms
  ✔ Warming up the lobster pot

🦞 mawd ❯
```

## Spinners

Uses [unicode-animations](https://www.npmjs.com/package/unicode-animations) for the boot sequence:
- `braille` — Classic braille spinner
- `scan` — Grid scan animation
- `helix` — DNA helix pattern
- `cascade` — Cascading dots
- `dna` — DNA strand
- `orbit` — Orbital motion

## Requirements

- Node.js ≥ 18
- A terminal that supports Unicode & ANSI colors (most modern terminals)

## License

MIT
