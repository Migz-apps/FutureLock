import React from 'react';
import { useRouter } from 'next/router';

import Navbar from '../components/Navbar';
import PortalSidebar from '../components/PortalSidebar';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({
  children
}: LayoutProps) {
  const {
    theme
  } = useTheme();

  const {
    isAuthenticated
  } = useAuth();

  const router = useRouter();

  const publicAuthPage =
    router.pathname === '/login' ||
    router.pathname === '/signup';

  const showPortal =
    isAuthenticated &&
    !publicAuthPage;

  return (
    <div
      data-theme={theme}
      className="app-root"
    >

      <div className="ambient-background" />

      {showPortal ? (
        <>
          <PortalSidebar />

          <main className="portal-main">
            {children}
          </main>
        </>
      ) : (
        <>
          <Navbar />

          <main className="public-main">
            {children}
          </main>
        </>
      )}

    </div>
  );
}