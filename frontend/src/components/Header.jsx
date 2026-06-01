import React from 'react';
import { IconMenu } from './icons';

function BreadcrumbTrail({ breadcrumb }) {
  if (!breadcrumb) return null;

  const parts = breadcrumb.split('→').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <nav className="flex items-center gap-1 mt-0.5" aria-label="Breadcrumb">
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          {index > 0 && (
            <span className="text-[#D4D4D4] text-[11px] select-none px-0.5" aria-hidden>
              /
            </span>
          )}
          <span className="text-[11px] text-[#A3A3A3] font-normal">{part}</span>
        </React.Fragment>
      ))}
    </nav>
  );
}

/**
 * Top header — clear title, subtle breadcrumb, secondary user area
 */
export default function Header({
  title,
  titleIcon,
  breadcrumb,
  welcomeName,
  roleBadge,
  rightContent,
  onMenuClick,
  onToggleSidebar,
  sidebarCollapsed,
}) {
  return (
    <header className="shrink-0 bg-white border-b border-[#EAEAEA] px-4 py-3 sm:px-5 lg:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="lg:hidden shrink-0 flex items-center justify-center w-9 h-9 rounded-lg text-[#525252] border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA] shadow-sm"
              aria-label="Open navigation menu"
            >
              <IconMenu size={18} />
            </button>
          )}

          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:flex shrink-0 items-center justify-center w-9 h-9 rounded-lg text-[#525252] border border-[#E5E5E5] bg-white hover:bg-[#FAFAFA]"
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <IconMenu size={18} />
            </button>
          )}

          <div className="min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              {titleIcon && (
                <span className="hidden sm:flex items-center justify-center shrink-0 text-[#EB0A1E] opacity-90">
                  {titleIcon}
                </span>
              )}
              <h1 className="text-[18px] sm:text-[20px] font-semibold text-[#171717] truncate tracking-tight">
                {title}
              </h1>
            </div>
            <BreadcrumbTrail breadcrumb={breadcrumb} />
          </div>
        </div>

        {rightContent ? (
          <div className="shrink-0 min-w-0 max-w-full sm:max-w-[55%]">{rightContent}</div>
        ) : (
          <div className="hidden sm:flex items-center gap-2.5 shrink-0 text-right">
            {welcomeName != null && welcomeName !== '' && (
              <span className="text-[13px] text-[#737373] truncate max-w-[200px]">
                {welcomeName}
              </span>
            )}
            {roleBadge && (
              <span className="text-[11px] font-medium text-[#737373] bg-[#F5F5F5] px-2.5 py-1 rounded-md border border-[#E5E5E5]">
                {roleBadge}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile user row */}
      {!rightContent && welcomeName && (
        <div className="sm:hidden flex items-center justify-between mt-2 pt-2 border-t border-[#F5F5F5]">
          <span className="text-xs text-[#737373] truncate">{welcomeName}</span>
          {roleBadge && (
            <span className="text-[10px] text-[#737373] bg-[#F5F5F5] px-2 py-0.5 rounded">{roleBadge}</span>
          )}
        </div>
      )}
    </header>
  );
}
