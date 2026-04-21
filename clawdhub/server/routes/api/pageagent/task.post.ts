import { defineEventHandler, readBody, createError } from 'h3'

/**
 * POST /api/pageagent/task
 *
 * Queues a task for the Page Agent extension running in a connected browser.
 * The browser polls this endpoint or receives the task via SSE/WebSocket.
 *
 * Body: { task: string, config?: { model?, baseURL?, apiKey? } }
 *
 * The SolanaOS daemon calls this endpoint when a user sends /pageagent <task>
 * from Telegram. The Hub page with the extension installed picks it up and executes.
 */

// In-memory task queue (single instance — works for Netlify Functions per-request,
// but for persistent state we'd use Convex or KV. This is a bridge pattern.)
const pendingTasks: Array<{
  id: string
  task: string
  config: Record<string, unknown>
  createdAt: number
  status: 'pending' | 'running' | 'completed' | 'error'
  result?: string
}> = []

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.task || typeof body.task !== 'string') {
    throw createError({ statusCode: 400, message: 'Missing task string' })
  }

  const taskEntry = {
    id: `pa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    task: body.task,
    config: body.config ?? {},
    createdAt: Date.now(),
    status: 'pending' as const,
  }

  pendingTasks.push(taskEntry)

  // Keep only last 20 tasks
  while (pendingTasks.length > 20) pendingTasks.shift()

  return {
    status: 'queued',
    taskId: taskEntry.id,
    task: taskEntry.task,
    note: 'Task queued. A browser with the Page Agent extension will pick it up from /api/pageagent/pending.',
  }
})
