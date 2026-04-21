/**
 * ClawdRouter — Moonshot AI Direct Integration
 * Bypasses OpenRouter for direct Moonshot API access
 * Use for: Kimi K2.5, Kimi K2.6, Kimi K2 Thinking
 */

import type { ChatCompletionRequest } from '../types.js';

// Moonshot API endpoints
const MOONSHOT_API_URL = 'https://api.moonshot.cn/v1/chat/completions';
const MOONSHOT_MODELS = {
  'moonshot/kimi-k2.5': 'moonshotai/kimi-k2.5-instruct',
  'moonshot/kimi-k2.6': 'moonshotai/kimi-k2.6-instruct',
  'moonshot/kimi-k2-thinking': 'moonshotai/kimi-k2-thinking',
} as const;

export interface MoonshotConfig {
  apiKey: string;
  model?: string;
}

export interface MoonshotChatRequest {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  tools?: unknown[];
  // Moonshot-specific
  reasoning_effort?: number; // 0-1 for thinking models
}

/**
 * Proxy a chat request directly to Moonshot API
 */
export async function proxyToMoonshot(
  request: ChatCompletionRequest,
  config: MoonshotConfig,
): Promise<Response> {
  const { apiKey, model = 'moonshotai/kimi-k2.6-instruct' } = config;

  // Map clawd model ID to Moonshot model name
  const moonshotModel = MOONSHOT_MODELS[request.model as keyof typeof MOONSHOT_MODELS] ?? model;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const body: MoonshotChatRequest = {
    ...request,
    model: moonshotModel,
  };

  // Enable extended thinking for k2-thinking models
  if (request.model === 'moonshot/kimi-k2-thinking') {
    body.reasoning_effort = 0.8;
  }

  const response = await fetch(MOONSHOT_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  return response;
}

/**
 * Check if a model ID is a Moonshot model
 */
export function isMoonshotModel(modelId: string): boolean {
  return modelId.startsWith('moonshot/');
}

/**
 * Get the Moonshot model name from clawd model ID
 */
export function toMoonshotModelId(clawdModelId: string): string {
  return MOONSHOT_MODELS[clawdModelId as keyof typeof MOONSHOT_MODELS] ?? 'moonshotai/kimi-k2.6-instruct';
}