import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '@/lib/analytics';
import { CookieConsent } from '@/types/analytics';

export function useAnalytics() {
  let location;
  
  try {
    location = useLocation();
  } catch (error) {
    // useLocation is not available outside of Router context
    location = null;
  }

  // Track page views automatically
  useEffect(() => {
    if (location) {
      const path = location.pathname + location.search;
      analytics.trackPageView(path);
    }
  }, [location]);

  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    analytics.trackEvent({
      name: eventName,
      parameters,
      timestamp: new Date(),
    });
  }, []);

  const trackProductView = useCallback((productId: string, productName: string, category: string, price: number) => {
    analytics.trackProductView(productId, productName, category, price);
  }, []);

  const trackAffiliateClick = useCallback((productId: string, productName: string, marketplace: string, price: number, url: string) => {
    analytics.trackAffiliateClick(productId, productName, marketplace, price, url);
  }, []);

  const trackSearch = useCallback((searchTerm: string, resultsCount: number) => {
    analytics.trackSearch(searchTerm, resultsCount);
  }, []);

  const trackNewsletterSignup = useCallback((method: string, location: string) => {
    analytics.trackNewsletterSignup(method, location);
  }, []);

  const trackSocialShare = useCallback((method: string, contentType: string, itemId: string) => {
    analytics.trackSocialShare(method, contentType, itemId);
  }, []);

  const trackCalculatorUse = useCallback((totalCost: number, itemsCount: number) => {
    analytics.trackCalculatorUse(totalCost, itemsCount);
  }, []);

  const setUserProperties = useCallback((properties: Record<string, any>) => {
    analytics.setUserProperties(properties);
  }, []);

  const updateConsent = useCallback((consent: CookieConsent) => {
    analytics.updateConsent(consent);
  }, []);

  const getConsent = useCallback(() => {
    return analytics.getConsent();
  }, []);

  return {
    trackEvent,
    trackProductView,
    trackAffiliateClick,
    trackSearch,
    trackNewsletterSignup,
    trackSocialShare,
    trackCalculatorUse,
    setUserProperties,
    updateConsent,
    getConsent,
  };
}