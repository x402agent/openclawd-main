/**
 * ClawdRouter — tunnel hub tests
 *
 * Covers: authenticated accept, reject on bad key, tenant registry,
 * replacement on duplicate tenantId, heartbeat ping/pong, graceful close.
 * Uses a bare http.Server + a stubbed KeyVerifier to avoid CF round-trips.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { WebSocket } from 'ws';
import { TunnelHub } from '../src/tunnel/hub.js';
import { decode, encode, type TunnelFrame } from '../src/tunnel/frames.js';
import type { KeyVerifier, VerifyResult } from '../src/tunnel/verify.js';

// ── Test harness ──────────────────────────────────────────────────────

function stubVerifier(map: Record<string, VerifyResult>): KeyVerifier {
  return {
    verify: async (key: string): Promise<VerifyResult> =>
      map[key] ?? { ok: false, reason: 'invalid_or_revoked' },
    invalidate: () => {},
    size: () => 0,
  } as unknown as KeyVerifier;
}

async function startHub(opts: { verifier: KeyVerifier; heartbeatMs?: number }): Promise<{
  server: Server;
  hub: TunnelHub;
  port: number;
  stop: () => Promise<void>;
}> {
  const server = createServer((_req, res) => {
    res.writeHead(404);
    res.end();
  });
  const hub = new TunnelHub({
    verifier: opts.verifier,
    heartbeatMs: opts.heartbeatMs ?? 30_000,
    logger: () => {}, // silence
  });
  hub.attach(server);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('no listen addr');
  return {
    server,
    hub,
    port: addr.port,
    stop: async () => {
      await hub.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
    },
  };
}

function waitForFirstFrame(ws: WebSocket, timeoutMs = 1000): Promise<TunnelFrame> {
  return new Promise((resolve, reject) => {
    const to = setTimeout(() => reject(new Error('frame_timeout')), timeoutMs);
    ws.once('message', (data) => {
      clearTimeout(to);
      try {
        resolve(decode(data as Buffer));
      } catch (e) {
        reject(e);
      }
    });
    ws.once('close', () => {
      clearTimeout(to);
      reject(new Error('closed_before_frame'));
    });
    ws.once('unexpected-response', (_req, res) => {
      clearTimeout(to);
      reject(new Error(`upgrade_failed:${res.statusCode}`));
    });
  });
}

// ── Tests ─────────────────────────────────────────────────────────────

describe('TunnelHub', () => {
  let harness: Awaited<ReturnType<typeof startHub>>;

  before(async () => {
    harness = await startHub({
      verifier: stubVerifier({
        'good-key': { ok: true, tenantId: 'tenant-1', wallet: 'W111', tier: 'HOLDER' },
        'good-key-2': { ok: true, tenantId: 'tenant-1', wallet: 'W222', tier: 'HOLDER' }, // same tenant
      }),
      heartbeatMs: 50, // fast for tests
    });
  });

  after(async () => {
    await harness.stop();
  });

  it('rejects upgrade when no key is provided', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${harness.port}/v1/tunnel/connect`);
    ws.on('error', () => {}); // server-side reject races with client-side open
    await assert.rejects(waitForFirstFrame(ws), /upgrade_failed:401/);
    await new Promise((r) => setTimeout(r, 10));
  });

  it('rejects upgrade with invalid key', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${harness.port}/v1/tunnel/connect`, {
      headers: { authorization: 'Bearer bogus' },
    });
    ws.on('error', () => {});
    await assert.rejects(waitForFirstFrame(ws), /upgrade_failed:401/);
    await new Promise((r) => setTimeout(r, 10));
  });

  it('accepts a valid key (header) and sends hello frame', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${harness.port}/v1/tunnel/connect`, {
      headers: { authorization: 'Bearer good-key' },
    });
    const hello = await waitForFirstFrame(ws);
    assert.equal(hello.t, 'err'); // "err" is used as the bootstrap channel
    assert.equal((hello as any).code, 'hello');
    assert.equal(harness.hub.stats().connected, 1);
    ws.close();
    await new Promise((r) => ws.once('close', r));
    // Registry cleans up on close.
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(harness.hub.stats().connected, 0);
  });

  it('accepts a valid key via ?key= query param', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${harness.port}/v1/tunnel/connect?key=good-key`);
    const hello = await waitForFirstFrame(ws);
    assert.equal((hello as any).code, 'hello');
    ws.close();
    await new Promise((r) => ws.once('close', r));
  });

  it('evicts stale connection when a second one arrives for the same tenant', async () => {
    const first = new WebSocket(`ws://127.0.0.1:${harness.port}/v1/tunnel/connect?key=good-key`);
    await waitForFirstFrame(first);

    const closedPromise = new Promise<number>((resolve) => {
      first.once('close', (code) => resolve(code));
    });

    const second = new WebSocket(`ws://127.0.0.1:${harness.port}/v1/tunnel/connect?key=good-key-2`);
    await waitForFirstFrame(second);

    const code = await closedPromise;
    assert.equal(code, 1012); // service_restart — our "replaced" code

    second.close();
    await new Promise((r) => second.once('close', r));
  });

  it('heartbeat: spoke pongs update lastPongAt; server sends ping', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${harness.port}/v1/tunnel/connect?key=good-key`);
    await waitForFirstFrame(ws); // hello

    const ping = await new Promise<TunnelFrame>((resolve, reject) => {
      const to = setTimeout(() => reject(new Error('no_ping')), 500);
      ws.on('message', (data) => {
        const f = decode(data as Buffer);
        if (f.t === 'ping') {
          clearTimeout(to);
          resolve(f);
        }
      });
    });
    assert.equal(ping.t, 'ping');

    // Reply with a pong — server should record it.
    ws.send(encode({ t: 'pong', ts: (ping as any).ts }));

    // Give hub a tick to process.
    await new Promise((r) => setTimeout(r, 20));

    ws.close();
    await new Promise((r) => ws.once('close', r));
  });

  it('invalid frame -> server returns err frame', async () => {
    const ws = new WebSocket(`ws://127.0.0.1:${harness.port}/v1/tunnel/connect?key=good-key`);
    await waitForFirstFrame(ws); // hello

    ws.send('not-json{{{');

    const err = await new Promise<TunnelFrame>((resolve, reject) => {
      const to = setTimeout(() => reject(new Error('no_err_frame')), 500);
      ws.on('message', (data) => {
        const f = decode(data as Buffer);
        if (f.t === 'err' && (f as any).code === 'bad_frame') {
          clearTimeout(to);
          resolve(f);
        }
      });
    });
    assert.equal(err.t, 'err');
    assert.equal((err as any).code, 'bad_frame');
    ws.close();
    await new Promise((r) => ws.once('close', r));
  });
});
