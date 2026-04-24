import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/wurk")({
  component: WurkPage,
});

function WurkPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      {/* Hero */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-[#0a0a0f] via-[#0f1a2e] to-[#0a0a0f]">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <div className="inline-block px-4 py-1 mb-4 text-xs font-mono tracking-widest text-cyan-400 border border-cyan-900/50 rounded-full bg-cyan-950/20">
            💰 WURK x402 INTEGRATION
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">
            Wurk.fun <span className="text-cyan-400">x402</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Social campaigns, agent-to-human microjobs, and multi-chain settlement on Solana and Base. 
            Powered by Wurk's x402 protocol — no API key required for quick jobs.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">⚡</span> How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-4">1️⃣</div>
              <h3 className="text-lg font-semibold text-white mb-2">Call Endpoint</h3>
              <p className="text-gray-400 text-sm">
                Make a GET request without payment. Returns HTTP 402 with payment requirements and instructions.
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-4">2️⃣</div>
              <h3 className="text-lg font-semibold text-white mb-2">Sign & Pay</h3>
              <p className="text-gray-400 text-sm">
                Retry the same URL with the <code className="text-cyan-400 text-xs">PAYMENT-SIGNATURE</code> header containing your x402 payment.
              </p>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <div className="text-3xl mb-4">3️⃣</div>
              <h3 className="text-lg font-semibold text-white mb-2">Receive Job ID</h3>
              <p className="text-gray-400 text-sm">
                Same endpoint returns HTTP 200 with job details including <code className="text-cyan-400 text-xs">jobId</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Example */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">🎯</span> Buy 50 X Likes on Solana
          </h2>
          <div className="bg-black/50 border border-gray-800 rounded-lg overflow-hidden">
            <div className="flex border-b border-gray-800">
              <button className="px-4 py-2 text-sm font-medium text-cyan-400 border-b-2 border-cyan-400">
                Step 1: Discovery
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-300">
                Step 2: Payment
              </button>
            </div>
            <pre className="p-6 text-sm overflow-x-auto">
              <code className="text-gray-300">
{`# Step 1: Get payment requirements
curl -i "https://wurkapi.fun/solana/xlikes/50?url=https://x.com/user/status/123"

# Response: 402 Payment Required
{
  "x402Version": 2,
  "accepts": [{
    "scheme": "exact",
    "network": "solana",
    "maxAmountRequired": "1250000",
    "payTo": "SAT8g2...",
    "asset": "EPjFWdd5..."
  }]
}`}
              </code>
            </pre>
          </div>
        </section>

        {/* Quick Endpoints */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">🚀</span> Quick Endpoints (No API Key)
          </h2>
          <p className="text-gray-400 mb-8">
            Call the displayed URL directly. First call returns 402 with payment info. Retry with <code className="text-cyan-400">PAYMENT-SIGNATURE</code> header.
          </p>

          <div className="grid gap-6">
            {/* Agent to Human */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Agent to Human</h3>
                    <p className="text-sm text-gray-500">Hire humans for feedback, opinions, and small tasks</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount (USDC)</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">5</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">25</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (1-100)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/agenttohuman
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/agenttohuman
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/agenttohuman
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/agenttohuman
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* X Raid */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">X Raid</h3>
                    <p className="text-sm text-gray-500">Coordinate community raids on Twitter/X</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Size</label>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">small</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">medium</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">large</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/xraid
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/xraid
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/xraid
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/xraid
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* X Raid Premium */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">X Raid Premium</h3>
                    <p className="text-sm text-gray-500">High-priority community raid with scout</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-cyan-400 bg-cyan-950/30 rounded border border-cyan-800/50">2.000 USDC</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Size</label>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">small</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">medium</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">large</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/xraid/scout/small
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/xraid/scout/small
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/xraid/scout/small
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/xraid/scout/small
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* X Likes */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">X Likes</h3>
                    <p className="text-sm text-gray-500">Buy likes on any X/Twitter post</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/xlikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/xlikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/xlikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/xlikes
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* X Followers */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">X Followers</h3>
                    <p className="text-sm text-gray-500">Grow your X/Twitter audience</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-1000)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/xfollowers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/xfollowers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/xfollowers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/xfollowers
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* X Reposts */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">X Reposts</h3>
                    <p className="text-sm text-gray-500">Boost your posts with reposts</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/reposts
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/reposts
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/xreposts
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/xreposts
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* X Comments */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">X Comments</h3>
                    <p className="text-sm text-gray-500">Engage your audience with comments</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/comments
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/comments
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/xcomments
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/xcomments
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* X Bookmarks */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">X Bookmarks</h3>
                    <p className="text-sm text-gray-500">Get your posts bookmarked</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/bookmarks
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/bookmarks
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/xbookmarks
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/xbookmarks
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Dex Rockets */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Dex Rockets</h3>
                    <p className="text-sm text-gray-500">Boost token visibility on DexScreener</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/dex
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/dex
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/dex-rocket
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/dex-rocket
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Pump.fun Comments */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Pump.fun Comments</h3>
                    <p className="text-sm text-gray-500">Engage with Pump.fun token launches</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/pfcomments
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/pfcomments
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/pfcomments
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/pfcomments
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Telegram Members */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Telegram Members</h3>
                    <p className="text-sm text-gray-500">Grow your Telegram community</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-500)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/tgmembers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/tgmembers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/tgmembers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/tgmembers
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Discord Members */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Discord Members</h3>
                    <p className="text-sm text-gray-500">Grow your Discord server</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/dcmembers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/dcmembers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/dcmembers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/dcmembers
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Likes */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Instagram Likes</h3>
                    <p className="text-sm text-gray-500">Boost engagement on Instagram</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/instalikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/instalikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/instalikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/instalikes
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Instagram Followers */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Instagram Followers</h3>
                    <p className="text-sm text-gray-500">Grow your Instagram audience</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-1000)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/instafollowers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/instafollowers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/instafollowers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/instafollowers
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* YouTube Likes */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">YouTube Likes</h3>
                    <p className="text-sm text-gray-500">Boost your YouTube video engagement</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/ytlikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/ytlikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/ytlikes
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/ytlikes
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* YT Subscribers */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">YT Subscribers</h3>
                    <p className="text-sm text-gray-500">Grow your YouTube channel</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-1000)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/ytsubs
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/ytsubs
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/ytsubs
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/ytsubs
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Base App Followers */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Base app Followers</h3>
                    <p className="text-sm text-gray-500">Grow your Base profile</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Amount</label>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                    <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-500)</button>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/basefollowers
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/basefollowers
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* View Submissions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">View Submissions</h3>
                    <p className="text-sm text-gray-500">Retrieve submissions for agent-help jobs</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-cyan-400 bg-cyan-950/30 rounded border border-cyan-800/50">0.001 USDC</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-4">
                  Retrieve all submissions for an agent-help job using your secret code. Param: <code className="text-cyan-400">?secret=...</code> or <code className="text-cyan-400">X-SECRET</code> header
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/agenttohuman/view
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/agenttohuman/view
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Recover Jobs */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">Recover Jobs</h3>
                    <p className="text-sm text-gray-500">Retrieve up to 20 recent paid jobs for your wallet</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-cyan-400 bg-cyan-950/30 rounded border border-cyan-800/50">0.001 USDC</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-4">
                  Lost your secrets? Pay to retrieve recent paid jobs. Auth: <code className="text-cyan-400">PAYMENT-SIGNATURE</code> header verifies wallet ownership
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/agenttohuman/recover
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/agenttohuman/recover
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp/agenttohuman/recover
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/mpp-solana/agenttohuman/recover
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* SIWX Recover Jobs */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white">SIWX Recover Jobs</h3>
                    <p className="text-sm text-gray-500">Recover recent jobs with wallet sign-in (no payment)</p>
                  </div>
                  <span className="px-3 py-1 text-xs font-mono text-purple-400 bg-purple-950/30 rounded border border-purple-800/50">SIWX</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-4">
                  Recover recent agent-to-human jobs with wallet sign-in. Auth: <code className="text-cyan-400">SIGN-IN-WITH-X</code> header from your wallet signature
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/solana/siwx/agenttohuman/recover
                    </code>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                    <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                      wurkapi.fun/base/siwx/agenttohuman/recover
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Vote Services */}
            {["Skeleton", "Moontok", "Major", "CMC", "CoinGecko"].map((name) => (
              <div key={name} className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-800 bg-gray-900/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{name} Votes</h3>
                      <p className="text-sm text-gray-500">Vote on coin listing pages</p>
                    </div>
                    <span className="px-3 py-1 text-xs font-mono text-yellow-400 bg-yellow-950/30 rounded border border-yellow-900/50">dynamic</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-4">
                    <label className="block text-sm text-gray-400 mb-2">Amount</label>
                    <div className="flex gap-2 flex-wrap">
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">10</button>
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">50</button>
                      <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">100</button>
                      <button className="px-4 py-2 bg-cyan-900/50 text-cyan-400 border border-cyan-800/50 rounded text-sm">Dynamic (5-250)</button>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Solana</h4>
                      <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                        wurkapi.fun/solana/{name.toLowerCase()}vote
                      </code>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">x402 - Base</h4>
                      <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                        wurkapi.fun/base/{name.toLowerCase()}vote
                      </code>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - TEMPO</h4>
                      <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                        wurkapi.fun/mpp/{name.toLowerCase()}vote
                      </code>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-3">MPP - SOLANA</h4>
                      <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 break-all">
                        wurkapi.fun/mpp-solana/{name.toLowerCase()}vote
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* MCP Integration */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">🤖</span> MCP (AI Agents)
          </h2>
          <p className="text-gray-400 mb-8">
            Connect your AI agent to Wurk via Model Context Protocol. Your agent gets access to all x402 services plus agent-to-human microjobs.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Endpoint</h3>
              <code className="block p-3 bg-black/50 rounded text-sm text-cyan-400 mb-4">
                https://wurkapi.fun/mcp
              </code>
              <div className="text-sm text-gray-400 space-y-1">
                <p><span className="text-gray-500">Transport:</span> Streamable HTTP</p>
                <p><span className="text-gray-500">Protocol:</span> MCP 2025-11-25</p>
                <p><span className="text-gray-500">Skills:</span> wurkapi.fun/skill.md</p>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">6 Tools Available</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <code className="text-gray-300">wurk_agent_help</code>
                  <span className="text-gray-500">— hire humans for microjobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <code className="text-gray-300">wurk_buy</code>
                  <span className="text-gray-500">— buy likes, followers, raids</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <code className="text-gray-300">wurk_services</code>
                  <span className="text-gray-500">— list all services (free)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <code className="text-gray-300">wurk_job_pay</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <code className="text-gray-300">wurk_direct_pay</code>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400">•</span>
                  <code className="text-gray-300">wurk_job_status</code>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-black/50 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Claude Desktop / Cursor Config</h3>
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-300">{`{
  "mcpServers": {
    "wurk": {
      "url": "https://wurkapi.fun/mcp",
      "transport": "streamable-http"
    }
  }
}`}</code>
            </pre>
          </div>

          <div className="mt-6 bg-black/50 border border-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Test (curl)</h3>
            <pre className="text-sm overflow-x-auto">
              <code className="text-gray-300">{`# Initialize MCP session
curl -X POST https://wurkapi.fun/mcp \\
  -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}}}'

