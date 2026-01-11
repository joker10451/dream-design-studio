export interface AnalyticsEvent {
  name: string;
  parameters?: Record<string, any>;
  timestamp?: Date;
}

export interface PageViewEvent extends AnalyticsEvent {
  name: 'page_view';
  parameters: {
    page_title: string;
    page_location: string;
    page_path: string;
  };
}

export interface ProductViewEvent extends AnalyticsEvent {
  name: 'view_item';
  parameters: {
    item_id: string;
    item_name: string;
    item_category: string;
    price: number;
    currency: string;
  };
}

export interface AffiliateClickEvent extends AnalyticsEvent {
  name: 'affiliate_click';
  parameters: {
    item_id: string;
    item_name: string;
    marketplace: string;
    price: number;
    currency: string;
    affiliate_url: string;
  };
}

export interface SearchEvent extends AnalyticsEvent {
  name: 'search';
  parameters: {
    search_term: string;
    results_count: number;
  };
}

export interface NewsletterEvent extends AnalyticsEvent {
  name: 'newsletter_signup';
  parameters: {
    method: string;
    location: string;
  };
}

export interface SocialShareEvent extends AnalyticsEvent {
  name: 'share';
  parameters: {
    method: string;
    content_type: string;
    item_id: string;
  };
}

export interface CalculatorEvent extends AnalyticsEvent {
  name: 'calculator_use';
  parameters: {
    total_cost: number;
    items_count: number;
    currency: string;
  };
}

export interface ConversionEvent extends AnalyticsEvent {
  name: 'conversion';
  parameters: {
    transaction_id: string;
    value: number;
    currency: string;
    items: Array<{
      item_id: string;
      item_name: string;
      price: number;
      quantity: number;
    }>;
  };
}

export interface AnalyticsConfig {
  googleAnalyticsId?: string;
  yandexMetricaId?: string;
  enableGoogleAnalytics: boolean;
  enableYandexMetrica: boolean;
  enableCookieConsent: boolean;
  debugMode: boolean;
}

export interface CookieConsent {
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp: Date;
}

export interface AnalyticsProvider {
  initialize(config: AnalyticsConfig): Promise<void>;
  trackEvent(event: AnalyticsEvent): void;
  trackPageView(event: PageViewEvent): void;
  setUserProperties(properties: Record<string, any>): void;
  setConsent(consent: CookieConsent): void;
}