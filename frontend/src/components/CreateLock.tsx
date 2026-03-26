import React, { useState } from 'react';
import axios from 'axios';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';

export default function CreateLock() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    unlockDate: '',
    creator: '0x123...890' // In production, this comes from your useAccount() hook
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calling your FastAPI Backend
      const response = await axios.post('http://127.0.0.1:8000/insights/create', null, {
        params: formData
      });
      setResult(response.data);
    } catch (error) {
      console.error("Encryption failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Lock className="mr-2 text-cyan-500" /> Create Future Intelligence
      </h2>
      
      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Title (e.g., AI Regulation 2027)"
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-white outline-none focus:border-cyan-500"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <textarea 
            placeholder="The Secret Content (This will be encrypted)"
            className="w-full h-32 bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-white outline-none focus:border-cyan-500"
            onChange={(e) => setFormData({...formData, content: e.target.value})}
            required
          />
          <input 
            type="datetime-local" 
            className="w-full bg-zinc-900 border border-zinc-800 p-3 rounded-lg text-white outline-none focus:border-cyan-500"
            onChange={(e) => setFormData({...formData, unlockDate: e.target.value})}
            required
          />
          <button 
            type="submit" disabled={loading}
            className="w-full bg-cyan-500 text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-all flex justify-center items-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Encrypt & Lock Insight"}
          </button>
        </form>
      ) : (
        <div className="text-center p-6 bg-cyan-950/20 border border-cyan-500/50 rounded-lg">
          <ShieldCheck className="mx-auto text-cyan-400 mb-2" size={48} />
          <h3 className="text-xl font-bold text-white">Insight Secured!</h3>
          <p className="text-zinc-400 mt-2 text-sm">IPFS Hash (CID):</p>
          <code className="block bg-black p-2 rounded mt-1 text-cyan-300 text-xs truncate">{result.cid}</code>
          <button onClick={() => setResult(null)} className="mt-4 text-cyan-500 underline text-sm">Create Another</button>
        </div>
      )}
    </div>
  );
}