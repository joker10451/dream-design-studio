import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export function usePerformance() {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const newMetrics: Partial<PerformanceMetrics> = {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      };

      // First Contentful Paint
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      if (fcp) {
        newMetrics.firstContentfulPaint = fcp.startTime;
      }

      setMetrics(newMetrics);
      setIsLoading(false);
    };

    // Measure performance after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  useEffect(() => {
    // Measure Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({
          ...prev,
          largestContentfulPaint: lastEntry.startTime,
        }));
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Measure Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        setMetrics(prev => ({
          ...prev,
          cumulativeLayoutShift: clsValue,
        }));
      });

      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }

      // Measure First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          setMetrics(prev => ({
            ...prev,
            firstInputDelay: (entry as any).processingStart - entry.startTime,
          }));
        }
      });

      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      return () => {
        lcpObserver.disconnect();
        clsObserver.disconnect();
        fidObserver.disconnect();
      };
    }
  }, []);

  return { metrics, isLoading };
}

// Utility to get Core Web Vitals scores
export function getCoreWebVitalsScore(metrics: Partial<PerformanceMetrics>) {
  const scores = {
    lcp: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown',
    fid: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown',
    cls: 'unknown' as 'good' | 'needs-improvement' | 'poor' | 'unknown',
  };

  // Largest Contentful Paint scoring
  if (metrics.largestContentfulPaint !== undefined) {
    if (metrics.largestContentfulPaint <= 2500) {
      scores.lcp = 'good';
    } else if (metrics.largestContentfulPaint <= 4000) {
      scores.lcp = 'needs-improvement';
    } else {
      scores.lcp = 'poor';
    }
  }

  // First Input Delay scoring
  if (metrics.firstInputDelay !== undefined) {
    if (metrics.firstInputDelay <= 100) {
      scores.fid = 'good';
    } else if (metrics.firstInputDelay <= 300) {
      scores.fid = 'needs-improvement';
    } else {
      scores.fid = 'poor';
    }
  }

  // Cumulative Layout Shift scoring
  if (metrics.cumulativeLayoutShift !== undefined) {
    if (metrics.cumulativeLayoutShift <= 0.1) {
      scores.cls = 'good';
    } else if (metrics.cumulativeLayoutShift <= 0.25) {
      scores.cls = 'needs-improvement';
    } else {
      scores.cls = 'poor';
    }
  }

  return scores;
}

// Hook for monitoring resource loading
export function useResourceTiming() {
  const [resources, setResources] = useState<PerformanceResourceTiming[]>([]);

  useEffect(() => {
    const updateResources = () => {
      const resourceEntries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      setResources(resourceEntries);
    };

    updateResources();

    // Update resources periodically
    const interval = setInterval(updateResources, 5000);
    return () => clearInterval(interval);
  }, []);

  const slowResources = resources.filter(resource => 
    resource.duration > 1000 // Resources taking more than 1 second
  );

  const totalResourceSize = resources.reduce((total, resource) => 
    total + (resource.transferSize || 0), 0
  );

  return {
    resources,
    slowResources,
    totalResourceSize,
    resourceCount: resources.length,
  };
}