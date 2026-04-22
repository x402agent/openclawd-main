/**
 * 🐾 OpenClawd API Registrar - Database Schema
 * 
 * Uses Drizzle ORM with PostgreSQL (Neon compatible).
 */

import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  json,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'bot']);
export const loginMethodEnum = pgEnum('login_method', ['wallet', 'email', 'oauth']);

// ─── Users ────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 255 }),
  loginMethod: loginMethodEnum("login_method").default('wallet').notNull(),
  role: userRoleEnum("role").default('user').notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── X Verification Codes ──────────────────────────────────────────────────
export const xVerificationCodes = pgTable("x_verification_codes", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("wallet_address", { length: 64 }).notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  verificationCode: varchar("verification_code", { length: 32 }).notNull().unique(),
  xTweetUrl: text("x_tweet_url"),
  xUsername: varchar("x_username", { length: 64 }),
  verified: boolean("verified").default(false).notNull(),
  verifiedAt: timestamp("verified_at"),
  apiKeyId: integer("api_key_id"), // Generated API key ID
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type XVerificationCode = typeof xVerificationCodes.$inferSelect;
export type InsertXVerificationCode = typeof xVerificationCodes.$inferInsert;

// ─── API Keys ─────────────────────────────────────────────────────────────
export const registrarApiKeys = pgTable("registrar_api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  walletAddress: varchar("wallet_address", { length: 64 }).notNull(),
  verificationCodeId: integer("verification_code_id").notNull().references(() => xVerificationCodes.id),
  keyPrefix: varchar("key_prefix", { length: 18 }).notNull(),
  keyHash: varchar("key_hash", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  scopes: json("scopes").default(['chat:read', 'chat:write']).notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at").notNull(),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type RegistrarApiKey = typeof registrarApiKeys.$inferSelect;
export type InsertRegistrarApiKey = typeof registrarApiKeys.$inferInsert;
