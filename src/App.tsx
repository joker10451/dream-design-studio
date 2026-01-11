import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AffiliateTracker } from "@/components/affiliate/AffiliateTracker";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { createLazyRoute } from "@/components/ui/lazy-component";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load all route components for better performance
const Index = createLazyRoute(() => import("./pages/Index"));
const Catalog = createLazyRoute(() => import("./pages/Catalog"));
const Calculator = createLazyRoute(() => import("./pages/Calculator"));
const Search = createLazyRoute(() => import("./pages/Search"));
const Analytics = createLazyRoute(() => import("./pages/Analytics"));
const ManageSubscription = createLazyRoute(() => import("./pages/ManageSubscription"));
const Unsubscribe = createLazyRoute(() => import("./pages/Unsubscribe"));
const AffiliatePolicy = createLazyRoute(() => import("./pages/AffiliatePolicy"));
const NotFound = createLazyRoute(() => import("./pages/NotFound"));

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AnalyticsProvider>
        <AffiliateTracker>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/search" element={<Search />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/manage-subscription" element={<ManageSubscription />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/affiliate-policy" element={<AffiliatePolicy />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <PerformanceMonitor />
        </AffiliateTracker>
      </AnalyticsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
