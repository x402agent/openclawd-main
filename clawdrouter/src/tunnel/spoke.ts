/**
 * ClawdRouter — tunnel spoke (customer-run side)
 *
 * Opens a persistent WebSocket to the hub, keeps it alive with
 * ping/pong, and dispatches inbound `req` frames into a caller-supplied
 * HTTP handler. Reconnects with exponential backoff. Single file; no
 * external deps beyond `ws` and the shared frames module.
 */

import { WebSocket } from 'ws';
import { decode, encode, type TunnelFrame, type ReqFrame } from './frames.js';

export interface SpokeHttpRequest {
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: Buffer;
}

export interface SpokeHttpResponse {
  status: number;
  headers: Record<string, string>;
  body?: Buffer;
}

/**
 * Handler-side response writer. Exactly one of the two flows should be used:
 *
 *   - `respond(status, headers, body?)` — single-shot. Sends `res` frame.
 *   - `start(status, headers)` + many `chunk(buf)` + `end(trailers?)` —
 *     streaming. Sends `res.start` + N × `res.chunk` + `res.end`.
 *
 * A second call to any method after the response is closed is a no-op. The
 * spoke uses this to decide the wire framing without the handler having to
 * know about frames.
 */
export interface StreamSender {
  respond(status: number, headers: Record<string, string>, body?: Buffer): void;
  start(status: number, headers: Record<string, string>): void;
  chunk(data: Buffer): void;
  end(trailers?: Record<string, string>): void;
  /** True once respond/end has been called. */
  readonly closed: boolean;
}

export type SpokeHandler = (req: SpokeHttpRequest, send: StreamSender) => Promise<void>;

export interface SpokeOptions {
  tunnelUrl: string;      // wss://<hub>/v1/tunnel/connect
  apiKey: string;
  handler: SpokeHandler;
  heartbeatMs?: number;   // default: 30_000
  minBackoffMs?: number;  // default: 1_000
  maxBackoffMs?: number;  // default: 60_000
  logger?: (msg: string, meta?: Record<string, unknown>) => void;
  onConnect?: (hello: Record<string, unknown>) => void;
}

export class TunnelSpoke {
  private readonly opts: SpokeOptions;
  private readonly log: (msg: string, meta?: Record<string, unknown>) => void;
  private ws: WebSocket | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private backoffMs: number;
  private stopped = false;
  private lastHelloAt = 0;

  constructor(opts: SpokeOptions) {
    this.opts = opts;
    this.log = opts.logger ?? ((msg, meta) => console.log(`[tunnel-spoke] ${msg}`, meta ?? ''));
    this.backoffMs = opts.minBackoffMs ?? 1_000;
  }

  /** Open the tunnel and keep it open until stop() is called. */
  start(): void {
    this.stopped = false;
    this.connect();
  }

