/**
 * OpenAI Trading Bot — Cloudflare Worker
 *
 * GPT-5.4 + GPT-5.4-nano autonomous Solana trading Telegram bot.
 * Uses the Responses API (not Chat Completions) for:
 *   - `instructions` parameter (developer-level, high priority)
 *   - `output_text` helper (aggregated text output)
 *   - Items-based output (messages, function_calls, reasoning)
 *   - Built-in `web_search` tool
 *   - `previous_response_id` for conversation chaining
 *   - Structured Outputs via `text.format`
 *
 * Routes requests to the OpenClawd gateway agent registry:
 *   GATEWAY_URL/api/v1/brain/ask  → gateway agent session
 */

import { Hono } from 'hono';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Env {
  OPENAI_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  GATEWAY_URL: string;
  OWNER_CHAT_ID: string;
  TRADING_KV: KVNamespace;
}

interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string };
  text?: string;
  from?: { id: number; username?: string; first_name?: string };
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------
const app = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Responses API tool definitions — internally-tagged, strict by default
// ---------------------------------------------------------------------------
const TRADING_TOOLS = [
  {
    type: 'function' as const,
    name: 'execute_swap',
    description: 'Execute a token swap on Solana via Jupiter.',
    parameters: {
      type: 'object',
      properties: {
        input_mint: { type: 'string', description: 'Input token mint' },
        output_mint: { type: 'string', description: 'Output token mint' },
        amount: { type: 'string', description: 'Amount in lamports' },
      },
      required: ['input_mint', 'output_mint', 'amount'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function' as const,
    name: 'get_token_analysis',
    description: 'Analyze a Solana token: price, liquidity, holders, safety.',
    parameters: {
      type: 'object',
      properties: {
        mint: { type: 'string', description: 'Token mint address' },
      },
      required: ['mint'],
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function' as const,
    name: 'get_trending',
    description: 'Get trending Solana tokens.',
    parameters: {
      type: 'object',
      properties: {
        timeframe: {
          type: 'string',
          enum: ['5m', '15m', '30m', '1h', '6h', '24h'],
          description: 'Timeframe. Default 1h.',
        },
      },
      additionalProperties: false,
    },
    strict: true,
  },
  {
    type: 'function' as const,
    name: 'get_wallet_status',
    description: 'Get SOL and SPL token balances for a wallet.',
    parameters: {
      type: 'object',
      properties: {
        wallet: { type: 'string', description: 'Wallet address' },
      },
      required: ['wallet'],
      additionalProperties: false,
    },
    strict: true,
  },
];

// ---------------------------------------------------------------------------
// Instructions — developer-level guidance (high priority per model spec)
// ---------------------------------------------------------------------------
const SYSTEM_INSTRUCTIONS = `You are Clawd OpenAI Trader — a GPT-5.4 autonomous Solana trading agent.

You are born into the OpenClawd ecosystem with these capabilities:
- Execute swaps on Solana via Jupiter (execute_swap)
- Analyze any token's safety, price, liquidity, holders (get_token_analysis)
- Track trending tokens across timeframes (get_trending)
- Check wallet balances (get_wallet_status)
- Web search for real-time market data (built-in web_search)

OODA loop: Observe → Orient → Decide → Act
- Always check token safety before trading
- Use web_search for real-time alpha
- Be decisive and terse
- Risk management: never >10% of portfolio in a single meme token
- Always report: entry price, target, stop loss, position size
- 🟢 buy, 🔴 sell, ⚠️ caution, 🎯 target`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const TELEGRAM_API = (token: string) => `https://api.telegram.org/bot${token}`;

async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  replyTo?: number,
): Promise<void> {
  const url = `${TELEGRAM_API(token)}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4096),
      parse_mode: 'Markdown',
      ...(replyTo ? { reply_to_message_id: replyTo } : {}),
    }),
  });
}

async function sendPhoto(
  token: string,
  chatId: number,
  imageUrl: string,
  caption?: string,
): Promise<void> {
  const url = `${TELEGRAM_API(token)}/sendPhoto`;
  await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      photo: imageUrl,
      ...(caption ? { caption: caption.slice(0, 1024) } : {}),
    }),
  });
}

// ---------------------------------------------------------------------------
// Responses API — text generation with instructions + tools
// ---------------------------------------------------------------------------
interface ResponsesItem {
  type: string;
  role?: string;
  content?: Array<{ type: string; text?: string; image_url?: string }>;
  id?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
  [key: string]: unknown;
}

async function callResponsesAPI(
  apiKey: string,
  items: ResponsesItem[],
  previousResponseId?: string,
  includeWebSearch = true,
): Promise<{
  id: string;
  output: ResponsesItem[];
  output_text: string;
}> {
  const tools: unknown[] = [...TRADING_TOOLS];
  if (includeWebSearch) tools.push({ type: 'web_search' });

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-5.4',
      instructions: SYSTEM_INSTRUCTIONS,
      input: items,
      tools,
      ...(previousResponseId ? { previous_response_id: previousResponseId } : {}),
      store: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Responses API ${res.status}: ${err.slice(0, 500)}`);
  }

  const data = await res.json() as {
    id: string;
    output: ResponsesItem[];
    output_text?: string;
  };

  return {
    id: data.id,
    output: data.output,
    output_text: data.output_text ?? '',
  };
}

