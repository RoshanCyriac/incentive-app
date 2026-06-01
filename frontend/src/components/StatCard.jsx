import React from 'react';

/**
 * Stat card component for dashboard metrics
 */
export default function StatCard({ icon, label, value, trend, trendLabel }) {
  return (
    <div className="card bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{icon}</div>
        {trend && (
          <div
            className={`text-xs font-label px-2 py-1 rounded-md ${
              trend === 'up'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {trendLabel || (trend === 'up' ? '↑ Up' : '↓ Down')}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 font-label mb-2">{label}</p>
      <p className="text-2xl font-header text-charcoal">{value}</p>
      {/* Red accent bottom border */}
      <div className="mt-3 h-1 w-12 bg-toyota-red rounded-full"></div>
    </div>
  );
}
