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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-header text-charcoal">{title}</h2>
            <button
              onClick={onClose}
              className="btn-icon"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="mb-6">{children}</div>

          {/* Footer */}
          {actions && (
            <div className="flex gap-3 justify-end">
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
