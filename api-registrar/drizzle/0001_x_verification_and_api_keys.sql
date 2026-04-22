-- Migration: Add X Verification and API Key tables for SolanaClawd API Registrar
-- Run: npx drizzle-kit push

-- X Verification Codes table
CREATE TABLE IF NOT EXISTS x_verification_codes (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(64) NOT NULL,
  user_id INTEGER,
  verification_code VARCHAR(32) NOT NULL UNIQUE,
  x_tweet_url TEXT,
  x_username VARCHAR(64),
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP,
  api_key_id INTEGER,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_x_verification_codes_wallet ON x_verification_codes(wallet_address);
CREATE INDEX idx_x_verification_codes_code ON x_verification_codes(verification_code);
CREATE INDEX idx_x_verification_codes_user ON x_verification_codes(user_id);

-- Registrar API Keys table (extends existing api_keys with X verification tracking)
CREATE TABLE IF NOT EXISTS registrar_api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  wallet_address VARCHAR(64) NOT NULL,
  verification_code_id INTEGER NOT NULL,
  key_prefix VARCHAR(16) NOT NULL,
  key_hash VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  scopes JSONB DEFAULT '["chat:read", "chat:write"]' NOT NULL,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_registrar_api_keys_user ON registrar_api_keys(user_id);
CREATE INDEX idx_registrar_api_keys_wallet ON registrar_api_keys(wallet_address);
CREATE INDEX idx_registrar_api_keys_hash ON registrar_api_keys(key_hash);
CREATE INDEX idx_registrar_api_keys_prefix ON registrar_api_keys(key_prefix);
