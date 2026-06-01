import React from 'react';
import { IconMenu } from './icons';

function BreadcrumbTrail({ breadcrumb }) {
  if (!breadcrumb) return null;

  const parts = breadcrumb.split('→').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 flex-wrap mt-1.5" aria-label="Breadcrumb">
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1;
        return (
          <React.Fragment key={`${part}-${index}`}>
            {index > 0 && (
              <span className="text-[#CCC] text-[11px] select-none" aria-hidden>
                /
              </span>
            )}
            <span
              className={
                isLast
                  ? 'inline-flex items-center text-[12px] font-medium text-[#EB0A1E] bg-[#FFF0F1] px-2 py-0.5 rounded'
                  : 'text-[12px] text-[#999]'
              }
            >
              {part}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/**
 * Top header bar with prominent active page context
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
      className="shrink-0 bg-white border-b border-[#E8E8E8] px-4 py-3.5 sm:px-5 lg:px-6 lg:py-3"
      style={{ borderBottomWidth: '0.5px' }}
    >
      <div className="lg:flex lg:items-center lg:justify-between lg:gap-6">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden shrink-0 flex items-center justify-center w-10 h-10 -ml-0.5 rounded-lg text-[#1A1A1A] border border-[#E8E8E8] bg-[#FAFAFA] hover:bg-[#F4F4F4] active:bg-[#EEE]"
              aria-label="Open navigation menu"
            >
              <IconMenu size={20} />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#AAA] mb-1.5 hidden sm:block"
            >
              Current page
            </p>

            <div className="flex items-center gap-3 min-w-0">
              {titleIcon && (
                <span
                  className="flex items-center justify-center shrink-0 w-10 h-10 rounded-lg"
                  style={{ backgroundColor: '#FFF0F1', color: '#EB0A1E' }}
                >
                  {titleIcon}
                </span>
              )}
              <div className="min-w-0">
                <h1
                  className="truncate leading-tight"
                  style={{ fontSize: '17px', fontWeight: 600, color: '#1A1A1A' }}
                >
                  {title}
                </h1>
                <BreadcrumbTrail breadcrumb={breadcrumb} />
              </div>
            </div>
          </div>
        </div>

        {rightContent ? (
          <div className="mt-4 w-full min-w-0 lg:mt-0 lg:w-auto lg:max-w-[50%] lg:shrink-0 pt-3 lg:pt-0 border-t border-[#F0F0F0] lg:border-t-0">
            {rightContent}
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3 lg:mt-0 lg:shrink-0 pt-3 lg:pt-0 border-t border-[#F0F0F0] lg:border-t-0">
            {welcomeName != null && welcomeName !== '' && (
              <>
                <span className="sm:hidden text-[13px] text-[#666] truncate max-w-[160px]">
                  Hi, {welcomeName.split(' ')[0]}
                </span>
                <span
                  className="hidden sm:inline truncate max-w-[220px] lg:max-w-[280px]"
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
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontWeight: 500,
                  border: '0.5px solid rgba(235,10,30,0.15)',
                }}
              >
                {roleBadge}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
