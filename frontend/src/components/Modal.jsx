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
      <div className="modal-overlay flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="modal-content fade-in w-full sm:max-w-md" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold text-charcoal pr-2">{title}</h2>
            <button
              onClick={onClose}
              className="btn-icon shrink-0"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="mb-6 max-h-[60vh] overflow-y-auto">{children}</div>

          {/* Footer */}
          {actions && (
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
              {actions.map((action, idx) => (
                <div key={idx} className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto">
                  {action}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
