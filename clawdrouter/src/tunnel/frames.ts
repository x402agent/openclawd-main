/**
 * ClawdRouter — tunnel frame protocol (v1)
 *
 * JSON-encoded frames on a WebSocket between the fly.dev hub and a
 * customer-run clawdrouter spoke. Every frame carries a discriminating
 * `t` field. Request/response correlation is by `id` (UUID per hub→spoke
 * request). Streaming responses use start/chunk/end; non-streaming uses
 * a single `res` frame. `ping`/`pong` keep the connection alive.
 *
 * Bodies are base64-encoded strings so binary payloads transit cleanly
 * through JSON without UTF-8 assumptions.
 */

export type TunnelFrame =
  | ReqFrame
  | ResFrame
  | ResStartFrame
  | ResChunkFrame
  | ResEndFrame
  | PingFrame
  | PongFrame
  | ErrFrame;

export interface ReqFrame {
  t: 'req';
  id: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string; // base64
}

export interface ResFrame {
  t: 'res';
  id: string;
  status: number;
  headers: Record<string, string>;
  body?: string; // base64
}

export interface ResStartFrame {
  t: 'res.start';
  id: string;
  status: number;
  headers: Record<string, string>;
}

export interface ResChunkFrame {
  t: 'res.chunk';
  id: string;
  data: string; // base64
}

export interface ResEndFrame {
  t: 'res.end';
  id: string;
  trailers?: Record<string, string>;
}

export interface PingFrame {
  t: 'ping';
  ts: number;
}

export interface PongFrame {
  t: 'pong';
  ts: number;
}

export interface ErrFrame {
  t: 'err';
  id?: string;
  code: string;
  message: string;
}

// ── Codec ─────────────────────────────────────────────────────────────

export function encode(frame: TunnelFrame): string {
  return JSON.stringify(frame);
}

export function decode(raw: string | Buffer): TunnelFrame {
  const text = typeof raw === 'string' ? raw : raw.toString('utf8');
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    throw new FrameError('invalid_json', (e as Error).message);
  }
  if (!parsed || typeof parsed !== 'object') {
    throw new FrameError('not_object', 'frame root must be an object');
  }
  const obj = parsed as Record<string, unknown>;
  const t = obj.t;
  switch (t) {
    case 'req':
    case 'res':
    case 'res.start':
    case 'res.chunk':
    case 'res.end':
    case 'ping':
    case 'pong':
    case 'err':
      return obj as unknown as TunnelFrame;
    default:
      throw new FrameError('unknown_type', `unknown frame type: ${String(t)}`);
  }
}

export function encodeBody(body: Uint8Array | string | undefined): string | undefined {
  if (body === undefined) return undefined;
  const bytes = typeof body === 'string' ? Buffer.from(body, 'utf8') : Buffer.from(body);
  return bytes.toString('base64');
}

export function decodeBody(b64: string | undefined): Buffer | undefined {
  if (b64 === undefined) return undefined;
  return Buffer.from(b64, 'base64');
}

// ── Errors ────────────────────────────────────────────────────────────

export class FrameError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'FrameError';
  }
}

// ── ID generation ─────────────────────────────────────────────────────

export function newFrameId(): string {
  // 16 random bytes hex-encoded — good enough for per-connection correlation.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}
