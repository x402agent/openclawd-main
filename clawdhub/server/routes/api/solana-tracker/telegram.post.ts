import { defineEventHandler, readBody, createError } from 'h3'
import { getTokenInfo, searchTokens, getTokenRisk, getLatestTokens, getTrendingTokens } from '../../../lib/solanaTracker'

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? ''

async function sendTelegramMessage(chatId: number | string, text: string, parseMode = 'HTML') {
  if (!BOT_TOKEN) return
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: parseMode }),
  })
}

function formatUsd(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`
  return `$${n.toFixed(2)}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body?.message?.text) return { ok: true }

  const chatId = body.message.chat.id
  const text = body.message.text.trim()
  const [cmd, ...args] = text.split(/\s+/)

  try {
    switch (cmd.toLowerCase()) {
      case '/start':
      case '/help': {
        await sendTelegramMessage(chatId, [
          '<b>🔍 SolanaOS Tracker Bot</b>',
          '',
          '/token &lt;address&gt; — Token info & risk score',
          '/search &lt;query&gt; — Search tokens',
          '/trending — Top trending tokens',
          '/latest — Latest new tokens',
          '/rugcheck &lt;address&gt; — Full rug check report',
          '/track &lt;address&gt; — Track wallet (coming soon)',
          '/alerts — Manage price alerts (coming soon)',
          '',
          'Send any token address to get quick info.',
        ].join('\n'))
        break
      }

      case '/token': {
        const address = args[0]
        if (!address) {
          await sendTelegramMessage(chatId, '⚠️ Usage: /token &lt;address&gt;')
          break
        }
        const info = await getTokenInfo(address) as any
        const token = info?.token ?? info
        const pool = info?.pools?.[0] ?? {}
        const risk = info?.risk?.level ?? info?.risk?.score ?? 'N/A'
        await sendTelegramMessage(chatId, [
          `<b>${token?.name ?? 'Unknown'}</b> (${token?.symbol ?? '?'})`,
          `📍 <code>${address}</code>`,
          '',
          `💰 Price: ${token?.price ? formatUsd(token.price) : 'N/A'}`,
          `📊 Market Cap: ${pool?.marketCap?.usd ? formatUsd(pool.marketCap.usd) : 'N/A'}`,
          `💧 Liquidity: ${pool?.liquidity?.usd ? formatUsd(pool.liquidity.usd) : 'N/A'}`,
          `⚠️ Risk Score: ${risk}/10`,
          '',
          `🔗 <a href="https://solscan.io/token/${address}">Solscan</a> | <a href="https://rugcheck.xyz/tokens/${address}">RugCheck</a>`,
        ].join('\n'))
        break
      }

      case '/search': {
        const query = args.join(' ')
        if (!query) {
          await sendTelegramMessage(chatId, '⚠️ Usage: /search &lt;query&gt;')
          break
        }
        const results = (await searchTokens(query, 5)) as any[]
        if (!results?.length) {
          await sendTelegramMessage(chatId, `No results for "${query}"`)
          break
        }
        const lines = results.map((r: any, i: number) =>
          `${i + 1}. <b>${r.name ?? r.symbol}</b> (${r.symbol})\n   <code>${r.mint ?? r.address}</code>`
        )
        await sendTelegramMessage(chatId, `🔍 Search: "${query}"\n\n${lines.join('\n\n')}`)
        break
      }

      case '/trending': {
        const trending = (await getTrendingTokens('1h')) as any[]
        const top = (trending ?? []).slice(0, 10)
        if (!top.length) {
          await sendTelegramMessage(chatId, 'No trending tokens right now.')
          break
        }
        const lines = top.map((t: any, i: number) => {
          const name = t.token?.name ?? t.name ?? '?'
          const symbol = t.token?.symbol ?? t.symbol ?? '?'
          const mc = t.pools?.[0]?.marketCap?.usd ?? t.marketCap
          return `${i + 1}. <b>${name}</b> (${symbol}) — MC: ${mc ? formatUsd(mc) : 'N/A'}`
        })
        await sendTelegramMessage(chatId, `🔥 <b>Trending Tokens (1h)</b>\n\n${lines.join('\n')}`)
        break
      }

      case '/latest': {
        const latest = (await getLatestTokens(1)) as any[]
        const top = (latest ?? []).slice(0, 10)
        if (!top.length) {
          await sendTelegramMessage(chatId, 'No latest tokens found.')
          break
        }
        const lines = top.map((t: any, i: number) => {
          const name = t.token?.name ?? t.name ?? '?'
          const symbol = t.token?.symbol ?? t.symbol ?? '?'
          return `${i + 1}. <b>${name}</b> (${symbol})\n   <code>${t.token?.mint ?? t.mint ?? t.address ?? ''}</code>`
        })
        await sendTelegramMessage(chatId, `🆕 <b>Latest Tokens</b>\n\n${lines.join('\n\n')}`)
        break
      }

      case '/rugcheck': {
        const address = args[0]
        if (!address) {
          await sendTelegramMessage(chatId, '⚠️ Usage: /rugcheck &lt;address&gt;')
          break
        }
        const data = await getTokenRisk(address) as any
        const token = (data?.token as any)?.token ?? data?.token
        const rug = data?.rugCheck
        const riskScore = rug?.score ?? token?.risk?.level ?? 'N/A'
        const riskEmoji = typeof riskScore === 'number'
          ? riskScore <= 3 ? '🟢' : riskScore <= 6 ? '🟡' : '🔴'
          : '⚪'

        const lines = [
          `<b>🔍 Rug Check: ${token?.name ?? address}</b>`,
          '',
          `${riskEmoji} Risk Score: <b>${riskScore}</b>/10`,
        ]

        if (rug?.risks?.length) {
          lines.push('', '<b>Risk Factors:</b>')
          rug.risks.slice(0, 5).forEach((r: any) => {
            lines.push(`  • ${r.name}: ${r.level ?? r.description ?? ''}`)
          })
        }

        if (rug?.topHolders?.length) {
          lines.push('', '<b>Top Holders:</b>')
          rug.topHolders.slice(0, 5).forEach((h: any) => {
            lines.push(`  • ${(h.pct ?? h.percentage ?? 0).toFixed(1)}% — <code>${(h.address ?? '').slice(0, 8)}…</code>`)
          })
        }

        lines.push('', `🔗 <a href="https://rugcheck.xyz/tokens/${address}">Full Report</a>`)
        await sendTelegramMessage(chatId, lines.join('\n'))
        break
      }

      default: {
        // If it looks like a Solana address (32-44 base58 chars), treat as /token
        if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(text)) {
          const info = await getTokenInfo(text) as any
          const token = info?.token ?? info
          const pool = info?.pools?.[0] ?? {}
          await sendTelegramMessage(chatId, [
            `<b>${token?.name ?? 'Unknown'}</b> (${token?.symbol ?? '?'})`,
            `💰 Price: ${token?.price ? formatUsd(token.price) : 'N/A'}`,
            `📊 MC: ${pool?.marketCap?.usd ? formatUsd(pool.marketCap.usd) : 'N/A'}`,
            `💧 Liq: ${pool?.liquidity?.usd ? formatUsd(pool.liquidity.usd) : 'N/A'}`,
            `⚠️ Risk: ${info?.risk?.level ?? 'N/A'}/10`,
            '',
            `Use /token ${text} for full details`,
          ].join('\n'))
        } else {
          await sendTelegramMessage(chatId, 'Unknown command. Send /help for available commands.')
        }
      }
    }
  } catch (e: any) {
    console.error('[telegram]', e)
    await sendTelegramMessage(chatId, `❌ Error: ${e.message ?? 'Something went wrong'}`)
  }

  return { ok: true }
})
