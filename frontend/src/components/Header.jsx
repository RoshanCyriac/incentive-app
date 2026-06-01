import React from 'react';
import { IconMenu } from './icons';

/**
 * Top header bar — stacks on small screens
 */
export default function Header({
  title,
  titleIcon,
  breadcrumb,
  welcomeName,
  roleBadge,
  rightContent,
  onMenuClick,
}) {
  return (
    <header
      className="shrink-0 bg-white border-b border-[#E5E5E5] px-4 py-3 sm:px-5 lg:px-6 lg:py-0 lg:min-h-[56px] lg:flex lg:items-center lg:justify-between"
      style={{ borderBottomWidth: '0.5px' }}
    >
      <div className="flex items-start gap-3 min-w-0 lg:items-center lg:flex-1">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden shrink-0 flex items-center justify-center w-9 h-9 -ml-1 rounded-md text-[#1A1A1A] hover:bg-[#F4F4F4]"
            aria-label="Open navigation menu"
          >
            <IconMenu size={20} />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 min-w-0">
            {titleIcon && (
              <span className="flex items-center shrink-0" style={{ color: '#EB0A1E' }}>
                {titleIcon}
              </span>
            )}
            <h1
              className="truncate"
              style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A' }}
            >
              {title}
            </h1>
          </div>
          {breadcrumb && (
            <p
              className="truncate"
              style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}
            >
              {breadcrumb}
            </p>
          )}
        </div>
      </div>

      {rightContent ? (
        <div className="mt-3 w-full min-w-0 lg:mt-0 lg:w-auto lg:shrink-0 pl-0 lg:pl-4">
          {rightContent}
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3 pl-0 lg:mt-0 lg:pl-4 lg:shrink-0">
          {welcomeName != null && welcomeName !== '' && (
            <>
              <span
                className="sm:hidden text-[13px] text-[#666] truncate max-w-[160px]"
              >
                Hi, {welcomeName.split(' ')[0]}
              </span>
              <span
                className="hidden sm:inline truncate max-w-[200px] md:max-w-none"
                style={{ fontSize: '13px', color: '#666' }}
              >
                Welcome back, {welcomeName}
              </span>
            </>
          )}
          {roleBadge && (
            <span
              className="shrink-0"
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
        </div>
      )}
    </header>
  );
}
