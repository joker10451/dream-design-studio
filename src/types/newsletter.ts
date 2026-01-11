// Типы для системы подписки на рассылку

export interface Newsletter {
  email: string;
  subscribedAt: Date;
  preferences: NewsletterPreferences;
  isActive: boolean;
  confirmationToken?: string;
  isConfirmed: boolean;
  unsubscribeToken?: string;
}

export interface NewsletterPreferences {
  weeklyDigest: boolean;
  productUpdates: boolean;
  newArticles: boolean;
  specialOffers: boolean;
  newsUpdates: boolean;
  ratingsUpdates: boolean;
}

export interface NewsletterSubscriptionRequest {
  email: string;
  preferences?: Partial<NewsletterPreferences>;
  source?: 'header' | 'footer' | 'article' | 'popup';
}

export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  requiresConfirmation: boolean;
  subscriptionId?: string;
}

export interface NewsletterUnsubscribeRequest {
  email?: string;
  token?: string;
  reason?: string;
}

export interface NewsletterValidationResult {
  isValid: boolean;
  error?: string;
}

export interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribersToday: number;
  newSubscribersThisWeek: number;
  unsubscribesThisWeek: number;
  confirmationRate: number;
  popularPreferences: Record<keyof NewsletterPreferences, number>;
}

// Типы для email кампаний
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  templateId?: string;
  targetAudience: {
    includePreferences?: (keyof NewsletterPreferences)[];
    excludePreferences?: (keyof NewsletterPreferences)[];
    subscribedAfter?: Date;
    subscribedBefore?: Date;
  };
  scheduledAt?: Date;
  sentAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  stats?: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
  };
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[]; // список переменных для подстановки
  category: 'welcome' | 'digest' | 'product' | 'news' | 'promotional';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Типы для интеграции с email сервисами
export interface EmailServiceConfig {
  provider: 'mailchimp' | 'sendgrid' | 'mailgun' | 'custom';
  apiKey: string;
  listId?: string;
  fromEmail: string;
  fromName: string;
  replyToEmail?: string;
  webhookUrl?: string;
  settings: Record<string, unknown>;
}

export interface EmailDeliveryStatus {
  email: string;
  campaignId: string;
  status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained' | 'unsubscribed';
  timestamp: Date;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}

// Типы для автоматических рассылок
export interface AutomatedEmail {
  id: string;
  name: string;
  trigger: {
    type: 'subscription' | 'article_published' | 'product_added' | 'weekly_digest' | 'custom';
    conditions?: Record<string, unknown>;
  };
  delay?: number; // задержка в минутах
  templateId: string;
  isActive: boolean;
  targetPreferences?: (keyof NewsletterPreferences)[];
}

// Типы для аналитики рассылок
export interface NewsletterAnalytics {
  period: {
    from: Date;
    to: Date;
  };
  metrics: {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    unsubscribeRate: number;
    bounceRate: number;
    complaintRate: number;
  };
  topPerformingCampaigns: {
    campaignId: string;
    name: string;
    openRate: number;
    clickRate: number;
  }[];
  subscriberGrowth: {
    date: Date;
    newSubscribers: number;
    unsubscribes: number;
    netGrowth: number;
  }[];
  preferenceDistribution: Record<keyof NewsletterPreferences, number>;
}

// Типы для GDPR и согласия
export interface ConsentRecord {
  email: string;
  consentType: 'subscription' | 'marketing' | 'analytics';
  consentGiven: boolean;
  consentDate: Date;
  ipAddress?: string;
  userAgent?: string;
  source: string;
  withdrawnAt?: Date;
}

export interface DataProcessingConsent {
  email: string;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  dataRetentionConsent: boolean;
  consentDate: Date;
  ipAddress?: string;
  source: string;
}