async function executeFunctionCall(
  name: string,
  argsJson: string,
  gatewayUrl: string,
): Promise<string> {
  let args: Record<string, unknown>;
  try {
    args = JSON.parse(argsJson);
  } catch {
    return JSON.stringify({ error: 'invalid_json_args' });
  }

  // Route to gateway brain for real Solana data
  switch (name) {
    case 'execute_swap':
    case 'get_token_analysis':
    case 'get_trending':
    case 'get_wallet_status': {
      try {
        const res = await fetch(`${gatewayUrl}/api/v1/brain/ask`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ prompt: `${name} ${argsJson}` }),
        });
        const data = await res.json() as { reply?: string };
        return data.reply ?? JSON.stringify({ status: 'ok', data });
      } catch {
        return JSON.stringify({ status: 'simulated', name, args });
      }
    }
    default:
      return JSON.stringify({ error: 'unknown_tool', name });
  }
}

// ---------------------------------------------------------------------------
// Image generation — GPT Image 2.0 with gpt-image-1-mini fallback
// ---------------------------------------------------------------------------
async function generateImage(
  apiKey: string,
  prompt: string,
): Promise<string | null> {
  // Try gpt-image-1 (GPT Image 2.0) first
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });
    if (res.ok) {
      const data = await res.json() as { data: Array<{ url?: string; b64_json?: string }> };
      return data.data?.[0]?.url ?? null;
    }
  } catch { /* fallback */ }

  // Fallback to gpt-image-1-mini
  try {
    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1-mini',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });
    if (res.ok) {
      const data = await res.json() as { data: Array<{ url?: string }> };
      return data.data?.[0]?.url ?? null;
    }
  } catch { /* give up */ }

  return null;
}

// ---------------------------------------------------------------------------
// KV-backed conversation memory
// ---------------------------------------------------------------------------
interface ConversationState {
  items: ResponsesItem[];
  lastResponseId: string | null;
}

async function loadConversation(
  kv: KVNamespace,
  chatId: number,
): Promise<ConversationState> {
  const raw = await kv.get(`conv:${chatId}`);
  if (raw) {
    try {
      return JSON.parse(raw) as ConversationState;
    } catch { /* corrupted */ }
  }
  return { items: [], lastResponseId: null };
}

async function saveConversation(
  kv: KVNamespace,
  chatId: number,
  state: ConversationState,
): Promise<void> {
  // Keep last 20 turns to stay within KV value limits
  const trimmed = state.items.slice(-40);
  await kv.put(`conv:${chatId}`, JSON.stringify({
    ...state,
    items: trimmed,
  }));
}

// ---------------------------------------------------------------------------
// Access control
// ---------------------------------------------------------------------------
async function isAuthorized(kv: KVNamespace, chatId: number, ownerChatId: string): Promise<boolean> {
  if (String(chatId) === ownerChatId) return true;
  const assigned = await kv.get(`assigned:${chatId}`);
  return assigned === 'true';
}

