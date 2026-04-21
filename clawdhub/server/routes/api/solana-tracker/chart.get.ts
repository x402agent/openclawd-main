import { defineEventHandler, getQuery, createError } from 'h3'
import { getChartData } from '../../../lib/solanaTracker'

export default defineEventHandler(async (event) => {
  try {
    const { token, type, marketCap, timeTo } = getQuery(event)

    if (!token) {
      throw createError({ statusCode: 400, message: 'Missing token param' })
    }

    const result = await getChartData({
      tokenAddress: String(token),
      type: type ? String(type) : '1m',
      marketCap: marketCap === 'true',
      timeTo: timeTo ? Number(timeTo) : undefined,
    })

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch chart data',
    })
  }
})
