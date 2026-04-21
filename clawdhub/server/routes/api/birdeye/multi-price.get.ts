import { defineEventHandler, getQuery, createError } from 'h3'
import { birdeyeFetch } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/multi-price?addresses=addr1,addr2,...
 * Returns current prices for multiple tokens (max 100) from Birdeye.
 */
export default defineEventHandler(async (event) => {
  try {
    const { addresses } = getQuery(event)
    if (!addresses) throw createError({ statusCode: 400, message: 'Missing addresses param' })
    const result = await birdeyeFetch('/defi/multi_price', {
      list_address: String(addresses),
      include_liquidity: 'true',
    })
    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch Birdeye multi-price',
    })
  }
})
