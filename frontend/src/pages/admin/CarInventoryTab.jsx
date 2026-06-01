import React, { useState, useEffect } from 'react';
import {
  getCars,
  createCar,
  updateCar,
  deleteCar,
} from '../../api/client';
import {
  Button,
  Input,
  Badge,
  Modal,
  Alert,
  SkeletonLoader,
  EmptyState,
} from '../../components';

export default function CarInventoryTab() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    base_suffix: '',
    variant: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Fetch cars on mount
  useEffect(() => {
    fetchCars();
  }, []);

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

  if (loading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-header text-charcoal">Car Models</h2>
          <div className="w-32 h-10 bg-off-white rounded-md shimmer"></div>
        </div>
        <div className="card">
          <SkeletonLoader rows={5} columns={4} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-header text-charcoal">Car Models</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          ➕ Add Car Model
        </Button>
      </div>

      {/* Table */}
      {cars.length > 0 ? (
        <div className="table-container">
          <table className="w-full">
            <thead className="table-header sticky top-0">
              <tr>
                <th className="table-header-cell">Model Name</th>
                <th className="table-header-cell">Base Suffix</th>
                <th className="table-header-cell">Variant</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, idx) => (
                <tr key={car.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-off-white'} table-row`}>
                  <td className="table-cell font-label text-charcoal">{car.name}</td>
                  <td className="table-cell text-gray-600">{car.base_suffix || '—'}</td>
                  <td className="table-cell text-gray-600">{car.variant || '—'}</td>
                  <td className="table-cell">
                    <Badge status="active" label="Active" />
                  </td>
                  <td className="table-cell text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenModal(car)}
                      >
                        ✎ Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(car.id)}
                        className="text-status-error"
                      >
                        🗑 Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="🚗"
          title="No Car Models"
          message="Get started by adding your first car model to the system."
          action={
            <Button variant="primary" onClick={() => handleOpenModal()}>
              ➕ Create First Model
            </Button>
          }
        />
      )}

      {/* Add/Edit Modal */}
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        title="Confirm Delete"
        onClose={() => setShowDeleteConfirm(null)}
        actions={[
          <Button key="cancel" variant="ghost" onClick={() => setShowDeleteConfirm(null)} size="sm">
            Cancel
          </Button>,
          <Button key="delete" variant="primary" onClick={() => handleDelete(showDeleteConfirm)} size="sm">
            Delete Car Model
          </Button>,
        ]}
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this car model? This action cannot be undone and may affect historical data.
        </p>
      </Modal>
    </div>
  );
}
