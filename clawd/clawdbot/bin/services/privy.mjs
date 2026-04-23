/**
 * 🦞 MAWD — Privy Agentic Wallet Service
 * Creates and manages server-side wallets via Privy API
 */

const PRIVY_API = 'https://auth.privy.io/api/v1';

export class PrivyWalletService {
    constructor(config) {
        this.appId = config.appId;
        this.appSecret = config.appSecret;
        this.authKeyId = config.authKeyId;
        this.privateKey = config.privateKey;
        this.wallet = null;
        this.walletId = null;
        this.address = null;
        this.policies = [];
    }

    get authHeader() {
        const creds = Buffer.from(`${this.appId}:${this.appSecret}`).toString('base64');
        return `Basic ${creds}`;
    }

    get headers() {
        return {
            'Authorization': this.authHeader,
            'privy-app-id': this.appId,
            'Content-Type': 'application/json',
        };
    }

    get isConfigured() {
        return !!(this.appId && this.appSecret);
    }

    async createWallet(chainType = 'solana') {
        if (!this.isConfigured) throw new Error('Privy credentials not configured');

        const res = await fetch(`${PRIVY_API}/wallets`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({ chain_type: chainType }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Privy wallet creation failed (${res.status}): ${err}`);
        }

        const data = await res.json();
        this.wallet = data;
        this.walletId = data.id;
        this.address = data.address;
        return data;
    }

    async listWallets() {
        if (!this.isConfigured) throw new Error('Privy credentials not configured');

        const res = await fetch(`${PRIVY_API}/wallets`, {
            method: 'GET',
            headers: this.headers,
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Privy list wallets failed (${res.status}): ${err}`);
        }

        return await res.json();
    }

    async getOrCreateWallet(chainType = 'solana') {
        try {
            const existing = await this.listWallets();
            const wallets = existing.data || existing.wallets || existing;

            if (Array.isArray(wallets) && wallets.length > 0) {
                const solWallet = wallets.find(w =>
                    w.chain_type === chainType || w.chain_type === 'solana'
                ) || wallets[0];

                this.wallet = solWallet;
                this.walletId = solWallet.id;
                this.address = solWallet.address;
                return solWallet;
            }
        } catch (e) {
            // Fall through to create
        }

        return await this.createWallet(chainType);
    }

    async createPolicy(policy) {
        if (!this.isConfigured) throw new Error('Privy credentials not configured');

        const res = await fetch(`${PRIVY_API}/policies`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify(policy),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Policy creation failed (${res.status}): ${err}`);
        }

        const data = await res.json();
        this.policies.push(data);
        return data;
    }

    async signTransaction(walletId, transaction) {
        if (!this.isConfigured) throw new Error('Privy credentials not configured');

        const res = await fetch(`${PRIVY_API}/wallets/${walletId}/rpc`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                method: 'signTransaction',
                params: { transaction },
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Transaction signing failed (${res.status}): ${err}`);
        }

        return await res.json();
    }

    async sendTransaction(walletId, params) {
        if (!this.isConfigured) throw new Error('Privy credentials not configured');

        const res = await fetch(`${PRIVY_API}/wallets/${walletId}/rpc`, {
            method: 'POST',
            headers: this.headers,
            body: JSON.stringify({
                method: 'sendTransaction',
                caip2: 'solana:mainnet',
                params,
            }),
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Send transaction failed (${res.status}): ${err}`);
        }

        return await res.json();
    }

    getStatus() {
        return {
            configured: this.isConfigured,
            walletId: this.walletId,
            address: this.address,
            policies: this.policies.length,
        };
    }
}
