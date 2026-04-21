import { defineEventHandler, getQuery, createError } from 'h3'
import { searchTokens } from '../../../lib/solanaTracker'

export default defineEventHandler(async (event) => {
  try {
    const { query, limit } = getQuery(event)

    if (!query) {
      throw createError({ statusCode: 400, message: 'Missing query param' })
    }

    const result = await searchTokens(String(query), limit ? Number(limit) : 10)

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to search tokens',
    })
  }
})
