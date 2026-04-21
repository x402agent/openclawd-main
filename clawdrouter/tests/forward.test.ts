/**
 * ClawdRouter — end-to-end tunnel forward test
 *
 * Wires a TunnelHub + TunnelSpoke through a bare http.Server so a
 * `hub.forward()` call actually traverses the WS, hits the spoke's
 * handler, and returns a real response. Uses a stubbed KeyVerifier —
 * no network round-trips.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import { TunnelHub } from '../src/tunnel/hub.js';
import { TunnelSpoke, type SpokeHttpRequest, type StreamSender } from '../src/tunnel/spoke.js';
import type { KeyVerifier, VerifyResult } from '../src/tunnel/verify.js';

function stubVerifier(map: Record<string, VerifyResult>): KeyVerifier {
  return {
    verify: async (k: string): Promise<VerifyResult> => map[k] ?? { ok: false, reason: 'invalid_or_revoked' },
    invalidate: () => {},
    size: () => 0,
  } as unknown as KeyVerifier;
}

describe('Tunnel end-to-end forward', () => {
  let server: Server;
  let hub: TunnelHub;
  let spoke: TunnelSpoke;
  let handlerCalls = 0;

  before(async () => {
    server = createServer((_req, res) => { res.writeHead(404); res.end(); });
    hub = new TunnelHub({
      verifier: stubVerifier({ 'k1': { ok: true, tenantId: 'T1', wallet: 'W', tier: 'HOLDER' } }),
      heartbeatMs: 10_000,
      logger: () => {},
    });
    hub.attach(server);
    await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
    const addr = server.address();
    if (!addr || typeof addr === 'string') throw new Error('no addr');
    const port = addr.port;

    const spokeHandler = async (req: SpokeHttpRequest, send: StreamSender): Promise<void> => {
      handlerCalls += 1;
      if (req.method === 'GET' && req.path === '/v1/local/ping') {
        send.respond(
          200,
          { 'content-type': 'application/json', 'x-hello': 'from-spoke' },
          Buffer.from(JSON.stringify({ pong: true, received: req.headers }), 'utf8'),
        );
        return;
      }
      if (req.method === 'POST' && req.path === '/v1/local/echo') {
        send.respond(200, { 'content-type': 'application/octet-stream' }, req.body ?? Buffer.alloc(0));
        return;
      }
      // Streaming endpoint — emits 3 chunks over ~30ms.
      if (req.method === 'GET' && req.path === '/v1/local/stream') {
        send.start(200, { 'content-type': 'text/event-stream' });
        for (const word of ['hello', ' ', 'world']) {
          await new Promise((r) => setTimeout(r, 5));
          send.chunk(Buffer.from(word, 'utf8'));
        }
        send.end();
        return;
      }
      send.respond(404, {}, Buffer.from('not_found', 'utf8'));
    };

    spoke = new TunnelSpoke({
      tunnelUrl: `ws://127.0.0.1:${port}/v1/tunnel/connect`,
      apiKey: 'k1',
      handler: spokeHandler,
      heartbeatMs: 10_000,
      logger: () => {},
    });
    spoke.start();

    // Wait for spoke → hub handshake.
    await new Promise<void>((resolve, reject) => {
      const to = setTimeout(() => reject(new Error('spoke_not_connected')), 2000);
      const iv = setInterval(() => {
        if (hub.stats().connected === 1 && spoke.isConnected()) {
          clearTimeout(to); clearInterval(iv); resolve();
        }
      }, 20);
    });
  });

  after(async () => {
    await spoke.stop();
    await hub.close();
    await new Promise<void>((r) => server.close(() => r()));
  });

  it('forwards a GET and returns body + headers', async () => {
    const res = await hub.forward('T1', {
      method: 'GET',
      path: '/v1/local/ping',
      headers: { 'x-client': 'test' },
    });
    assert.ok(res);
    assert.equal(res!.status, 200);
    assert.equal(res!.headers['x-hello'], 'from-spoke');
    const body = JSON.parse(Buffer.from(res!.body ?? '', 'base64').toString('utf8'));
    assert.equal(body.pong, true);
    assert.equal(body.received['x-client'], 'test');
  });

  it('forwards a POST with binary body intact', async () => {
    const payload = Buffer.from([0, 1, 2, 3, 0xff, 0xfe, 0xfd]);
    const res = await hub.forward('T1', {
      method: 'POST',
      path: '/v1/local/echo',
      headers: { 'content-type': 'application/octet-stream' },
      body: payload.toString('base64'),
    });
    assert.ok(res);
    assert.equal(res!.status, 200);
    const echoed = Buffer.from(res!.body ?? '', 'base64');
    assert.deepEqual([...echoed], [...payload]);
  });

  it('returns null when no tunnel for tenant', async () => {
    const res = await hub.forward('T-missing', {
      method: 'GET',
      path: '/v1/local/ping',
      headers: {},
    });
    assert.equal(res, null);
  });

  it('streams chunks end-to-end through the tunnel', async () => {
    const received: Buffer[] = [];
    let seenStatus: number | undefined;
    let ended = false;
    const res = await hub.forward(
      'T1',
      { method: 'GET', path: '/v1/local/stream', headers: {} },
      {
        onStream: (status, _headers) => {
          seenStatus = status;
          return {
            onChunk: (data) => { received.push(data); },
            onEnd: () => { ended = true; },
          };
        },
      },
    );
    assert.equal(res, null); // forward resolved because stream ended
    assert.equal(seenStatus, 200);
    assert.equal(ended, true);
    assert.equal(Buffer.concat(received).toString('utf8'), 'hello world');
    assert.ok(received.length >= 2, `expected multiple chunks, got ${received.length}`);
  });

  it('handler errors surface as 500 through the tunnel', async () => {
    const badHandler = async (_req: SpokeHttpRequest, _send: StreamSender): Promise<void> => {
      throw new Error('kaboom');
    };
    const badSpoke = new TunnelSpoke({
      tunnelUrl: (spoke as unknown as { opts: { tunnelUrl: string } }).opts.tunnelUrl,
      apiKey: 'k1',
      handler: badHandler,
      heartbeatMs: 10_000,
      logger: () => {},
    });
    badSpoke.start();
    // Wait for replacement handshake (same tenantId evicts prior).
    await new Promise((r) => setTimeout(r, 200));
    const res = await hub.forward('T1', { method: 'GET', path: '/x', headers: {} });
    assert.ok(res);
    assert.equal(res!.status, 500);
    const body = JSON.parse(Buffer.from(res!.body ?? '', 'base64').toString('utf8'));
    assert.equal(body.error, 'handler_error');
    await badSpoke.stop();
    // Restart the good spoke for any later tests/cleanup.
    spoke.start();
    await new Promise<void>((resolve) => {
      const iv = setInterval(() => {
        if (spoke.isConnected()) { clearInterval(iv); resolve(); }
      }, 20);
      setTimeout(() => { clearInterval(iv); resolve(); }, 2000).unref?.();
    });
  });

  it('counts handler invocations', async () => {
    assert.ok(handlerCalls >= 2);
  });
});
