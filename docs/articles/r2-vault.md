# R2 Vault — the "floppy disk" save system

Every signed-in user gets a private, isolated namespace inside the Clawd
Cloudflare R2 bucket where they can save vibe projects, generated art,
chats, agents, and anything else they create on the site. A floppy-disk
icon appears next to user-generated content; clicks push that artifact to
R2 and a row into `saved_items`. A floating launcher opens a drawer listing
everything they've stashed.

## Architecture

```
Browser ──► tRPC (storage.saveInline | presignUpload+PUT)
                 │
                 ▼
      users/<openId>/<timestamp>-<nanoid>-<filename>     ← in R2 bucket `clawd`
                 │
                 ▼
           saved_items table (title / kind / size / key)
```

- **Small payloads** (≤10 MB) go through `storage.saveInline` — base64 in
  the tRPC mutation, server uploads via the S3 SDK.
- **Large payloads** (≤512 MB) use `storage.presignUpload` → browser PUT
  → `storage.register` to finalize the DB row.
- All keys are **prefixed with `users/<openId>/`**, and the server
  enforces that prefix on every read, update, and delete (see
  `isKeyOwnedBy` in [server/_core/r2.ts](../server/_core/r2.ts)).

## Configuration

Add these to `.env`:

```bash
CLOUDFLARE_ACCOUNT_ID=<your-cloudflare-account-id>
CLOUDFLARE_S3_API=https://<your-cloudflare-account-id>.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET=clawd
CLOUDFLARE_R2_ACCESS_KEY_ID=<create in CF dashboard → R2 → API tokens>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<create in CF dashboard → R2 → API tokens>

# Optional — custom domain or Worker mapped to the bucket for public objects
CLOUDFLARE_R2_PUBLIC_BASE_URL=https://vault.solanaclawd.com
```

CORS on the bucket must already allow `https://solanaclawd.com` (GET, PUT,
HEAD). If you host a Worker-backed public domain, put that in
`CLOUDFLARE_R2_PUBLIC_BASE_URL` so `isPublic` items get clean URLs.

Create the token with **Object Read & Write** scoped to the `clawd`
bucket. The R2 SDK uses AWS SigV4 against the S3-compat endpoint.

## Database

Migration: [drizzle/0004_saved_items.sql](../drizzle/0004_saved_items.sql).

```sql
CREATE TABLE saved_items (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL,
  kind saved_item_kind NOT NULL DEFAULT 'other',  -- enum
  source VARCHAR(64),                              -- origin page/module
  title VARCHAR(255) NOT NULL,
  description TEXT,
  "r2Key" TEXT NOT NULL,
  "contentType" VARCHAR(128),
  "sizeBytes" INTEGER,
  "thumbnailUrl" TEXT,
  metadata JSON,
  "isPublic" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Push with `pnpm db:push` or apply the SQL directly.

## tRPC endpoints

All are on `appRouter.storage` and require auth:

| Procedure | Purpose |
| --- | --- |
| `status` (public query) | Reports whether R2 is configured |
| `presignUpload` | Returns a signed PUT URL for files up to 512 MB |
| `register` | After a successful presigned PUT, records the `saved_items` row |
| `saveInline` | Base64 upload path for payloads ≤10 MB |
| `list` | Owner's items, filter by `kind` |
| `get` | Single item |
| `getDownloadUrl` | Signed GET URL (optional `asAttachment`) |
| `update` | Patch title / description / isPublic |
| `delete` | Deletes the R2 object + DB row |

## Adding save buttons to new places

Anywhere in the app you render user-generated content, drop in
`FloppyDiskSave`:

```tsx
import { FloppyDiskSave } from "@/components/FloppyDiskSave";

<FloppyDiskSave
  request={{
    kind: "image",                    // "vibe-project" | "chat" | ...
    title: "Grok portrait",
    source: "image-studio",
    blob: imageBlob,                  // or url, or data (auto-JSON-stringified)
  }}
/>
```

The icon hides itself when `useAuth().user` is null. A thunk form is
supported for callers that need to build the payload lazily:

```tsx
<FloppyDiskSave request={() => ({ kind: "chat", title, data: messages })} />
```

## UX surface

- Floating floppy-disk launcher bottom-right (hidden while logged out)
- Badge shows the current save count
- `SavedVaultDrawer` lists items with open / download / copy-share-link /
  delete actions
- Wired into [Vibe](../client/src/pages/Vibe.tsx): save whole session,
  save individual replies, save generated images
