import { defineEventHandler, getQuery, createError } from 'h3'
import { getTokenTrades } from '../../../lib/solanaTracker'

export default defineEventHandler(async (event) => {
  try {
    const { token, wallet } = getQuery(event)

    if (!token) {
      throw createError({ statusCode: 400, message: 'Missing token param' })
    }

    const result = await getTokenTrades(
      String(token),
      wallet ? String(wallet) : undefined,
    )

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch trades',
    })
  }
})
