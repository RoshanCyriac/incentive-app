import React from 'react';

/**
 * Header bar component
 */
export default function Header({ title, rightContent }) {
  return (
    <div className="header-bar">
      <h1 style={{ fontSize: '1.875rem', fontWeight: '600' }} className="text-charcoal">
        {title}
      </h1>
      <div className="flex items-center gap-4">{rightContent}</div>
    </div>
  );
}
