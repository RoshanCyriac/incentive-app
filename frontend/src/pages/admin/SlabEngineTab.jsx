import React, { useState, useEffect } from 'react';
import {
  getSlabs,
  createSlab,
  updateSlab,
  deleteSlab,
} from '../../api/client';
import { Button, Input, Alert, SkeletonLoader, EmptyState } from '../../components';
import { IconPlus, IconPencil, IconTrash } from '../../components/icons';
import './SlabEngine.css';

function formatIncentive(amount) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

function SlabActionButton({ variant, onClick, children, ariaLabel }) {
  const className =
    variant === 'delete'
      ? 'slab-action-btn slab-action-btn--delete'
      : 'slab-action-btn slab-action-btn--edit';
  return (
    <button type="button" className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}

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
      <div className="slab-engine">
        <div className="slab-page-header">
          <h2 className="slab-page-title">Incentive Slabs</h2>
          <div className="h-9 w-28 rounded-md bg-[#f4f4f4] animate-pulse" />
        </div>
        <div className="slab-card">
          <SkeletonLoader rows={4} columns={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="slab-engine space-y-4">
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

      <div className="slab-page-header">
        <h2 className="slab-page-title">Incentive Slabs</h2>
        <button type="button" className="slab-add-btn" onClick={handleAddSlab}>
          <IconPlus size={14} />
          Add Slab
        </button>
      </div>

      {slabs.length > 0 ? (
        <div className="slab-list">
          {slabs.map((slab, index) => (
            <div key={slab.id} className="slab-card-wrap">
              <div
                className={`slab-card${editingId === slab.id ? ' slab-card--editing' : ''}`}
              >
                {editingId === slab.id ? (
                  <>
                    <div className="slab-edit-header">
                      <div className="slab-card-index">{index + 1}</div>
                      <h3 className="slab-card-title">Slab {index + 1}</h3>
                      <div className="slab-edit-actions">
                        <SlabActionButton
                          variant="edit"
                          onClick={() => setShowConfirmSave(true)}
                          ariaLabel="Save slab"
                        >
                          Save
                        </SlabActionButton>
                        <button
                          type="button"
                          className="slab-action-btn slab-action-btn--edit"
                          onClick={() => setEditingId(null)}
                          aria-label="Cancel editing"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                    <div className="slab-edit-fields">
                      <Input
                        label="Min Units"
                        type="number"
                        value={editFormData.min_qty}
                        onChange={(e) =>
                          setEditFormData({
                            ...editFormData,
                            min_qty: parseInt(e.target.value, 10),
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
                            max_qty: e.target.value ? parseInt(e.target.value, 10) : null,
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
                  </>
                ) : (
                  <div className="slab-card-body">
                    <div className="slab-card-main">
                      <div className="slab-card-index" aria-hidden="true">
                        {index + 1}
                      </div>
                      <div className="slab-card-info">
                        <div className="slab-card-title-row">
                          <h3 className="slab-card-title">Slab {index + 1}</h3>
                          <span className="slab-status-badge">Active</span>
                        </div>
                        <p className="slab-card-range">
                          {slab.min_qty} – {slab.max_qty === null ? '∞' : slab.max_qty} cars
                        </p>
                      </div>
                      <div className="slab-card-amount">
                        <span className="slab-card-price">
                          {formatIncentive(slab.incentive_per_car)}
                        </span>
                        <span className="slab-card-price-label">per car</span>
                      </div>
                    </div>
                    <div className="slab-card-actions">
                      <SlabActionButton
                        variant="edit"
                        onClick={() => handleEdit(slab)}
                        ariaLabel={`Edit slab ${index + 1}`}
                      >
                        <IconPencil size={13} />
                        Edit
                      </SlabActionButton>
                      <SlabActionButton
                        variant="delete"
                        onClick={() => handleDelete(slab.id)}
                        ariaLabel={`Delete slab ${index + 1}`}
                      >
                        <IconTrash size={13} />
                        Delete
                      </SlabActionButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {showConfirmSave && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div
                className="bg-white rounded-lg p-6 max-w-sm w-full"
                style={{ border: '0.5px solid #e5e5e5' }}
              >
                <h3 className="text-base font-medium text-[#1A1A1A] mb-2">Confirm Changes</h3>
                <p className="text-sm text-[#666] mb-5">
                  Updating slab configuration will affect all active calculations and incentive
                  payouts. This action is immediate and cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowConfirmSave(false)}
                  >
                    Cancel
                  </Button>
                  <button
                    type="button"
                    className="slab-add-btn"
                    onClick={() => handleSave(editingId)}
                  >
                    Confirm Update
                  </button>
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
            <button type="button" className="slab-add-btn" onClick={handleAddSlab}>
              <IconPlus size={14} />
              Create First Slab
            </button>
          }
        />
      )}
    </div>
  );
}
