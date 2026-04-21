import { defineEventHandler, getQuery, createError } from 'h3'
import { getTokenRisk } from '../../../lib/solanaTracker'

export default defineEventHandler(async (event) => {
  try {
    const { address } = getQuery(event)

    if (!address) {
      throw createError({ statusCode: 400, message: 'Missing address param' })
    }

    const result = await getTokenRisk(String(address))

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch token risk data',
    })
  }
})
