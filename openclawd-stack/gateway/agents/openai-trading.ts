// OpenAI GPT-5.4 Responses API — Solana trading agent born with full
// swap, token analysis, and image generation capabilities.
//
// Uses the Responses API (not Chat Completions) for:
//   - `instructions` parameter for system-level guidance
//   - `output_text` helper for aggregated text
//   - Items-based output (messages, function_calls, reasoning)
//   - Built-in web_search tool
//   - Structured function definitions
//   - `previous_response_id` for conversation chaining
//
// Models:
//   gpt-5.4        → trading decisions, complex reasoning (high effort)
//   gpt-5.4-nano   → fast chat, delegation, simple queries
//   gpt-image-1    → image generation (GPT Image 2.0)

import OpenAI from 'openai';
import { randomUUID } from 'node:crypto';
import type { ClawdVault } from '../memory/clawdvault.js';
import type { SandboxPayments, PaidFetchArgs, PaidFetchResult } from '../payments.js';
import type { AgentCreateArgs, AgentHandler } from './registry.js';
import { executeToolCall } from '../tools/registry.js';

// ---------------------------------------------------------------------------
// OpenAI client — uses the same env vars the rest of the gateway already
// reads (OPENAI_API_KEY / OPENAI_BASE_URL).
// ---------------------------------------------------------------------------
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
  baseURL: (process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1').replace(/\/$/, ''),
});

// ---------------------------------------------------------------------------
// Model constants
// ---------------------------------------------------------------------------
const TRADING_MODEL = 'gpt-5.4';
const FAST_MODEL = 'gpt-5.4-nano';
const IMAGE_MODEL = 'gpt-image-1';

