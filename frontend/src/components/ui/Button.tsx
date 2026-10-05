import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const VARIANTS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-ink text-paper hover:bg-forest',
  accent: 'bg-ember text-white hover:bg-[#e94d14]',
  secondary: 'bg-sage-deep text-ink hover:bg-line',
  outline: 'border border-ink/25 text-ink hover:border-ink hover:bg-white',
  ghost: 'text-ink-soft hover:bg-ink/5 hover:text-ink',
  danger: 'bg-[#b3261e] text-white hover:bg-[#961f18]',
};

const SIZES: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3.5 text-[13px] gap-1.5',
  md: 'h-10 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', isLoading = false, fullWidth = false, className = '', disabled, children, ...props },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-full font-semibold tracking-[-0.01em] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-sage disabled:opacity-45 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
          <span>Working</span>
        </>
      ) : (
        children
      )}
    </button>
  )
);

Button.displayName = 'Button';
