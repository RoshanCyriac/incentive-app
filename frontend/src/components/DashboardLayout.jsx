import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';
import './DashboardShell.css';

export default function DashboardLayout({
  sidebarItems,
  activeItem,
  onItemClick,
  userName,
  userRole,
  userInitials,
  onLogout,
  headerTitle,
  headerTitleIcon,
  headerBreadcrumb,
  welcomeName,
  roleBadge,
  headerRightContent,
  children,
}) {
  const { logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const handleItemClick = useCallback(
    (id) => {
      onItemClick(id);
      setMobileNavOpen(false);
    },
    [onItemClick]
  );

  useEffect(() => {
    if (mobileNavOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeMobileNav();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closeMobileNav]);

  useEffect(() => {
    closeMobileNav();
  }, [activeItem, closeMobileNav]);

  return (
    <div className="dashboard-shell">
      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userName={userName}
        userRole={userRole}
        userInitials={userInitials}
        onLogout={onLogout}
        mobileOpen={mobileNavOpen}
        onMobileClose={closeMobileNav}
      />

      <div className="dashboard-content">
        <Header
          title={headerTitle}
          titleIcon={headerTitleIcon}
          breadcrumb={headerBreadcrumb}
          welcomeName={welcomeName}
          roleBadge={roleBadge}
          userInitials={userInitials}
          rightContent={headerRightContent}
          onMenuClick={() => setMobileNavOpen(true)}
          onBackToLogin={logout}
        />

        <main className="dashboard-main">{children}</main>
      </div>

      <BottomNav
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