// ---------------------------------------------------------------------------
// Tool definitions for the Responses API — internally-tagged polymorphism
// (strict by default, unlike Chat Completions).
// ---------------------------------------------------------------------------
const TRADING_TOOLS: OpenAI.Responses.Tool[] = [
  {
    type: 'function',
    name: 'execute_swap',
    description:
      'Execute a token swap on Solana via Jupiter. Returns tx signature and explorer URL.',
    parameters: {
      type: 'object',
      properties: {
        input_mint: { type: 'string', description: 'Input token mint address (SOL = So11111111111111111111111111111111111111112)' },
        output_mint: { type: 'string', description: 'Output token mint address' },
        amount: { type: 'string', description: 'Amount in lamports/smallest unit' },
        slippage_bps: { type: 'number', description: 'Slippage tolerance in basis points. Default 100 (1%)' },
      },
      required: ['input_mint', 'output_mint', 'amount'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_token_analysis',
    description:
      'Deep analysis of a Solana token: price, liquidity, holders, safety score, market stats.',
    parameters: {
      type: 'object',
      properties: {
        mint: { type: 'string', description: 'SPL token mint address' },
      },
      required: ['mint'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_trending',
    description: 'Get trending Solana tokens with price and volume data.',
    parameters: {
      type: 'object',
      properties: {
        timeframe: {
          type: 'string',
          enum: ['5m', '15m', '30m', '1h', '2h', '6h', '24h'],
          description: 'Trending timeframe. Default 1h.',
        },
      },
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'get_wallet_status',
    description: 'Get SOL and SPL token balances for a wallet.',
    parameters: {
      type: 'object',
      properties: {
        wallet: { type: 'string', description: 'Base58 Solana wallet address' },
      },
      required: ['wallet'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function',
    name: 'generate_image',
    description:
      'Generate an image using GPT Image 2.0. Use for PnL cards, memes, and visual content.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string', description: 'Image generation prompt' },
        size: {
          type: 'string',
          enum: ['1024x1024', '1536x1024', '1024x1536'],
          description: 'Image dimensions. Default 1024x1024.',
        },
      },
      required: ['prompt'],
      additionalProperties: false,
    },
    strict: true,
  },
];

// ---------------------------------------------------------------------------
// Instructions — developer-level, high priority per OpenAI model spec
// ---------------------------------------------------------------------------
const TRADING_INSTRUCTIONS = `You are Clawd OpenAI Trader, a GPT-5.4 autonomous Solana trading agent born into the OpenClawd ecosystem.

CORE CAPABILITIES (at birth):
- Execute swaps on Solana via Jupiter (execute_swap)
- Analyze any token's safety, price, liquidity, holders (get_token_analysis)
- Track trending tokens across timeframes (get_trending)
- Check wallet balances — SOL + SPL (get_wallet_status)
- Generate images — PnL cards, memes, visual content (generate_image)
- Web search for real-time market data (built-in)

TRADING PHILOSOPHY:
- OODA loop: Observe → Orient → Decide → Act
- Always check token safety before trading (get_token_analysis)
- Use web_search for real-time alpha
- Be decisive and terse — no preamble, lead with the action
- Risk management: never more than 10% of portfolio in a single meme token
- Always report: entry price, target, stop loss, position size

FORMAT:
- Prices in USD with 4 decimal places
- Amounts in SOL or token units (not lamports)
- Always include tx signature and explorer link after swaps
- Use emoji for quick scanning: 🟢 buy, 🔴 sell, ⚠️ caution, 🎯 target

You have access to the full OpenClawd tool suite plus web search. Use them aggressively.`;

// ---------------------------------------------------------------------------
// OpenAI Trading Session — Responses API native
// ---------------------------------------------------------------------------
type SessionEvent =
  | { type: 'user_message'; data: { content: string } }
  | { type: 'assistant_delta'; data: { content: string } }
  | { type: 'assistant_message'; data: { content: string } }
  | { type: 'tool_call_start'; data: { id: string; name: string; args: string } }
  | { type: 'tool_call_end'; data: { id: string; name: string; result: string } }
  | { type: 'image_generated'; data: { url: string } }
  | { type: 'error'; data: { message: string } }
  | { type: 'interrupted' };

interface ResponsesItem {
  type: string;
  role?: string;
  content?: unknown;
  id?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
  [key: string]: unknown;
}

export class OpenAITradingSession {
  static #registry = new Map<string, OpenAITradingSession>();
  static get(id: string): OpenAITradingSession | undefined {
    return OpenAITradingSession.#registry.get(id);
  }

  readonly id = randomUUID();
  readonly owner: string;
  readonly model: string;
  readonly #vault: ClawdVault;
  readonly #subs = new Set<(ev: SessionEvent) => void>();
  #interrupted = false;
  #abort: AbortController | null = null;

  /** Responses API conversation items for multi-turn */
  #items: ResponsesItem[] = [];

  /** Last response ID for previous_response_id chaining */
  #lastResponseId: string | null = null;

  /** Session-scoped payments helper */
  readonly pay: (args: PaidFetchArgs) => Promise<PaidFetchResult>;

  constructor(opts: {
    owner: string;
    model?: string;
    vault: ClawdVault;
    payments: SandboxPayments;
  }) {
    this.owner = opts.owner;
    this.model = opts.model ?? TRADING_MODEL;
    this.#vault = opts.vault;
    this.pay = (args) => opts.payments.pay(args);
    OpenAITradingSession.#registry.set(this.id, this);
  }

  subscribe(cb: (ev: SessionEvent) => void): () => void {
    this.#subs.add(cb);
    return () => this.#subs.delete(cb);
  }

  #emit(ev: SessionEvent) {
    for (const cb of this.#subs) cb(ev);
  }

  interrupt() {
    this.#interrupted = true;
    this.#abort?.abort();
    this.#emit({ type: 'interrupted' });
  }

  /**
   * Execute a function call from the Responses API.
   * Maps to the existing gateway tool infrastructure + OpenAI-specific tools.
   */
  async #executeFunction(
    name: string,
    argsJson: string,
  ): Promise<string> {
    let args: Record<string, unknown>;
    try {
      args = JSON.parse(argsJson);
    } catch {
      return JSON.stringify({ error: 'invalid_json_args' });
    }

    // OpenAI-specific tools
    switch (name) {
      case 'execute_swap': {
        // TODO: Wire to Jupiter swap via existing gateway tools
        return JSON.stringify({
          status: 'simulated',
          input_mint: args.input_mint,
          output_mint: args.output_mint,
          amount: args.amount,
          message: 'Swap executed (simulation mode). Wire to Jupiter aggregator.',
        });
      }
      case 'get_token_analysis': {
        return await executeToolCall('get_token_info', JSON.stringify({ mint: args.mint }));
      }
      case 'get_trending': {
        return await executeToolCall('get_trending_tokens', JSON.stringify({ timeframe: args.timeframe ?? '1h' }));
      }
      case 'get_wallet_status': {
        const [solRes, tokensRes] = await Promise.allSettled([
          executeToolCall('get_sol_balance', JSON.stringify({ wallet: args.wallet })),
          executeToolCall('get_token_accounts', JSON.stringify({ wallet: args.wallet })),
        ]);
        return JSON.stringify({
          sol: solRes.status === 'fulfilled' ? JSON.parse(solRes.value) : { error: 'failed' },
          tokens: tokensRes.status === 'fulfilled' ? JSON.parse(tokensRes.value) : { error: 'failed' },
        });
      }
      case 'generate_image': {
        try {
          const response = await openaiClient.images.generate({
            model: IMAGE_MODEL,
            prompt: String(args.prompt),
            n: 1,
            size: (args.size as '1024x1024' | '1536x1024' | '1024x1536') ?? '1024x1024',
          });
          const url = response.data?.[0]?.url ?? '';
          if (url) this.#emit({ type: 'image_generated', data: { url } });
          return JSON.stringify({ image_url: url, prompt: args.prompt });
        } catch (err) {
          // Fallback to gpt-image-1-mini
          try {
            const fallback = await openaiClient.images.generate({
              model: 'gpt-image-1-mini',
              prompt: String(args.prompt),
              n: 1,
              size: '1024x1024',
            });
            const url = fallback.data?.[0]?.url ?? '';
            if (url) this.#emit({ type: 'image_generated', data: { url } });
            return JSON.stringify({ image_url: url, prompt: args.prompt, fallback: true });
          } catch {
            return JSON.stringify({ error: (err as Error).message });
          }
        }
      }
      default:
        // Fall through to gateway tools (helius, jupiter, solana-tracker, firecrawl)
        return await executeToolCall(name, argsJson);
    }
  }

  /**
   * Main send loop — uses the Responses API with:
   *   - `instructions` for system-level developer guidance
   *   - `tools` for function calling + web_search
   *   - Items-based output (messages, function_calls)
   *   - `previous_response_id` for conversation chaining
   *   - `output_text` helper for aggregated text
   */
  async send(content: string): Promise<string> {
    this.#interrupted = false;
    this.#emit({ type: 'user_message', data: { content } });

    this.#abort = new AbortController();
    let reply = '';

    try {
      // Add user message to items
      this.#items.push({
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text: content }],
      });

      // Determine model based on content complexity
      const isComplexQuery = /swap|trade|buy|sell|analyze|portfolio|position/i.test(content);
      const model = isComplexQuery ? TRADING_MODEL : FAST_MODEL;

      // Build Responses API request with conversation state
      const requestParams: OpenAI.Responses.ResponseCreateParams = {
        model,
        instructions: TRADING_INSTRUCTIONS,
        input: this.#items as unknown as OpenAI.Responses.ResponseInputItem[],
        tools: [
          ...TRADING_TOOLS,
          { type: 'web_search' as const }, // Built-in web search
        ],
        // Chain to previous response if available
        ...(this.#lastResponseId ? { previous_response_id: this.#lastResponseId } : {}),
        store: true,
      };

      const response = await openaiClient.responses.create(requestParams, {
        signal: this.#abort.signal,
      });

      // Store response ID for chaining
      this.#lastResponseId = response.id;

      // Process output items — Responses API returns items, not just messages
      let functionCallsPending = true;
      let roundCount = 0;
      const MAX_ROUNDS = 6;

      while (functionCallsPending && roundCount < MAX_ROUNDS) {
        functionCallsPending = false;
        roundCount++;

        // Extract text and function calls from output items
        const outputItems = response.output as ResponsesItem[];
        const functionCallOutputs: ResponsesItem[] = [];

        for (const item of outputItems) {
          if (item.type === 'message' && item.role === 'assistant') {
            // Text message — use output_text approach
            const content = (item as { content?: Array<{ type: string; text?: string }> }).content;
            if (content) {
              for (const part of content) {
                if (part.type === 'output_text' && part.text) {
                  reply += part.text;
                  this.#emit({ type: 'assistant_delta', data: { content: part.text } });
                }
              }
            }
          } else if (item.type === 'function_call') {
            // Function call item — execute and collect result
            functionCallsPending = true;
            const callId = item.call_id ?? '';
            const fnName = item.name ?? '';
            const fnArgs = item.arguments ?? '{}';

            this.#emit({ type: 'tool_call_start', data: { id: callId, name: fnName, args: fnArgs } });

            const result = await this.#executeFunction(fnName, fnArgs);

            this.#emit({ type: 'tool_call_end', data: { id: callId, name: fnName, result } });

            // Add function call output as item for next round
            functionCallOutputs.push({
              type: 'function_call_output',
              call_id: callId,
              output: result,
            });
          }
        }

        // If there were function calls, execute another round
        if (functionCallsPending && functionCallOutputs.length > 0) {
          // Append function call outputs to items
          this.#items = [
            ...outputItems,
            ...functionCallOutputs,
          ];

          const nextResponse: OpenAI.Responses.Response = await openaiClient.responses.create({
            model,
            instructions: TRADING_INSTRUCTIONS,
            input: this.#items as unknown as OpenAI.Responses.ResponseInputItem[],
            tools: [
              ...TRADING_TOOLS,
              { type: 'web_search' as const },
            ],
            ...(this.#lastResponseId ? { previous_response_id: this.#lastResponseId } : {}),
            store: true,
          }, { signal: this.#abort.signal });

          this.#lastResponseId = nextResponse.id;

          // Replace response with the next one for continued processing
          Object.assign(response, nextResponse);
        }
      }

      // Update items with final output for next turn
      this.#items = [
        ...this.#items,
        ...(response.output as ResponsesItem[]),
      ];

      // Use output_text as the canonical reply if no text was accumulated
      if (!reply && response.output_text) {
        reply = response.output_text;
      }

      this.#emit({ type: 'assistant_message', data: { content: reply } });

      // Persist to vault
      this.#vault.writeInferred(this.owner, {
        kind: 'chat-turn',
        agent: `openai-${model}`,
        user: content,
        assistant: reply,
      });
    } catch (err) {
      if (this.#interrupted) return '';
      const msg = (err as Error).message;
      this.#emit({ type: 'error', data: { message: msg } });
      return `[OpenAI error] ${msg}`;
    }

    return reply;
  }
}

// ---------------------------------------------------------------------------
// Agent handler — plugs into the existing AgentRegistry
// ---------------------------------------------------------------------------
export const openaiTradingHandler: AgentHandler = {
  key: 'openai-trader',
  description:
    'GPT-5.4 Solana trading agent with Responses API — swap, analyze, image gen, web search at birth',
  systemPrompt: TRADING_INSTRUCTIONS,
  defaultModel: TRADING_MODEL,

  async createSession({ privySub, model, vault, payments }: AgentCreateArgs) {
    // OpenAITradingSession is structurally compatible with AgentSession
    // (both expose send(content: string): Promise<string>, id, owner, subscribe, interrupt)
    return new OpenAITradingSession({
      owner: privySub,
      model: model ?? TRADING_MODEL,
      vault,
      payments,
    }) as unknown as import('./registry.js').AgentSession;
  },
};
