import { createError, defineEventHandler } from 'h3'
import { getMemescopeAll } from '../../../lib/solanaTracker'

export default defineEventHandler(async () => {
  try {
    const data = await getMemescopeAll()
    return {
      new: data.latest ?? [],
      graduating: data.graduating ?? [],
      graduated: data.graduated ?? [],
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    const msg = error instanceof Error ? error.message : 'Failed to fetch memescope data'
    const is429 = msg.includes('429')
    throw createError({
      statusCode: is429 ? 429 : 500,
      message: msg,
    })
  }
})
