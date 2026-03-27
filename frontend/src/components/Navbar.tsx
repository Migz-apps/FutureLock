import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// Using standard Lucide icons
import { Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === 'dark';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 40px',
      backgroundColor: isDark ? 'rgba(17, 20, 29, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      boxShadow: isDark ? '0 4px 30px rgba(0,0,0,0.5)' : '0 4px 30px rgba(0,0,0,0.04)',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ fontSize: '20px', fontWeight: '900', letterSpacing: '-1px' }}>
        <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          FUTURE<span style={{ color: 'var(--accent-primary)' }}>LOCK</span>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'var(--surface)',
            border: 'none',
            color: 'var(--text-primary)',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '10px',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isAuthenticated ? (
          <>
            <Link href={role === 'Creator' ? '/creator' : '/buyer'} style={{ 
              color: 'inherit', 
              textDecoration: 'none', 
              fontSize: '14px',
              fontWeight: '600' 
            }}>
              Dashboard <span style={{ opacity: 0.5 }}>[{role}]</span>
            </Link>
            <button
              onClick={logout}
              style={{ 
                background: 'rgba(255, 77, 77, 0.1)', 
                color: '#ff4d4d', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
            <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
          </>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link href="/login" style={{ 
              color: 'var(--text-primary)', 
              textDecoration: 'none', 
              padding: '10px 20px', 
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Login
            </Link>
            <Link href="/signup" style={{ 
              color: '#fff', 
              backgroundColor: 'var(--accent-primary)', 
              textDecoration: 'none', 
              padding: '10px 20px', 
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)'
            }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;