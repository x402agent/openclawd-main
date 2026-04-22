'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useBalance } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';

export default function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Get USDC balance for Base Sepolia
        const { data: balance, refetch: refetchBalance } = useBalance({
          address: account?.address as `0x${string}`,
          token: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const, // USDC on Base Sepolia
          chainId: baseSepolia.id,
        });
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button
                    onClick={openConnectModal}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004F4F] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-[#004F4F] to-[#006666] text-white hover:from-[#006666] hover:to-[#007777] h-12 px-6 py-3 min-w-[180px] shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Connect Wallet
                  </button>
                );
              }

              if (chain.unsupported || chain.id !== baseSepolia.id) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 h-12 px-6 py-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Switch to Base Sepolia
                  </button>
                );
              }

              return (
                <div className="flex items-center space-x-3">
                  <div className="bg-gradient-to-r from-[#004F4F]/10 to-[#006666]/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-[#004F4F]/20 shadow-lg">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-xs font-semibold text-[#004F4F]/80 uppercase tracking-wide">Base Sepolia</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <p className="font-mono text-[#004F4F] font-bold text-sm">
                        {account.displayName}
                      </p>
                      {balance && (
                        <>
                          <span className="text-[#004F4F]/40">•</span>
                          <span className="text-xs font-mono text-[#004F4F]/70">
                            {parseFloat(balance.formatted).toFixed(2)} USDC
                          </span>
                          <button
                            onClick={() => refetchBalance()}
                            className="ml-1.5 p-1 text-[#004F4F]/40 hover:text-[#004F4F]/70 hover:bg-[#004F4F]/10 rounded-full transition-all duration-200"
                            title="Refresh balance"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#004F4F] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-[#004F4F]/30 text-[#004F4F] bg-white/80 backdrop-blur-sm hover:bg-[#004F4F]/5 hover:border-[#004F4F]/50 h-12 w-12 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}