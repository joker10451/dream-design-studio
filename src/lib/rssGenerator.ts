import { Article, NewsItem, Rating, RSSFeedConfig, RSSItem } from '@/data/content';

// Конфигурация RSS фида
export const RSS_CONFIG: RSSFeedConfig = {
  title: 'Smart Home 2026 - Новости и статьи об умном доме',
  description: 'Последние новости, обзоры, гайды и рейтинги устройств умного дома в России. Экспертные материалы для создания идеального умного дома.',
  link: 'https://smarthome2026.ru',
  language: 'ru-RU',
  copyright: '© 2026 Smart Home 2026. Все права защищены.',
  managingEditor: 'info@smarthome2026.ru (Smart Home 2026)',
  webMaster: 'webmaster@smarthome2026.ru (Smart Home 2026)',
  categories: ['Technology', 'Smart Home', 'IoT', 'Reviews', 'Guides'],
  ttl: 60 // обновление каждый час
};

// Утилиты для экранирования XML
const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const stripHtml = (html: string): string => {
  return html
    .replace(/<[^>]*>/g, '') // Удаляем HTML теги
    .replace(/\s+/g, ' ') // Заменяем множественные пробелы
    .trim();
};

// Конвертация контента в RSS элементы
export const convertArticleToRSSItem = (article: Article): RSSItem => {
  const url = `${RSS_CONFIG.link}/guides/${article.slug}`;
  const description = stripHtml(article.excerpt);
  
  return {
    title: escapeXml(article.title),
    description: escapeXml(description),
    link: url,
    guid: url,
    pubDate: article.publishedAt,
    category: escapeXml(article.category.name),
    author: `${article.author.email || 'info@smarthome2026.ru'} (${escapeXml(article.author.name)})`,
    enclosure: article.featuredImage ? {
      url: article.featuredImage,
      type: 'image/jpeg',
      length: 0 // Длина будет определена автоматически
    } : undefined
  };
};

export const convertNewsToRSSItem = (news: NewsItem): RSSItem => {
  const url = `${RSS_CONFIG.link}/news/${news.slug}`;
  const description = stripHtml(news.excerpt);
  
  return {
    title: escapeXml(news.title),
    description: escapeXml(description),
    link: url,
    guid: url,
    pubDate: news.publishedAt,
    category: escapeXml(getCategoryDisplayName(news.category)),
    author: `${news.author.email || 'info@smarthome2026.ru'} (${escapeXml(news.author.name)})`,
    enclosure: news.featuredImage ? {
      url: news.featuredImage,
      type: 'image/jpeg',
      length: 0
    } : undefined
  };
};

export const convertRatingToRSSItem = (rating: Rating): RSSItem => {
  const url = `${RSS_CONFIG.link}/ratings/${rating.slug}`;
  const description = stripHtml(rating.description);
  
  return {
    title: escapeXml(rating.title),
    description: escapeXml(description),
    link: url,
    guid: url,
    pubDate: rating.publishedAt,
    category: 'Рейтинги',
    author: `${rating.author.email || 'info@smarthome2026.ru'} (${escapeXml(rating.author.name)})`,
    enclosure: rating.featuredImage ? {
      url: rating.featuredImage,
      type: 'image/jpeg',
      length: 0
    } : undefined
  };
};

// Вспомогательная функция для отображения категорий новостей
const getCategoryDisplayName = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'industry': 'Индустрия',
    'products': 'Продукты',
    'reviews': 'Обзоры',
    'events': 'События',
    'technology': 'Технологии'
  };
  
  return categoryMap[category] || category;
};

// Генерация RSS элемента
const generateRSSItem = (item: RSSItem): string => {
  let rssItem = `    <item>\n`;
  rssItem += `      <title>${item.title}</title>\n`;
  rssItem += `      <description><![CDATA[${item.description}]]></description>\n`;
  rssItem += `      <link>${item.link}</link>\n`;
  rssItem += `      <guid isPermaLink="true">${item.guid}</guid>\n`;
  rssItem += `      <pubDate>${item.pubDate.toUTCString()}</pubDate>\n`;
  
  if (item.category) {
    rssItem += `      <category>${item.category}</category>\n`;
  }
  
  if (item.author) {
    rssItem += `      <author>${item.author}</author>\n`;
  }
  
  if (item.enclosure) {
    rssItem += `      <enclosure url="${item.enclosure.url}" type="${item.enclosure.type}" length="${item.enclosure.length}" />\n`;
  }
  
  rssItem += `    </item>`;
  
  return rssItem;
};

