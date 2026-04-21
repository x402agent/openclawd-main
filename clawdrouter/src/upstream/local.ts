/**
 * Local upstream — Ollama / llama.cpp server proxy.
 *
 * Both speak the OpenAI `/v1/chat/completions` shape so one upstream covers
 * both. Ollama's native `/api/tags` is used for model discovery (richer than
 * its OpenAI `/v1/models` shim).
 *
 * Routing convention on the ClawdRouter side:
 *   - `ollama/<name>`   → LOCAL_OLLAMA_BASE_URL (default http://127.0.0.1:11434/v1)
 *   - `llamacpp/<name>` → LOCAL_LLAMACPP_BASE_URL (default http://127.0.0.1:8080/v1)
 *   - `local/<name>`    → LOCAL_OLLAMA_BASE_URL (alias)
 *
 * The bare model name (after the prefix) is what's forwarded to the upstream.
 */

import type { ChatCompletionRequest } from '../types.js';

export interface LocalUpstreamConfig {
  ollamaBaseUrl: string;
  ollamaApiKey: string;
  llamacppBaseUrl: string;
  llamacppApiKey: string;
}

export type LocalTarget = 'ollama' | 'llamacpp';

export interface LocalRouting {
  target: LocalTarget;
  modelId: string;      // Bare model name forwarded to upstream (e.g. "llama3.1:8b")
  baseUrl: string;      // Resolved base URL for the target
  apiKey: string;       // Optional bearer (usually empty/"ollama" for Ollama)
}

const LOCAL_PREFIX = /^(ollama|llamacpp|local)\//i;

export function isLocalModel(modelId: string): boolean {
  return LOCAL_PREFIX.test(modelId);
}

export function resolveLocalRouting(
  modelId: string,
  config: LocalUpstreamConfig,
): LocalRouting {
  const match = modelId.match(LOCAL_PREFIX);
  if (!match) {
    // Default to Ollama if caller passes a bare name.
    return {
      target: 'ollama',
      modelId,
      baseUrl: config.ollamaBaseUrl,
      apiKey: config.ollamaApiKey,
    };
  }

  const prefix = match[1].toLowerCase();
  const bare = modelId.slice(match[0].length);
  if (prefix === 'llamacpp') {
    return {
      target: 'llamacpp',
      modelId: bare,
      baseUrl: config.llamacppBaseUrl,
      apiKey: config.llamacppApiKey,
    };
  }

  return {
    target: 'ollama',
    modelId: bare,
    baseUrl: config.ollamaBaseUrl,
    apiKey: config.ollamaApiKey,
  };
}

function joinUrl(base: string, path: string): string {
  const trimmed = base.replace(/\/$/, '');
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  return `${trimmed}${withSlash}`;
}

export async function proxyToLocal(
  request: ChatCompletionRequest,
  routing: LocalRouting,
): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (routing.apiKey) {
    headers.Authorization = `Bearer ${routing.apiKey}`;
  }

  const body = {
    ...request,
    model: routing.modelId,
  };

  return fetch(joinUrl(routing.baseUrl, '/chat/completions'), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

export interface LocalModelSummary {
  id: string;                   // "ollama/llama3.1:8b"
  name: string;                 // "llama3.1:8b"
  target: LocalTarget;
  sizeBytes?: number;
  family?: string;
  parameterSize?: string;
  quantization?: string;
  modifiedAt?: string;
}

type OllamaTagsResponse = {
  models?: Array<{
    name: string;
    size?: number;
    modified_at?: string;
    details?: {
      family?: string;
      parameter_size?: string;
      quantization_level?: string;
    };
  }>;
};

type OpenAIModelsResponse = {
  data?: Array<{ id: string }>;
};

/**
 * Discover models on the local Ollama instance.
 * Uses `/api/tags` (Ollama-native) — richer than `/v1/models` because it
 * includes size, quantization, and parameter metadata.
 */
export async function listOllamaModels(
  config: LocalUpstreamConfig,
): Promise<LocalModelSummary[]> {
  // Ollama's native tags endpoint sits outside the `/v1` prefix. Strip `/v1`
  // if present so we can hit `${root}/api/tags`.
  const root = config.ollamaBaseUrl.replace(/\/v1\/?$/, '').replace(/\/$/, '');
  try {
    const res = await fetch(`${root}/api/tags`, {
      method: 'GET',
      headers: config.ollamaApiKey
        ? { Authorization: `Bearer ${config.ollamaApiKey}` }
        : undefined,
    });
    if (!res.ok) return [];
    const json = (await res.json()) as OllamaTagsResponse;
    return (json.models ?? []).map((m) => ({
      id: `ollama/${m.name}`,
      name: m.name,
      target: 'ollama' as const,
      sizeBytes: m.size,
      family: m.details?.family,
      parameterSize: m.details?.parameter_size,
      quantization: m.details?.quantization_level,
      modifiedAt: m.modified_at,
    }));
  } catch {
    return [];
  }
}

/**
 * Discover models on a llama.cpp server — it only exposes `/v1/models`
 * (OpenAI-compatible), so metadata is minimal.
 */
export async function listLlamacppModels(
  config: LocalUpstreamConfig,
): Promise<LocalModelSummary[]> {
  try {
    const res = await fetch(joinUrl(config.llamacppBaseUrl, '/models'), {
      method: 'GET',
      headers: config.llamacppApiKey
        ? { Authorization: `Bearer ${config.llamacppApiKey}` }
        : undefined,
    });
    if (!res.ok) return [];
    const json = (await res.json()) as OpenAIModelsResponse;
    return (json.data ?? []).map((m) => ({
      id: `llamacpp/${m.id}`,
      name: m.id,
      target: 'llamacpp' as const,
    }));
  } catch {
    return [];
  }
}

export async function listLocalModels(
  config: LocalUpstreamConfig,
): Promise<LocalModelSummary[]> {
  const [ollama, llamacpp] = await Promise.all([
    listOllamaModels(config),
    listLlamacppModels(config),
  ]);
  return [...ollama, ...llamacpp];
}
