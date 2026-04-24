import { createHash, randomBytes } from 'node:crypto';
import { createInterface } from 'node:readline';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { spawn } from 'node:child_process';

const OPENROUTER_AUTH_URL = 'https://openrouter.ai/auth';
const OPENROUTER_KEYS_URL = 'https://openrouter.ai/api/v1/auth/keys';
const CALLBACK_URL = 'https://solanaclawd.com/auth/callback';

function getKeyFilePath(): string {
  const xdg = process.env.XDG_CONFIG_HOME;
  const base = xdg && xdg.trim() ? xdg : join(homedir(), '.config');
  return join(base, 'openclawd', 'openrouter-key');
}

function base64UrlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(32));
}

function codeChallenge(verifier: string): string {
  return base64UrlEncode(createHash('sha256').update(verifier).digest());
}

function openBrowser(url: string): void {
  const cmd = platform() === 'darwin' ? 'open' : platform() === 'win32' ? 'start' : 'xdg-open';
  try {
    spawn(cmd, [url], { stdio: 'ignore', detached: true }).unref();
  } catch {
    // best effort — user can paste URL manually
  }
}

export function readStoredKey(): string | null {
  const path = getKeyFilePath();
  if (!existsSync(path)) return null;
  try {
    const raw = readFileSync(path, 'utf-8').trim();
    return raw || null;
  } catch {
    return null;
  }
}

export function writeStoredKey(key: string): void {
  const path = getKeyFilePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, key, 'utf-8');
  try {
    chmodSync(path, 0o600);
  } catch {
    // non-POSIX platforms
  }
}

export function clearStoredKey(): void {
  const path = getKeyFilePath();
  if (existsSync(path)) writeFileSync(path, '', 'utf-8');
}

async function exchangeCodeForKey(code: string, codeVerifier: string): Promise<string> {
  const res = await fetch(OPENROUTER_KEYS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      code_verifier: codeVerifier,
      code_challenge_method: 'S256',
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenRouter key exchange failed (${res.status}): ${body}`);
  }
  const data = (await res.json()) as { key?: string; user_id?: string };
  if (!data.key) throw new Error('OpenRouter exchange returned no key');
  return data.key;
}

function promptForCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Paste the code shown in the browser: ', (answer) => {
      rl.close();
      const trimmed = answer.trim();
      if (!trimmed) {
        reject(new Error('No code entered'));
        return;
      }
      resolve(trimmed);
    });
  });
}

/**
 * Web-callback OAuth flow. The CLI opens OpenRouter's authorize page pointing
 * at https://solanaclawd.com/auth/callback. That page must render the `code`
 * query parameter back to the user so they can paste it into the terminal.
 * The CLI then exchanges {code, code_verifier} for an API key client-side —
 * the verifier never leaves this process, so PKCE is preserved.
 */
export async function loginWithOAuth(): Promise<string> {
  const verifier = generateCodeVerifier();
  const challenge = codeChallenge(verifier);

  const authUrl = new URL(OPENROUTER_AUTH_URL);
  authUrl.searchParams.set('callback_url', CALLBACK_URL);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');

  process.stderr.write('\n');
  process.stderr.write('Opening OpenRouter sign-in…\n');
  process.stderr.write(`If it does not open, paste this URL into a browser:\n  ${authUrl.toString()}\n\n`);
  openBrowser(authUrl.toString());

  const code = await promptForCode();
  return exchangeCodeForKey(code, verifier);
}

/**
 * Resolve an OpenRouter API key: env → stored file → OAuth login.
 */
export async function resolveApiKey(options: { forceLogin?: boolean } = {}): Promise<string> {
  if (!options.forceLogin) {
    const envKey = process.env.OPENROUTER_API_KEY?.trim();
    if (envKey) return envKey;
    const stored = readStoredKey();
    if (stored) return stored;
  }
  const key = await loginWithOAuth();
  writeStoredKey(key);
  return key;
}
