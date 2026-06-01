import React from 'react';

/**
 * Button component with Toyota design system
 * @param {string} variant - 'primary' | 'secondary' | 'ghost' | 'icon'
 * @param {string} size - 'sm' | 'md' (default)
 * @param {React.ReactNode} children - Button content
 * @param {boolean} disabled - Whether button is disabled
 * @param {function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 * @param {string} type - 'button' | 'submit' | 'reset'
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...rest
}) {
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    icon: 'btn-icon',
  };

  const sizeClasses = {
    sm: 'btn-primary-sm',
    md: '',
  };

  const combinedClass = `
    ${variantClasses[variant] || variantClasses.primary}
    ${size === 'sm' && variant === 'primary' ? 'btn-primary-sm' : ''}
    ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={combinedClass}
      {...rest}
    >
      {children}
    </button>
  );
}
