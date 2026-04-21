import { defineEventHandler, getQuery, createError } from 'h3'
import { getWalletBalances, getWalletIdentity } from '../../../lib/solanaTracker'

export default defineEventHandler(async (event) => {
  try {
    const { address } = getQuery(event)

    if (!address) {
      throw createError({ statusCode: 400, message: 'Missing address param' })
    }

    const [balances, identity] = await Promise.all([
      getWalletBalances(String(address)),
      getWalletIdentity(String(address)),
    ])

    return {
      balances,
      identity,
    }
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      throw error
    }
    throw createError({
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Failed to fetch wallet data',
    })
  }
})
