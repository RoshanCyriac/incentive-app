import React from 'react';
import { IconMenu, IconCar } from './icons';

export default function Header({
  title,
  titleIcon,
  breadcrumb,
  welcomeName,
  roleBadge,
  rightContent,
  userInitials,
  onMenuClick,
}) {
  return (
    <header
      className="shrink-0 bg-white flex items-center justify-between gap-3 px-4 lg:px-6"
      style={{
        height: '56px',
        borderBottom: '0.5px solid #E5E5E5',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden shrink-0 flex items-center justify-center bg-transparent border-none p-0 cursor-pointer"
            style={{ color: '#1A1A1A' }}
            aria-label="Open menu"
          >
            <IconMenu size={24} />
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[#EB0A1E] shrink-0 flex items-center">
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
              className="truncate max-md:hidden"
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
            <span className="max-lg:hidden" style={{ fontSize: '13px', color: '#666' }}>
              Welcome back, {welcomeName}
            </span>
          )}
          {roleBadge && (
            <span
              className="max-md:hidden"
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
              className="md:hidden flex items-center justify-center rounded-full text-white shrink-0"
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
