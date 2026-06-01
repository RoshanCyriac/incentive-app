import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

/**
 * Shared admin/officer shell with mobile drawer navigation
 */
export default function DashboardLayout({
  sidebarItems,
  activeItem,
  onItemClick,
  userSection,
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
      style={{ backgroundColor: '#F4F4F4', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileNav}
          aria-label="Close navigation menu"
        />
      )}

      <Sidebar
        items={sidebarItems}
        activeItem={activeItem}
        onItemClick={handleItemClick}
        userSection={userSection}
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
          rightContent={headerRightContent}
          onMenuClick={() => setMobileNavOpen(true)}
        />

        <main
          className={`flex-1 overflow-x-hidden overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 lg:px-6 lg:py-5 ${mainClassName}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
