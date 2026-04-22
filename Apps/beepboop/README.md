# Beep Boop

> Solana blockchain clawd pointer — a lobster claw companion living in the macOS menu bar

<p align="center">
  <img src="assets/demo.gif" alt="Beep Boop Demo" width="100%" />
</p>

**Clawd with vision, voice, and lobster claw pointing.**

## Features

- **Push-to-talk** — Press ctrl+option to capture voice anywhere on your Mac
- **Screen capture** — Screenshot analysis for context-aware responses
- **Lobster claw overlay** — The claw flies to and points at UI elements Clawd references
- **ElevenLabs TTS** — Lobster voice responses with real-time streaming
- **Solana integration** — Balance lookups, token queries, and RPC passthrough via Clawd Gateway
- **Multi-monitor support** — Works across all your displays

## Architecture

```
┌─────────────────────────────────────────────┐
│  Beep Boop App (Menu Bar + Overlay)         │
│  ├── CompanionManager (state machine)       │
│  ├── MenuBarPanelManager (NSStatusItem)     │
│  ├── OverlayWindow (claw + response)        │
│  └── ScreenCaptureKit (multi-monitor)       │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│  Clawd Gateway (Cloudflare Worker)           │
│  ├── /chat     → Anthropic Claude           │
│  ├── /tts      → ElevenLabs                │
│  ├── /transcribe-token → AssemblyAI         │
│  └── /solana/* → Solana RPC                 │
└─────────────────────────────────────────────┘
```

## Requirements

- macOS 14.2+ (for ScreenCaptureKit)
- Anthropic API key (via Clawd Gateway)
- ElevenLabs API key (via Clawd Gateway)
- AssemblyAI API key (via Clawd Gateway)

## Setup

1. **Deploy the Clawd Gateway Worker:**
   ```bash
   cd worker
   npm install
   npx wrangler secret put ANTHROPIC_API_KEY
   npx wrangler secret put ELEVENLABS_API_KEY
   npx wrangler secret put ASSEMBLYAI_API_KEY
   npx wrangler deploy
   ```

2. **Open the Xcode project:**
   ```bash
   open leanring-buddy.xcodeproj
   ```

3. **Configure the gateway URL** in `CompanionManager.swift`

4. **Build and run** (Cmd+R in Xcode)

## Claw Pointing

Clawd embeds `[CLAW:x,y:label:screenN]` tags in responses. The overlay parses these, maps coordinates to the correct monitor, and animates the lobster claw along a bezier arc to the target.

## Key Files

| File | Purpose |
|------|---------|
| `leanring_buddyApp.swift` | Menu bar app entry point |
| `CompanionManager.swift` | Central state machine |
| `MenuBarPanelManager.swift` | Menu bar panel lifecycle |
| `OverlayWindow.swift` | Full-screen claw overlay |
| `CompanionScreenCaptureUtility.swift` | Multi-monitor screenshots |
| `BuddyDictationManager.swift` | Push-to-talk voice pipeline |

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)