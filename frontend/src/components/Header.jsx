import React from 'react';
import { IconMenu } from './icons';

function BreadcrumbTrail({ breadcrumb }) {
  if (!breadcrumb) return null;
  const parts = breadcrumb.split('→').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return null;

  return (
    <nav className="flex items-center gap-1.5 mt-1" aria-label="Breadcrumb">
      {parts.map((part, index) => (
        <React.Fragment key={`${part}-${index}`}>
          {index > 0 && <span className="text-slate-300 text-xs">/</span>}
          <span
            className={
              index === parts.length - 1
                ? 'text-xs font-medium text-[#EB0A1E]'
                : 'text-xs text-slate-400'
            }
          >
            {part}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}

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
    <header className="shrink-0 bg-white border-b border-slate-200/80 shadow-sm">
      <div className="h-0.5 w-full bg-gradient-to-r from-[#EB0A1E] via-[#ff6b7a] to-[#EB0A1E] opacity-90" />
      <div className="px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {onMenuClick && (
              <button
                type="button"
                onClick={onMenuClick}
                className="lg:hidden shrink-0 flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:border-red-200 hover:text-[#EB0A1E] transition-colors"
                aria-label="Open navigation menu"
              >
                <IconMenu size={20} />
              </button>
            )}

            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden lg:flex shrink-0 items-center justify-center w-10 h-10 rounded-xl text-slate-600 bg-slate-50 border border-slate-200 hover:bg-red-50 hover:text-[#EB0A1E] transition-colors"
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <IconMenu size={20} />
              </button>
            )}

            <div className="min-w-0 flex items-start gap-3">
              {titleIcon && (
                <span className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-red-50 to-red-100 text-[#EB0A1E] border border-red-100 shrink-0">
                  {titleIcon}
                </span>
              )}
              <div className="min-w-0">
                <h1 className="text-xl sm:text-[22px] font-bold text-slate-900 truncate tracking-tight">
                  {title}
                </h1>
                <BreadcrumbTrail breadcrumb={breadcrumb} />
              </div>
            </div>
          </div>

          {rightContent ? (
            <div className="shrink-0 min-w-0 max-w-full sm:max-w-[55%]">{rightContent}</div>
          ) : (
            <div className="hidden sm:flex items-center gap-3 shrink-0">
              {welcomeName && (
                <span className="text-sm text-slate-500">
                  Welcome,{' '}
                  <span className="font-semibold text-slate-800">{welcomeName.split(' ')[0]}</span>
                </span>
              )}
              {roleBadge && (
                <span className="text-xs font-semibold text-[#B91C1C] bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                  {roleBadge}
                </span>
              )}
            </div>
          )}
        </div>

        {!rightContent && welcomeName && (
          <div className="sm:hidden flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <span className="text-sm text-slate-600">{welcomeName}</span>
            {roleBadge && (
              <span className="text-xs font-semibold text-[#B91C1C] bg-red-50 px-2.5 py-1 rounded-full">
                {roleBadge}
              </span>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