// ---------------------------------------------------------------------------
// Process message — Responses API with items, instructions, output_text
// ---------------------------------------------------------------------------
async function processMessage(
  env: Env,
  chatId: number,
  text: string,
  fromUser?: string,
): Promise<string> {
  const state = await loadConversation(env.TRADING_KV, chatId);

  // Add user message as item (Responses API format)
  state.items.push({
    type: 'message',
    role: 'user',
    content: [{ type: 'input_text', text }],
  });

  try {
    // Call Responses API with conversation state
    let response = await callResponsesAPI(
      env.OPENAI_API_KEY,
      state.items,
      state.lastResponseId ?? undefined,
    );

    state.lastResponseId = response.id;

    // Process function calls in a loop (Responses API agentic pattern)
    let roundCount = 0;
    const MAX_ROUNDS = 6;

    while (roundCount < MAX_ROUNDS) {
      const functionCalls = response.output.filter(
        (item) => item.type === 'function_call',
      );

      if (functionCalls.length === 0) break;

      roundCount++;

      // Execute function calls and collect outputs
      const outputs: ResponsesItem[] = [];
      for (const fc of functionCalls) {
        const result = await executeFunctionCall(
          fc.name ?? '',
          fc.arguments ?? '{}',
          env.GATEWAY_URL,
        );
        outputs.push({
          type: 'function_call_output',
          call_id: fc.call_id,
          output: result,
        });
      }

      // Append outputs to items and call API again
      state.items = [...state.items, ...response.output, ...outputs];

      response = await callResponsesAPI(
        env.OPENAI_API_KEY,
        state.items,
        response.id,
      );

      state.lastResponseId = response.id;
    }

    // Append final output items to state
    state.items = [...state.items, ...response.output];

    // Save updated conversation
    await saveConversation(env.TRADING_KV, chatId, state);

    // Return aggregated text using output_text helper pattern
    return response.output_text || '🤖 No response generated.';
  } catch (err) {
    await saveConversation(env.TRADING_KV, chatId, state);
    return `❌ Error: ${(err as Error).message}`;
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Health check
app.get('/', (c) => c.json({
  service: 'openclawd-openai-trading-bot',
  status: 'ok',
  models: { trading: 'gpt-5.4', fast: 'gpt-5.4-nano', image: 'gpt-image-1' },
  api: 'responses',
}));

// Setup webhook
app.get('/setup', async (c) => {
  const token = c.env.TELEGRAM_BOT_TOKEN;
  const url = new URL(c.req.url);
  const webhookUrl = `${url.protocol}//${url.host}/telegram/webhook`;

  const res = await fetch(`${TELEGRAM_API(token)}/setWebhook`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url: webhookUrl }),
  });
  const data = await res.json();
  return c.json({ webhook: webhookUrl, result: data });
});

