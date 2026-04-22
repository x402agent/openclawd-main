'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance, useWalletClient } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import Prism from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import WalletConnect from './WalletConnect';

import { X402Service } from '../lib/x402Service';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  payment?: {
    transaction: string;
    amount: string;
    currency: string;
  };
}

interface Model {
  id: string;
  name?: string;
  description?: string;
  pricing?: {
    prompt?: string;
    completion?: string;
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setModel] = useState('anthropic/claude-3.5-sonnet');
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { data: balance, refetch: refetchBalance } = useBalance({
    address,
    token: '0x036CbD53842c5426634e7929541eC2318f3dCF7c', // USDC on Base Sepolia
  });

  const isCorrectNetwork = true;
  const needsNetworkSwitch = false;

  // Create X402Service instance when wallet is connected
  const [x402Service, setX402Service] = useState<X402Service | null>(null);

  useEffect(() => {
    if (walletClient && isConnected) {
      const service = X402Service.createFromWalletClient(walletClient);
      setX402Service(service);
    } else {
      setX402Service(null);
    }
  }, [walletClient, isConnected]);

  // Fetch models from backend
  useEffect(() => {
    const fetchModels = async () => {
      if (!x402Service) return;
      
      setIsLoadingModels(true);
      try {
        const fetchedModels = await x402Service.getAvailableModels();
        setModels(fetchedModels.map(id => ({ 
          id, 
          name: id.split('/').pop() || id,
          description: `AI model: ${id}`,
          pricing: {
            prompt: '$0.01',
            completion: '$0.01'
          }
        })));
      } catch (error) {
        console.error('Failed to fetch models:', error);
        // Fallback to default models if API fails
        setModels([
          { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'AI model: Claude 3.5 Sonnet', pricing: { prompt: '$0.01', completion: '$0.01' } },
          { id: 'openai/gpt-4o', name: 'GPT-4o', description: 'AI model: GPT-4o', pricing: { prompt: '$0.01', completion: '$0.01' } },
          { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'AI model: GPT-4o Mini', pricing: { prompt: '$0.01', completion: '$0.01' } },
          { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'AI model: Gemini Pro', pricing: { prompt: '$0.01', completion: '$0.01' } },
          { id: 'google/gemini-flash-1.5', name: 'Gemini Flash 1.5', description: 'AI model: Gemini Flash 1.5', pricing: { prompt: '$0.01', completion: '$0.01' } }
        ]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    if (isConnected && isCorrectNetwork && x402Service) {
      fetchModels();
    }
  }, [isConnected, isCorrectNetwork, x402Service]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !isConnected || !isCorrectNetwork || !x402Service) {
      if (!x402Service) {
        setError('Wallet service not available. Please reconnect your wallet.');
      }
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      const { response, payment } = await x402Service.sendChatMessage(
        [{ role: 'user', content: inputMessage }],
        selectedModel
      );
      
      const aiMessage: Message = {
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

      // Log payment information for debugging
      if (payment) {
        console.log('ChatInterface: Payment received:', payment);
        if (payment.transaction && payment.transaction !== 'pending' && payment.transaction !== 'unknown') {
          console.log('ChatInterface: Transaction hash found! View on Base Sepolia:', `https://sepolia.basescan.org/tx/${payment.transaction}`);
        }
      }

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const openTransactionInExplorer = (txHash: string) => {
    window.open(`https://sepolia.basescan.org/tx/${txHash}`, '_blank');
  };

  // Group models by provider
  const getModelProvider = (modelId: string) => {
    if (modelId.startsWith('openai/')) return 'OpenAI';
    if (modelId.startsWith('anthropic/')) return 'Anthropic';
    if (modelId.startsWith('google/')) return 'Google';
    if (modelId.startsWith('meta-llama/')) return 'Meta';
    if (modelId.startsWith('mistralai/')) return 'Mistral AI';
    if (modelId.startsWith('microsoft/')) return 'Microsoft';
    if (modelId.startsWith('deepseek-ai/')) return 'DeepSeek';
    if (modelId.startsWith('codellama/')) return 'Code Llama';
    if (modelId.startsWith('phind/')) return 'Phind';
    if (modelId.startsWith('01-ai/')) return '01.AI';
    return 'Other';
  };

  const getModelDisplayName = (model: Model) => {
    if (model.name) return model.name;
    
    // Extract readable names from IDs
    const id = model.id;
    if (id.includes('claude-3.5-sonnet')) return 'Claude 3.5 Sonnet';
    if (id.includes('gpt-4o')) return id.includes('mini') ? 'GPT-4o Mini' : 'GPT-4o';
    if (id.includes('gpt-4-turbo')) return 'GPT-4 Turbo';
    if (id.includes('gpt-3.5-turbo')) return 'GPT-3.5 Turbo';
    if (id.includes('gemini-pro')) return 'Gemini Pro';
    if (id.includes('gemini-flash')) return 'Gemini Flash 1.5';
    if (id.includes('llama-3.1')) {
      if (id.includes('405b')) return 'Llama 3.1 405B';
      if (id.includes('70b')) return 'Llama 3.1 70B';
      return 'Llama 3.1 8B';
    }
    
    return id.split('/').pop() || id;
  };

  // Get main models (OpenAI, Anthropic, Google)
  const mainModels = models.filter(model => 
    ['openai', 'anthropic', 'google'].some(provider => 
      model.id.startsWith(provider + '/')
    )
  );

  // Get other models
  const otherModels = models.filter(model => 
    !['openai', 'anthropic', 'google'].some(provider => 
      model.id.startsWith(provider + '/')
    )
  );

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#FFFCEC] via-[#FFF8D6] to-[#FFF2C4]">
      {/* Enhanced Header with OpenRouter Branding */}
      <div className="flex items-center justify-between p-4 border-b border-[#004F4F]/10 bg-white/95 backdrop-blur-xl shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#004F4F] to-[#006666] rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#004F4F] to-[#006666] bg-clip-text text-transparent tracking-tight mb-1">
              Ekai Gateway
            </h1>
            <div className="flex items-center space-x-2 text-xs text-[#004F4F]/70 font-medium">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Base Sepolia</span>
              </div>
              {isConnected && balance && (
                <>
                  <span className="text-[#004F4F]/50">•</span>
                  <span className="font-mono font-semibold text-[#004F4F]">
                    {parseFloat(balance.formatted).toFixed(2)} USDC
                  </span>
                  <button
                    onClick={() => refetchBalance()}
                    className="ml-2 p-1.5 text-[#004F4F]/60 hover:text-[#004F4F] hover:bg-[#004F4F]/15 rounded-full transition-all duration-200 border border-[#004F4F]/20 hover:border-[#004F4F]/40"
                    title="Refresh balance"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </>
              )}
            </div>
            {/* OpenRouter Branding */}
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-2 bg-gradient-to-r from-purple-50 to-blue-50 px-2 py-1 rounded-full border border-purple-200">
                <svg className="w-3 h-3 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                <span className="text-xs font-semibold text-purple-700">OpenRouter</span>
              </div>
              <div className="flex items-center space-x-2 bg-gradient-to-r from-green-50 to-emerald-50 px-2 py-1 rounded-full border border-green-200">
                <svg className="w-3 h-3 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span className="text-xs font-semibold text-green-700">x402</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Enhanced Model Selection */}
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => setModel(e.target.value)}
              className="appearance-none bg-white/90 border-2 border-[#004F4F]/20 rounded-xl px-3 py-2 text-sm text-[#004F4F] focus:outline-none focus:border-[#004F4F] focus:ring-4 focus:ring-[#004F4F]/10 font-medium shadow-sm transition-all duration-200 hover:border-[#004F4F]/30 pr-8"
            >
              {/* Main Models */}
              <optgroup label="Main Models">
                {mainModels.length > 0 ? mainModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {getModelDisplayName(model)}
                  </option>
                )) : (
                  <option disabled>Loading models...</option>
                )}
              </optgroup>
              
              {/* Other Models */}
              {otherModels.length > 0 && (
                <optgroup label="Other Models">
                  {otherModels.map((model) => (
                    <option key={model.id} value={model.id}>
                      {getModelDisplayName(model)}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            
            {/* Dropdown Arrow */}
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-[#004F4F]/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          

          
          {/* Wallet Connection */}
          <WalletConnect />
        </div>
      </div>



      {/* Main Chat Area */}
      <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Model Info */}
        {isConnected && (
          <div className="w-64 bg-white/30 backdrop-blur-sm border-r border-[#004F4F]/10 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Current Model Info */}
              <div className="bg-white/80 border border-[#004F4F]/10 rounded-xl p-4 shadow-sm">
                <h3 className="font-semibold text-[#004F4F] text-sm mb-2">Current Model</h3>
                <div className="text-xs text-[#004F4F]/70 mb-1">{getModelDisplayName({ id: selectedModel })}</div>
                <div className="text-xs text-[#004F4F]/50">{selectedModel}</div>
              </div>

              {/* Pricing Info */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                <div className="text-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-sm mx-auto mb-2">
                    $
                  </div>
                  <h3 className="font-semibold text-green-800 text-sm mb-1">Cost per Response</h3>
                  <p className="text-lg font-bold text-green-700">$0.01 USDC</p>
                  <p className="text-xs text-green-600 mt-1">Powered by x402</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-[#004F4F]/70 mt-16">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#004F4F]/10 to-[#006666]/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                    <span className="text-[#004F4F] text-3xl">🤖</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-[#004F4F] bg-gradient-to-r from-[#004F4F] to-[#006666] bg-clip-text text-transparent">
                    Welcome to Ekai Gateway
                  </h2>
                  <p className="text-lg text-[#004F4F]/80 mb-6 max-w-2xl mx-auto leading-relaxed font-medium">
                    {!isConnected 
                      ? 'Connect your Base Sepolia wallet and start chatting with cutting-edge AI models powered by x402 payments'
                      : !x402Service 
                        ? 'Initializing wallet service...'
                        : 'How may I assist you today?'
                    }
                  </p>
                  

                  
                  {!isConnected ? (
                    <div className="max-w-lg mx-auto">
                      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-[#004F4F]/10 shadow-2xl">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#004F4F] to-[#006666] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-[#004F4F] mb-4">Connect Your Wallet</h3>
                        <p className="text-[#004F4F]/70 mb-4 leading-relaxed">
                          Connect your Base Sepolia wallet to start chatting with AI models.
                        </p>
                        <WalletConnect />
                      </div>
                    </div>
                  ) : !x402Service ? (
                    <div className="max-w-lg mx-auto">
                      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-[#004F4F]/10 shadow-2xl">
                        <div className="w-14 h-14 bg-gradient-to-br from-[#004F4F] to-[#006666] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <span className="text-[#004F4F] text-3xl">...</span>
                        </div>
                        <h3 className="text-xl font-bold text-[#004F4F] mb-4">Initializing...</h3>
                        <p className="text-[#004F4F]/70 mb-4 leading-relaxed">
                          Setting up your wallet connection...
                        </p>
                      </div>
                    </div>
                  ) : null}
                  

                </div>
              ) : (
                <>
                  {/* Clear Messages Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={clearMessages}
                      className="bg-white/60 backdrop-blur-sm border border-[#004F4F]/20 rounded-xl px-3 py-1.5 text-sm text-[#004F4F]/70 hover:bg-white/80 hover:text-[#004F4F] transition-all duration-200"
                    >
                      Clear Chat History
                    </button>
                  </div>
                  
                  {/* Enhanced Messages with Transaction Links */}
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-500`}
                    >
                      {/* Message label - positioned above the bubble */}
                      <div className={`text-sm font-semibold mb-2 px-1 ${
                        message.isUser ? 'text-[#004F4F]/80' : 'text-[#004F4F]/70'
                      }`}>
                        {message.isUser ? 'User' : 'Ekai'}
                      </div>
                      
                      <div
                        className={`max-w-xs lg:max-w-2xl px-4 py-3 rounded-3xl shadow-xl backdrop-blur-xl transition-all duration-300 hover:shadow-2xl ${
                          message.isUser
                            ? 'bg-gradient-to-br from-[#004F4F] to-[#006666] text-white rounded-br-lg transform hover:scale-105'
                            : 'bg-white/95 text-[#004F4F] border-2 border-[#004F4F]/10 rounded-bl-lg transform hover:scale-105 hover:border-[#004F4F]/20'
                        }`}
                      >
                        {message.isUser ? (
                          <p className="text-lg leading-relaxed font-medium">{message.text}</p>
                        ) : (
                          <div className="text-lg leading-relaxed font-medium prose prose-sm max-w-none">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                // Custom styling for markdown elements
                                p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-[#004F4F]">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-lg font-bold mb-2 text-[#004F4F]">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-base font-bold mb-2 text-[#004F4F]">{children}</h3>,
                                ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                                ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                                li: ({ children }) => <li className="text-[#004F4F]">{children}</li>,
                                code: ({ children, className }) => {
                                  const isInline = !className;
                                  if (isInline) {
                                    return <code className="bg-[#004F4F]/10 text-[#004F4F] px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
                                  }
                                  
                                  // Extract language from className (e.g., "language-javascript")
                                  const language = className ? className.replace('language-', '') : '';
                                  const codeString = String(children).replace(/\n$/, '');
                                  
                                  // Highlight the code if language is supported
                                  let highlightedCode = codeString;
                                  if (language && Prism.languages[language]) {
                                    try {
                                      highlightedCode = Prism.highlight(codeString, Prism.languages[language], language);
                                    } catch (error) {
                                      console.warn('Prism highlighting failed:', error);
                                    }
                                  }
                                  
                                  return (
                                    <div className="relative">
                                      {language && (
                                        <div className="absolute top-2 right-2 text-xs text-[#004F4F]/60 font-mono bg-[#004F4F]/5 px-2 py-1 rounded">
                                          {language}
                                        </div>
                                      )}
                                      <pre className="bg-[#004F4F]/10 p-3 rounded-lg overflow-x-auto mb-3">
                                        <code 
                                          className="text-sm font-mono text-[#004F4F]"
                                          dangerouslySetInnerHTML={{ __html: highlightedCode }}
                                        />
                                      </pre>
                                    </div>
                                  );
                                },
                                pre: ({ children }) => <pre className="bg-[#004F4F]/10 p-3 rounded-lg overflow-x-auto mb-3">{children}</pre>,
                                blockquote: ({ children }) => <blockquote className="border-l-4 border-[#004F4F]/30 pl-4 italic text-[#004F4F]/80 mb-3">{children}</blockquote>,
                                a: ({ children, href }) => <a href={href} className="text-[#006666] hover:text-[#004F4F] underline" target="_blank" rel="noopener noreferrer">{children}</a>,
                                strong: ({ children }) => <strong className="font-bold text-[#004F4F]">{children}</strong>,
                                em: ({ children }) => <em className="italic text-[#004F4F]/80">{children}</em>,
                                table: ({ children }) => <div className="overflow-x-auto mb-3"><table className="min-w-full border border-[#004F4F]/20 rounded-lg">{children}</table></div>,
                                th: ({ children }) => <th className="border border-[#004F4F]/20 px-3 py-2 bg-[#004F4F]/10 text-left font-semibold text-[#004F4F]">{children}</th>,
                                td: ({ children }) => <td className="border border-[#004F4F]/20 px-3 py-2 text-[#004F4F]">{children}</td>,
                              }}
                            >
                              {message.text}
                            </ReactMarkdown>
                          </div>
                        )}
                        
                        {/* Enhanced Payment Info for AI responses with Transaction Link */}
                        {!message.isUser && message.payment && (
                          <div className="mt-3 pt-3 border-t border-[#004F4F]/20">
                            <div className="flex items-center justify-center">
                              <div className="flex items-center space-x-2 bg-[#004F4F]/10 px-3 py-2 rounded-full">
                                <svg className="w-4 h-4 text-[#004F4F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="font-semibold text-[#004F4F]">Paid: {message.payment.amount} USDC</span>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className={`text-xs mt-2 opacity-80 font-medium ${
                          message.isUser ? 'text-white/80' : 'text-[#004F4F]/60'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Enhanced Loading Indicator */}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/95 backdrop-blur-xl border-2 border-[#004F4F]/20 rounded-3xl rounded-bl-lg px-6 py-4 shadow-xl">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <div className="w-6 h-6 bg-gradient-to-r from-[#004F4F] to-[#006666] rounded-full flex items-center justify-center">
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm text-[#004F4F] font-semibold mb-1">
                              Processing Payment & Generating Response
                            </span>
                            <div className="flex items-center space-x-2 text-xs text-[#004F4F]/70">
                              <span>Using {selectedModel}</span>
                              <span>•</span>
                              <span>Powered by OpenRouter</span>
                            </div>
                            <div className="flex space-x-1 mt-1">
                              <div className="w-1.5 h-1.5 bg-[#004F4F] rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-[#004F4F] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-1.5 h-1.5 bg-[#004F4F] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div className="mx-4 mb-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 mb-1">Something went wrong</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                  <button
                    onClick={clearError}
                    className="p-1 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200"
                    title="Dismiss error"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Enhanced Input Area */}
          <div className="bg-white/95 backdrop-blur-xl border-t border-[#004F4F]/10 shadow-xl">
            <div className="max-w-4xl mx-auto px-8 py-8">
              <div className="flex gap-6 items-end">
                <div className="flex-1 relative">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isConnected ? "Ask me anything... (Press Enter to send, Shift+Enter for new line)" : "Connect your wallet to start chatting..."}
                    rows={1}
                    disabled={isLoading || !isConnected || needsNetworkSwitch}
                    className="w-full resize-none border-2 border-[#004F4F]/20 rounded-3xl px-8 py-5 focus:outline-none focus:border-[#004F4F] focus:ring-4 focus:ring-[#004F4F]/10 bg-white/95 text-[#004F4F] placeholder-[#004F4F]/50 font-medium text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed scrollbar-hide"
                    style={{
                      minHeight: '70px',
                      maxHeight: '160px',
                    }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height = Math.min(target.scrollHeight, 160) + 'px';
                    }}
                  />

                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || !isConnected || isLoading || needsNetworkSwitch}
                  className="bg-gradient-to-br from-[#004F4F] to-[#006666] hover:from-[#006666] hover:to-[#007777] disabled:from-[#004F4F]/30 disabled:to-[#006666]/30 disabled:cursor-not-allowed text-white p-5 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center justify-center min-w-[70px] h-[70px] transform hover:scale-110 disabled:transform-none"
                  title={!isConnected ? 'Connect wallet to send messages' : isLoading ? 'Processing...' : 'Send message'}
                >
                  {isLoading ? (
                    <div className="w-7 h-7 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                  )}
                </button>
              </div>
              
              {/* Status indicators */}
              <div className="mt-4 text-center">
                {!isConnected ? (
                  <div className="inline-flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-full border border-blue-200">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <p className="text-sm text-blue-700 font-medium">
                      Connect wallet to start
                    </p>
                  </div>
                ) : isLoading ? (
                  <div className="inline-flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-full border border-yellow-200">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    <p className="text-sm text-yellow-700 font-medium">
                      Processing payment & generating response...
                    </p>
                </div>
                ) : (
                  <div className="inline-flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <p className="text-sm text-green-700 font-medium">
                      Ready • $0.01 USDC per response
                    </p>
                  </div>
                )}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}