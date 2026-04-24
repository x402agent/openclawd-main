import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, platform } from 'node:os';
import { spawn } from 'node:child_process';

const OPENROUTER_AUTH_URL = 'https://openrouter.ai/auth';
const OPENROUTER_KEYS_URL = 'https://openrouter.ai/api/v1/auth/keys';

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
    // fall through — user can paste URL manually
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
    // best effort on non-POSIX platforms
  }
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

/**
 * Start a localhost callback server, open the browser to OpenRouter's OAuth flow,
 * wait for the code, exchange it for an API key, and return the key.
 */
export async function loginWithOAuth(options: { timeoutMs?: number } = {}): Promise<string> {
  const verifier = generateCodeVerifier();
  const challenge = codeChallenge(verifier);
  const timeoutMs = options.timeoutMs ?? 5 * 60 * 1000;

  return new Promise<string>((resolve, reject) => {
    let resolved = false;
    const server = createServer(async (req, res) => {
      if (!req.url) return;
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname !== '/callback') {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
      const code = url.searchParams.get('code');
      if (!code) {
        res.statusCode = 400;
        res.end('Missing ?code parameter');
        return;
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(
        '<!doctype html><meta charset="utf-8"><title>OpenClawd</title>' +
          '<style>body{font-family:system-ui;background:#0b0b0b;color:#f5f5f5;display:grid;place-items:center;height:100vh;margin:0}</style>' +
          '<main><h1>🦞 Connected</h1><p>You can close this tab and return to the terminal.</p></main>',
      );
      try {
        const key = await exchangeCodeForKey(code, verifier);
        resolved = true;
        server.close();
        resolve(key);
      } catch (err) {
        resolved = true;
        server.close();
        reject(err);
      }
    });

    server.on('error', (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to bind OAuth callback port'));
        return;
      }
      const callbackUrl = `http://127.0.0.1:${address.port}/callback`;
      const authUrl = new URL(OPENROUTER_AUTH_URL);
      authUrl.searchParams.set('callback_url', callbackUrl);
      authUrl.searchParams.set('code_challenge', challenge);
      authUrl.searchParams.set('code_challenge_method', 'S256');

      process.stderr.write(`\nOpen this URL to connect OpenRouter:\n  ${authUrl.toString()}\n\n`);
      openBrowser(authUrl.toString());
    });

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        server.close();
        reject(new Error('OAuth login timed out'));
      }
    }, timeoutMs);
  });
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
