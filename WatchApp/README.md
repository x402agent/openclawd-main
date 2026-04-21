# Clawd Watch App

watchOS companion app for solana-clawd — displays SOL balance, USD value, and recent transactions on Apple Watch.

## Features

- **Balance Display** — Shows current SOL balance with USD equivalent
- **Recent Transactions** — Last 5 transactions with receive/send indicators
- **Complications** — Apple Watch complications showing SOL balance on watch face
- **WatchConnectivity** — Communicates with iOS host app via Bluetooth/WiFi

## Architecture

```
┌─────────────────────────────────────────┐
│         Apple Watch (watchOS)            │
│  ┌─────────────────────────────────┐   │
│  │  ContentView.swift               │   │
│  │  ├── BalanceCard (SOL + USD)     │   │
│  │  └── TransactionList (5 recent)  │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  WalletState.swift              │   │
│  │  └── WCSessionDelegate          │   │
│  │      (WatchConnectivity)        │   │
│  └─────────────────────────────────┘   │
│                                          │
│  ┌─────────────────────────────────┐   │
│  │  ComplicationViews.swift        │   │
│  │  └── WidgetKit integration      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ▲ WatchConnectivity
           │ (Bluetooth/WiFi)
           ▼
┌─────────────────────────────────────────┐
│           iOS Host App                  │
│  (part of SolanaOS mobile suite)        │
│  - relays data to Watch                 │
│  - fetches wallet state from RPC        │
└─────────────────────────────────────────┘
```

## Project Structure

| File | Purpose |
|------|---------|
| `OpenClawWatchApp.swift` | App entry point, creates WalletState |
| `ContentView.swift` | Main UI: BalanceCard + TransactionList |
| `WalletState.swift` | ObservableObject managing wallet data via WCSession |
| `ComplicationViews.swift` | WatchKit complications for watch faces |
| `SolanaOSWatch.xcodeproj/` | Xcode project file |
| `Assets.xcassets/` | App icons and images |
| `Info.plist` | App configuration |

## Data Flow

1. **iOS App** fetches wallet data from Solana RPC/Helius
2. **WCSession** sends message to Watch with `{solBalance, usdValue, transactions}`
3. **WalletState** receives message, updates `@Published` properties
4. **SwiftUI** automatically re-renders ContentView

## Requirements

- watchOS 9.0+
- Xcode 15.0+
- Paired iPhone with SolanaOS app installed
- WatchConnectivity entitlement

## Building

```bash
# Open in Xcode
open SolanaOSWatch.xcodeproj

# Or build from command line
xcodebuild -project SolanaOSWatch.xcodeproj -scheme OpenClawWatchApp -configuration Release build
```

## Watch Face Complications

The app provides `SolBalanceComplication` for watch face customization:

| Family | Display |
|--------|---------|
| `accessoryCircular` | Circular gauge with SOL amount |
| `accessoryInline` | Inline text: "◎ X.XX SOL" |
| `accessoryRectangular` | Rectangular: "SolanaOS" + balance |
| `accessoryCorner` | Corner widget with balance |

## Xcode Build Notes

This is a **WatchKit app** (watchOS SwiftUI), not a Swift Package Manager project. If you see errors like:
```
error: Could not find Package.swift in this directory
```
This is expected — use **Xcode** (not swift CLI) to build this project. The `.xcodeproj` file is the correct format.

## Related

- **Website** — [solanaclawd.com](https://solanaclawd.com)
- **Twitter/X** — [x.com/clawddevs](https://x.com/clawddevs)
- **$CLAWD Token** — [8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump](https://pump.fun/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
- **SolanaOS** — [github.com/x402agent/SolanaOS](https://github.com/x402agent/SolanaOS)
- **solana-clawd** — [github.com/x402agent/solana-clawd](https://github.com/x402agent/solana-clawd)
- **iOS App** — `/apps/ios/` — companion iOS app with WatchConnectivity server
