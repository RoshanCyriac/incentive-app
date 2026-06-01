import React from 'react';

/**
 * Modal dialog component
 */
export default function Modal({ isOpen, title, children, onClose, actions }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="modal-overlay"
        onClick={onClose}
        role="presentation"
      ></div>

      {/* Modal Content */}
      <div className="modal-overlay flex items-center justify-center">
        <div className="modal-content fade-in" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1A1A1A' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="btn-icon"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div style={{ marginBottom: '1.5rem' }}>{children}</div>

          {/* Footer */}
          {actions && (
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              {actions.map((action, idx) => (
                <div key={idx}>{action}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
