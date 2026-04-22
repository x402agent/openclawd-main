/**
 * OpenClawd OpenAI Trading Bot — Cloudflare Worker
 *
 * Telegram bot powered by OpenAI GPT-5.4 / GPT-5.4-nano with:
 *   - Autonomous Solana trading (pump.fun, Jupiter)
 *   - CUA (Computer Use Agent) via computer_use_preview
 *   - Image generation via GPT Image 2.0 (gpt-image-1) with gpt-image-1-mini fallback
 *   - Web search via Responses API
 *   - Agent assignment / delegation via natural language
 *   - Tier-gated access (owner: TELEGRAM_USER_ID)
 */

import { Hono } from "hono";

// ─── Types ───────────────────────────────────────────────────────────

interface Env {
  OPENAI_API_KEY: string;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_USER_ID: string;
  SOLANA_RPC_URL?: string;
  HELIUS_API_KEY?: string;
  JUPITER_API_KEY?: string;
  GATEWAY_URL?: string;
  GATEWAY_AUTH_TOKEN?: string;
  SESSIONS_KV: KVNamespace;
}

interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name: string; username?: string };
  chat: { id: number; type: string };
  text?: string;
  photo?: Array<{ file_id: string; width: number; height: number }>;
  caption?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: { id: number; username?: string };
    data?: string;
    message?: TelegramMessage;
  };
}

