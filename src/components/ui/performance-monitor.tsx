import React, { useState } from 'react';
import { usePerformance, getCoreWebVitalsScore, useResourceTiming } from '@/hooks/usePerformance';
import { useResponsive } from '@/hooks/useResponsive';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Monitor, Smartphone, Tablet, Wifi, WifiOff } from 'lucide-react';

interface PerformanceMonitorProps {
  show?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  show = process.env.NODE_ENV === 'development' 
}) => {
  const { metrics, isLoading } = usePerformance();
  const { resources, slowResources, totalResourceSize, resourceCount } = useResourceTiming();
  const { isMobile, isTablet, isDesktop, width, height, orientation } = useResponsive();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!show) return null;

  const scores = getCoreWebVitalsScore(metrics);

  const getScoreBadgeVariant = (score: string) => {
    switch (score) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (time: number) => {
    return `${Math.round(time)}ms`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-background/95 backdrop-blur-sm border shadow-lg">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-2 cursor-pointer">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {isMobile && <Smartphone className="h-4 w-4" />}
                  {isTablet && <Tablet className="h-4 w-4" />}
                  {isDesktop && <Monitor className="h-4 w-4" />}
                  Performance
                  {isOnline ? (
                    <Wifi className="h-3 w-3 text-green-500" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-red-500" />
                  )}
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-3">
              {/* Device Info */}
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Screen:</span>
                  <span>{width}×{height} ({orientation})</span>
                </div>
                <div className="flex justify-between">
                  <span>Device:</span>
                  <span>
                    {isMobile && 'Mobile'}
                    {isTablet && 'Tablet'}
                    {isDesktop && 'Desktop'}
                  </span>
                </div>
              </div>

              {/* Core Web Vitals */}
              {!isLoading && (
                <div className="space-y-2">
                  <h4 className="text-xs font-medium">Core Web Vitals</h4>
                  <div className="grid grid-cols-3 gap-1 text-xs">
                    <div className="text-center">
                      <Badge variant={getScoreBadgeVariant(scores.lcp)} className="text-xs">
                        LCP
                      </Badge>
                      <div className="mt-1">
                        {metrics.largestContentfulPaint ? formatTime(metrics.largestContentfulPaint) : 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant={getScoreBadgeVariant(scores.fid)} className="text-xs">
                        FID
                      </Badge>
                      <div className="mt-1">
                        {metrics.firstInputDelay ? formatTime(metrics.firstInputDelay) : 'N/A'}
                      </div>
                    </div>
                    <div className="text-center">
                      <Badge variant={getScoreBadgeVariant(scores.cls)} className="text-xs">
                        CLS
                      </Badge>
                      <div className="mt-1">
                        {metrics.cumulativeLayoutShift ? metrics.cumulativeLayoutShift.toFixed(3) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Resource Info */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Resources:</span>
                  <span>{resourceCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Size:</span>
                  <span>{formatBytes(totalResourceSize)}</span>
                </div>
                {slowResources.length > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Slow Resources:</span>
                    <span>{slowResources.length}</span>
                  </div>
                )}
              </div>

              {/* Load Times */}
              {metrics.loadTime !== undefined && (
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span>Load Time:</span>
                    <span>{formatTime(metrics.loadTime)}</span>
                  </div>
                  {metrics.domContentLoaded !== undefined && (
                    <div className="flex justify-between">
                      <span>DOM Ready:</span>
                      <span>{formatTime(metrics.domContentLoaded)}</span>
                    </div>
                  )}
                  {metrics.firstContentfulPaint !== undefined && (
                    <div className="flex justify-between">
                      <span>FCP:</span>
                      <span>{formatTime(metrics.firstContentfulPaint)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-6"
                  onClick={() => window.location.reload()}
                >
                  Reload
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-6"
                  onClick={() => {
                    if ('caches' in window) {
                      caches.keys().then(names => {
                        names.forEach(name => caches.delete(name));
                      }).then(() => window.location.reload());
                    }
                  }}
                >
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
};