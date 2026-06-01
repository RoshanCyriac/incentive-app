import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components';
import { IconCar } from '../components/icons';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }

    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const result = await login(formData.email, formData.password);

      if (result.user_role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (result.user_role === 'officer') {
        navigate('/officer', { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="flex min-h-[100dvh] bg-off-white overflow-x-hidden">
      {/* Brand panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-toyota-red flex-col items-center justify-center p-8 xl:p-12 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/10 mb-6">
            <IconCar size={32} className="text-white" />
          </div>
          <h1 className="text-3xl xl:text-4xl font-semibold text-white mb-2">Toyota</h1>
          <p className="text-white/90 font-medium text-lg">Smart Incentive Calculator</p>
          <p className="text-white/75 text-sm mt-3">
            Dealer Portal for Sales Incentive Management
          </p>
        </div>
        <p className="absolute bottom-6 text-white/75 text-xs">Smart Incentive Calculator v1.0</p>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex flex-col min-h-[100dvh]">
        {/* Mobile brand strip */}
        <div className="lg:hidden bg-toyota-red px-4 py-5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <IconCar size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-base leading-tight">Toyota</p>
            <p className="text-white/75 text-xs">Incentive Calculator</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:px-8 sm:py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-charcoal mb-1">
                {userRole === 'admin' ? 'Admin Login' : 'Sales Portal'}
              </h2>
              <p className="text-sm text-gray-500">Enter your credentials to continue</p>
            </div>

            <div className="mb-6 flex gap-2 bg-off-white p-1 rounded-md">
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium border-none cursor-pointer transition-all ${
                  userRole === 'admin'
                    ? 'bg-white text-toyota-red shadow-sm'
                    : 'bg-transparent text-charcoal'
                }`}
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setUserRole('officer')}
                className={`flex-1 py-2.5 px-3 rounded-md text-sm font-medium border-none cursor-pointer transition-all ${
                  userRole === 'officer'
                    ? 'bg-white text-toyota-red shadow-sm'
                    : 'bg-transparent text-charcoal'
                }`}
              >
                Officer
              </button>
            </div>

            {error && (
              <div className="mb-6">
                <Alert type="error" message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
                    className={`input-field pr-12 ${validationErrors.password ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-charcoal disabled:opacity-50 bg-transparent border-none cursor-pointer text-sm"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
                )}
              </div>

              <Button type="submit" disabled={isLoading} variant="primary" className="w-full mt-2">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-off-white rounded-md border-l-4 border-toyota-red">
              <p className="text-xs font-semibold text-charcoal mb-2">Demo Credentials:</p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Email:</span> admin@toyota.com
              </p>
              <p className="text-xs text-gray-600">
                <span className="font-medium">Password:</span> password123
              </p>
            </div>
          </div>

          <p className="text-center text-gray-500 text-xs mt-8 px-4">
            © 2026 Toyota Smart Incentive Calculator. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
