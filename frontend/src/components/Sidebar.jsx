import React, { useState, useEffect, useRef } from 'react';
import { IconCar, IconX, IconPanelLeft, IconLogOut, IconChevronDown } from './icons';

/** Sidebar design tokens */
const tokens = {
  bg: '#111827',
  border: 'rgba(255, 255, 255, 0.06)',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  textDim: '#6B7280',
  hover: 'rgba(255, 255, 255, 0.05)',
  activeBg: 'rgba(235, 10, 30, 0.1)',
  activeBorder: '#EB0A1E',
  accent: '#EB0A1E',
};

function NavIcon({ icon: NavIconComponent, emoji, active }) {
  if (typeof NavIconComponent === 'function') {
    return (
      <NavIconComponent
        size={18}
        className={`shrink-0 ${active ? 'text-[#F9FAFB]' : 'text-[#9CA3AF]'}`}
        strokeWidth={1.75}
      />
    );
  }
  if (typeof emoji === 'string') {
    return <span className="shrink-0 text-[15px] leading-none w-[18px] text-center">{emoji}</span>;
  }
  return null;
}

function SidebarProfile({ name, role, initials, collapsed, onLogout, onMobileClose }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative px-3 py-3 border-t" style={{ borderColor: tokens.border }} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          'w-full flex items-center rounded-lg transition-colors duration-150',
          'hover:bg-white/[0.05] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0A1E]/40',
          collapsed ? 'justify-center p-2' : 'gap-3 px-2 py-2 text-left',
          open ? 'bg-white/[0.05]' : '',
        ].join(' ')}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        title={collapsed ? name : undefined}
      >
        <div
          className="flex items-center justify-center shrink-0 w-9 h-9 rounded-full text-white text-xs font-semibold"
          style={{ background: `linear-gradient(135deg, ${tokens.accent} 0%, #991b1b 100%)` }}
          aria-hidden
        >
          {initials || '?'}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#F9FAFB] truncate leading-tight">{name}</p>
              <p className="text-[11px] text-[#6B7280] truncate leading-tight mt-0.5">{role}</p>
            </div>
            <IconChevronDown
              size={16}
              className={`shrink-0 text-[#6B7280] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={[
            'absolute z-50 py-1 rounded-lg border shadow-xl',
            'bg-[#1F2937] border-[#374151]',
            collapsed
              ? 'left-full bottom-0 ml-2 w-48'
              : 'left-3 right-3 bottom-full mb-2',
          ].join(' ')}
        >
          {!collapsed && (
            <div className="px-3 py-2.5 border-b border-[#374151]">
              <p className="text-[13px] font-medium text-[#F9FAFB] truncate">{name}</p>
              <p className="text-[11px] text-[#9CA3AF] truncate mt-0.5">{role}</p>
            </div>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onMobileClose?.();
              onLogout?.();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] text-[#FCA5A5] hover:bg-[#374151] transition-colors text-left focus:outline-none focus-visible:bg-[#374151]"
          >
            <IconLogOut size={16} className="shrink-0" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Modern SaaS sidebar — Stripe / Linear inspired
 */
export default function Sidebar({
  items,
  activeItem,
  onItemClick,
  userSection,
  userName,
  userRole,
  userInitials,
  onLogout,
  mobileOpen = false,
  onMobileClose,
  collapsed = false,
  onToggleCollapse,
}) {
  const isCollapsed = collapsed && !mobileOpen;
  const showProfile = onLogout && userName;

  return (
    <aside
      className={[
        'flex flex-col h-full shrink-0 z-50',
        'fixed inset-y-0 left-0 transition-[width,transform] duration-300 ease-out',
        'lg:static lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        isCollapsed ? 'lg:w-[68px]' : 'lg:w-[260px]',
        mobileOpen ? 'w-[min(280px,88vw)]' : '',
      ].join(' ')}
      style={{ backgroundColor: tokens.bg }}
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div
        className={[
          'flex items-center shrink-0 border-b h-[60px]',
          isCollapsed ? 'justify-center px-2' : 'gap-3 px-4',
        ].join(' ')}
        style={{ borderColor: tokens.border }}
      >
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{ backgroundColor: tokens.accent }}
        >
          <IconCar size={18} className="text-white" strokeWidth={2} />
        </div>

        {!isCollapsed && (
          <div className="flex-1 min-w-0 pr-8 lg:pr-0">
            <p className="text-[15px] font-semibold text-[#F9FAFB] tracking-tight leading-tight">
              Toyota
            </p>
            <p className="text-[11px] text-[#6B7280] leading-tight mt-0.5">
              Incentive Calculator
            </p>
          </div>
        )}

        {/* Mobile close */}
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.06] border border-[#374151] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0A1E]/40"
          aria-label="Close navigation"
        >
          <IconX size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav
        className={[
          'flex-1 overflow-y-auto overflow-x-hidden overscroll-contain py-4',
          isCollapsed ? 'px-2' : 'px-3',
        ].join(' ')}
        aria-label="Main"
      >
        {!isCollapsed && (
          <p className="px-3 mb-2 text-[11px] font-medium uppercase tracking-wider text-[#4B5563]">
            Navigation
          </p>
        )}

        <ul className="space-y-0.5" role="list">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onItemClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  title={isCollapsed ? item.label : undefined}
                  className={[
                    'group w-full flex items-center transition-all duration-150 ease-out',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#EB0A1E]/35',
                    isCollapsed
                      ? 'justify-center p-2.5 rounded-lg'
                      : 'gap-3 px-3 py-2 rounded-md text-left',
                    isActive
                      ? 'text-[#F9FAFB] !bg-[rgba(235,10,30,0.1)]'
                      : 'text-[#9CA3AF] hover:text-[#E5E7EB]',
                  ].join(' ')}
                  style={{
                    borderLeft: isCollapsed
                      ? 'none'
                      : `2px solid ${isActive ? tokens.activeBorder : 'transparent'}`,
                    paddingLeft: isCollapsed ? undefined : isActive ? '10px' : '12px',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = tokens.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <NavIcon
                    icon={item.icon}
                    emoji={typeof item.icon === 'string' ? item.icon : null}
                    active={isActive}
                  />
                  {!isCollapsed && (
                    <span className={`text-[13px] truncate ${isActive ? 'font-medium' : 'font-normal'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse toggle — desktop */}
      {onToggleCollapse && (
        <div className={`hidden lg:block pb-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={[
              'w-full flex items-center rounded-lg py-2 text-[#6B7280]',
              'hover:text-[#9CA3AF] hover:bg-white/[0.05] transition-colors duration-150',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0A1E]/40',
              isCollapsed ? 'justify-center px-2' : 'gap-2.5 px-3 text-[12px]',
            ].join(' ')}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <IconPanelLeft size={18} className={isCollapsed ? 'rotate-180' : ''} />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      )}

      {/* Profile or legacy userSection */}
      {showProfile ? (
        <SidebarProfile
          name={userName}
          role={userRole}
          initials={userInitials}
          collapsed={isCollapsed}
          onLogout={onLogout}
          onMobileClose={onMobileClose}
        />
      ) : (
        userSection &&
        !isCollapsed && (
          <div className="border-t" style={{ borderColor: tokens.border }}>
            {userSection}
          </div>
        )
      )}
    </aside>
  );
}
