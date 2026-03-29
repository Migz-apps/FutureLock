import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GlassCard from './Glasscard';
import { useFutureLock } from '../hooks/useFutureLock';

export default function Marketplace() {
  const [insights, setInsights] = useState<any[]>([]);
  const { purchaseInsight, isPending } = useFutureLock();

  // Fetching from your FastAPI Backend
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8080/api/v1/intel/public');
        setInsights(response.data);
      } catch (error) {
        console.error("Failed to fetch insights from FastAPI", error);
      }
    };
    fetchInsights();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black text-white tracking-tighter mb-4">
          INTELLIGENCE <span className="text-blue-600">MARKET</span>
        </h2>
        <p className="text-zinc-500 max-w-xl mx-auto">
          Securely trade and access encrypted data blocks verified by the Rwanda Coding Academy infrastructure.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {insights.map((item) => (
          <GlassCard
            key={item.id}
            title={item.title}
            price={item.price || "0.01"}
            isUnlocked={false}
            onPurchase={() => purchaseInsight(item.id.toString(), item.price || "0.01")}
          />
        ))}
      </div>
    </div>
  );
}