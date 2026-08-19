import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ConnectButton } from '@rainbow-me/rainbowkit';

import {
  LayoutDashboard,
  Store,
  Vault,
  Upload,
  LogOut,
  Sun,
  Moon,
  X,
  ShieldCheck,
  Home
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const Sidebar = ({
  mobileOpen = false,
  onMobileClose
}: SidebarProps) => {
  const router = useRouter();

  const {
    role,
    identity,
    logout
  } = useAuth();

  const {
    theme,
    toggleTheme
  } = useTheme();

  const isDark = theme === 'dark';

  const creatorNavigation: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/creator',
      icon: LayoutDashboard
    },
    {
      label: 'Marketplace',
      href: '/marketplace',
      icon: Store
    },
    {
      label: 'Create Intel',
      href: '/upload',
      icon: Upload
    },
    {
      label: 'The Vault',
      href: '/vault',
      icon: Vault
    }
  ];

  const buyerNavigation: NavigationItem[] = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard
    },
    {
      label: 'Marketplace',
      href: '/marketplace',
      icon: Store
    },
    {
      label: 'The Vault',
      href: '/vault',
      icon: Vault
    }
  ];

  const navigation =
    role === 'Creator'
      ? creatorNavigation
      : buyerNavigation;

  const isActive = (href: string) => {
    if (
      href === '/creator' ||
      href === '/dashboard'
    ) {
      return router.pathname === href;
    }

    return router.pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    await router.push('/');
  };

  const shortIdentity = identity
    ? identity.length > 25
      ? `${identity.slice(0, 22)}...`
      : identity
    : 'FutureLock user';

  return (
    <>
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`futurelock-sidebar ${
          mobileOpen
            ? 'sidebar-mobile-open'
            : ''
        }`}
      >
        <div className="sidebar-header">
          <Link
            href="/"
            className="sidebar-logo"
            onClick={onMobileClose}
          >
            FUTURE
            <span>LOCK</span>
          </Link>

          <button
            type="button"
            className="sidebar-mobile-close"
            onClick={onMobileClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-role-card">
          <div className="sidebar-role-icon">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span className="sidebar-role-label">
              Current workspace
            </span>

            <strong>
              {role || 'User'}
            </strong>
          </div>
        </div>

        <nav className="sidebar-navigation">
          <span className="sidebar-section-label">
            Workspace
          </span>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={`sidebar-link ${
                  active
                    ? 'sidebar-link-active'
                    : ''
                }`}
                onClick={onMobileClose}
              >
                <Icon size={19} />

                <span>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <span className="sidebar-section-label sidebar-account-label">
            Navigation
          </span>

          <Link
            href="/"
            className="sidebar-link"
            onClick={onMobileClose}
          >
            <Home size={19} />
            <span>Home</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-theme-button"
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

          <div className="sidebar-wallet">
            <ConnectButton
              accountStatus="avatar"
              chainStatus="icon"
              showBalance={false}
            />
          </div>

          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {identity
                ? identity
                    .charAt(0)
                    .toUpperCase()
                : 'F'}
            </div>

            <div className="sidebar-user-info">
              <strong>
                {role || 'FutureLock'}
              </strong>

              <span title={identity || undefined}>
                {shortIdentity}
              </span>
            </div>

            <button
              type="button"
              className="sidebar-logout"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;