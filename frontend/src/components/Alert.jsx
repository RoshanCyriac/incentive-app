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
    <div className={`${alertStyles[type]} flex items-start gap-3`}>
      <span className="text-lg font-bold flex-shrink-0 mt-0.5">{icons[type]}</span>
      <div className="flex-1">
        {title && <p className="font-header text-charcoal mb-1">{title}</p>}
        {message && <p className="text-sm text-charcoal">{message}</p>}
        {children}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 text-charcoal hover:opacity-75 transition-opacity"
        >
          ✕
        </button>
      )}
    </div>
  );
}