# List available tools
curl -X POST https://wurkapi.fun/mcp \\
  -H "Content-Type: application/json" \\
  -H "mcp-session-id: <session-id-from-above>" \\
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'`}</code>
            </pre>
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">📡</span> Full API Reference
          </h2>

          <div className="space-y-4">
            {/* Create Social Job */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-4">
                <span className="px-3 py-1 text-xs font-mono text-green-400 bg-green-950/30 rounded border border-green-800/50">POST</span>
                <code className="text-sm text-cyan-400">/api/external/jobs/create</code>
                <span className="text-sm text-gray-500">Create Social Job</span>
              </div>
              <div className="p-6">
                <div className="bg-black/50 rounded p-4 text-sm mb-4">
                  <p className="text-gray-400 mb-2">Required headers:</p>
                  <code className="text-cyan-400">X-API-Key: YOUR_API_KEY</code>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">type</span>
                    <code className="text-cyan-400">"social"</code>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">tweet_url</span>
                    <code className="text-cyan-400">string</code>
                    <span className="text-gray-600">X/Twitter status URL</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">jobtype</span>
                    <code className="text-cyan-400">"repost" | "comment" | "repost_comment"</code>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">max_completions</span>
                    <code className="text-cyan-400">number</code>
                    <span className="text-gray-600">25-1000</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">total_usdc</span>
                    <code className="text-cyan-400">number</code>
                    <span className="text-gray-600">≥ max(2.50, 0.025 × max_completions)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Custom Job */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-4">
                <span className="px-3 py-1 text-xs font-mono text-green-400 bg-green-950/30 rounded border border-green-800/50">POST</span>
                <code className="text-sm text-cyan-400">/api/external/jobs/create</code>
                <span className="text-sm text-gray-500">Create Custom Job</span>
              </div>
              <div className="p-6">
                <div className="bg-black/50 rounded p-4 text-sm mb-4">
                  <p className="text-gray-400 mb-2">Job modes:</p>
                  <div className="space-y-1">
                    <code className="text-cyan-400">challenge</code>
                    <span className="text-gray-600">— creative tasks, meme creation, content</span>
                    <br />
                    <code className="text-cyan-400">agent_help</code>
                    <span className="text-gray-600">— hire humans for feedback/opinions</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">type</span>
                    <code className="text-cyan-400">"custom"</code>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">job_mode</span>
                    <code className="text-cyan-400">"challenge" | "agent_help"</code>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">message_markdown</span>
                    <code className="text-cyan-400">string</code>
                    <span className="text-gray-600">Job description</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">max_completions</span>
                    <code className="text-cyan-400">number</code>
                    <span className="text-gray-600">1-500</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">selection_type</span>
                    <code className="text-cyan-400">"creator" | "random"</code>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-500 w-24">total_usdc</span>
                    <code className="text-cyan-400">number</code>
                    <span className="text-gray-600">≥ max(0.01, 0.01 × max_completions) for agent_help</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Get Submissions */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-4">
                <span className="px-3 py-1 text-xs font-mono text-blue-400 bg-blue-950/30 rounded border border-blue-800/50">GET</span>
                <code className="text-sm text-cyan-400">/api/external/jobs/{'{jobId}'}/submissions</code>
                <span className="text-sm text-gray-500">Get Job Submissions</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-4">
                  List submissions for a custom job using the job ID
                </p>
                <pre className="text-sm bg-black/50 p-4 rounded overflow-x-auto">
                  <code className="text-gray-300">{`curl -X GET "https://wurkapi.fun/api/external/jobs/{jobId}/submissions?page=1" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Accept: application/json"`}</code>
                </pre>
              </div>
            </div>

            {/* Choose Winners */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-4">
                <span className="px-3 py-1 text-xs font-mono text-green-400 bg-green-950/30 rounded border border-green-800/50">POST</span>
                <code className="text-sm text-cyan-400">/api/external/jobs/{'{jobId}'}/choose-winners</code>
                <span className="text-sm text-gray-500">Choose Winners</span>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-400 mb-4">
                  Select winners for a custom job with creator selection
                </p>
                <pre className="text-sm bg-black/50 p-4 rounded overflow-x-auto">
                  <code className="text-gray-300">{`curl -X POST "https://wurkapi.fun/api/external/jobs/{jobId}/choose-winners" \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"submissionIds": "id1,id2,id3"}'`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Network Details */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="text-cyan-400">🔗</span> Network Details
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Solana</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Network</span>
                  <code className="text-cyan-400">Solana Mainnet</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">USDC Contract</span>
                  <code className="text-cyan-400">EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <code className="text-cyan-400">SPL Token Transfer</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Receiver</span>
                  <code className="text-cyan-400">SAT8g2xU7AFy7eUmNJ9SNrM6yYo7LDCi13GXJ8Ez9kC</code>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Base</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Network</span>
                  <code className="text-cyan-400">Base Mainnet</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Chain ID</span>
                  <code className="text-cyan-400">8453</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">USDC Contract</span>
                  <code className="text-cyan-400">0x833589fcd6edb6e08f4c7c32d4f71b54bda02913</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Method</span>
                  <code className="text-cyan-400">EIP-3009 Authorization</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Receiver</span>
                  <code className="text-cyan-400">0xF00DAF15713e82fBb7bDC4b818444D93D655DE96</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Documentation Links */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="https://wurkapi.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-cyan-900/30 text-cyan-400 border border-cyan-800/50 rounded-lg hover:bg-cyan-900/50 transition-colors"
            >
              Wurk.fun Documentation →
            </a>
            <a
              href="https://docs.wurk.fun"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-800 text-gray-300 border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors"
            >
              API Reference →
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
