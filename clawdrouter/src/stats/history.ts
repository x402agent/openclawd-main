/**
 * /v1/stats/history — historical aggregations from Cloudflare Analytics Engine.
 *
 * The Worker can't hit the AE SQL API with just the binding — that's write-only.
 * Reading requires POST-ing SQL to the global Cloudflare API with an auth token
 * that has `Account Analytics: Read` scope. We proxy the query server-side so
 * the token never touches the browser.
 *
 * Query schema (see src/analytics/engine.ts):
 *   blob1 = requested_model
 *   blob2 = routed_model
 *   blob3 = tier           (SIMPLE|MEDIUM|COMPLEX|REASONING)
 *   blob4 = profile        (eco|auto|premium)
 *   blob5 = provider
 *   blob6 = status          (ok|error|payment_required|upstream_error)
 *   double1 = input_tokens
 *   double2 = output_tokens
 *   double3 = cost_usdc
 *   double4 = saved_usdc
 *   double5 = latency_ms
 */

export interface HistoryEnv {
  CLOUDFLARE_ACCOUNT_ID?: string;
  CF_ANALYTICS_TOKEN?: string;
}

const DATASET = 'clawd';

type Window = '1h' | '24h' | '7d' | '30d';

function parseWindow(raw: string | null): Window {
  if (raw === '1h' || raw === '24h' || raw === '7d' || raw === '30d') return raw;
  return '24h';
}

function intervalClause(w: Window): string {
  if (w === '1h') return "timestamp > NOW() - INTERVAL '1' HOUR";
  if (w === '24h') return "timestamp > NOW() - INTERVAL '1' DAY";
  if (w === '7d') return "timestamp > NOW() - INTERVAL '7' DAY";
  return "timestamp > NOW() - INTERVAL '30' DAY";
}

function bucketSize(w: Window): number {
  if (w === '1h') return 60; // 1-min buckets
  if (w === '24h') return 3600; // hourly
  if (w === '7d') return 3600 * 6; // 6-hour
  return 3600 * 24; // daily
}

async function runSQL(env: HistoryEnv, sql: string): Promise<SQLResponse> {
  if (!env.CLOUDFLARE_ACCOUNT_ID || !env.CF_ANALYTICS_TOKEN) {
    throw new Error('missing_ae_credentials');
  }
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/analytics_engine/sql`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.CF_ANALYTICS_TOKEN}`,
      'content-type': 'text/plain',
    },
    body: sql,
  });
  if (!res.ok) {
    throw new Error(`ae_sql_${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as SQLResponse;
}

interface SQLResponse {
  meta: Array<{ name: string; type: string }>;
  data: Array<Record<string, unknown>>;
  rows: number;
}

export interface HistoryResult {
  window: Window;
  bucketSizeSec: number;
  totals: {
    requests: number;
    costUsdc: number;
    savedUsdc: number;
    p50LatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
  };
  buckets: Array<{
    t: number;
    requests: number;
    cost: number;
    saved: number;
  }>;
  byTier: Array<{ tier: string; requests: number; cost: number; saved: number }>;
  byProfile: Array<{ profile: string; requests: number }>;
  byModel: Array<{ model: string; requests: number; cost: number; saved: number }>;
}

export async function fetchHistory(url: URL, env: HistoryEnv): Promise<HistoryResult> {
  const w = parseWindow(url.searchParams.get('window'));
  const where = intervalClause(w);
  const bucket = bucketSize(w);

  const [bucketRes, tierRes, profileRes, modelRes, totalsRes] = await Promise.all([
    runSQL(
      env,
      `SELECT
         intDiv(toUInt32(timestamp), ${bucket}) * ${bucket} AS t,
         count() AS requests,
         sum(double3) AS cost,
         sum(double4) AS saved
       FROM ${DATASET}
       WHERE ${where}
       GROUP BY t
       ORDER BY t`,
    ),
    runSQL(
      env,
      `SELECT blob3 AS tier, count() AS requests, sum(double3) AS cost, sum(double4) AS saved
       FROM ${DATASET}
       WHERE ${where}
       GROUP BY tier`,
    ),
    runSQL(
      env,
      `SELECT blob4 AS profile, count() AS requests
       FROM ${DATASET}
       WHERE ${where}
       GROUP BY profile`,
    ),
    runSQL(
      env,
      `SELECT blob2 AS model, count() AS requests, sum(double3) AS cost, sum(double4) AS saved
       FROM ${DATASET}
       WHERE ${where}
       GROUP BY model
       ORDER BY requests DESC
       LIMIT 12`,
    ),
    runSQL(
      env,
      `SELECT
         count() AS requests,
         sum(double3) AS cost,
         sum(double4) AS saved,
         quantileExact(0.5)(double5) AS p50,
         quantileExact(0.95)(double5) AS p95,
         quantileExact(0.99)(double5) AS p99
       FROM ${DATASET}
       WHERE ${where}`,
    ),
  ]);

  const totalsRow = totalsRes.data[0] ?? {};

  return {
    window: w,
    bucketSizeSec: bucket,
    totals: {
      requests: num(totalsRow['requests']),
      costUsdc: num(totalsRow['cost']),
      savedUsdc: num(totalsRow['saved']),
      p50LatencyMs: num(totalsRow['p50']),
      p95LatencyMs: num(totalsRow['p95']),
      p99LatencyMs: num(totalsRow['p99']),
    },
    buckets: bucketRes.data.map((row) => ({
      t: num(row['t']) * 1000,
      requests: num(row['requests']),
      cost: num(row['cost']),
      saved: num(row['saved']),
    })),
    byTier: tierRes.data.map((row) => ({
      tier: str(row['tier']) || 'UNKNOWN',
      requests: num(row['requests']),
      cost: num(row['cost']),
      saved: num(row['saved']),
    })),
    byProfile: profileRes.data.map((row) => ({
      profile: str(row['profile']) || 'unknown',
      requests: num(row['requests']),
    })),
    byModel: modelRes.data.map((row) => ({
      model: str(row['model']) || 'unknown',
      requests: num(row['requests']),
      cost: num(row['cost']),
      saved: num(row['saved']),
    })),
  };
}

function num(v: unknown): number {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : '';
}
