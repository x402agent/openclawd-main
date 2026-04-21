/**
 * Unified Token Data Service
 * Merges data from Solana Tracker (primary discovery/risk) and Birdeye (enriched price/market data).
 * Birdeye provides more accurate real-time pricing, deeper timeframe coverage, and liquidity data.
 * Solana Tracker provides risk scoring, memescope, and holder analytics.
 */

import { birdeyeApi, type BirdeyeMultiPriceItem } from './birdeyeApi'

export interface EnrichedToken {
  // Core identity
  name: string
  symbol: string
  address: string
  image?: string

  // Price data (Birdeye-enriched when available)
  price?: number
  priceSource?: 'birdeye' | 'solanatracker'
  liquidity?: number
  marketCap?: number
  fdv?: number
  volume24h?: number

  // Multi-timeframe price changes (Birdeye)
  priceChange1m?: number
  priceChange5m?: number
  priceChange1h?: number
  priceChange4h?: number
  priceChange24h?: number

  // Risk data (Solana Tracker)
  risk?: number
  holders?: number
  txns?: number

  // Birdeye extras
  uniqueWallet24h?: number
  priceInNative?: number
}

/**
 * Enrich a list of tokens with Birdeye multi-price data.
 * Fetches all prices in a single batch call (up to 100 tokens).
 */
export async function enrichTokensWithBirdeye(
  tokens: Array<{
    address: string
    name?: string
    symbol?: string
    image?: string
    price?: number
    liquidity?: number
    marketCap?: number
    volume24h?: number
    priceChange24h?: number
    risk?: number
    holders?: number
    txns?: number
  }>,
): Promise<EnrichedToken[]> {
  if (tokens.length === 0) return []

  // Batch fetch Birdeye prices for all token addresses
  const addresses = tokens.map((t) => t.address).filter(Boolean)
  let birdeyePrices: Record<string, BirdeyeMultiPriceItem> = {}

  try {
    // Birdeye multi-price supports up to 100 tokens
    const chunks = []
    for (let i = 0; i < addresses.length; i += 100) {
      chunks.push(addresses.slice(i, i + 100))
    }
    const results = await Promise.allSettled(
      chunks.map((chunk) => birdeyeApi.getMultiPrice(chunk)),
    )
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        Object.assign(birdeyePrices, result.value)
      }
    }
  } catch {
    // Birdeye enrichment failed silently — use Solana Tracker data only
  }

  return tokens.map((token) => {
    const bePrice = birdeyePrices[token.address]
    const enriched: EnrichedToken = {
      name: token.name ?? '',
      symbol: token.symbol ?? '',
      address: token.address,
      image: token.image,
      risk: token.risk,
      holders: token.holders,
      txns: token.txns,
      // Use Birdeye price if available (more accurate real-time)
      price: bePrice?.value ?? token.price,
      priceSource: bePrice ? 'birdeye' : 'solanatracker',
      liquidity: bePrice?.liquidity ?? token.liquidity,
      marketCap: token.marketCap,
      volume24h: token.volume24h,
      priceChange24h: bePrice?.priceChange24h ?? token.priceChange24h,
      priceInNative: bePrice?.priceInNative,
    }
    return enriched
  })
}

/**
 * Fetch full Birdeye token overview for a single token.
 * Returns enriched data with multi-timeframe price changes.
 */
export async function getBirdeyeTokenEnriched(address: string): Promise<EnrichedToken | null> {
  try {
    const overview = await birdeyeApi.getToken(address)
    if (!overview) return null

    return {
      name: overview.name,
      symbol: overview.symbol,
      address: overview.address,
      image: overview.logoURI,
      price: overview.price,
      priceSource: 'birdeye',
      liquidity: overview.liquidity,
      marketCap: overview.marketCap,
      fdv: overview.fdv,
      priceChange1m: overview.priceChange1mPercent,
      priceChange5m: overview.priceChange5mPercent,
      priceChange1h: overview.priceChange1hPercent,
      priceChange4h: overview.priceChange4hPercent,
      priceChange24h: overview.priceChange24hPercent,
      uniqueWallet24h: overview.uniqueWallet24h,
      holders: overview.holder,
    }
  } catch {
    return null
  }
}
