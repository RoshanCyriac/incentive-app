import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getOfficerCars,
  getSales,
  upsertSale,
  getIncentive,
  getOfficerSlabs,
  getHistory,
} from '../api/client';
import { Sidebar, Header, Button, Alert, SkeletonLoader } from '../components';

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('sales');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [cars, setCars] = useState([]);
  const [sales, setSales] = useState([]);
  const [slabs, setSlabs] = useState([]);
  const [incentive, setIncentive] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());
  const [savedIds, setSavedIds] = useState(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const debounceTimers = useRef({});

  // Months for dropdown
  const months = [
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

  // Fetch all data on mount and when month/year changes
  useEffect(() => {
    fetchAllData();
  }, [month, year]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [carsRes, salesRes, slabsRes, incentiveRes, historyRes] = await Promise.all([
        getOfficerCars(),
        getSales(month, year),
        getOfficerSlabs(),
        getIncentive(month, year),
        getHistory(),
      ]);

      setCars(carsRes.data);
      setSales(salesRes.data);
      setSlabs(slabsRes.data);
      setIncentive(incentiveRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnitsChange = useCallback((carModelId, newUnits) => {
    // Update local state immediately
    setSales((prev) =>
      prev.map((sale) =>
        sale.car_model_id === carModelId ? { ...sale, units_sold: newUnits } : sale
      )
    );

    // Clear existing timer
    if (debounceTimers.current[carModelId]) {
      clearTimeout(debounceTimers.current[carModelId]);
    }

    // Set saving indicator
    setSavingIds((prev) => new Set([...prev, carModelId]));

    // Debounce the API call
    debounceTimers.current[carModelId] = setTimeout(async () => {
      try {
        await upsertSale({
          car_model_id: carModelId,
          month,
          year,
          units_sold: newUnits,
        });

        // Show saved indicator
        setSavedIds((prev) => new Set([...prev, carModelId]));
        setTimeout(() => {
          setSavedIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(carModelId);
            return newSet;
          });
        }, 1500);

        // Refresh incentive calculation
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
  }, [month, year]);

  const getCarModel = (carModelId) => {
    return cars.find((car) => car.id === carModelId);
  };

  const getSalesForCar = (carModelId) => {
    return sales.find((sale) => sale.car_model_id === carModelId)?.units_sold || 0;
  };

  const getNextSlab = () => {
    if (!incentive?.next_slab) return null;
    return incentive.next_slab;
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-off-white items-center justify-center">
        <div className="text-center">
          <div className="spinner rounded-full h-12 w-12 border-4 border-toyota-red border-transparent"></div>
          <p className="mt-4 text-gray-600 font-label">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const currentMonthLabel = months.find((m) => m.value === month)?.label;
  const userSection = (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-toyota-red rounded-full flex items-center justify-center text-white font-header">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-label text-white truncate">{user?.name}</p>
          <p className="text-xs text-gray-300">Sales Officer</p>
        </div>
      </div>
      <Button
        onClick={logout}
        variant="secondary"
        size="sm"
        className="w-full text-xs"
      >
        Logout
      </Button>
    </div>
  );

  const navItems = [
    { id: 'sales', label: 'Sales Entry', icon: '📝' },
    { id: 'breakdown', label: 'Incentive Breakdown', icon: '📊' },
  ];

  return (
    <div className="flex h-screen bg-off-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        items={navItems}
        activeItem={activeTab}
        onItemClick={setActiveTab}
        userSection={userSection}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header
          title={`Sales Entry — ${currentMonthLabel} ${year}`}
          rightContent={
            <div className="flex items-center gap-4">
              <div className="flex gap-2 bg-off-white p-1 rounded-md">
                {months.map((m) => (
                  <button
                    key={m.value}
                    onClick={() => setMonth(m.value)}
                    className={`px-2 py-1 rounded-md text-xs font-label transition-all duration-150 ${
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
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="input-field text-sm"
              >
                {[2024, 2025, 2026].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          }
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            {error && (
              <div className="mb-6">
                <Alert type="error" message={error} onClose={() => setError(null)} />
              </div>
            )}

            {activeTab === 'sales' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Entry Table */}
                <div className="lg:col-span-2">
                  <div className="card">
                    <div className="mb-6">
                      <h2 className="text-lg font-header text-charcoal">Car Models</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Enter units sold to calculate incentives in real-time
                      </p>
                    </div>

                    {cars.length > 0 ? (
                      <div className="table-container overflow-x-auto">
                        <table className="w-full">
                          <thead className="table-header">
                            <tr>
                              <th className="table-header-cell">Model Name</th>
                              <th className="table-header-cell text-center">Units Sold</th>
                              <th className="table-header-cell text-center">Status</th>
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
                                  <td className="table-cell font-label text-charcoal">
                                    {car.name}
                                  </td>
                                  <td className="table-cell text-center">
                                    <input
                                      type="number"
                                      min="0"
                                      value={units}
                                      onChange={(e) =>
                                        handleUnitsChange(
                                          car.id,
                                          Math.max(0, parseInt(e.target.value) || 0)
                                        )
                                      }
                                      disabled={isSaving}
                                      className="input-field w-20 text-center"
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
                                          ></circle>
                                          <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          ></path>
                                        </svg>
                                        <span className="text-xs text-gray-600">Saving</span>
                                      </div>
                                    ) : isSaved ? (
                                      <div className="flex items-center justify-center gap-1">
                                        <svg
                                          className="h-5 w-5 text-status-success"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </div>
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
                      <div className="text-center py-8 text-gray-500">
                        No car models available
                      </div>
                    )}
                  </div>
                </div>

                {/* Incentive Tracker Card */}
                <div className="lg:col-span-1">
                  <div className="card bg-white sticky top-8">
                    <h2 className="text-lg font-header text-charcoal mb-6">
                      📈 Incentive Tracker
                    </h2>

                    {/* Hero Total */}
                    <div className="bg-toyota-red text-white rounded-md p-6 mb-6 text-center">
                      <p className="text-sm font-label text-white text-opacity-90 mb-2">
                        Total Incentive Earned
                      </p>
                      <p className="text-4xl font-header">
                        ₹{Math.round(incentive?.total_payout || 0).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-off-white p-4 rounded-md text-center">
                        <p className="text-2xl font-header text-charcoal">
                          {incentive?.total_units_sold || 0}
                        </p>
                        <p className="text-xs font-label text-gray-600 mt-1">
                          Units Sold
                        </p>
                      </div>
                      <div className="bg-off-white p-4 rounded-md text-center">
                        <p className="text-2xl font-header text-charcoal">
                          ₹{incentive?.matched_slab
                            ? Math.round(incentive.matched_slab.incentive_per_car)
                            : 0}
                        </p>
                        <p className="text-xs font-label text-gray-600 mt-1">
                          Rate/Car
                        </p>
                      </div>
                    </div>

                    {/* Current Slab */}
                    {incentive?.matched_slab ? (
                      <div className="border-2 border-toyota-red rounded-md p-4 mb-6">
                        <p className="text-xs font-label text-gray-600 mb-1">
                          🎯 Current Slab
                        </p>
                        <p className="text-sm font-header text-charcoal">
                          {incentive.matched_slab.min_qty} –{' '}
                          {incentive.matched_slab.max_qty || '∞'} cars
                        </p>
                      </div>
                    ) : (
                      <div className="border-2 border-silver-gray rounded-md p-4 mb-6">
                        <p className="text-xs font-label text-gray-600">
                          No slab matched yet
                        </p>
                      </div>
                    )}

                    {/* Next Slab Progress */}
                    {incentive?.next_slab && (
                      <div className="p-4 bg-off-white rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-xs font-label text-gray-600">
                            Next: ₹
                            {Math.round(incentive.next_slab.incentive_per_car)}
                            /car
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
                                (incentive.total_units_sold /
                                  incentive.next_slab.min_qty) *
                                  100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'breakdown' && (
              <div className="card">
                <h2 className="text-lg font-header text-charcoal mb-6">
                  Incentive Breakdown
                </h2>

                {slabs.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="table-header">
                        <tr>
                          <th className="table-header-cell">Slab</th>
                          <th className="table-header-cell">Cars Range</th>
                          <th className="table-header-cell">Rate</th>
                          <th className="table-header-cell text-right">
                            Cars Qualifying
                          </th>
                          <th className="table-header-cell text-right">
                            Sub-total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {slabs.map((slab, idx) => {
                          const matchedUnits =
                            incentive?.units_by_slab?.[slab.id] || 0;
                          const subtotal = matchedUnits * slab.incentive_per_car;

                          return (
                            <tr
                              key={slab.id}
                              className={`${
                                idx % 2 === 0 ? 'bg-white' : 'bg-off-white'
                              } table-row`}
                            >
                              <td className="table-cell font-label text-charcoal">
                                #{idx + 1}
                              </td>
                              <td className="table-cell text-gray-600">
                                {slab.min_qty} –{' '}
                                {slab.max_qty || '∞'}
                              </td>
                              <td className="table-cell font-label text-charcoal">
                                ₹{Math.round(slab.incentive_per_car)}
                              </td>
                              <td className="table-cell text-right text-charcoal">
                                {matchedUnits}
                              </td>
                              <td className="table-cell text-right font-header text-charcoal">
                                ₹{Math.round(subtotal).toLocaleString(
                                  'en-IN'
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* Grand Total */}
                    <div className="mt-6 bg-toyota-red text-white rounded-md p-6">
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-header">Grand Total</p>
                        <p className="text-3xl font-header">
                          ₹
                          {Math.round(
                            incentive?.total_payout || 0
                          ).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No slabs configured yet
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
