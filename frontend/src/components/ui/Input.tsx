import React, { useId } from 'react';

type FieldExtras = {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  required?: boolean;
};

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & FieldExtras;
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldExtras;
export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & FieldExtras & { children: React.ReactNode };

export const fieldClass = (error?: string) =>
  `w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink transition-colors focus:outline-none focus:ring-4 ${
    error ? 'border-[#c0392b] focus:ring-[#c0392b]/15' : 'border-line hover:border-ink/30 focus:border-ink focus:ring-ember/15'
  }`;

function Shell({
  id,
  label,
  error,
  helperText,
  required,
  children,
}: FieldExtras & { id: string; children: React.ReactNode }) {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 flex items-center gap-1 text-[13px] font-semibold text-ink-soft">
          {label}
          {required && <span className="text-ember">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-[13px] text-[#b3261e]">
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-[13px] text-mute">{helperText}</p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, fullWidth: _fw, required, className = '', id, ...props }, ref) => {
    const auto = useId();
    const fid = id || auto;
    void _fw;
    return (
      <Shell id={fid} label={label} error={error} helperText={helperText} required={required}>
        <input
          ref={ref}
          id={fid}
          aria-invalid={error ? 'true' : 'false'}
          className={`${fieldClass(error)} h-11 ${className}`}
          {...props}
        />
      </Shell>
    );
  }
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth: _fw, required, className = '', id, rows = 4, ...props }, ref) => {
    const auto = useId();
    const fid = id || auto;
    void _fw;
    return (
      <Shell id={fid} label={label} error={error} helperText={helperText} required={required}>
        <textarea
          ref={ref}
          id={fid}
          rows={rows}
          aria-invalid={error ? 'true' : 'false'}
          className={`${fieldClass(error)} resize-y py-3 leading-relaxed ${className}`}
          {...props}
        />
      </Shell>
    );
  }
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, fullWidth: _fw, required, className = '', id, children, ...props }, ref) => {
    const auto = useId();
    const fid = id || auto;
    void _fw;
    return (
      <Shell id={fid} label={label} error={error} helperText={helperText} required={required}>
        <div className="relative">
          <select
            ref={ref}
            id={fid}
            aria-invalid={error ? 'true' : 'false'}
            className={`${fieldClass(error)} h-11 appearance-none pr-10 ${className}`}
            {...props}
          >
            {children}
          </select>
          <svg
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </Shell>
    );
  }
);
Select.displayName = 'Select';
