import { defineEventHandler, createError } from 'h3'
import { getBirdeyeWssUrl } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/ws
 * Returns the Birdeye WebSocket URL (with API key embedded).
 * This keeps the API key server-side — the browser fetches this URL once.
 */
export default defineEventHandler(async () => {
  try {
    const wsUrl = getBirdeyeWssUrl()
    return { wsUrl }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to get Birdeye WS URL',
    })
  }
})
