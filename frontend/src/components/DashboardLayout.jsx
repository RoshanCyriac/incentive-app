import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Shared admin/officer shell with mobile drawer + collapsible desktop sidebar
 */
export default function DashboardLayout({
  sidebarItems,
  activeItem,
  onItemClick,
  userSection,
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
  mainClassName = '',
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const handleItemClick = useCallback(
    (id) => {
      onItemClick(id);
      setMobileNavOpen(false);
    },
    [onItemClick]
  );

  useEffect(() => {
    if (mobileNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeMobileNav();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [closeMobileNav]);

  useEffect(() => {
    closeMobileNav();
  }, [activeItem, closeMobileNav]);

  return (
    <div
      className="flex h-[100dvh] overflow-hidden font-sans"
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        background: 'linear-gradient(160deg, #eef1f8 0%, #f8f9fc 40%, #f0f2f8 100%)',
      }}
    >
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={closeMobileNav}
          aria-label="Close navigation menu"
        />
      )}

      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userSection={userSection}
        userName={userName}
        userRole={userRole}
        userInitials={userInitials}
        onLogout={onLogout}
        mobileOpen={mobileNavOpen}
        onMobileClose={closeMobileNav}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          title={headerTitle}
          titleIcon={headerTitleIcon}
          breadcrumb={headerBreadcrumb}
          welcomeName={welcomeName}
          roleBadge={roleBadge}
          rightContent={headerRightContent}
          onMenuClick={() => setMobileNavOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((c) => !c)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 ${mainClassName}`}
        >
          <div className="mx-auto w-full max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
