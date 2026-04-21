import { defineEventHandler, getQuery, createError } from 'h3'
import { birdeyeFetch } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/new-listings?limit=50
 * Returns newly listed tokens from Birdeye V3.
 */
export default defineEventHandler(async (event) => {
  try {
    const { limit } = getQuery(event)
    const result = await birdeyeFetch('/defi/v3/token/new-listing', {
      limit: limit ? Number(limit) : 50,
    })
    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch Birdeye new listings',
    })
  }
})
