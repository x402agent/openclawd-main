/**
 * Clawd Perps - The Viral Perpetuals CLI
 * 
 * 🦾 The first-of-its-kind perpetuals trading interface for Solana
 * 
 * Features:
 * - Direct perpetuals trading with 5x leverage
 * - Permissionless market operations
 * - Pyth/Chainlink oracle integration
 * - Keeper crank automation
 * 
 * @module clawd-perps
 */

export { createCli, getGlobalFlags } from './cli.js';
export { loadConfig, expandPath, type Config, type GlobalFlags } from './config.js';
export { validatePublicKey, validateIndex, validateAmount, validateI128 } from './validation.js';
export { createContext } from './runtime/context.js';
export { buildIx, simulateOrSend, formatResult } from './runtime/tx.js';
export { fetchSlab, parseConfig } from './solana/slab.js';
export { getAta } from './solana/ata.js';
export { loadKeypair } from './solana/wallet.js';

// ABI exports
export * from './abi/accounts.js';
export * from './abi/encode.js';
export * from './abi/instructions.js';
