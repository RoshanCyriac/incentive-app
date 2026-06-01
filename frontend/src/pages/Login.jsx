import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Alert } from '../components';
import { IconCar } from '../components/icons';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [userRole, setUserRole] = useState('admin');

  const validateForm = () => {
    const errors = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const result = await login(formData.email, formData.password);
      if (result.user_role === 'admin') navigate('/admin', { replace: true });
      else if (result.user_role === 'officer') navigate('/officer', { replace: true });
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  return (
    <div
      className="relative min-h-[100dvh] flex items-center justify-center p-4 sm:p-8 overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #0c1222 0%, #1a2744 35%, #eef1f8 35%, #f4f6fb 100%)',
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute top-0 left-0 w-96 h-96 bg-[#EB0A1E]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-80 h-80 bg-indigo-400/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="relative w-full max-w-[420px]">
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-900/15 border border-white/80 overflow-hidden">
          {/* Red header band */}
          <div
            className="px-8 pt-8 pb-10 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #EB0A1E 0%, #c8071a 50%, #991b1b 100%)' }}
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_50%)]" />
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur border border-white/30 mb-4">
              <IconCar size={32} className="text-white" strokeWidth={2} />
            </div>
            <h1 className="relative text-2xl font-bold text-white tracking-tight">Toyota</h1>
            <p className="relative text-sm text-red-100 mt-1 font-medium">Incentive Calculator</p>
          </div>

          <div className="px-8 pb-8 -mt-5">
            <div className="bg-white rounded-xl border border-slate-100 shadow-lg px-6 py-6">
              <h2 className="text-lg font-bold text-slate-900 text-center">
                {userRole === 'admin' ? 'Admin sign in' : 'Officer sign in'}
              </h2>
              <p className="text-sm text-slate-500 text-center mt-1 mb-5">
                Enter your credentials to continue
              </p>

              <div className="flex gap-1 p-1 rounded-xl bg-slate-100 mb-5">
                {['admin', 'officer'].map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserRole(role)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all ${
                      userRole === role
                        ? 'bg-white text-[#EB0A1E] shadow-md'
                        : 'bg-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {role === 'admin' ? 'Admin' : 'Officer'}
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4">
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
                    Password <span className="text-[#EB0A1E]">*</span>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#EB0A1E] hover:text-[#c8071a] bg-transparent border-none cursor-pointer"
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
                  className="w-full mt-1 py-3 font-semibold rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, #EB0A1E, #d40919)',
                    boxShadow: '0 4px 14px rgba(235, 10, 30, 0.4)',
                  }}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-red-50 to-orange-50 border border-red-100">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#EB0A1E] mb-2">
                  Demo access
                </p>
                <p className="text-xs text-slate-600">
                  <span className="text-slate-400">Email</span>{' '}
                  <span className="font-semibold text-slate-800">admin@toyota.com</span>
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  <span className="text-slate-400">Password</span>{' '}
                  <span className="font-semibold text-slate-800">password123</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-500/90 text-xs mt-6">
          © 2026 Toyota Smart Incentive Calculator
        </p>
      </div>
    </div>
  );
}
