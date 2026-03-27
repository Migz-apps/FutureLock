import React, { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
// Using standard Lucide icons
import { Sun, Moon } from 'lucide-react';

// Sub-component for interactive Navbar links
const NavLink = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: (e: any) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const style = {
    color: isHovered ? 'var(--accent-primary)' : 'inherit',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    opacity: isHovered ? 1 : 0.8,
    transition: 'all 0.2s ease-in-out',
    textShadow: isHovered
      ? (isDark ? '0 0 15px rgba(0, 112, 243, 0.4)' : '0 0 10px rgba(0, 112, 243, 0.2)')
      : 'none',
    cursor: 'pointer'
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </Link>
  );
};

const Navbar = () => {
  const { isAuthenticated, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const isDark = theme === 'dark';

  const handleUploadClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push('/login?redirect=/upload');
    }
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 40px',
      backgroundColor: isDark ? 'rgba(10, 10, 10, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(16px)',
      boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.6)' : '0 10px 40px rgba(0,0,0,0.05)',
      color: 'var(--text-primary)',
      transition: 'all 0.3s ease',
      border: 'none'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '50px' }}>
        {/* Main Logo - Link Back Home */}
        <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-1.5px' }}>
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            FUTURE<span style={{ color: 'var(--accent-primary)' }}>LOCK</span>
          </Link>
        </div>

        {/* Global Navigation Links */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/marketplace">Marketplace</NavLink>
          <NavLink href="/upload" onClick={handleUploadClick}>Upload Insights</NavLink>
        </div>
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
            borderRadius: '12px',
            cursor: 'pointer',
            boxShadow: isDark ? '0 4px 15px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.05)',
            transition: 'transform 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {isAuthenticated ? (
          <>
            <Link href={role === 'Creator' ? '/creator' : '/dashboard'} style={{
              color: 'inherit',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '700',
              opacity: 0.9
            }}>
              Dashboard <span style={{ color: 'var(--accent-primary)', marginLeft: '4px' }}>[{role}]</span>
            </Link>
            <button
              onClick={logout}
              style={{
                background: 'rgba(255, 77, 77, 0.1)',
                color: '#ff4d4d',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.2)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 77, 77, 0.1)'}
            >
              Logout
            </button>
            <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
          </>
        ) : (
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/login" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              padding: '10px 10px',
              fontSize: '14px',
              fontWeight: '700'
            }}>
              Login
            </Link>
            <Link href="/signup" style={{
              color: '#fff',
              backgroundColor: 'var(--accent-primary)',
              textDecoration: 'none',
              padding: '12px 24px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 8px 20px rgba(0, 112, 243, 0.3)',
              transition: 'transform 0.2s'
            }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;