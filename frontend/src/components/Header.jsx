import React from 'react';
import { IconMenu, IconCar, IconChevronLeft } from './icons';

export default function Header({
  title,
  titleIcon,
  breadcrumb,
  welcomeName,
  roleBadge,
  rightContent,
  userInitials,
  onMenuClick,
  onBackToLogin,
}) {
  return (
    <header className="app-header">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {onBackToLogin && (
          <button
            type="button"
            onClick={onBackToLogin}
            className="app-header-back-btn shrink-0"
            aria-label="Back to login"
          >
            <IconChevronLeft size={18} />
            <span className="app-header-back-label">Back</span>
          </button>
        )}

        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="app-header-menu-btn shrink-0 items-center justify-center bg-transparent border-none p-0 cursor-pointer"
            style={{ color: '#1A1A1A' }}
            aria-label="Open menu"
          >
            <IconMenu size={24} />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center" style={{ gap: '8px' }}>
            <span className="app-header-title-icon text-[#EB0A1E] shrink-0 flex items-center">
              {titleIcon || <IconCar size={16} />}
            </span>
            <h1
              className="truncate"
              style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A' }}
            >
              {title}
            </h1>
          </div>
          {breadcrumb && (
            <p
              className="app-header-breadcrumb truncate"
              style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}
            >
              {breadcrumb}
            </p>
          )}
        </div>
      </div>

      {rightContent ? (
        <div className="shrink-0">{rightContent}</div>
      ) : (
        <div className="flex items-center gap-3 shrink-0">
          {welcomeName && (
            <span className="app-header-welcome" style={{ fontSize: '13px', color: '#666' }}>
              Welcome back, {welcomeName}
            </span>
          )}
          {roleBadge && (
            <span
              className="app-header-role-badge"
              style={{
                backgroundColor: '#FFF0F1',
                color: '#A32D2D',
                fontSize: '11px',
                padding: '3px 10px',
                borderRadius: '20px',
                fontWeight: 500,
              }}
            >
              {roleBadge}
            </span>
          )}
          {userInitials && (
            <div
              className="app-header-mobile-avatar items-center justify-center rounded-full text-white shrink-0"
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
          )}
        </div>
      )}
    </header>
  );
}
