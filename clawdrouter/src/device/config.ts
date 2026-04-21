/**
 * ClawdRouter — device config (~/.clawd/clawdrouter/device.json)
 *
 * Written by `clawdrouter enroll <url>`; read on startup so the spoke
 * knows its API key and which hub to dial. Strict schema; rejects
 * malformed files. Never emitted to logs.
 */

import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

export interface DeviceConfig {
  apiKey: string;
  tunnelUrl: string;
  keyId?: string;
  deviceLabel?: string;
  enrolledAt: number;
}

const DEFAULT_PATH = join(homedir(), '.clawd', 'clawdrouter', 'device.json');

export function devicePath(): string {
  return process.env['CLAWDROUTER_DEVICE_PATH']?.trim() || DEFAULT_PATH;
}

export async function loadDeviceConfig(): Promise<DeviceConfig | null> {
  try {
    const raw = await readFile(devicePath(), 'utf-8');
    const parsed = JSON.parse(raw) as Partial<DeviceConfig>;
    if (!parsed.apiKey || !parsed.tunnelUrl) {
      throw new Error('apiKey and tunnelUrl are required');
    }
    return {
      apiKey: parsed.apiKey,
      tunnelUrl: parsed.tunnelUrl,
      keyId: parsed.keyId,
      deviceLabel: parsed.deviceLabel,
      enrolledAt: typeof parsed.enrolledAt === 'number' ? parsed.enrolledAt : Date.now(),
    };
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === 'ENOENT') return null;
    throw new Error(`failed to load device config at ${devicePath()}: ${(err as Error).message}`);
  }
}

export async function saveDeviceConfig(cfg: DeviceConfig): Promise<string> {
  const path = devicePath();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, JSON.stringify(cfg, null, 2) + '\n', { mode: 0o600 });
  return path;
}
