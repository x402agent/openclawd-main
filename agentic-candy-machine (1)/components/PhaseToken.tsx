
import React from 'react';
import { TokenConfig, AgentDNA } from '../types';

interface Props {
  token: TokenConfig;
  setToken: React.Dispatch<React.SetStateAction<TokenConfig>>;
  dna: AgentDNA;
}

export const PhaseToken: React.FC<Props> = ({ token, setToken, dna }) => {
  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl">🪙</span>
          <h2 className="font-display text-2xl font-bold tracking-widest">TOKEN FOUNDRY</h2>
        </div>
        <p className="text-white/50 text-xs">Create the native SPL token of your agent's economy.</p>
      </header>

      <div className="grid grid-cols-2 gap-8">
        <section className="space-y-6">
          <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Token Parameters</h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 tracking-widest font-bold">NAME</label>
              <input value={token.name} onChange={e => setToken({...token, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-purple-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] text-white/40 tracking-widest font-bold">SYMBOL</label>
              <input value={token.symbol} onChange={e => setToken({...token, symbol: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-purple-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/40 tracking-widest font-bold">DECIMALS</label>
                <input type="number" value={token.decimals} onChange={e => setToken({...token, decimals: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-purple-500 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/40 tracking-widest font-bold">SUPPLY</label>
                <input value={token.supply} onChange={e => setToken({...token, supply: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2 text-xs focus:border-purple-500 outline-none" />
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Authorities</h3>
          <div className="space-y-4">
            <button 
              onClick={() => setToken({...token, mintAuth: !token.mintAuth})}
              className={`w-full p-4 rounded-md border flex items-center justify-between group transition-all ${token.mintAuth ? 'bg-purple-500/10 border-purple-500/30' : 'bg-black/20 border-white/5'}`}
            >
              <div className="text-left">
                <p className="text-[10px] font-bold tracking-widest font-display text-white">MINT AUTHORITY</p>
                <p className="text-[8px] text-white/40 mt-1">Allow creation of more tokens later</p>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${token.mintAuth ? 'bg-purple-500' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${token.mintAuth ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </button>
            <button 
              onClick={() => setToken({...token, freezeAuth: !token.freezeAuth})}
              className={`w-full p-4 rounded-md border flex items-center justify-between group transition-all ${token.freezeAuth ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-black/20 border-white/5'}`}
            >
              <div className="text-left">
                <p className="text-[10px] font-bold tracking-widest font-display text-white">FREEZE AUTHORITY</p>
                <p className="text-[8px] text-white/40 mt-1">Allow freezing of token accounts</p>
              </div>
              <div className={`w-8 h-4 rounded-full relative transition-colors ${token.freezeAuth ? 'bg-cyan-500' : 'bg-white/10'}`}>
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${token.freezeAuth ? 'right-0.5' : 'left-0.5'}`} />
              </div>
            </button>
          </div>
          <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
            <p className="text-[9px] text-yellow-500 tracking-widest font-bold mb-2 uppercase">Security Notice</p>
            <p className="text-[9px] text-white/50 leading-relaxed">Revoking authorities after deployment increases investor confidence by ensuring the supply cannot be manipulated.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
