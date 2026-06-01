import React from 'react';

/**
 * Loading skeleton component with shimmer animation
 */
export default function SkeletonLoader({ rows = 5, columns = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: '0.75rem' }}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="shimmer"
              style={{ height: '3rem', flex: 1, borderRadius: '0.375rem' }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
