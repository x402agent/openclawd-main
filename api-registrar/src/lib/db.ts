import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  json,
} from "drizzle-orm/pg-core";

// ─── API Key Registrations ──────────────────────────────────────────────────
export const xVerificationCodes = pgTable("x_verification_codes", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("walletAddress", { length: 64 }).notNull(),
  userId: integer("userId"), // Will be linked after verification
  verificationCode: varchar("verificationCode", { length: 32 }).notNull().unique(),
  xTweetUrl: text("xTweetUrl"),
  xUsername: varchar("xUsername", { length: 64 }),
  verified: boolean("verified").default(false),
  verifiedAt: timestamp("verifiedAt"),
  apiKeyId: integer("apiKeyId"), // Generated API key ID
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type XVerificationCode = typeof xVerificationCodes.$inferSelect;
export type InsertXVerificationCode = typeof xVerificationCodes.$inferInsert;

// ─── API Keys (extended from existing schema) ────────────────────────────────
export const registrarApiKeys = pgTable("registrar_api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("userId").notNull(),
  walletAddress: varchar("walletAddress", { length: 64 }).notNull(),
  verificationCodeId: integer("verificationCodeId").notNull(),
  keyPrefix: varchar("key_prefix", { length: 16 }).notNull(),
  keyHash: varchar("key_hash", { length: 64 }).notNull(),
  name: varchar("name", { length: 128 }).notNull(),
  scopes: json("scopes").default(["chat:read", "chat:write"]).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RegistrarApiKey = typeof registrarApiKeys.$inferSelect;
export type InsertRegistrarApiKey = typeof registrarApiKeys.$inferInsert;
