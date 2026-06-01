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
    <div className="min-h-screen bg-off-white flex overflow-hidden">
      {/* Left Panel - Toyota Red */}
      <div className="hidden lg:flex lg:w-1/2 bg-toyota-red flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Diagonal accent */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="diagonal" patternUnits="userSpaceOnUse" width="10" height="10">
                <line x1="0" y1="0" x2="10" y2="10" stroke="white" strokeWidth="1" />
                <line x1="10" y1="0" x2="0" y2="10" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#diagonal)" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <div className="inline-block">
              <svg
                className="w-24 h-24 text-white"
                fill="currentColor"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="2" />
                <text x="50" y="60" textAnchor="middle" fontSize="40" fontWeight="bold" fill="white">
                  T
                </text>
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-header text-white mb-2">
            Toyota
          </h1>
          <p className="text-white text-opacity-90 font-label text-lg">
            Smart Incentive Calculator
          </p>
          <p className="text-white text-opacity-75 text-sm mt-3 max-w-sm">
            Dealer Portal for Sales Incentive Management
          </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-white text-opacity-75 text-xs">
          <p>Smart Incentive Calculator v1.0</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-toyota-red rounded-md flex items-center justify-center">
                <span className="text-2xl font-header text-white">T</span>
              </div>
            </div>
            <h1 className="text-2xl font-header text-charcoal mb-1">
              Toyota
            </h1>
            <p className="text-sm text-gray-500">
              Smart Incentive Calculator
            </p>
          </div>

          {/* Title for form */}
          <div className="mb-8">
            <h2 className="text-2xl font-header text-charcoal mb-1">
              {userRole === 'admin' ? 'Admin Login' : 'Sales Portal'}
            </h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to continue
            </p>
          </div>

          {/* Role Toggle */}
          <div className="mb-6 flex gap-2 bg-off-white p-1 rounded-md">
            <button
              type="button"
              onClick={() => setUserRole('admin')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-label transition-all duration-150 ${
                userRole === 'admin'
                  ? 'bg-white text-toyota-red shadow-sm'
                  : 'text-charcoal hover:bg-white hover:bg-opacity-50'
              }`}
            >
              🔐 Admin
            </button>
            <button
              type="button"
              onClick={() => setUserRole('officer')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-label transition-all duration-150 ${
                userRole === 'officer'
                  ? 'bg-white text-toyota-red shadow-sm'
                  : 'text-charcoal hover:bg-white hover:bg-opacity-50'
              }`}
            >
              👤 Officer
            </button>
          </div>

          {/* API Error Message */}
          {error && (
            <div className="mb-6">
              <Alert type="error" message={error} />
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
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
                <span className="text-toyota-red ml-1">*</span>
              </label>
              <div className="relative">
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
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-charcoal transition disabled:opacity-50"
                >
                  {showPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-status-error mt-1">{validationErrors.password}</p>
              )}
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              variant="primary"
              className="w-full mt-6"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Credentials - Now styled with Toyota design */}
          <div className="mt-6 p-4 bg-off-white rounded-md border-l-4 border-toyota-red">
            <p className="text-xs font-header text-charcoal mb-2">Demo Credentials:</p>
            <p className="text-xs text-gray-600">
              <span className="font-label">Email:</span> admin@toyota.com
            </p>
            <p className="text-xs text-gray-600">
              <span className="font-label">Password:</span> password123
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-xs mt-6">
          © 2026 Toyota Smart Incentive Calculator. All rights reserved.
        </p>
      </div>
    </div>
  );
}
