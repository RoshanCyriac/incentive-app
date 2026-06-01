import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [userRole, setUserRole] = useState('admin');

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    // Clear API error when user modifies form
    if (error) {
      clearError();
    }
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      // Redirect based on user role
      if (result.user_role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (result.user_role === 'officer') {
        navigate('/officer', { replace: true });
      }
    } catch (err) {
      // Error is handled in AuthContext
      console.error('Login failed:', err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8F8F8', overflow: 'hidden' }}>
      {/* Left Panel - Toyota Red - Hidden on mobile */}
      <div
        style={{
          display: 'none',
          width: '50%',
          backgroundColor: '#EB0A1E',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
          '@media (min-width: 1024px)': { display: 'flex' },
        }}
      >
        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'inline-block' }}>
              <svg style={{ width: '6rem', height: '6rem' }} fill="white" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="2" />
                <text x="50" y="60" textAnchor="middle" fontSize="40" fontWeight="bold" fill="white">
                  T
                </text>
              </svg>
            </div>
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
            Toyota
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontWeight: '500', fontSize: '1.125rem' }}>
            Smart Incentive Calculator
          </p>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.875rem', marginTop: '0.75rem', maxWidth: '28rem' }}>
            Dealer Portal for Sales Incentive Management
          </p>
        </div>
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '1.5rem', color: 'rgba(255,255,255,0.75)', fontSize: '0.75rem' }}>
          <p>Smart Incentive Calculator v1.0</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 3rem' }}>
        <div style={{ width: '100%', maxWidth: '28rem' }}>
          {/* Title for form */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1A1A1A', marginBottom: '0.25rem' }}>
              {userRole === 'admin' ? 'Admin Login' : 'Sales Portal'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
              Enter your credentials to continue
            </p>
          </div>

          {/* Role Toggle */}
          <div
            style={{
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.5rem',
              backgroundColor: '#F8F8F8',
              padding: '0.25rem',
              borderRadius: '0.375rem',
            }}
          >
            <button
              type="button"
              onClick={() => setUserRole('admin')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms',
                backgroundColor: userRole === 'admin' ? 'white' : 'transparent',
                color: userRole === 'admin' ? '#EB0A1E' : '#1A1A1A',
                boxShadow: userRole === 'admin' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              🔐 Admin
            </button>
            <button
              type="button"
              onClick={() => setUserRole('officer')}
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 150ms',
                backgroundColor: userRole === 'officer' ? 'white' : 'transparent',
                color: userRole === 'officer' ? '#EB0A1E' : '#1A1A1A',
                boxShadow: userRole === 'officer' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
              }}
            >
              👤 Officer
            </button>
          </div>

          {/* API Error Message */}
          {error && (
            <div style={{ marginBottom: '1.5rem' }}>
              <Alert type="error" message={error} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Email Field */}
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder={userRole === 'admin' ? 'admin@toyota.com' : 'officer@toyota.com'}
              value={formData.email}
              onChange={handleChange}
              error={validationErrors.email}
              required
              disabled={isLoading}
            />

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
                <span style={{ color: '#EB0A1E', marginLeft: '0.25rem' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className={`input-field ${validationErrors.password ? 'input-error' : ''}`}
                />

                {/* Show/Hide Password Toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#6B7280',
                    background: 'none',
                    border: 'none',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'color 150ms',
                    fontSize: '1rem',
                  }}
                  onMouseEnter={(e) => (e.target.style.color = '#1A1A1A')}
                  onMouseLeave={(e) => (e.target.style.color = '#6B7280')}
                >
                  {showPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {validationErrors.password && (
                <p style={{ fontSize: '0.875rem', color: '#EF4444', marginTop: '0.25rem' }}>
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              style={{ width: '100%', marginTop: '1.5rem' }}
            >
              {isLoading ? (
                <>
                  <svg
                    style={{ animation: 'spin 1s linear infinite', height: '1.25rem', width: '1.25rem' }}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      opacity="0.75"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#F8F8F8', borderRadius: '0.375rem', borderLeft: '4px solid #EB0A1E' }}>
            <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1A1A1A', marginBottom: '0.5rem' }}>
              Demo Credentials:
            </p>
            <p style={{ fontSize: '0.75rem', color: '#4B5563' }}>
              <span style={{ fontWeight: '500' }}>Email:</span> admin@toyota.com
            </p>
            <p style={{ fontSize: '0.75rem', color: '#4B5563' }}>
              <span style={{ fontWeight: '500' }}>Password:</span> password123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: '0.75rem', marginTop: '1.5rem' }}>
          © 2026 Toyota Smart Incentive Calculator. All rights reserved.
        </p>
      </div>
    </div>
  );
}
