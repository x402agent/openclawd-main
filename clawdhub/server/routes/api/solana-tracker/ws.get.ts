import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const wsUrl = process.env.WS_URL

    if (!wsUrl) {
      throw createError({
        statusCode: 500,
        message: 'WebSocket URL not configured',
      })
    }

    return {
      wsUrl,
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch WebSocket URL',
    })
  }
})
