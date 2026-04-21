import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.walletAddress || !body?.pushToken) {
    throw createError({ statusCode: 400, message: 'Missing walletAddress or pushToken' })
  }

  // In production, store in Convex
  if (!globalThis.__deviceRegistry) {
    globalThis.__deviceRegistry = new Map()
  }
  globalThis.__deviceRegistry.set(body.walletAddress, {
    pushToken: body.pushToken,
    platform: body.platform ?? 'android',
    walletAddress: body.walletAddress,
    registeredAt: Date.now(),
  })

  return { ok: true, message: 'Device registered for notifications' }
})
