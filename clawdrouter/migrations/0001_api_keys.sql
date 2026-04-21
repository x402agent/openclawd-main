-- ClawdRouter — wallet-signed API keys
--
-- Keys are minted after a client signs a challenge with their Solana
-- wallet. The key itself (ck_live_…) is shown exactly once at mint time;
-- the server stores only key_hash (SHA-256). Every authenticated request
-- through /v1/chat/completions looks up the key by (key_prefix, key_hash)
-- and updates last_used_at asynchronously via ctx.waitUntil.
--
-- Revocation is a soft delete (revoked_at set). Lookups filter it out.

CREATE TABLE IF NOT EXISTS api_keys (
  id              TEXT PRIMARY KEY,               -- random short id
  key_prefix      TEXT NOT NULL,                  -- "ck_live_<first 8 chars>"
  key_hash        TEXT NOT NULL UNIQUE,           -- SHA-256 hex of full key
  wallet_address  TEXT NOT NULL,                  -- base58 Solana pubkey
  label           TEXT,                           -- user-set, optional
  tier            TEXT NOT NULL DEFAULT 'FREE',   -- FREE|HOLDER|DIAMOND|WHALE
  credits_usdc    REAL NOT NULL DEFAULT 0,        -- prepaid USDC balance
  created_at      INTEGER NOT NULL,               -- unix ms
  last_used_at    INTEGER,                        -- unix ms, null until first use
  revoked_at      INTEGER,                        -- soft delete
  request_count   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_api_keys_wallet
  ON api_keys(wallet_address)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_api_keys_prefix
  ON api_keys(key_prefix)
  WHERE revoked_at IS NULL;

-- Short-lived challenges that the wallet must sign.
-- Expires in 5 minutes; consumed on successful verification.
CREATE TABLE IF NOT EXISTS auth_challenges (
  nonce        TEXT PRIMARY KEY,
  wallet       TEXT NOT NULL,
  message      TEXT NOT NULL,       -- exactly what the wallet signs
  action       TEXT NOT NULL,       -- "mint" | "list" | "revoke:<id>"
  created_at   INTEGER NOT NULL,
  expires_at   INTEGER NOT NULL,
  consumed_at  INTEGER              -- set when the challenge is used
);

CREATE INDEX IF NOT EXISTS idx_auth_challenges_wallet_action
  ON auth_challenges(wallet, action)
  WHERE consumed_at IS NULL;
