# OpenClawd payments — x402 / MPP / AP2 / A2A from inside a sandbox

This is the companion doc to [`openclawd-stack/payments/INTEGRATION.md`](../openclawd-stack/payments/INTEGRATION.md). It walks through the end-to-end flow of a user launching a *monetised* agent and another user paying to call it.

The pieces live in three places:

| Surface | Where it runs | What it does |
|---|---|---|
| **Orchestrator** | `solanaclawd.com/api` | Issues AP2 mandates, registers agents on-chain, pins manifests to IPFS, reads vault earnings |
| **Sandbox gateway** | Inside each user's E2B sandbox | Exposes `SandboxPayments.pay()` over `/v1/x402/pay`; threads payments into every `AgentSession` |
| **ClawdRouter worker** | Cloudflare Worker on `solanaclawd.com/x402` | Verifies AP2 mandates, resolves `/by-privy/<sub>` → wallet, settles from the user's vault PDA |

---

## The four protocols, one sentence each

- **x402** — HTTP 402 + `X-Payment` header carrying a browser-signed USDC transfer. Client-side key required.
- **MPP** — Multi-Payment Protocol. Same browser-signed shape, different envelope.
- **AP2** — JWT-VC *intent mandate* signed by an issuer (us, via `PRIVY_AUTH_PRIVATE_KEY`). Settles custodially against the user's `clawd-vault` PDA.
- **A2A** — Agent-to-Agent. Discoverable agent cards; payments still ride on one of the three above.

**Why AP2 is the only outbound protocol from sandboxes:** Privy-managed wallets don't expose raw secrets to the sandbox, so x402/MPP (which require a Solana keypair the client controls) are physically impossible. The mandate authorises, the program executes.

---

## The whole loop

### 1. User launches a monetised agent

Frontend hits `POST /api/v1/launch` with a Privy JWT and `{ monetize: true, spendLimitUsd: 10 }`. The orchestrator:

1. Mints a fresh AP2 mandate (JWT-VC, ES256, 1h TTL) signed with `PRIVY_AUTH_PRIVATE_KEY`.
2. Spawns / resumes the user's E2B sandbox from the `clawd` template, injecting `CLAWD_MANDATE_JWT`, `CLAWD_OWNER_WALLET`, `CLAWD_OWNER_SUB`, `CLAWD_ROUTER_ORIGIN`, `CLAWD_USDC_MINT`.
3. Registers the agent on-chain in `clawd-vault` (idempotent — PDA is `(registrySeed, wallet)`).
4. Pins the A2A manifest and the `{privySub, wallet}` index to Pinata so the worker can resolve `/x402/agents/by-privy/<sub>`.

Response includes `payments: { agentPda, manifestCid, mandateJwt, mandateExp }`.

### 2. Sandbox pays another agent

Inside the sandbox, agents get `this.pay({ url, ... })` on every `AgentSession`. The shortcut is:

```bash
curl -X POST https://$SANDBOX/v1/x402/pay \
  -H "Authorization: Bearer $GATEWAY_TOKEN" \
  -d '{ "url": "https://other-gateway.com/x402/agents/.../summarize" }'
```

Under the hood, `SandboxPayments.pay()`:

1. Attaches `X-AP2-Mandate: <jwt>` and a preflight GET.
2. Parses the 402 challenge, verifies price ≤ cap.
3. Retries with `X-AP2-Intent: settle`. The ClawdRouter verifies the mandate against `AP2_VERIFIER_JWK` and has the vault program CPI the USDC transfer from the user's vault PDA.
4. Writes a receipt to the LEARNED tier of the Clawd vault (`payment:<ts>:<host>`) and caches it at `ipfs://<receiptCid>`.
5. Updates the local spend meter — agents get fast feedback on how close they are to their daily cap.

### 3. Another user pays to call the agent

```bash
curl -X POST https://solanaclawd.com/x402/a2a/by-privy/$USER_SUB \
  -d '{ "jsonrpc":"2.0","id":1,"method":"tasks/send", ... }'
```

Worker flow:

