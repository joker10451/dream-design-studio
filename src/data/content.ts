import { SEOMeta, AffiliateLink } from './products';

// Базовые интерфейсы для контент-системы

export interface Author {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  email?: string;
  socialLinks?: {
    telegram?: string;
    vk?: string;
    website?: string;
  };
}

export interface ContentTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId?: string;
  icon?: string;
  color?: string;
  seoMeta?: SEOMeta;
}

// Интерфейс для статей и гайдов
export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: ArticleCategory;
  tags: ContentTag[];
  publishedAt: Date;
  updatedAt?: Date;
  author: Author;
  featuredImage?: string;
  images?: string[];
  readingTime: number; // в минутах
  status: 'draft' | 'published' | 'archived';
  
  // SEO и метаданные
  seoMeta: SEOMeta;
  
  // Связанный контент
  relatedArticles: string[]; // ID связанных статей
  relatedProducts: string[]; // ID связанных продуктов
  
  // Партнерские ссылки в контенте
  affiliateLinks: AffiliateLink[];
  
  // Структурированный контент
  tableOfContents?: TableOfContentsItem[];
  faqSection?: FAQItem[];
  
  // Аналитика
  viewsCount?: number;
  sharesCount?: number;
  likesCount?: number;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number; // 1-6 для h1-h6
  anchor: string;
  children?: TableOfContentsItem[];
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

// Интерфейс для новостей
export interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: Date;
  updatedAt?: Date;
  author: Author;
  
  // Изображения
  featuredImage?: string;
  images?: string[];
  
  // Категоризация
  category: 'industry' | 'products' | 'reviews' | 'events' | 'technology';
  tags: ContentTag[];
  
  // Приоритет новости
  priority: 'low' | 'normal' | 'high' | 'urgent';
  
  // SEO
  seoMeta: SEOMeta;
  
  // Связанный контент
  relatedNews: string[];
  relatedProducts: string[];
  relatedArticles: string[];
  
  // Источники
  sources?: NewsSource[];
  
  // Аналитика
  viewsCount?: number;
  sharesCount?: number;
}

export interface NewsSource {
  name: string;
  url: string;
  publishedAt?: Date;
}

// Интерфейс для рейтингов
export interface Rating {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string; // категория устройств для рейтинга
  publishedAt: Date;
  updatedAt?: Date;
  author: Author;
  
  // Продукты в рейтинге
  products: RatedProduct[];
  
  // Критерии оценки
  criteria: RatingCriteria[];
  
  // Методология
  methodology?: string;
  
  // SEO
  seoMeta: SEOMeta;
  
  // Связанный контент
  relatedRatings: string[];
  relatedArticles: string[];
  
  // Изображения
  featuredImage?: string;
  
  // Аналитика
  viewsCount?: number;
  sharesCount?: number;
}

export interface RatedProduct {
  productId: string;
  rank: number;
  score: number; // общий балл 0-100
  scores: { [criteriaId: string]: number }; // баллы по критериям
  pros: string[];
  cons: string[];
  verdict: string;
  priceAtReview?: number;
  reviewDate: Date;
}

export interface RatingCriteria {
  id: string;
  name: string;
  description: string;
  weight: number; // вес критерия в общей оценке (0-1)
  maxScore: number; // максимальный балл
}

// Интерфейсы для социального шаринга
export interface SocialShareConfig {
  platform: 'vk' | 'telegram' | 'whatsapp' | 'twitter' | 'facebook';
  enabled: boolean;
  customText?: string;
}

export interface SocialShareData {
  url: string;
  title: string;
  description: string;
  image?: string;
  hashtags?: string[];
}

// Интерфейс для внутренней перелинковки
export interface InternalLink {
  id: string;
  sourceType: 'article' | 'news' | 'rating';
  sourceId: string;
  targetType: 'article' | 'news' | 'rating' | 'product';
  targetId: string;
  anchorText: string;
  context?: string; // контекст, в котором появляется ссылка
  createdAt: Date;
}

// Интерфейс для RSS фида
export interface RSSFeedConfig {
  title: string;
  description: string;
  link: string;
  language: string;
  copyright: string;
  managingEditor: string;
  webMaster: string;
  categories: string[];
  ttl: number; // время жизни кеша в минутах
}

export interface RSSItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: Date;
  category?: string;
  author?: string;
  enclosure?: {
    url: string;
    type: string;
    length: number;
  };
}

