
import React from 'react';
import { AgentDNA } from '../types';
import { TIERS, CAPABILITIES, MODELS } from '../constants';

interface Props {
  dna: AgentDNA;
  setDna: React.Dispatch<React.SetStateAction<AgentDNA>>;
  onGenerateBio: () => void;
}

export const PhaseDNA: React.FC<Props> = ({ dna, setDna, onGenerateBio }) => {
  const toggleCap = (id: string) => {
    const next = new Set(dna.capabilities);
    if (next.has(id)) next.delete(id); else next.add(id);
    setDna({ ...dna, capabilities: next });
  };

  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl">🧬</span>
          <h2 className="font-display text-2xl font-bold tracking-widest">DNA LAB</h2>
        </div>
        <p className="text-white/50 text-xs">Architect your agent's neural foundation and physical constraints.</p>
      </header>

      <section className="space-y-6">
        <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold">IDENTITY STRAND</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 tracking-widest font-bold">AGENT NAME</label>
            <input 
              value={dna.name} 
              onChange={e => setDna({ ...dna, name: e.target.value })} 
              className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-purple-500 outline-none transition-all"
              placeholder="e.g., TerminAgent Alpha"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] text-white/40 tracking-widest font-bold">HANDLE (@)</label>
            <input 
              value={dna.handle} 
              onChange={e => setDna({ ...dna, handle: e.target.value })} 
              className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-purple-500 outline-none transition-all"
              placeholder="alpha_agent"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <label className="text-[9px] text-white/40 tracking-widest font-bold">BIO / DESCRIPTION</label>
            <button onClick={onGenerateBio} className="text-[8px] text-purple-400 hover:text-purple-300 transition-colors uppercase tracking-widest mb-1">✨ Generate with Gemini</button>
          </div>
          <textarea 
            value={dna.bio} 
            onChange={e => setDna({ ...dna, bio: e.target.value })}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-purple-500 outline-none transition-all resize-none"
            placeholder="Describe the agent's purpose..."
          />
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold">TIER CLASS</h3>
        <div className="grid grid-cols-4 gap-2">
          {TIERS.map(t => (
            <button 
              key={t.id}
              onClick={() => setDna({ ...dna, tier: t.id })}
              className={`p-4 rounded-md border transition-all text-center ${dna.tier === t.id ? 'bg-white/10' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
              style={{ borderColor: dna.tier === t.id ? t.color : '' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-xs font-bold" style={{ backgroundColor: `${t.color}22`, color: t.color }}>{t.level}</div>
              <p className="font-display text-[10px] font-bold" style={{ color: dna.tier === t.id ? t.color : 'white' }}>{t.name}</p>
              <p className="text-[8px] text-white/30 mt-1">{t.price}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold">CAPABILITY MODULES</h3>
        <div className="grid grid-cols-4 gap-2">
          {CAPABILITIES.map(c => {
            const active = dna.capabilities.has(c.id);
            return (
              <button 
                key={c.id}
                onClick={() => toggleCap(c.id)}
                className={`p-3 rounded-md border text-center transition-all ${active ? 'bg-green-500/10 border-green-500/40' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
              >
                <div className="text-xl mb-1">{c.icon}</div>
                <p className="text-[9px] font-bold font-accent" style={{ color: active ? '#14F195' : 'rgba(255,255,255,0.6)' }}>{c.name}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold">INTELLIGENCE MODEL</h3>
        <div className="grid grid-cols-3 gap-3">
          {MODELS.map(m => (
            <button 
              key={m.id}
              onClick={() => setDna({ ...dna, model: m.id })}
              className={`p-4 rounded-md border text-left transition-all ${dna.model === m.id ? 'bg-purple-500/10 border-purple-500/40' : 'bg-black/40 border-white/5 hover:border-white/10'}`}
            >
              <p className="font-accent text-[11px] font-bold" style={{ color: dna.model === m.id ? '#9945FF' : 'white' }}>{m.name}</p>
              <p className="text-[8px] text-white/40">{m.provider}</p>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
