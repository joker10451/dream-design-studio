import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
    generateRSSFeed,
    generateNewsRSSFeed,
    generateArticlesRSSFeed,
    generateRatingsRSSFeed
} from '../src/lib/rssGenerator';
import { mockArticles, mockNews, mockRatings } from '../src/data/mockContent';

// Получаем путь к текущему файлу
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const BASE_URL = 'https://smarthome2026.ru';

// Генерация Sitemap
const generateSitemap = () => {
    const now = new Date().toISOString();

    // Статические страницы
    const staticUrls = [
        { loc: `${BASE_URL}/`, lastmod: now, changefreq: 'daily', priority: 1.0 },
        { loc: `${BASE_URL}/catalog`, lastmod: now, changefreq: 'daily', priority: 0.9 },
        { loc: `${BASE_URL}/calculator`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
        { loc: `${BASE_URL}/search`, lastmod: now, changefreq: 'monthly', priority: 0.6 },
        { loc: `${BASE_URL}/guides`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
        { loc: `${BASE_URL}/news`, lastmod: now, changefreq: 'daily', priority: 0.7 },
        { loc: `${BASE_URL}/ratings`, lastmod: now, changefreq: 'weekly', priority: 0.8 },
        { loc: `${BASE_URL}/affiliate-policy`, lastmod: now, changefreq: 'yearly', priority: 0.3 },
        { loc: `${BASE_URL}/rss`, lastmod: now, changefreq: 'monthly', priority: 0.5 }
    ];

    // Категории продуктов
    const categories = ['sockets', 'lighting', 'cameras', 'sensors', 'security', 'speakers', 'hubs'];
    const categoryUrls = categories.map(category => ({
        loc: `${BASE_URL}/catalog?category=${category}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
    }));

    // Продукты (примерные ID из mock/реальных данных)
    const productIds = ['1', '2', '3'];
    const productUrls = productIds.map(id => ({
        loc: `${BASE_URL}/product/${id}`,
        lastmod: now,
        changefreq: 'weekly',
        priority: 0.7
    }));

    // Статьи и новости из mock данных
    const contentUrls = [
        ...mockArticles.map(a => ({ loc: `${BASE_URL}/guides/${a.slug}`, lastmod: a.publishedAt.toISOString(), changefreq: 'monthly', priority: 0.6 })),
        ...mockNews.map(n => ({ loc: `${BASE_URL}/news/${n.slug}`, lastmod: n.publishedAt.toISOString(), changefreq: 'monthly', priority: 0.6 })),
        ...mockRatings.map(r => ({ loc: `${BASE_URL}/ratings/${r.slug}`, lastmod: r.publishedAt.toISOString(), changefreq: 'monthly', priority: 0.6 }))
    ];

    const allUrls = [...staticUrls, ...categoryUrls, ...productUrls, ...contentUrls];

    const urlElements = allUrls.map(url => {
        let urlElement = `  <url>\n    <loc>${url.loc}</loc>\n`;
        if (url.lastmod) urlElement += `    <lastmod>${url.lastmod}</lastmod>\n`;
        if (url.changefreq) urlElement += `    <changefreq>${url.changefreq}</changefreq>\n`;
        if (url.priority !== undefined) urlElement += `    <priority>${url.priority}</priority>\n`;
        urlElement += '  </url>';
        return urlElement;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;
};

// Генерация Robots.txt
const generateRobotsTxt = () => {
    return `User-agent: *
Allow: /

# Запрещаем индексацию служебных страниц
Disallow: /manage-subscription
Disallow: /unsubscribe
Disallow: /analytics
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

User-agent: Yandex
Crawl-delay: 1
Allow: /

User-agent: Googlebot
Crawl-delay: 1
Allow: /`;
};

// Основная функция
const generateSEOFiles = () => {
    const distPath = join(__dirname, '..', 'dist');
    const publicPath = join(__dirname, '..', 'public');
    const rssDir = join(publicPath, 'rss');
    const distRssDir = join(distPath, 'rss');

    try {
        // Создаем директории
        [distPath, publicPath, rssDir, distRssDir].forEach(path => {
            mkdirSync(path, { recursive: true });
        });

        // Генерируем контент
        const sitemap = generateSitemap();
        const robots = generateRobotsTxt();
        const mainRss = generateRSSFeed(mockArticles, mockNews, mockRatings);
        const newsRss = generateNewsRSSFeed(mockNews);
        const articlesRss = generateArticlesRSSFeed(mockArticles);
        const ratingsRss = generateRatingsRSSFeed(mockRatings);

        // Сохраняем файлы
        const filesToSave = [
            { path: join(publicPath, 'sitemap.xml'), content: sitemap },
            { path: join(publicPath, 'robots.txt'), content: robots },
            { path: join(publicPath, 'rss.xml'), content: mainRss },
            { path: join(rssDir, 'news.xml'), content: newsRss },
            { path: join(rssDir, 'articles.xml'), content: articlesRss },
            { path: join(rssDir, 'ratings.xml'), content: ratingsRss },

            // И в dist для сборки
            { path: join(distPath, 'sitemap.xml'), content: sitemap },
            { path: join(distPath, 'robots.txt'), content: robots },
            { path: join(distPath, 'rss.xml'), content: mainRss },
            { path: join(distRssDir, 'news.xml'), content: newsRss },
            { path: join(distRssDir, 'articles.xml'), content: articlesRss },
            { path: join(distRssDir, 'ratings.xml'), content: ratingsRss }
        ];

        filesToSave.forEach(file => {
            writeFileSync(file.path, file.content, 'utf8');
        });

        console.log('✅ SEO и RSS файлы успешно сгенерированы:');
        console.log('   - sitemap.xml');
        console.log('   - robots.txt');
        console.log('   - rss.xml');
        console.log('   - rss/news.xml');
        console.log('   - rss/articles.xml');
        console.log('   - rss/ratings.xml');

    } catch (error) {
        console.error('❌ Ошибка при генерации SEO файлов:', error);
        process.exit(1);
    }
};

generateSEOFiles();
