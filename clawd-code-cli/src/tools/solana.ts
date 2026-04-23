import axios, { type AxiosInstance, isAxiosError } from "axios";
import type { ToolResult } from "../types/index.js";

export class SolanaTool {
  private heliusRpcUrl: string;
  private heliusApiKey: string;
  private birdeyeApiKey: string;
  private birdeyeClient: AxiosInstance;

  constructor() {
    this.heliusRpcUrl = process.env.HELIUS_RPC_URL || "https://mainnet.helius-rpc.com";
    this.heliusApiKey = process.env.HELIUS_API_KEY || "";
    this.birdeyeApiKey = process.env.BIRDEYE_API_KEY || "";

    // Initialize Birdeye API client
    this.birdeyeClient = axios.create({
      baseURL: "https://public-api.birdeye.so",
      headers: {
        "X-API-KEY": this.birdeyeApiKey,
      },
    });
  }

  /**
   * Get asset information using Helius DAS API (getAsset method)
   * Supports NFTs, compressed NFTs (cNFTs), programmable NFTs (pNFTs), and SPL tokens
   */
  async getAsset(assetId: string): Promise<ToolResult> {
    try {
      // Input validation
      if (!assetId || typeof assetId !== 'string') {
        return {
          success: false,
          error: "Asset ID is required and must be a string",
        };
      }

      // Validate Solana address format (base58, 32-44 chars)
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!base58Regex.test(assetId)) {
        return {
          success: false,
          error: "Invalid Solana address format",
        };
      }

      if (!this.heliusApiKey) {
        return {
          success: false,
          error: "HELIUS_API_KEY environment variable is not set",
        };
      }

      const url = `${this.heliusRpcUrl}?api-key=${this.heliusApiKey}`;

      const response = await axios.post(
        url,
        {
          jsonrpc: "2.0",
          id: "1",
          method: "getAsset",
          params: {
            id: assetId,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (response.data.error) {
        return {
          success: false,
          error: `Helius API error: ${response.data.error.message || JSON.stringify(response.data.error)}`,
        };
      }

      const asset = response.data.result;

      // Format the response for better readability
      const formattedResponse = {
        id: asset.id,
        ownership: asset.ownership,
        compression: asset.compression,
        content: asset.content,
        authorities: asset.authorities,
        supply: asset.supply,
        mutable: asset.mutable,
        burnt: asset.burnt,
        token_info: asset.token_info,
        grouping: asset.grouping,
        royalty: asset.royalty,
        creators: asset.creators,
        uses: asset.uses,
      };

      return {
        success: true,
        output: JSON.stringify(formattedResponse, null, 2),
      };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            error: "Request timeout - API took too long to respond",
          };
        }
        if (error.response) {
          return {
            success: false,
            error: `API error: ${error.response.status} ${error.response.statusText}`,
          };
        }
        if (error.request) {
          return {
            success: false,
            error: "Network error - could not reach API",
          };
        }
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to get asset: ${message}`,
      };
    }
  }

  /**
   * Get token price using Birdeye API
   */
  async getPrice(tokenAddress: string): Promise<ToolResult> {
    try {
      // Input validation
      if (!tokenAddress || typeof tokenAddress !== 'string') {
        return {
          success: false,
          error: "Token address is required and must be a string",
        };
      }

      // Validate Solana address format
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!base58Regex.test(tokenAddress)) {
        return {
          success: false,
          error: "Invalid Solana token address format",
        };
      }

      if (!this.birdeyeApiKey) {
        return {
          success: false,
          error: "BIRDEYE_API_KEY environment variable is not set",
        };
      }

      const response = await this.birdeyeClient.get("/defi/price", {
        params: {
          address: tokenAddress,
        },
        timeout: 10000, // 10 second timeout
      });

      if (response.data.success === false) {
        return {
          success: false,
          error: `Birdeye API error: ${response.data.message || "Unknown error"}`,
        };
      }

      const priceData = response.data.data;

      // Format the response
      const formattedResponse = {
        address: priceData.address,
        symbol: priceData.symbol,
        name: priceData.name,
        decimals: priceData.decimals,
        price: priceData.value,
        priceUsd: priceData.value,
        updateUnixTime: priceData.updateUnixTime,
        updateHumanTime: new Date(priceData.updateUnixTime * 1000).toISOString(),
      };

      return {
        success: true,
        output: JSON.stringify(formattedResponse, null, 2),
      };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            error: "Request timeout - API took too long to respond",
          };
        }
        if (error.response) {
          return {
            success: false,
            error: `API error: ${error.response.status} ${error.response.statusText}`,
          };
        }
        if (error.request) {
          return {
            success: false,
            error: "Network error - could not reach API",
          };
        }
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to get price: ${message}`,
      };
    }
  }

  /**
   * Get wallet balance and information
   */
  async getWalletBalance(walletAddress: string): Promise<ToolResult> {
    try {
      // Input validation
      if (!walletAddress || typeof walletAddress !== 'string') {
        return {
          success: false,
          error: "Wallet address is required and must be a string",
        };
      }

      // Validate Solana address format
      const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!base58Regex.test(walletAddress)) {
        return {
          success: false,
          error: "Invalid Solana wallet address format",
        };
      }

      if (!this.heliusApiKey) {
        return {
          success: false,
          error: "HELIUS_API_KEY environment variable is not set",
        };
      }

      const url = `${this.heliusRpcUrl}?api-key=${this.heliusApiKey}`;

      // Get balance using standard Solana RPC
      const balanceResponse = await axios.post(
        url,
        {
          jsonrpc: "2.0",
          id: "1",
          method: "getBalance",
          params: [walletAddress],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      if (balanceResponse.data.error) {
        return {
          success: false,
          error: `Solana RPC error: ${balanceResponse.data.error.message || JSON.stringify(balanceResponse.data.error)}`,
        };
      }

      const lamports = balanceResponse.data.result.value;
      const solBalance = lamports / 1e9;

      // Get token accounts
      const tokenAccountsResponse = await axios.post(
        url,
        {
          jsonrpc: "2.0",
          id: "2",
          method: "getTokenAccountsByOwner",
          params: [
            walletAddress,
            {
              programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
            },
            {
              encoding: "jsonParsed",
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      const tokenAccounts = tokenAccountsResponse.data.result?.value || [];

      const formattedResponse = {
        address: walletAddress,
        solBalance: {
          lamports: lamports,
          sol: solBalance.toFixed(9),
        },
        tokenAccounts: tokenAccounts.map((account: any) => ({
          pubkey: account.pubkey,
          account: {
            data: account.account.data.parsed?.info || account.account.data,
            executable: account.account.executable,
            lamports: account.account.lamports,
            owner: account.account.owner,
            rentEpoch: account.account.rentEpoch,
          },
        })),
      };

      return {
        success: true,
        output: JSON.stringify(formattedResponse, null, 2),
      };
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            error: "Request timeout - API took too long to respond",
          };
        }
        if (error.response) {
          return {
            success: false,
            error: `API error: ${error.response.status} ${error.response.statusText}`,
          };
        }
        if (error.request) {
          return {
            success: false,
            error: "Network error - could not reach API",
          };
        }
      }
      const message = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        error: `Failed to get wallet balance: ${message}`,
      };
    }
  }
}

