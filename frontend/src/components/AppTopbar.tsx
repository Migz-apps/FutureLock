import React from 'react';

import {
  Menu,
  Search,
  Bell
} from 'lucide-react';

interface AppTopbarProps {
  onMenuClick: () => void;
}

const AppTopbar = ({
  onMenuClick
}: AppTopbarProps) => {
  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button
          type="button"
          className="app-mobile-menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={21} />
        </button>

        <div className="app-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search intelligence..."
            aria-label="Search intelligence"
          />
        </div>
      </div>

      <div className="app-topbar-actions">
        <button
          type="button"
          className="app-topbar-icon-button"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={19} />
        </button>
      </div>
    </header>
  );
};

export default AppTopbar;