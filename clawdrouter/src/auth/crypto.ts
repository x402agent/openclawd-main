/**
 * Crypto helpers for wallet-signed auth and API key minting.
 *
 * Ed25519 verification uses Workers' native Web Crypto `Ed25519` algorithm
 * (available since runtime 2023-11-06, well before our compat date). No npm
 * crypto libraries needed.
 */

// Minimal base58 — we can't pull in the bs58 package from a Worker without
// bundling concerns, and base58 is tiny. Kept local to keep the Worker
// bundle lean.
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function base58Decode(input: string): Uint8Array {
  if (!input) return new Uint8Array();
  const map: Record<string, number> = {};
  for (let i = 0; i < BASE58_ALPHABET.length; i++) map[BASE58_ALPHABET[i]!] = i;

  let zeros = 0;
  while (zeros < input.length && input[zeros] === '1') zeros++;

  const digits: number[] = [];
  for (let i = zeros; i < input.length; i++) {
    const char = input[i];
    if (char === undefined || !(char in map)) {
      throw new Error(`invalid_base58_char:${char}`);
    }
    let carry = map[char]!;
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j]! * 58;
      digits[j] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      digits.push(carry & 0xff);
      carry >>= 8;
    }
  }

  const bytes = new Uint8Array(zeros + digits.length);
  for (let i = 0; i < digits.length; i++) {
    bytes[zeros + digits.length - 1 - i] = digits[i]!;
  }
  return bytes;
}

export function base64UrlDecode(input: string): Uint8Array {
  const pad = input.length % 4;
  const padded = pad ? input + '='.repeat(4 - pad) : input;
  const normal = padded.replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(normal);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * Verify a Solana wallet signature over a UTF-8 message.
 *
 * @param walletAddress  base58 Solana public key (32 bytes)
 * @param message        plain UTF-8 string the wallet signed
 * @param signatureB58   base58 of the 64-byte Ed25519 signature
 */
export async function verifySolanaSignature(
  walletAddress: string,
  message: string,
  signatureB58: string,
): Promise<boolean> {
  try {
    const pubkey = base58Decode(walletAddress);
    if (pubkey.length !== 32) return false;
    const sig = base58Decode(signatureB58);
    if (sig.length !== 64) return false;

    const key = await crypto.subtle.importKey(
      'raw',
      pubkey,
      { name: 'Ed25519' },
      false,
      ['verify'],
    );
    const msgBytes = new TextEncoder().encode(message);
    return await crypto.subtle.verify({ name: 'Ed25519' }, key, sig, msgBytes);
  } catch {
    return false;
  }
}

export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest('SHA-256', bytes);
  const arr = new Uint8Array(buf);
  return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

const KEY_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateApiKey(): { key: string; prefix: string; id: string } {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  let body = '';
  for (const byte of bytes) body += KEY_ALPHABET[byte % KEY_ALPHABET.length];
  const key = `ck_live_${body}`;
  const prefix = `ck_live_${body.slice(0, 6)}`;
  const idBytes = new Uint8Array(12);
  crypto.getRandomValues(idBytes);
  let id = '';
  for (const byte of idBytes) id += KEY_ALPHABET[byte % KEY_ALPHABET.length];
  return { key, prefix, id };
}

export function randomNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function buildChallengeMessage(
  action: string,
  wallet: string,
  nonce: string,
  expiresAt: number,
): string {
  // Human-readable so wallet UIs display something meaningful. Order and
  // exact spacing matter — the client re-signs this, not the JSON blob.
  return [
    'ClawdRouter API',
    `action: ${action}`,
    `wallet: ${wallet}`,
    `nonce: ${nonce}`,
    `expires: ${new Date(expiresAt).toISOString()}`,
  ].join('\n');
}
