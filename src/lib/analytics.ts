import { 
  AnalyticsEvent, 
  PageViewEvent, 
  AnalyticsConfig, 
  CookieConsent, 
  AnalyticsProvider 
} from '@/types/analytics';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
    ym?: (id: number, method: string, ...args: any[]) => void;
  }
}

class GoogleAnalyticsProvider implements AnalyticsProvider {
  private config: AnalyticsConfig | null = null;
  private initialized = false;

  async initialize(config: AnalyticsConfig): Promise<void> {
    if (!config.googleAnalyticsId || !config.enableGoogleAnalytics) {
      return;
    }

    this.config = config;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalyticsId}`;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer!.push(args);
    };

    window.gtag('js', new Date());
    window.gtag('config', config.googleAnalyticsId, {
      debug_mode: config.debugMode,
      send_page_view: false, // We'll handle page views manually
    });

    this.initialized = true;
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', event.name, event.parameters);
  }

  trackPageView(event: PageViewEvent): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('config', this.config!.googleAnalyticsId!, {
      page_title: event.parameters.page_title,
      page_location: event.parameters.page_location,
      page_path: event.parameters.page_path,
    });
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('config', this.config!.googleAnalyticsId!, {
      user_properties: properties,
    });
  }

  setConsent(consent: CookieConsent): void {
    if (!this.initialized || !window.gtag) return;

    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      functionality_storage: consent.functional ? 'granted' : 'denied',
    });
  }
}

class YandexMetricaProvider implements AnalyticsProvider {
  private config: AnalyticsConfig | null = null;
  private initialized = false;

  async initialize(config: AnalyticsConfig): Promise<void> {
    if (!config.yandexMetricaId || !config.enableYandexMetrica) {
      return;
    }

    this.config = config;

    // Load Yandex Metrica script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
      m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
      (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

      ym(${config.yandexMetricaId}, "init", {
        clickmap:true,
        trackLinks:true,
        accurateTrackBounce:true,
        webvisor:${config.debugMode}
      });
    `;
    document.head.appendChild(script);

    // Add noscript tag
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${config.yandexMetricaId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
    document.body.appendChild(noscript);

    this.initialized = true;
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.initialized || !window.ym || !this.config) return;

    window.ym(this.config.yandexMetricaId!, 'reachGoal', event.name, event.parameters);
  }

  trackPageView(event: PageViewEvent): void {
    if (!this.initialized || !window.ym || !this.config) return;

    window.ym(this.config.yandexMetricaId!, 'hit', event.parameters.page_path, {
      title: event.parameters.page_title,
      referer: document.referrer,
    });
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.initialized || !window.ym || !this.config) return;

    window.ym(this.config.yandexMetricaId!, 'userParams', properties);
  }

  setConsent(consent: CookieConsent): void {
    // Yandex Metrica doesn't have built-in consent management like GA4
    // We handle this by not initializing if consent is not given
    if (!consent.analytics && this.initialized) {
      console.warn('Yandex Metrica: Analytics consent withdrawn');
    }
  }
}

class AnalyticsService {
  private providers: AnalyticsProvider[] = [];
  private config: AnalyticsConfig | null = null;
  private consent: CookieConsent | null = null;

  async initialize(config: AnalyticsConfig): Promise<void> {
    this.config = config;
    
    // Initialize providers
    const googleProvider = new GoogleAnalyticsProvider();
    const yandexProvider = new YandexMetricaProvider();

    await Promise.all([
      googleProvider.initialize(config),
      yandexProvider.initialize(config),
    ]);

    this.providers = [googleProvider, yandexProvider];

    // Set default consent if cookie consent is disabled
    if (!config.enableCookieConsent) {
      this.consent = {
        analytics: true,
        marketing: true,
        functional: true,
        timestamp: new Date(),
      };
      this.updateConsent(this.consent);
    }
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.canTrack()) return;

    this.providers.forEach(provider => {
      try {
        provider.trackEvent(event);
      } catch (error) {
        console.error('Analytics tracking error:', error);
      }
    });
  }

  trackPageView(path: string, title?: string): void {
    if (!this.canTrack()) return;

    const event: PageViewEvent = {
      name: 'page_view',
      parameters: {
        page_title: title || document.title,
        page_location: window.location.href,
        page_path: path,
      },
    };

    this.providers.forEach(provider => {
      try {
        provider.trackPageView(event);
      } catch (error) {
        console.error('Analytics page view error:', error);
      }
    });
  }

  setUserProperties(properties: Record<string, any>): void {
    if (!this.canTrack()) return;

    this.providers.forEach(provider => {
      try {
        provider.setUserProperties(properties);
      } catch (error) {
        console.error('Analytics user properties error:', error);
      }
    });
  }

  updateConsent(consent: CookieConsent): void {
    this.consent = consent;
    
    this.providers.forEach(provider => {
      try {
        provider.setConsent(consent);
      } catch (error) {
        console.error('Analytics consent error:', error);
      }
    });

    // Store consent in localStorage
    localStorage.setItem('analytics_consent', JSON.stringify(consent));
  }

  getConsent(): CookieConsent | null {
    if (this.consent) return this.consent;

    // Try to load from localStorage
    try {
      const stored = localStorage.getItem('analytics_consent');
      if (stored) {
        const consent = JSON.parse(stored);
        consent.timestamp = new Date(consent.timestamp);
        return consent;
      }
    } catch (error) {
      console.error('Error loading consent from storage:', error);
    }

    return null;
  }

  private canTrack(): boolean {
    if (!this.config?.enableCookieConsent) return true;
    return this.consent?.analytics === true;
  }

  // Convenience methods for common events
  trackProductView(productId: string, productName: string, category: string, price: number): void {
    this.trackEvent({
      name: 'view_item',
      parameters: {
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price,
        currency: 'RUB',
      },
    });
  }

  trackAffiliateClick(productId: string, productName: string, marketplace: string, price: number, url: string): void {
    this.trackEvent({
      name: 'affiliate_click',
      parameters: {
        item_id: productId,
        item_name: productName,
        marketplace: marketplace,
        price: price,
        currency: 'RUB',
        affiliate_url: url,
      },
    });
  }

  trackSearch(searchTerm: string, resultsCount: number): void {
    this.trackEvent({
      name: 'search',
      parameters: {
        search_term: searchTerm,
        results_count: resultsCount,
      },
    });
  }

  trackNewsletterSignup(method: string, location: string): void {
    this.trackEvent({
      name: 'newsletter_signup',
      parameters: {
        method: method,
        location: location,
      },
    });
  }

  trackSocialShare(method: string, contentType: string, itemId: string): void {
    this.trackEvent({
      name: 'share',
      parameters: {
        method: method,
        content_type: contentType,
        item_id: itemId,
      },
    });
  }

  trackCalculatorUse(totalCost: number, itemsCount: number): void {
    this.trackEvent({
      name: 'calculator_use',
      parameters: {
        total_cost: totalCost,
        items_count: itemsCount,
        currency: 'RUB',
      },
    });
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// Default configuration
export const defaultAnalyticsConfig: AnalyticsConfig = {
  googleAnalyticsId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  yandexMetricaId: import.meta.env.VITE_YM_COUNTER_ID ? parseInt(import.meta.env.VITE_YM_COUNTER_ID) : undefined,
  enableGoogleAnalytics: !!import.meta.env.VITE_GA_MEASUREMENT_ID,
  enableYandexMetrica: !!import.meta.env.VITE_YM_COUNTER_ID,
  enableCookieConsent: import.meta.env.VITE_ENABLE_COOKIE_CONSENT === 'true',
  debugMode: import.meta.env.DEV,
};