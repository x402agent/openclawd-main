-- ClawdRouter — enrollment tokens for the reverse-tunnel install UX
--
-- A user mints an API key + enrollment token in one wallet-signed flow
-- (POST /v1/enroll/mint). The dashboard returns a one-time URL that the
-- customer pastes into `clawdrouter enroll <url>`, which exchanges the
-- token for the API key + tunnel URL and writes ~/.clawd/config.json.
--
-- The raw key lives here in plaintext only until redemption or expiry
-- (15-min default TTL). D1 is encrypted at rest by Cloudflare.

CREATE TABLE IF NOT EXISTS enrollment_tokens (
  token          TEXT PRIMARY KEY,            -- url-safe random, 32 bytes
  api_key_id     TEXT NOT NULL,               -- FK api_keys.id
  api_key_raw    TEXT NOT NULL,               -- plaintext key, single-use
  tunnel_url     TEXT NOT NULL,               -- which fly hub to connect
  device_label   TEXT,                        -- user-chosen, optional
  wallet_address TEXT NOT NULL,               -- minter, for audit
  created_at     INTEGER NOT NULL,
  expires_at     INTEGER NOT NULL,
  consumed_at    INTEGER,                     -- set on first GET
  consumed_ip    TEXT                         -- audit trail
);

CREATE INDEX IF NOT EXISTS idx_enrollment_tokens_api_key
  ON enrollment_tokens(api_key_id);

CREATE INDEX IF NOT EXISTS idx_enrollment_tokens_expires
  ON enrollment_tokens(expires_at)
  WHERE consumed_at IS NULL;
