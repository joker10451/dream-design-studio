import { Article, NewsItem, Rating, ContentTag, SocialShareData, StructuredData } from '../data/content';
import { ContentSearchResult, ContentSearchFilters } from '../data/contentTypes';

// Утилиты для работы с контентом

/**
 * Генерирует slug из заголовка
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[а-я]/g, (char) => {
      const map: { [key: string]: string } = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };
      return map[char] || char;
    })
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '');
}

/**
 * Вычисляет время чтения статьи
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // средняя скорость чтения на русском
  const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Извлекает первое изображение из контента
 */
export function extractFirstImage(content: string): string | undefined {
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = content.match(imgRegex);
  return match ? match[1] : undefined;
}

/**
 * Генерирует excerpt из контента
 */
export function generateExcerpt(content: string, maxLength: number = 160): string {
  const plainText = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

/**
 * Создает оглавление из контента
 */
export function generateTableOfContents(content: string) {
  const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>([^<]+)<\/h[1-6]>/gi;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      id: match[2] || generateSlug(match[3]),
      title: match[3].trim(),
      level: parseInt(match[1]),
      anchor: match[2] || generateSlug(match[3])
    });
  }

  return headings;
}

/**
 * Форматирует дату для отображения
 */
export function formatDate(date: Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (format === 'relative') {
    if (diffInHours < 1) {
      return 'только что';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} ч. назад`;
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)} дн. назад`;
    }
  }

  const options: Intl.DateTimeFormatOptions = format === 'long' 
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };

  return date.toLocaleDateString('ru-RU', options);
}

/**
 * Генерирует данные для социального шаринга
 */
export function generateSocialShareData(
  content: Article | NewsItem | Rating,
  baseUrl: string = 'https://smarthome2026.ru'
): SocialShareData {
  const contentType = 'title' in content && 'category' in content && 'content' in content ? 'article' : 
                     'priority' in content ? 'news' : 'rating';
  
  const url = `${baseUrl}/${contentType}/${content.slug}`;
  const image = content.featuredImage || content.seoMeta.ogImage;
  
  return {
    url,
    title: content.title,
    description: content.seoMeta.description,
    image,
    hashtags: ['умныйдом', 'IoT', 'SmartHome2026']
  };
}

/**
 * Создает URL для шаринга в социальных сетях
 */
export function createSocialShareUrl(platform: string, shareData: SocialShareData): string {
  const encodedUrl = encodeURIComponent(shareData.url);
  const encodedTitle = encodeURIComponent(shareData.title);
  const encodedDescription = encodeURIComponent(shareData.description);

  switch (platform) {
    case 'vk':
      return `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}&description=${encodedDescription}`;
    
    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
    
    case 'whatsapp':
      return `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
    
    case 'twitter':
      const hashtags = shareData.hashtags?.join(',') || '';
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&hashtags=${hashtags}`;
    
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
    
    default:
      return shareData.url;
  }
}

/**
 * Генерирует структурированные данные Schema.org
 */
