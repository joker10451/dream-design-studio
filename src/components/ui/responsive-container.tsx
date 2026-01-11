import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  full: 'max-w-full',
};

const paddingClasses = {
  none: '',
  sm: 'px-2 sm:px-4',
  md: 'px-4 sm:px-6',
  lg: 'px-4 sm:px-6 lg:px-8',
  xl: 'px-4 sm:px-6 lg:px-8 xl:px-12',
};

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = 'full',
  padding = 'md',
  center = true,
}) => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        center && 'mx-auto',
        className
      )}
      data-mobile={isMobile}
      data-tablet={isTablet}
    >
      {children}
    </div>
  );
};

// Responsive grid component
interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 'md',
}) => {
  const gridCols = [];
  
  if (cols.xs) gridCols.push(`grid-cols-${cols.xs}`);
  if (cols.sm) gridCols.push(`sm:grid-cols-${cols.sm}`);
  if (cols.md) gridCols.push(`md:grid-cols-${cols.md}`);
  if (cols.lg) gridCols.push(`lg:grid-cols-${cols.lg}`);
  if (cols.xl) gridCols.push(`xl:grid-cols-${cols.xl}`);
  if (cols['2xl']) gridCols.push(`2xl:grid-cols-${cols['2xl']}`);

  return (
    <div
      className={cn(
        'grid',
        ...gridCols,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
};

// Responsive text component
interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: {
    xs?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    sm?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    md?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    lg?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  };
  as?: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
}

const textSizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  size = { xs: 'base', sm: 'base', md: 'lg', lg: 'xl' },
  as: Component = 'p',
}) => {
  const sizeClasses = [];
  
  if (size.xs) sizeClasses.push(textSizeClasses[size.xs]);
  if (size.sm) sizeClasses.push(`sm:${textSizeClasses[size.sm]}`);
  if (size.md) sizeClasses.push(`md:${textSizeClasses[size.md]}`);
  if (size.lg) sizeClasses.push(`lg:${textSizeClasses[size.lg]}`);

  return (
    <Component
      className={cn(
        ...sizeClasses,
        className
      )}
    >
      {children}
    </Component>
  );
};