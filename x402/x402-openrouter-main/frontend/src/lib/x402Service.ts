import { wrapFetchWithPayment, decodeXPaymentResponse } from 'x402-fetch';
import type { WalletClient } from 'viem';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PaymentResponse {
  transaction: string;
  amount: string;
  currency: string;
}

export class X402Service {
  private baseURL: string;
  private walletClient: WalletClient;

  constructor(walletClient: WalletClient, baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.walletClient = walletClient;
    this.baseURL = baseURL;
  }

  async sendChatMessage(
    messages: ChatMessage[],
    model: string = 'openai/gpt-4o-mini',
    options: Partial<ChatRequest> = {}
  ): Promise<{ response: ChatResponse; payment: PaymentResponse | null }> {
    // Ensure wallet client has an account before using it
    if (!this.walletClient.account) {
      throw new Error('Wallet client must have an account');
    }

    // Create a proper viem Account object that x402-fetch expects
    const account = {
      address: this.walletClient.account.address,
      publicKey: this.walletClient.account.address,
      source: 'viem',
      type: 'local',
      
      // Core signing methods that x402-fetch requires
      signTypedData: async (args: any) => {
        return await this.walletClient.signTypedData(args);
      },
      signMessage: async (args: any) => {
        return await this.walletClient.signMessage(args);
      },
      signTransaction: async (args: any) => {
        return await this.walletClient.signTransaction(args);
      },
      sendTransaction: async (args: any) => {
        // This is the key method - it should return the transaction hash
        console.log('x402: Sending transaction with args:', args);
        try {
          const hash = await this.walletClient.sendTransaction(args);
          console.log('x402: Transaction sent successfully! Hash:', hash);
          console.log('x402: View on Base Sepolia Explorer:', `https://sepolia.basescan.org/tx/${hash}`);
          return hash;
        } catch (error) {
          console.error('x402: Transaction failed:', error);
          throw error;
        }
      },
      
      // Additional methods that might be expected
      sign: async (args: any) => {
        return await this.walletClient.signMessage(args);
      },
    };

    // Use wrapFetchWithPayment with our account object
    const fetchWithPayment = wrapFetchWithPayment(fetch, account as any);
    
    const requestId = crypto.randomUUID();
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Request-ID': requestId,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.1,
        top_p: options.top_p || 0.9,
        stream: options.stream || false,
        ...options,
      }),
    };

    console.log('Sending chat request with x402 payment...');
    
    return fetchWithPayment(`${this.baseURL}/v1/chat/completions`, requestOptions)
      .then(async response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const body = await response.json();
        const chatResponse: ChatResponse = body;
        
        console.log('\nModel Response:');
        console.log(JSON.stringify(body, null, 2));
        
        let payment: PaymentResponse | null = null;
        
        
        const paymentHeader = response.headers.get("x-payment-response");
        console.log('Pay Respones:', response);
        if (paymentHeader) {
          const paymentResponse = decodeXPaymentResponse(paymentHeader);
          
          payment = {
            transaction: paymentResponse.transaction,
            amount: '0.01',
            currency: 'USDC',
          };
          
          console.log('Transaction Hash:', paymentResponse.transaction);
          
          const confirmationOptions: RequestInit = {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Request-ID": requestId,
              "X-Transaction-Hash": paymentResponse.transaction,
              "X-Payment-Network": paymentResponse.network,
              "X-Payer-Address": paymentResponse.payer,
            },
            body: JSON.stringify({
              requestId,
              transactionHash: paymentResponse.transaction,
              network: paymentResponse.network,
              payer: paymentResponse.payer,
              model: body.model,
              tokens: body.usage?.total_tokens
            })
          };
          
          try {
            const confirmResponse = await fetch(`${this.baseURL}/v1/transaction-log`, confirmationOptions);
            if (confirmResponse.ok) {
              console.log('Transaction Hash:', paymentResponse.transaction);
            } else {
              console.log('Failed to send transaction confirmation:', confirmResponse.status);
            }
                     } catch (error) {
             console.log('Error sending transaction confirmation:', error instanceof Error ? error.message : String(error));
           }
        } else {
          console.log('No payment header found');
        }
        
        return { response: chatResponse, payment };
      })
      .catch(error => {
        console.error("Request failed:", error.message || error);
        if (error.code === 'ECONNREFUSED') {
          console.error("Is the server running on localhost:3001?");
        }
        throw error;
      });
  }

  // Helper method to format messages for the API
  formatMessages(userMessages: string[]): ChatMessage[] {
    return userMessages.map((content, index) => ({
      role: 'user',
      content,
    }));
  }

  // Method to get available models (if the API supports it)
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/v1/models`);
      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || [];
      }
    } catch (error) {
      console.warn('Failed to fetch models:', error);
    }
    
    // Enhanced fallback to common models with better categorization
    return [
      // OpenAI Models
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
      
      // Anthropic Models
      'anthropic/claude-3.5-sonnet',
      
      // Meta Models
      'meta-llama/llama-3.1-8b-instruct',
      'meta-llama/llama-3.1-70b-instruct',
      'meta-llama/llama-3.1-405b-instruct',
      
      // Google Models
      'google/gemini-pro',
      'google/gemini-flash-1.5',
      
      // Other Popular Models
      'mistralai/mistral-7b-instruct',
      'mistralai/mixtral-8x7b-instruct',
      'microsoft/wizardlm-2-8x22b',
      'microsoft/wizardlm-2-7b',
      '01-ai/yi-34b-chat',
      'deepseek-ai/deepseek-coder-33b-instruct',
      'codellama/codellama-34b-instruct',
      'phind/phind-codellama-34b-v2',
    ];
  }

  // Static method to create service from a WalletClient - just like client.ts!
  static createFromWalletClient(walletClient: WalletClient, baseURL?: string): X402Service {
    return new X402Service(walletClient, baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001');
  }
}
