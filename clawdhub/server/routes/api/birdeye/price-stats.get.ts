import { defineEventHandler, getQuery, createError } from 'h3'
import { getBirdeyePriceStats } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/price-stats?address=...&timeframes=1m,5m,1h,24h
 * Returns price stats (current, high/low, % change) across timeframes from Birdeye.
 */
export default defineEventHandler(async (event) => {
  try {
    const { address, timeframes } = getQuery(event)

    if (!address) {
      throw createError({ statusCode: 400, message: 'Missing address param' })
    }

    const result = await getBirdeyePriceStats(
      String(address),
      timeframes ? String(timeframes) : undefined,
    )
    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch Birdeye price stats',
    })
  }
})
