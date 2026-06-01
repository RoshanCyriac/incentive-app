import React, { useState, useEffect, useMemo } from 'react';
import {
  getCars,
  createCar,
  updateCar,
  deleteCar,
} from '../../api/client';
import { Button, Input, Modal, Alert, Toast } from '../../components';
import {
  IconCar,
  IconSearch,
  IconPlus,
  IconPencil,
  IconTrash,
} from '../../components/icons';
import './CarInventory.css';

const PAGE_SIZE = 10;

function toTitleCase(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function StatusBadge({ active = true }) {
  if (active) {
    return (
      <span
        className="inline-flex items-center gap-1.5 shrink-0"
        style={{
          backgroundColor: '#EAF3DE',
          color: '#27500A',
          fontSize: '11.5px',
          padding: '3px 10px',
          borderRadius: '20px',
          fontWeight: 500,
        }}
      >
        <span
          className="rounded-full shrink-0"
          style={{ width: '5px', height: '5px', backgroundColor: '#3B6D11' }}
        />
        Active
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 shrink-0"
      style={{
        backgroundColor: '#F1EFE8',
        color: '#5F5E5A',
        fontSize: '11.5px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontWeight: 500,
      }}
    >
      <span
        className="rounded-full shrink-0"
        style={{ width: '5px', height: '5px', backgroundColor: '#5F5E5A' }}
      />
      Inactive
    </span>
  );
}

function ActionButtons({ car, onEdit, onDelete, compact }) {
  const pad = compact ? '4px 8px' : '5px 10px';
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      <button
        type="button"
        className="ci-btn-action inline-flex items-center gap-1 transition-colors"
        style={{
          border: '0.5px solid #D0D0D0',
          borderRadius: '5px',
          padding: pad,
          fontSize: '12px',
          color: '#444',
          background: 'transparent',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#185FA5';
          e.currentTarget.style.color = '#185FA5';
          e.currentTarget.style.backgroundColor = '#F0F4FF';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#D0D0D0';
          e.currentTarget.style.color = '#444';
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onClick={() => onEdit(car)}
      >
        <IconPencil size={13} />
        Edit
      </button>
      <button
        type="button"
        className="ci-btn-action inline-flex items-center gap-1 transition-colors"
        style={{
          border: '0.5px solid #F0C0C0',
          borderRadius: '5px',
          padding: pad,
          fontSize: '12px',
          color: '#A32D2D',
          background: 'transparent',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FCEBEB';
          e.currentTarget.style.borderColor = '#E24B4A';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.borderColor = '#F0C0C0';
        }}
        onClick={() => onDelete(car.id)}
      >
        <IconTrash size={13} />
        Delete
      </button>
    </div>
  );
}

function ModelCard({ car, onEdit, onDelete }) {
  return (
    <article className="ci-model-card">
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="flex items-center justify-center shrink-0 rounded-md"
          style={{ width: '30px', height: '30px', backgroundColor: '#F4F4F4' }}
        >
          <IconCar size={15} style={{ color: '#888' }} />
        </div>
        <span
          className="flex-1 font-medium truncate"
          style={{ fontSize: '13px', color: '#1A1A1A', fontWeight: 500 }}
        >
          {toTitleCase(car.name)}
        </span>
        <StatusBadge active={car.is_active !== false} />
      </div>
      <div className="flex items-center justify-between gap-2">
        <span style={{ fontSize: '12px', color: '#888' }}>
          {car.variant ? `Variant: ${toTitleCase(car.variant)}` : 'Variant: —'}
        </span>
        <ActionButtons car={car} onEdit={onEdit} onDelete={onDelete} compact />
      </div>
    </article>
  );
}

export default function CarInventoryTab() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({ name: '', base_suffix: '', variant: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await getCars();
      setCars(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch cars');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cars;
    return cars.filter(
      (car) =>
        car.name?.toLowerCase().includes(q) ||
        car.base_suffix?.toLowerCase().includes(q) ||
        car.variant?.toLowerCase().includes(q)
    );
  }, [cars, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));

  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCars.slice(start, start + PAGE_SIZE);
  }, [filteredCars, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i += 1) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Model name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        name: car.name,
        base_suffix: car.base_suffix || '',
        variant: car.variant || '',
      });
    } else {
      setEditingCar(null);
      setFormData({ name: '', base_suffix: '', variant: '' });
    }
    setFormErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCar(null);
    setFormData({ name: '', base_suffix: '', variant: '' });
    setFormErrors({});
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setSaving(true);
      if (editingCar) {
        await updateCar(editingCar.id, formData);
        setToast({ type: 'success', message: 'Model updated successfully' });
      } else {
        await createCar(formData);
        setToast({ type: 'success', message: 'Model created successfully' });
      }
      await fetchCars();
      handleCloseModal();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to save car model' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (carId) => {
    try {
      setSaving(true);
      await deleteCar(carId);
      await fetchCars();
      setShowDeleteConfirm(null);
      setToast({ type: 'success', message: 'Model deleted successfully' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to delete car model' });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const footerCountText =
    filteredCars.length === 0
      ? 'Showing 0 of 0 models'
      : `Showing ${paginatedCars.length} of ${filteredCars.length} models`;

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <div
        className="bg-white overflow-hidden"
        style={{
          border: '0.5px solid #E5E5E5',
          borderRadius: '10px',
        }}
      >
        {/* Toolbar */}
        <div
          className="ci-toolbar-row flex flex-wrap items-center justify-between gap-3"
          style={{
            padding: '14px 16px',
            borderBottom: '0.5px solid #F0F0F0',
          }}
        >
          <div className="ci-toolbar-top flex items-center justify-between gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1A' }}>
                Car Models
              </span>
              <span
                style={{
                  backgroundColor: '#F4F4F4',
                  color: '#666',
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '20px',
                }}
              >
                {cars.length} {cars.length === 1 ? 'model' : 'models'}
              </span>
            </div>
            <AddModelButton
              onClick={() => handleOpenModal()}
              disabled={loading}
              className="md:hidden"
            />
          </div>

          <div className="ci-toolbar-actions flex items-center gap-2 w-full md:w-auto">
            <div className="ci-search-wrap relative" style={{ width: '180px' }}>
              <IconSearch
                size={14}
                className="absolute pointer-events-none"
                style={{ left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}
              />
              <input
                type="search"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ci-search outline-none w-full"
                style={{
                  border: '0.5px solid #E0E0E0',
                  borderRadius: '6px',
                  padding: '6px 10px 6px 30px',
                  fontSize: '12.5px',
                  color: '#1A1A1A',
                  backgroundColor: '#FAFAFA',
                }}
                aria-label="Search models"
              />
            </div>
            <AddModelButton
              onClick={() => handleOpenModal()}
              disabled={loading}
              className="hidden md:inline-flex"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center" style={{ fontSize: '13px', color: '#999' }}>
            Loading models…
          </div>
        ) : cars.length === 0 ? (
          <div className="py-16 px-6 text-center">
            <IconCar size={32} style={{ color: '#CCC', margin: '0 auto 12px' }} />
            <p style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>No car models yet</p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="mt-4 inline-flex items-center gap-1.5"
              style={{
                backgroundColor: '#EB0A1E',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 500,
              }}
            >
              <IconPlus size={14} />
              Create first model
            </button>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="py-12 text-center" style={{ fontSize: '13px', color: '#999' }}>
            No models match your search.
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="ci-table-wrap overflow-x-auto">
              <table className="w-full min-w-[600px]" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAFAFA' }}>
                    {['Model Name', 'Base Suffix', 'Variant', 'Status', 'Actions'].map((col) => (
                      <th
                        key={col}
                        scope="col"
                        className={col === 'Base Suffix' ? 'ci-col-suffix' : ''}
                        style={{
                          padding: '10px 16px',
                          fontSize: '11.5px',
                          fontWeight: 500,
                          color: '#888',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          borderBottom: '0.5px solid #F0F0F0',
                          textAlign: 'left',
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedCars.map((car, idx) => {
                    const isLast = idx === paginatedCars.length - 1;
                    return (
                      <tr
                        key={car.id}
                        className="ci-row group"
                        onMouseEnter={(e) => {
                          e.currentTarget.querySelectorAll('td').forEach((td) => {
                            td.style.backgroundColor = '#FFF8F8';
                          });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.querySelectorAll('td').forEach((td) => {
                            td.style.backgroundColor = '';
                          });
                        }}
                      >
                        <td
                          style={{
                            padding: '11px 16px',
                            fontSize: '13px',
                            borderBottom: isLast ? 'none' : '0.5px solid #F7F7F7',
                          }}
                        >
                          <div className="flex items-center" style={{ gap: '10px' }}>
                            <div
                              className="flex items-center justify-center shrink-0 rounded-md"
                              style={{
                                width: '30px',
                                height: '30px',
                                backgroundColor: '#F4F4F4',
                              }}
                            >
                              <IconCar size={15} style={{ color: '#888' }} />
                            </div>
                            <span style={{ fontWeight: 500, color: '#1A1A1A', fontSize: '13px' }}>
                              {toTitleCase(car.name)}
                            </span>
                          </div>
                        </td>
                        <td
                          className="ci-col-suffix"
                          style={{
                            padding: '11px 16px',
                            fontSize: '13px',
                            color: '#666',
                            borderBottom: isLast ? 'none' : '0.5px solid #F7F7F7',
                          }}
                        >
                          {car.base_suffix || '—'}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: isLast ? 'none' : '0.5px solid #F7F7F7',
                          }}
                        >
                          {car.variant ? (
                            <span
                              style={{
                                backgroundColor: '#F0F4FF',
                                color: '#185FA5',
                                fontSize: '11px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontWeight: 500,
                              }}
                            >
                              {toTitleCase(car.variant)}
                            </span>
                          ) : (
                            <span style={{ color: '#666', fontSize: '13px' }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: isLast ? 'none' : '0.5px solid #F7F7F7',
                          }}
                        >
                          <StatusBadge active={car.is_active !== false} />
                        </td>
                        <td
                          style={{
                            padding: '11px 16px',
                            borderBottom: isLast ? 'none' : '0.5px solid #F7F7F7',
                          }}
                        >
                          <ActionButtons
                            car={car}
                            onEdit={handleOpenModal}
                            onDelete={setShowDeleteConfirm}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="ci-cards">
              {paginatedCars.map((car) => (
                <ModelCard
                  key={car.id}
                  car={car}
                  onEdit={handleOpenModal}
                  onDelete={setShowDeleteConfirm}
                />
              ))}
            </div>

            {/* Footer */}
            <div
              className="ci-footer flex flex-wrap items-center justify-between gap-3"
              style={{
                padding: '10px 16px',
                borderTop: '0.5px solid #F0F0F0',
                backgroundColor: '#FAFAFA',
              }}
            >
              <span style={{ fontSize: '12px', color: '#999' }}>{footerCountText}</span>
              <div className="flex items-center gap-1">
                <PaginationBtn
                  label="‹"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  ariaLabel="Previous page"
                />
                {pageNumbers.map((page) => (
                  <PaginationBtn
                    key={page}
                    label={String(page)}
                    active={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  />
                ))}
                <PaginationBtn
                  label="›"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  ariaLabel="Next page"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={editingCar ? 'Edit Car Model' : 'Add New Car Model'}
        onClose={handleCloseModal}
        actions={[
          <Button key="cancel" variant="ghost" onClick={handleCloseModal} size="sm" disabled={saving}>
            Cancel
          </Button>,
          <Button key="save" variant="primary" onClick={handleSave} size="sm" disabled={saving}>
            {saving ? 'Saving...' : editingCar ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Model Name"
            name="name"
            type="text"
            placeholder="e.g., Toyota Corolla"
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
            required
            disabled={saving}
          />
          <Input
            label="Base Suffix"
            name="base_suffix"
            type="text"
            placeholder="e.g., GL, GR, S"
            value={formData.base_suffix}
            onChange={handleFormChange}
            disabled={saving}
          />
          <Input
            label="Variant"
            name="variant"
            type="text"
            placeholder="e.g., Sedan, SUV, Hatchback"
            value={formData.variant}
            onChange={handleFormChange}
            disabled={saving}
          />
        </form>
      </Modal>

      <Modal
        isOpen={!!showDeleteConfirm}
        title="Confirm Delete"
        onClose={() => !saving && setShowDeleteConfirm(null)}
        actions={[
          <Button
            key="cancel"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(null)}
            size="sm"
            disabled={saving}
          >
            Cancel
          </Button>,
          <Button
            key="delete"
            variant="primary"
            onClick={() => handleDelete(showDeleteConfirm)}
            size="sm"
            disabled={saving}
          >
            {saving ? 'Deleting...' : 'Delete Car Model'}
          </Button>,
        ]}
      >
        <p style={{ fontSize: '14px', color: '#666' }}>
          Are you sure you want to delete this car model? This action cannot be undone and may
          affect historical data.
        </p>
      </Modal>
    </>
  );
}

function AddModelButton({ onClick, disabled, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`items-center justify-center gap-1.5 shrink-0 transition-colors disabled:opacity-50 ${className}`}
      style={{
        backgroundColor: '#EB0A1E',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '7px 14px',
        fontSize: '12.5px',
        fontWeight: 500,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#C8071A';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#EB0A1E';
      }}
    >
      <IconPlus size={14} />
      Add Model
    </button>
  );
}

function PaginationBtn({ label, onClick, disabled, active, ariaLabel }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="flex items-center justify-center transition-colors disabled:opacity-40"
      style={{
        width: '26px',
        height: '26px',
        border: '0.5px solid',
        borderColor: active ? '#EB0A1E' : '#E0E0E0',
        borderRadius: '5px',
        backgroundColor: active ? '#EB0A1E' : '#fff',
        fontSize: '12px',
        color: active ? '#fff' : '#555',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {label}
    </button>
  );
}
