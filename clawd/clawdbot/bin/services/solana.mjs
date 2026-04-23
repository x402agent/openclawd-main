/**
 * 🦞 MAWD — Helius RPC + Birdeye Token Data Services
 */

export class HeliusService {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.rpcUrl = config.rpcUrl || `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;
        this.wssUrl = config.wssUrl || `wss://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;
    }

    get isConfigured() {
        return !!(this.apiKey || this.rpcUrl);
    }

    async rpc(method, params = []) {
        const res = await fetch(this.rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
        });
        const data = await res.json();
        if (data.error) throw new Error(`RPC error: ${data.error.message}`);
        return data.result;
    }

    async getBalance(address) {
        const lamports = await this.rpc('getBalance', [address]);
        return (lamports?.value || 0) / 1e9;
    }

    async getTokenAccounts(address) {
        return await this.rpc('getTokenAccountsByOwner', [
            address,
            { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
            { encoding: 'jsonParsed' },
        ]);
    }

    async getRecentBlockhash() {
        const result = await this.rpc('getLatestBlockhash');
        return result?.value?.blockhash;
    }

    async getSlot() {
        return await this.rpc('getSlot');
    }

    async getHealth() {
        try {
            const slot = await this.getSlot();
            return { healthy: true, slot };
        } catch {
            return { healthy: false, slot: null };
        }
    }
}

export class BirdeyeService {
    constructor(config) {
        this.apiKey = config.apiKey;
        this.baseUrl = 'https://public-api.birdeye.so';
    }

    get isConfigured() {
        return !!this.apiKey;
    }

    get headers() {
        return {
            'X-API-KEY': this.apiKey,
            'x-chain': 'solana',
        };
    }

    async getTokenPrice(address) {
        const res = await fetch(`${this.baseUrl}/defi/price?address=${address}`, {
            headers: this.headers,
        });
        const data = await res.json();
        return data?.data;
    }

    async getTokenOverview(address) {
        const res = await fetch(`${this.baseUrl}/defi/token_overview?address=${address}`, {
            headers: this.headers,
        });
        const data = await res.json();
        return data?.data;
    }

    async searchToken(keyword) {
        const res = await fetch(
            `${this.baseUrl}/defi/v3/search?chain=solana&keyword=${encodeURIComponent(keyword)}&target=token&sort_by=volume_24h_usd&sort_type=desc&offset=0&limit=5`,
            { headers: this.headers }
        );
        const data = await res.json();
        return data?.data?.items || [];
    }

    async getTrending() {
        const res = await fetch(
            `${this.baseUrl}/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=10`,
            { headers: this.headers }
        );
        const data = await res.json();
        return data?.data?.tokens || [];
    }
}

// Well-known Solana token addresses
export const TOKENS = {
    SOL: 'So11111111111111111111111111111111111111112',
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
    ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
};
