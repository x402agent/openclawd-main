/**
 * Birdeye WebSocket datastream client for real-time OHLCV price data.
 * Uses SUBSCRIBE_PRICE for candlestick updates and SUBSCRIBE_TXS for trades.
 * API key is proxied through server route to keep it secure.
 */

type Callback<T = any> = (data: T) => void
type Unsubscribe = () => void

export interface BirdeyeOHLCVData {
  o: number
  h: number
  l: number
  c: number
  v: number
  eventType: string
  type: string
  unixTime: number
  symbol: string
  address: string
}

export interface BirdeyeTxData {
  blockUnixTime: number
  owner: string
  source: string
  txHash: string
  side: 'buy' | 'sell'
  tokenAddress: string
  volumeUSD: number
  tokenPrice: number
  from: { symbol: string; uiAmount: number; address: string }
  to: { symbol: string; uiAmount: number; address: string }
}

interface PriceSubscription {
  address: string
  chartType: string
  currency: string
  callbacks: Set<Callback<BirdeyeOHLCVData>>
}

interface TxSubscription {
  address: string
  callbacks: Set<Callback<BirdeyeTxData>>
}

class BirdeyeDatastream {
  private ws: WebSocket | null = null
  private wsUrl: string
  private priceSubscriptions = new Map<string, PriceSubscription>()
  private txSubscriptions = new Map<string, TxSubscription>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private pingInterval: ReturnType<typeof setInterval> | null = null
  private connected = false
  private reconnectAttempts = 0
  private maxReconnectAttempts = 10

  constructor(wsUrl: string) {
    this.wsUrl = wsUrl
  }

  connect() {
    if (this.ws) return
    try {
      this.ws = new WebSocket(this.wsUrl)
    } catch (e) {
      console.error('[birdeye-ws] Failed to create WebSocket:', e)
      this.scheduleReconnect()
      return
    }

    this.ws.onopen = () => {
      console.log('[birdeye-ws] Connected')
      this.connected = true
      this.reconnectAttempts = 0
      this.startPingPong()
      this.resubscribeAll()
    }

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        switch (msg.type) {
          case 'PRICE_DATA':
            this.handlePriceData(msg.data)
            break
          case 'TXS_DATA':
            this.handleTxData(msg.data)
            break
          case 'WELCOME':
            console.log('[birdeye-ws] Welcome received')
            break
          default:
            break
        }
      } catch { /* ignore parse errors */ }
    }

    this.ws.onclose = () => {
      console.log('[birdeye-ws] Connection closed')
      this.connected = false
      this.ws = null
      this.stopPingPong()
      this.scheduleReconnect()
    }

    this.ws.onerror = (e) => {
      console.error('[birdeye-ws] Error:', e)
      this.ws?.close()
    }
  }

  private startPingPong() {
    this.stopPingPong()
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING' }))
      }
    }, 30_000)
  }

  private stopPingPong() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval)
      this.pingInterval = null
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[birdeye-ws] Max reconnect attempts reached')
      return
    }
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30_000)
    this.reconnectAttempts++
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, delay)
  }

  private resubscribeAll() {
    // Re-send all active price subscriptions
    for (const [, sub] of this.priceSubscriptions) {
      this.sendPriceSubscribe(sub.address, sub.chartType, sub.currency)
    }
    // Re-send all active tx subscriptions
    for (const [, sub] of this.txSubscriptions) {
      this.sendTxSubscribe(sub.address)
    }
  }

  private sendPriceSubscribe(address: string, chartType: string, currency: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({
      type: 'SUBSCRIBE_PRICE',
      data: {
        queryType: 'simple',
        chartType,
        address,
        currency,
      },
    }))
  }

  private sendTxSubscribe(address: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return
    this.ws.send(JSON.stringify({
      type: 'SUBSCRIBE_TXS',
      data: {
        queryType: 'simple',
        address,
        txsType: 'swap',
      },
    }))
  }

  private handlePriceData(data: BirdeyeOHLCVData) {
    const key = data.address
    // Check all subscriptions that match this address
    for (const [, sub] of this.priceSubscriptions) {
      if (sub.address === key) {
        for (const cb of sub.callbacks) {
          try { cb(data) } catch { /* */ }
        }
      }
    }
  }

  private handleTxData(data: BirdeyeTxData) {
    const key = data.tokenAddress
    if (key && this.txSubscriptions.has(key)) {
      const sub = this.txSubscriptions.get(key)!
      for (const cb of sub.callbacks) {
        try { cb(data) } catch { /* */ }
      }
    }
  }

  /**
   * Subscribe to real-time OHLCV price data for a token.
   * Birdeye timeframes: 1s, 15s, 30s, 1m, 3m, 5m, 15m, 30m, 1H, 2H, 4H, 6H, 8H, 12H, 1D, 3D, 1W, 1M
   */
  subscribePrice(
    address: string,
    chartType: string,
    callback: Callback<BirdeyeOHLCVData>,
    currency = 'usd',
  ): Unsubscribe {
    const key = address
    if (!this.priceSubscriptions.has(key)) {
      this.priceSubscriptions.set(key, {
        address,
        chartType,
        currency,
        callbacks: new Set(),
      })
      this.sendPriceSubscribe(address, chartType, currency)
    }
    const sub = this.priceSubscriptions.get(key)!
    sub.callbacks.add(callback)

    return () => {
      sub.callbacks.delete(callback)
      if (sub.callbacks.size === 0) {
        this.priceSubscriptions.delete(key)
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'UNSUBSCRIBE_PRICE' }))
        }
      }
    }
  }

  /**
   * Subscribe to real-time transaction data for a token.
   */
  subscribeTxs(address: string, callback: Callback<BirdeyeTxData>): Unsubscribe {
    if (!this.txSubscriptions.has(address)) {
      this.txSubscriptions.set(address, { address, callbacks: new Set() })
      this.sendTxSubscribe(address)
    }
    const sub = this.txSubscriptions.get(address)!
    sub.callbacks.add(callback)

    return () => {
      sub.callbacks.delete(callback)
      if (sub.callbacks.size === 0) {
        this.txSubscriptions.delete(address)
        if (this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'UNSUBSCRIBE_TXS' }))
        }
      }
    }
  }

  disconnect() {
    this.stopPingPong()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
    this.connected = false
    this.priceSubscriptions.clear()
    this.txSubscriptions.clear()
  }

  isConnected() {
    return this.connected
  }
}

// Singleton
let instance: BirdeyeDatastream | null = null

export async function getBirdeyeDatastream(): Promise<BirdeyeDatastream> {
  if (instance) return instance

  try {
    const res = await fetch('/api/birdeye/ws')
    const { wsUrl } = await res.json()
    instance = new BirdeyeDatastream(wsUrl)
    instance.connect()
  } catch (e) {
    throw new Error('Cannot establish Birdeye datastream connection')
  }
  return instance
}

export function destroyBirdeyeDatastream() {
  instance?.disconnect()
  instance = null
}

export type { BirdeyeDatastream, Callback, Unsubscribe }
