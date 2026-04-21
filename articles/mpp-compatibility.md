# MPP (Machine Payments Protocol) compatibility

Phase 5. MPP is the IETF-track successor co-authored by Tempo Labs and
Stripe. Its `charge` intent is **wire-compatible with x402 exact**: same
signed transaction, same verify/settle semantics. Everything the Clawd
stack emits now speaks both header conventions simultaneously so
MPP-native clients and legacy x402 clients can consume the same
endpoints without modification.

## What we added

| Component | MPP change |
| --- | --- |
| Facilitator `/supported` | Advertises `mpp.supported = true`, `intents: ["charge"]`, method `x402-solana-exact` with the USDC mint |
| Facilitator `/verify`, `/settle` | Now read the credential from either `X-Payment` OR `Authorization: Payment method=..., credential="..."` |
| `workers/x402-proxy` | 402 responses set both `X-Payment-Required` (x402) AND `WWW-Authenticate: Payment method=..., challenge="..."` (MPP). 200 responses set both `X-Payment-Response` and `Payment-Receipt`. Reads either header on retry; strips both before forwarding. |
| `@solana-clawd/agents-x402` | Core exports `buildMppChallengeHeader`, `parseMppAuthorizationHeader`, `readPaymentCredential`. HTTP gate + Hono + Express adapters set all four headers. |

## Header map

| Purpose | Legacy x402 | MPP |
| --- | --- | --- |
| Challenge (server → client) | `X-Payment-Required: <base64>` | `WWW-Authenticate: Payment method="x402-solana-exact", intent="charge", challenge="<base64>"` |
| Credential (client → server) | `X-Payment: <base64>` | `Authorization: Payment method="x402-solana-exact", credential="<base64>"` |
| Receipt (server → client on success) | `X-Payment-Response: <base64>` | `Payment-Receipt: <base64>` |

The base64-decoded payload is **identical** in both columns — it's our
standard x402 paymentRequirements envelope for the challenge, and a
standard receipt JSON for the response. No separate schemas.

## What we did NOT add

MPP supports multiple payment methods (Tempo stablecoin chain, Stripe
cards, Bitcoin Lightning, Custom). **Clawd only offers the
`x402-solana-exact` method** — the existing Solana USDC flow. Requests
that advertise a method we don't support get a standard 402 back with
our one method listed; MPP clients pick whichever method they can
honor. Adding Stripe / Tempo / Lightning is out of scope until someone
asks; it's strictly additive.

MPP also defines a `session` intent (streaming / pay-as-you-go with
sub-second settlement). We only implement `charge` (one-time per
request). Session support would require channel state, which would
change a lot of the existing x402 flow.

## Client compatibility matrix

| Client | Works today? | Notes |
| --- | --- | --- |
| Cloudflare Agents SDK (`withX402Client`) | ✅ | Uses `X-Payment` / `X-Payment-Response` |
| Coinbase x402 clients | ✅ | Same |
| `@solana-clawd/agents-x402` | ✅ | Ships with dual-header support |
| MPP-native TypeScript (`mppx`) clients | ✅ (charge intent) | Reads `WWW-Authenticate: Payment`, sends `Authorization: Payment` |
| MPP Python (`pympp`) | ✅ (charge intent) | Same |
| Clients expecting Stripe/Lightning methods | ❌ | Only `x402-solana-exact` is offered |

## Using it — no code changes required

If you already built against the x402 headers, nothing changes; the MPP
headers ship alongside. If you're starting new and want MPP-native
code, use:

```ts
// Server
import { honoX402Gate } from "@solana-clawd/agents-x402/http";
app.use("/premium/*", honoX402Gate({ slug: "alpha-feed" }));
// → sets X-Payment-Required + WWW-Authenticate on 402
// → reads X-Payment OR Authorization: Payment on retry
// → sets X-Payment-Response + Payment-Receipt on 200
```

```ts
// Client (either path works)
const res = await fetch(url, {
  headers: {
    // Legacy x402 path:
    "X-Payment": paymentB64,
    // Or MPP path:
    "Authorization": `Payment method="x402-solana-exact", credential="${paymentB64}"`,
  },
});
```

## Facilitator capability card

```bash
curl https://solanaclawd.com/api/x402/facilitator/supported
```

Now returns:

```json
{
  "x402Version": 1,
  "facilitator": "clawd",
  "schemes": ["exact"],
  "networks": ["solana-mainnet"],
  "assets": [{ "network": "solana-mainnet", "mint": "EPjFWdd5…", "symbol": "USDC", "decimals": 6 }],
  "treasury": "…",
  "recipient": "…",
  "multiTenant": true,
  "gasless": false,
  "mpp": {
    "supported": true,
    "intents": ["charge"],
    "methods": [
      { "method": "x402-solana-exact", "network": "solana-mainnet", "mint": "EPjFWdd5…", "decimals": 6 }
    ]
  },
  "limits": { "maxPerRequestUsd": 0.10, "maxSessionUsd": 5 }
}
```

## Related

- [docs/monetize.md](./monetize.md) — multi-tenant agent / MCP registry
- [docs/x402-proxy-worker.md](./x402-proxy-worker.md) — Cloudflare Worker gate
- [docs/agents-x402-sdk.md](./agents-x402-sdk.md) — SDK for MCP + HTTP
- [server/_core/x402Facilitator.ts](../server/_core/x402Facilitator.ts) — facilitator
- [MPP spec (mpp.dev)](https://mpp.dev) — protocol reference
- [IETF Payment HTTP Authentication Scheme draft](https://datatracker.ietf.org/doc/draft-hoehrmann-http-payments/)