1. `resolvePrivySub(env, sub)` pulls the Pinata-pinned `{privySub, wallet}` index, caches it for 5 min.
2. Worker looks up the agent in `clawd-vault` by wallet, fetches the A2A card from IPFS.
3. Replies with a 402 challenge (x402 or MPP — the caller's choice).
4. Caller pays. Worker verifies, forwards the call to the sandbox gateway, and records the settlement.
5. 70% of the fee lands in the owner's vault ATA. The rest splits buyback / treasury / operator per the `splitBps` the owner configured.

### 4. Owner reads earnings / sweeps

```bash
curl https://solanaclawd.com/api/v1/earnings \
  -H "Authorization: Bearer $PRIVY_JWT"
# → { pendingBaseUnits: "230000", asset: "USDC", decimals: 6 }
```

The `/payments` page surfaces this in real time. Sweeping via the `distribute` instruction is a scheduled job today; once the three new Anchor instructions (`deposit` / `withdraw` / `settle_mandate`) land, users can pull their own funds trustlessly.

---

## Environment additions

On top of the baseline openclawd-stack env:

```sh
# ── orchestrator ─────────────────────────────────────────────────────
ORCHESTRATOR_KEEPER_KEY=<base58 Solana secret>   # pays tx fees, no funds
CLAWD_VAULT_PROGRAM=<program id>
CLAWD_REGISTRY_SEED=clawd-registry-v1
PINATA_JWT=...
GATEWAY_ORIGIN=https://solanaclawd.com
HELIUS_RPC=https://mainnet.helius-rpc.com/?api-key=...
USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# ── worker (ClawdRouter) ─────────────────────────────────────────────
AP2_VERIFIER_JWK={"kty":"EC","crv":"P-256","x":"...","y":"..."}   # public!
PINATA_JWT=...

# ── sandbox (injected automatically) ─────────────────────────────────
CLAWD_MANDATE_JWT=<minted at launch>
CLAWD_OWNER_WALLET=<user's Privy Solana wallet>
CLAWD_OWNER_SUB=<Privy sub>
CLAWD_ROUTER_ORIGIN=https://solanaclawd.com
CLAWD_USDC_MINT=<same>
```

---

## Routes

### Orchestrator (`/api`, Privy-authed)

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/launch` | Existing launch + optional `monetize:true` path |
| POST | `/v1/agents/register` | Idempotent on-chain registration |
| POST | `/v1/mandates/mint` | Mint a fresh mandate outside launch |
| GET  | `/v1/earnings` | Read pending USDC in the vault PDA |

### Sandbox gateway (`https://$SANDBOX:18789`)

| Method | Path | Purpose |
|---|---|---|
| POST | `/v1/x402/pay` | Fire a paid fetch through SandboxPayments |
| GET  | `/v1/x402/spend` | Local spend meter vs the active mandate |
| GET  | `/v1/x402/mandate` | Current mandate's cap + expiry |

### Telegram commands

```
/spend                — spent vs mandate
/mandate              — active mandate's cap + expiry
/pay <url>            — paid fetch from chat
/pay-agent <sub>      — pay another user's ClawdRouter agent
```

---

## Gotchas

- **The keeper key is NOT the fund signer.** `ORCHESTRATOR_KEEPER_KEY` only pays lamport fees to execute `register_agent`. All USDC stays in program-derived ATAs. If it leaks, worst case is wasted SOL — no funds at risk.
- **`AP2_VERIFIER_JWK` is PUBLIC.** Put it in `wrangler.jsonc` vars, not secrets.
- **Mandates rotate on every launch.** The old one stays valid until `exp`. Add a `jti` denylist for revocation when you're ready.
- **Sandbox pause clears the local spend meter.** Lifetime spend lives in the LEARNED tier under `payment:*` keys — sum them if you need it.
- **Receipts are dual-written.** IPFS via the worker, LEARNED via the sandbox. Worker log has `x-clawd-receipt-cid`.

---

## Anchor TODO

`clawd-vault` has `register_agent`, `update_agent`, `distribute`. The AP2 custodial flow needs three more:

- `deposit(amount)` — user deposits USDC into their vault ATA.
- `withdraw(amount)` — user pulls their own funds at will.
- `settle_mandate(mandate_hash, recipient, amount)` — called by the worker after verifying an AP2 mandate. Transfers from vault ATA → recipient ATA with a per-mandate daily cap enforced on-chain.

Until they ship, settlement falls back to a custodial operator ATA — fine for the first cohort, but migrate to the trustless path before broad release.
