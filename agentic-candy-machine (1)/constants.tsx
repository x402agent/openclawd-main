
import React from 'react';

export const COLORS = {
  purple: "#9945FF",
  green: "#14F195",
  gold: "#FFD700",
  cyan: "#00D4FF",
  red: "#FF4466",
  abyss: "#06060e",
  card: "rgba(16, 17, 38, 0.7)",
  border: "rgba(153, 69, 255, 0.12)",
};

export const PHASES = [
  { id: "dna", label: "DNA LAB", icon: "🧬", desc: "Agent identity & capabilities" },
  { id: "art", label: "ART FORGE", icon: "🎨", desc: "Generate NFT artwork" },
  { id: "token", label: "TOKEN", icon: "🪙", desc: "SPL token creation" },
  { id: "candy", label: "CANDY MACHINE", icon: "🍬", desc: "Metaplex configuration" },
  { id: "recursive", label: "RECURSION", icon: "♾️", desc: "Recursive metadata tree" },
  { id: "mint", label: "MINT", icon: "⚡", desc: "Deploy & mint on Solana" },
];

export const TIERS = [
  { id: "OBSERVER", name: "Observer", level: 0, color: "#666", perms: ["read"], price: "Free" },
  { id: "AGENT", name: "Agent", level: 1, color: COLORS.purple, perms: ["read","execute"], price: "0.05 SOL" },
  { id: "OPERATOR", name: "Operator", level: 2, color: COLORS.green, perms: ["read","execute","delegate"], price: "0.1 SOL" },
  { id: "SOVEREIGN", name: "Sovereign", level: 3, color: COLORS.gold, perms: ["read","execute","delegate","mint","attest"], price: "1 SOL" },
];

export const CAPABILITIES = [
  { id: "trade", name: "Token Swap", icon: "⇄", desc: "Jupiter aggregator trading" },
  { id: "social", name: "Social Agent", icon: "📡", desc: "Twitter/X & Farcaster" },
  { id: "payment", name: "X402 Pay", icon: "💳", desc: "HTTP 402 micropayments" },
  { id: "analysis", name: "Analytics", icon: "📊", desc: "Birdeye market data" },
  { id: "mint", name: "NFT Minter", icon: "🖼", desc: "Autonomous minting" },
  { id: "governance", name: "Governance", icon: "🏛", desc: "DAO voting & proposals" },
  { id: "defi", name: "DeFi Yield", icon: "🌾", desc: "Farming & liquidity" },
  { id: "voice", name: "Voice Agent", icon: "🎙", desc: "Speech-to-trade" },
];

export const MODELS = [
  { id: "gemini-3-flash", name: "Gemini 3 Flash", provider: "Google", tag: "gemini-3-flash-preview" },
  { id: "gemini-3-pro", name: "Gemini 3 Pro", provider: "Google", tag: "gemini-3-pro-preview" },
  { id: "phala-24b", name: "Phala Uncensored", provider: "RedPill TEE", tag: "phala/uncensored-24b" },
];

export const GUARD_PRESETS = [
  { id: "open", name: "Open Mint", desc: "No restrictions, anyone can mint" },
  { id: "paid", name: "SOL Payment", desc: "Charge SOL per mint" },
  { id: "gated", name: "Token Gated", desc: "Require token holdings" },
  { id: "allowlist", name: "Allow List", desc: "Whitelist-only access" },
  { id: "tiered", name: "Tiered Groups", desc: "Multiple price tiers" },
];

export const ART_STYLES = [
  { id: "passport", name: "Holographic Passport", preview: "linear-gradient(135deg, #9945FF44, #14F19544, #FFD70044)" },
  { id: "circuit", name: "Circuit Mandala", preview: "linear-gradient(135deg, #0f1024, #9945FF33, #14F19522)" },
  { id: "abstract", name: "Fractal Recursive", preview: "linear-gradient(135deg, #14F19533, #00D4FF33, #9945FF22)" },
  { id: "avatar", name: "Neural Portrait", preview: "linear-gradient(135deg, #FF446622, #9945FF44, #14F19522)" },
];
