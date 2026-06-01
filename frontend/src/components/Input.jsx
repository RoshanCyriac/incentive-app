import React from 'react';

/**
 * Input field component with Toyota design system
 */
export default function Input({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = '',
  ...rest
}) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span style={{ color: '#EB0A1E', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`input-field ${error ? 'input-error' : ''} ${className}`}
        {...rest}
      />
      {error && <p style={{ fontSize: '0.875rem', color: '#EF4444', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
}
