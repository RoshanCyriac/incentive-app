import React from 'react';
import { IconCar, IconX, IconLogOut } from './icons';

function NavIcon({ icon: NavIconComponent, active }) {
  if (typeof NavIconComponent === 'function') {
    return <NavIconComponent size={16} className="shrink-0" />;
  }
  return null;
}

/**
 * Admin sidebar — 220px desktop, 60px tablet, drawer on mobile
 */
export default function Sidebar({
  items,
  activeItem,
  onItemClick,
  userName,
  userRole,
  userInitials,
  onLogout,
  mobileOpen = false,
  onMobileClose,
}) {
  return (
    <>
      {/* Mobile drawer backdrop */}
      {mobileOpen && (
        <button
          type="button"
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={onMobileClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={[
          'flex flex-col h-full shrink-0 bg-[#1A1A1A] z-50',
          /* Mobile: drawer */
          'max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:w-[280px]',
          'max-md:transition-transform max-md:duration-300',
          mobileOpen ? 'max-md:translate-x-0 max-md:flex' : 'max-md:hidden',
          /* Tablet: 60px icon-only */
          'md:flex md:w-[60px]',
          /* Desktop: 220px */
          'lg:w-[220px]',
        ].join(' ')}
        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2.5 shrink-0 border-b border-white/[0.08] px-4 py-[18px] md:justify-center md:px-2 lg:justify-start lg:px-4"
        >
          <div
            className="flex items-center justify-center w-[30px] h-[30px] shrink-0 rounded-md"
            style={{ backgroundColor: '#EB0A1E' }}
          >
            <IconCar size={16} className="text-white" />
          </div>
          <div className="min-w-0 flex-1 md:hidden lg:block">
            <p className="text-white leading-tight" style={{ fontSize: '13.5px', fontWeight: 500 }}>
              Toyota
            </p>
            <p className="leading-tight" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
              Incentive Calculator
            </p>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            className="md:hidden ml-auto flex items-center justify-center w-8 h-8 text-white/60 hover:text-white"
            aria-label="Close"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: '10px 8px' }} aria-label="Main">
          <ul className="space-y-0.5">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onItemClick(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    title={item.label}
                    className="w-full flex items-center transition-colors md:justify-center md:px-0 md:py-[9px] lg:justify-start lg:px-[10px] lg:py-[9px]"
                    style={{
                      gap: '10px',
                      borderRadius: '6px',
                      fontSize: '13px',
                      borderLeft: '3px solid',
                      borderLeftColor: isActive ? '#EB0A1E' : 'transparent',
                      backgroundColor: isActive ? 'rgba(235,10,30,0.12)' : 'transparent',
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                      }
                    }}
                  >
                    <NavIcon icon={item.icon} active={isActive} />
                    <span className="truncate md:hidden lg:inline">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User — full desktop only */}
        {userName && onLogout && (
          <div
            className="hidden lg:flex items-center gap-2.5 border-t border-white/[0.08]"
            style={{ padding: '12px 16px' }}
          >
            <div
              className="flex items-center justify-center shrink-0 rounded-full text-white"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#EB0A1E',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white truncate" style={{ fontSize: '12.5px', fontWeight: 500 }}>
                {userName}
              </p>
              <p className="truncate" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                {userRole}
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="shrink-0 flex items-center justify-center transition-colors"
              style={{
                border: '0.5px solid rgba(255,255,255,0.2)',
                borderRadius: '5px',
                padding: '5px 8px',
                color: 'rgba(255,255,255,0.5)',
                background: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }}
              aria-label="Log out"
            >
              <IconLogOut size={14} />
            </button>
          </div>
        )}

        {/* User — tablet avatar only */}
        {userInitials && (
          <div
            className="hidden md:flex lg:hidden items-center justify-center border-t border-white/[0.08] py-3"
          >
            <div
              className="flex items-center justify-center rounded-full text-white"
              style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#EB0A1E',
                fontSize: '11px',
                fontWeight: 500,
              }}
            >
              {userInitials}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
