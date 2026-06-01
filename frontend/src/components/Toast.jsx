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
    success: 'bg-green-50 border-green-300 text-green-800',
    error: 'bg-red-50 border-toyota-red text-red-800',
    warning: 'bg-amber-50 border-amber-300 text-amber-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`fixed top-6 right-6 px-4 py-3 rounded-md border-l-4 flex items-center gap-3 shadow-card fade-in z-50 max-w-sm ${
        typeStyles[type] || typeStyles.success
      }`}
    >
      <span className="text-lg font-bold">{typeIcons[type] || '✓'}</span>
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="text-lg hover:opacity-75 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
}
