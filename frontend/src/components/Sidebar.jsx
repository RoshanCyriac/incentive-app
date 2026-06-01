import React from 'react';
import { IconCar } from './icons';

/**
 * Fixed admin sidebar (220px)
 */
export default function Sidebar({ items, activeItem, onItemClick, userSection }) {
  return (
    <aside
      className="flex flex-col h-screen shrink-0"
      style={{ width: '220px', backgroundColor: '#1A1A1A' }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5"
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
        <div className="min-w-0">
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
      </div>

      {/* Navigation */}
      <nav style={{ padding: '10px 8px' }} className="flex-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = activeItem === item.id;
          const NavIcon = item.icon;
          const iconNode =
            typeof NavIcon === 'function' ? (
              <NavIcon size={16} className="shrink-0" />
            ) : typeof NavIcon === 'string' ? (
              <span className="shrink-0 text-base leading-none">{NavIcon}</span>
            ) : null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item.id)}
              className="w-full flex items-center transition-colors"
              style={{
                gap: '10px',
                padding: '9px 10px',
                borderRadius: '6px',
                fontSize: '13px',
                marginBottom: '2px',
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
              {iconNode}
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      {userSection && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>{userSection}</div>
      )}
    </aside>
  );
}
