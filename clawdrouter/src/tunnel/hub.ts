/**
 * ClawdRouter — tunnel hub (fly.dev side)
 *
 * WebSocket server that accepts persistent connections from customer-run
 * clawdrouter spokes. Each connection is authed by bearer token (verified
 * against the CF control plane via KeyVerifier), then registered by
 * tenantId so PR 4 can forward inbound HTTP requests down the tunnel.
 *
 * This PR ships: authenticated accept + tenant registry + ping/pong
 * heartbeat + graceful shutdown. Request forwarding is a later PR.
 */

import type { IncomingMessage } from 'node:http';
import type { Server as HttpServer } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocketServer, WebSocket } from 'ws';
import { decode, encode, newFrameId, type TunnelFrame } from './frames.js';
import type { KeyVerifier, VerifyOk } from './verify.js';

export interface ForwardRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string; // base64
}

export interface ForwardResponse {
  status: number;
  headers: Record<string, string>;
  body?: string; // base64
}

/**
 * Callbacks passed by the hub caller when it wants to opt-in to streaming
 * responses. If the spoke sends `res.start` for a given id, the hub calls
 * `onStart` to obtain per-chunk sinks; otherwise the call is resolved
 * normally with a single `res` frame.
 */
export interface StreamSinks {
  onChunk: (data: Buffer) => void;
  onEnd: (trailers?: Record<string, string>) => void;
}
export type StreamStartCallback = (
  status: number,
  headers: Record<string, string>,
) => StreamSinks;

interface PendingRequest {
  resolve: (res: ForwardResponse | null) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
  onStream?: StreamStartCallback;
  /** Set once `res.start` arrives; subsequent chunks feed into it. */
  sinks?: StreamSinks;
}

export interface HubOptions {
  verifier: KeyVerifier;
  path?: string;              // default: /v1/tunnel/connect
  heartbeatMs?: number;       // default: 30_000
  missedPongsToKill?: number; // default: 2
  logger?: (msg: string, meta?: Record<string, unknown>) => void;
}

export interface TunnelConnection {
  tenantId: string;
  wallet: string;
  tier: string;
  ws: WebSocket;
  connectedAt: number;
  lastPongAt: number;
  remoteAddr: string | null;
  missedPongs: number;
  pending: Map<string, PendingRequest>;
}

export class TunnelHub {
  private readonly wss: WebSocketServer;
  private readonly verifier: KeyVerifier;
  private readonly path: string;
  private readonly heartbeatMs: number;
  private readonly missedPongsToKill: number;
  private readonly log: (msg: string, meta?: Record<string, unknown>) => void;
  private readonly registry = new Map<string, TunnelConnection>();
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private closed = false;

  constructor(opts: HubOptions) {
    this.verifier = opts.verifier;
    this.path = opts.path ?? '/v1/tunnel/connect';
    this.heartbeatMs = opts.heartbeatMs ?? 30_000;
    this.missedPongsToKill = opts.missedPongsToKill ?? 2;
    this.log = opts.logger ?? ((msg, meta) => console.log(`[tunnel-hub] ${msg}`, meta ?? ''));
    this.wss = new WebSocketServer({ noServer: true });
  }

  /** Attach to an http.Server's `upgrade` event. */
  attach(server: HttpServer): void {
    server.on('upgrade', (req, socket, head) => this.onUpgrade(req, socket, head));
    this.startHeartbeat();
  }

