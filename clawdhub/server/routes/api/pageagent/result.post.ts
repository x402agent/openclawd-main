import { defineEventHandler, readBody } from 'h3'

/**
 * POST /api/pageagent/result
 *
 * Receives execution results from the Page Agent bridge after the
 * Chrome extension completes a task. Stores the result for retrieval
 * by the Android app or Telegram bot.
 *
 * Body: { taskId: string, success: boolean, data: string }
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const taskId = body?.taskId
  const success = body?.success ?? false
  const data = body?.data ?? ''

  if (!taskId) {
    return { status: 'error', message: 'taskId required' }
  }

  // Log result (in production, persist to Convex or KV)
  console.log(`[PageAgent] Result for ${taskId}: success=${success} data=${String(data).slice(0, 200)}`)

  return {
    status: 'received',
    taskId,
    success,
  }
})
