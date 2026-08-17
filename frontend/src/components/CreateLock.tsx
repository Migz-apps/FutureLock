import React, { useState } from 'react';
import axios from 'axios';
import { Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useAccount } from 'wagmi';
import { getErrorMessage } from '../utils/errorHandler';

export default function CreateLock() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    unlockDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Calling your FastAPI Backend with dynamic address
      const response = await axios.post('/process.env.NEXT_PUBLIC_BACKEND_URL/api/v1/intel/create', null, {
        params: {
          ...formData,
          creator: address || '0x0000000000000000000000000000000000000000'
        }
      });
      setResult(response.data);
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Lock className="mr-2 text-blue-500" /> <span className="tracking-tight">SECURE INTELLIGENCE</span>
      </h2>

      {!result ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Insight Title</label>
            <input
              type="text" placeholder="e.g., Q3 Market Vulnerabilities"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Sensitive Content</label>
            <textarea
              placeholder="Paste intelligence data here..."
              className="w-full h-32 bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-blue-500 transition-all resize-none"
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Automatic Unlock Date</label>
            <input
              type="datetime-local"
              className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-white outline-none focus:border-blue-500 transition-all"
              onChange={(e) => setFormData({ ...formData, unlockDate: e.target.value })}
              required
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition-all flex justify-center items-center shadow-lg shadow-blue-900/20"
          >
            {loading ? <Loader2 className="animate-spin" /> : "ENCRYPT & LOCK"}
          </button>
        </form>
      ) : (
        <div className="text-center p-8 bg-blue-500/5 border border-blue-500/30 rounded-xl">
          <ShieldCheck className="mx-auto text-blue-400 mb-4" size={56} />
          <h3 className="text-xl font-bold text-white uppercase tracking-widest">Storage Verified</h3>
          <div className="mt-4 p-3 bg-black/40 rounded border border-white/5">
            <p className="text-zinc-500 text-[10px] uppercase font-bold text-left mb-1">IPFS CID</p>
            <code className="block text-blue-300 text-xs truncate">{result.cid}</code>
          </div>
          <button onClick={() => setResult(null)} className="mt-6 text-zinc-500 hover:text-white transition-colors text-sm font-medium underline">Back to Terminal</button>
        </div>
      )}
    </div>
  );
}