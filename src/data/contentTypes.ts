// Дополнительные типы для контент-системы

// Типы для поиска и фильтрации контента
export interface ContentSearchFilters {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
  contentType?: 'article' | 'news' | 'rating';
  status?: 'draft' | 'published' | 'archived';
}

export interface ContentSearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'article' | 'news' | 'rating';
  url: string;
  publishedAt: Date;
  author: string;
  category: string;
  tags: string[];
  relevanceScore: number;
  highlightedText?: string;
}

// Типы для пагинации
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: 'publishedAt' | 'updatedAt' | 'viewsCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Типы для аналитики контента
export interface ContentAnalytics {
  contentId: string;
  contentType: 'article' | 'news' | 'rating';
  views: number;
  uniqueViews: number;
  shares: number;
  likes: number;
  comments: number;
  averageReadTime: number; // в секундах
  bounceRate: number; // процент отказов
  conversionRate: number; // процент кликов по партнерским ссылкам
  topReferrers: string[];
  popularSections: string[]; // какие разделы статьи читают чаще
  lastUpdated: Date;
}

// Типы для комментариев (если будут добавлены в будущем)
export interface Comment {
  id: string;
  contentId: string;
  contentType: 'article' | 'news' | 'rating';
  author: {
    name: string;
    email?: string;
    avatar?: string;
  };
  content: string;
  publishedAt: Date;
  parentId?: string; // для вложенных комментариев
  status: 'pending' | 'approved' | 'rejected';
  likes: number;
  dislikes: number;
}

// Типы для уведомлений и подписок
export interface ContentSubscription {
  id: string;
  email: string;
  subscriptionType: 'all' | 'category' | 'author' | 'tag';
  targetId?: string; // ID категории, автора или тега
  isActive: boolean;
  createdAt: Date;
  lastNotified?: Date;
}

export interface ContentNotification {
  id: string;
  subscriptionId: string;
  contentId: string;
  contentType: 'article' | 'news' | 'rating';
  title: string;
  excerpt: string;
  sentAt: Date;
  status: 'pending' | 'sent' | 'failed';
}

// Типы для модерации контента
export interface ContentModerationFlag {
  id: string;
  contentId: string;
  contentType: 'article' | 'news' | 'rating' | 'comment';
  reason: 'spam' | 'inappropriate' | 'copyright' | 'misinformation' | 'other';
  description?: string;
  reportedBy?: string;
  reportedAt: Date;
  status: 'pending' | 'reviewed' | 'resolved';
  moderatorNotes?: string;
}

// Типы для SEO и структурированных данных
export interface StructuredData {
  '@context': string;
  '@type': string;
  headline: string;
  description: string;
  image?: string[];
  datePublished: string;
  dateModified?: string;
  author: {
    '@type': 'Person';
    name: string;
    url?: string;
  };
  publisher: {
    '@type': 'Organization';
    name: string;
    logo: {
      '@type': 'ImageObject';
      url: string;
    };
  };
  mainEntityOfPage: {
    '@type': 'WebPage';
    '@id': string;
  };
}

// Типы для экспорта контента
export interface ContentExportOptions {
  format: 'json' | 'xml' | 'csv' | 'markdown';
  includeMetadata: boolean;
  includeAnalytics: boolean;
  dateRange?: {
    from: Date;
    to: Date;
  };
  categories?: string[];
  authors?: string[];
}

export interface ContentImportOptions {
  format: 'json' | 'xml' | 'markdown' | 'wordpress';
  overwriteExisting: boolean;
  preserveIds: boolean;
  defaultAuthor?: string;
  defaultCategory?: string;
  defaultStatus?: 'draft' | 'published';
}

// Типы для кеширования
export interface ContentCacheConfig {
  ttl: number; // время жизни в секундах
  tags: string[]; // теги для инвалидации кеша
  compression: boolean;
  version: string;
}

export interface CachedContent<T> {
  data: T;
  cachedAt: Date;
  expiresAt: Date;
  tags: string[];
  version: string;
}

// Типы для API ответов
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: Date;
    requestId: string;
    version: string;
  };
}

// Типы для валидации контента
export interface ContentValidationRule {
  field: string;
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

export interface ContentValidationResult {
  isValid: boolean;
  errors: {
    field: string;
    message: string;
  }[];
  warnings: {
    field: string;
    message: string;
  }[];
}

// Типы для версионирования контента
export interface ContentVersion {
  id: string;
  contentId: string;
  version: number;
  title: string;
  content: string;
  changes: string; // описание изменений
  createdAt: Date;
  createdBy: string;
  isPublished: boolean;
}

export interface ContentDiff {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

// Типы для планирования публикаций
export interface ScheduledPublication {
  id: string;
  contentId: string;
  contentType: 'article' | 'news' | 'rating';
  scheduledAt: Date;
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  createdAt: Date;
  createdBy: string;
  publishedAt?: Date;
  errorMessage?: string;
}

// Типы для A/B тестирования контента
export interface ContentABTest {
  id: string;
  name: string;
  description: string;
  contentId: string;
  variants: {
    id: string;
    name: string;
    title?: string;
    excerpt?: string;
    featuredImage?: string;
    weight: number; // процент трафика
  }[];
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'completed' | 'paused';
  metrics: {
    variantId: string;
    views: number;
    clicks: number;
    conversions: number;
    conversionRate: number;
  }[];
}

// Типы для интеграции с внешними сервисами
export interface ExternalServiceConfig {
  name: string;
  type: 'analytics' | 'social' | 'email' | 'seo' | 'cdn';
  enabled: boolean;
  apiKey?: string;
  settings: Record<string, any>;
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error';
}

// Типы для мультиязычности (на будущее)
export interface ContentTranslation {
  id: string;
  contentId: string;
  language: string;
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published' | 'outdated';
  translatedAt: Date;
  translatedBy?: string;
  isAutoTranslated: boolean;
}

export interface LanguageConfig {
  code: string; // ru, en, etc.
  name: string;
  nativeName: string;
  isDefault: boolean;
  isEnabled: boolean;
  direction: 'ltr' | 'rtl';
  dateFormat: string;
  numberFormat: string;
}