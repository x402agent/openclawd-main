import { defineEventHandler, getQuery, createError } from 'h3'
import { getBirdeyeTokenOverview } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/token?address=...
 * Returns comprehensive token overview from Birdeye.
 */
export default defineEventHandler(async (event) => {
  try {
    const { address } = getQuery(event)

    if (!address) {
      throw createError({ statusCode: 400, message: 'Missing address param' })
    }

    const result = await getBirdeyeTokenOverview(String(address))
    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch Birdeye token data',
    })
  }
})
