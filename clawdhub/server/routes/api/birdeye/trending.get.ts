import { defineEventHandler, getQuery, createError } from 'h3'
import { birdeyeFetch } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/trending?sort_by=rank&sort_type=asc&limit=20
 * Returns trending tokens from Birdeye.
 */
export default defineEventHandler(async (event) => {
  try {
    const { sort_by, sort_type, limit, offset } = getQuery(event)
    const result = await birdeyeFetch('/defi/token_trending', {
      sort_by: sort_by ? String(sort_by) : 'rank',
      sort_type: sort_type ? String(sort_type) : 'asc',
      offset: offset ? Number(offset) : 0,
      limit: limit ? Number(limit) : 20,
    })
    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch Birdeye trending',
    })
  }
})
