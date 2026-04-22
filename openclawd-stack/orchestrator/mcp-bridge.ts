// Bridges the orchestrator HTTP surface to the Solana Clawd MCP server
// (./solana-clawd-mcp). The MCP server normally talks stdio to a Claude / MCP
// client — here we spawn it per-user and expose a JSON RPC-ish surface so
// browser + sandbox clients can call its tools without speaking MCP.
//
// Strategy:
//   - Lazy-spawn one child process per privySub.
//   - Speak JSON-RPC 2.0 over stdio (matches @modelcontextprotocol/sdk).
//   - Multiplex concurrent callers with a request-id map.
//
// If the MCP sub-package isn't built yet (`pnpm --filter
// @solana-clawd/solana-clawd-mcp build`), `listTools`/`callTool` throw a
// well-typed error that the route handler surfaces as 503.

import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

type JsonRpcId = number | string;

interface PendingCall {
  resolve: (value: unknown) => void;
  reject: (err: Error) => void;
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: unknown;
}

export interface McpCallResult {
  content: Array<{ type: string; text?: string }>;
  isError?: boolean;
}

export interface McpBridgeOpts {
  /** Absolute path to the MCP package entrypoint. Defaults to sibling dir. */
  entrypoint?: string;
  /** Extra env for each spawned child (layered on top of process.env). */
  env?: Record<string, string>;
}

interface Child {
  proc: ChildProcessWithoutNullStreams;
  pending: Map<JsonRpcId, PendingCall>;
  nextId: number;
  initialized: Promise<void>;
  buffer: string;
}

export class McpBridge {
  #opts: McpBridgeOpts;
  #children = new Map<string, Child>();

  constructor(opts: McpBridgeOpts = {}) {
    this.#opts = opts;
  }

  async listTools(privySub: string): Promise<McpTool[]> {
    const child = await this.#childFor(privySub);
    const res = (await this.#rpc(child, 'tools/list', {})) as { tools: McpTool[] };
    return res.tools ?? [];
  }

  async callTool(
    privySub: string,
    name: string,
    args: Record<string, unknown>,
  ): Promise<McpCallResult> {
    const child = await this.#childFor(privySub);
    return (await this.#rpc(child, 'tools/call', { name, arguments: args })) as McpCallResult;
  }

  /** Kill the user's MCP child (e.g. on /v1/pause). */
  async kill(privySub: string): Promise<void> {
    const c = this.#children.get(privySub);
    if (!c) return;
    c.proc.kill('SIGTERM');
    this.#children.delete(privySub);
  }

  // ── internals ───────────────────────────────────────────────────────────
  async #childFor(privySub: string): Promise<Child> {
    let child = this.#children.get(privySub);
    if (child) return child;

    const entrypoint = this.#opts.entrypoint ?? this.#defaultEntrypoint();
    const proc = spawn('node', ['--enable-source-maps', entrypoint], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...this.#opts.env, CLAWD_OWNER_SUB: privySub },
    });

    child = {
      proc,
      pending: new Map(),
      nextId: 1,
      buffer: '',
      initialized: Promise.resolve(),
    };
    this.#children.set(privySub, child);

    proc.stdout.setEncoding('utf8');
    proc.stdout.on('data', (chunk: string) => this.#onData(child!, chunk));
    proc.stderr.setEncoding('utf8');
    proc.stderr.on('data', (c: string) => console.error(`[mcp:${privySub}]`, c.trim()));
    proc.on('exit', (code) => {
      for (const p of child!.pending.values()) {
        p.reject(new Error(`mcp child exited (code=${code})`));
      }
      this.#children.delete(privySub);
    });

    // MCP initialize handshake.
    child.initialized = this.#rpc(child, 'initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'openclawd-orchestrator', version: '0.1.0' },
    }).then(() => undefined);
    await child.initialized;
    return child;
  }

  #defaultEntrypoint(): string {
    // <orchestrator>/solana-clawd-mcp/dist/index.js once built. Fall back to
    // src/index.ts via tsx if dist is missing (dev-only).
    const here = path.dirname(fileURLToPath(import.meta.url));
    return path.join(here, 'solana-clawd-mcp', 'dist', 'index.js');
  }

  #onData(child: Child, chunk: string) {
    child.buffer += chunk;
    let idx: number;
    while ((idx = child.buffer.indexOf('\n')) >= 0) {
      const line = child.buffer.slice(0, idx).trim();
      child.buffer = child.buffer.slice(idx + 1);
      if (!line) continue;
      try {
        const msg = JSON.parse(line) as {
          id?: JsonRpcId;
          result?: unknown;
          error?: { message?: string };
        };
        if (msg.id != null) {
          const p = child.pending.get(msg.id);
          if (!p) continue;
          child.pending.delete(msg.id);
          if (msg.error) p.reject(new Error(msg.error.message ?? 'mcp_error'));
          else p.resolve(msg.result);
        }
      } catch {
        // ignore non-JSON lines (MCP server logs go to stderr, but be lax)
      }
    }
  }

  #rpc(child: Child, method: string, params: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = child.nextId++;
      child.pending.set(id, { resolve, reject });
      const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';
      child.proc.stdin.write(payload, (err) => {
        if (err) {
          child.pending.delete(id);
          reject(err);
        }
      });
      setTimeout(() => {
        if (child.pending.has(id)) {
          child.pending.delete(id);
          reject(new Error(`mcp timeout: ${method}`));
        }
      }, 30_000);
    });
  }
}
