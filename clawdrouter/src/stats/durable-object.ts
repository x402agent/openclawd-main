/**
 * ClawdStats — Durable Object holding realtime routing counters.
 *
 * One singleton instance (addressed by `idFromName("global")`) aggregates
 * every request the Worker routes. Two surfaces:
 *
 *   POST /record      — Worker posts a RouteEvent after each request
 *   GET  /snapshot    — returns the current StatsSnapshot as JSON
 *   GET  /stream      — upgrades to WebSocket, emits the snapshot immediately
 *                       and pushes a `{type:"route", route}` frame on every
 *                       new event. Uses the hibernation API so idle sockets
 *                       don't keep the DO warm.
 *
 * Totals persist via `state.storage`. The recent-routes ring buffer is
 * in-memory only (ephemeral — fine, the Analytics Engine has the history).
 */

export interface RouteEvent {
  t: number;
  tier: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'REASONING';
  profile: 'eco' | 'auto' | 'premium';
  requestedModel: string;
  routedModel: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  costUsdc: number;
  savedUsdc: number;
  latencyMs: number;
  fallback: boolean;
  status: string;
}

interface Totals {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCostUsdc: number;
  totalSavedUsdc: number;
  totalLatencyMs: number;
  firstSeen: number;
  byTier: Record<'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'REASONING', number>;
  byProfile: Record<'eco' | 'auto' | 'premium', number>;
  byModel: Record<string, { count: number; cost: number }>;
}

export interface StatsSnapshot extends Totals {
  avgLatencyMs: number;
  topModels: Array<{ model: string; count: number; cost: number }>;
  recent: RouteEvent[];
}

const RING_SIZE = 50;

function emptyTotals(): Totals {
  return {
    totalRequests: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalCostUsdc: 0,
    totalSavedUsdc: 0,
    totalLatencyMs: 0,
    firstSeen: 0,
    byTier: { SIMPLE: 0, MEDIUM: 0, COMPLEX: 0, REASONING: 0 },
    byProfile: { eco: 0, auto: 0, premium: 0 },
    byModel: {},
  };
}

export class ClawdStats implements DurableObject {
  private totals: Totals = emptyTotals();
  private recent: RouteEvent[] = [];
  private ready: Promise<void>;

  constructor(private state: DurableObjectState, _env: unknown) {
    this.ready = state.blockConcurrencyWhile(async () => {
      const stored = await state.storage.get<Totals>('totals');
      if (stored) this.totals = stored;
    });
  }

  async fetch(request: Request): Promise<Response> {
    await this.ready;
    const url = new URL(request.url);

    if (request.method === 'POST' && url.pathname === '/record') {
      return this.handleRecord(request);
    }
    if (request.method === 'GET' && url.pathname === '/snapshot') {
      return Response.json(this.buildSnapshot());
    }
    if (request.method === 'GET' && url.pathname === '/stream') {
      return this.handleStream(request);
    }
    return new Response('Not found', { status: 404 });
  }

  private async handleRecord(request: Request): Promise<Response> {
    let event: RouteEvent;
    try {
      event = (await request.json()) as RouteEvent;
    } catch {
      return new Response('Invalid JSON', { status: 400 });
    }

    this.applyEvent(event);
    await this.state.storage.put('totals', this.totals);
    this.broadcast({ type: 'route', route: event });

    return Response.json({ ok: true });
  }

  private handleStream(request: Request): Response {
    if (request.headers.get('upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }
    const { 0: client, 1: server } = new WebSocketPair();
    this.state.acceptWebSocket(server);
    server.send(JSON.stringify({ type: 'snapshot', snapshot: this.buildSnapshot() }));
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(_ws: WebSocket, _message: ArrayBuffer | string): void {
    // Clients don't send us anything — ignore.
  }

  webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): void {
    try {
      ws.close(1000, 'bye');
    } catch {
      // already closed
    }
  }

  webSocketError(ws: WebSocket, _error: unknown): void {
    try {
      ws.close(1011, 'error');
    } catch {
      // already closed
    }
  }

  private broadcast(msg: unknown): void {
    const payload = JSON.stringify(msg);
    for (const ws of this.state.getWebSockets()) {
      try {
        ws.send(payload);
      } catch {
        // socket dead — hibernation API handles cleanup
      }
    }
  }

  private applyEvent(event: RouteEvent): void {
    if (this.totals.firstSeen === 0) this.totals.firstSeen = event.t || Date.now();
    this.totals.totalRequests += 1;
    this.totals.totalInputTokens += event.inputTokens || 0;
    this.totals.totalOutputTokens += event.outputTokens || 0;
    this.totals.totalCostUsdc += event.costUsdc || 0;
    this.totals.totalSavedUsdc += event.savedUsdc || 0;
    this.totals.totalLatencyMs += event.latencyMs || 0;

    if (event.tier in this.totals.byTier) {
      this.totals.byTier[event.tier] += 1;
    }
    if (event.profile in this.totals.byProfile) {
      this.totals.byProfile[event.profile] += 1;
    }

    const key = event.routedModel;
    if (key) {
      const entry = this.totals.byModel[key] ?? { count: 0, cost: 0 };
      entry.count += 1;
      entry.cost += event.costUsdc || 0;
      this.totals.byModel[key] = entry;
    }

    this.recent.unshift(event);
    if (this.recent.length > RING_SIZE) this.recent.length = RING_SIZE;
  }

  private buildSnapshot(): StatsSnapshot {
    const avgLatencyMs =
      this.totals.totalRequests > 0
        ? this.totals.totalLatencyMs / this.totals.totalRequests
        : 0;
    const topModels = Object.entries(this.totals.byModel)
      .map(([model, v]) => ({ model, count: v.count, cost: v.cost }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    return {
      ...this.totals,
      avgLatencyMs,
      topModels,
      recent: this.recent.slice(),
    };
  }
}
