import { defineEventHandler, readBody, createError } from 'h3'

interface NotificationPayload {
  type: 'price_alert' | 'new_token' | 'risk_alert' | 'trade' | 'general'
  title: string
  body: string
  tokenAddress?: string
  data?: Record<string, string>
  // Target: either a specific wallet address or 'broadcast'
  target: string
}

// In-memory store for mobile device registrations
// In production, this would be in a database (Convex)
const deviceRegistry = new Map<string, { pushToken: string; platform: 'ios' | 'android'; walletAddress: string }>()

export default defineEventHandler(async (event) => {
  const payload = await readBody<NotificationPayload>(event)
  if (!payload?.title || !payload?.body) {
    throw createError({ statusCode: 400, message: 'Missing title or body' })
  }

  // For now, store the notification for polling by mobile clients
  // In production, integrate with FCM (Firebase Cloud Messaging) or APNs
  const notification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    ...payload,
    timestamp: Date.now(),
    read: false,
  }

  // Store in a simple queue (in production: Convex mutation)
  if (!globalThis.__notificationQueue) {
    globalThis.__notificationQueue = []
  }
  globalThis.__notificationQueue.push(notification)
  // Keep only last 100 notifications
  if (globalThis.__notificationQueue.length > 100) {
    globalThis.__notificationQueue = globalThis.__notificationQueue.slice(-100)
  }

  return { ok: true, notification }
})
