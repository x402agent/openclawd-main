/**
 * Page Agent Bridge
 *
 * Polls /api/pageagent/task for pending tasks and executes them
 * via the Page Agent Chrome extension API (window.PAGE_AGENT_EXT).
 *
 * The bridge connects three systems:
 *   Android app  -->  Gateway  -->  /api/pageagent/task  -->  this bridge  -->  Chrome extension
 *   Telegram bot -->  Daemon   -->  /api/pageagent/task  -->  this bridge  -->  Chrome extension
 *
 * Usage: call startPageAgentBridge() once from a top-level layout or root component.
 */

declare global {
  interface Window {
    PAGE_AGENT_EXT_VERSION?: string
    PAGE_AGENT_EXT?: {
      version: string
      execute: (
        task: string,
        config: {
          baseURL: string
          model: string
          apiKey?: string
          includeInitialTab?: boolean
          onStatusChange?: (status: string) => void
          onActivity?: (activity: { type: string; [key: string]: unknown }) => void
        },
      ) => Promise<{ success: boolean; data: string; history: unknown[] }>
      stop: () => void
    }
  }
}

const POLL_INTERVAL_MS = 4_000
const PENDING_ENDPOINT = '/api/pageagent/pending'
const RESULT_ENDPOINT = '/api/pageagent/result'

const DEFAULT_CONFIG = {
  baseURL:
    'https://gateway.ai.cloudflare.com/v1/18ed6c94a5311ad325315a5cd8bee8cd/default/compat',
  model: 'openai/gpt-5.2',
}

interface PendingTask {
  id: string
  task: string
  config: Record<string, unknown>
  createdAt: number
  status: string
}

let bridgeRunning = false
let pollTimer: ReturnType<typeof setInterval> | null = null

async function waitForExtension(timeoutMs = 5_000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (window.PAGE_AGENT_EXT) return true
    await new Promise((r) => setTimeout(r, 200))
  }
  return false
}

async function fetchPendingTasks(): Promise<PendingTask[]> {
  try {
    const res = await fetch(PENDING_ENDPOINT)
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.tasks) ? data.tasks : []
  } catch {
    return []
  }
}

async function reportResult(
  taskId: string,
  result: { success: boolean; data: string },
): Promise<void> {
  try {
    await fetch(RESULT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, ...result }),
    })
  } catch {
    // Best-effort reporting
  }
}

async function executeTask(task: PendingTask): Promise<void> {
  const ext = window.PAGE_AGENT_EXT
  if (!ext) return

  const apiKey =
    (task.config?.apiKey as string) ||
    localStorage.getItem('PageAgentExtUserAuthToken') ||
    ''

  const config = {
    baseURL: (task.config?.baseURL as string) || DEFAULT_CONFIG.baseURL,
    model: (task.config?.model as string) || DEFAULT_CONFIG.model,
    apiKey,
    onStatusChange: (status: string) => {
      console.log(`[PageAgent] Task ${task.id} status: ${status}`)
    },
    onActivity: (activity: { type: string }) => {
      console.log(`[PageAgent] Task ${task.id} activity: ${activity.type}`)
    },
  }

  try {
    console.log(`[PageAgent] Executing task ${task.id}: ${task.task}`)
    const result = await ext.execute(task.task, config)
    console.log(`[PageAgent] Task ${task.id} completed:`, result.success)
    await reportResult(task.id, {
      success: result.success,
      data: result.data,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(`[PageAgent] Task ${task.id} failed:`, message)
    await reportResult(task.id, { success: false, data: message })
  }
}

async function pollOnce(): Promise<void> {
  const tasks = await fetchPendingTasks()
  const pending = tasks.filter((t) => t.status === 'pending')

  if (pending.length === 0) return
  if (!window.PAGE_AGENT_EXT) return

  // Execute oldest pending task
  const task = pending[0]
  await executeTask(task)
}

/**
 * Start the Page Agent bridge.
 * Polls for pending tasks and executes them via the Chrome extension.
 * Safe to call multiple times — only one bridge runs at a time.
 */
export function startPageAgentBridge(): () => void {
  if (bridgeRunning) {
    return () => stopPageAgentBridge()
  }
  bridgeRunning = true

  console.log('[PageAgent] Bridge starting — waiting for extension...')

  waitForExtension().then((found) => {
    if (!found) {
      console.log(
        '[PageAgent] Extension not detected. Bridge will poll and retry.',
      )
    } else {
      console.log(
        `[PageAgent] Extension v${window.PAGE_AGENT_EXT_VERSION || '?'} detected. Bridge active.`,
      )
    }
  })

  pollTimer = setInterval(() => {
    pollOnce().catch((err) =>
      console.error('[PageAgent] Poll error:', err),
    )
  }, POLL_INTERVAL_MS)

  return () => stopPageAgentBridge()
}

export function stopPageAgentBridge(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
  bridgeRunning = false
  console.log('[PageAgent] Bridge stopped.')
}

export function isPageAgentAvailable(): boolean {
  return !!window.PAGE_AGENT_EXT
}
