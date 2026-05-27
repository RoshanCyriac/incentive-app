import React, { useState, useEffect } from 'react';
import {
  getCars,
  createCar,
  updateCar,
  deleteCar,
} from '../../api/client';

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
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCar(null);
    setFormData({ name: '', base_suffix: '', variant: '' });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Car Models</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Car
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Model Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Base Suffix
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Variant
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {cars.map((car) => (
              <tr key={car.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {car.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {car.base_suffix || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {car.variant || '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button
                    onClick={() => handleOpenModal(car)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(car.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {cars.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No car models found. Create one to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingCar ? 'Edit Car Model' : 'Add New Car Model'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Suffix
                </label>
                <input
                  type="text"
                  name="base_suffix"
                  value={formData.base_suffix}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Variant
                </label>
                <input
                  type="text"
                  name="variant"
                  value={formData.variant}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this car model? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
              >
                Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
