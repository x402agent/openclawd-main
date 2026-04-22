// Honcho v3 client for the orchestrator. Four concerns:
//
//   1. Sandbox pointer — which E2B sandbox belongs to this Privy user, so we
//      can resume instead of spawning a fresh one. Stored as peer metadata.
//
//   2. Clawd vault snapshots — the tiered KNOWN/LEARNED/INFERRED JSONL files
//      that survive sandbox eviction. Stored as peer metadata; full Honcho
//      reasoning happens on the message stream below.
//
//   3. Chat persistence — every `AgentSession` turn gets mirrored into a
//      Honcho session as (user-peer, assistant-peer) messages. Honcho's
//      summariser + dreamer continuously reason over them, building a
//      per-user representation without us writing any prompt.
//
//   4. Brain — `Honcho.peer(user).chat(query)` synthesises a natural-language
//      answer from everything Honcho has learned. Surfaced at /v1/brain/ask.
//
// Honcho SDK docs: https://docs.honcho.dev — the shape here matches v3 of
// @honcho-ai/sdk.

import { Honcho, type Session, type Peer } from '@honcho-ai/sdk';

/** Two webhook endpoints — each with its own secret for verification. */
export interface HonchoWebhookConfig {
  url1: string
  secret1: string
  url2?: string
  secret2?: string
}

export interface SandboxPointer {
  sandboxId: string;
  template: string;
  lastSeen: number;
}

export interface VaultSnapshot {
  owner: string;
  tiers: Record<'KNOWN' | 'LEARNED' | 'INFERRED', unknown[]>;
  workspace_manifest: string[];
  projects?: Array<{ name: string; path: string; lastTouched: number; tags: string[] }>;
}

export interface BrainAskResult {
  answer: string | null;
  queriedAt: number;
  sessionId?: string;
}

/** The assistant peer ID. Shared across users — Honcho's representations are
 *  directional, so the assistant builds a separate view of each user peer. */
const ASSISTANT_PEER_ID = 'clawd-assistant';

/** Sandbox chat session id for a given user + agent. */
export function sandboxSessionId(privySub: string, agent: string): string {
  return `sandbox:${privySub}:${agent}`;
}

export class HonchoClient {
  #honcho: Honcho;
  #ready: Promise<void> | null = null;

