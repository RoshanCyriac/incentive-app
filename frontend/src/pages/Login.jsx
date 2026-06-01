import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconMail, IconLock, IconShield, IconUser, IconLogIn } from '../components/icons';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [userRole, setUserRole] = useState('admin');

  const portalLabel = userRole === 'admin' ? 'Admin Portal' : 'Sales Officer Portal';

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
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
    <div className="login-page">
      {/* Left brand panel */}
      <aside className="login-brand" aria-label="Toyota brand">
        <div className="login-brand__watermark" aria-hidden>
          TOYOTA
        </div>

        <div className="login-brand__content">
          <div className="login-brand__logo-row">
            <div className="login-toyota-rings" aria-hidden>
              <span className="login-toyota-rings__outer" />
              <span className="login-toyota-rings__inner" />
              <span className="login-toyota-rings__bar" />
            </div>
            <div className="login-brand__titles">
              <div className="login-brand__name">TOYOTA</div>
              <div className="login-brand__dealer">DEALER PORTAL</div>
            </div>
          </div>

          <div className="login-brand__divider login-mobile-hide" aria-hidden />

          <div className="login-brand__tagline login-mobile-hide">
            <span className="login-brand__tagline-title">Smart Incentive Calculator</span>
            Manage slabs, track sales, and calculate rewards — all in one place.
          </div>
        </div>

        <p className="login-brand__version">Smart Incentive Calculator v1.0</p>
      </aside>

      {/* Right form panel */}
      <main className="login-form-panel">
        <header style={{ marginBottom: '28px' }}>
          <p
            style={{
              fontSize: '11px',
              fontWeight: 500,
              color: '#EB0A1E',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '6px',
            }}
          >
            {portalLabel}
          </p>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 500,
              color: '#1A1A1A',
              margin: 0,
            }}
          >
            Welcome back
          </h1>
          <p
            style={{
              fontSize: '13px',
              color: '#888',
              marginTop: '4px',
              marginBottom: 0,
            }}
          >
            Sign in to your account to continue
          </p>
        </header>

        {error && <div className="login-alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" className="login-field-label">
              Email address
            </label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <IconMail size={15} />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={userRole === 'admin' ? 'admin@toyota.com' : 'officer@toyota.com'}
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className={`login-input ${validationErrors.email ? 'login-input--error' : ''}`}
              />
            </div>
            {validationErrors.email && (
              <p className="login-field-error">{validationErrors.email}</p>
            )}
          </div>

          <div style={{ marginBottom: '4px' }}>
            <label htmlFor="password" className="login-field-label">
              Password
            </label>
            <div className="login-input-wrap">
              <span className="login-input-icon">
                <IconLock size={15} />
              </span>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className={`login-input ${validationErrors.password ? 'login-input--error' : ''}`}
              />
            </div>
            {validationErrors.password && (
              <p className="login-field-error">{validationErrors.password}</p>
            )}
            <button type="button" className="login-forgot">
              Forgot password?
            </button>
          </div>

          <button type="submit" className="login-submit" disabled={isLoading}>
            <IconLogIn size={16} />
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="login-role-divider">
            <span className="login-role-divider__line" aria-hidden />
            <span className="login-role-divider__text">or sign in as</span>
            <span className="login-role-divider__line" aria-hidden />
          </div>

          <div className="login-role-grid">
            <button
              type="button"
              className="login-role-btn"
              onClick={() => setUserRole('admin')}
              aria-pressed={userRole === 'admin'}
            >
              <IconShield size={15} />
              Admin
            </button>
            <button
              type="button"
              className="login-role-btn"
              onClick={() => setUserRole('officer')}
              aria-pressed={userRole === 'officer'}
            >
              <IconUser size={15} />
              Sales Officer
            </button>
          </div>
        </form>

        <p
          style={{
            textAlign: 'center',
            fontSize: '11.5px',
            color: '#BBB',
            marginTop: '20px',
            marginBottom: 0,
          }}
        >
          Toyota Motor Corporation · Authorized access only
        </p>
      </main>
    </div>
  );
}
