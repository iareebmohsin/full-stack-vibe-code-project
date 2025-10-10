import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card Component
 *
 * A flexible card container with optional hover effects and customizable padding.
 * Supports composition with CardHeader, CardBody, and CardFooter sub-components.
 *
 * @example
 * <Card hoverable>
 *   <CardHeader>
 *     <h3>Card Title</h3>
 *   </CardHeader>
 *   <CardBody>
 *     <p>Card content</p>
 *   </CardBody>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 */
export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
}) => {
  // Base styles - Dark theme
  const baseStyles = 'bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] transition-shadow duration-200';

  // Hover effect
  const hoverStyles = hoverable ? 'shadow-sm shadow-black/50 hover:shadow-md hover:shadow-black/50 cursor-pointer' : 'shadow-sm shadow-black/50';

  // Padding styles
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardStyles = `${baseStyles} ${hoverStyles} ${paddingStyles[padding]} ${className}`;

  return <div className={cardStyles}>{children}</div>;
};

/**
 * CardHeader Component
 *
 * Header section of a card, typically contains title and optional actions.
 */
export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

/**
 * CardBody Component
 *
 * Main content area of a card.
 */
export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
  return <div className={`${className}`}>{children}</div>;
};

/**
 * CardFooter Component
 *
 * Footer section of a card, typically contains actions or metadata.
 */
export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return <div className={`mt-4 pt-4 border-t border-[#2a2a2a] ${className}`}>{children}</div>;
};
