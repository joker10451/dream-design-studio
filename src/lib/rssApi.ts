import { 
  generateRSSFeed, 
  generateNewsRSSFeed, 
  generateArticlesRSSFeed, 
  generateRatingsRSSFeed,
  getCachedRSSFeed,
  validateRSSFeed
} from './rssGenerator';
import { mockArticles, mockNews, mockRatings } from '@/data/mockContent';
import { Article, NewsItem, Rating } from '@/data/content';

// Интерфейсы для API
export interface RSSFeedOptions {
  limit?: number;
  category?: string;
  author?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface RSSFeedResponse {
  success: boolean;
  content?: string;
  contentType?: string;
  lastModified?: Date;
  error?: string;
  validation?: {
    isValid: boolean;
    errors: string[];
  };
}

// Фильтрация контента по опциям
const filterArticles = (articles: Article[], options: RSSFeedOptions): Article[] => {
  let filtered = [...articles];
  
  if (options.category) {
    filtered = filtered.filter(article => 
      article.category.slug === options.category || 
      article.category.name.toLowerCase().includes(options.category.toLowerCase())
    );
  }
  
  if (options.author) {
    filtered = filtered.filter(article => 
      article.author.name.toLowerCase().includes(options.author.toLowerCase()) ||
      article.author.id === options.author
    );
  }
  
  if (options.dateFrom) {
    filtered = filtered.filter(article => article.publishedAt >= options.dateFrom!);
  }
  
  if (options.dateTo) {
    filtered = filtered.filter(article => article.publishedAt <= options.dateTo!);
  }
  
  // Сортируем по дате публикации (новые первыми)
  filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
};

const filterNews = (news: NewsItem[], options: RSSFeedOptions): NewsItem[] => {
  let filtered = [...news];
  
  if (options.category) {
    filtered = filtered.filter(item => 
      item.category === options.category ||
      item.tags.some(tag => tag.slug === options.category)
    );
  }
  
  if (options.author) {
    filtered = filtered.filter(item => 
      item.author.name.toLowerCase().includes(options.author.toLowerCase()) ||
      item.author.id === options.author
    );
  }
  
  if (options.dateFrom) {
    filtered = filtered.filter(item => item.publishedAt >= options.dateFrom!);
  }
  
  if (options.dateTo) {
    filtered = filtered.filter(item => item.publishedAt <= options.dateTo!);
  }
  
  // Сортируем по дате публикации (новые первыми)
  filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
};

const filterRatings = (ratings: Rating[], options: RSSFeedOptions): Rating[] => {
  let filtered = [...ratings];
  
  if (options.category) {
    filtered = filtered.filter(rating => 
      rating.category === options.category ||
      rating.title.toLowerCase().includes(options.category.toLowerCase())
    );
  }
  
  if (options.author) {
    filtered = filtered.filter(rating => 
      rating.author.name.toLowerCase().includes(options.author.toLowerCase()) ||
      rating.author.id === options.author
    );
  }
  
  if (options.dateFrom) {
    filtered = filtered.filter(rating => rating.publishedAt >= options.dateFrom!);
  }
  
  if (options.dateTo) {
    filtered = filtered.filter(rating => rating.publishedAt <= options.dateTo!);
  }
  
  // Сортируем по дате публикации (новые первыми)
  filtered.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
  
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  
  return filtered;
};

// API функции для генерации RSS фидов

/**
 * Генерирует основной RSS фид со всем контентом
 */
export const getMainRSSFeed = async (options: RSSFeedOptions = {}): Promise<RSSFeedResponse> => {
  try {
    const cacheKey = `main-rss-${JSON.stringify(options)}`;
    
    const content = getCachedRSSFeed(cacheKey, () => {
      const articles = filterArticles(mockArticles, options);
      const news = filterNews(mockNews, options);
      const ratings = filterRatings(mockRatings, options);
      
      return generateRSSFeed(articles, news, ratings, options.limit || 50);
    }, 60); // Кеш на 1 час
    
    const validation = validateRSSFeed(content);
    
    return {
      success: true,
      content,
      contentType: 'application/rss+xml; charset=utf-8',
      lastModified: new Date(),
      validation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Неизвестная ошибка при генерации RSS фида'
    };
  }
};

/**
 * Генерирует RSS фид только с новостями
 */
export const getNewsRSSFeed = async (options: RSSFeedOptions = {}): Promise<RSSFeedResponse> => {
  try {
    const cacheKey = `news-rss-${JSON.stringify(options)}`;
    
    const content = getCachedRSSFeed(cacheKey, () => {
      const news = filterNews(mockNews, options);
      return generateNewsRSSFeed(news, options.limit || 20);
    }, 30); // Кеш на 30 минут для новостей
    
    const validation = validateRSSFeed(content);
    
    return {
      success: true,
      content,
      contentType: 'application/rss+xml; charset=utf-8',
      lastModified: new Date(),
      validation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка при генерации RSS фида новостей'
    };
  }
};

/**
 * Генерирует RSS фид только со статьями и гайдами
 */
export const getArticlesRSSFeed = async (options: RSSFeedOptions = {}): Promise<RSSFeedResponse> => {
  try {
    const cacheKey = `articles-rss-${JSON.stringify(options)}`;
    
    const content = getCachedRSSFeed(cacheKey, () => {
      const articles = filterArticles(mockArticles, options);
      return generateArticlesRSSFeed(articles, options.limit || 20);
    }, 120); // Кеш на 2 часа для статей
    
    const validation = validateRSSFeed(content);
    
    return {
      success: true,
      content,
      contentType: 'application/rss+xml; charset=utf-8',
      lastModified: new Date(),
      validation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка при генерации RSS фида статей'
    };
  }
};

/**
 * Генерирует RSS фид только с рейтингами
 */
export const getRatingsRSSFeed = async (options: RSSFeedOptions = {}): Promise<RSSFeedResponse> => {
  try {
    const cacheKey = `ratings-rss-${JSON.stringify(options)}`;
    
    const content = getCachedRSSFeed(cacheKey, () => {
      const ratings = filterRatings(mockRatings, options);
      return generateRatingsRSSFeed(ratings, options.limit || 10);
    }, 240); // Кеш на 4 часа для рейтингов
    
    const validation = validateRSSFeed(content);
    
    return {
      success: true,
      content,
      contentType: 'application/rss+xml; charset=utf-8',
      lastModified: new Date(),
      validation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ошибка при генерации RSS фида рейтингов'
    };
  }
};

/**
 * Генерирует RSS фид по категории
 */
export const getCategoryRSSFeed = async (category: string, options: RSSFeedOptions = {}): Promise<RSSFeedResponse> => {
  try {
    const cacheKey = `category-rss-${category}-${JSON.stringify(options)}`;
    
    const content = getCachedRSSFeed(cacheKey, () => {
      const categoryOptions = { ...options, category };
      
      const articles = filterArticles(mockArticles, categoryOptions);
      const news = filterNews(mockNews, categoryOptions);
      const ratings = filterRatings(mockRatings, categoryOptions);
      
      return generateRSSFeed(articles, news, ratings, options.limit || 30);
    }, 90); // Кеш на 1.5 часа для категорий
    
    const validation = validateRSSFeed(content);
    
    return {
      success: true,
      content,
      contentType: 'application/rss+xml; charset=utf-8',
      lastModified: new Date(),
      validation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : `Ошибка при генерации RSS фида категории ${category}`
    };
  }
};

/**
 * Генерирует RSS фид по автору
 */
export const getAuthorRSSFeed = async (author: string, options: RSSFeedOptions = {}): Promise<RSSFeedResponse> => {
  try {
    const cacheKey = `author-rss-${author}-${JSON.stringify(options)}`;
    
    const content = getCachedRSSFeed(cacheKey, () => {
      const authorOptions = { ...options, author };
      
      const articles = filterArticles(mockArticles, authorOptions);
      const news = filterNews(mockNews, authorOptions);
      const ratings = filterRatings(mockRatings, authorOptions);
      
      return generateRSSFeed(articles, news, ratings, options.limit || 20);
    }, 180); // Кеш на 3 часа для авторов
    
    const validation = validateRSSFeed(content);
    
    return {
      success: true,
      content,
      contentType: 'application/rss+xml; charset=utf-8',
      lastModified: new Date(),
      validation
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : `Ошибка при генерации RSS фида автора ${author}`
    };
  }
};

// Утилиты для работы с RSS

/**
 * Получает список доступных RSS фидов
 */
export const getAvailableRSSFeeds = () => {
  return {
    main: {
      url: '/rss.xml',
      title: 'Основной RSS фид',
      description: 'Все новости, статьи и рейтинги'
    },
    news: {
      url: '/rss/news.xml',
      title: 'RSS фид новостей',
      description: 'Только новости индустрии умного дома'
    },
    articles: {
      url: '/rss/articles.xml',
      title: 'RSS фид статей',
      description: 'Гайды, обзоры и инструкции'
    },
    ratings: {
      url: '/rss/ratings.xml',
      title: 'RSS фид рейтингов',
      description: 'ТОП-списки лучших устройств'
    },
    categories: {
      guides: '/rss/category/guides.xml',
      reviews: '/rss/category/reviews.xml',
      tutorials: '/rss/category/tutorials.xml',
      comparisons: '/rss/category/comparisons.xml'
    }
  };
};

/**
 * Генерирует HTML для подписки на RSS
 */
export const generateRSSSubscriptionHTML = () => {
  const feeds = getAvailableRSSFeeds();
  
  return `
    <div class="rss-subscription">
      <h3>Подписаться на RSS</h3>
      <ul>
        <li><a href="${feeds.main.url}" target="_blank">${feeds.main.title}</a> - ${feeds.main.description}</li>
        <li><a href="${feeds.news.url}" target="_blank">${feeds.news.title}</a> - ${feeds.news.description}</li>
        <li><a href="${feeds.articles.url}" target="_blank">${feeds.articles.title}</a> - ${feeds.articles.description}</li>
        <li><a href="${feeds.ratings.url}" target="_blank">${feeds.ratings.title}</a> - ${feeds.ratings.description}</li>
      </ul>
    </div>
  `;
};

/**
 * Проверяет актуальность RSS фида
 */
export const checkRSSFeedFreshness = async (feedType: string): Promise<{
  isFresh: boolean;
  lastUpdate: Date | null;
  nextUpdate: Date | null;
}> => {
  // В реальном приложении здесь будет проверка кеша
  const now = new Date();
  
  return {
    isFresh: true,
    lastUpdate: now,
    nextUpdate: new Date(now.getTime() + 60 * 60 * 1000) // Через час
  };
};