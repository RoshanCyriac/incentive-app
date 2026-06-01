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
    success: { bg: '#ecfdf5', border: '#10b981', text: '#047857' },
    error: { bg: '#fef2f2', border: '#EB0A1E', text: '#991b1b' },
    warning: { bg: '#fffbeb', border: '#f59e0b', text: '#b45309' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1d4ed8' },
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
      role="status"
      aria-live="polite"
      className="fixed z-[9999] left-4 right-4 sm:left-auto sm:right-6 bottom-6 sm:top-6 sm:bottom-auto max-w-md mx-auto sm:mx-0"
      style={{
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        borderLeft: `4px solid ${style.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
        backgroundColor: style.bg,
        color: style.text,
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