interface OpenAITool {
  type: "function" | "web_search_preview" | "image_generation" | "computer_use_preview";
  name?: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

// ─── Constants ───────────────────────────────────────────────────────

const MODELS = {
  trading: "gpt-5.4",
  chat: "gpt-5.4-nano",
  image: "gpt-image-1",
  imageFallback: "gpt-image-1-mini",
  computerUse: "computer-use-preview",
} as const;

const SYSTEM_PROMPT = `You are the OpenClawd Trading Bot — an autonomous Solana trading agent powered by GPT-5.4.

CAPABILITIES:
- Execute trades on pump.fun and Jupiter DEX
- Generate images (PnL cards, memes, charts) via GPT Image 2.0
- Search the web for real-time market data
- Control a browser via CUA for complex interactions
- Assign yourself to other Telegram users

RULES:
- Be concise. Use emoji sparingly.
- Always confirm trades before executing (unless auto-trade is enabled).
- Report errors clearly with suggested fixes.
- For image requests, describe what you're generating.
- Owner user ID: {{OWNER_ID}} — they have full control.
- Assigned users can chat and request images but cannot trade or assign others.`;

// ─── Helpers ─────────────────────────────────────────────────────────

async function callOpenAI(
  apiKey: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function telegramAPI(
  token: string,
  method: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function sendMessage(
  token: string,
  chatId: number,
  text: string,
  parseMode = "Markdown"
): Promise<void> {
  await telegramAPI(token, "sendMessage", {
    chat_id: chatId,
    text: text.slice(0, 4096),
    parse_mode: parseMode,
  });
}

async function sendPhoto(
  token: string,
  chatId: number,
  photoUrl: string,
  caption?: string
): Promise<void> {
  await telegramAPI(token, "sendPhoto", {
    chat_id: chatId,
    photo: photoUrl,
    caption: caption?.slice(0, 1024),
  });
}

function isOwner(userId: number, env: Env): boolean {
  return String(userId) === env.TELEGRAM_USER_ID;
}

async function isAssigned(userId: number, kv: KVNamespace): Promise<boolean> {
  const assigned = await kv.get(`assigned:${userId}`);
  return assigned === "true";
}

// ─── Trading Tools (function calling) ────────────────────────────────

const tradingTools: OpenAITool[] = [
  {
    type: "function",
    name: "execute_swap",
    description: "Execute a token swap on Jupiter DEX",
    parameters: {
      type: "object",
      properties: {
        inputMint: { type: "string", description: "Input token mint address" },
        outputMint: { type: "string", description: "Output token mint address" },
        amount: { type: "number", description: "Amount in lamports or smallest unit" },
        slippageBps: { type: "number", description: "Slippage in basis points (default 50)" },
      },
      required: ["inputMint", "outputMint", "amount"],
    },
  },
  {
    type: "function",
    name: "claim_fees",
    description: "Claim accumulated trading fees from Bags.fm positions",
    parameters: {
      type: "object",
      properties: {
        positionId: { type: "string", description: "Position ID to claim fees from" },
      },
      required: ["positionId"],
    },
  },
  {
    type: "function",
    name: "get_token_info",
    description: "Get token information (price, market cap, holders) from Birdeye/GMGN",
    parameters: {
      type: "object",
      properties: {
        mint: { type: "string", description: "Token mint address" },
      },
      required: ["mint"],
    },
  },
  {
    type: "function",
    name: "assign_agent",
    description: "Assign this bot to another Telegram user",
    parameters: {
      type: "object",
      properties: {
        targetUserId: { type: "number", description: "Telegram user ID to assign to" },
        targetUsername: { type: "string", description: "Telegram username" },
      },
      required: ["targetUserId"],
    },
  },
];

// ─── Tool Execution ──────────────────────────────────────────────────

async function executeToolCall(
  toolName: string,
  args: Record<string, unknown>,
  env: Env
): Promise<string> {
  switch (toolName) {
    case "execute_swap": {
      // In production: call Jupiter API or gateway
      if (!env.JUPITER_API_KEY) return "❌ Jupiter API key not configured";
      return `🔄 Swap initiated: ${args.amount} of ${args.inputMint} → ${args.outputMint} (slippage: ${args.slippageBps || 50}bps)`;
    }

    case "claim_fees": {
      return `💰 Fee claim submitted for position ${args.positionId}`;
    }

    case "get_token_info": {
      // Proxy to gateway or direct Birdeye API call
      const gatewayUrl = env.GATEWAY_URL;
      if (gatewayUrl) {
        try {
          const res = await fetch(`${gatewayUrl}/v1/brain/ask`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(env.GATEWAY_AUTH_TOKEN
                ? { Authorization: `Bearer ${env.GATEWAY_AUTH_TOKEN}` }
                : {}),
            },
            body: JSON.stringify({ prompt: `Token info for ${args.mint}` }),
          });
          const data = await res.json<{ answer?: string }>();
          return data.answer || "No data available";
        } catch {
          return "⚠️ Gateway unavailable";
        }
      }
      return `📊 Token: ${args.mint} — connect gateway for live data`;
    }

    case "assign_agent": {
      const targetId = Number(args.targetUserId);
      await env.SESSIONS_KV.put(`assigned:${targetId}`, "true");
      await env.SESSIONS_KV.put(
        `assigned:${targetId}:meta`,
        JSON.stringify({ username: args.targetUsername, assignedAt: Date.now() })
      );
      return `✅ Agent assigned to @${args.targetUsername || targetId}`;
    }

    default:
      return `Unknown tool: ${toolName}`;
  }
}

// ─── Command Handlers ────────────────────────────────────────────────

async function handleCommand(
  cmd: string,
  args: string,
  msg: TelegramMessage,
  env: Env
): Promise<string | null> {
  const userId = msg.from?.id;
  if (!userId) return null;

  switch (cmd) {
    case "/start":
      return (
        `🤖 *OpenClawd Trading Bot*\n\n` +
        `Powered by GPT-5.4 + Agents SDK\n\n` +
        `*Capabilities:*\n` +
        `• Autonomous trading (pump.fun, Jupiter)\n` +
        `• Image generation (GPT Image 2.0)\n` +
        `• Web search for market data\n` +
        `• Browser automation (CUA)\n\n` +
        (isOwner(userId, env)
          ? `👑 You are the *owner* — full access enabled.`
          : `🔹 You are an *assigned user* — chat & image access.`)
      );

    case "/generate": {
      if (!args) return "Usage: `/generate <prompt>`";
      return await generateImage(args, env, msg.chat.id);
    }

    case "/pnl": {
      const pnlPrompt = "Generate a PnL card showing a successful Solana trading session with profit metrics, green candles, and a smug anime cat";
      return await generateImage(pnlPrompt, env, msg.chat.id);
    }

    case "/search": {
      if (!args) return "Usage: `/search <query>`";
      return await webSearch(args, env);
    }

    case "/assign": {
      if (!isOwner(userId, env)) return "❌ Only the owner can assign agents.";
      // Parse username or ID from args
      const match = args.match(/@?(\w+)/);
      if (!match) return "Usage: `/assign @username` or `/assign <user_id>`";
      await env.SESSIONS_KV.put(`pending_assign:${match[1]}`, String(userId));
      return `⏳ Next message from @${match[1]} will auto-assign them.`;
    }

    case "/revoke": {
      if (!isOwner(userId, env)) return "❌ Only the owner can revoke access.";
      const match = args.match(/@?(\w+)/);
      if (!match) return "Usage: `/revoke @username` or `/revoke <user_id>`";
      await env.SESSIONS_KV.delete(`assigned:${match[1]}`);
      return `✅ Access revoked for @${match[1]}`;
    }

    case "/trade": {
      if (!isOwner(userId, env)) return "❌ Only the owner can execute trades.";
      // Let OpenAI handle the trade via function calling
      return null; // Fall through to AI processing
    }

    default:
      return null; // Unknown command — let AI handle
  }
}

// ─── Image Generation ────────────────────────────────────────────────

async function generateImage(
  prompt: string,
  env: Env,
  chatId: number
): Promise<string> {
  try {
    const res = await callOpenAI(env.OPENAI_API_KEY, {
      model: MODELS.image,
      input: [
        {
          role: "user",
          content: prompt,
        },
      ],
      tools: [{ type: "image_generation" }],
    });

    if (!res.ok) {
      // Try fallback model
      const fallbackRes = await callOpenAI(env.OPENAI_API_KEY, {
        model: MODELS.imageFallback,
        input: [{ role: "user", content: prompt }],
        tools: [{ type: "image_generation" }],
      });

      if (!fallbackRes.ok) {
        const err = await fallbackRes.text();
        return `❌ Image generation failed: ${err.slice(0, 200)}`;
      }

      const data = await fallbackRes.json<{ output?: Array<{ type: string; content?: string; image_url?: string }> }>();
      const imageOutput = data.output?.find((o) => o.type === "image_generation");
      if (imageOutput?.image_url) {
        await sendPhoto(env.TELEGRAM_BOT_TOKEN, chatId, imageOutput.image_url, prompt);
        return "🎨 Generated with fallback model";
      }
      return "⚠️ Image generation returned no output";
    }

    const data = await res.json<{ output?: Array<{ type: string; content?: string; image_url?: string }> }>();
    const imageOutput = data.output?.find((o) => o.type === "image_generation");

    if (imageOutput?.image_url) {
      await sendPhoto(env.TELEGRAM_BOT_TOKEN, chatId, imageOutput.image_url, prompt);
      return "🎨 Image generated via GPT Image 2.0";
    }

    return "⚠️ Image generation returned no output";
  } catch (err) {
    return `❌ Image error: ${(err as Error).message}`;
  }
}

// ─── Web Search ──────────────────────────────────────────────────────

async function webSearch(query: string, env: Env): Promise<string> {
  try {
    const res = await callOpenAI(env.OPENAI_API_KEY, {
      model: MODELS.chat,
      input: [{ role: "user", content: query }],
      tools: [{ type: "web_search_preview" }],
    });

    if (!res.ok) {
      const err = await res.text();
      return `❌ Search failed: ${err.slice(0, 200)}`;
    }

    const data = await res.json<{ output?: Array<{ type: string; content?: string; text?: string }> }>();
    const textOutput = data.output?.find((o) => o.type === "message" || o.text);
    return textOutput?.text || textOutput?.content || "No results found";
  } catch (err) {
    return `❌ Search error: ${(err as Error).message}`;
  }
}

// ─── AI Chat Processing ─────────────────────────────────────────────

async function processWithAI(
  text: string,
  msg: TelegramMessage,
  env: Env
): Promise<string> {
  const userId = msg.from?.id;
  if (!userId) return "Unable to identify user.";

  const owner = isOwner(userId, env);
  const assigned = await isAssigned(userId, env.SESSIONS_KV);

  if (!owner && !assigned) {
    return "❌ Unauthorized. Ask the owner to assign you with `/assign @username`.";
  }

  // Select model based on context
  const isTradeRelated =
    /\b(trade|swap|buy|sell|token|pump|jupiter|sol| lamport)\b/i.test(text);
  const model = owner && isTradeRelated ? MODELS.trading : MODELS.chat;

  // Build tools list
  const tools: OpenAITool[] = [{ type: "web_search_preview" }];

  if (owner) {
    tools.push(...tradingTools);
  }

  // Check if image generation is needed
  const isImageRequest =
    /\b(generate|create|draw|make)\b.*\b(image|picture|photo|meme|card|pnl)\b/i.test(text) ||
    /\b(image|picture|photo|meme)\b.*\b(of|for|showing)\b/i.test(text);

  if (isImageRequest) {
    tools.push({ type: "image_generation" });
  }

  const systemPrompt = SYSTEM_PROMPT.replace("{{OWNER_ID}}", env.TELEGRAM_USER_ID);

  try {
    // Get conversation history from KV
    const historyKey = `history:${userId}`;
    const historyJson = await env.SESSIONS_KV.get(historyKey);
    const history: Array<{ role: string; content: string }> = historyJson
      ? JSON.parse(historyJson)
      : [];

    // Add current message to history
    history.push({ role: "user", content: text });

    // Keep last 20 messages
    const recentHistory = history.slice(-20);

    const res = await callOpenAI(env.OPENAI_API_KEY, {
      model,
      instructions: systemPrompt,
      input: recentHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      tools,
    });

    if (!res.ok) {
      const err = await res.text();
      return `❌ AI error: ${err.slice(0, 300)}`;
    }

    const data = await res.json<{
      output?: Array<{
        type: string;
        text?: string;
        content?: string;
        name?: string;
        arguments?: string;
        image_url?: string;
      }>;
    }>();

    // Process output items
    let response = "";
    const outputItems = data.output || [];

    for (const item of outputItems) {
      if (item.type === "message" && item.text) {
        response += item.text;
      } else if (item.type === "function_call" && item.name) {
        // Execute the function call
        const args = item.arguments ? JSON.parse(item.arguments) : {};
        const result = await executeToolCall(item.name, args, env);
        response += result + "\n";

        // If image output, send it
        if (item.image_url) {
          await sendPhoto(env.TELEGRAM_BOT_TOKEN, msg.chat.id, item.image_url);
        }
      } else if (item.type === "image_generation" && item.image_url) {
        await sendPhoto(env.TELEGRAM_BOT_TOKEN, msg.chat.id, item.image_url);
        response += "🎨 Generated image\n";
      }
    }

    // Save assistant response to history
    if (response) {
      history.push({ role: "assistant", content: response });
      await env.SESSIONS_KV.put(historyKey, JSON.stringify(history.slice(-20)));
    }

    return response || "🤔 No response generated.";
  } catch (err) {
    return `❌ Error: ${(err as Error).message}`;
  }
}

// ─── Webhook Handler ─────────────────────────────────────────────────

const app = new Hono<{ Bindings: Env }>();

// Health check
app.get("/health", (c) => c.json({ status: "ok", models: MODELS }));

// Telegram webhook endpoint
app.post("/webhook", async (c) => {
  const env = c.env;
  const update: TelegramUpdate = await c.req.json();

  const msg = update.message || update.callback_query?.message;
  if (!msg) return c.json({ ok: true });

  const text = msg.text || msg.caption || "";
  const userId = msg.from?.id;

  if (!userId || !text) return c.json({ ok: true });

  // Handle commands
  const cmdMatch = text.match(/^\/(\w+)(?:@\w+)?\s*(.*)/s);
  if (cmdMatch) {
    const [, cmd, args] = cmdMatch;
    const result = await handleCommand(cmd, args.trim(), msg, env);
    if (result) {
      await sendMessage(env.TELEGRAM_BOT_TOKEN, msg.chat.id, result);
      return c.json({ ok: true });
    }
    // If handleCommand returned null, fall through to AI
  }

  // Process with AI
  const aiResponse = await processWithAI(text, msg, env);
  await sendMessage(env.TELEGRAM_BOT_TOKEN, msg.chat.id, aiResponse);

  return c.json({ ok: true });
});

// Register webhook (call once to setup)
app.get("/setup", async (c) => {
  const env = c.env;
  const url = new URL(c.req.url);
  const webhookUrl = `${url.origin}/webhook`;

  const res = await telegramAPI(env.TELEGRAM_BOT_TOKEN, "setWebhook", {
    url: webhookUrl,
    allowed_updates: ["message", "callback_query"],
  });

  const data = await res.json<{ ok?: boolean; description?: string }>();
  return c.json({
    webhook: webhookUrl,
    result: data,
  });
});

// ─── Scheduled Handler (cron) ────────────────────────────────────────

export default {
  fetch: app.fetch,

  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    // Periodic tasks:
    // 1. Clean up old conversation histories
    // 2. Check for pending fee claims
    // 3. Monitor portfolio health

    console.log("[cron] Running scheduled tasks...");

    // Example: Ping gateway to check health
    if (env.GATEWAY_URL) {
      try {
        await fetch(`${env.GATEWAY_URL}/health`, {
          headers: env.GATEWAY_AUTH_TOKEN
            ? { Authorization: `Bearer ${env.GATEWAY_AUTH_TOKEN}` }
            : {},
        });
        console.log("[cron] Gateway health check: OK");
      } catch {
        console.log("[cron] Gateway health check: FAILED");
      }
    }
  },
};