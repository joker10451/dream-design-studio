import { useEffect, useState, ReactNode } from 'react';
import { analytics, defaultAnalyticsConfig } from '@/lib/analytics';
import { CookieConsent } from './CookieConsent';
import { CookieConsent as CookieConsentType } from '@/types/analytics';

interface AnalyticsProviderProps {
  children: ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);

  useEffect(() => {
    const initializeAnalytics = async () => {
      try {
        await analytics.initialize(defaultAnalyticsConfig);
        setIsInitialized(true);

        // Check if we need to show cookie consent
        if (defaultAnalyticsConfig.enableCookieConsent) {
          const existingConsent = analytics.getConsent();
          if (!existingConsent) {
            setShowCookieConsent(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize analytics:', error);
        setIsInitialized(true); // Continue even if analytics fails
      }
    };

    initializeAnalytics();
  }, []);

  const handleConsentChange = (consent: CookieConsentType) => {
    setShowCookieConsent(false);
    
    // Track consent decision
    analytics.trackEvent({
      name: 'cookie_consent',
      parameters: {
        analytics_consent: consent.analytics,
        marketing_consent: consent.marketing,
        functional_consent: consent.functional,
      },
    });
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {children}
      {showCookieConsent && (
        <CookieConsent onConsentChange={handleConsentChange} />
      )}
    </>
  );
}