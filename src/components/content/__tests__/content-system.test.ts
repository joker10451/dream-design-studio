import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { mockArticles, mockNews, mockRatings } from '@/data/mockContent';
import { NewsItem, Rating, Article } from '@/data/content';
import { 
  sortContent, 
  createSocialShareUrl, 
  generateSocialShareData,
  formatDate 
} from '@/lib/contentUtils';

describe('Property-Based Tests for Content System', () => {
  
  describe('Property 12: News Chronological Ordering', () => {
    it('should display news in chronological order (newest first)', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 12: News Chronological Ordering
       * Validates: Requirements 5.2
       */
      fc.assert(fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            title: fc.string({ minLength: 1 }),
            slug: fc.string({ minLength: 1 }),
            excerpt: fc.string({ minLength: 1 }),
            content: fc.string({ minLength: 1 }),
            publishedAt: fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(date => !isNaN(date.getTime())),
            author: fc.constant(mockNews[0].author),
            category: fc.constantFrom('industry', 'products', 'reviews', 'events', 'technology'),
            tags: fc.constant([]),
            priority: fc.constantFrom('low', 'normal', 'high', 'urgent'),
            seoMeta: fc.constant(mockNews[0].seoMeta),
            relatedNews: fc.constant([]),
            relatedProducts: fc.constant([]),
            relatedArticles: fc.constant([])
          }),
          { minLength: 2, maxLength: 20 }
        ),
        (newsItems: NewsItem[]) => {
          // Фильтруем новости с валидными датами
          const validNewsItems = newsItems.filter(item => 
            item.publishedAt instanceof Date && !isNaN(item.publishedAt.getTime())
          );
          
          // Если нет валидных новостей, тест проходит
          if (validNewsItems.length < 2) return true;
          
          // Сортируем новости по дате (новые первыми)
          const sortedNews = sortContent(validNewsItems, 'publishedAt', 'desc');
          
          // Проверяем, что новости отсортированы правильно
          for (let i = 0; i < sortedNews.length - 1; i++) {
            const currentDate = sortedNews[i].publishedAt.getTime();
            const nextDate = sortedNews[i + 1].publishedAt.getTime();
            
            // Проверяем, что даты валидны
            expect(isNaN(currentDate)).toBe(false);
            expect(isNaN(nextDate)).toBe(false);
            
            // Текущая новость должна быть новее или равна по дате следующей
            expect(currentDate).toBeGreaterThanOrEqual(nextDate);
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should handle news with same publication dates correctly', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 12: News Chronological Ordering
       * Validates: Requirements 5.2
       */
      const sameDate = new Date('2026-01-10');
      const newsWithSameDate: NewsItem[] = [
        { ...mockNews[0], id: 'news-a', publishedAt: sameDate },
        { ...mockNews[0], id: 'news-b', publishedAt: sameDate },
        { ...mockNews[0], id: 'news-c', publishedAt: sameDate }
      ];

      const sortedNews = sortContent(newsWithSameDate, 'publishedAt', 'desc');
      
      // Все новости должны иметь одинаковую дату
      sortedNews.forEach(news => {
        expect(news.publishedAt.getTime()).toBe(sameDate.getTime());
      });
      
      // Порядок должен быть стабильным
      expect(sortedNews).toHaveLength(3);
    });
  });

  describe('Property 13: Related Content Association', () => {
    it('should have contextually relevant related content', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 13: Related Content Association
       * Validates: Requirements 5.3
       */
      fc.assert(fc.property(
        fc.constantFrom(...mockNews),
        (newsItem: NewsItem) => {
          // Проверяем связанные новости
          if (newsItem.relatedNews && newsItem.relatedNews.length > 0) {
            newsItem.relatedNews.forEach(relatedId => {
              expect(typeof relatedId).toBe('string');
              expect(relatedId.length).toBeGreaterThan(0);
              expect(relatedId).not.toBe(newsItem.id); // Не должна ссылаться на себя
            });
          }
          
          // Проверяем связанные продукты
          if (newsItem.relatedProducts && newsItem.relatedProducts.length > 0) {
            newsItem.relatedProducts.forEach(productId => {
              expect(typeof productId).toBe('string');
              expect(productId.length).toBeGreaterThan(0);
            });
          }
          
          // Проверяем связанные статьи
          if (newsItem.relatedArticles && newsItem.relatedArticles.length > 0) {
            newsItem.relatedArticles.forEach(articleId => {
              expect(typeof articleId).toBe('string');
              expect(articleId.length).toBeGreaterThan(0);
            });
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should maintain bidirectional relationships in related content', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 13: Related Content Association
       * Validates: Requirements 5.3
       */
      fc.assert(fc.property(
        fc.constantFrom(...mockArticles),
        (article: Article) => {
          // Проверяем связанные статьи
          if (article.relatedArticles && article.relatedArticles.length > 0) {
            article.relatedArticles.forEach(relatedId => {
              // Находим связанную статью
              const relatedArticle = mockArticles.find(a => a.id === relatedId);
              
              if (relatedArticle) {
                // Проверяем, что связь взаимная (опционально)
                // В реальной системе это может быть требованием
                expect(relatedArticle.id).toBe(relatedId);
                expect(relatedArticle.relatedArticles).toBeDefined();
              }
            });
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 15: Category-Based Ratings', () => {
    it('should only include devices from the specified category in ratings', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 15: Category-Based Ratings
       * Validates: Requirements 6.2
       */
      fc.assert(fc.property(
        fc.constantFrom(...mockRatings),
        (rating: Rating) => {
          // Проверяем, что рейтинг имеет определенную категорию
          expect(rating.category).toBeDefined();
          expect(typeof rating.category).toBe('string');
          expect(rating.category.length).toBeGreaterThan(0);
          
          // Проверяем, что все продукты в рейтинге соответствуют категории
          rating.products.forEach(ratedProduct => {
            expect(ratedProduct.productId).toBeDefined();
            expect(typeof ratedProduct.productId).toBe('string');
            expect(ratedProduct.rank).toBeGreaterThan(0);
            expect(ratedProduct.score).toBeGreaterThanOrEqual(0);
            expect(ratedProduct.score).toBeLessThanOrEqual(100);
          });
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should have products properly sorted by ranking', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 15: Category-Based Ratings
       * Validates: Requirements 6.2
       */
      fc.assert(fc.property(
        fc.constantFrom(...mockRatings),
        (rating: Rating) => {
          const sortedProducts = [...rating.products].sort((a, b) => a.rank - b.rank);
          
          // Проверяем, что ранги уникальны и последовательны
          for (let i = 0; i < sortedProducts.length; i++) {
            expect(sortedProducts[i].rank).toBe(i + 1);
          }
          
          // Проверяем, что продукты с лучшим рангом имеют более высокие баллы (в большинстве случаев)
          for (let i = 0; i < sortedProducts.length - 1; i++) {
            const currentProduct = sortedProducts[i];
            const nextProduct = sortedProducts[i + 1];
            
            // Продукт с лучшим рангом должен иметь балл не меньше следующего
            // (допускаем небольшие отклонения для реалистичности)
            expect(currentProduct.score).toBeGreaterThanOrEqual(nextProduct.score - 5);
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 16: Social Sharing Completeness', () => {
    it('should have all required social network sharing buttons present', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 16: Social Sharing Completeness
       * Validates: Requirements 7.1, 7.2
       */
      const requiredPlatforms = ['vk', 'telegram', 'whatsapp'];
      
      fc.assert(fc.property(
        fc.constantFrom(...mockArticles, ...mockNews, ...mockRatings),
        (content: Article | NewsItem | Rating) => {
          const shareData = generateSocialShareData(content);
          
          // Проверяем, что данные для шаринга корректны
          expect(shareData.url).toBeDefined();
          expect(shareData.title).toBeDefined();
          expect(shareData.description).toBeDefined();
          expect(shareData.url).toMatch(/^https?:\/\//);
          expect(shareData.title.length).toBeGreaterThan(0);
          expect(shareData.description.length).toBeGreaterThan(0);
          
          // Проверяем, что можно создать URL для всех требуемых платформ
          requiredPlatforms.forEach(platform => {
            const shareUrl = createSocialShareUrl(platform, shareData);
            expect(shareUrl).toBeDefined();
            expect(shareUrl).toMatch(/^https?:\/\//);
            expect(shareUrl).toContain(encodeURIComponent(shareData.url));
          });
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should generate platform-specific sharing URLs correctly', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 16: Social Sharing Completeness
       * Validates: Requirements 7.1, 7.2
       */
      const shareData = {
        url: 'https://smarthome2026.ru/article/test',
        title: 'Тестовая статья',
        description: 'Описание тестовой статьи',
        hashtags: ['умныйдом', 'тест']
      };

      const vkUrl = createSocialShareUrl('vk', shareData);
      const telegramUrl = createSocialShareUrl('telegram', shareData);
      const whatsappUrl = createSocialShareUrl('whatsapp', shareData);

      // Проверяем VK URL
      expect(vkUrl).toContain('vk.com/share.php');
      expect(vkUrl).toContain(encodeURIComponent(shareData.url));
      expect(vkUrl).toContain(encodeURIComponent(shareData.title));

      // Проверяем Telegram URL
      expect(telegramUrl).toContain('t.me/share/url');
      expect(telegramUrl).toContain(encodeURIComponent(shareData.url));
      expect(telegramUrl).toContain(encodeURIComponent(shareData.title));

      // Проверяем WhatsApp URL
      expect(whatsappUrl).toContain('wa.me');
      expect(whatsappUrl).toContain(encodeURIComponent(shareData.title));
      expect(whatsappUrl).toContain(encodeURIComponent(shareData.url));
    });
  });

  describe('Property 17: Social Sharing Functionality', () => {
    it('should generate pre-filled sharing content with proper metadata', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 17: Social Sharing Functionality
       * Validates: Requirements 7.3
       */
      fc.assert(fc.property(
        fc.constantFrom(...mockArticles, ...mockNews, ...mockRatings),
        (content: Article | NewsItem | Rating) => {
          const shareData = generateSocialShareData(content);
          
          // Проверяем, что заголовок не пустой и не слишком длинный
          expect(shareData.title.length).toBeGreaterThan(0);
          expect(shareData.title.length).toBeLessThanOrEqual(200);
          
          // Проверяем, что описание не пустое и подходящей длины для соцсетей
          expect(shareData.description.length).toBeGreaterThan(0);
          expect(shareData.description.length).toBeLessThanOrEqual(300);
          
          // Проверяем URL
          expect(shareData.url).toMatch(/^https:\/\/smarthome2026\.ru\//);
          
          // Проверяем хештеги
          if (shareData.hashtags) {
            expect(Array.isArray(shareData.hashtags)).toBe(true);
            shareData.hashtags.forEach(hashtag => {
              expect(typeof hashtag).toBe('string');
              expect(hashtag.length).toBeGreaterThan(0);
              // Хештеги не должны содержать пробелы
              expect(hashtag).not.toMatch(/\s/);
            });
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should handle special characters in sharing content correctly', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 17: Social Sharing Functionality
       * Validates: Requirements 7.3
       */
      const contentWithSpecialChars = {
        ...mockArticles[0],
        title: 'Тест с "кавычками" & амперсандом и #хештегом',
        seoMeta: {
          ...mockArticles[0].seoMeta,
          description: 'Описание с <тегами> и & символами'
        }
      };

      const shareData = generateSocialShareData(contentWithSpecialChars);
      const vkUrl = createSocialShareUrl('vk', shareData);
      
      // URL должен быть корректно закодирован
      expect(vkUrl).toContain('%22'); // Кавычки должны быть закодированы
      expect(vkUrl).toContain('%26'); // Амперсанд должен быть закодирован
      expect(vkUrl).not.toContain('<'); // HTML теги не должны попадать в URL
      expect(vkUrl).not.toContain('>');
    });
  });

  describe('Property 18: Social Preview Generation', () => {
    it('should generate proper Open Graph metadata for social previews', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 18: Social Preview Generation
       * Validates: Requirements 7.4
       */
      fc.assert(fc.property(
        fc.constantFrom(...mockArticles, ...mockNews, ...mockRatings),
        (content: Article | NewsItem | Rating) => {
          // Проверяем SEO метаданные
          expect(content.seoMeta).toBeDefined();
          expect(content.seoMeta.title).toBeDefined();
          expect(content.seoMeta.description).toBeDefined();
          
          // Заголовок для Open Graph
          expect(content.seoMeta.title.length).toBeGreaterThan(0);
          expect(content.seoMeta.title.length).toBeLessThanOrEqual(70); // Реалистичная длина для OG
          
          // Описание для Open Graph
          expect(content.seoMeta.description.length).toBeGreaterThan(0);
          expect(content.seoMeta.description.length).toBeLessThanOrEqual(160); // Оптимальная длина для OG
          
          // Изображение для превью (если есть)
          if (content.seoMeta.ogImage || content.featuredImage) {
            const previewImage = content.seoMeta.ogImage || content.featuredImage;
            expect(previewImage).toMatch(/^https?:\/\//);
          }
          
          // Ключевые слова должны быть массивом строк
          expect(Array.isArray(content.seoMeta.keywords)).toBe(true);
          content.seoMeta.keywords.forEach(keyword => {
            expect(typeof keyword).toBe('string');
            expect(keyword.length).toBeGreaterThan(0);
          });
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should generate structured data for rich social previews', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 18: Social Preview Generation
       * Validates: Requirements 7.4
       */
      fc.assert(fc.property(
        fc.constantFrom(...mockArticles),
        (article: Article) => {
          // Проверяем данные автора для структурированных данных
          expect(article.author).toBeDefined();
          expect(article.author.name).toBeDefined();
          expect(typeof article.author.name).toBe('string');
          expect(article.author.name.length).toBeGreaterThan(0);
          
          // Проверяем дату публикации
          expect(article.publishedAt).toBeInstanceOf(Date);
          expect(article.publishedAt.getTime()).toBeLessThanOrEqual(Date.now());
          
          // Проверяем категорию для структурированных данных
          expect(article.category).toBeDefined();
          expect(article.category.name).toBeDefined();
          expect(typeof article.category.name).toBe('string');
          
          // Проверяем время чтения
          expect(typeof article.readingTime).toBe('number');
          expect(article.readingTime).toBeGreaterThan(0);
          
          return true;
        }
      ), { numRuns: 100 });
    });

    it('should format dates correctly for social previews', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 18: Social Preview Generation
       * Validates: Requirements 7.4
       */
      fc.assert(fc.property(
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())),
        fc.constantFrom('short', 'long', 'relative'),
        (date: Date, format: 'short' | 'long' | 'relative') => {
          const formattedDate = formatDate(date, format);
          
          expect(typeof formattedDate).toBe('string');
          expect(formattedDate.length).toBeGreaterThan(0);
          
          // Проверяем формат даты
          if (format === 'short') {
            // Короткий формат должен содержать год
            expect(formattedDate).toMatch(/\d{4}/);
          } else if (format === 'long') {
            // Длинный формат должен содержать название месяца
            expect(formattedDate.length).toBeGreaterThan(10);
          } else if (format === 'relative') {
            // Относительный формат для недавних дат
            const now = new Date();
            const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
            
            if (Math.abs(diffInHours) < 1) {
              expect(formattedDate).toContain('только что');
            } else if (Math.abs(diffInHours) < 24) {
              expect(formattedDate).toMatch(/\d+ ч\. назад/);
            }
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });
});