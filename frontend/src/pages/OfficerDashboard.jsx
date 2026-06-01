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
  const debounceTimers = useRef({});

  // Months for dropdown
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.name}!
              </h1>
              <p className="text-sm text-gray-600 mt-1">Sales Officer Dashboard</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Logout
            </button>
          </div>

          {/* Month/Year Selector */}
          <div className="flex gap-4 items-center">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>

            <span className="text-sm text-gray-600 ml-auto">
              {months.find((m) => m.value === month)?.label} {year}
            </span>
          </div>
        </div>
      </header>

      {error && (
        <div className="max-w-full mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-full px-6 py-4">
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'sales'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sales Entry
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 font-medium transition ${
              activeTab === 'history'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-full px-6 py-6">
        {activeTab === 'sales' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sales Entry Grid */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Sales Entry</h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Car Model
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Variant
                        </th>
                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                          Units Sold
                        </th>
                        <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {cars.map((car) => {
                        const units = getSalesForCar(car.id);
                        const isSaving = savingIds.has(car.id);
                        const isSaved = savedIds.has(car.id);

                        return (
                          <tr key={car.id} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {car.name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {car.variant || '-'}
                            </td>
                            <td className="px-6 py-4">
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
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                              />
                            </td>
                            <td className="px-6 py-4 text-right">
                              {isSaving ? (
                                <div className="flex items-center justify-end gap-2">
                                  <svg
                                    className="animate-spin h-4 w-4 text-blue-600"
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
                                  <span className="text-xs text-gray-600">Saving...</span>
                                </div>
                              ) : isSaved ? (
                                <div className="flex items-center justify-end gap-1">
                                  <svg
                                    className="h-4 w-4 text-green-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <span className="text-xs text-green-600">Saved</span>
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {cars.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No car models available
                  </div>
                )}
              </div>
            </div>

            {/* Incentive Tracker */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-lg shadow p-6 space-y-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Units Sold</p>
                  <p className="text-4xl font-bold text-gray-900">
                    {incentive?.total_units_sold || 0}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Active Tier</p>
                  {incentive?.matched_slab ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-green-900">
                        Tier {incentive.matched_slab.min_qty}-
                        {incentive.matched_slab.max_qty || '∞'}
                      </p>
                      <p className="text-lg font-bold text-green-600">
                        ₹{parseFloat(incentive.matched_slab.incentive_per_car).toLocaleString(
                          'en-IN'
                        )}/car
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-sm text-gray-600">No tier matched yet</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Payout</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ₹{parseFloat(incentive?.total_payout || 0).toLocaleString('en-IN')}
                  </p>
                </div>

                {incentive?.next_slab && (
                  <div>
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-700">
                          Progress to Next Tier
                        </p>
                        <p className="text-xs text-gray-600">
                          {incentive.units_to_next_slab} more cars
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <span className="font-semibold">
                          Tier {incentive.next_slab.min_qty}:
                        </span>{' '}
                        ₹
                        {parseFloat(incentive.next_slab.incentive_per_car).toLocaleString(
                          'en-IN'
                        )}
                        /car
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* History Tab */
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Sales History</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                      Month
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900">
                      Total Cars Sold
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                      Total Payout
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.slice(0, 6).map((record) => (
                    <tr key={`${record.year}-${record.month}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {months.find((m) => m.value === record.month)?.label} {record.year}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">
                        {record.total_units}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                        ₹{parseFloat(record.total_payout).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {history.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No sales history available
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
