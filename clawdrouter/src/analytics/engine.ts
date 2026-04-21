/**
 * ClawdRouter — Cloudflare Analytics Engine writer
 *
 * Dataset: `clawd` (bound as `env.clawd`)
 *
 * Schema:
 *   index1      — wallet address (or "anonymous"), used for sampling
 *   blobs[0]    — requested model (what the client asked for)
 *   blobs[1]    — routed model (what clawdrouter actually used)
 *   blobs[2]    — tier: SIMPLE | MEDIUM | COMPLEX | REASONING
 *   blobs[3]    — profile: eco | auto | premium
 *   blobs[4]    — provider: anthropic | openai | xai | ...
 *   blobs[5]    — status: ok | error | payment_required | upstream_error
 *   blobs[6]    — error code (empty when status=ok)
 *   blobs[7]    — client user-agent
 *   doubles[0]  — input tokens
 *   doubles[1]  — output tokens
 *   doubles[2]  — estimated cost (USDC)
 *   doubles[3]  — estimated savings vs premium baseline (USDC)
 *   doubles[4]  — total latency (ms)
 *   doubles[5]  — local routing time (ms)
 *   doubles[6]  — scorer total score (0-100)
 *   doubles[7]  — fallback flag (0 | 1)
 *   doubles[8]  — HTTP status code
 */

export interface ClawdAnalyticsBindings {
  clawd: AnalyticsEngineDataset;
}

export interface ClawdAnalyticsEvent {
  walletAddress?: string;
  requestedModel: string;
  routedModel: string;
  tier: 'SIMPLE' | 'MEDIUM' | 'COMPLEX' | 'REASONING';
  profile: 'eco' | 'auto' | 'premium';
  provider: string;
  status: 'ok' | 'error' | 'payment_required' | 'upstream_error';
  errorCode?: string;
  userAgent?: string;
  inputTokens: number;
  outputTokens: number;
  costUsdc: number;
  savedUsdc: number;
  latencyMs: number;
  routingTimeMs: number;
  totalScore: number;
  fallback: boolean;
  httpStatus: number;
}

export function writeClawdEvent(
  dataset: AnalyticsEngineDataset,
  event: ClawdAnalyticsEvent,
): void {
  dataset.writeDataPoint({
    indexes: [event.walletAddress ?? 'anonymous'],
    blobs: [
      event.requestedModel,
      event.routedModel,
      event.tier,
      event.profile,
      event.provider,
      event.status,
      event.errorCode ?? '',
      event.userAgent ?? '',
    ],
    doubles: [
      event.inputTokens,
      event.outputTokens,
      event.costUsdc,
      event.savedUsdc,
      event.latencyMs,
      event.routingTimeMs,
      event.totalScore,
      event.fallback ? 1 : 0,
      event.httpStatus,
    ],
  });
}
