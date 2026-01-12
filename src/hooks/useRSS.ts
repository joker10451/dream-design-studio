import { useState, useEffect, useCallback } from 'react';
import { 
  getMainRSSFeed, 
  getNewsRSSFeed, 
  getArticlesRSSFeed, 
  getRatingsRSSFeed,
  getCategoryRSSFeed,
  getAuthorRSSFeed,
  checkRSSFeedFreshness,
  RSSFeedOptions,
  RSSFeedResponse
} from '@/lib/rssApi';

export type RSSFeedType = 'main' | 'news' | 'articles' | 'ratings' | 'category' | 'author';

interface UseRSSOptions extends RSSFeedOptions {
  feedType: RSSFeedType;
  category?: string;
  author?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // в миллисекундах
}

interface UseRSSReturn {
  rssContent: string | null;
  isLoading: boolean;
  error: string | null;
  lastModified: Date | null;
  isValid: boolean;
  validationErrors: string[];
  refresh: () => Promise<void>;
  downloadRSS: () => void;
  copyRSSUrl: () => Promise<void>;
  getRSSUrl: () => string;
}

export const useRSS = (options: UseRSSOptions): UseRSSReturn => {
  const [rssContent, setRssContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [isValid, setIsValid] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const generateRSSFeed = useCallback(async (): Promise<RSSFeedResponse> => {
    const { feedType, category, author, ...feedOptions } = options;

    switch (feedType) {
      case 'main':
        return await getMainRSSFeed(feedOptions);
      case 'news':
        return await getNewsRSSFeed(feedOptions);
      case 'articles':
        return await getArticlesRSSFeed(feedOptions);
      case 'ratings':
        return await getRatingsRSSFeed(feedOptions);
      case 'category':
        if (!category) {
          throw new Error('Category is required for category RSS feed');
        }
        return await getCategoryRSSFeed(category, feedOptions);
      case 'author':
        if (!author) {
          throw new Error('Author is required for author RSS feed');
        }
        return await getAuthorRSSFeed(author, feedOptions);
      default:
        throw new Error(`Unknown feed type: ${feedType}`);
    }
  }, [options]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await generateRSSFeed();

      if (response.success && response.content) {
        setRssContent(response.content);
        setLastModified(response.lastModified || new Date());
        
        if (response.validation) {
          setIsValid(response.validation.isValid);
          setValidationErrors(response.validation.errors);
        }
      } else {
        setError(response.error || 'Неизвестная ошибка при генерации RSS фида');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка при загрузке RSS фида');
    } finally {
      setIsLoading(false);
    }
  }, [generateRSSFeed]);

  const getRSSUrl = useCallback((): string => {
    const baseUrl = window.location.origin;
    const { feedType, category, author } = options;

    switch (feedType) {
      case 'main':
        return `${baseUrl}/rss.xml`;
      case 'news':
        return `${baseUrl}/rss/news.xml`;
      case 'articles':
        return `${baseUrl}/rss/articles.xml`;
      case 'ratings':
        return `${baseUrl}/rss/ratings.xml`;
      case 'category':
        return `${baseUrl}/rss/category/${category}.xml`;
      case 'author':
        return `${baseUrl}/rss/author/${author}.xml`;
      default:
        return `${baseUrl}/rss.xml`;
    }
  }, [options]);

  const downloadRSS = useCallback(() => {
    if (!rssContent) return;

    const blob = new Blob([rssContent], { type: 'application/rss+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `smart-home-2026-${options.feedType}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [rssContent, options.feedType]);

  const copyRSSUrl = useCallback(async () => {
    const url = getRSSUrl();
    
    try {
      await navigator.clipboard.writeText(url);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(new Error('Не удалось скопировать URL в буфер обмена'));
    }
  }, [getRSSUrl]);

  // Автоматическое обновление
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(refresh, options.refreshInterval);
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval, refresh]);

  // Первоначальная загрузка
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    rssContent,
    isLoading,
    error,
    lastModified,
    isValid,
    validationErrors,
    refresh,
    downloadRSS,
    copyRSSUrl,
    getRSSUrl
  };
};

// Хук для проверки актуальности RSS фида
export const useRSSFreshness = (feedType: string) => {
  const [freshness, setFreshness] = useState<{
    isFresh: boolean;
    lastUpdate: Date | null;
    nextUpdate: Date | null;
  }>({
    isFresh: true,
    lastUpdate: null,
    nextUpdate: null
  });

  const checkFreshness = useCallback(async () => {
    try {
      const result = await checkRSSFeedFreshness(feedType);
      setFreshness(result);
    } catch (error) {
      console.error('Error checking RSS feed freshness:', error);
    }
  }, [feedType]);

  useEffect(() => {
    checkFreshness();
    
    // Проверяем актуальность каждые 5 минут
    const interval = setInterval(checkFreshness, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkFreshness]);

  return freshness;
};

// Хук для получения списка доступных RSS фидов
export const useAvailableRSSFeeds = () => {
  return {
    main: {
      url: '/rss.xml',
      title: 'Основной RSS фид',
      description: 'Все новости, статьи и рейтинги',
      type: 'main' as RSSFeedType
    },
    news: {
      url: '/rss/news.xml',
      title: 'RSS фид новостей',
      description: 'Только новости индустрии умного дома',
      type: 'news' as RSSFeedType
    },
    articles: {
      url: '/rss/articles.xml',
      title: 'RSS фид статей',
      description: 'Гайды, обзоры и инструкции',
      type: 'articles' as RSSFeedType
    },
    ratings: {
      url: '/rss/ratings.xml',
      title: 'RSS фид рейтингов',
      description: 'ТОП-списки лучших устройств',
      type: 'ratings' as RSSFeedType
    },
    categories: {
      guides: {
        url: '/rss/category/guides.xml',
        title: 'RSS фид гайдов',
        description: 'Подробные руководства по выбору устройств',
        type: 'category' as RSSFeedType,
        category: 'guides'
      },
      reviews: {
        url: '/rss/category/reviews.xml',
        title: 'RSS фид обзоров',
        description: 'Детальные обзоры устройств',
        type: 'category' as RSSFeedType,
        category: 'reviews'
      },
      tutorials: {
        url: '/rss/category/tutorials.xml',
        title: 'RSS фид инструкций',
        description: 'Пошаговые инструкции',
        type: 'category' as RSSFeedType,
        category: 'tutorials'
      },
      comparisons: {
        url: '/rss/category/comparisons.xml',
        title: 'RSS фид сравнений',
        description: 'Сравнительные обзоры',
        type: 'category' as RSSFeedType,
        category: 'comparisons'
      }
    }
  };
};

// Хук для RSS аналитики (для будущего использования)
export const useRSSAnalytics = (feedType: RSSFeedType) => {
  const [analytics, setAnalytics] = useState({
    subscribers: 0,
    clickThrough: 0,
    popularItems: [] as string[]
  });

  // В реальном приложении здесь будет загрузка аналитики
  useEffect(() => {
    // Заглушка для аналитики
    setAnalytics({
      subscribers: Math.floor(Math.random() * 1000) + 100,
      clickThrough: Math.floor(Math.random() * 50) + 10,
      popularItems: ['Обзор умных розеток', 'Гайд по выбору камер', 'Рейтинг датчиков']
    });
  }, [feedType]);

  return analytics;
};