  async stop(): Promise<void> {
    this.stopped = true;
    if (this.reconnectTimer) { clearTimeout(this.reconnectTimer); this.reconnectTimer = null; }
    if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null; }
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(1000, 'client_stop');
      await new Promise<void>((r) => {
        const to = setTimeout(r, 500);
        this.ws!.once('close', () => { clearTimeout(to); r(); });
      });
    }
    this.ws = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN && this.lastHelloAt > 0;
  }

  private connect(): void {
    this.log('connecting', { url: this.opts.tunnelUrl });
    const ws = new WebSocket(this.opts.tunnelUrl, {
      headers: { authorization: `Bearer ${this.opts.apiKey}` },
    });
    this.ws = ws;

    ws.on('unexpected-response', (_req, res) => {
      this.log('rejected', { status: res.statusCode, message: res.statusMessage });
      // 401 = bad key. Don't retry aggressively on that; still backoff so
      // operator has time to fix. Non-401 is treated as a transient error.
      this.scheduleReconnect(res.statusCode === 401);
    });

    ws.on('open', () => {
      this.backoffMs = this.opts.minBackoffMs ?? 1_000;
      this.startHeartbeat();
    });

    ws.on('message', (data, isBinary) => {
      if (isBinary) return;
      let frame: TunnelFrame;
      try {
        frame = decode(data as Buffer);
      } catch (err) {
        this.log('bad_frame_from_hub', { error: (err as Error).message });
        return;
      }
      this.handleFrame(frame).catch((err) => {
        this.log('handler_error', { error: (err as Error).message });
      });
    });

    ws.on('close', (code, reason) => {
      this.log('closed', { code, reason: reason.toString('utf8').slice(0, 200) });
      this.stopHeartbeat();
      this.lastHelloAt = 0;
      this.ws = null;
      if (!this.stopped) this.scheduleReconnect(false);
    });

    ws.on('error', (err) => {
      this.log('ws_error', { error: err.message });
      // close handler will fire after and trigger reconnect.
    });
  }

  private scheduleReconnect(authFailure: boolean): void {
    if (this.stopped) return;
    if (this.reconnectTimer) return;
    const delay = authFailure
      ? Math.min(this.opts.maxBackoffMs ?? 60_000, 30_000) // auth failures backoff harder
      : this.backoffMs;
    this.log('reconnect_in', { ms: delay });
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.backoffMs = Math.min(this.opts.maxBackoffMs ?? 60_000, this.backoffMs * 2);
      this.connect();
    }, delay);
    this.reconnectTimer.unref?.();
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    const interval = this.opts.heartbeatMs ?? 30_000;
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({ t: 'ping', ts: Date.now() });
      }
    }, interval);
    this.pingTimer.unref?.();
  }

  private stopHeartbeat(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  private async handleFrame(frame: TunnelFrame): Promise<void> {
    switch (frame.t) {
      case 'ping':
        this.send({ t: 'pong', ts: frame.ts });
        return;
      case 'pong':
        return; // lib-internal health, no state
      case 'err':
        if (frame.code === 'hello') {
          this.lastHelloAt = Date.now();
          try {
            const meta = JSON.parse(frame.message) as Record<string, unknown>;
            this.log('connected', meta);
            this.opts.onConnect?.(meta);
          } catch {
            this.log('connected');
          }
          return;
        }
        this.log('hub_error', { code: frame.code, id: frame.id, message: frame.message });
        return;
      case 'req':
        await this.handleReq(frame);
        return;
      // Spokes never receive res frames from the hub in v1.
      case 'res':
      case 'res.start':
      case 'res.chunk':
      case 'res.end':
        this.log('unexpected_response_frame', { t: frame.t });
        return;
      default:
        this.log('unhandled_frame');
    }
  }

  private async handleReq(frame: ReqFrame): Promise<void> {
    const body = frame.body ? Buffer.from(frame.body, 'base64') : undefined;
    const sender = this.createSender(frame.id);
    try {
      await this.opts.handler(
        { method: frame.method, path: frame.path, headers: frame.headers, body },
        sender,
      );
    } catch (err) {
      if (!sender.closed) {
        sender.respond(
          500,
          { 'content-type': 'application/json' },
          Buffer.from(
            JSON.stringify({ error: 'handler_error', message: (err as Error).message }),
            'utf8',
          ),
        );
      }
      return;
    }
    if (!sender.closed) {
      // Handler returned without calling respond/end — emit a neutral 204 so
      // the hub's pending promise doesn't hang.
      sender.respond(204, {});
    }
  }

  private createSender(id: string): StreamSender {
    const send = this.send.bind(this);
    let state: 'idle' | 'streaming' | 'closed' = 'idle';
    const sender: StreamSender = {
      respond(status, headers, body) {
        if (state !== 'idle') return;
        state = 'closed';
        send({
          t: 'res',
          id,
          status,
          headers,
          body: body ? body.toString('base64') : undefined,
        });
      },
      start(status, headers) {
        if (state !== 'idle') return;
        state = 'streaming';
        send({ t: 'res.start', id, status, headers });
      },
      chunk(data) {
        if (state !== 'streaming' || data.length === 0) return;
        send({ t: 'res.chunk', id, data: data.toString('base64') });
      },
      end(trailers) {
        if (state !== 'streaming') return;
        state = 'closed';
        send({ t: 'res.end', id, trailers });
      },
      get closed() {
        return state === 'closed';
      },
    };
    return sender;
  }

  private send(frame: TunnelFrame): void {
    const ws = this.ws;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(encode(frame));
    } catch (err) {
      this.log('send_failed', { error: (err as Error).message });
    }
  }
}
