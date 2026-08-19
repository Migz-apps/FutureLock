import React, {
    useState
  } from 'react';
  
  import Sidebar from './Sidebar';
  import AppTopbar from './AppTopbar';
  
  interface AppLayoutProps {
    children: React.ReactNode;
  }
  
  const AppLayout = ({
    children
  }: AppLayoutProps) => {
    const [
      mobileSidebarOpen,
      setMobileSidebarOpen
    ] = useState(false);
  
    return (
      <div className="app-shell">
        <Sidebar
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() =>
            setMobileSidebarOpen(false)
          }
        />
  
        <div className="app-shell-main">
          <AppTopbar
            onMenuClick={() =>
              setMobileSidebarOpen(true)
            }
          />
  
          <main className="app-shell-content">
            {children}
          </main>
        </div>
      </div>
    );
  };
  
  export default AppLayout;