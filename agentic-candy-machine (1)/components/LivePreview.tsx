
import React from 'react';
import { AgentDNA, ArtConfig, TokenConfig, CandyMachineConfig, Attestation } from '../types';
import { TIERS, CAPABILITIES, MODELS, PHASES } from '../constants';

interface Props {
  dna: AgentDNA;
  art: ArtConfig;
  token: TokenConfig;
  cm: CandyMachineConfig;
  depth: number;
  phase: number;
  attestations: Attestation[];
}

export const LivePreview: React.FC<Props> = ({ dna, art, token, cm, depth, phase, attestations }) => {
  const tierData = TIERS.find(t => t.id === dna.tier);

  return (
    <div className="space-y-6">
      {/* Agent Card */}
      <div className="rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-black/40">
        <div className="h-1 bg-gradient-to-r from-purple-500 via-green-500 to-cyan-500" />
        <div className="p-6 flex flex-col items-center">
          <div className="w-24 h-24 rounded-lg mb-4 relative overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
            {art.imageUrl ? (
              <img src={art.imageUrl} className="absolute inset-0 w-full h-full object-cover" alt="Agent" />
            ) : (
              <span className="text-4xl opacity-20">🧬</span>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </div>
          
          <h4 className="font-display font-bold text-white tracking-widest text-sm uppercase">{dna.name || 'UNNAMED AGENT'}</h4>
          {dna.handle && <p className="text-[10px] text-purple-400 mt-1 font-mono tracking-tighter">@{dna.handle}</p>}
          
          <div 
            className="mt-4 px-3 py-1 rounded-full text-[8px] font-bold font-display tracking-widest border"
            style={{ color: tierData?.color, borderColor: `${tierData?.color}44`, backgroundColor: `${tierData?.color}11` }}
          >
            {dna.tier} TIER
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-white/5">
          <div className="p-3 text-center border-r border-white/5">
            <p className="text-xs font-bold text-white font-display">{dna.capabilities.size}</p>
            <p className="text-[7px] text-white/30 uppercase tracking-widest">Caps</p>
          </div>
          <div className="p-3 text-center border-r border-white/5">
            <p className="text-xs font-bold text-white font-display">{depth}</p>
            <p className="text-[7px] text-white/30 uppercase tracking-widest">Depth</p>
          </div>
          <div className="p-3 text-center">
            <p className="text-xs font-bold text-white font-display">{attestations.length}</p>
            <p className="text-[7px] text-white/30 uppercase tracking-widest">Attests</p>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="space-y-3">
        <h5 className="text-[9px] text-white/30 tracking-[0.2em] font-bold uppercase">Active Modules</h5>
        <div className="flex flex-wrap gap-1.5">
          {[...dna.capabilities].map(id => {
            const cap = CAPABILITIES.find(c => c.id === id);
            return (
              <div key={id} className="px-2 py-1 rounded bg-green-500/10 border border-green-500/20 text-[9px] text-green-400 flex items-center gap-1.5">
                <span>{cap?.icon}</span>
                <span className="font-accent">{cap?.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Config Summary */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <h5 className="text-[9px] text-white/30 tracking-[0.2em] font-bold uppercase">Config Matrix</h5>
        <div className="space-y-2">
          {[
            ["Token", token.symbol || "—"],
            ["Supply", token.supply],
            ["CM Items", cm.items],
            ["Price", `${cm.price} SOL`],
            ["Standard", cm.standard === 'ProgrammableNonFungible' ? 'pNFT' : 'NFT'],
            ["Model", MODELS.find(m => m.id === dna.model)?.name || "—"]
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center text-[9px]">
              <span className="text-white/30 uppercase tracking-tighter">{k}</span>
              <span className="text-white/80 font-mono">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-3 pt-4 border-t border-white/5">
        <h5 className="text-[9px] text-white/30 tracking-[0.2em] font-bold uppercase">Pipeline</h5>
        <div className="space-y-2">
          {PHASES.map((p, i) => (
            <div key={p.id} className={`flex items-center gap-3 transition-opacity ${i > phase ? 'opacity-20' : 'opacity-100'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${i === phase ? 'bg-purple-500 shadow-[0_0_8px_#9945FF]' : i < phase ? 'bg-green-500' : 'bg-white/20'}`} />
              <span className={`text-[9px] uppercase tracking-widest ${i === phase ? 'text-white font-bold' : 'text-white/40'}`}>{p.label}</span>
              {i < phase && <span className="ml-auto text-[8px] text-green-500">✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
