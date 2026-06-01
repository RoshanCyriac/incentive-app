import React from 'react';
import { IconCar, IconX } from './icons';

/**
 * Admin/officer sidebar — fixed on desktop, drawer on mobile
 */
export default function Sidebar({
  items,
  activeItem,
  onItemClick,
  userSection,
  mobileOpen = false,
  onMobileClose,
}) {
  return (
    <aside
      className={[
        'flex flex-col h-full shrink-0 z-50',
        'fixed inset-y-0 left-0 w-[min(280px,88vw)]',
        'transition-transform duration-300 ease-out',
        'lg:static lg:w-[220px] lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
      style={{ backgroundColor: '#1A1A1A' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 relative"
        style={{
          padding: '18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: '30px',
            height: '30px',
            backgroundColor: '#EB0A1E',
            borderRadius: '6px',
          }}
        >
          <IconCar size={16} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className="text-white leading-tight"
            style={{ fontSize: '13.5px', fontWeight: 500 }}
          >
            Toyota
          </p>
          <p
            className="leading-tight"
            style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}
          >
            Incentive Calculator
          </p>
        </div>
        <button
          type="button"
          onClick={onMobileClose}
          className="lg:hidden flex items-center justify-center shrink-0 p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10"
          aria-label="Close menu"
        >
          <IconX size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto overscroll-contain px-2 py-3"
        aria-label="Main navigation"
      >
        <p
          className="px-2.5 mb-2 text-[10px] font-semibold uppercase tracking-[0.1em]"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Menu
        </p>

        <ul className="space-y-1">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            const NavIcon = item.icon;
            const iconNode =
              typeof NavIcon === 'function' ? (
                <NavIcon size={16} className="shrink-0" />
              ) : typeof NavIcon === 'string' ? (
                <span className="shrink-0 text-base leading-none w-4 text-center">{NavIcon}</span>
              ) : null;

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onItemClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={[
                    'w-full flex items-center gap-2.5 rounded-lg transition-all duration-150',
                    'text-[13px] font-medium text-left',
                    isActive
                      ? 'text-white pl-[7px] pr-2.5 py-2.5'
                      : 'text-[rgba(255,255,255,0.6)] px-2.5 py-2.5 hover:text-[rgba(255,255,255,0.92)] hover:bg-[rgba(255,255,255,0.06)]',
                  ].join(' ')}
                  style={
                    isActive
                      ? {
                          backgroundColor: 'rgba(235,10,30,0.18)',
                          borderLeft: '3px solid #EB0A1E',
                          boxShadow: 'inset 0 0 0 0.5px rgba(235,10,30,0.25)',
                        }
                      : { borderLeft: '3px solid transparent' }
                  }
                >
                  <span
                    className={[
                      'flex items-center justify-center shrink-0 w-7 h-7 rounded-md transition-colors',
                      isActive
                        ? 'bg-[#EB0A1E] text-white'
                        : 'bg-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)]',
                    ].join(' ')}
                  >
                    {iconNode}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {isActive && (
                    <span
                      className="shrink-0 w-1.5 h-1.5 rounded-full bg-[#EB0A1E]"
                      aria-hidden
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {userSection && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>{userSection}</div>
      )}
    </aside>
  );
}
