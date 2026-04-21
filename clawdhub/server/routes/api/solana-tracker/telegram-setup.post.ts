import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  if (!botToken) throw createError({ statusCode: 500, message: 'TELEGRAM_BOT_TOKEN not configured' })

  const body = await readBody(event)
  const webhookUrl = body?.webhookUrl
  if (!webhookUrl) throw createError({ statusCode: 400, message: 'Missing webhookUrl in body' })

  const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: `${webhookUrl}/api/solana-tracker/telegram` }),
  })
  const data = await res.json()
  return data
})
