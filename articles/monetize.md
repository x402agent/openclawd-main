# Monetize — user-registered x402 agents, MCPs, and HTTP endpoints

The Clawd facilitator is now **multi-tenant**: any signed-in user can
register an agent / MCP server / HTTP endpoint / tool and start accepting
USDC-on-Solana per call. The platform takes a configurable commission
(default 10%, minimum 5% for non-admins) and records every payment event
to `payment_events` for auditability.

This page covers the full lifecycle: register → echo `paymentRequirements`
in your own 402 response → clients pay → facilitator routes USDC to the
agent owner's wallet → earnings show up in the Monetize tab on /x402.

## How multi-tenant routing works

```
┌─────────────────────────────────────────────────────────────────┐
│ Owner's server returns 402 with:                                │
│                                                                 │
│   {                                                             │
│     x402Version: 1,                                             │
│     scheme: "exact",                                            │
│     network: "solana-mainnet",                                  │
│     paymentRequirements: {                                      │
│       agentSlug: "my-agent",         ← resolved server-side    │
│       recipient: "<owner-wallet>",   ← must match DB or fail   │
│       mint: "EPjFWdd5…",                                        │
│       amountAtomic: 10000            ← ≥ owner's configured    │
│     }                                                           │
│   }                                                             │
└─────────────────────────────────────────────────────────────────┘
               │
               ▼   Client signs USDC transfer → X-Payment
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/x402/facilitator/verify                               │
│   - Decode payload, deserialize Solana tx                       │
│   - getMonetizedAgentBySlug(agentSlug)   ← server-side lookup  │
│   - If slug missing: fall back to treasury                      │
│   - Derive recipient's USDC ATA, ensure the SPL transfer targets │
│     it with ≥ max(declaredAtomic, agent.pricePerCallAtomic)     │
│   - Simulate against Helius RPC                                 │
│   - Write payment_events row (status=verified)                  │
└─────────────────────────────────────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────────┐
│ POST /api/x402/facilitator/settle                               │
│   - Re-verify, sendRawTransaction, confirmTransaction           │
│   - Mark payment_events row settled w/ signature                │
│   - Accrue commission = floor(amount × bps / 10000)             │
└─────────────────────────────────────────────────────────────────┘
```

Commission is accrued **off-chain** in `payment_events.commissionAtomic`.
Phase 3 adds a claim flow that sweeps owed commission into the Clawd
treasury.

## Database

Migration: [drizzle/0005_monetized_agents.sql](../drizzle/0005_monetized_agents.sql).

### `monetized_agents`

| Column | Purpose |
| --- | --- |
| `ownerUserId` | User who registered this endpoint |
| `slug` | Unique identifier echoed in `paymentRequirements.agentSlug` |
| `target` | enum `agent` / `mcp` / `http` / `tool` |
| `label`, `description` | Display metadata |
| `recipientWallet` | Solana wallet that receives USDC |
| `pricePerCallAtomic` | Floor price in atomic USDC (6 decimals). Clients can pay more; they can't pay less. |
| `commissionBps` | Platform cut. Default 1000 (10%). User floor 500; admin may override. |
| `network` | `solana-mainnet` or `solana-devnet` |
| `active` | Owner can pause without deleting history |

### `payment_events`

Every verify/settle attempt writes one row. Status transitions:
`verified` → `settled` (success) or `verified` → `failed`. The row snapshots
`recipientWallet`, `commissionBps`, and `amountAtomic` so later config
edits can't rewrite history.

## tRPC API (`appRouter.monetize`)

| Procedure | Auth | Purpose |
| --- | --- | --- |
| `facilitator` | public query | Returns capability card — schemes, networks, USDC mint, treasury, `multiTenant: true` |
| `register` | user | Create a monetized endpoint |
| `list` | user | Owner's endpoints |
| `get` / `getBySlug` | user / public | Full row vs. client-safe subset |
| `update` | owner | Edit price, wallet, commission (admin only below 5%), active |
| `delete` | owner | Remove |
| `events` | owner | Recent `payment_events` |
| `earnings` | owner | `{ totalAtomic, ownerAtomic, commissionAtomic, settlementCount }` + USD mirrors |
| `paymentRequirements` | owner | Returns a ready-to-paste JSON payload for the owner's 402 response |

## Using it from the UI

Go to `/x402` → **Monetize** tab. The page is fully functional:

1. **Register** — slug / label / target / network / recipient wallet /
   price. The default recipient is prefilled with the connected wallet.
2. **Grid** — one card per endpoint with live earnings preview.
3. **Detail panel** — edit price + wallet, pause/resume, delete, copy the
   `paymentRequirements` JSON, inspect recent payment events.

## Using it from your own server

Minimal example — Hono on Cloudflare Workers, Node, or anywhere:

```ts
import type { Context } from "hono";

// paymentRequirements you copied from /x402 → Monetize → Copy
const MY_REQ = {
  x402Version: 1,
  scheme: "exact",
  network: "solana-mainnet",
  paymentRequirements: {
    agentSlug: "alpha-feed",
    recipient: "GyZGtA7hEThVHZpj52XC9jX15a8ABtDHTwELjFRWEts4",
    mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    amountAtomic: 10000,
    amountUsd: "0.010000",
  },
};

export async function gate(c: Context, next: () => Promise<void>) {
  const header = c.req.header("X-Payment");
  if (!header) {
    return c.json(MY_REQ, 402, { "X-Payment-Required": encodeB64(MY_REQ) });
  }
  const settleRes = await fetch(
    "https://solanaclawd.com/api/x402/facilitator/settle",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ xPaymentHeader: header }),
    }
  );
  const settle = await settleRes.json();
  if (!settle.success) {
    return c.json({ error: "Payment failed", details: settle }, 402);
  }
  c.header(
    "X-Payment-Response",
    btoa(JSON.stringify({ signature: settle.transaction }))
  );
  await next();
}
```

Phase 3 ships a Cloudflare Worker template that does all of the above
without writing any code — point it at your origin, list your slugs, and
deploy.

## Env vars (server)

Nothing new — reuses the existing facilitator env. The only behavioral
difference is that `X402_RECIPIENT_WALLET` is now just the **fallback**
when no `paymentRequirements.agentSlug` is present.

```bash
X402_RECIPIENT_WALLET=...                  # Platform treasury / fallback
X402_FEE_PAYER_PRIVATE_KEY=...             # Optional: gasless flow
X402_NETWORK=solana-mainnet
X402_USDC_MINT_MAINNET=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
X402_USDC_MINT_DEVNET=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
X402_MAX_PER_REQUEST_USD=0.10
X402_MAX_SESSION_USD=5.00
```

## Security notes

- **Slug squatting** — slugs are unique per platform; pick yours before
  someone else does.
- **Spoofed recipient** — if a 402 response echoes an explicit
  `paymentRequirements.recipient`, the facilitator rejects the payment
  when that address disagrees with the on-file `recipientWallet`.
- **Under-pay** — the facilitator charges
  `max(declaredAtomic, agent.pricePerCallAtomic)`; a proxy can never
  drop the price below the owner's floor.
- **Wrong network** — an agent configured for mainnet can't be paid with
  devnet USDC and vice versa.
- **Safety cap** — every payment is still bounded by
  `X402_MAX_PER_REQUEST_USD × 5` to prevent abuse.
