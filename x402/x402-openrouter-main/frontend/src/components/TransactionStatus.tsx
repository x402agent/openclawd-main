'use client';

import { useState } from 'react';

interface TransactionStatusProps {
  transaction: string;
  amount: string;
  currency: string;
  status?: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
}

const BASE_SEPOLIA_EXPLORER = 'https://sepolia.basescan.org';

export default function TransactionStatus({
  transaction,
  amount,
  currency,
  status = 'confirmed',
  timestamp,
}: TransactionStatusProps) {
  const [copied, setCopied] = useState(false);

  const openTransactionInExplorer = () => {
    window.open(`${BASE_SEPOLIA_EXPLORER}/tx/${transaction}`, '_blank');
  };

  const copyTransactionHash = async () => {
    try {
      await navigator.clipboard.writeText(transaction);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy transaction hash:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      case 'confirmed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl border-2 border-[#004F4F]/10 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${getStatusColor()}`}>
            {getStatusIcon()}
          </div>
          <div>
            <h4 className="font-semibold text-[#004F4F] text-sm">
              Payment {status.charAt(0).toUpperCase() + status.slice(1)}
            </h4>
            <p className="text-xs text-[#004F4F]/60">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-lg font-bold text-[#004F4F]">
            {amount} {currency}
          </div>
          <div className="text-xs text-[#004F4F]/60">
            via x402 ($0.01 per response)
          </div>
        </div>
      </div>

      <div className="border-t border-[#004F4F]/10 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#004F4F]/50 font-medium">Transaction Hash:</span>
            <span className="font-mono text-xs text-[#004F4F]/70 bg-[#004F4F]/5 px-2 py-1 rounded-md border border-[#004F4F]/10">
              {transaction.slice(0, 8)}...{transaction.slice(-6)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={copyTransactionHash}
              className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                copied 
                  ? 'bg-green-100 text-green-600 border border-green-200' 
                  : 'bg-[#004F4F]/10 text-[#004F4F]/60 hover:bg-[#004F4F]/20 hover:text-[#004F4F] border border-transparent hover:border-[#004F4F]/20'
              }`}
              title={copied ? 'Copied!' : 'Copy transaction hash'}
            >
              {copied ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>
            
            <button
              onClick={openTransactionInExplorer}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-700 hover:text-blue-800 transition-all duration-200 hover:scale-105"
              title="View transaction on Base Sepolia Explorer"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>View on Base Sepolia</span>
            </button>
          </div>
        </div>
        
        {/* Additional helpful info */}
        {transaction !== 'pending' && transaction !== 'unknown' && (
          <div className="mt-2 text-xs text-[#004F4F]/60 bg-[#004F4F]/5 px-2 py-1 rounded-md border border-[#004F4F]/10">
            💡 Click "View on Base Sepolia" to see transaction details, gas fees, and confirmation status
          </div>
        )}
      </div>
    </div>
  );
}
