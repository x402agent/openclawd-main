import { defineEventHandler, createError } from 'h3'

/**
 * GET /api/pageagent/ws
 *
 * Returns the Page Agent extension config for connecting to the SolanaOS Hub.
 * The actual WS bridge runs client-side — the extension injects into the browser
 * and the Hub page communicates via window.PAGE_AGENT_EXT.
 *
 * This endpoint returns connection metadata + the user's auth token for the daemon
 * to know where to send tasks.
 */
export default defineEventHandler(async (event) => {
  return {
    status: 'ok',
    extension: {
      name: 'Page Agent',
      chromeWebStore: 'https://chromewebstore.google.com/detail/page-agent-ext/akldabonmimlicnjlflnapfeklbfemhj',
      api: 'window.PAGE_AGENT_EXT',
    },
    hub: {
      taskEndpoint: '/api/pageagent/task',
      statusEndpoint: '/api/pageagent/status',
    },
    config: {
      baseURL: 'https://gateway.ai.cloudflare.com/v1/18ed6c94a5311ad325315a5cd8bee8cd/default/compat',
      model: 'openai/gpt-5.2',
      note: 'Set your auth token via localStorage.setItem("PageAgentExtUserAuthToken", "your-token")',
    },
  }
})
