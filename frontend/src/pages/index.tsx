import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useTheme } from '../contexts/ThemeContext';

const Home = () => {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();

  const handleAction = (targetRole: string) => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      if (role === targetRole) {
        router.push(`/${targetRole.toLowerCase()}`);
      } else {
        alert(`Access Denied: You are currently logged in as a ${role}.`);
      }
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ 
      backgroundColor: 'var(--background)', 
      color: 'var(--text-primary)',
      fontFamily: 'Inter, system-ui, sans-serif' 
    }}>
      
      {/* 1. HERO SECTION */}
      <section style={{ padding: '120px 40px 80px', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ 
          fontSize: '72px', 
          fontWeight: '900', 
          letterSpacing: '-3px', 
          marginBottom: '24px', 
          lineHeight: '1',
          color: 'var(--text-primary)'
        }}>
          Future<span style={{ color: 'var(--accent-primary)' }}>Lock</span>
        </h1>
        <p style={{ 
          fontSize: '22px', 
          color: 'var(--text-secondary)', 
          marginBottom: '48px', 
          maxWidth: '700px', 
          margin: '0 auto 60px',
          lineHeight: '1.6'
        }}>
          The Protocol for Time-Locked Intelligence. <br />
          Securely encrypt and monetize sensitive data with blockchain-verified release dates.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button 
            onClick={() => handleAction('Creator')}
            style={{ 
              padding: '16px 32px', 
              backgroundColor: 'var(--accent-primary)', 
              color: '#fff', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              border: 'none',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Deploy Intelligence
          </button>
          <button 
            onClick={() => handleAction('Buyer')}
            style={{ 
              padding: '16px 32px', 
              backgroundColor: 'var(--text-primary)', 
              color: 'var(--background)', 
              borderRadius: '8px', 
              fontWeight: 'bold', 
              cursor: 'pointer', 
              border: 'none',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Acquire Insights
          </button>
        </div>
      </section>

      {/* UPDATED: FLEXIBLE ACCESS SECTION (Visa/Crypto, Web2/Web3) */}
      <section style={{ padding: '60px 40px', maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-1px' }}>Universal Access</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Whether you're a crypto native or a traditional user, our platform is built for you.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ padding: '30px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Card or Crypto Payments</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Purchase premium intelligence seamlessly using <b>Visa, Mastercard, or your preferred Crypto Wallet</b>. We ensure a frictionless checkout for everyone.</p>
            </div>
            <div style={{ padding: '30px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Flexible Onboarding</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Get started with an <b>Email or a Digital Wallet</b>. Choose the login method that fits your security preference and workflow.</p>
            </div>
            <div style={{ padding: '30px', backgroundColor: 'var(--surface)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Inclusive Identity</h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Your profile is universal. Access your vault and history whether you're identified by an email address or a decentralized wallet ID.</p>
            </div>
        </div>
      </section>

      {/* 2. CRYPTOGRAPHIC FOUNDATION */}
      <section style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px', letterSpacing: '-1px' }}>
          The Cryptographic Foundation
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {[
            { title: "End-to-End Encryption", desc: "Data is encrypted locally using AES-256 before leaving your device. Even the platform cannot view your intelligence." },
            { title: "IPFS Distribution", desc: "Encrypted payloads are distributed across IPFS, ensuring your data remains immutable and censorship-resistant." },
            { title: "Timestamp Verification", desc: "Unlock dates are anchored to the blockchain, making it mathematically impossible to reveal data prematurely." }
          ].map((feature, idx) => (
            <div key={idx} style={{
              padding: '40px',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
            }}>
              <h4 style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '18px' }}>{feature.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.5' }}>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* NEW: TRUST & REPUTATION SECTION */}
      <section style={{ padding: '80px 40px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '20px', letterSpacing: '-1px' }}>Built on Verified Trust</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>Every creator and piece of intelligence is backed by our transparent reputation engine.</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '60px', flexWrap: 'wrap' }}>
          <div>
            <h3 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-primary)' }}>100%</h3>
            <p style={{ fontWeight: 'bold' }}>Immutable Ratings</p>
          </div>
          <div>
            <h3 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-primary)' }}>Weighted</h3>
            <p style={{ fontWeight: 'bold' }}>Trust Scores</p>
          </div>
          <div>
            <h3 style={{ fontSize: '36px', fontWeight: '900', color: 'var(--accent-primary)' }}>Escrow</h3>
            <p style={{ fontWeight: 'bold' }}>Fraud Protection</p>
          </div>
        </div>
      </section>

      {/* 3. PROOF OF ESCROW */}
      <section style={{ 
        padding: '80px 40px', 
        backgroundColor: 'var(--surface)', 
        borderTop: '1px solid var(--border)', 
        borderBottom: '1px solid var(--border)' 
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px', letterSpacing: '-1px' }}>
            Financial Integrity
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px' }}>
            <div>
              <h4 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '12px' }}>Secure Payment Holding</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Funds are held by a decentralized Escrow Smart Contract. The platform never touches your capital.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 'bold', fontSize: '20px', marginBottom: '12px' }}>Autonomous Distribution</h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Payouts and key releases are executed automatically by the protocol at the specified unlock time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. DUAL PORTAL (SCROLL TARGET) */}
      <section style={{ padding: '120px 40px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '60px', letterSpacing: '-2px' }}>
          Select Your Portal
        </h2>
        
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          <div 
            onClick={() => handleAction('Creator')}
            style={{ 
              flex: '1', 
              padding: '48px', 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '20px', 
              cursor: 'pointer', 
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Creator</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '18px' }}>
              Have high-value data that matures over time? Lock it now and monetize your strategic foresight.
            </p>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '16px' }}>Start Creating →</span>
          </div>

          <div 
            onClick={() => handleAction('Buyer')}
            style={{ 
              flex: '1', 
              padding: '48px', 
              backgroundColor: 'var(--surface)', 
              border: '1px solid var(--border)', 
              borderRadius: '20px', 
              cursor: 'pointer', 
              textAlign: 'left',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <h3 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Buyer</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '18px' }}>
              Seeking an information edge? Browse the marketplace for verified, upcoming intelligence.
            </p>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '16px' }}>Explore Market →</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;