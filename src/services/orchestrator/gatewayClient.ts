// Typed client for the sandbox gateway (runs at port 18789 inside the E2B
// sandbox, proxied to the browser by the orchestrator). The orchestrator mints
// a short-lived gateway JWT that goes in `Authorization: Bearer`.
//
// This is a second-tier client — use OrchestratorClient to launch a sandbox
// first and get back { gatewayUrl, gatewayToken }. Then use this to talk to
// that specific sandbox's HTTP + WebSocket surface.

export interface GatewayClientOpts {
  /** Full URL of the sandbox gateway, e.g. https://vm-xxxx.s1.e2b.dev */
  gatewayUrl: string
  /** JWT minted by the orchestrator. Required — gateway rejects unauthenticated requests. */
  gatewayToken: string
  /** Optional fetch override (for tests / node). */
  fetchImpl?: typeof fetch
}

export interface AgentInfo {
  key: string
  label: string
  description: string
}

export interface CreateSessionArgs {
  agent: string
  model?: string
  project?: string
}

export interface SessionResult {
  sessionId: string
  agent: string
  model: string
}

export class GatewayError extends Error {
  readonly status: number
  readonly body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export class GatewayClient {
  #opts: GatewayClientOpts

  constructor(opts: GatewayClientOpts) {
    this.#opts = opts
  }

  async #request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const f = this.#opts.fetchImpl ?? fetch
    const url = `${this.#opts.gatewayUrl.replace(/\/$/, '')}${path}`
    const res = await f(url, {
      method,
      headers: {
        authorization: `Bearer ${this.#opts.gatewayToken}`,
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) {
      const text = await res.text()
      let parsed: unknown = text
      try {
        parsed = JSON.parse(text)
      } catch {
        // keep as text
      }
      throw new GatewayError(`${method} ${path} → ${res.status}`, res.status, parsed)
    }
    return (await res.json()) as T
  }

  // ─── discovery ────────────────────────────────────────────────────────
  async listAgents(): Promise<{ agents: AgentInfo[] }> {
    return this.#request('GET', '/v1/agents')
  }

  // ─── session lifecycle ────────────────────────────────────────────────
  async createSession(args: CreateSessionArgs): Promise<SessionResult> {
    return this.#request('POST', '/v1/sessions', args)
  }

  async closeSession(sessionId: string): Promise<{ ok: true }> {
    return this.#request('POST', `/v1/sessions/${sessionId}/close`)
  }

  // ─── vault snapshot (called by orchestrator on pause) ─────────────────
  async snapshotVault(): Promise<unknown> {
    return this.#request('POST', '/v1/vault/snapshot')
  }

  // ─── earnings ──────────────────────────────────────────────────────────
  async earnings(asset: string = 'USDC'): Promise<{ pendingBaseUnits: string; asset: string; decimals: number }> {
    return this.#request('GET', `/v1/earnings?asset=${asset}`)
  }

  // ─── web socket (streaming messages) ────────────────────────────────
  /**
   * Returns a WebSocket URL for streaming session messages. The token is
   * forwarded as a query param so the orchestrator proxy can validate it.
   */
  streamUrl(sessionId: string): string {
    return `${this.#opts.gatewayUrl.replace(/^https/, 'wss')}/v1/sessions/${sessionId}/stream?token=${encodeURIComponent(this.#opts.gatewayToken)}`
  }
}

/**
 * Build a GatewayClient from the result of OrchestratorClient.launch().
 */
export function createGatewayClient(launchResult: {
  gatewayUrl: string
  gatewayToken: string
}): GatewayClient {
  return new GatewayClient({ gatewayUrl: launchResult.gatewayUrl, gatewayToken: launchResult.gatewayToken })
}