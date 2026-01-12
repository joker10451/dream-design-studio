import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AffiliateTracker } from "@/components/affiliate/AffiliateTracker";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { PerformanceMonitor } from "@/components/ui/performance-monitor";
import { ServiceWorkerUpdate } from "@/components/ui/ServiceWorkerUpdate";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Импортируем страницы
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/ProductPage";
import Blog from "./pages/Blog";
import News from "./pages/News";
import Search from "./pages/Search";
import Ratings from "./pages/Ratings";
import Calculator from "./pages/Calculator";
import { AuthPage } from "./pages/auth/AuthPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { ProfilePage } from "./pages/user/ProfilePage";
import { FavoritesPage } from "./pages/user/FavoritesPage";
import { ShoppingListsPage } from "./pages/user/ShoppingListsPage";
import { ShoppingListDetailsPage } from "./pages/user/ShoppingListDetailsPage";
import Guides from "./pages/Guides";
import RSSFeeds from "./pages/RSSFeeds";
import AffiliatePolicy from "./pages/AffiliatePolicy";
import ManageSubscription from "./pages/ManageSubscription";
import Unsubscribe from "./pages/Unsubscribe";
import Analytics from "./pages/Analytics";
import AdminPage from "./pages/admin/AdminPage";
import NotFound from "./pages/NotFound";

// Тестовые страницы
import SimpleIndex from "./pages/SimpleIndex";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

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
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <AnalyticsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AffiliateTracker>
                <ErrorBoundary>
                  <Suspense fallback={<PageLoadingFallback />}>
                    <Routes>
                      {/* Main Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/simple" element={<SimpleIndex />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/news" element={<News />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/ratings" element={<Ratings />} />
                      <Route path="/calculator" element={<Calculator />} />
                      <Route path="/guides" element={<Guides />} />
                      <Route path="/rss" element={<RSSFeeds />} />
                      <Route path="/affiliate-policy" element={<AffiliatePolicy />} />
                      <Route path="/manage-subscription" element={<ManageSubscription />} />
                      <Route path="/unsubscribe" element={<Unsubscribe />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/admin" element={<AdminPage />} />

                      {/* Auth Routes */}
                      <Route path="/auth/login" element={<AuthPage />} />
                      <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                      <Route path="/auth" element={<Navigate to="/auth/login" replace />} />

                      {/* User Routes */}
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/user/profile" element={<Navigate to="/profile" replace />} />
                      <Route path="/user/favorites" element={<FavoritesPage />} />
                      <Route path="/user/shopping-lists" element={<ShoppingListsPage />} />
                      <Route path="/user/shopping-lists/:listId" element={<ShoppingListDetailsPage />} />

                      {/* Fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
                <PerformanceMonitor />
                <ServiceWorkerUpdate />
              </AffiliateTracker>
            </BrowserRouter>
          </AnalyticsProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
