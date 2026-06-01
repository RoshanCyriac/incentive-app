import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Toast,
} from '../../components';
import {
  IconCar,
  IconSearch,
  IconPlus,
  IconPencil,
  IconTrash,
  IconCheckCircle,
  IconXCircle,
  IconMoreVertical,
  IconChevronLeft,
  IconChevronRight,
  IconLayers,
  IconFilter,
} from '../../components/icons';

const PAGE_SIZE = 10;

function toTitleCase(str) {
  if (!str || typeof str !== 'string') return str;
  return str
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function StatCard({ label, value, icon: Icon, accent = 'neutral' }) {
  const accents = {
    neutral: { bg: 'bg-[#F5F5F5]', icon: 'text-[#525252]', ring: 'border-[#E5E5E5]' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'border-emerald-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', ring: 'border-red-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'border-blue-100' },
  };
  const a = accents[accent] || accents.neutral;

  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm ${a.ring}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-[#737373] uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-semibold text-[#171717] mt-1 tabular-nums">{value}</p>
        </div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg shrink-0 ${a.bg}`}>
          <Icon size={20} className={a.icon} />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ active = true }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/80">
        <IconCheckCircle size={14} className="text-emerald-600 shrink-0" aria-hidden />
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#F5F5F5] text-[#525252] border border-[#E5E5E5]">
      <IconXCircle size={14} className="text-[#737373] shrink-0" aria-hidden />
      Inactive
    </span>
  );
}

function RowActionsMenu({ car, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#E5E5E5] bg-white text-[#525252] hover:bg-[#FAFAFA] hover:border-[#D4D4D4] transition-colors"
        aria-label={`Actions for ${car.name}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <IconMoreVertical size={16} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-20 min-w-[140px] py-1 bg-white rounded-lg border border-[#E5E5E5] shadow-lg"
          role="menu"
        >
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#404040] hover:bg-[#F5F5F5] text-left"
            onClick={() => {
              setOpen(false);
              onEdit(car);
            }}
          >
            <IconPencil size={15} className="text-[#525252]" />
            Edit model
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
            onClick={() => {
              setOpen(false);
              onDelete(car.id);
            }}
          >
            <IconTrash size={15} />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-[#F0F0F0]">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="w-8 h-8 rounded-lg bg-[#F0F0F0]" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-[#F0F0F0] rounded w-1/3" />
            <div className="h-3 bg-[#F5F5F5] rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [variantFilter, setVariantFilter] = useState('all');
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
  }, [searchQuery, statusFilter, variantFilter]);

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

  const stats = useMemo(() => {
    const active = cars.filter((c) => c.is_active !== false).length;
    const inactive = cars.length - active;
    const variants = new Set(
      cars.map((c) => c.variant?.trim()).filter(Boolean)
    );
    return {
      total: cars.length,
      active,
      inactive,
      variants: variants.size,
    };
  }, [cars]);

  const variantOptions = useMemo(() => {
    const set = new Set();
    cars.forEach((c) => {
      if (c.variant?.trim()) set.add(c.variant.trim());
    });
    return Array.from(set).sort();
  }, [cars]);

  const filteredCars = useMemo(() => {
    let list = [...cars];
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(
        (car) =>
          car.name?.toLowerCase().includes(q) ||
          car.base_suffix?.toLowerCase().includes(q) ||
          car.variant?.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'active') {
      list = list.filter((c) => c.is_active !== false);
    } else if (statusFilter === 'inactive') {
      list = list.filter((c) => c.is_active === false);
    }

    if (variantFilter !== 'all') {
      list = list.filter((c) => (c.variant || '').trim() === variantFilter);
    }

    return list;
  }, [cars, searchQuery, statusFilter, variantFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredCars.length / PAGE_SIZE));

  const paginatedCars = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCars.slice(start, start + PAGE_SIZE);
  }, [filteredCars, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const rangeStart = filteredCars.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filteredCars.length);

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

  return (
    <div className="space-y-5 pb-2">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {error && (
        <Alert type="error" message={error} onClose={() => setError(null)} />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[88px] rounded-xl bg-white border border-[#E5E5E5] animate-pulse" />
            ))}
          </>
        ) : (
          <>
            <StatCard label="Total Models" value={stats.total} icon={IconCar} accent="neutral" />
            <StatCard label="Active Models" value={stats.active} icon={IconCheckCircle} accent="green" />
            <StatCard label="Inactive Models" value={stats.inactive} icon={IconXCircle} accent="red" />
            <StatCard label="Variants" value={stats.variants} icon={IconLayers} accent="blue" />
          </>
        )}
      </div>

      {/* Main table card */}
      <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
        {/* Section header + primary action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-[#F0F0F0]">
          <div>
            <h2 className="text-[15px] font-semibold text-[#171717]">Car Models</h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Manage vehicle models, variants, and availability
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#EB0A1E] rounded-lg hover:bg-[#C8071A] active:bg-[#A80616] transition-colors shadow-sm disabled:opacity-50 shrink-0 self-start sm:self-auto"
          >
            <IconPlus size={16} />
            Add Model
          </button>
        </div>

        {/* Toolbar: search + filters */}
        <div className="px-4 sm:px-5 py-3 border-b border-[#F5F5F5] bg-[#FAFAFA]/80">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative w-full sm:max-w-[240px]">
              <IconSearch
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A3A3A3] pointer-events-none"
              />
              <input
                type="search"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm text-[#171717] bg-white border border-[#E5E5E5] rounded-lg outline-none focus:border-[#EB0A1E] focus:ring-2 focus:ring-[#EB0A1E]/10 transition-shadow"
                aria-label="Search car models"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 flex-1">
              <div className="flex items-center gap-1.5 text-[#737373]">
                <IconFilter size={14} aria-hidden />
                <span className="text-xs font-medium hidden sm:inline">Filters</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm py-2 pl-2.5 pr-8 bg-white border border-[#E5E5E5] rounded-lg text-[#404040] outline-none focus:border-[#EB0A1E] focus:ring-2 focus:ring-[#EB0A1E]/10"
                aria-label="Filter by status"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={variantFilter}
                onChange={(e) => setVariantFilter(e.target.value)}
                className="text-sm py-2 pl-2.5 pr-8 bg-white border border-[#E5E5E5] rounded-lg text-[#404040] outline-none focus:border-[#EB0A1E] focus:ring-2 focus:ring-[#EB0A1E]/10 min-w-[120px]"
                aria-label="Filter by variant"
              >
                <option value="all">All variants</option>
                {variantOptions.map((v) => (
                  <option key={v} value={v}>
                    {toTitleCase(v)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table body */}
        {loading ? (
          <TableSkeleton />
        ) : cars.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 rounded-xl bg-[#F5F5F5] flex items-center justify-center mb-4">
              <IconCar size={28} className="text-[#A3A3A3]" />
            </div>
            <h3 className="text-base font-semibold text-[#171717]">No car models yet</h3>
            <p className="text-sm text-[#737373] mt-1 max-w-sm">
              Add your first vehicle model to start tracking inventory and incentives.
            </p>
            <button
              type="button"
              onClick={() => handleOpenModal()}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#EB0A1E] rounded-lg hover:bg-[#C8071A] transition-colors"
            >
              <IconPlus size={16} />
              Create first model
            </button>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="py-14 px-6 text-center">
            <p className="text-sm text-[#737373]">No models match your search or filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setVariantFilter('all');
              }}
              className="mt-3 text-sm font-medium text-[#EB0A1E] hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAFAFA] border-b border-[#EEEEEE]">
                    {['Model Name', 'Base Suffix', 'Variant', 'Status', ''].map((col) => (
                      <th
                        key={col || 'actions'}
                        scope="col"
                        className={`px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-[#737373] ${
                          col === '' ? 'w-[52px]' : ''
                        }`}
                      >
                        {col || (
                          <span className="sr-only">Actions</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedCars.map((car, idx) => (
                    <tr
                      key={car.id}
                      className={[
                        'border-b border-[#F5F5F5] transition-colors',
                        idx % 2 === 1 ? 'bg-[#FAFAFA]/50' : 'bg-white',
                        'hover:bg-[#FFF8F8]',
                      ].join(' ')}
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#F5F5F5] flex items-center justify-center shrink-0">
                            <IconCar size={15} className="text-[#737373]" />
                          </div>
                          <span className="font-medium text-[#171717]">
                            {toTitleCase(car.name)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[#525252]">
                        {car.base_suffix ? toTitleCase(car.base_suffix) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        {car.variant ? (
                          <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-800 border border-blue-100">
                            {toTitleCase(car.variant)}
                          </span>
                        ) : (
                          <span className="text-[#A3A3A3]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusPill active={car.is_active !== false} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <RowActionsMenu
                          car={car}
                          onEdit={handleOpenModal}
                          onDelete={setShowDeleteConfirm}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-5 py-3 border-t border-[#F0F0F0] bg-[#FAFAFA]/60">
              <p className="text-xs text-[#737373] tabular-nums">
                Showing {rangeStart}–{rangeEnd} of {filteredCars.length} models
              </p>
              <div className="flex items-center gap-2 justify-center sm:justify-end">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#404040] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#FAFAFA] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Previous page"
                >
                  <IconChevronLeft size={14} />
                  Previous
                </button>
                <span className="text-xs text-[#737373] px-2 tabular-nums">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#404040] bg-white border border-[#E5E5E5] rounded-lg hover:bg-[#FAFAFA] disabled:opacity-40 disabled:pointer-events-none transition-colors"
                  aria-label="Next page"
                >
                  Next
                  <IconChevronRight size={14} />
                </button>
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
        title="Delete car model?"
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
            {saving ? 'Deleting...' : 'Delete model'}
          </Button>,
        ]}
      >
        <p className="text-sm text-[#525252] leading-relaxed">
          This will remove the model from active inventory. Historical sales data may still
          reference it. This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
