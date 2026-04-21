
import React from 'react';
import { TreeNode } from '../types';

interface Props {
  depth: number;
  setDepth: (v: number) => void;
  actions: string[];
  setActions: (v: string[]) => void;
  preview: TreeNode | null;
}

const TreeNodeView: React.FC<{ node: TreeNode; depth: number }> = ({ node, depth }) => {
  return (
    <div className="ml-6 border-l border-white/10 pl-4 py-1.5 animate-fadeIn">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-sm ${depth === 0 ? 'bg-purple-500' : 'bg-green-500'}`} />
        <span className="text-[10px] font-bold text-white uppercase tracking-widest">{node.name}</span>
        <span className="text-[8px] text-white/30 font-mono">HASH: 0x{node.hash}</span>
        <span className={`text-[8px] px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-tighter ${node.action === 'execute' ? 'text-orange-400' : 'text-blue-400'}`}>
          {node.action}
        </span>
      </div>
      {node.children && node.children.map((child, i) => (
        <TreeNodeView key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export const PhaseRecursive: React.FC<Props> = ({ depth, setDepth, actions, setActions, preview }) => {
  const availableActions = ["resolve", "execute", "compose", "verify", "embed", "transform"];

  const toggleAction = (a: string) => {
    if (actions.includes(a)) {
      setActions(actions.filter(x => x !== a));
    } else {
      setActions([...actions, a]);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-4 mb-2">
          <span className="text-3xl">♾️</span>
          <h2 className="font-display text-2xl font-bold tracking-widest">RECURSIVE METADATA</h2>
        </div>
        <p className="text-white/50 text-xs">Architect a self-referential tree where NFTs pointer to other NFTs dynamically.</p>
      </header>

      <section className="grid grid-cols-2 gap-8">
        <div className="space-y-6">
          <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Recursion Config</h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-[9px] text-white/40 tracking-widest font-bold">DEPTH LIMIT: {depth}</label>
              </div>
              <input 
                type="range" min="1" max="7" value={depth} 
                onChange={e => setDepth(parseInt(e.target.value))} 
                className="w-full accent-purple-500 h-1 bg-white/10 rounded-full appearance-none"
              />
            </div>
            <div className="space-y-3">
              <label className="text-[9px] text-white/40 tracking-widest font-bold block uppercase">Pointer Actions</label>
              <div className="flex flex-wrap gap-2">
                {availableActions.map(a => (
                  <button 
                    key={a} 
                    onClick={() => toggleAction(a)}
                    className={`px-3 py-1.5 rounded text-[9px] font-mono border transition-all ${actions.includes(a) ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400' : 'bg-white/5 border-white/10 text-white/40'}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/10 space-y-4">
          <p className="text-[9px] text-cyan-400 tracking-widest font-bold uppercase">Pointer Protocol</p>
          <p className="text-[9px] text-white/60 font-mono leading-relaxed">
            recurse://{"<mint_address>"}/{"<depth>"}/{"<action>"}
          </p>
          <p className="text-[9px] text-white/50 leading-relaxed">
            Each NFT's metadata contains an array of pointers. When a resolver encounters a pointer, it triggers the associated action, effectively building a dynamic environment tree on-chain.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="font-display text-[10px] text-white/30 tracking-[0.3em] font-bold uppercase">Tree Visualization</h3>
        <div className="bg-black/40 border border-white/5 rounded-lg p-6 min-h-[300px]">
          {preview && <TreeNodeView node={preview} depth={0} />}
        </div>
      </section>
    </div>
  );
};
