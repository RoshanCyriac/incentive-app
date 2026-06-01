import React from 'react';

/**
 * Empty state component
 */
export default function EmptyState({ icon, title, message, action }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: '4rem', paddingBottom: '4rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3.75rem', marginBottom: '1rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1A1A1A', marginBottom: '0.5rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: '#6B7280', marginBottom: '1.5rem', maxWidth: '28rem' }}>
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
