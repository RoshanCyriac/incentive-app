import React, { useState, useEffect, useRef } from 'react';
import { IconCar, IconX, IconPanelLeft, IconLogOut, IconChevronDown } from './icons';

function NavIcon({ icon: NavIconComponent, emoji, active }) {
  if (typeof NavIconComponent === 'function') {
    return (
      <NavIconComponent
        size={18}
        className={`shrink-0 ${active ? 'text-[#FF6B7A]' : 'text-[#94A3B8]'}`}
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
    <div className="relative px-3 py-3 border-t border-white/10" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={[
          'w-full flex items-center rounded-xl transition-all duration-200',
          'bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06]',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0A1E]/50',
          collapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5 text-left',
          open ? 'ring-1 ring-[#EB0A1E]/30' : '',
        ].join(' ')}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        title={collapsed ? name : undefined}
      >
        <div
          className="flex items-center justify-center shrink-0 w-9 h-9 rounded-full text-white text-xs font-bold ring-2 ring-[#EB0A1E]/40"
          style={{ background: 'linear-gradient(135deg, #EB0A1E 0%, #b91c1c 50%, #7f1d1d 100%)' }}
        >
          {initials || '?'}
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white truncate">{name}</p>
              <p className="text-[11px] text-[#94A3B8] truncate mt-0.5">{role}</p>
            </div>
            <IconChevronDown
              size={16}
              className={`shrink-0 text-[#64748B] transition-transform ${open ? 'rotate-180 text-[#EB0A1E]' : ''}`}
            />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={[
            'absolute z-50 py-1.5 rounded-xl border overflow-hidden',
            'bg-[#1e293b] border-[#334155] shadow-2xl shadow-black/40',
            collapsed ? 'left-full bottom-0 ml-2 w-52' : 'left-3 right-3 bottom-full mb-2',
          ].join(' ')}
        >
          {!collapsed && (
            <div className="px-3 py-3 bg-gradient-to-r from-[#EB0A1E]/10 to-transparent border-b border-[#334155]">
              <p className="text-[13px] font-semibold text-white truncate">{name}</p>
              <p className="text-[11px] text-[#94A3B8] truncate">{role}</p>
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
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium text-red-300 hover:bg-red-500/10 hover:text-red-200 transition-colors text-left"
          >
            <IconLogOut size={16} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

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
        isCollapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
        mobileOpen ? 'w-[min(280px,88vw)]' : '',
      ].join(' ')}
      style={{
        background: 'linear-gradient(180deg, #0c1222 0%, #151d32 50%, #111827 100%)',
      }}
      aria-label="Sidebar navigation"
    >
      {/* Accent stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#EB0A1E] via-[#ff4d5e] to-[#EB0A1E]" />

      {/* Logo */}
      <div
        className={[
          'flex items-center shrink-0 border-b border-white/10 h-[64px] relative',
          isCollapsed ? 'justify-center px-2' : 'gap-3 px-4',
        ].join(' ')}
      >
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-lg shadow-red-900/30"
          style={{ background: 'linear-gradient(135deg, #EB0A1E, #c8071a)' }}
        >
          <IconCar size={20} className="text-white" strokeWidth={2} />
        </div>

        {!isCollapsed && (
          <div className="flex-1 min-w-0 pr-9 lg:pr-0">
            <p className="text-[15px] font-bold text-white tracking-tight">Toyota</p>
            <p className="text-[11px] text-[#64748B] mt-0.5">Incentive Calculator</p>
          </div>
        )}

        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 transition-colors"
          aria-label="Close navigation"
        >
          <IconX size={18} />
        </button>
      </div>

      <nav
        className={['flex-1 overflow-y-auto py-4', isCollapsed ? 'px-2' : 'px-3'].join(' ')}
        aria-label="Main"
      >
        {!isCollapsed && (
          <p className="px-3 mb-3 text-[10px] font-bold uppercase tracking-widest text-[#475569]">
            Menu
          </p>
        )}

        <ul className="space-y-1">
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
                    'w-full flex items-center rounded-xl transition-all duration-200',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#EB0A1E]/50',
                    isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5 text-left',
                    isActive
                      ? 'text-white shadow-md shadow-red-900/20'
                      : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.06]',
                  ].join(' ')}
                  style={
                    isActive
                      ? {
                          background: 'linear-gradient(90deg, rgba(235,10,30,0.25) 0%, rgba(235,10,30,0.08) 100%)',
                          borderLeft: isCollapsed ? 'none' : '3px solid #EB0A1E',
                        }
                      : { borderLeft: isCollapsed ? 'none' : '3px solid transparent' }
                  }
                >
                  <NavIcon
                    icon={item.icon}
                    emoji={typeof item.icon === 'string' ? item.icon : null}
                    active={isActive}
                  />
                  {!isCollapsed && (
                    <span className={`text-[13px] truncate ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {item.label}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {onToggleCollapse && (
        <div className={`hidden lg:block pb-2 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={[
              'w-full flex items-center rounded-lg py-2 text-[#64748B] hover:text-[#cbd5e1]',
              'hover:bg-white/[0.06] transition-colors text-[12px]',
              isCollapsed ? 'justify-center px-2' : 'gap-2 px-3',
            ].join(' ')}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <IconPanelLeft size={18} className={isCollapsed ? 'rotate-180' : ''} />
            {!isCollapsed && <span>Collapse</span>}
          </button>
        </div>
      )}

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
        !isCollapsed && <div className="border-t border-white/10">{userSection}</div>
      )}
    </aside>
  );
}
