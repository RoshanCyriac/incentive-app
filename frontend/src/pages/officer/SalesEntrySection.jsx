import React, { useState, useCallback } from 'react';
import { upsertSale, getIncentive } from '../../api/client';
import './SalesEntry.css';

function toTitleCase(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function UnitsEditor({
  carId,
  savedUnits,
  isEditing,
  draftValue,
  isSaving,
  onStartEdit,
  onDraftChange,
  onConfirm,
  onCancel,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onConfirm(carId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  if (!isEditing) {
    return (
      <button
        type="button"
        className="sales-units-display"
        onClick={() => onStartEdit(carId, savedUnits)}
        aria-label={`Edit units sold, current value ${savedUnits}`}
      >
        {savedUnits}
      </button>
    );
  }

  return (
    <div className="sales-units-row">
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={draftValue}
        onChange={(e) => onDraftChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        className="sales-units-input sales-units-input--editing"
        aria-label="Units sold"
        autoFocus
      />
      <div className="sales-units-actions">
        <button
          type="button"
          className="sales-units-btn sales-units-btn--cancel"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="button"
          className="sales-units-btn sales-units-btn--ok"
          onClick={() => onConfirm(carId)}
          disabled={isSaving}
        >
          {isSaving ? 'Saving…' : 'OK'}
        </button>
      </div>
    </div>
  );
}

export default function SalesEntrySection({
  cars,
  sales,
  setSales,
  month,
  year,
  incentive,
  setIncentive,
  onError,
}) {
  const [editingCarId, setEditingCarId] = useState(null);
  const [draftUnits, setDraftUnits] = useState('');
  const [savingCarId, setSavingCarId] = useState(null);

  const getSalesForCar = useCallback(
    (carModelId) => sales.find((sale) => sale.car_model_id === carModelId)?.units_sold ?? 0,
    [sales]
  );

  const startEdit = (carId, currentUnits) => {
    setEditingCarId(carId);
    setDraftUnits(String(currentUnits));
  };

  const cancelEdit = () => {
    setEditingCarId(null);
    setDraftUnits('');
  };

  const confirmEdit = async (carId) => {
    const newUnits = Math.max(0, parseInt(draftUnits, 10) || 0);
    const previousUnits = getSalesForCar(carId);

    if (newUnits === previousUnits) {
      cancelEdit();
      return;
    }

    setSavingCarId(carId);
    try {
      await upsertSale({
        car_model_id: carId,
        month,
        year,
        units_sold: newUnits,
      });

      setSales((prev) => {
        const existing = prev.find((s) => s.car_model_id === carId);
        if (existing) {
          return prev.map((s) =>
            s.car_model_id === carId ? { ...s, units_sold: newUnits } : s
          );
        }
        return [...prev, { car_model_id: carId, units_sold: newUnits, month, year }];
      });

      const incentiveRes = await getIncentive(month, year);
      setIncentive(incentiveRes.data);
      cancelEdit();
    } catch (err) {
      onError('Failed to save sales entry');
      console.error(err);
    } finally {
      setSavingCarId(null);
    }
  };

  const ratePerCar = incentive?.matched_slab
    ? Math.round(incentive.matched_slab.incentive_per_car)
    : 0;

  return (
    <div className="sales-entry-grid">
      <div className="sales-entry-card min-w-0">
        <div className="sales-entry-card-inner">
          <h2 className="sales-entry-section-title">Car Models</h2>
          <p className="sales-entry-section-desc">
            Enter units sold, then press OK to save
          </p>

          {cars.length > 0 ? (
            <div className="sales-table-scroll">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th className="sales-col-model">Model Name</th>
                    <th className="sales-col-units">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => {
                    const units = getSalesForCar(car.id);
                    const isEditing = editingCarId === car.id;
                    const isSaving = savingCarId === car.id;

                    return (
                      <tr key={car.id}>
                        <td>
                          <span className="sales-model-name">{toTitleCase(car.name)}</span>
                        </td>
                        <td className="sales-col-units-cell">
                          <UnitsEditor
                            carId={car.id}
                            savedUnits={units}
                            isEditing={isEditing}
                            draftValue={draftUnits}
                            isSaving={isSaving}
                            onStartEdit={startEdit}
                            onDraftChange={setDraftUnits}
                            onConfirm={confirmEdit}
                            onCancel={cancelEdit}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-sm text-[#666]">No car models available</div>
          )}
        </div>
      </div>

      <div className="sales-entry-card min-w-0 sales-tracker-sticky">
        <div className="sales-entry-card-inner">
          <div className="sales-tracker">
            <h2 className="sales-tracker-title">Incentive Tracker</h2>

            <div className="sales-stat-grid">
              <div className="sales-stat-card">
                <p className="sales-stat-card-label">Units Sold</p>
                <p className="sales-stat-card-value">{incentive?.total_units_sold ?? 0}</p>
              </div>
              <div className="sales-stat-card">
                <p className="sales-stat-card-label">Incentive</p>
                <p className="sales-stat-card-value sales-stat-card-value--accent">
                  ₹{Math.round(incentive?.total_payout || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="sales-stat-card">
                <p className="sales-stat-card-label">Rate / Car</p>
                <p className="sales-stat-card-value">₹{ratePerCar.toLocaleString('en-IN')}</p>
              </div>
            </div>

            {incentive?.matched_slab ? (
              <div className="sales-slab-card sales-slab-card--matched">
                <p className="sales-slab-label">Current Slab</p>
                <p className="sales-slab-value">
                  {incentive.matched_slab.min_qty} –{' '}
                  {incentive.matched_slab.max_qty ?? '∞'} cars
                </p>
              </div>
            ) : (
              <div className="sales-slab-card">
                <p className="sales-slab-label">Current Slab</p>
                <p className="sales-slab-value" style={{ color: '#888', fontWeight: 500 }}>
                  No slab matched yet
                </p>
              </div>
            )}

            {incentive?.next_slab && (
              <div className="sales-next-slab">
                <div className="flex justify-between items-center gap-2 flex-wrap mb-1">
                  <p className="text-xs font-medium text-[#666]">
                    Next: ₹{Math.round(incentive.next_slab.incentive_per_car).toLocaleString('en-IN')}
                    /car
                  </p>
                  <p className="text-xs font-medium text-[#666]">
                    {incentive.units_to_next_slab} more units
                  </p>
                </div>
                <div className="sales-progress-bar">
                  <div
                    className="sales-progress-fill"
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
    </div>
  );
}
