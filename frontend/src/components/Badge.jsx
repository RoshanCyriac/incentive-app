import React from 'react';

/**
 * Badge/Pill component for status indicators
 */
export default function Badge({ status = 'active', label }) {
  const statusStyles = {
    active: 'badge-active',
    inactive: 'badge-inactive',
    pending: 'badge-pending',
  };

  return (
    <span className={statusStyles[status] || statusStyles.inactive}>
      {label || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
