import React, { Suspense, ComponentType } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentWrapperProps {
  fallback?: React.ReactNode;
  className?: string;
}

export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = React.lazy(() => Promise.resolve({ default: Component }));
  
  return React.forwardRef<any, P & LazyComponentWrapperProps>((props, ref) => {
    const { fallback: customFallback, className, ...componentProps } = props;
    
    const defaultFallback = (
      <div className={className}>
        <Skeleton className="w-full h-32" />
      </div>
    );

    return (
      <Suspense fallback={customFallback || fallback || defaultFallback}>
        <LazyComponent {...(componentProps as P)} ref={ref} />
      </Suspense>
    );
  });
};

// Utility for creating lazy-loaded route components
export const createLazyRoute = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  return React.lazy(importFn);
};