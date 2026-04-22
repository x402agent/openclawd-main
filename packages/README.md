# OpenClawd Packages

Shared npm packages for the OpenClawd ecosystem.

## Packages

| Package | Description | npm |
|---|---|---|
| [`clawd-wallet/`](./clawd-wallet/) | Privy-powered embedded Solana wallet — Jupiter swaps, Grok AI screening | `@openclawd/wallet` |
| [`agentwallet-vault/`](./agentwallet/) | Self-managed encrypted keypair vault with E2B + Cloudflare deployment | `agentwallet-vault` |

## clawd-wallet

**Privy-powered embedded Solana wallet for the openclawd ecosystem.**

```bash
npm install @openclawd/wallet
```

```tsx
import { PrivyProvider, useClawdWallet } from "@openclawd/wallet/react";

<PrivyProvider appId={process.env.PRIVY_APP_ID!} embeddedWallets>
  <MyApp />
</PrivyProvider>

// Inside component:
const { wallet, connectWallet } = useClawdWallet();
```

- **React**: `<PrivyProvider>` + `useClawdWallet()` + `useClawdWalletBalance()`
- **Node.js**: `ClawdWallet` + `SwapService` for Jupiter quotes + execution
- **Agentic**: `AgenticWallet` with Grok 4.20 Beta transaction screening
- **CLI**: `clawd-wallet tokens | quote | balance | swap`

Architecture: `User → Grok 4.20 Beta → ClawdWallet (Privy TEE) → Solana`

See [`packages/clawd-wallet/README.md`](./clawd-wallet/README.md) for full docs.

## Development

```bash
cd packages/clawd-wallet
npm install
npm run build
```

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)
