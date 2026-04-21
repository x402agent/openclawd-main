import { defineEventHandler, getQuery, createError } from 'h3'
import { getHoldersChart } from '../../../lib/solanaTracker'

export default defineEventHandler(async (event) => {
  try {
    const { token, type, timeFrom, timeTo } = getQuery(event)

    if (!token) {
      throw createError({ statusCode: 400, message: 'Missing token param' })
    }

    const result = await getHoldersChart(
      String(token),
      type ? String(type) : undefined,
      timeFrom ? Number(timeFrom) : undefined,
      timeTo ? Number(timeTo) : undefined,
    )

    return result
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch holders chart data',
    })
  }
})
