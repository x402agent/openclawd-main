/**
 * ClawdRouter — Tailscale integration
 *
 * Wraps the `tailscale` CLI so the router can expose itself on a Tailnet
 * (Serve) or to the public internet (Funnel) while staying bound to
 * loopback. Adapted from the OpenClaw gateway Tailscale model.
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

export type TailscaleMode = 'off' | 'serve' | 'funnel';

export interface TailscaleOptions {
  mode: TailscaleMode;
  port: number;
  resetOnExit: boolean;
}

export interface TailscaleHandle {
  mode: Exclude<TailscaleMode, 'off'>;
  url: string;
  magicDns: string;
  cleanup: () => Promise<void>;
}

// Funnel is TLS-only and restricted to 443, 8443, 10000 by Tailscale.
const FUNNEL_PORTS = new Set([443, 8443, 10000]);

export async function isTailscaleAvailable(): Promise<boolean> {
  try {
    await exec('tailscale', ['version'], { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

async function getMagicDns(): Promise<string> {
  const { stdout } = await exec('tailscale', ['status', '--json'], { timeout: 5000 });
  const json = JSON.parse(stdout) as { Self?: { DNSName?: string } };
  const dns = json.Self?.DNSName;
  if (!dns) throw new Error('Tailscale reports no DNSName for this device — is `tailscale up` completed?');
  return dns.replace(/\.$/, '');
}

export async function startTailscale(opts: TailscaleOptions): Promise<TailscaleHandle | null> {
  if (opts.mode === 'off') return null;

  if (!(await isTailscaleAvailable())) {
    throw new Error('tailscale CLI not found on PATH. Install from https://tailscale.com/download');
  }

  const magicDns = await getMagicDns();
  const publicPort = opts.mode === 'funnel' ? 443 : 443;

  if (opts.mode === 'funnel' && !FUNNEL_PORTS.has(publicPort)) {
    throw new Error(`Funnel only supports ports ${[...FUNNEL_PORTS].join(', ')}`);
  }

  const subcmd = opts.mode === 'funnel' ? 'funnel' : 'serve';
  const target = `http://127.0.0.1:${opts.port}`;

  let stderr = '';
  try {
    const res = await exec('tailscale', [subcmd, '--bg', `--https=${publicPort}`, target], { timeout: 15000 });
    stderr = res.stderr ?? '';
  } catch (err) {
    const e = err as Error & { stderr?: string; stdout?: string };
    const combined = [e.stderr, e.stdout].filter(Boolean).join('\n').trim();
    throw new Error(`tailscale ${subcmd} failed:\n${combined || e.message}`);
  }

  // tailscale exits 0 even when it refuses to apply config (e.g. HTTPS/Serve
  // not enabled on the tailnet). Detect that and forward the user prompt.
  if (/Serve is not enabled|HTTPS is not enabled|funnel is not available/i.test(stderr)) {
    throw new Error(stderr.trim());
  }

  // Verify the config actually landed.
  try {
    const status = await exec('tailscale', [subcmd, 'status', '--json'], { timeout: 5000 });
    const parsed = JSON.parse(status.stdout) as Record<string, unknown>;
    const web = (parsed as { Web?: Record<string, unknown> }).Web;
    if (!web || Object.keys(web).length === 0) {
      throw new Error(`tailscale ${subcmd} applied no config. stderr: ${stderr.trim() || '(empty)'}`);
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('tailscale ')) throw err;
    // status --json may not exist on older CLIs; soft-fail and trust the --bg call.
  }

  const url = `https://${magicDns}${publicPort === 443 ? '' : `:${publicPort}`}`;

  const cleanup = async () => {
    if (!opts.resetOnExit) return;
    try {
      await exec('tailscale', [subcmd, '--https=' + publicPort, 'off'], { timeout: 10000 });
    } catch {
      // Best-effort; user can always `tailscale serve reset` manually.
    }
  };

  return { mode: opts.mode, url, magicDns, cleanup };
}
