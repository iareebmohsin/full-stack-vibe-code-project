import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const VARIANTS = {
  default: 'bg-sage-deep text-ink-soft',
  primary: 'bg-ink text-paper',
  success: 'bg-moss text-forest',
  warning: 'bg-butter text-[#6b5412]',
  danger: 'bg-rosy text-[#8a2a20]',
  info: 'bg-sky text-[#244a6b]',
};

const SIZES = {
  sm: 'h-5 px-2 text-[11px]',
  md: 'h-6 px-2.5 text-xs',
  lg: 'h-7 px-3 text-[13px]',
};

/** Squared chip with a mono label, used for status and taxonomy. */
export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', size = 'md', className = '', style }) => (
  <span
    style={style}
    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md font-mono font-medium uppercase tracking-[0.04em] ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
  >
    {children}
  </span>
);
