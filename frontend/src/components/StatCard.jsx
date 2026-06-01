import React from 'react';

/**
 * Stat card component for dashboard metrics
 */
export default function StatCard({ icon, label, value, trend, trendLabel }) {
  return (
    <div className="card bg-white">
      <div className="flex items-start justify-between mb-3">
        <div style={{ fontSize: '2rem' }}>{icon}</div>
        {trend && (
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              backgroundColor: trend === 'up' ? '#D1FAE5' : '#FEE2E2',
              color: trend === 'up' ? '#065F46' : '#991B1B',
            }}
          >
            {trendLabel || (trend === 'up' ? '↑ Up' : '↓ Down')}
          </div>
        )}
      </div>
      <p style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: '500' }} className="mb-2">
        {label}
      </p>
      <p style={{ fontSize: '1.875rem', fontWeight: '600', color: '#1A1A1A' }}>
        {value}
      </p>
      {/* Red accent bottom border */}
      <div style={{ marginTop: '0.75rem', height: '0.25rem', width: '3rem', backgroundColor: '#EB0A1E', borderRadius: '9999px' }}></div>
    </div>
  );
}
