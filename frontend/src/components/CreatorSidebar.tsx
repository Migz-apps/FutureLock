import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import {
  LayoutDashboard,
  PlusCircle,
  Store,
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
    (href !== '/creator' &&
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

export default function CreatorSidebar() {
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
              Creator Portal
            </div>

          </div>

        </div>

        <nav className="portal-navigation">

          <div className="portal-nav-section-title">
            Workspace
          </div>

          <SidebarLink
            href="/creator"
            label="Dashboard"
            icon={
              <LayoutDashboard size={19} />
            }
          />

          <SidebarLink
            href="/upload"
            label="Create Intelligence"
            icon={
              <PlusCircle size={19} />
            }
          />

          <SidebarLink
            href="/marketplace"
            label="Marketplace"
            icon={
              <Store size={19} />
            }
          />

        </nav>

      </div>

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
