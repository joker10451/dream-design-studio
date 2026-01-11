import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  blur?: boolean;
  responsive?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  placeholder = '/placeholder.svg',
  sizes,
  priority = false,
  quality = 75,
  blur = true,
  responsive,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { currentBreakpoint } = useResponsive();

  // Get responsive source based on current breakpoint
  const getResponsiveSrc = () => {
    if (!responsive) return src;
    
    const breakpointOrder: (keyof typeof responsive)[] = ['xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = breakpointOrder.indexOf(currentBreakpoint as keyof typeof responsive);
    
    for (let i = currentIndex; i < breakpointOrder.length; i++) {
      const breakpoint = breakpointOrder[i];
      if (responsive[breakpoint]) {
        return responsive[breakpoint];
      }
    }
    
    return src;
  };

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  const currentSrc = getResponsiveSrc();

  return (
    <div ref={imgRef} className={cn('relative overflow-hidden', className)}>
      {/* Placeholder/blur background */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            'absolute inset-0 bg-gray-200 transition-opacity duration-300',
            blur && 'backdrop-blur-sm',
            isInView ? 'opacity-50' : 'opacity-100'
          )}
        >
          {placeholder && (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-30"
              aria-hidden="true"
            />
          )}
        </div>
      )}
      
      {/* Loading skeleton */}
      {isInView && !isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 animate-pulse" />
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={hasError ? placeholder : currentSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

// Picture component for WebP support with fallbacks
interface ResponsivePictureProps {
  src: string;
  webpSrc?: string;
  avifSrc?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export const ResponsivePicture: React.FC<ResponsivePictureProps> = ({
  src,
  webpSrc,
  avifSrc,
  alt,
  className,
  sizes,
  priority = false,
}) => {
  return (
    <picture className={className}>
      {avifSrc && (
        <source srcSet={avifSrc} type="image/avif" sizes={sizes} />
      )}
      {webpSrc && (
        <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
      )}
      <OptimizedImage
        src={src}
        alt={alt}
        className="w-full h-full"
        sizes={sizes}
        priority={priority}
      />
    </picture>
  );
};

// Hook for generating responsive image URLs (for future API integration)
export function useResponsiveImageUrl(
  baseUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpg' | 'png';
  } = {}
) {
  const { width: screenWidth } = useResponsive();
  
  // Calculate optimal image size based on screen width
  const getOptimalWidth = () => {
    if (options.width) return options.width;
    
    // Use device pixel ratio for high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    return Math.min(screenWidth * dpr, 2048); // Cap at 2048px
  };

  const generateUrl = (format?: string) => {
    const params = new URLSearchParams();
    params.set('w', getOptimalWidth().toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (format) params.set('f', format);
    
    return `${baseUrl}?${params.toString()}`;
  };

  return {
    src: generateUrl(),
    webpSrc: generateUrl('webp'),
    avifSrc: generateUrl('avif'),
  };
}