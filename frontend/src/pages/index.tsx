import React from 'react';
import { useFutureLock } from '../hooks/useFutureLock';

const Home = () => {
  const { purchaseInsight, isPending, error } = useFutureLock();

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Active Insights</h1>
        <p style={{ color: '#888' }}>Select a premium lock to access the content.</p>
      </header>
      
      <div style={{ 
        padding: '30px', 
        backgroundColor: '#111', 
        border: '1px solid #333', 
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Cybersecurity Threat Intel</h3>
            <p style={{ color: '#aaa', marginBottom: '20px' }}>Advanced analysis on zero-day vulnerabilities.</p>
          </div>
          <span style={{ backgroundColor: '#0070f3', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' }}>
            NEW
          </span>
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '14px', color: '#888' }}>PRICE</span>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>0.01 ETH</div>
          </div>

          <button 
            onClick={() => purchaseInsight("1", "0.01")}
            disabled={isPending}
            style={{
              padding: '12px 30px',
              backgroundColor: isPending ? '#333' : '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: '0.2s'
            }}
          >
            {isPending ? "Waiting for Wallet..." : "Buy & Unlock"}
          </button>
        </div>

        {error && (
          <div style={{ color: '#ff4d4d', marginTop: '15px', fontSize: '14px', padding: '10px', backgroundColor: 'rgba(255, 77, 77, 0.1)', borderRadius: '6px' }}>
            ⚠️ {error.message.includes("User rejected") ? "Transaction declined." : error.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;