  constructor(opts: { baseUrl?: string; apiKey: string; workspace?: string }) {
    this.#honcho = new Honcho({
      apiKey: opts.apiKey,
      baseURL: opts.baseUrl,
      workspace: opts.workspace ?? 'solanaclawd',
    });
  }

  /** Lazy warmup — creates the assistant peer on first call. Fails silently
   *  so the orchestrator can boot even if Honcho workspace doesn't exist yet.
   *  Call `.warmup()` to trigger; all public methods call it lazily anyway. */
  async warmup(): Promise<void> {
    await this.#ensureReady();
  }

  /** Wraps the private ready promise so callers can await it safely. */
  async #ensureReady(): Promise<void> {
    if (!this.#ready) {
      const promise = this.#honcho
        .peer(ASSISTANT_PEER_ID)
        .then(() => undefined)
        .catch((err) => {
          // 404 = workspace doesn't exist yet on Honcho servers — non-fatal.
          console.warn('[honcho] peer warmup warning:', String(err));
        });
      // Store a promise that never rejects so #ensureReady() stays safe to await.
      this.#ready = promise.catch(() => undefined) as Promise<void>;
    }
    await this.#ready;
  }

  /* ——— 1. Sandbox pointer ——— */

  async getSandboxPointer(privySub: string): Promise<SandboxPointer | null> {
    try {
      await this.#ensureReady();
      const peer = await this.#honcho.peer(userPeerId(privySub));
      const md = await peer.getMetadata();
      const ptr = md?.sandbox as SandboxPointer | undefined;
      return ptr ?? null;
    } catch {
      return null;
    }
  }

  async setSandboxPointer(privySub: string, sandboxId: string): Promise<void> {
    try {
      await this.#ensureReady();
      const peer = await this.#honcho.peer(userPeerId(privySub));
      const md = (await peer.getMetadata().catch(() => ({}))) ?? {};
      await peer.setMetadata({
        ...md,
        sandbox: {
          sandboxId,
          template: 'clawd',
          lastSeen: Date.now(),
        } satisfies SandboxPointer,
      });
    } catch (err) {
      console.error('[honcho] setSandboxPointer failed', err);
    }
  }

  /* ——— 2. Vault snapshots ——— */

  async getVaultSnapshot(privySub: string): Promise<VaultSnapshot | null> {
    try {
      await this.#ensureReady();
      const peer = await this.#honcho.peer(userPeerId(privySub));
      const md = await peer.getMetadata();
      const snap = md?.vault as VaultSnapshot | undefined;
      return snap ?? null;
    } catch {
      return null;
    }
  }

  async putVaultSnapshot(privySub: string, snapshot: VaultSnapshot): Promise<void> {
    try {
      await this.#ensureReady();
      const peer = await this.#honcho.peer(userPeerId(privySub));
      const md = (await peer.getMetadata().catch(() => ({}))) ?? {};
      await peer.setMetadata({ ...md, vault: snapshot });
    } catch (err) {
      console.error('[honcho] putVaultSnapshot failed', err);
    }
  }

  async listProjects(
    privySub: string,
  ): Promise<Array<{ name: string; lastTouched: number; tags: string[] }>> {
    const snap = await this.getVaultSnapshot(privySub);
    return snap?.projects ?? [];
  }

  /* ——— 3. Chat persistence ——— */

  /** Public — exposed so webhook handlers can mirror events from Honcho back. */
  async recordTurn(args: {
    privySub: string;
    agent: string;
    userMessage: string;
    assistantMessage: string;
    model?: string;
  }): Promise<void> {
    try {
      await this.#ensureReady();
      const [user, assistant, session] = await Promise.all([
        this.#honcho.peer(userPeerId(args.privySub)),
        this.#honcho.peer(ASSISTANT_PEER_ID),
        this.#honcho.session(sandboxSessionId(args.privySub, args.agent)),
      ]);
      await session.addMessages([
        user.message(args.userMessage),
        assistant.message(args.assistantMessage, {
          metadata: args.model ? { model: args.model } : undefined,
        }),
      ]);
    } catch (err) {
      console.error('[honcho] recordTurn failed', err);
    }
  }

  /**
   * Fetch the session's optimised conversation context for OpenAI-style
   * injection. Summaries are auto-generated; token budget controls how
   * much history we stuff back into the prompt on sandbox resume.
   */
  async loadContext(args: {
    privySub: string;
    agent: string;
    tokens?: number;
  }): Promise<Array<{ role: 'user' | 'assistant' | 'system'; content: string }>> {
    try {
      await this.#ensureReady();
      const [session, assistant] = await Promise.all([
        this.#honcho.session(sandboxSessionId(args.privySub, args.agent)),
        this.#honcho.peer(ASSISTANT_PEER_ID),
      ]);
      const ctx = await session.getContext({ tokens: args.tokens ?? 2000, summary: true });
      return ctx.toOpenAI(assistant) as Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
      }>;
    } catch (err) {
      console.error('[honcho] loadContext failed', err);
      return [];
    }
  }

  /* ——— 4. Brain ——— */

  /**
   * Ask Honcho what it has reasoned about this user. Surfaced at
   * `/v1/brain/ask`. Returns `null` if Honcho doesn't have enough signal
   * yet (new user, no history).
   */
  async brainAsk(args: {
    privySub: string;
    query: string;
    agent?: string;
  }): Promise<BrainAskResult> {
    await this.#ensureReady();
    const peer: Peer = await this.#honcho.peer(userPeerId(args.privySub));
    const session: Session | undefined = args.agent
      ? await this.#honcho.session(sandboxSessionId(args.privySub, args.agent))
      : undefined;
    const answer = await peer.chat(args.query, session ? { session } : undefined);
    return {
      answer: typeof answer === 'string' ? answer : null,
      queriedAt: Date.now(),
      sessionId: session?.id,
    };
  }
}

function userPeerId(privySub: string): string {
  return `user:${privySub}`;
}
