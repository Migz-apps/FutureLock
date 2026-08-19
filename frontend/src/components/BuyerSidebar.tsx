import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  LayoutDashboard,
  Store,
  LockKeyhole,
  History,
  LogOut,
  Moon,
  Sun,
  ShieldCheck
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarLinkProps {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function SidebarLink({
  href,
  label,
  icon
}: SidebarLinkProps) {
  const router = useRouter();

  const active =
    router.pathname === href ||
    (href !== '/dashboard' &&
      router.pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={`portal-nav-link ${
        active ? 'portal-nav-link-active' : ''
      }`}
    >
      <span className="portal-nav-icon">
        {icon}
      </span>

      <span>{label}</span>
    </Link>
  );
}

export default function BuyerSidebar() {
  const router = useRouter();

  const {
    logout
  } = useAuth();

  const {
    theme,
    toggleTheme
  } = useTheme();

  const isDark = theme === 'dark';

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <aside className="portal-sidebar">

      <div className="portal-sidebar-top">

        {/* BRAND */}
        <div className="portal-brand">
          <div className="portal-brand-icon">
            <ShieldCheck size={21} />
          </div>

          <div>
            <div className="portal-brand-name">
              FUTURE
              <span>LOCK</span>
            </div>

            <div className="portal-brand-subtitle">
              Buyer Portal
            </div>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="portal-navigation">

          <div className="portal-nav-section-title">
            Workspace
          </div>

          <SidebarLink
            href="/dashboard"
            label="Dashboard"
            icon={
              <LayoutDashboard size={19} />
            }
          />

          <SidebarLink
            href="/marketplace"
            label="Marketplace"
            icon={
              <Store size={19} />
            }
          />

          <SidebarLink
            href="/vault"
            label="My Vault"
            icon={
              <LockKeyhole size={19} />
            }
          />

          <SidebarLink
            href="/purchase-history"
            label="Purchase History"
            icon={
              <History size={19} />
            }
          />

        </nav>

      </div>

      {/* BOTTOM */}
      <div className="portal-sidebar-bottom">

        <div className="portal-wallet">
          <ConnectButton
            accountStatus="avatar"
            chainStatus="icon"
            showBalance={false}
          />
        </div>

        <button
          type="button"
          className="portal-sidebar-action"
          onClick={toggleTheme}
        >
          {isDark ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}

          <span>
            {isDark
              ? 'Light mode'
              : 'Dark mode'}
          </span>
        </button>

        <button
          type="button"
          className="portal-sidebar-action portal-logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />

          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}