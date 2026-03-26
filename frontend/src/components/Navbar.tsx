import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 40px',
      borderBottom: '1px solid #333',
      backgroundColor: '#000',
      color: '#fff'
    }}>
      <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
        <Link href="/" style={{ color: '#fff', textDecoration: 'none' }}>
          FUTURE<span style={{ color: '#0070f3' }}>LOCK</span>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link href="/" style={{ color: '#ccc', textDecoration: 'none' }}>Marketplace</Link>
        <ConnectButton />
      </div>
    </nav>
  );
};

export default Navbar;