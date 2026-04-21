
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { COLORS, PHASES, TIERS, CAPABILITIES, MODELS, GUARD_PRESETS, ART_STYLES } from './constants';
import { AgentDNA, ArtConfig, TokenConfig, CandyMachineConfig, TreeNode, Attestation, DeploymentStep } from './types';
import { generateAgentBio, generateAgentArt } from './services/geminiService';

// --- Sub-components (Phase UI) ---
import { PhaseDNA } from './components/PhaseDNA';
import { PhaseArt } from './components/PhaseArt';
import { PhaseToken } from './components/PhaseToken';
import { PhaseCandyMachine } from './components/PhaseCandyMachine';
import { PhaseRecursive } from './components/PhaseRecursive';
import { PhaseMint } from './components/PhaseMint';
import { LivePreview } from './components/LivePreview';

export default function App() {
  const [phase, setPhase] = useState(0);
  const [animating, setAnimating] = useState(false);

  // --- DNA State ---
  const [dna, setDna] = useState<AgentDNA>({
    name: "",
    handle: "",
    bio: "",
    personality: "",
    tier: "AGENT",
    capabilities: new Set(["trade"]),
    model: "gemini-3-flash",
    systemPrompt: "You are a sovereign agent on Solana.",
    temperature: 0.7,
    lore: ""
  });

  // --- Art State ---
  const [art, setArt] = useState<ArtConfig>({
    style: "passport",
    prompt: "",
    provider: "google",
    imageUrl: null,
    generating: false
  });

  // --- Token State ---
  const [token, setToken] = useState<TokenConfig>({
    name: "",
    symbol: "",
    decimals: 9,
    supply: "1000000",
    mintAuth: true,
    freezeAuth: false
  });

  // --- Candy Machine State ---
  const [cm, setCm] = useState<CandyMachineConfig>({
    items: 1000,
    fee: 500,
    standard: "ProgrammableNonFungible",
    preset: "tiered",
    price: 0.1,
    startDate: "",
    endDate: "",
    mintLimit: 5,
    hidden: false,
    sequential: false
  });

  // --- Recursive State ---
  const [recursionDepth, setRecursionDepth] = useState(3);
  const [recursionActions, setRecursionActions] = useState<string[]>(["resolve", "execute"]);
  const [recursionPreview, setRecursionPreview] = useState<TreeNode | null>(null);

  // --- Deployment State ---
  const [deployed, setDeployed] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployLog, setDeployLog] = useState<DeploymentStep[]>([]);
  const [attestations, setAttestations] = useState<Attestation[]>([]);

  // Sync token name with agent
  useEffect(() => {
    if (dna.name && !token.name) {
      setToken(prev => ({ 
        ...prev, 
        name: dna.name + " Token",
        symbol: dna.name.slice(0, 4).toUpperCase()
      }));
    }
  }, [dna.name]);

  const goPhase = (idx: number) => {
    if (idx === phase || animating) return;
    setAnimating(true);
    setTimeout(() => {
      setPhase(idx);
      setAnimating(false);
    }, 300);
  };

  const nextPhase = () => phase < 5 && goPhase(phase + 1);
  const prevPhase = () => phase > 0 && goPhase(phase - 1);

  const handleGenerateBio = async () => {
    const traits = [...dna.capabilities].map(c => CAPABILITIES.find(cap => cap.id === c)?.name || c);
    const bio = await generateAgentBio(dna.name, traits);
    setDna(prev => ({ ...prev, bio }));
  };

  const handleGenerateArt = async () => {
    setArt(prev => ({ ...prev, generating: true }));
    const url = await generateAgentArt(`${dna.name} ${art.prompt}`, art.style);
    setArt(prev => ({ ...prev, imageUrl: url, generating: false }));
    setAttestations(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      action: "art_generation",
      model: "gemini-2.5-flash-image",
      verified: true,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployLog([]);
    const steps = [
      "Initializing Solana Connection...",
      "Setting up TEE Enclave (RedPill)...",
      "Generating On-chain Attestation...",
      "Creating SPL Token Program...",
      "Uploading Assets to Arweave...",
      "Deploying Candy Machine V2...",
      "Setting Guard Restrictions...",
      "Finalizing Recursive Metadata Tree...",
      "Verification Complete ✓"
    ];

    for (let i = 0; i < steps.length; i++) {
      setDeployLog(prev => [...prev, { step: i, msg: steps[i], time: new Date().toLocaleTimeString() }]);
      await new Promise(r => setTimeout(r, 1000 + Math.random() * 500));
    }

    setDeployed(true);
    setDeploying(false);
  };

  // Build recursive tree visual
  useEffect(() => {
    const buildTree = (depth: number): TreeNode => {
      return {
        name: `${dna.name || "Agent"} Root`,
        action: "root",
        hash: Math.random().toString(16).substring(2, 10),
        children: depth > 0 ? Array.from({ length: 2 }).map((_, i) => ({
          name: `Layer ${depth} Module ${i + 1}`,
          action: recursionActions[i % recursionActions.length] || "resolve",
          hash: Math.random().toString(16).substring(2, 10),
          children: depth > 1 ? [buildTree(depth - 1)] : []
        })) : []
      };
    };
    if (phase === 4) setRecursionPreview(buildTree(recursionDepth));
  }, [phase, recursionDepth, recursionActions, dna.name]);

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(153,69,255,0.08)_0%,transparent_70%)] animate-[drift_25s_infinite]" />
        <div className="absolute bottom-[-8%] left-[-3%] w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(20,241,149,0.06)_0%,transparent_70%)] animate-[drift_20s_infinite_reverse]" />
        <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(rgba(153,69,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(153,69,255,0.2)_1px,transparent_1px)] bg-[length:60px_60px]" />
      </div>

      {/* Top Navigation */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-black/40 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center shadow-[0_0_20px_rgba(153,69,255,0.3)]">
            <span className="text-sm">🍬</span>
          </div>
          <div>
            <h1 className="font-display text-xs font-bold tracking-[0.2em]">AGENTIC CANDY MACHINE</h1>
            <p className="text-[9px] text-white/40 tracking-[0.1em]">TEE-ATTESTED DEPLOYMENT ENGINE</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-white/50">
          <div className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 font-mono">
            DNA: 0x{dna.name ? dna.name.length.toString(16).padStart(8, '0') : '00000000'}
          </div>
          <div className="px-2 py-1 rounded bg-white/5 border border-white/10 uppercase tracking-widest">
            DEVNET • {attestations.length} ATTESTS
          </div>
        </div>
      </header>

      {/* Phase Indicator */}
      <nav className="h-16 flex items-center px-4 gap-1 border-b border-white/5 bg-black/20 backdrop-blur-sm z-10">
        {PHASES.map((p, i) => {
          const active = i === phase;
          const done = i < phase;
          return (
            <button 
              key={p.id} 
              onClick={() => goPhase(i)}
              className={`flex-1 flex flex-col items-center justify-center h-12 rounded-md transition-all relative overflow-hidden group ${active ? 'bg-purple-500/10 border border-purple-500/30' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2">
                <span className={`text-lg transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`}>{p.icon}</span>
                <div className="text-left hidden md:block">
                  <p className={`font-display text-[9px] font-bold tracking-widest ${active ? 'text-white' : done ? 'text-green-400' : 'text-white/40'}`}>{p.label}</p>
                  <p className="text-[8px] text-white/30 truncate max-w-[120px]">{p.desc}</p>
                </div>
              </div>
              {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-green-500" />}
              {done && <div className="absolute top-1 right-2 text-[8px] text-green-400">✓</div>}
            </button>
          );
        })}
      </nav>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden z-0">
        {/* Content Area */}
        <section className={`flex-1 overflow-y-auto p-8 transition-all duration-300 ${animating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          <div className="max-w-4xl mx-auto pb-20">
            {phase === 0 && <PhaseDNA dna={dna} setDna={setDna} onGenerateBio={handleGenerateBio} />}
            {phase === 1 && <PhaseArt art={art} setArt={setArt} dna={dna} onGenerateArt={handleGenerateArt} />}
            {phase === 2 && <PhaseToken token={token} setToken={setToken} dna={dna} />}
            {phase === 3 && <PhaseCandyMachine cm={cm} setCm={setCm} dna={dna} />}
            {phase === 4 && <PhaseRecursive depth={recursionDepth} setDepth={setRecursionDepth} actions={recursionActions} setActions={setRecursionActions} preview={recursionPreview} />}
            {phase === 5 && (
              <PhaseMint 
                dna={dna} art={art} token={token} cm={cm} 
                recursionDepth={recursionDepth} 
                deployed={deployed} deploying={deploying} 
                onDeploy={handleDeploy} 
                log={deployLog}
                attestations={attestations}
              />
            )}
          </div>
        </section>

        {/* Sidebar Preview */}
        <aside className="w-80 border-l border-white/5 bg-black/60 backdrop-blur-md p-6 overflow-y-auto">
          <LivePreview dna={dna} art={art} token={token} cm={cm} depth={recursionDepth} phase={phase} attestations={attestations} />
        </aside>
      </main>

      {/* Bottom Control Bar */}
      <footer className="h-16 flex items-center justify-between px-8 border-t border-white/5 bg-black/40 backdrop-blur-sm z-10">
        <button 
          onClick={prevPhase} 
          disabled={phase === 0}
          className="px-6 py-2 rounded border border-white/10 text-[10px] tracking-widest hover:bg-white/5 disabled:opacity-30 font-display transition-all"
        >
          ← BACK
        </button>
        <div className="flex gap-2">
          {PHASES.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === phase ? 'w-8 bg-gradient-to-r from-purple-500 to-green-500' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
        <button 
          onClick={nextPhase} 
          disabled={phase === 5}
          className="px-6 py-2 rounded bg-gradient-to-r from-purple-500 to-green-500 text-[10px] font-bold tracking-widest text-black hover:brightness-110 disabled:opacity-30 font-display transition-all"
        >
          NEXT →
        </button>
      </footer>
    </div>
  );
}
