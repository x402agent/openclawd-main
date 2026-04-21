import { defineEventHandler, getQuery, createError } from 'h3'
import { getBirdeyeOHLCV } from '../../../lib/birdeye'

/**
 * GET /api/birdeye/ohlcv?address=...&type=1m&timeFrom=...&timeTo=...&currency=usd
 * Returns OHLCV candlestick data from Birdeye for a token address.
 */
export default defineEventHandler(async (event) => {
  try {
    const { address, type, timeFrom, timeTo, currency } = getQuery(event)

    if (!address) {
      throw createError({ statusCode: 400, message: 'Missing address param' })
    }

    const result = await getBirdeyeOHLCV({
      address: String(address),
      type: type ? String(type) : '1m',
      timeFrom: timeFrom ? Number(timeFrom) : undefined,
      timeTo: timeTo ? Number(timeTo) : undefined,
      currency: currency ? String(currency) : undefined,
    })

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch Birdeye OHLCV',
    })
  }
})
