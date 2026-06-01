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
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="text-toyota-red ml-1">*</span>}
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
      {error && <p className="text-sm text-status-error mt-1">{error}</p>}
    </div>
  );
}
