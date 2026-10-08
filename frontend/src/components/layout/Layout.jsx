import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Automatically close mobile sidebar on navigation
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    if (window.innerWidth <= 768) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarCollapsed((prev) => !prev);
    }
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="layout-shell">
      <Navbar onToggleSidebar={toggleSidebar} isSidebarCollapsed={isSidebarCollapsed} />
      
      {/* Mobile Backdrop Overlay */}
      <div 
        className={`sidebar-backdrop ${isMobileSidebarOpen ? 'active' : ''}`} 
        onClick={closeMobileSidebar} 
      />

      <div className="layout-body">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={closeMobileSidebar}
        />
        <main className="layout-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
