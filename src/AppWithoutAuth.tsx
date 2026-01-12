import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AffiliateTracker } from "@/components/affiliate/AffiliateTracker";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Временно импортируем компоненты напрямую без lazy loading
import Index from "./pages/Index";
import { SimpleTestPage } from "./pages/SimpleTestPage";
import { SimpleAuthPage } from "./pages/auth/SimpleAuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const PageLoadingFallback = () => (
  <div className="min-h-screen flex flex-col">
    <Skeleton className="h-16 w-full" />
    <div className="flex-1 p-6 space-y-4">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  </div>
);

const AppWithoutAuth = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AnalyticsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AffiliateTracker>
                <Suspense fallback={<PageLoadingFallback />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/simple-test" element={<SimpleTestPage />} />
                    <Route path="/simple-auth" element={<SimpleAuthPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
                <PerformanceMonitor />
              </AffiliateTracker>
            </BrowserRouter>
          </AnalyticsProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default AppWithoutAuth;