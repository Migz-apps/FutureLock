import React from 'react';
import Navbar from '../components/Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', color: '#fff' }}>
      <Navbar />
      <main>
        {children}
      </main>
    </div>
  );
}