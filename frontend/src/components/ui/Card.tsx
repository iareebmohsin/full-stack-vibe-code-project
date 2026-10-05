import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}
export type CardBodyProps = CardHeaderProps;
export type CardFooterProps = CardHeaderProps;

const PAD = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };

export const Card: React.FC<CardProps> = ({ children, className = '', hoverable = false, padding = 'md', ...rest }) => (
  <div
    className={`rounded-[var(--radius-card)] border border-line bg-paper ${
      hoverable ? 'transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/30 hover:shadow-[0_10px_30px_-18px_rgba(23,34,27,0.45)]' : ''
    } ${PAD[padding]} ${className}`}
    {...rest}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
  <div className={className}>{children}</div>
);

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
  <div className={`mt-4 border-t border-line pt-4 ${className}`}>{children}</div>
);
