import React from 'react';

/**
 * Mobile bottom navigation (below 768px)
 */
export default function BottomNav({ items, activeItem, onItemClick }) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100] flex items-stretch justify-around border-t border-white/[0.08] bg-[#1A1A1A]"
      style={{ height: '56px' }}
      aria-label="Mobile navigation"
    >
      {items.map((item) => {
        const isActive = activeItem === item.id;
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onItemClick(item.id)}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1"
            style={{
              color: isActive ? '#EB0A1E' : 'rgba(255,255,255,0.5)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {typeof Icon === 'function' ? <Icon size={20} /> : null}
            <span style={{ fontSize: '10px' }} className="truncate max-w-full">
              {item.shortLabel || item.label.split(' ')[0]}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
