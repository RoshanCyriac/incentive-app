import React from 'react';

/**
 * Header bar component
 */
export default function Header({ title, rightContent }) {
  return (
    <div className="header-bar bg-white">
      <h1 className="text-2xl font-header text-charcoal">{title}</h1>
      <div className="flex items-center gap-4">{rightContent}</div>
    </div>
  );
}
