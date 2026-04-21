
import React from 'react';
import { ArtConfig, AgentDNA } from '../types';
import { ART_STYLES } from '../constants';

interface Props {
  art: ArtConfig;
  setArt: React.Dispatch<React.SetStateAction<ArtConfig>>;
  dna: AgentDNA;
  onGenerateArt: () => void;
}

export const PhaseArt: React.FC<Props> = ({ art, setArt, dna, onGenerateArt }) => {
  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl">🎨</span>
          <h2 className="font-display text-2xl font-bold tracking-widest">ART FORGE</h2>
        </div>
        <p className="text-white/50 text-xs">Synthesize high-resolution visual anchors for your agent's collection.</p>
      </header>

      <section className="space-y-6">
        <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold">CHOOSE TEMPLATE STYLE</h3>
        <div className="grid grid-cols-4 gap-4">
          {ART_STYLES.map(s => (
            <button 
              key={s.id}
              onClick={() => setArt({ ...art, style: s.id })}
              className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${art.style === s.id ? 'border-purple-500' : 'border-transparent'}`}
              style={{ background: s.preview }}
            >
              <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors flex items-end p-2">
                <span className="text-[9px] font-bold text-white uppercase tracking-wider">{s.name}</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold">PROMPT AUGMENTATION</h3>
        <div className="space-y-4">
          <textarea 
            value={art.prompt}
            onChange={e => setArt({ ...art, prompt: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-3 text-xs focus:border-purple-500 outline-none transition-all resize-none"
            placeholder="Add visual modifiers (e.g., 'glowing circuitry', 'dark void', 'cyberpunk glitch')..."
            rows={3}
          />
          <button 
            onClick={onGenerateArt}
            disabled={art.generating}
            className={`w-full py-4 rounded-md font-display font-bold text-xs tracking-[0.3em] transition-all shadow-xl ${art.generating ? 'bg-white/5 text-white/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-110 active:scale-[0.99] text-white'}`}
          >
            {art.generating ? (
              <span className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                FORGING...
              </span>
            ) : "GENERATE MASTERPIECE"}
          </button>
        </div>
      </section>

      {art.imageUrl && (
        <section className="flex flex-col items-center">
          <div className="relative group p-1 rounded-xl bg-gradient-to-br from-purple-500/40 via-green-500/40 to-cyan-500/40 shadow-2xl animate-[glowPulse_4s_infinite]">
            <img 
              src={art.imageUrl} 
              alt="Generated NFT" 
              className="w-80 h-80 object-cover rounded-lg block border border-white/20" 
            />
            <div className="absolute bottom-4 left-4 right-4 p-3 bg-black/80 backdrop-blur-md rounded border border-white/10">
              <p className="text-[10px] font-display font-bold text-white tracking-widest">{dna.name || 'AGENT'} #001</p>
              <p className="text-[8px] text-white/40 mt-1 uppercase">TEE-Generated • {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
