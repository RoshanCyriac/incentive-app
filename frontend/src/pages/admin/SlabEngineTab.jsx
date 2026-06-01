import React, { useState, useEffect } from 'react';
import {
  getSlabs,
  createSlab,
  updateSlab,
  deleteSlab,
} from '../../api/client';
import { Button, Input, Alert, SkeletonLoader, EmptyState } from '../../components';

export default function SlabEngineTab() {
  const [slabs, setSlabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [warnings, setWarnings] = useState([]);
  const [showConfirmSave, setShowConfirmSave] = useState(false);

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
      setShowConfirmSave(false);
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
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-header text-charcoal">Incentive Slabs</h2>
          <div className="w-32 h-10 bg-off-white rounded-md shimmer"></div>
        </div>
        <div className="card">
          <SkeletonLoader rows={4} columns={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      {warnings.length > 0 && (
        <Alert type="warning" title="Configuration Issues">
          <ul className="space-y-1 mt-2">
            {warnings.map((warning, idx) => (
              <li key={idx} className="text-sm text-charcoal">
                • {warning}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-header text-charcoal">Incentive Slabs</h2>
        <Button variant="primary" onClick={handleAddSlab}>
          ➕ Add Slab
        </Button>
      </div>

      {/* Visual Slab Builder */}
      {slabs.length > 0 ? (
        <div className="space-y-4">
          {/* Tier Cards */}
          {slabs.map((slab, index) => (
            <div key={slab.id} className="relative">
              {/* Connector Line */}
              {index < slabs.length - 1 && (
                <div className="absolute left-12 top-full w-1 h-6 bg-toyota-red -z-10"></div>
              )}

              <div className="card bg-white hover:shadow-lg transition-shadow">
                {editingId === slab.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-toyota-red rounded-full flex items-center justify-center text-white font-header text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-label text-charcoal">
                          Slab {index + 1}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowConfirmSave(true)}
                        >
                          ✓ Save
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          ✕ Cancel
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4">
                      <Input
                        label="Min Units"
                        type="number"
                        value={editFormData.min_qty}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            min_qty: parseInt(e.target.value),
                          })
                        }
                      />
                      <Input
                        label="Max Units"
                        type="number"
                        value={editFormData.max_qty || ''}
                        placeholder="Unlimited"
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            max_qty: e.target.value ? parseInt(e.target.value) : null,
                          })
                        }
                      />
                      <Input
                        label="₹ Per Unit"
                        type="number"
                        step="0.01"
                        value={editFormData.incentive_per_car}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            incentive_per_car: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-off-white rounded-full flex items-center justify-center">
                        <span className="text-lg font-header text-toyota-red">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-header text-charcoal">
                            Slab {index + 1}
                          </span>
                          <span className="badge-active text-xs">Active</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {slab.min_qty} – {slab.max_qty === null ? '∞' : slab.max_qty} cars
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-2xl font-header text-toyota-red">
                          ₹{Math.round(slab.incentive_per_car).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500 font-label">per car</p>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(slab)}
                      >
                        ✎ Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(slab.id)}
                        className="text-status-error"
                      >
                        🗑 Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Confirmation Modal */}
          {showConfirmSave && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-md p-6 max-w-sm mx-4 shadow-card">
                <h3 className="text-lg font-header text-charcoal mb-3">
                  ⚠️ Confirm Changes
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Updating slab configuration will affect all active calculations and
                  incentive payouts. This action is immediate and cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowConfirmSave(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSave(editingId)}
                  >
                    Confirm Update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon="📊"
          title="No Slabs Configured"
          message="Create incentive slabs to define how sales officers are rewarded based on performance."
          action={
            <Button variant="primary" onClick={handleAddSlab}>
              ➕ Create First Slab
            </Button>
          }
        />
      )}
    </div>
  );
}
