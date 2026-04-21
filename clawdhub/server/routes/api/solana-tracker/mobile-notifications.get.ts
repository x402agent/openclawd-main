import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const { wallet, since } = getQuery(event)
  const queue = (globalThis as any).__notificationQueue ?? []
  const sinceTs = since ? Number(since) : 0

  const notifications = queue.filter((n: any) => {
    if (sinceTs && n.timestamp <= sinceTs) return false
    if (wallet && n.target !== 'broadcast' && n.target !== String(wallet)) return false
    return true
  })

  return { notifications }
})
