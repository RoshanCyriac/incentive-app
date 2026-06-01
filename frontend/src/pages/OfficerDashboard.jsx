import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getOfficerCars,
  getSales,
  getIncentive,
  getOfficerSlabs,
} from '../api/client';
import { DashboardLayout, Alert } from '../components';
import { IconBarChart, IconLayoutGrid } from '../components/icons';
import {
  getUserDisplayName,
  getUserInitials,
  formatRoleLabel,
} from '../utils/userDisplay';
import SalesEntrySection from './officer/SalesEntrySection';
import './officer/SalesEntry.css';

const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

const YEARS = [2024, 2025, 2026];

const NAV_ITEMS = [
  { id: 'sales', label: 'Sales Entry', shortLabel: 'Sales', icon: IconLayoutGrid },
  { id: 'breakdown', label: 'Incentive Breakdown', shortLabel: 'Pay', icon: IconBarChart },
];

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('sales');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [cars, setCars] = useState([]);
  const [sales, setSales] = useState([]);
  const [slabs, setSlabs] = useState([]);
  const [incentive, setIncentive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName = getUserDisplayName(user);
  const roleLabel = formatRoleLabel(user?.role);

  useEffect(() => {
    fetchAllData();
  }, [month, year]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [carsRes, salesRes, slabsRes, incentiveRes] = await Promise.all([
        getOfficerCars(),
        getSales(month, year),
        getOfficerSlabs(),
        getIncentive(month, year),
      ]);

      setCars(carsRes.data);
      setSales(salesRes.data);
      setSlabs(slabsRes.data);
      setIncentive(incentiveRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentMonthLabel = MONTHS.find((m) => m.value === month)?.label;

  const periodControls = (
    <div className="sales-period-controls">
      <div className="sales-period-selects">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          className="sales-period-select flex-1"
          aria-label="Select month"
        >
          {MONTHS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="sales-period-select w-24 shrink-0"
          aria-label="Select year"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="sales-period-months">
        {MONTHS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMonth(m.value)}
            className={`sales-period-month-btn${
              month === m.value ? ' sales-period-month-btn--active' : ''
            }`}
          >
            {m.label}
          </button>
        ))}
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="sales-period-select w-20 shrink-0 ml-1"
          aria-label="Select year"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-[100dvh] bg-off-white items-center justify-center p-4">
        <div className="text-center">
          <div className="spinner rounded-full h-12 w-12 border-4 border-toyota-red border-t-transparent mx-auto" />
          <p className="mt-4 text-gray-600 font-label">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const headerTitle =
    activeTab === 'sales'
      ? `Sales Entry — ${currentMonthLabel} ${year}`
      : `Incentive Breakdown — ${currentMonthLabel} ${year}`;

  return (
    <DashboardLayout
      sidebarItems={NAV_ITEMS}
      activeItem={activeTab}
      onItemClick={setActiveTab}
      userName={displayName}
      userRole={roleLabel}
      userInitials={getUserInitials(displayName)}
      onLogout={logout}
      headerTitle={headerTitle}
      headerBreadcrumb={`Officer → ${activeTab === 'sales' ? 'Sales Entry' : 'Breakdown'}`}
      welcomeName={displayName}
      roleBadge={roleLabel}
      headerRightContent={periodControls}
    >
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      {activeTab === 'sales' && (
        <SalesEntrySection
          key={`${month}-${year}`}
          cars={cars}
          sales={sales}
          setSales={setSales}
          month={month}
          year={year}
          incentive={incentive}
          setIncentive={setIncentive}
          onError={setError}
        />
      )}

      {activeTab === 'breakdown' && (
        <div className="card min-w-0">
          <h2 className="text-lg font-header text-charcoal mb-4 sm:mb-6">Incentive Breakdown</h2>

          {slabs.length > 0 ? (
            <>
              <div className="overflow-x-auto -mx-1 sm:mx-0">
                <table className="w-full min-w-[480px]">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Slab</th>
                      <th className="table-header-cell">Cars Range</th>
                      <th className="table-header-cell">Rate</th>
                      <th className="table-header-cell text-right">Qualifying</th>
                      <th className="table-header-cell text-right">Sub-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slabs.map((slab, idx) => {
                      const matchedUnits = incentive?.units_by_slab?.[slab.id] || 0;
                      const subtotal = matchedUnits * slab.incentive_per_car;

                      return (
                        <tr
                          key={slab.id}
                          className={`${
                            idx % 2 === 0 ? 'bg-white' : 'bg-off-white'
                          } table-row`}
                        >
                          <td className="table-cell font-label text-charcoal">#{idx + 1}</td>
                          <td className="table-cell text-gray-600">
                            {slab.min_qty} – {slab.max_qty || '∞'}
                          </td>
                          <td className="table-cell font-label text-charcoal">
                            ₹{Math.round(slab.incentive_per_car)}
                          </td>
                          <td className="table-cell text-right text-charcoal">{matchedUnits}</td>
                          <td className="table-cell text-right font-header text-charcoal">
                            ₹{Math.round(subtotal).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 sm:mt-6 bg-toyota-red text-white rounded-md p-4 sm:p-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                  <p className="text-lg font-header">Grand Total</p>
                  <p className="text-2xl sm:text-3xl font-header break-words">
                    ₹{Math.round(incentive?.total_payout || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">No slabs configured yet</div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
