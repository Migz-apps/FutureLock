import React from 'react';
import { Shield, Unlock, Zap } from 'lucide-react';

interface GlassCardProps {
  title: string;
  price: string;
  isUnlocked: boolean;
  onPurchase: () => void;
}

export default function GlassCard({ title, price, isUnlocked, onPurchase }: GlassCardProps) {
  return (
    <div className="relative group overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:border-blue-500/50 hover:bg-white/10 shadow-2xl">
      {/* Background Glow Effect */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[100px] group-hover:bg-blue-600/20 transition-all" />
      
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-blue-500/10 rounded-2xl">
          {isUnlocked ? <Unlock className="text-blue-400" size={24} /> : <Shield className="text-zinc-500" size={24} />}
        </div>
        <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase bg-zinc-900 px-2 py-1 rounded">
          {isUnlocked ? 'Verified' : 'Encrypted'}
        </span>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-400 transition-colors">
        {title}
      </h3>
      
      <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
        High-fidelity intelligence data secured via FutureLock protocol.
      </p>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div>
          <p className="text-[10px] text-zinc-500 uppercase font-bold">Access Cost</p>
          <p className="text-white font-mono font-bold text-lg">{price} ETH</p>
        </div>

        <button 
          onClick={onPurchase}
          disabled={isUnlocked}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            isUnlocked 
            ? 'bg-zinc-800 text-zinc-500 cursor-default' 
            : 'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/20 active:scale-95'
          }`}
        >
          {isUnlocked ? 'Access Granted' : <><Zap size={16} /> Unlock</>}
        </button>
      </div>
    </div>
  );
}