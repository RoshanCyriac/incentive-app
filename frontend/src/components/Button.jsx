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
  const baseStyles = 'font-medium rounded-md transition-all duration-150 flex items-center justify-center gap-2';

  const variantStyles = {
    primary:
      'px-4 py-2 bg-toyota-red text-white hover:bg-red-700 active:scale-95 disabled:opacity-50',
    secondary:
      'px-4 py-2 bg-white text-charcoal border-2 border-charcoal hover:bg-charcoal hover:text-white active:scale-95 disabled:opacity-50',
    ghost: 'px-4 py-2 text-charcoal hover:bg-off-white active:scale-95 disabled:opacity-50',
    icon: 'w-10 h-10 text-charcoal hover:bg-off-white active:bg-silver-gray disabled:opacity-50',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
  };

  const combinedClass = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${size !== 'md' ? sizeStyles[size] : ''}
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
