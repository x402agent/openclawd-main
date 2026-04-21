import { defineEventHandler } from 'h3'

/**
 * GET /api/pageagent/pending
 *
 * Returns pending tasks for the Page Agent bridge to pick up.
 * The bridge (running on solanaos.net) polls this endpoint and
 * executes tasks via the PAGE_AGENT_EXT Chrome extension API.
 *
 * Note: In-memory queue is per-function-invocation on Netlify.
 * For persistence across requests, this should use Convex or KV.
 * This works as a bridge pattern for single-browser-session use.
 */

// Shared reference to the task queue from task.post.ts
// In serverless (Netlify Functions), each request is isolated,
// so we re-export from a shared module. For now, return empty
// and let the bridge work via the task.post.ts in-memory store.

export default defineEventHandler(async () => {
  // In a real deployment, this would read from Convex or KV.
  // The in-memory queue in task.post.ts is per-invocation on Netlify.
  // For local dev or Railway, they share memory.
  return {
    tasks: [],
    note: 'Pending tasks endpoint. In serverless mode, use Convex polling instead.',
  }
})