// Основная функция генерации RSS фида
export const generateRSSFeed = (
  articles: Article[] = [],
  news: NewsItem[] = [],
  ratings: Rating[] = [],
  limit: number = 50
): string => {
  // Конвертируем все элементы в RSS items
  const articleItems = articles.map(convertArticleToRSSItem);
  const newsItems = news.map(convertNewsToRSSItem);
  const ratingItems = ratings.map(convertRatingToRSSItem);
  
  // Объединяем и сортируем по дате публикации
  const allItems = [...articleItems, ...newsItems, ...ratingItems]
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, limit);
  
  const now = new Date();
  const lastBuildDate = allItems.length > 0 ? allItems[0].pubDate : now;
  
  // Генерируем RSS XML
  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">\n`;
  rss += `  <channel>\n`;
  rss += `    <title>${escapeXml(RSS_CONFIG.title)}</title>\n`;
  rss += `    <description><![CDATA[${RSS_CONFIG.description}]]></description>\n`;
  rss += `    <link>${RSS_CONFIG.link}</link>\n`;
  rss += `    <atom:link href="${RSS_CONFIG.link}/rss.xml" rel="self" type="application/rss+xml" />\n`;
  rss += `    <language>${RSS_CONFIG.language}</language>\n`;
  rss += `    <copyright>${escapeXml(RSS_CONFIG.copyright)}</copyright>\n`;
  rss += `    <managingEditor>${RSS_CONFIG.managingEditor}</managingEditor>\n`;
  rss += `    <webMaster>${RSS_CONFIG.webMaster}</webMaster>\n`;
  rss += `    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>\n`;
  rss += `    <pubDate>${now.toUTCString()}</pubDate>\n`;
  rss += `    <ttl>${RSS_CONFIG.ttl}</ttl>\n`;
  rss += `    <generator>Smart Home 2026 RSS Generator</generator>\n`;
  
  // Добавляем категории
  RSS_CONFIG.categories.forEach(category => {
    rss += `    <category>${escapeXml(category)}</category>\n`;
  });
  
  // Добавляем изображение канала
  rss += `    <image>\n`;
  rss += `      <url>${RSS_CONFIG.link}/images/logo.png</url>\n`;
  rss += `      <title>${escapeXml(RSS_CONFIG.title)}</title>\n`;
  rss += `      <link>${RSS_CONFIG.link}</link>\n`;
  rss += `      <width>144</width>\n`;
  rss += `      <height>144</height>\n`;
  rss += `      <description>Логотип Smart Home 2026</description>\n`;
  rss += `    </image>\n`;
  
  // Добавляем элементы
  if (allItems.length > 0) {
    rss += `\n`;
    allItems.forEach(item => {
      rss += generateRSSItem(item) + '\n';
    });
  }
  
  rss += `  </channel>\n`;
  rss += `</rss>`;
  
  return rss;
};

// Генерация специализированных RSS фидов
export const generateNewsRSSFeed = (news: NewsItem[], limit: number = 20): string => {
  return generateRSSFeed([], news, [], limit);
};

export const generateArticlesRSSFeed = (articles: Article[], limit: number = 20): string => {
  return generateRSSFeed(articles, [], [], limit);
};

export const generateRatingsRSSFeed = (ratings: Rating[], limit: number = 10): string => {
  return generateRSSFeed([], [], ratings, limit);
};

// Валидация RSS фида
export const validateRSSFeed = (rssContent: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Базовая валидация XML структуры
  if (!rssContent.includes('<?xml version="1.0"')) {
    errors.push('Отсутствует XML декларация');
  }
  
  if (!rssContent.includes('<rss version="2.0"')) {
    errors.push('Отсутствует корректная RSS декларация');
  }
  
  if (!rssContent.includes('<channel>') || !rssContent.includes('</channel>')) {
    errors.push('Отсутствует элемент channel');
  }
  
  // Проверка обязательных элементов канала
  const requiredElements = ['<title>', '<description>', '<link>'];
  requiredElements.forEach(element => {
    if (!rssContent.includes(element)) {
      errors.push(`Отсутствует обязательный элемент: ${element}`);
    }
  });
  
  // Проверка корректности дат
  const dateRegex = /<pubDate>([^<]+)<\/pubDate>/g;
  let match;
  while ((match = dateRegex.exec(rssContent)) !== null) {
    const dateStr = match[1];
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      errors.push(`Некорректная дата: ${dateStr}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Кеширование RSS фидов
interface CachedRSSFeed {
  content: string;
  generatedAt: Date;
  expiresAt: Date;
}

const rssCache = new Map<string, CachedRSSFeed>();

export const getCachedRSSFeed = (
  key: string,
  generator: () => string,
  ttlMinutes: number = 60
): string => {
  const cached = rssCache.get(key);
  const now = new Date();
  
  if (cached && now < cached.expiresAt) {
    return cached.content;
  }
  
  // Генерируем новый фид
  const content = generator();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60 * 1000);
  
  rssCache.set(key, {
    content,
    generatedAt: now,
    expiresAt
  });
  
  return content;
};

// Очистка кеша
export const clearRSSCache = (key?: string): void => {
  if (key) {
    rssCache.delete(key);
  } else {
    rssCache.clear();
  }
};

// Получение статистики кеша
export const getRSSCacheStats = () => {
  const now = new Date();
  const stats = {
    totalEntries: rssCache.size,
    activeEntries: 0,
    expiredEntries: 0
  };
  
  rssCache.forEach(cached => {
    if (now < cached.expiresAt) {
      stats.activeEntries++;
    } else {
      stats.expiredEntries++;
    }
  });
  
  return stats;
};