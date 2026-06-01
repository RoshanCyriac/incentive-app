import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';

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
    <div
      className="flex h-[100dvh] overflow-hidden"
      style={{ backgroundColor: '#F4F4F4', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
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

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          title={headerTitle}
          titleIcon={headerTitleIcon}
          breadcrumb={headerBreadcrumb}
          welcomeName={welcomeName}
          roleBadge={roleBadge}
          userInitials={userInitials}
          rightContent={headerRightContent}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        <main
          className="flex-1 overflow-x-hidden overflow-y-auto pb-14 md:pb-0"
          style={{ padding: '20px 24px' }}
        >
          {children}
        </main>
      </div>

      <BottomNav
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
      />
    </div>
  );
}
