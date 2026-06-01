import React from 'react';

/**
 * Alert/Banner component
 */
export default function Alert({ type = 'info', title, message, children, onClose }) {
  const alertStyles = {
    error: 'alert-error',
    warning: 'alert-warning',
    success: 'alert-success',
    info: 'alert-info',
  };

  const icons = {
    error: '✕',
    warning: '⚠',
    success: '✓',
    info: 'ℹ',
  };

  return (
    <div className={alertStyles[type]} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
      <span style={{ fontSize: '1rem', fontWeight: 'bold', flexShrink: 0, marginTop: '0.125rem' }}>
        {icons[type]}
      </span>
      <div style={{ flex: 1 }}>
        {title && (
          <p style={{ fontWeight: '600', color: '#1A1A1A', marginBottom: '0.25rem' }}>
            {title}
          </p>
        )}
        {message && <p style={{ fontSize: '0.875rem', color: '#1A1A1A' }}>{message}</p>}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            flexShrink: 0,
            color: '#1A1A1A',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
          onMouseEnter={(e) => (e.target.style.opacity = '0.5')}
          onMouseLeave={(e) => (e.target.style.opacity = '1')}
        >
          ✕
        </button>
      )}
    </div>
  );
}
