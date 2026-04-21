/**
 * ClawdRouter — `clawdrouter enroll <url>` implementation
 *
 * Fetches a one-time enrollment URL from the control plane, receives
 * the API key + tunnel URL, and writes the device config. Refuses to
 * overwrite an existing config unless `--force` is passed.
 */

import { loadDeviceConfig, saveDeviceConfig, devicePath, type DeviceConfig } from './config.js';

interface EnrollResponse {
  apiKey: string;
  tunnelUrl: string;
  deviceLabel: string | null;
  keyId: string;
}

export interface EnrollOptions {
  force?: boolean;
}

export async function enrollFromUrl(url: string, opts: EnrollOptions = {}): Promise<DeviceConfig> {
  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error('enrollment URL must start with http(s)://');
  }

  const existing = await loadDeviceConfig();
  if (existing && !opts.force) {
    throw new Error(
      `device already enrolled (config at ${devicePath()}). Use --force to overwrite.`,
    );
  }

  const res = await fetch(url, { method: 'GET', redirect: 'manual' });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`enrollment server returned ${res.status}: ${body.slice(0, 200)}`);
  }

  const payload = (await res.json()) as Partial<EnrollResponse>;
  if (!payload.apiKey || !payload.tunnelUrl) {
    throw new Error('enrollment payload missing apiKey or tunnelUrl');
  }

  const cfg: DeviceConfig = {
    apiKey: payload.apiKey,
    tunnelUrl: payload.tunnelUrl,
    keyId: payload.keyId,
    deviceLabel: payload.deviceLabel ?? undefined,
    enrolledAt: Date.now(),
  };

  await saveDeviceConfig(cfg);
  return cfg;
}
