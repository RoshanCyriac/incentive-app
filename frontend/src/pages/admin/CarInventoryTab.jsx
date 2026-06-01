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

function ActionButtons({ car, onEdit, onDelete, cardActions = false }) {
  const wrapClass = cardActions
    ? 'ci-card-actions flex items-center gap-1.5 justify-end'
    : 'flex items-center gap-1.5 flex-wrap justify-end';
  return (
    <div className={wrapClass}>
      <button type="button" className="ci-btn-edit" onClick={() => onEdit(car)}>
        <IconPencil size={13} />
        <span className="ci-btn-label">Edit</span>
      </button>
      <button type="button" className="ci-btn-delete" onClick={() => onDelete(car.id)}>
        <IconTrash size={13} />
        <span className="ci-btn-label">Delete</span>
      </button>
    </div>
  );
}

function VariantBadge({ variant }) {
  if (!variant) {
    return <span style={{ color: '#666', fontSize: '13px' }}>—</span>;
  }
  return <span className="ci-variant-badge">{toTitleCase(variant)}</span>;
}

function ModelCard({ car, onEdit, onDelete }) {
  return (
    <article className="ci-model-card">
      <div className="ci-model-card-top">
        <div className="ci-model-card-name-wrap">
          <div className="ci-model-icon-box">
            <IconCar size={15} style={{ color: '#888' }} />
          </div>
          <span className="ci-model-card-name">{toTitleCase(car.name)}</span>
        </div>
        <StatusBadge active={car.is_active !== false} />
      </div>
      <div className="ci-model-card-bottom">
        <span style={{ fontSize: '12px', color: '#888' }}>
          {car.variant ? `Variant: ${toTitleCase(car.variant)}` : 'Variant: —'}
        </span>
        <ActionButtons car={car} onEdit={onEdit} onDelete={onDelete} cardActions />
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

      <div className="ci-card">
        <div className="ci-toolbar-row">
          <div className="ci-toolbar-mobile-top">
            <div className="ci-toolbar-left">
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
            <button
              type="button"
              className="ci-add-btn ci-add-btn--mobile"
              onClick={() => handleOpenModal()}
              disabled={loading}
            >
              <IconPlus size={14} />
              Add Model
            </button>
          </div>

          <div className="ci-toolbar-left ci-toolbar-left--desktop">
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

          <div className="ci-toolbar-right">
            <div className="ci-search-wrap">
              <IconSearch size={14} />
              <input
                type="search"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ci-search"
                aria-label="Search models"
              />
            </div>
            <button
              type="button"
              className="ci-add-btn ci-add-btn--desktop"
              onClick={() => handleOpenModal()}
              disabled={loading}
            >
              <IconPlus size={14} />
              Add Model
            </button>
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
                            <div className="ci-model-icon-box">
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
                          <VariantBadge variant={car.variant} />
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