// Константы для категорий статей
export const ARTICLE_CATEGORIES: ArticleCategory[] = [
  {
    id: 'guides',
    name: 'Гайды',
    slug: 'guides',
    description: 'Подробные руководства по выбору и настройке устройств умного дома',
    icon: 'BookOpen',
    color: '#3B82F6',
    seoMeta: {
      title: 'Гайды по умному дому - Smart Home 2026',
      description: 'Подробные руководства по выбору, установке и настройке устройств умного дома. Экспертные советы и рекомендации.',
      keywords: ['гайды умный дом', 'руководства iot', 'настройка умного дома', 'выбор устройств']
    }
  },
  {
    id: 'reviews',
    name: 'Обзоры',
    slug: 'reviews',
    description: 'Детальные обзоры устройств умного дома с тестированием',
    icon: 'Star',
    color: '#10B981',
    seoMeta: {
      title: 'Обзоры устройств умного дома - Smart Home 2026',
      description: 'Честные и подробные обзоры устройств умного дома. Тестирование, сравнения, плюсы и минусы.',
      keywords: ['обзоры умный дом', 'тесты iot устройств', 'сравнение умных устройств', 'отзывы']
    }
  },
  {
    id: 'tutorials',
    name: 'Инструкции',
    slug: 'tutorials',
    description: 'Пошаговые инструкции по установке и настройке',
    icon: 'Settings',
    color: '#F59E0B',
    seoMeta: {
      title: 'Инструкции по умному дому - Smart Home 2026',
      description: 'Пошаговые инструкции по установке, настройке и использованию устройств умного дома.',
      keywords: ['инструкции умный дом', 'установка iot', 'настройка умных устройств', 'как подключить']
    }
  },
  {
    id: 'comparisons',
    name: 'Сравнения',
    slug: 'comparisons',
    description: 'Сравнительные обзоры похожих устройств',
    icon: 'GitCompare',
    color: '#8B5CF6',
    seoMeta: {
      title: 'Сравнения устройств умного дома - Smart Home 2026',
      description: 'Детальные сравнения устройств умного дома. Что выбрать и почему. Сравнительные таблицы и рекомендации.',
      keywords: ['сравнение умных устройств', 'что лучше выбрать', 'сравнительные обзоры', 'vs']
    }
  }
];

// Константы для тегов
export const COMMON_TAGS: ContentTag[] = [
  { id: 'beginner', name: 'Для новичков', slug: 'beginner', color: '#10B981' },
  { id: 'advanced', name: 'Продвинутый', slug: 'advanced', color: '#F59E0B' },
  { id: 'budget', name: 'Бюджетно', slug: 'budget', color: '#3B82F6' },
  { id: 'premium', name: 'Премиум', slug: 'premium', color: '#8B5CF6' },
  { id: 'diy', name: 'Своими руками', slug: 'diy', color: '#EF4444' },
  { id: 'security', name: 'Безопасность', slug: 'security', color: '#DC2626' },
  { id: 'energy', name: 'Энергосбережение', slug: 'energy', color: '#059669' },
  { id: 'automation', name: 'Автоматизация', slug: 'automation', color: '#7C3AED' },
  { id: 'voice-control', name: 'Голосовое управление', slug: 'voice-control', color: '#0891B2' },
  { id: 'mobile-app', name: 'Мобильное приложение', slug: 'mobile-app', color: '#0D9488' }
];

// Константы для авторов
export const AUTHORS: Author[] = [
  {
    id: 'expert1',
    name: 'Алексей Смирнов',
    bio: 'Эксперт по умному дому с 8-летним опытом. Специализируется на системах безопасности и автоматизации.',
    avatar: '/images/authors/expert1.jpg',
    email: 'alexey@smarthome2026.ru',
    socialLinks: {
      telegram: '@alexey_smarthome',
      website: 'https://smarthome2026.ru/author/alexey'
    }
  },
  {
    id: 'expert2',
    name: 'Мария Петрова',
    bio: 'Технический писатель и тестировщик IoT устройств. Автор более 200 обзоров умных устройств.',
    avatar: '/images/authors/expert2.jpg',
    email: 'maria@smarthome2026.ru',
    socialLinks: {
      telegram: '@maria_iot',
      vk: 'maria_smarthome'
    }
  }
];