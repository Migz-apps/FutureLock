import React from 'react';
import Navbar from '../components/Navbar';
import { useTheme } from '../contexts/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { theme } = useTheme();

  return (
    /* We inject the data-theme attribute here so globals.css can see it */
    <div data-theme={theme} className="min-h-screen bg-[var(--background)] transition-colors duration-300">
      {/* Top ambient glow - subtle blue tint */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-500/5 blur-[120px] pointer-events-none" />
      
      <Navbar />
      
      <main className="relative z-10">
        {children}
      </main>

      <footer style={{
        padding: '40px 60px',
        backgroundColor: 'var(--surface)',
        boxShadow: theme === 'dark' ? '0 -10px 40px rgba(0,0,0,0.4)' : '0 -10px 40px rgba(0,0,0,0.03)',
        marginTop: 'auto',
        position: 'relative',
        zIndex: 20
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          {/* Left Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--accent-primary)', borderRadius: '2px' }}></div>
            <span style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}>
              FutureLock Protocol — <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>Decentralized Intelligence</span>
            </span>
          </div>

          {/* Right Side */}
          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            Designed & Engineered by <span style={{ color: 'var(--accent-primary)' }}>Mazimpaka Miguel</span>
          </div>
        </div>

        {/* Subtext */}
        <div style={{
          maxWidth: '1200px',
          margin: '20px auto 0',
          paddingTop: '20px',
          borderTop: '1px solid var(--border)',
          opacity: 0.3,
          fontSize: '10px',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          textAlign: 'center'
        }}>
          v1.0.4-stable // © 2026 All Rights Reserved
        </div>
      </footer>
    </div>
  );
}