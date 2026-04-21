import { defineEventHandler, getQuery, createError } from 'h3'
import { getLatestTokens } from '../../../lib/solanaTracker'

export default defineEventHandler(async (event) => {
  try {
    const { page } = getQuery(event)

    const result = await getLatestTokens(page ? Number(page) : 1)

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch latest tokens',
    })
  }
})
