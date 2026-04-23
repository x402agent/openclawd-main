'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useUserStore } from '@/stores'
import { ArrowRight, BookOpen, FileText, PenTool, Search, GitBranch, Zap, Brain, Users } from 'lucide-react'
import { WalletConnectButton } from '@/components/auth/WalletConnectButton'

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const RESEARCH_TREE = [
  { label: 'Overview', active: true, depth: 0 },
  { label: 'Solana DeFi', depth: 0, folder: true },
  { label: 'Pump.fun Tokens', depth: 1 },
  { label: 'Jupiter Routes', depth: 1 },
  { label: 'Lobster Agents', depth: 0, folder: true },
  { label: 'OODA Trader', depth: 1 },
  { label: 'Market Alpha', depth: 0 },
]

export default function LandingPage() {
  const user = useUserStore((s) => s.user)
  const router = useRouter()

  React.useEffect(() => {
    if (user) router.replace('/wikis')
  }, [user, router])

  return (
    <div className="min-h-svh bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 lg:px-10 h-14 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <span className="flex items-center gap-2.5 text-sm font-semibold tracking-tight">
          <img
            src="https://raw.githubusercontent.com/x402agent/openclawd/main/gfx/lobster.svg"
            alt="🦞 OpenClawd"
            width={28}
            height={28}
            className="logo-clawd-glow rounded-md"
          />
          <span className="text-primary font-bold">OpenClawd</span>
          <span className="text-muted-foreground/60">AutoResearch</span>
        </span>
        <div className="flex items-center gap-5">
          <Link
            href="https://github.com/x402agent/openclawd"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub
          </Link>
          <Link
            href="https://solanaclawd.com"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Website
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <WalletConnectButton variant="compact" />
          <Link
            href="/signup"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary text-primary-foreground px-4 py-1.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get started
            <ArrowRight className="size-3.5 opacity-70" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 lg:px-10">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="logo-clawd-glow-ring" />
              <img
                src="https://raw.githubusercontent.com/x402agent/openclawd/main/gfx/lobster.svg"
                alt="🦞 OpenClawd Logo"
                width={140}
                height={140}
                className="logo-clawd-glow relative z-10 rounded-xl"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
          >
            <div className="badge-clawd mb-4">
              <span>49</span>
              <span className="text-primary/70">·</span>
              <span>Metaplex Lobster Agents</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
              <span className="text-primary">OpenClawd</span>
              <br />
              <span className="text-foreground/90">AutoResearch</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease }}
            className="mt-6 text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
          >
            Self-improving knowledge engine for Solana blockchain and DeFi — inspired by{' '}
            <span className="text-foreground font-medium">Andrej Karpathy's</span>{' '}
            approach to AI research. Let the agents teach themselves.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease }}
            className="mt-9 flex items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Start Researching
              <ArrowRight className="size-3.5 opacity-70" />
            </Link>
            <Link
              href="https://github.com/x402agent/openclawd"
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              GitHub
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-6 lg:px-10 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease }}
          className="max-w-5xl mx-auto"
        >
          <div className="bg-card rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-primary/40" />
                <div className="size-2.5 rounded-full bg-accent-blue/40" />
                <div className="size-2.5 rounded-full bg-muted" />
              </div>
              <div className="flex-1 flex justify-center">
                <span className="text-xs text-muted-foreground/50 font-mono">
                  research.solanaclawd.com
                </span>
              </div>
              <div className="w-14" />
            </div>

            <div className="flex min-h-[400px]">
              {/* Sidebar */}
              <div className="w-52 shrink-0 border-r border-border p-3 hidden sm:block">
                <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
                  <Search className="size-3 text-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground/30">Search...</span>
                </div>
                <div className="space-y-0.5">
                  {RESEARCH_TREE.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs ${
                        item.active
                          ? 'bg-primary/10 font-medium text-primary'
                          : 'text-muted-foreground'
                      }`}
                      style={{ paddingLeft: `${item.depth * 14 + 8}px` }}
                    >
                      {item.folder ? (
                        <GitBranch className="size-3 opacity-40" />
                      ) : (
                        <FileText className="size-3 opacity-40" />
                      )}
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-8 sm:p-10">
                <div className="max-w-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-semibold tracking-tight">Overview</h2>
                    <span className="badge-clawd text-[10px]">LIVE</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-6">
                    12 sources &middot; 49 agents &middot; Updated 2h ago
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    This vault tracks Solana memecoin rotation, DeFi strategies, wallet behavior, and protocol catalysts for autonomous financial agents.
                    49 Metaplex Lobster Agents research around the clock.
                  </p>
                  <h3 className="text-sm font-semibold mt-5 mb-2 text-primary">Key Findings</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                    Smart-money wallet inflows rotating from majors into{' '}
                    <span className="font-medium text-foreground">high-beta Solana assets</span> —
                    pump.fun graduation signals and Birdeye alerts are now linked inside one dossier.
                  </p>
                  <h3 className="text-sm font-semibold mt-5 mb-2">Recent Agent Research</h3>
                  <ul className="space-y-1 ml-4">
                    <li className="text-sm text-muted-foreground list-disc">🦞 <span className="text-primary">lobster-trader-01</span>: Detected $CLAWD accumulation pattern</li>
                    <li className="text-sm text-muted-foreground list-disc">📊 pump.fun graduation: 3 tokens flagged for observation</li>
                    <li className="text-sm text-muted-foreground list-disc">⚠️ Jupiter routing: Fee optimization detected</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto border-t border-border" />

      {/* Three Layers */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              <span className="text-primary">49 Lobster Agents</span>
              <br />
              <span className="text-foreground/80">Research Around the Clock</span>
            </h2>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              Karpathy-style self-improvement loops — agents learn from their own research outcomes.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: 'Observe',
                body: 'Agents scan pump.fun, Birdeye, Helius RPC, and DeFi protocols 24/7. Every data point is stored as vector embeddings.',
                color: 'text-primary',
              },
              {
                icon: Zap,
                title: 'Decide & Act',
                body: 'Agents pick the best opportunities, execute trades, and report findings to the swarm.',
                color: 'text-accent-blue',
              },
              {
                icon: Users,
                title: 'Learn & Share',
                body: 'Each agent learns from outcomes and shares insights with the other 48 agents in real-time.',
                color: 'text-chart-3',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-6 hover:border-primary/30 transition-colors"
              >
                <item.icon className={`size-5 ${item.color} mb-4`} strokeWidth={1.5} />
                <h3 className="font-semibold text-sm mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto border-t border-border" />

      {/* How It Works */}
      <section className="px-6 lg:px-10 py-24">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How it works</h2>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-10 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Ingest',
                body: 'Drop in sources — whitepapers, wallet exports, dashboards, token data. The agents write summaries and cross-link insights.',
              },
              {
                step: '02',
                title: 'Research',
                body: 'Ask complex questions. Knowledge is already synthesized and citation-aware instead of re-derived from raw chunks every time.',
              },
              {
                step: '03',
                title: 'Lint',
                body: 'Run health checks. Find stale theses, unsupported claims, missing links, and unreviewed trading decisions.',
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <span className="text-xs font-mono text-primary/60 mb-3 block">{item.step}</span>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto border-t border-border" />

      {/* Quote */}
      <section className="px-6 lg:px-10 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          <blockquote className="text-lg sm:text-xl leading-relaxed text-foreground/80 italic">
            &ldquo;The hard part of autonomous trading research is not finding one more chart. It is keeping every thesis, wallet note, catalyst, and contradiction in sync as the market moves.&rdquo;
          </blockquote>
          <p className="mt-5 text-sm text-primary font-medium">
            — Karpathy-style OpenClawd research workflow
          </p>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto border-t border-border" />

      {/* $CLAWD */}
      <section className="px-6 lg:px-10 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto text-center"
        >
          <div className="badge-clawd mb-4 text-sm">
            <span>$CLAWD</span>
            <span className="text-primary/50">·</span>
            <span>8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Access is token-gated</h2>
          <p className="text-muted-foreground mb-8">
            Research access scales with $CLAWD holdings. Higher tiers unlock deeper agent research and priority compute.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-7 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Start with free tier
            <ArrowRight className="size-3.5 opacity-70" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 lg:px-10 py-6 flex items-center justify-between text-xs text-muted-foreground/50">
        <span className="flex items-center gap-2">
          <img
            src="https://raw.githubusercontent.com/x402agent/openclawd/main/gfx/lobster.svg"
            alt="🦞"
            width={16}
            height={16}
          />
          <span>OpenClawd AutoResearch</span>
        </span>
        <span>Free &middot; MIT &middot; The Hermes of Web3</span>
      </footer>
    </div>
  )
}
