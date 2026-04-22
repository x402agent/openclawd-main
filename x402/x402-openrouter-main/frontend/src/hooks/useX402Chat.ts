import { useState, useCallback, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { X402Service, ChatMessage, ChatRequest } from '../lib/x402Service';

export interface ChatState {
  messages: Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
    payment?: {
      transaction: string;
      amount: string;
      currency: string;
    };
  }>;
  isLoading: boolean;
  error: string | null;
  selectedModel: string;
}

export function useX402Chat() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    selectedModel: 'openai/gpt-4o-mini',
  });

  const [x402Service, setX402Service] = useState<X402Service | null>(null);

  useEffect(() => {
    if (!address || !walletClient) {
      setX402Service(null);
      return;
    }

    // Create service directly from wallet client - much simpler!
    const service = X402Service.createFromWalletClient(walletClient);
    setX402Service(service);
  }, [address, walletClient]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!x402Service || !isConnected) {
      setChatState(prev => ({
        ...prev,
        error: 'Wallet not connected or service not available',
      }));
      return;
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Prepare messages for the API
      const apiMessages: ChatMessage[] = [
        ...chatState.messages.map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text,
        })),
        { role: 'user', content: messageText },
      ];

      // Send the message with payment
      const { response, payment } = await x402Service.sendChatMessage(
        apiMessages,
        chatState.selectedModel
      );

      // Add AI response
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        text: response.choices[0]?.message?.content || 'No response received',
        isUser: false,
        timestamp: new Date(),
        payment: payment ? {
          transaction: payment.transaction,
          amount: payment.amount,
          currency: payment.currency,
        } : undefined,
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));

    } catch (error) {
      console.error('Failed to send message:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
    }
  }, [x402Service, isConnected, chatState.messages, chatState.selectedModel]);

  const clearMessages = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  const setModel = useCallback((model: string) => {
    setChatState(prev => ({
      ...prev,
      selectedModel: model,
    }));
  }, []);

  const clearError = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...chatState,
    sendMessage,
    clearMessages,
    setModel,
    clearError,
    isConnected,
    address,
  };
}
