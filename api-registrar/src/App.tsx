import React, { useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

type Step = 'connect' | 'code' | 'tweet' | 'verify' | 'success';

export default function App() {
  const { connected, publicKey, signMessage } = useWallet();
  const [step, setStep] = useState<Step>('connect');
  const [verificationCode, setVerificationCode] = useState<string | null>(null);
  const [tweetUrl, setTweetUrl] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyPrefix, setApiKeyPrefix] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Generate verification code
  const handleGenerateCode = useCallback(async () => {
    if (!publicKey) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Sign message to prove wallet ownership
      const message = `Generate API key for ${publicKey.toBase58()}`;
      const signature = await signMessage?.(new TextEncoder().encode(message));
      
      const response = await fetch('/api/register/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey.toBase58(),
          signature: signature ? Buffer.from(signature).toString('base64') : null,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate code');
      }
      
      const data = await response.json();
      setVerificationCode(data.verificationCode);
      setStep('code');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [publicKey, signMessage]);

  // Step 2: Submit tweet URL
  const handleSubmitTweet = useCallback(async () => {
    if (!tweetUrl || !verificationCode) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/register/verify-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: publicKey?.toBase58(),
          verificationCode,
          tweetUrl,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Verification failed');
      }
      
      const data = await response.json();
      
      if (data.verified) {
        setApiKey(data.apiKey);
        setApiKeyPrefix(data.keyPrefix);
        setStep('success');
      } else {
        setError(data.message || 'Tweet verification failed');
        setStep('tweet');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [tweetUrl, verificationCode, publicKey]);

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-purple-500/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <h1 className="text-xl font-bold text-white">SolanaClawd API</h1>
          </div>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-500" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Get Your API Key</h2>
          <p className="text-purple-200">Verify ownership via X (Twitter) to unlock your API access</p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center gap-2 mb-10">
          {['Connect', 'Get Code', 'Tweet', 'Verify', 'Done'].map((label, i) => {
            const steps: Step[] = ['connect', 'code', 'tweet', 'verify', 'success'];
            const currentIndex = steps.indexOf(step);
            const isActive = i === currentIndex;
            const isComplete = i < currentIndex;
            
            return (
              <div key={label} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${isComplete ? 'bg-green-500 text-white' : ''}
                  ${isActive ? 'bg-purple-500 text-white animate-pulse' : ''}
                  ${!isComplete && !isActive ? 'bg-slate-700 text-slate-400' : ''}
                `}>
                  {isComplete ? '✓' : i + 1}
                </div>
                {i < 4 && <div className={`w-8 h-0.5 ${isComplete ? 'bg-green-500' : 'bg-slate-700'}`} />}
              </div>
            );
          })}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Step 1: Connect Wallet */}
        {step === 'connect' && (
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🔗</div>
            <h3 className="text-xl font-semibold text-white mb-4">Connect Your Wallet</h3>
            <p className="text-slate-400 mb-6">
              Connect your Solana wallet to begin the API registration process
            </p>
            <button
              onClick={handleGenerateCode}
              disabled={!connected || loading}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 
                text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Generate Verification Code'}
            </button>
          </div>
        )}

        {/* Step 2: Get Code */}
        {step === 'code' && verificationCode && (
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-white mb-2">Your Verification Code</h3>
            <p className="text-slate-400 mb-6">
              Copy this code and tweet it on X (Twitter)
            </p>
            
            <div className="bg-slate-900 border-2 border-purple-500/50 rounded-lg p-4 mb-6">
              <div className="text-4xl font-mono font-bold text-purple-300 tracking-wider">
                {verificationCode}
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-sm text-slate-300">
              <p className="font-semibold mb-2">Tweet this exact format:</p>
              <code className="block bg-slate-800 p-2 rounded mt-2 text-purple-300">
                "Verifying my Solana wallet for @SolanaClawd API access. Code: {verificationCode}"
              </code>
            </div>
            
            <button
              onClick={() => setStep('tweet')}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all"
            >
              I've Tweeted It →
            </button>
          </div>
        )}

        {/* Step 3: Submit Tweet URL */}
        {step === 'tweet' && (
          <div className="bg-slate-800/50 backdrop-blur border border-purple-500/20 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">𝕏</div>
            <h3 className="text-xl font-semibold text-white mb-2">Paste Your Tweet URL</h3>
            <p className="text-slate-400 mb-6">
              Paste the URL of your verification tweet below
            </p>
            
            <input
              type="url"
              value={tweetUrl}
              onChange={(e) => setTweetUrl(e.target.value)}
              placeholder="https://x.com/yourusername/status/..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white
                placeholder-slate-500 focus:outline-none focus:border-purple-500 mb-6"
            />
            
            <button
              onClick={handleSubmitTweet}
              disabled={!tweetUrl || loading}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 
                text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed w-full"
            >
              {loading ? 'Verifying...' : 'Verify Tweet'}
            </button>
          </div>
        )}

        {/* Step 4: Success */}
        {step === 'success' && apiKey && (
          <div className="bg-slate-800/50 backdrop-blur border border-green-500/20 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-white mb-2">API Key Generated!</h3>
            <p className="text-slate-400 mb-6">
              Your wallet has been verified. Save your API key below.
            </p>
            
            <div className="bg-slate-900 border-2 border-green-500/50 rounded-lg p-4 mb-4">
              <div className="text-xs text-slate-500 mb-2">API KEY (click to copy)</div>
              <div 
                onClick={() => copyToClipboard(apiKey)}
                className="text-lg font-mono font-bold text-green-300 cursor-pointer hover:text-green-200"
              >
                {apiKey}
              </div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-sm text-slate-300">
              <p><strong>Key Prefix:</strong> {apiKeyPrefix}</p>
              <p className="mt-2 text-yellow-400">⚠️ Save this key now! It won't be shown again.</p>
            </div>
            
            <div className="flex gap-4">
              <a
                href="/docs"
                className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition-all"
              >
                View Docs
              </a>
              <a
                href={`https://api.solanaClawd.com/v1/chat/completions`}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-all"
              >
                Try API →
              </a>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 text-center text-slate-500 text-sm">
          <p>API keys are tied to your Solana wallet address</p>
          <p className="mt-1">Questions? Contact @SolanaClawd</p>
        </div>
      </main>
    </div>
  );
}
