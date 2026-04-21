
import React from 'react';
import { AgentDNA, ArtConfig, TokenConfig, CandyMachineConfig, Attestation, DeploymentStep } from '../types';

interface Props {
  dna: AgentDNA;
  art: ArtConfig;
  token: TokenConfig;
  cm: CandyMachineConfig;
  recursionDepth: number;
  deployed: boolean;
  deploying: boolean;
  onDeploy: () => void;
  log: DeploymentStep[];
  attestations: Attestation[];
}

export const PhaseMint: React.FC<Props> = ({ dna, art, token, cm, recursionDepth, deployed, deploying, onDeploy, log, attestations }) => {
  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl">⚡</span>
          <h2 className="font-display text-2xl font-bold tracking-widest">DEPLOYMENT PORTAL</h2>
        </div>
        <p className="text-white/50 text-xs">Launch your sovereign entity into the Solana mainnet / devnet.</p>
      </header>

      {!deployed ? (
        <div className="space-y-8">
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
              <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Summary</h3>
              <div className="space-y-2">
                {[
                  ["Agent", dna.name || "—"],
                  ["Tier", dna.tier],
                  ["Token", token.symbol || "—"],
                  ["Supply", token.supply],
                  ["Art", art.imageUrl ? "Synthesized ✓" : "Missing"],
                  ["Recursion", `${recursionDepth} layers`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40 uppercase tracking-tighter">{k}</span>
                    <span className="text-white font-mono">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col justify-center items-center gap-4">
               <div className="text-center">
                 <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">NETWORK</p>
                 <p className="text-xs font-bold font-display text-green-400 tracking-widest">SOLANA DEVNET</p>
               </div>
               <button 
                onClick={onDeploy} 
                disabled={deploying}
                className={`w-full py-4 rounded font-display font-bold text-xs tracking-[0.2em] transition-all shadow-2xl ${deploying ? 'bg-white/10 text-white/30 cursor-wait' : 'bg-gradient-to-r from-purple-600 to-green-600 text-white hover:brightness-110 active:scale-95'}`}
              >
                {deploying ? "DEPLOYING PIPELINE..." : "🚀 START DEPLOYMENT"}
              </button>
            </div>
          </section>

          {log.length > 0 && (
            <section className="space-y-4">
              <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Deployment Log</h3>
              <div className="bg-black border border-white/10 rounded-lg p-4 h-64 overflow-y-auto font-mono text-[9px] space-y-2">
                {log.map((l, i) => (
                  <div key={i} className="flex gap-4 animate-fadeIn">
                    <span className="text-white/30">{l.time}</span>
                    <span className={l.msg.includes('✓') ? 'text-green-400' : 'text-white'}>[INFO] {l.msg}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-10 space-y-8 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center text-4xl shadow-[0_0_50px_rgba(20,241,149,0.2)] animate-pulse">
            ✓
          </div>
          <div className="text-center">
            <h3 className="font-display text-3xl font-bold tracking-[0.3em] mb-2">DEPLOYED</h3>
            <p className="text-white/40 text-xs">Your sovereign agent is now active on-chain.</p>
          </div>
          <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
             <div className="flex justify-between items-center text-xs">
               <span className="text-white/40">PASSPORT MINT</span>
               <span className="text-purple-400 font-mono">0x7F...8a9</span>
             </div>
             <div className="flex justify-between items-center text-xs">
               <span className="text-white/40">TOKEN ADDRESS</span>
               <span className="text-green-400 font-mono">0x2B...c1d</span>
             </div>
             <div className="pt-4 border-t border-white/5 text-center">
                <a href="#" className="text-[10px] text-cyan-400 hover:underline uppercase tracking-widest font-display">View on Solscan</a>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
