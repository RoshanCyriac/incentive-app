import React, { useState, useEffect } from 'react';
import {
  getSlabs,
  createSlab,
  updateSlab,
  deleteSlab,
} from '../../api/client';

export default function SlabEngineTab() {
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    fetchSlabs();
  }, []);

  const fetchSlabs = async () => {
    try {
      setLoading(true);
      const response = await getSlabs();
      setSlabs(response.data.sort((a, b) => a.min_qty - b.min_qty));
      validateSlabs(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch slabs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateSlabs = (slabList) => {
    const issues = [];
    const sorted = slabList.sort((a, b) => a.min_qty - b.min_qty);

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (current.max_qty === null) {
        issues.push('Unlimited slab (max_qty=null) should only be the last tier');
      } else if (current.max_qty + 1 !== next.min_qty) {
        issues.push(
          `Gap detected: Slab ending at ${current.max_qty} and next starting at ${next.min_qty}`
        );
      }
    }

    setWarnings(issues);
  };

  const handleEdit = (slab) => {
    setEditingId(slab.id);
    setEditFormData({
      min_qty: slab.min_qty,
      max_qty: slab.max_qty,
      incentive_per_car: slab.incentive_per_car,
    });
  };

  const handleSave = async (slabId) => {
    try {
      await updateSlab(slabId, editFormData);
      await fetchSlabs();
      setEditingId(null);
    } catch (err) {
      setError('Failed to update slab');
      console.error(err);
    }
  };

  const handleDelete = async (slabId) => {
    try {
      await deleteSlab(slabId);
      await fetchSlabs();
    } catch (err) {
      setError('Failed to delete slab');
      console.error(err);
    }
  };

  const handleAddSlab = async () => {
    try {
      const newSlab = {
        min_qty: 1,
        max_qty: 10,
        incentive_per_car: 1000,
      };
      await createSlab(newSlab);
      await fetchSlabs();
    } catch (err) {
      setError('Failed to create slab');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-semibold text-yellow-900 mb-2">⚠️ Slab Configuration Issues:</p>
          <ul className="space-y-1">
            {warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-yellow-800">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Incentive Slabs</h2>
        <button
          onClick={handleAddSlab}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Slab
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Min Qty
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Max Qty
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                ₹ Per Car
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {slabs.map((slab) => (
              <tr key={slab.id} className="hover:bg-gray-50 transition">
                {editingId === slab.id ? (
                  <>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editFormData.min_qty}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            min_qty: parseInt(e.target.value),
                          })
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={editFormData.max_qty || ''}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            max_qty: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                        placeholder="Unlimited"
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.incentive_per_car}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            incentive_per_car: parseFloat(e.target.value),
                          })
                        }
                        className="w-24 px-2 py-1 border border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleSave(slab.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {slab.min_qty}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {slab.max_qty === null ? '∞ (Unlimited)' : slab.max_qty}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      ₹{parseFloat(slab.incentive_per_car).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(slab)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slab.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {slabs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No slabs configured. Create one to get started.
          </div>
        )}
      </div>

      {/* Preview Card */}
      {slabs.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-4">Slab Preview</h3>
          <div className="space-y-3">
            {slabs.map((slab) => (
              <div
                key={slab.id}
                className="flex items-center justify-between p-3 bg-white rounded border border-blue-100"
              >
                <span className="text-sm text-gray-700">
                  {slab.min_qty} -{' '}
                  {slab.max_qty === null ? '∞' : slab.max_qty} cars
                </span>
                <span className="font-semibold text-blue-600">
                  ₹{parseFloat(slab.incentive_per_car).toLocaleString('en-IN')} each
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
