import { defineEventHandler, getQuery, createError } from 'h3'
import { getTrendingTokens } from '../../../lib/solanaTracker'

export default defineEventHandler(async (event) => {
  try {
    const { period } = getQuery(event)

    const result = await getTrendingTokens(period ? String(period) : '1h')

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch trending tokens',
    })
  }
})
