import React, { useState, useEffect } from 'react';
import { getUsers, createUser } from '../../api/client';
import {
  Button,
  Input,
  Modal,
  Alert,
  SkeletonLoader,
  EmptyState,
} from '../../components';
import { IconPlus } from '../../components/icons';
import './OfficersTab.css';

function OfficerStatusBadge({ active }) {
  const className = active
    ? 'officers-status-badge officers-status-badge--active'
    : 'officers-status-badge officers-status-badge--inactive';
  return <span className={className}>{active ? 'Active' : 'Inactive'}</span>;
}

function getInitials(name) {
  if (!name || !name.trim()) return '?';
  return name.trim().charAt(0).toUpperCase();
}

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

  const closeModal = () => {
    setShowModal(false);
    setFormData({ name: '', email: '', password: '' });
    setFormErrors({});
  };

  if (loading) {
    return (
      <div className="officers-page">
        <div className="officers-page-header">
          <h2 className="officers-page-title">Sales Officers</h2>
          <div className="h-9 w-32 rounded-md bg-[#f4f4f4] animate-pulse" />
        </div>
        <div className="officers-card p-4">
          <SkeletonLoader rows={5} columns={3} />
        </div>
      </div>
    );
  }

  return (
    <div className="officers-page">
      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError(null)} />
        </div>
      )}

      <div className="officers-page-header">
        <h2 className="officers-page-title">Sales Officers</h2>
        <button type="button" className="officers-add-btn" onClick={() => setShowModal(true)}>
          <IconPlus size={14} />
          Create Officer
        </button>
      </div>

      {officers.length > 0 ? (
        <div className="officers-card">
          <div className="officers-table-scroll">
            <table className="officers-table">
              <thead>
                <tr>
                  <th className="officers-col-name">Name</th>
                  <th className="officers-col-email">Email</th>
                  <th className="officers-col-status">Status</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer) => (
                  <tr key={officer.id}>
                    <td>
                      <div className="officers-name-cell">
                        <div className="officers-avatar" aria-hidden="true">
                          {getInitials(officer.name)}
                        </div>
                        <span className="officers-name-text">{officer.name}</span>
                      </div>
                    </td>
                    <td className="officers-email">{officer.email}</td>
                    <td className="officers-status-cell">
                      <OfficerStatusBadge active={officer.is_active !== false} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon="👤"
          title="No Sales Officers"
          message="Create your first sales officer to start tracking incentives and performance."
          action={
            <button type="button" className="officers-add-btn" onClick={() => setShowModal(true)}>
              <IconPlus size={14} />
              Create First Officer
            </button>
          }
        />
      )}

      <Modal
        isOpen={showModal}
        title="Create New Sales Officer"
        onClose={closeModal}
        actions={[
          <Button key="cancel" variant="ghost" onClick={closeModal} size="sm">
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
            <p className="text-xs text-gray-500 mt-2">Minimum 8 characters required</p>
          </div>
        </form>
      </Modal>
    </div>
  );
}
