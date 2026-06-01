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
    <div
      className="relative min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 overflow-hidden"
      style={{ backgroundColor: '#EDEDED' }}
    >
      {/* Subtle background pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(235,10,30,0.06) 0%, transparent 45%), radial-gradient(circle at 80% 80%, rgba(26,26,26,0.04) 0%, transparent 40%)',
        }}
      />
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center top, rgba(235,10,30,0.12), transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-[400px]">
        {/* Login card */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: '0.5px solid #E0E0E0' }}
        >
          {/* Card header accent */}
          <div className="h-1 bg-[#EB0A1E]" />

          <div className="px-6 pt-7 pb-6 sm:px-8 sm:pt-8 sm:pb-7">
            {/* Brand — centered */}
            <div className="flex flex-col items-center text-center mb-7">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-xl mb-4"
                style={{ backgroundColor: '#EB0A1E' }}
              >
                <IconCar size={28} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-charcoal tracking-tight">Toyota</h1>
              <p className="text-sm text-[#888] mt-0.5">Incentive Calculator</p>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-lg font-semibold text-charcoal">
                {userRole === 'admin' ? 'Admin sign in' : 'Officer sign in'}
              </h2>
              <p className="text-sm text-[#888] mt-1">Enter your credentials to continue</p>
            </div>

            {/* Role toggle */}
            <div
              className="flex gap-1 p-1 rounded-lg mb-6"
              style={{ backgroundColor: '#F4F4F4' }}
            >
              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border-none cursor-pointer transition-all duration-150 ${
                  userRole === 'admin'
                    ? 'bg-white text-[#EB0A1E] font-semibold'
                    : 'bg-transparent text-[#666] hover:text-charcoal'
                }`}
                style={
                  userRole === 'admin'
                    ? { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : undefined
                }
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => setUserRole('officer')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium border-none cursor-pointer transition-all duration-150 ${
                  userRole === 'officer'
                    ? 'bg-white text-[#EB0A1E] font-semibold'
                    : 'bg-transparent text-[#666] hover:text-charcoal'
                }`}
                style={
                  userRole === 'officer'
                    ? { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                    : undefined
                }
              >
                Officer
              </button>
            </div>

            {error && (
              <div className="mb-5">
                <Alert type="error" message={error} />
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    className={`input-field pr-14 ${validationErrors.password ? 'input-error' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#888] hover:text-charcoal disabled:opacity-50 bg-transparent border-none cursor-pointer px-1"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                className="w-full mt-1 py-2.5"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div
              className="mt-6 p-3.5 rounded-lg text-center"
              style={{
                backgroundColor: '#FAFAFA',
                border: '0.5px solid #EEEEEE',
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#999] mb-2">
                Demo access
              </p>
              <p className="text-xs text-[#666]">
                <span className="text-[#888]">Email</span>{' '}
                <span className="font-medium text-charcoal">admin@toyota.com</span>
              </p>
              <p className="text-xs text-[#666] mt-0.5">
                <span className="text-[#888]">Password</span>{' '}
                <span className="font-medium text-charcoal">password123</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-[#999] text-[11px] mt-5 px-2">
          © 2026 Toyota Smart Incentive Calculator
        </p>
      </div>
    </div>
  );
}
