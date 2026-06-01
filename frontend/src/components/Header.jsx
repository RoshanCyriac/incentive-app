import React from 'react';

/**
 * Top header bar for admin pages
 */
export default function Header({
  title,
  titleIcon,
  breadcrumb,
  welcomeName,
  roleBadge,
  rightContent,
}) {
  return (
    <header
      className="flex items-center justify-between shrink-0 bg-white"
      style={{
        height: breadcrumb || titleIcon ? '56px' : undefined,
        minHeight: '56px',
        borderBottom: '0.5px solid #E5E5E5',
        padding: '0 24px',
      }}
    >
      <div>
        <div className="flex items-center gap-2">
          {titleIcon && (
            <span className="flex items-center" style={{ color: '#EB0A1E' }}>
              {titleIcon}
            </span>
          )}
          <h1 style={{ fontSize: '16px', fontWeight: 500, color: '#1A1A1A' }}>{title}</h1>
        </div>
        {breadcrumb && (
          <p style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>{breadcrumb}</p>
        )}
      </div>

      {rightContent ? (
        <div className="flex items-center gap-4">{rightContent}</div>
      ) : (
        <div className="flex items-center gap-3">
          {welcomeName != null && welcomeName !== '' && (
            <span style={{ fontSize: '13px', color: '#666' }}>
              Welcome back, {welcomeName}
            </span>
          )}
          {roleBadge && (
            <span
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
