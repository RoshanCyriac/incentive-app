import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getOfficerCars,
  getSales,
  upsertSale,
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
  const [savingIds, setSavingIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const debounceTimers = useRef({});

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

  const handleUnitsChange = useCallback(
    (carModelId, newUnits) => {
      setSales((prev) =>
        prev.map((sale) =>
          sale.car_model_id === carModelId ? { ...sale, units_sold: newUnits } : sale
        )
      );

      if (debounceTimers.current[carModelId]) {
        clearTimeout(debounceTimers.current[carModelId]);
      }

      setSavingIds((prev) => new Set([...prev, carModelId]));

      debounceTimers.current[carModelId] = setTimeout(async () => {
        try {
          await upsertSale({
            car_model_id: carModelId,
            month,
            year,
            units_sold: newUnits,
          });

          setSavedIds((prev) => new Set([...prev, carModelId]));
          setTimeout(() => {
            setSavedIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(carModelId);
              return newSet;
            });
          }, 1500);

          const incentiveRes = await getIncentive(month, year);
          setIncentive(incentiveRes.data);
        } catch (err) {
          setError('Failed to save sales entry');
          console.error(err);
        } finally {
          setSavingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(carModelId);
            return newSet;
          });
        }
      }, 500);
    },
    [month, year]
  );

  const getSalesForCar = (carModelId) => {
    return sales.find((sale) => sale.car_model_id === carModelId)?.units_sold || 0;
  };

  const currentMonthLabel = MONTHS.find((m) => m.value === month)?.label;

  const periodControls = (
    <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:justify-end sm:gap-3">
      <div className="flex gap-2 w-full lg:hidden">
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value, 10))}
          className="input-field flex-1 text-sm py-2"
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
          className="input-field w-24 text-sm py-2 shrink-0"
          aria-label="Select year"
        >
          {YEARS.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden lg:flex items-center gap-2 overflow-x-auto max-w-full pb-1">
        <div className="flex gap-1 bg-off-white p-1 rounded-md shrink-0">
          {MONTHS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMonth(m.value)}
              className={`px-2 py-1 rounded-md text-xs font-label transition-all duration-150 whitespace-nowrap ${
                month === m.value
                  ? 'bg-toyota-red text-white'
                  : 'text-charcoal hover:bg-white'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          className="input-field text-sm py-1.5 w-20 shrink-0"
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
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          <div className="xl:col-span-2 min-w-0">
            <div className="card">
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg font-header text-charcoal">Car Models</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Enter units sold to calculate incentives in real-time
                </p>
              </div>

              {cars.length > 0 ? (
                <div className="table-container overflow-x-auto -mx-1 sm:mx-0">
                  <table className="w-full min-w-[320px]">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Model Name</th>
                        <th className="table-header-cell text-center w-28">Units</th>
                        <th className="table-header-cell text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cars.map((car, idx) => {
                        const units = getSalesForCar(car.id);
                        const isSaving = savingIds.has(car.id);
                        const isSaved = savedIds.has(car.id);

                        return (
                          <tr
                            key={car.id}
                            className={`${
                              idx % 2 === 0 ? 'bg-white' : 'bg-off-white'
                            } table-row`}
                          >
                            <td className="table-cell font-label text-charcoal max-w-[140px] sm:max-w-none truncate">
                              {car.name}
                            </td>
                            <td className="table-cell text-center">
                              <input
                                type="number"
                                min="0"
                                inputMode="numeric"
                                value={units}
                                onChange={(e) =>
                                  handleUnitsChange(
                                    car.id,
                                    Math.max(0, parseInt(e.target.value, 10) || 0)
                                  )
                                }
                                disabled={isSaving}
                                className="input-field w-16 sm:w-20 text-center mx-auto"
                              />
                            </td>
                            <td className="table-cell text-center">
                              {isSaving ? (
                                <div className="flex items-center justify-center gap-1 pulse-subtle">
                                  <svg
                                    className="animate-spin h-4 w-4 text-toyota-red"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  <span className="text-xs text-gray-600 hidden sm:inline">
                                    Saving
                                  </span>
                                </div>
                              ) : isSaved ? (
                                <svg
                                  className="h-5 w-5 text-status-success mx-auto"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No car models available</div>
              )}
            </div>
          </div>

          <div className="xl:col-span-1 min-w-0">
            <div className="card bg-white xl:sticky xl:top-4">
              <h2 className="text-lg font-header text-charcoal mb-4 sm:mb-6">
                Incentive Tracker
              </h2>

              <div className="bg-toyota-red text-white rounded-md p-4 sm:p-6 mb-4 sm:mb-6 text-center">
                <p className="text-sm font-label text-white/90 mb-2">Total Incentive Earned</p>
                <p className="text-2xl sm:text-4xl font-header break-words">
                  ₹{Math.round(incentive?.total_payout || 0).toLocaleString('en-IN')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className="bg-off-white p-3 sm:p-4 rounded-md text-center">
                  <p className="text-xl sm:text-2xl font-header text-charcoal">
                    {incentive?.total_units_sold || 0}
                  </p>
                  <p className="text-xs font-label text-gray-600 mt-1">Units Sold</p>
                </div>
                <div className="bg-off-white p-3 sm:p-4 rounded-md text-center">
                  <p className="text-xl sm:text-2xl font-header text-charcoal">
                    ₹
                    {incentive?.matched_slab
                      ? Math.round(incentive.matched_slab.incentive_per_car)
                      : 0}
                  </p>
                  <p className="text-xs font-label text-gray-600 mt-1">Rate/Car</p>
                </div>
              </div>

              {incentive?.matched_slab ? (
                <div className="border-2 border-toyota-red rounded-md p-4 mb-4 sm:mb-6">
                  <p className="text-xs font-label text-gray-600 mb-1">Current Slab</p>
                  <p className="text-sm font-header text-charcoal">
                    {incentive.matched_slab.min_qty} –{' '}
                    {incentive.matched_slab.max_qty || '∞'} cars
                  </p>
                </div>
              ) : (
                <div className="border-2 border-silver-gray rounded-md p-4 mb-4 sm:mb-6">
                  <p className="text-xs font-label text-gray-600">No slab matched yet</p>
                </div>
              )}

              {incentive?.next_slab && (
                <div className="p-4 bg-off-white rounded-md">
                  <div className="flex justify-between items-center gap-2 mb-2 flex-wrap">
                    <p className="text-xs font-label text-gray-600">
                      Next: ₹{Math.round(incentive.next_slab.incentive_per_car)}/car
                    </p>
                    <p className="text-xs font-label text-gray-600">
                      {incentive.units_to_next_slab} more
                    </p>
                  </div>
                  <div className="w-full bg-silver-gray rounded-full h-2">
                    <div
                      className="bg-toyota-red h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (incentive.total_units_sold / incentive.next_slab.min_qty) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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