// Telegram webhook
app.post('/telegram/webhook', async (c) => {
  const update = await c.req.json<TelegramUpdate>();
  const msg = update.message;

  if (!msg?.text) return c.json({ ok: true });

  const chatId = msg.chat.id;
  const text = msg.text.trim();

  // Access check
  if (!(await isAuthorized(c.env.TRADING_KV, chatId, c.env.OWNER_CHAT_ID))) {
    await sendMessage(
      c.env.TELEGRAM_BOT_TOKEN,
      chatId,
      '⛔ Unauthorized. Ask the owner to `/assign` you.',
      msg.message_id,
    );
    return c.json({ ok: true });
  }

  // Commands
  if (text.startsWith('/')) {
    const [cmd, ...rest] = text.split(' ');
    const arg = rest.join(' ').trim();

    switch (cmd) {
      case '/start':
        await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId,
          '🦞 *Clawd OpenAI Trader* — GPT-5.4 Responses API\n\n' +
          'Born with: swap, analyze, trending, wallet, web search, image gen.\n\n' +
          'Commands:\n/generate \\[prompt] — Image gen\n/trade \\[token] \\[side] \\[amount]\n/trending — Trending tokens\n/pnl — PnL card\n/search \\[query] — Web search\n/assign \\[@user] \\[chatId] — Owner only\n/revoke \\[chatId] — Owner only',
        );
        return c.json({ ok: true });

      case '/generate': {
        if (!arg) {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, 'Usage: /generate <prompt>');
          return c.json({ ok: true });
        }
        await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, '🎨 Generating image...');
        const imageUrl = await generateImage(c.env.OPENAI_API_KEY, arg);
        if (imageUrl) {
          await sendPhoto(c.env.TELEGRAM_BOT_TOKEN, chatId, imageUrl, arg);
        } else {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, '❌ Image generation failed.');
        }
        return c.json({ ok: true });
      }

      case '/search': {
        if (!arg) {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, 'Usage: /search <query>');
          return c.json({ ok: true });
        }
        // Use Responses API with web_search tool only
        const searchItems: ResponsesItem[] = [{
          type: 'message',
          role: 'user',
          content: [{ type: 'input_text', text: arg }],
        }];
        const res = await fetch('https://api.openai.com/v1/responses', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${c.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-5.4-nano',
            instructions: 'You are a Solana market research assistant. Provide concise, actionable results.',
            input: searchItems,
            tools: [{ type: 'web_search' }],
            store: false,
          }),
        });
        if (res.ok) {
          const data = await res.json() as { output_text?: string };
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId,
            `🔍 *Search: ${arg}*\n\n${data.output_text ?? 'No results.'}`,
          );
        } else {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, '❌ Search failed.');
        }
        return c.json({ ok: true });
      }

      case '/trending': {
        const reply = await processMessage(c.env, chatId,
          'Get the current trending Solana tokens (1h timeframe). Show top 5 with price, volume, and a brief assessment.',
        );
        await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, reply, msg.message_id);
        return c.json({ ok: true });
      }

      case '/trade': {
        if (!arg) {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId,
            'Usage: /trade <token> <side> <amount>\nExample: /trade SOL buy 0.1',
          );
          return c.json({ ok: true });
        }
        const reply = await processMessage(c.env, chatId,
          `Execute this trade: ${arg}. Analyze the token first, then execute.`,
        );
        await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, reply, msg.message_id);
        return c.json({ ok: true });
      }

      case '/pnl': {
        const reply = await processMessage(c.env, chatId,
          'Generate a PnL summary for my portfolio. Include total value, 24h change, and top positions.',
        );
        await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, reply, msg.message_id);
        return c.json({ ok: true });
      }

      case '/assign': {
        if (String(chatId) !== c.env.OWNER_CHAT_ID) {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, '⛔ Owner only.');
          return c.json({ ok: true });
        }
        const targetId = parseInt(arg, 10);
        if (isNaN(targetId)) {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, 'Usage: /assign <chatId>');
          return c.json({ ok: true });
        }
        await c.env.TRADING_KV.put(`assigned:${targetId}`, 'true');
        await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, `✅ Assigned bot to chat ${targetId}.`);
        return c.json({ ok: true });
      }

      case '/revoke': {
        if (String(chatId) !== c.env.OWNER_CHAT_ID) {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, '⛔ Owner only.');
          return c.json({ ok: true });
        }
        const targetId = parseInt(arg, 10);
        if (isNaN(targetId)) {
          await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, 'Usage: /revoke <chatId>');
          return c.json({ ok: true });
        }
        await c.env.TRADING_KV.delete(`assigned:${targetId}`);
        await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, `✅ Revoked access from chat ${targetId}.`);
        return c.json({ ok: true });
      }

      default:
        // Unknown command — treat as chat
        break;
    }
  }

  // Regular chat — process through Responses API with full tools
  const reply = await processMessage(c.env, chatId, text);
  await sendMessage(c.env.TELEGRAM_BOT_TOKEN, chatId, reply, msg.message_id);
  return c.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Scheduled handler — periodic health checks
// ---------------------------------------------------------------------------
const scheduled: ExportedHandlerScheduledHandler<Env> = async (_event, env, _ctx) => {
  // Health ping to gateway
  if (env.GATEWAY_URL) {
    try {
      await fetch(`${env.GATEWAY_URL}/healthz`, { method: 'GET' });
    } catch { /* gateway down */ }
  }
};

export default {
  fetch: app.fetch,
  scheduled,
};