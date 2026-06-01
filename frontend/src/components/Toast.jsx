import React, { useState, useEffect } from 'react';

/**
 * Toast notification component
 */
export default function Toast({ message, type = 'success', autoClose = 4000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: { bg: '#DCFCE7', border: '#10B981', text: '#065F46' },
    error: { bg: '#FEE2E2', border: '#EB0A1E', text: '#991B1B' },
    warning: { bg: '#FEF3C7', border: '#F59E0B', text: '#92400E' },
    info: { bg: '#DBEAFE', border: '#3B82F6', text: '#1E40AF' },
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const style = typeStyles[type] || typeStyles.success;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.375rem',
        borderLeft: `4px solid ${style.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        zIndex: 9999,
        backgroundColor: style.bg,
        color: style.text,
        maxWidth: '28rem',
        animation: 'fadeIn 150ms ease-in forwards',
      }}
    >
      <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
        {typeIcons[type] || '✓'}
      </span>
      <span style={{ fontSize: '0.875rem', fontWeight: '500', flex: 1 }}>
        {message}
      </span>
      <button
        onClick={() => setIsVisible(false)}
        style={{
          fontSize: '1rem',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          opacity: 0.75,
          transition: 'opacity 150ms',
        }}
        onMouseEnter={(e) => (e.target.style.opacity = '1')}
        onMouseLeave={(e) => (e.target.style.opacity = '0.75')}
      >
        ✕
      </button>
    </div>
  );
}
