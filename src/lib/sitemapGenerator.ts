import { products } from '@/data/products';
import { ARTICLE_CATEGORIES } from '@/data/content';

export interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface SitemapConfig {
  baseUrl: string;
  defaultChangefreq: SitemapUrl['changefreq'];
  defaultPriority: number;
}

const DEFAULT_CONFIG: SitemapConfig = {
  baseUrl: 'https://smarthome2026.ru',
  defaultChangefreq: 'weekly',
  defaultPriority: 0.5
};

// Генерация статических страниц для sitemap
export const generateStaticUrls = (config: SitemapConfig = DEFAULT_CONFIG): SitemapUrl[] => {
  const now = new Date().toISOString();
  
  return [
    {
      loc: `${config.baseUrl}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      loc: `${config.baseUrl}/catalog`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.9
    },
    {
      loc: `${config.baseUrl}/calculator`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${config.baseUrl}/search`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.6
    },
    {
      loc: `${config.baseUrl}/guides`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${config.baseUrl}/news`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.7
    },
    {
      loc: `${config.baseUrl}/ratings`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${config.baseUrl}/affiliate-policy`,
      lastmod: now,
      changefreq: 'yearly',
      priority: 0.3
    }
  ];
};

// Генерация URL для продуктов
export const generateProductUrls = (config: SitemapConfig = DEFAULT_CONFIG): SitemapUrl[] => {
  return products.map(product => ({
    loc: `${config.baseUrl}/product/${product.id}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.7
  }));
};

// Генерация URL для категорий
export const generateCategoryUrls = (config: SitemapConfig = DEFAULT_CONFIG): SitemapUrl[] => {
  return ARTICLE_CATEGORIES.map(category => ({
    loc: `${config.baseUrl}/category/${category.slug}`,
    lastmod: new Date().toISOString(),
    changefreq: 'weekly' as const,
    priority: 0.6
  }));
};

// Генерация полного sitemap
export const generateSitemap = (config: SitemapConfig = DEFAULT_CONFIG): string => {
  const staticUrls = generateStaticUrls(config);
  const productUrls = generateProductUrls(config);
  const categoryUrls = generateCategoryUrls(config);
  
  const allUrls = [...staticUrls, ...productUrls, ...categoryUrls];
  
  const urlElements = allUrls.map(url => {
    let urlElement = `  <url>\n    <loc>${url.loc}</loc>\n`;
    
    if (url.lastmod) {
      urlElement += `    <lastmod>${url.lastmod}</lastmod>\n`;
    }
    
    if (url.changefreq) {
      urlElement += `    <changefreq>${url.changefreq}</changefreq>\n`;
    }
    
    if (url.priority !== undefined) {
      urlElement += `    <priority>${url.priority}</priority>\n`;
    }
    
    urlElement += '  </url>';
    return urlElement;
  }).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
};

// Генерация robots.txt
export const generateRobotsTxt = (config: SitemapConfig = DEFAULT_CONFIG): string => {
  return `User-agent: *
Allow: /

# Запрещаем индексацию служебных страниц
Disallow: /manage-subscription
Disallow: /unsubscribe
Disallow: /analytics
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Разрешаем основные разделы
Allow: /catalog
Allow: /guides
Allow: /news
Allow: /ratings
Allow: /calculator
Allow: /search

# Sitemap
Sitemap: ${config.baseUrl}/sitemap.xml

# Crawl-delay для вежливого краулинга
Crawl-delay: 1

# Специальные правила для поисковых ботов
User-agent: Yandex
Crawl-delay: 1
Allow: /

User-agent: Googlebot
Crawl-delay: 1
Allow: /

# Запрещаем агрессивным ботам
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /

User-agent: DotBot
Disallow: /`;
};

// Утилита для сохранения файлов (для использования в build процессе)
export const saveSitemapFiles = async (outputDir: string, config: SitemapConfig = DEFAULT_CONFIG) => {
  const sitemap = generateSitemap(config);
  const robots = generateRobotsTxt(config);
  
  // В реальном приложении здесь будет запись в файловую систему
  // Для демонстрации возвращаем объект с содержимым файлов
  return {
    'sitemap.xml': sitemap,
    'robots.txt': robots
  };
};

// Утилита для валидации sitemap
export const validateSitemap = (sitemap: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Проверяем базовую структуру XML
  if (!sitemap.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
    errors.push('Отсутствует XML декларация');
  }
  
  if (!sitemap.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
    errors.push('Отсутствует корректный элемент urlset');
  }
  
  // Проверяем наличие URL
  const urlMatches = sitemap.match(/<url>/g);
  if (!urlMatches || urlMatches.length === 0) {
    errors.push('Sitemap не содержит URL');
  }
  
  // Проверяем корректность URL
  const locMatches = sitemap.match(/<loc>(.*?)<\/loc>/g);
  if (locMatches) {
    locMatches.forEach((match, index) => {
      const url = match.replace(/<\/?loc>/g, '');
      try {
        new URL(url);
      } catch {
        errors.push(`Некорректный URL в позиции ${index + 1}: ${url}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Утилита для генерации RSS фида
export const generateRSSFeed = (config: SitemapConfig = DEFAULT_CONFIG): string => {
  const now = new Date();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Smart Home 2026 - Новости умного дома</title>
    <description>Последние новости, обзоры и гайды по устройствам умного дома в России</description>
    <link>${config.baseUrl}</link>
    <atom:link href="${config.baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <language>ru-RU</language>
    <copyright>© 2026 Smart Home 2026</copyright>
    <managingEditor>info@smarthome2026.ru (Smart Home 2026)</managingEditor>
    <webMaster>webmaster@smarthome2026.ru (Smart Home 2026)</webMaster>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <category>Technology</category>
    <category>Smart Home</category>
    <category>IoT</category>
    <ttl>60</ttl>
    
    <!-- Здесь будут добавляться новости и статьи -->
    <!-- Пример элемента:
    <item>
      <title>Заголовок новости</title>
      <description>Описание новости</description>
      <link>${config.baseUrl}/news/news-slug</link>
      <guid>${config.baseUrl}/news/news-slug</guid>
      <pubDate>Mon, 01 Jan 2026 12:00:00 GMT</pubDate>
      <category>IoT</category>
      <author>author@smarthome2026.ru (Имя Автора)</author>
    </item>
    -->
  </channel>
</rss>`;
};