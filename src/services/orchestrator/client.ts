// Typed client for the openclawd-stack orchestrator (/api/v1/*).
//
// Usage:
//   const client = new OrchestratorClient({
//     baseUrl: 'https://solanaclawd.com',
//     getAuthToken: () => privyAccessToken,
//   })
//   await client.launch({ agent: 'mawdbot', channels: ['web'] })
//
// All requests include the Privy access token as `Authorization: Bearer`.
// The orchestrator verifies it against PRIVY_JWKS_ENDPOINT on every route.
//
// Wired by default to the same origin as the frontend. Override `baseUrl` for
// dev (e.g. `http://localhost:8787`).

export interface OrchestratorClientOpts {
  /** e.g. 'https://solanaclawd.com'. Route prefix '/api' is added automatically. */
  baseUrl: string
  /** Returns the current Privy access token. Called on every request. */
  getAuthToken: () => string | null | undefined | Promise<string | null | undefined>
  /** Optional fetch override (for tests / node). */
  fetchImpl?: typeof fetch
}

export interface AgentDescriptor {
  key: string
  label: string
  description: string
}

export interface LaunchArgs {
  agent: string
  model?: string
  channels?: Array<'web' | 'telegram'>
  monetize?: boolean
  pricing?: Record<string, string>
  spendLimitUsd?: number
}

export interface LaunchResult {
  sandboxId: string
  gatewayUrl: string
  gatewayToken: string
  expiresAt: number
  payments?: {
    agentPda?: string
    manifestCid?: string
    mandateJwt?: string
    mandateExp?: number
  }
}

export interface BrainAskResult {
  answer: string | null
  queriedAt: number
  sessionId?: string
}

export interface WalletBalance {
  address: string
  sol: number
}

export interface McpTool {
  name: string
  description?: string
  inputSchema?: unknown
}

export interface McpCallResult {
  content: Array<{ type: string; text?: string }>
  isError?: boolean
}

export class OrchestratorError extends Error {
  readonly status: number
  readonly body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.status = status
    this.body = body
  }
}

export class OrchestratorClient {
  #opts: OrchestratorClientOpts

  constructor(opts: OrchestratorClientOpts) {
    this.#opts = opts
  }

  async #request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const token = await this.#opts.getAuthToken()
    const f = this.#opts.fetchImpl ?? fetch
    const url = `${this.#opts.baseUrl.replace(/\/$/, '')}/api${path}`
    const res = await f(url, {
      method,
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'content-type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
    })
    if (!res.ok) {
      const text = await res.text()
      let parsed: unknown = text
      try {
        parsed = JSON.parse(text)
      } catch {
        // keep as text
      }
      throw new OrchestratorError(`${method} ${path} → ${res.status}`, res.status, parsed)
    }
    return (await res.json()) as T
  }

  // ─── identity ────────────────────────────────────────────────────────
  me(): Promise<{ privySub: string; wallet: string | null }> {
    return this.#request('GET', '/v1/me')
  }

  // ─── agents / sandbox lifecycle ──────────────────────────────────────
  listAgents(): Promise<{ agents: AgentDescriptor[]; models: string[] }> {
    return this.#request('GET', '/v1/agents')
  }

  launch(args: LaunchArgs): Promise<LaunchResult> {
    return this.#request('POST', '/v1/launch', args)
  }

  pause(): Promise<{ ok: true }> {
    return this.#request('POST', '/v1/pause')
  }

  listProjects(): Promise<{
    projects: Array<{ name: string; lastTouched: number; tags: string[] }>
  }> {
    return this.#request('GET', '/v1/projects')
  }

  // ─── brain (Honcho) ──────────────────────────────────────────────────
  brainAsk(query: string, agent?: string): Promise<BrainAskResult> {
    return this.#request('POST', '/v1/brain/ask', { query, agent })
  }

  brainContext(
    agent: string,
    tokens = 2000,
  ): Promise<{
    agent: string
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
  }> {
    return this.#request('GET', `/v1/brain/context/${encodeURIComponent(agent)}?tokens=${tokens}`)
  }

  // ─── payments ────────────────────────────────────────────────────────
  registerAgent(args: {
    agent: string
    pricing?: Record<string, string>
    splitBps?: { owner: number; buyback: number; treasury: number; operator: number }
    protocolsMask?: number
  }): Promise<{ agentPda: string; manifestCid: string; signature: string }> {
    return this.#request('POST', '/v1/agents/register', args)
  }

  mintMandate(args: {
    spendLimitUsd?: number
    ttlSeconds?: number
    resource?: string
  }): Promise<{ jwt: string; exp: number }> {
    return this.#request('POST', '/v1/mandates/mint', args)
  }

  earnings(): Promise<{ pendingBaseUnits: string; asset: 'USDC'; decimals: 6 }> {
    return this.#request('GET', '/v1/earnings')
  }

  // ─── wallet (Privy agentic) ──────────────────────────────────────────
  listWallets(): Promise<{ wallets: WalletBalance[] }> {
    return this.#request('GET', '/v1/wallet')
  }

  createWallet(label?: string): Promise<{ address: string; label?: string }> {
    return this.#request('POST', '/v1/wallet/create', { label })
  }

  walletTransfer(args: {
    from: string
    to: string
    /** amount in SOL */
    amount: number
    autoSign?: boolean
  }): Promise<{ signature?: string; pending: boolean }> {
    return this.#request('POST', '/v1/wallet/transfer', args)
  }

  // ─── MCP tools ───────────────────────────────────────────────────────
  listMcpTools(): Promise<{ tools: McpTool[] }> {
    return this.#request('GET', '/v1/mcp/tools')
  }

  callMcpTool(name: string, args: Record<string, unknown> = {}): Promise<McpCallResult> {
    return this.#request('POST', '/v1/mcp/call', { name, arguments: args })
  }

  // ─── telegram pairing ────────────────────────────────────────────────
  approveTelegram(code: string, agent?: string): Promise<{ ok: true; code: string; agent: string }> {
    return this.#request('POST', '/v1/telegram/approve', { code, agent })
  }
}

/**
 * Convenience factory. Reads the base URL from
 * `import.meta.env.VITE_ORCHESTRATOR_URL` (browser / Vite) or
 * `process.env.ORCHESTRATOR_URL` (node) so the same code works on both sides.
 */
export function createOrchestratorClient(
  getAuthToken: OrchestratorClientOpts['getAuthToken'],
  overrides: Partial<OrchestratorClientOpts> = {},
): OrchestratorClient {
  const fromImportMeta =
    typeof import.meta !== 'undefined' &&
    // @ts-expect-error — import.meta.env is optional at build time
    (import.meta.env?.VITE_ORCHESTRATOR_URL as string | undefined)
  const fromProcess =
    typeof process !== 'undefined' ? process.env?.ORCHESTRATOR_URL : undefined
  const baseUrl = overrides.baseUrl ?? fromImportMeta ?? fromProcess ?? 'https://solanaclawd.com'
  return new OrchestratorClient({ baseUrl, getAuthToken, ...overrides })
}
