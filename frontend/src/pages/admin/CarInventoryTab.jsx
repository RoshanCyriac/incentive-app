import React, { useState, useEffect, useMemo } from 'react';
import {
  getCars,
  createCar,
  updateCar,
  deleteCar,
} from '../../api/client';
import {
  Button,
  Input,
  Modal,
  Alert,
  SkeletonLoader,
  EmptyState,
} from '../../components';
import { IconCar, IconSearch, IconPlus, IconPencil, IconTrash } from '../../components/icons';

const PAGE_SIZE = 10;

function StatusBadge({ active = true }) {
  if (active) {
    return (
      <span
        className="inline-flex items-center gap-1.5"
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
          className="shrink-0 rounded-full"
          style={{ width: '5px', height: '5px', backgroundColor: '#3B6D11' }}
        />
        Active
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5"
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
        className="shrink-0 rounded-full"
        style={{ width: '5px', height: '5px', backgroundColor: '#5F5E5A' }}
      />
      Inactive
    </span>
  );
}

export default function CarInventoryTab() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    base_suffix: '',
    variant: '',
  });
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
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Model name is required';
    }
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
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingCar) {
        await updateCar(editingCar.id, formData);
      } else {
        await createCar(formData);
      }
      await fetchCars();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save car');
      console.error(err);
    }
  };

  const handleDelete = async (carId) => {
    try {
      await deleteCar(carId);
      await fetchCars();
      setShowDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete car');
      console.error(err);
    }
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }
    return pages;
  }, [currentPage, totalPages]);

  if (loading) {
    return (
      <div
        className="bg-white overflow-hidden"
        style={{
          border: '0.5px solid #E5E5E5',
          borderRadius: '10px',
        }}
      >
        <div
          style={{ padding: '14px 16px', borderBottom: '0.5px solid #F0F0F0' }}
          className="flex justify-between items-center"
        >
          <div className="h-5 w-32 bg-[#F4F4F4] rounded shimmer" />
          <div className="h-8 w-48 bg-[#F4F4F4] rounded shimmer" />
        </div>
        <div className="p-4">
          <SkeletonLoader rows={5} columns={5} />
        </div>
      </div>
    );
  }

  return (
    <div>
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
          className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          style={{
            padding: '14px 16px',
            borderBottom: '0.5px solid #F0F0F0',
          }}
        >
          <div className="flex items-center gap-2 shrink-0">
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

          <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:w-auto sm:gap-2">
            <div className="relative w-full sm:w-[180px]">
              <span
                className="absolute flex items-center pointer-events-none"
                style={{ left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#888' }}
              >
                <IconSearch size={14} />
              </span>
              <input
                type="search"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="outline-none transition-colors w-full"
                style={{
                  border: '0.5px solid #E0E0E0',
                  borderRadius: '6px',
                  padding: '6px 10px 6px 30px',
                  fontSize: '12.5px',
                  backgroundColor: '#FAFAFA',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#EB0A1E';
                  e.target.style.backgroundColor = '#fff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E0E0E0';
                  e.target.style.backgroundColor = '#FAFAFA';
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center justify-center gap-1.5 transition-colors w-full sm:w-auto"
              style={{
                backgroundColor: '#EB0A1E',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '12.5px',
                fontWeight: 500,
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
          </div>
        </div>

        {cars.length > 0 ? (
          <>
            {filteredCars.length > 0 ? (
              <div className="overflow-x-auto -mx-px">
                <table
                  className="w-full min-w-[640px]"
                  style={{ borderCollapse: 'collapse' }}
                >
                  <thead style={{ backgroundColor: '#FAFAFA' }}>
                    <tr>
                      {['Model Name', 'Base Suffix', 'Variant', 'Status', 'Actions'].map(
                        (col) => (
                          <th
                            key={col}
                            className="text-left"
                            style={{
                              padding: '10px 16px',
                              fontSize: '11.5px',
                              fontWeight: 500,
                              color: '#888',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              borderBottom: '0.5px solid #F0F0F0',
                            }}
                          >
                            {col}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCars.map((car, idx) => {
                      const isLastRow = idx === paginatedCars.length - 1;
                      return (
                        <tr key={car.id} className="group">
                          <td
                            style={{
                              padding: '11px 16px',
                              fontSize: '13px',
                              color: '#2A2A2A',
                              borderBottom: isLastRow ? 'none' : '0.5px solid #F7F7F7',
                            }}
                            className="group-hover:bg-[#FFF8F8]"
                          >
                            <div className="flex items-center" style={{ gap: '10px' }}>
                              <div
                                className="flex items-center justify-center shrink-0"
                                style={{
                                  width: '30px',
                                  height: '30px',
                                  backgroundColor: '#F4F4F4',
                                  borderRadius: '6px',
                                }}
                              >
                                <IconCar size={15} className="text-[#888]" />
                              </div>
                              <span
                                style={{
                                  fontWeight: 500,
                                  color: '#1A1A1A',
                                  fontSize: '13px',
                                }}
                              >
                                {car.name}
                              </span>
                            </div>
                          </td>
                          <td
                            style={{
                              padding: '11px 16px',
                              fontSize: '13px',
                              color: '#666',
                              borderBottom: isLastRow ? 'none' : '0.5px solid #F7F7F7',
                            }}
                            className="group-hover:bg-[#FFF8F8]"
                          >
                            {car.base_suffix || '—'}
                          </td>
                          <td
                            style={{
                              padding: '11px 16px',
                              borderBottom: isLastRow ? 'none' : '0.5px solid #F7F7F7',
                            }}
                            className="group-hover:bg-[#FFF8F8]"
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
                                {car.variant}
                              </span>
                            ) : (
                              <span style={{ color: '#666', fontSize: '13px' }}>—</span>
                            )}
                          </td>
                          <td
                            style={{
                              padding: '11px 16px',
                              borderBottom: isLastRow ? 'none' : '0.5px solid #F7F7F7',
                            }}
                            className="group-hover:bg-[#FFF8F8]"
                          >
                            <StatusBadge active={car.is_active !== false} />
                          </td>
                          <td
                            style={{
                              padding: '11px 16px',
                              borderBottom: isLastRow ? 'none' : '0.5px solid #F7F7F7',
                            }}
                            className="group-hover:bg-[#FFF8F8]"
                          >
                            <div className="flex flex-wrap items-center" style={{ gap: '6px' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenModal(car)}
                                className="inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                                style={{
                                  border: '0.5px solid #D0D0D0',
                                  borderRadius: '5px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  color: '#444',
                                  background: 'transparent',
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
                              >
                                <IconPencil size={13} />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setShowDeleteConfirm(car.id)}
                                className="inline-flex items-center gap-1 transition-colors"
                                style={{
                                  border: '0.5px solid #F0C0C0',
                                  borderRadius: '5px',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  color: '#A32D2D',
                                  background: 'transparent',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#FCEBEB';
                                  e.currentTarget.style.borderColor = '#E24B4A';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                  e.currentTarget.style.borderColor = '#F0C0C0';
                                }}
                              >
                                <IconTrash size={13} />
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div
                className="text-center py-12"
                style={{ fontSize: '13px', color: '#999' }}
              >
                No models match your search.
              </div>
            )}

            {/* Footer */}
            <div
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              style={{
                padding: '10px 16px',
                borderTop: '0.5px solid #F0F0F0',
                backgroundColor: '#FAFAFA',
              }}
            >
              <span className="text-center sm:text-left" style={{ fontSize: '12px', color: '#999' }}>
                Showing {paginatedCars.length} of {filteredCars.length} models
              </span>

              <div className="flex items-center justify-center gap-1 flex-wrap">
                <PaginationBtn
                  label="‹"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                />
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '32px 16px' }}>
            <EmptyState
              icon="🚗"
              title="No Car Models"
              message="Get started by adding your first car model to the system."
              action={
                <button
                  type="button"
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center gap-1.5"
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
                  Create First Model
                </button>
              }
            />
          </div>
        )}
      </div>

      <Modal
        isOpen={showModal}
        title={editingCar ? 'Edit Car Model' : 'Add New Car Model'}
        onClose={handleCloseModal}
        actions={[
          <Button key="cancel" variant="ghost" onClick={handleCloseModal} size="sm">
            Cancel
          </Button>,
          <Button key="save" variant="primary" onClick={handleSave} size="sm">
            {editingCar ? 'Update' : 'Create'}
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
          />
          <Input
            label="Base Suffix"
            name="base_suffix"
            type="text"
            placeholder="e.g., GL, GR, S"
            value={formData.base_suffix}
            onChange={handleFormChange}
          />
          <Input
            label="Variant"
            name="variant"
            type="text"
            placeholder="e.g., Sedan, SUV, Hatchback"
            value={formData.variant}
            onChange={handleFormChange}
          />
        </form>
      </Modal>

      <Modal
        isOpen={!!showDeleteConfirm}
        title="Confirm Delete"
        onClose={() => setShowDeleteConfirm(null)}
        actions={[
          <Button key="cancel" variant="ghost" onClick={() => setShowDeleteConfirm(null)} size="sm">
            Cancel
          </Button>,
          <Button
            key="delete"
            variant="primary"
            onClick={() => handleDelete(showDeleteConfirm)}
            size="sm"
          >
            Delete Car Model
          </Button>,
        ]}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this car model? This action cannot be undone and may
          affect historical data.
        </p>
      </Modal>
    </div>
  );
}

function PaginationBtn({ label, onClick, disabled, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
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
      }}
    >
      {label}
    </button>
  );
}