  /** Manual handleUpgrade entry (useful in tests with a bare server). */
  async onUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer): Promise<void> {
    const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
    if (url.pathname !== this.path) {
      // Not our path — leave it alone; another handler may pick it up, or
      // node will destroy the socket on its own.
      return;
    }

    // Extract bearer before hijacking. Accept either Authorization header
    // or ?key=... for tools that can't set headers on WS.
    const authHeader = req.headers['authorization'];
    const headerKey = typeof authHeader === 'string' ? authHeader.replace(/^Bearer\s+/i, '').trim() : '';
    const queryKey = url.searchParams.get('key')?.trim() ?? '';
    const apiKey = headerKey || queryKey;
    if (!apiKey) {
      this.rejectUpgrade(socket, 401, 'Unauthorized');
      return;
    }

    const verdict = await this.verifier.verify(apiKey);
    if (!verdict.ok) {
      this.rejectUpgrade(socket, 401, `Unauthorized: ${verdict.reason}`);
      return;
    }

    this.wss.handleUpgrade(req, socket, head, (ws) => {
      this.register(ws, verdict, req);
    });
  }

  private register(ws: WebSocket, verdict: VerifyOk, req: IncomingMessage): void {
    const existing = this.registry.get(verdict.tenantId);
    if (existing) {
      // Evict the stale connection — last-writer wins. Customers with
      // multiple devices should use distinct API keys.
      this.log('evicting_stale_tunnel', { tenantId: verdict.tenantId });
      try {
        this.sendFrame(existing.ws, {
          t: 'err',
          code: 'replaced',
          message: 'tunnel replaced by a new connection with the same tenantId',
        });
        existing.ws.close(1012, 'replaced');
      } catch {
        /* ignore */
      }
      this.registry.delete(verdict.tenantId);
    }

    const conn: TunnelConnection = {
      tenantId: verdict.tenantId,
      wallet: verdict.wallet,
      tier: verdict.tier,
      ws,
      connectedAt: Date.now(),
      lastPongAt: Date.now(),
      remoteAddr: normalizeRemote(req),
      missedPongs: 0,
      pending: new Map(),
    };
    this.registry.set(verdict.tenantId, conn);
    this.log('tunnel_connected', {
      tenantId: conn.tenantId,
      wallet: conn.wallet,
      tier: conn.tier,
      remoteAddr: conn.remoteAddr,
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        this.sendFrame(ws, { t: 'err', code: 'binary_not_supported', message: 'frames must be JSON text' });
        return;
      }
      let frame: TunnelFrame;
      try {
        frame = decode(data as Buffer);
      } catch (err) {
        this.sendFrame(ws, { t: 'err', code: 'bad_frame', message: (err as Error).message });
        return;
      }
      this.handleFrame(conn, frame);
    });

    ws.on('close', (code, reason) => {
      if (this.registry.get(conn.tenantId) === conn) {
        this.registry.delete(conn.tenantId);
      }
      // Fail all inflight requests — caller should not hang forever.
      for (const p of conn.pending.values()) {
        clearTimeout(p.timer);
        p.reject(new Error('tunnel_closed'));
      }
      conn.pending.clear();
      this.log('tunnel_closed', {
        tenantId: conn.tenantId,
        code,
        reason: reason.toString('utf8').slice(0, 200),
      });
    });

    ws.on('error', (err) => {
      this.log('tunnel_error', { tenantId: conn.tenantId, error: err.message });
    });

    // Send an initial hello so the spoke knows it's connected + authed.
    this.sendFrame(ws, {
      t: 'err', // reuse — no dedicated hello frame yet. Keep "ok" as a non-blocking notice.
      code: 'hello',
      message: JSON.stringify({ tenantId: verdict.tenantId, tier: verdict.tier, heartbeatMs: this.heartbeatMs }),
    });
  }

  private handleFrame(conn: TunnelConnection, frame: TunnelFrame): void {
    switch (frame.t) {
      case 'pong':
        conn.lastPongAt = Date.now();
        conn.missedPongs = 0;
        break;
      case 'ping':
        this.sendFrame(conn.ws, { t: 'pong', ts: frame.ts });
        break;
      case 'res': {
        const pending = conn.pending.get(frame.id);
        if (!pending) {
          this.log('unsolicited_res', { tenantId: conn.tenantId, id: frame.id });
          return;
        }
        if (pending.sinks) {
          // Caller already transitioned to streaming but spoke closed with a
          // single `res` — surface as an error so the HTTP client doesn't hang.
          pending.sinks.onEnd();
        }
        conn.pending.delete(frame.id);
        clearTimeout(pending.timer);
        pending.resolve({ status: frame.status, headers: frame.headers, body: frame.body });
        break;
      }
      case 'res.start': {
        const pending = conn.pending.get(frame.id);
        if (!pending) {
          this.log('unsolicited_stream_start', { tenantId: conn.tenantId, id: frame.id });
          return;
        }
        if (!pending.onStream) {
          // Caller didn't opt in to streaming but spoke is streaming anyway.
          // Fail the request instead of buffering (unbounded memory risk).
          conn.pending.delete(frame.id);
          clearTimeout(pending.timer);
          pending.reject(new Error('spoke_streamed_but_caller_did_not_opt_in'));
          return;
        }
        pending.sinks = pending.onStream(frame.status, frame.headers);
        // Keep pending alive; forward() resolves only on res.end.
        break;
      }
      case 'res.chunk': {
        const pending = conn.pending.get(frame.id);
        if (!pending?.sinks) return;
        pending.sinks.onChunk(Buffer.from(frame.data, 'base64'));
        break;
      }
      case 'res.end': {
        const pending = conn.pending.get(frame.id);
        if (!pending) return;
        pending.sinks?.onEnd(frame.trailers);
        conn.pending.delete(frame.id);
        clearTimeout(pending.timer);
        pending.resolve(null);
        break;
      }
      case 'req':
        // Spokes don't send unsolicited requests up to the hub in v1.
        this.sendFrame(conn.ws, {
          t: 'err',
          id: frame.id,
          code: 'req_not_allowed',
          message: 'hub does not accept spoke-originated requests',
        });
        break;
      case 'err':
        this.log('spoke_error', { tenantId: conn.tenantId, code: frame.code, message: frame.message });
        break;
      default:
        // Exhaustive — unreachable if decoder is consistent.
        this.log('unhandled_frame', { tenantId: conn.tenantId });
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) return;
    this.heartbeatTimer = setInterval(() => {
      if (this.closed) return;
      const now = Date.now();
      for (const conn of this.registry.values()) {
        if (conn.ws.readyState !== WebSocket.OPEN) continue;
        if (now - conn.lastPongAt > this.heartbeatMs * (this.missedPongsToKill + 1)) {
          this.log('tunnel_dead_on_heartbeat', { tenantId: conn.tenantId });
          try { conn.ws.terminate(); } catch { /* ignore */ }
          this.registry.delete(conn.tenantId);
          continue;
        }
        conn.missedPongs += 1;
        this.sendFrame(conn.ws, { t: 'ping', ts: now });
      }
    }, this.heartbeatMs);
    // Don't keep the event loop alive just for heartbeats.
    this.heartbeatTimer.unref?.();
  }

  /** Graceful shutdown. Notifies spokes, closes sockets, stops heartbeat. */
  async close(): Promise<void> {
    this.closed = true;
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    const closers: Promise<void>[] = [];
    for (const conn of this.registry.values()) {
      closers.push(
        new Promise<void>((resolve) => {
          try {
            this.sendFrame(conn.ws, { t: 'err', code: 'shutdown', message: 'hub shutting down' });
            conn.ws.close(1001, 'going away');
            conn.ws.once('close', () => resolve());
            setTimeout(resolve, 2000).unref?.();
          } catch {
            resolve();
          }
        }),
      );
    }
    this.registry.clear();
    await Promise.all(closers);
    await new Promise<void>((resolve) => this.wss.close(() => resolve()));
  }

  // ── Telemetry / ops ──────────────────────────────────────────────

  stats(): { connected: number; tenants: string[]; verifierCacheSize: number } {
    return {
      connected: this.registry.size,
      tenants: [...this.registry.keys()],
      verifierCacheSize: this.verifier.size(),
    };
  }

  /** Lookup a live tunnel by tenantId. */
  get(tenantId: string): TunnelConnection | undefined {
    return this.registry.get(tenantId);
  }

  /**
   * Forward an HTTP request down a tunnel and await the response frame.
   * Returns `null` if no tunnel is connected for that tenant; caller
   * should surface a 503 tunnel-offline.
   */
  /**
   * Forward an HTTP request over the tunnel.
   *
   * - Non-streaming (default): resolves with a full `ForwardResponse` on `res` frame.
   * - Streaming (when `opts.onStream` is passed): the hub calls `opts.onStream`
   *   on `res.start`; chunks arrive via the returned `StreamSinks.onChunk`;
   *   the promise resolves with `null` when the stream ends. If the spoke
   *   sends a single `res` frame anyway (non-streaming upstream), the promise
   *   resolves with that response and onStream is never called.
   */
  async forward(
    tenantId: string,
    req: ForwardRequest,
    opts: { timeoutMs?: number; onStream?: StreamStartCallback } = {},
  ): Promise<ForwardResponse | null> {
    const conn = this.registry.get(tenantId);
    if (!conn || conn.ws.readyState !== WebSocket.OPEN) return null;
    const id = newFrameId();
    const timeoutMs = opts.timeoutMs ?? 30_000;
    return new Promise<ForwardResponse | null>((resolve, reject) => {
      const timer = setTimeout(() => {
        const p = conn.pending.get(id);
        if (p?.sinks) {
          // Stream in progress — signal end instead of hanging the HTTP client.
          p.sinks.onEnd();
        }
        conn.pending.delete(id);
        reject(new Error('tunnel_request_timeout'));
      }, timeoutMs);
      timer.unref?.();
      conn.pending.set(id, { resolve, reject, timer, onStream: opts.onStream });
      this.sendFrame(conn.ws, {
        t: 'req',
        id,
        method: req.method,
        path: req.path,
        headers: req.headers,
        body: req.body,
      });
    });
  }

  // ── Internals ────────────────────────────────────────────────────

  private sendFrame(ws: WebSocket, frame: TunnelFrame): void {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(encode(frame));
    } catch (err) {
      this.log('send_failed', { error: (err as Error).message });
    }
  }

  private rejectUpgrade(socket: Duplex, status: number, reason: string): void {
    const head = `HTTP/1.1 ${status} ${reason}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n`;
    try {
      socket.write(head);
    } finally {
      socket.destroy();
    }
  }
}

function normalizeRemote(req: IncomingMessage): string | null {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0]!.trim();
  return req.socket.remoteAddress ?? null;
}
