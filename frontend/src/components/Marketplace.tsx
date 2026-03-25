import React from 'react';
import { Lock, Timer } from 'lucide-react';

const insights = [
  { id: 1, title: "AI Market Shift 2027", price: "0.05 ETH", date: "2027-01-01" },
  { id: 2, title: "Global Energy Prediction", price: "0.1 ETH", date: "2026-12-15" },
];

export default function Marketplace() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-8">
      {insights.map((item) => (
        <div key={item.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl hover:border-cyan-500 transition-all">
          <div className="flex justify-between items-start mb-4">
            <Lock className="text-cyan-500" size={20} />
            <span className="text-xs font-mono text-zinc-500">{item.price}</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
          <div className="flex items-center text-zinc-400 text-sm">
            <Timer size={14} className="mr-2" />
            <span>Unlocks: {item.date}</span>
          </div>
          <button className="w-full mt-6 bg-white text-black py-2 rounded-lg font-semibold hover:bg-cyan-400 transition-colors">
            Buy Access
          </button>
        </div>
      ))}
    </div>
  );
}