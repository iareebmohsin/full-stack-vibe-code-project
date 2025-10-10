import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  children: React.ReactNode;
}

/**
 * Input Component
 *
 * A fully accessible text input with label, error states, and helper text.
 * Supports all standard HTML input attributes.
 *
 * @example
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 *   helperText="We'll never share your email"
 * />
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth = false, className = '', id, ...props }, ref) => {
    // Generate ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Base input styles - Dark theme
    const baseStyles = 'px-4 py-2 border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#1a1a1a] text-white placeholder-gray-500';

    // Error state styles
    const errorStyles = error
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
      : 'border-[#333333] focus:border-blue-500 focus:ring-blue-500';

    // Width styles
    const widthStyles = fullWidth ? 'w-full' : '';

    const inputStyles = `${baseStyles} ${errorStyles} ${widthStyles} ${className}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={inputStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${inputId}-helper`} className="mt-1 text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea Component
 *
 * A fully accessible textarea with label, error states, and helper text.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = false, className = '', id, rows = 4, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'px-4 py-2 border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 resize-y bg-[#1a1a1a] text-white placeholder-gray-500';

    const errorStyles = error
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
      : 'border-[#333333] focus:border-blue-500 focus:ring-blue-500';

    const widthStyles = fullWidth ? 'w-full' : '';

    const textareaStyles = `${baseStyles} ${errorStyles} ${widthStyles} ${className}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={textareaStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="mt-1 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${textareaId}-helper`} className="mt-1 text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/**
 * Select Component
 *
 * A fully accessible select dropdown with label, error states, and helper text.
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth = false, className = '', id, children, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    const baseStyles = 'px-4 py-2 border rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-[#1a1a1a] text-white';

    const errorStyles = error
      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
      : 'border-[#333333] focus:border-blue-500 focus:ring-blue-500';

    const widthStyles = fullWidth ? 'w-full' : '';

    const selectStyles = `${baseStyles} ${errorStyles} ${widthStyles} ${className}`;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-300 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={selectStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p id={`${selectId}-error`} className="mt-1 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${selectId}-helper`} className="mt-1 text-sm text-slate-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
