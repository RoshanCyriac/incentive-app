import React from 'react';

/**
 * Loading skeleton component with shimmer animation
 */
export default function SkeletonLoader({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="flex gap-3">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={colIdx}
              className="shimmer h-12 flex-1 rounded-md"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
}
