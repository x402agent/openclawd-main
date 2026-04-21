
import React from 'react';
import { CandyMachineConfig, AgentDNA } from '../types';
import { GUARD_PRESETS } from '../constants';

interface Props {
  cm: CandyMachineConfig;
  setCm: React.Dispatch<React.SetStateAction<CandyMachineConfig>>;
  dna: AgentDNA;
}

export const PhaseCandyMachine: React.FC<Props> = ({ cm, setCm, dna }) => {
  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl">🍬</span>
          <h2 className="font-display text-2xl font-bold tracking-widest">CANDY MACHINE</h2>
        </div>
        <p className="text-white/50 text-xs">Configure the Metaplex minting engine and guard groups.</p>
      </header>

      <section className="space-y-6">
        <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Guard Setup</h3>
        <div className="grid grid-cols-3 gap-3">
          {GUARD_PRESETS.map(g => (
            <button 
              key={g.id}
              onClick={() => setCm({ ...cm, preset: g.id })}
              className={`p-4 rounded-lg border text-left transition-all ${cm.preset === g.id ? 'bg-green-500/10 border-green-500/40' : 'bg-black/40 border-white/5'}`}
            >
              <p className="text-[10px] font-display font-bold text-white mb-1 uppercase tracking-wider" style={{ color: cm.preset === g.id ? '#14F195' : 'white' }}>{g.name}</p>
              <p className="text-[8px] text-white/40 leading-relaxed">{g.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-8">
        <section className="space-y-6">
          <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Limits & Pricing</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 tracking-widest font-bold">MINT PRICE (SOL)</label>
              <input type="number" step="0.01" value={cm.price} onChange={e => setCm({...cm, price: parseFloat(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-green-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 tracking-widest font-bold">COLLECTION SIZE</label>
              <input type="number" value={cm.items} onChange={e => setCm({...cm, items: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-green-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 tracking-widest font-bold">WALET LIMIT</label>
              <input type="number" value={cm.mintLimit} onChange={e => setCm({...cm, mintLimit: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-green-500 outline-none" />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Advanced Settings</h3>
          <div className="space-y-3">
            <button 
              onClick={() => setCm({...cm, hidden: !cm.hidden})}
              className={`w-full p-4 rounded-md border flex items-center justify-between transition-all ${cm.hidden ? 'bg-white/10 border-white/20' : 'bg-black/20 border-white/5'}`}
            >
              <p className="text-[9px] font-bold tracking-widest font-display text-white">HIDDEN SETTINGS (REVEAL)</p>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${cm.hidden ? 'bg-green-500' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${cm.hidden ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </button>
            <button 
              onClick={() => setCm({...cm, sequential: !cm.sequential})}
              className={`w-full p-4 rounded-md border flex items-center justify-between transition-all ${cm.sequential ? 'bg-white/10 border-white/20' : 'bg-black/20 border-white/5'}`}
            >
              <p className="text-[9px] font-bold tracking-widest font-display text-white">SEQUENTIAL MINTING</p>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${cm.sequential ? 'bg-green-500' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${cm.sequential ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