export function generateStructuredData(
  content: Article | NewsItem | Rating,
  baseUrl: string = 'https://smarthome2026.ru'
): StructuredData {
  const contentType = 'category' in content && 'content' in content ? 'article' : 
                     'priority' in content ? 'news' : 'rating';
  
  const url = `${baseUrl}/${contentType}/${content.slug}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': contentType === 'news' ? 'NewsArticle' : 'Article',
    headline: content.title,
    description: content.seoMeta.description,
    image: content.featuredImage ? [content.featuredImage] : undefined,
    datePublished: content.publishedAt.toISOString(),
    dateModified: ('updatedAt' in content && content.updatedAt) ? 
      content.updatedAt.toISOString() : content.publishedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: content.author.name,
      url: content.author.socialLinks?.website
    },
    publisher: {
      '@type': 'Organization',
      name: 'Smart Home 2026',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };
}

/**
 * Фильтрует контент по заданным критериям
 */
export function filterContent<T extends Article | NewsItem | Rating>(
  content: T[],
  filters: ContentSearchFilters
): T[] {
  return content.filter(item => {
    // Фильтр по поисковому запросу
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const searchableText = `${item.title} ${item.seoMeta.description}`.toLowerCase();
      if (!searchableText.includes(query)) {
        return false;
      }
    }

    // Фильтр по категории
    if (filters.category) {
      if ('category' in item) {
        const category = typeof item.category === 'string' ? item.category : item.category.slug;
        if (category !== filters.category) {
          return false;
        }
      }
    }

    // Фильтр по тегам
    if (filters.tags && filters.tags.length > 0) {
      const itemTags = item.tags?.map(tag => typeof tag === 'string' ? tag : tag.slug) || [];
      if (!filters.tags.some(tag => itemTags.includes(tag))) {
        return false;
      }
    }

    // Фильтр по автору
    if (filters.author) {
      if (item.author.id !== filters.author) {
        return false;
      }
    }

    // Фильтр по дате
    if (filters.dateFrom && item.publishedAt < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && item.publishedAt > filters.dateTo) {
      return false;
    }

    // Фильтр по статусу
    if (filters.status && 'status' in item && item.status !== filters.status) {
      return false;
    }

    return true;
  });
}

/**
 * Сортирует контент
 */
export function sortContent<T extends Article | NewsItem | Rating>(
  content: T[],
  sortBy: 'publishedAt' | 'updatedAt' | 'viewsCount' | 'title' = 'publishedAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): T[] {
  return [...content].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case 'publishedAt':
        const aTime = a.publishedAt.getTime();
        const bTime = b.publishedAt.getTime();
        
        // Обрабатываем невалидные даты
        if (isNaN(aTime) && isNaN(bTime)) return 0;
        if (isNaN(aTime)) return sortOrder === 'asc' ? 1 : -1; // Невалидные даты в конец
        if (isNaN(bTime)) return sortOrder === 'asc' ? -1 : 1;
        
        aValue = aTime;
        bValue = bTime;
        break;
      case 'updatedAt':
        const aUpdated = ('updatedAt' in a && a.updatedAt) ? a.updatedAt.getTime() : a.publishedAt.getTime();
        const bUpdated = ('updatedAt' in b && b.updatedAt) ? b.updatedAt.getTime() : b.publishedAt.getTime();
        
        // Обрабатываем невалидные даты
        if (isNaN(aUpdated) && isNaN(bUpdated)) return 0;
        if (isNaN(aUpdated)) return sortOrder === 'asc' ? 1 : -1;
        if (isNaN(bUpdated)) return sortOrder === 'asc' ? -1 : 1;
        
        aValue = aUpdated;
        bValue = bUpdated;
        break;
      case 'viewsCount':
        aValue = a.viewsCount || 0;
        bValue = b.viewsCount || 0;
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      default:
        const aDefaultTime = a.publishedAt.getTime();
        const bDefaultTime = b.publishedAt.getTime();
        
        // Обрабатываем невалидные даты
        if (isNaN(aDefaultTime) && isNaN(bDefaultTime)) return 0;
        if (isNaN(aDefaultTime)) return sortOrder === 'asc' ? 1 : -1;
        if (isNaN(bDefaultTime)) return sortOrder === 'asc' ? -1 : 1;
        
        aValue = aDefaultTime;
        bValue = bDefaultTime;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    } else {
      return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
    }
  });
}

/**
 * Создает поисковый индекс для контента
 */
export function createSearchIndex<T extends Article | NewsItem | Rating>(content: T[]): ContentSearchResult[] {
  return content.map(item => {
    const contentType = 'category' in item && 'content' in item ? 'article' as const : 
                       'priority' in item ? 'news' as const : 'rating' as const;
    
    const category = 'category' in item ? 
      (typeof item.category === 'string' ? item.category : item.category.name) : 
      contentType;
    
    const tags = item.tags?.map(tag => typeof tag === 'string' ? tag : tag.name) || [];

    return {
      id: item.id,
      title: item.title,
      excerpt: item.seoMeta.description,
      type: contentType,
      url: `/${contentType}/${item.slug}`,
      publishedAt: item.publishedAt,
      author: item.author.name,
      category,
      tags,
      relevanceScore: 1.0
    };
  });
}

/**
 * Выполняет поиск по индексу
 */
export function searchContent(
  searchIndex: ContentSearchResult[],
  query: string,
  filters?: Omit<ContentSearchFilters, 'query'>
): ContentSearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const queryWords = query.toLowerCase().split(/\s+/);
  
  let results = searchIndex.map(item => {
    const searchableText = `${item.title} ${item.excerpt} ${item.tags.join(' ')}`.toLowerCase();
    
    // Вычисляем релевантность
    let relevanceScore = 0;
    let highlightedText = item.excerpt;

    queryWords.forEach(word => {
      const titleMatches = (item.title.toLowerCase().match(new RegExp(word, 'g')) || []).length;
      const excerptMatches = (item.excerpt.toLowerCase().match(new RegExp(word, 'g')) || []).length;
      const tagMatches = item.tags.some(tag => tag.toLowerCase().includes(word)) ? 1 : 0;

      // Весовые коэффициенты для разных частей контента
      relevanceScore += titleMatches * 3 + excerptMatches * 1 + tagMatches * 2;

      // Подсвечиваем найденные слова
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return {
      ...item,
      relevanceScore,
      highlightedText: relevanceScore > 0 ? highlightedText : undefined
    };
  }).filter(item => item.relevanceScore > 0);

  // Применяем дополнительные фильтры
  if (filters) {
    results = results.filter(item => {
      if (filters.contentType && item.type !== filters.contentType) return false;
      if (filters.category && item.category !== filters.category) return false;
      if (filters.author && item.author !== filters.author) return false;
      if (filters.tags && !filters.tags.some(tag => item.tags.includes(tag))) return false;
      if (filters.dateFrom && item.publishedAt < filters.dateFrom) return false;
      if (filters.dateTo && item.publishedAt > filters.dateTo) return false;
      return true;
    });
  }

  // Сортируем по релевантности
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Валидирует контент
 */
export function validateContent(content: Partial<Article | NewsItem | Rating>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!content.title?.trim()) {
    errors.push('Заголовок обязателен');
  } else if (content.title.length > 200) {
    errors.push('Заголовок не должен превышать 200 символов');
  }

  if (!content.slug?.trim()) {
    errors.push('Slug обязателен');
  } else if (!/^[a-z0-9-]+$/.test(content.slug)) {
    errors.push('Slug может содержать только строчные буквы, цифры и дефисы');
  }

  if ('content' in content && (!content.content?.trim() || content.content.length < 100)) {
    errors.push('Контент должен содержать минимум 100 символов');
  }

  if (!content.author?.name?.trim()) {
    errors.push('Автор обязателен');
  }

  if (!content.seoMeta?.title?.trim()) {
    errors.push('SEO заголовок обязателен');
  }

  if (!content.seoMeta?.description?.trim()) {
    errors.push('SEO описание обязательно');
  } else if (content.seoMeta.description.length > 160) {
    errors.push('SEO описание не должно превышать 160 символов');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Генерирует RSS элемент из контента
 */
export function generateRSSItem(content: Article | NewsItem | Rating, baseUrl: string = 'https://smarthome2026.ru') {
  const contentType = 'category' in content && 'content' in content ? 'article' : 
                     'priority' in content ? 'news' : 'rating';
  
  return {
    title: content.title,
    description: content.seoMeta.description,
    link: `${baseUrl}/${contentType}/${content.slug}`,
    guid: `${baseUrl}/${contentType}/${content.slug}`,
    pubDate: content.publishedAt,
    category: 'category' in content ? 
      (typeof content.category === 'string' ? content.category : content.category.name) : 
      contentType,
    author: content.author.email || content.author.name,
    enclosure: content.featuredImage ? {
      url: content.featuredImage,
      type: 'image/jpeg',
      length: 0
    } : undefined
  };
}