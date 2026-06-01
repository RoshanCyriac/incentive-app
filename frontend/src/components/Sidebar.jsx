import React from 'react';
import { IconCar, IconX, IconLogOut } from './icons';

function NavIcon({ icon: NavIconComponent }) {
  if (typeof NavIconComponent === 'function') {
    return <NavIconComponent size={16} className="shrink-0" />;
  }
  return null;
}

function LogoRow({ showWordmark, onClose }) {
  return (
    <div
      className="sidebar-logo-row flex items-center shrink-0"
      style={{
        gap: '10px',
        padding: '18px 16px',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
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
      {showWordmark && (
        <div
          className={
            onClose
              ? 'min-w-0 flex-1 flex flex-col'
              : 'sidebar-wordmark--desktop min-w-0 flex-1 flex flex-col'
          }
        >
          <p className="text-white leading-tight" style={{ fontSize: '13.5px', fontWeight: 500 }}>
            Toyota
          </p>
          <p className="leading-tight" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>
            Incentive Calculator
          </p>
        </div>
      )}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-auto flex items-center justify-center bg-transparent border-none cursor-pointer"
          style={{ color: '#fff', padding: '4px' }}
          aria-label="Close menu"
        >
          <IconX size={20} />
        </button>
      )}
    </div>
  );
}

function NavList({ items, activeItem, onItemClick }) {
  return (
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
                className="sidebar-nav-btn w-full flex items-center transition-colors"
                style={{
                  gap: '10px',
                  padding: '9px 10px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  borderLeft: '3px solid',
                  borderLeftColor: isActive ? '#EB0A1E' : 'transparent',
                  backgroundColor: isActive ? 'rgba(235,10,30,0.12)' : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer',
                  borderTop: 'none',
                  borderRight: 'none',
                  borderBottom: 'none',
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
                <NavIcon icon={item.icon} />
                <span className="sidebar-nav-label truncate">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function UserSectionFull({ userName, userRole, userInitials, onLogout }) {
  if (!userName || !onLogout) return null;
  return (
    <div
      className="sidebar-user-full flex items-center gap-2.5 border-t border-white/[0.08]"
      style={{ padding: '12px 16px', borderTopWidth: '0.5px' }}
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
          cursor: 'pointer',
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
  );
}

function UserSectionTablet({ userInitials }) {
  if (!userInitials) return null;
  return (
    <div
      className="sidebar-user-tablet items-center justify-center border-t border-white/[0.08] py-3"
      style={{ borderTopWidth: '0.5px' }}
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
  );
}

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
      <div
        className={
          mobileOpen
            ? 'sidebar-drawer-overlay sidebar-drawer-overlay--visible'
            : 'sidebar-drawer-overlay'
        }
        onClick={onMobileClose}
        role="presentation"
        aria-hidden={!mobileOpen}
      />

      <aside className="sidebar">
        <LogoRow showWordmark />
        <NavList items={items} activeItem={activeItem} onItemClick={onItemClick} />
        <UserSectionFull
          userName={userName}
          userRole={userRole}
          userInitials={userInitials}
          onLogout={onLogout}
        />
        <UserSectionTablet userInitials={userInitials} />
      </aside>

      <aside className={`sidebar-drawer${mobileOpen ? ' sidebar-drawer--open' : ''}`}>
        <LogoRow showWordmark onClose={onMobileClose} />
        <NavList items={items} activeItem={activeItem} onItemClick={onItemClick} />
        <UserSectionFull
          userName={userName}
          userRole={userRole}
          userInitials={userInitials}
          onLogout={onLogout}
        />
      </aside>
    </>
  );
}
