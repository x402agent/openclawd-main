import { defineEventHandler, getQuery, createError } from 'h3'
import { birdeyeFetch } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/trade-data?address=...&frames=1m,5m,1h,24h
 * Returns trade data (buy/sell volumes, wallet counts) from Birdeye V3.
 */
export default defineEventHandler(async (event) => {
  try {
    const { address, frames } = getQuery(event)
    if (!address) throw createError({ statusCode: 400, message: 'Missing address param' })
    const result = await birdeyeFetch('/defi/v3/token/trade-data/single', {
      address: String(address),
      frames: frames ? String(frames) : undefined,
    })
    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch Birdeye trade data',
    })
  }
})
