import React, { useState, useEffect } from 'react';
import { getUsers, createUser } from '../../api/client';
import {
  Button,
  Input,
  Badge,
  Modal,
  Alert,
  SkeletonLoader,
  EmptyState,
} from '../../components';

export default function OfficersTab() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchOfficers();
  }, []);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setOfficers(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch officers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Valid email is required';
    }
    if (!formData.password || formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createUser({
        ...formData,
        role: 'officer',
      });
      await fetchOfficers();
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      setFormErrors({});
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create officer');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
          <h2 className="text-xl font-header text-charcoal">Sales Officers</h2>
          <div className="w-full sm:w-32 h-10 bg-off-white rounded-md shimmer"></div>
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

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
        <h2 className="text-xl font-header text-charcoal">Sales Officers</h2>
        <Button variant="primary" onClick={() => setShowModal(true)} className="w-full sm:w-auto">
          ➕ Create Officer
        </Button>
      </div>

      {/* Table */}
      {officers.length > 0 ? (
        <div className="table-container overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead className="table-header sticky top-0">
              <tr>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Email</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {officers.map((officer, idx) => (
                <tr key={officer.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-off-white'} table-row`}>
                  <td className="table-cell font-label text-charcoal">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-toyota-red rounded-full flex items-center justify-center text-white font-header text-sm flex-shrink-0">
                        {officer.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{officer.name}</span>
                    </div>
                  </td>
                  <td className="table-cell text-gray-600">{officer.email}</td>
                  <td className="table-cell">
                    <Badge
                      status={officer.is_active ? 'active' : 'inactive'}
                      label={officer.is_active ? 'Active' : 'Inactive'}
                    />
                  </td>
                  <td className="table-cell text-gray-600 text-sm">
                    {new Date(officer.created_at).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          icon="👤"
          title="No Sales Officers"
          message="Create your first sales officer to start tracking incentives and performance."
          action={
            <Button variant="primary" onClick={() => setShowModal(true)}>
              ➕ Create First Officer
            </Button>
          }
        />
      )}

      {/* Create Officer Modal */}
      <Modal
        isOpen={showModal}
        title="Create New Sales Officer"
        onClose={() => {
          setShowModal(false);
          setFormData({ name: '', email: '', password: '' });
          setFormErrors({});
        }}
        actions={[
          <Button
            key="cancel"
            variant="ghost"
            onClick={() => {
              setShowModal(false);
              setFormData({ name: '', email: '', password: '' });
              setFormErrors({});
            }}
            size="sm"
          >
            Cancel
          </Button>,
          <Button key="create" variant="primary" onClick={handleSubmit} size="sm">
            Create Officer
          </Button>,
        ]}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleFormChange}
            error={formErrors.name}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john.doe@toyota.com"
            value={formData.email}
            onChange={handleFormChange}
            error={formErrors.email}
            required
          />

          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleFormChange}
              error={formErrors.password}
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Minimum 8 characters required
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
