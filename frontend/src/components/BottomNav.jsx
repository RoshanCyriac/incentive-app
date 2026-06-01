import React from 'react';

/**
 * Mobile bottom navigation (max-width 768px) — visibility controlled by DashboardShell.css
 */
export default function BottomNav({ items, activeItem, onItemClick }) {
  return (
    <nav className="bottom-nav-bar" aria-label="Mobile navigation">
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const Icon = item.icon;
        const label = item.label;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className="bottom-nav-item"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              minWidth: 0,
              padding: '4px 2px',
              color: isActive ? '#EB0A1E' : 'rgba(255,255,255,0.5)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {typeof Icon === 'function' ? <Icon size={20} /> : null}
            <span style={{ fontSize: '10px', lineHeight: 1.2, textAlign: 'center' }}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
