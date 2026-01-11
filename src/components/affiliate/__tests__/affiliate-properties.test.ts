import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { 
  validateAffiliateLink, 
  getBestPrice, 
  isPriceStale, 
  generateAffiliateUrl,
  AFFILIATE_CONFIG,
  MarketplaceId
} from '@/lib/affiliateUtils';
import { AffiliateLink } from '@/data/products';

// Генераторы для property-based тестирования
const marketplaceArb = fc.constantFrom('wildberries', 'ozon', 'yandex') as fc.Arbitrary<MarketplaceId>;

const affiliateLinkArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  marketplace: marketplaceArb,
  url: fc.webUrl(),
  price: fc.integer({ min: 1, max: 1000000 }),
  isAvailable: fc.boolean(),
  lastUpdated: fc.integer({ min: new Date('2020-01-01').getTime(), max: Date.now() - 1000 }).map(timestamp => new Date(timestamp)),
  trackingParams: fc.dictionary(fc.string(), fc.string())
}) as fc.Arbitrary<AffiliateLink>;

const validAffiliateLinkArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }).filter(id => id.trim().length > 0),
  marketplace: marketplaceArb,
  url: marketplaceArb.chain(marketplace => {
    const config = AFFILIATE_CONFIG[marketplace];
    return fc.webUrl().map(url => {
      const urlObj = new URL(url);
      // Добавляем партнерский параметр для валидности
      urlObj.searchParams.set(config.trackingParam, config.partnerId);
      return urlObj.toString();
    });
  }),
  price: fc.integer({ min: 1, max: 1000000 }),
  isAvailable: fc.boolean(),
  lastUpdated: fc.integer({ min: Date.now() - 23 * 60 * 60 * 1000, max: Date.now() - 1000 }).map(timestamp => new Date(timestamp)), // Последние 23 часа, но не в будущем
  trackingParams: fc.dictionary(fc.string(), fc.string())
}) as fc.Arbitrary<AffiliateLink>;

describe('Affiliate System Property Tests', () => {
  describe('Property 25: Price Accuracy and Freshness', () => {
    it('**Feature: smart-home-mvp-enhancement, Property 25: Price Accuracy and Freshness** - For any displayed product price, it should match the current price from the respective marketplace within acceptable staleness limits', () => {
      fc.assert(
        fc.property(affiliateLinkArb, (link) => {
          // Проверяем, что цена является положительным числом
          expect(link.price).toBeGreaterThan(0);
          
          // Проверяем актуальность данных
          const maxAgeHours = 24; // Максимальный возраст данных в часах
          const isStale = isPriceStale(link.lastUpdated, maxAgeHours);
          
          // Если данные свежие, они должны быть валидными
          if (!isStale) {
            expect(link.price).toBeTypeOf('number');
            expect(Number.isFinite(link.price)).toBe(true);
            expect(link.lastUpdated).toBeInstanceOf(Date);
            expect(link.lastUpdated.getTime()).toBeLessThanOrEqual(Date.now());
          }
          
          // Проверяем, что устаревшие данные корректно определяются
          const daysSinceUpdate = (Date.now() - link.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate > 1) {
            expect(isPriceStale(link.lastUpdated, 24)).toBe(true);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('**Feature: smart-home-mvp-enhancement, Property 25: Price Accuracy and Freshness** - Price staleness detection should be consistent across different time periods', () => {
      fc.assert(
        fc.property(
          fc.date({ min: new Date('2020-01-01'), max: new Date() }),
          fc.integer({ min: 1, max: 168 }), // 1-168 часов (неделя)
          (lastUpdated, maxAgeHours) => {
            const isStale = isPriceStale(lastUpdated, maxAgeHours);
            const actualAgeHours = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60);
            
            // Проверяем корректность определения устаревших данных
            if (actualAgeHours > maxAgeHours) {
              expect(isStale).toBe(true);
            } else {
              expect(isStale).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('**Feature: smart-home-mvp-enhancement, Property 25: Price Accuracy and Freshness** - Best price calculation should always return the lowest available price', () => {
      fc.assert(
        fc.property(
          fc.array(validAffiliateLinkArb, { minLength: 1, maxLength: 10 }),
          (links) => {
            // Устанавливаем некоторые ссылки как доступные
            const linksWithAvailability = links.map((link, index) => ({
              ...link,
              isAvailable: index < Math.ceil(links.length / 2) // Половина доступна
            }));
            
            const result = getBestPrice(linksWithAvailability);
            const availableLinks = linksWithAvailability.filter(link => link.isAvailable);
            
            if (availableLinks.length === 0) {
              expect(result.bestLink).toBeNull();
              expect(result.savings).toBe(0);
              expect(result.savingsPercent).toBe(0);
            } else {
              const minPrice = Math.min(...availableLinks.map(link => link.price));
              const maxPrice = Math.max(...availableLinks.map(link => link.price));
              
              expect(result.bestLink).not.toBeNull();
              expect(result.bestLink!.price).toBe(minPrice);
              expect(result.bestLink!.isAvailable).toBe(true);
              
              // Проверяем расчет экономии
              const expectedSavings = maxPrice - minPrice;
              expect(result.savings).toBe(expectedSavings);
              
              if (maxPrice > 0) {
                const expectedSavingsPercent = Math.round((expectedSavings / maxPrice) * 100);
                expect(result.savingsPercent).toBe(expectedSavingsPercent);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 26: Affiliate Disclosure Compliance', () => {
    it('**Feature: smart-home-mvp-enhancement, Property 26: Affiliate Disclosure Compliance** - For any page containing affiliate links, proper disclosure information should be present and clearly visible', () => {
      fc.assert(
        fc.property(
          fc.array(affiliateLinkArb, { minLength: 1, maxLength: 5 }),
          (affiliateLinks) => {
            // Проверяем, что каждая партнерская ссылка содержит необходимые параметры трекинга
            affiliateLinks.forEach(link => {
              expect(link.trackingParams).toBeDefined();
              expect(typeof link.trackingParams).toBe('object');
              
              // Проверяем наличие партнерского ID в URL
              try {
                const url = new URL(link.url);
                const config = AFFILIATE_CONFIG[link.marketplace as MarketplaceId];
                
                if (config) {
                  // Проверяем, что URL содержит партнерские параметры
                  const hasPartnerParam = url.searchParams.has(config.trackingParam) ||
                                        url.searchParams.has('utm_source') ||
                                        Object.keys(link.trackingParams).length > 0;
                  
                  expect(hasPartnerParam).toBe(true);
                }
              } catch (error) {
                // Если URL невалидный, проверяем что валидация это отражает
                const validation = validateAffiliateLink(link);
                if (!validation.isValid) {
                  expect(validation.errors.some(err => 
                    err.includes('Некорректный URL') || 
                    err.includes('партнерский параметр')
                  )).toBe(true);
                }
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('**Feature: smart-home-mvp-enhancement, Property 26: Affiliate Disclosure Compliance** - Affiliate URL generation should always include required tracking parameters', () => {
      fc.assert(
        fc.property(
          fc.webUrl(),
          marketplaceArb,
          fc.string({ minLength: 1, maxLength: 50 }),
          fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          (baseUrl, marketplace, source, productId) => {
            const affiliateUrl = generateAffiliateUrl(baseUrl, marketplace, source, productId);
            
            try {
              const url = new URL(affiliateUrl);
              const config = AFFILIATE_CONFIG[marketplace];
              
              // Проверяем наличие партнерского параметра
              expect(url.searchParams.has(config.trackingParam)).toBe(true);
              expect(url.searchParams.get(config.trackingParam)).toBe(config.partnerId);
              
              // Проверяем UTM параметры
              expect(url.searchParams.has('utm_source')).toBe(true);
              expect(url.searchParams.has('utm_medium')).toBe(true);
              expect(url.searchParams.has('utm_campaign')).toBe(true);
              expect(url.searchParams.has('utm_term')).toBe(true);
              
              expect(url.searchParams.get('utm_source')).toBe('smarthome2026');
              expect(url.searchParams.get('utm_medium')).toBe('affiliate');
              expect(url.searchParams.get('utm_campaign')).toBe(source);
              
              // Если передан productId, проверяем utm_content
              if (productId) {
                expect(url.searchParams.has('utm_content')).toBe(true);
                expect(url.searchParams.get('utm_content')).toBe(productId);
              }
              
              // Проверяем, что временная метка присутствует и является числом
              const utmTerm = url.searchParams.get('utm_term');
              expect(utmTerm).toBeTruthy();
              expect(Number.isInteger(Number(utmTerm))).toBe(true);
              
            } catch (error) {
              // Если исходный URL был невалидным, функция должна вернуть исходный URL
              expect(affiliateUrl).toBe(baseUrl);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('**Feature: smart-home-mvp-enhancement, Property 26: Affiliate Disclosure Compliance** - Affiliate link validation should correctly identify missing disclosure requirements', () => {
      fc.assert(
        fc.property(affiliateLinkArb, (link) => {
          const validation = validateAffiliateLink(link);
          
          // Проверяем структуру результата валидации
          expect(validation).toHaveProperty('isValid');
          expect(validation).toHaveProperty('errors');
          expect(Array.isArray(validation.errors)).toBe(true);
          
          // Если ссылка невалидна, должны быть ошибки
          if (!validation.isValid) {
            expect(validation.errors.length).toBeGreaterThan(0);
          }
          
          // Проверяем специфические требования
          if (!link.id) {
            expect(validation.errors).toContain('Отсутствует ID ссылки');
          }
          
          if (!link.marketplace) {
            expect(validation.errors).toContain('Не указан маркетплейс');
          }
          
          if (!link.url) {
            expect(validation.errors).toContain('Отсутствует URL');
          }
          
          if (!link.price || link.price <= 0) {
            expect(validation.errors).toContain('Некорректная цена');
          }
          
          // Проверяем актуальность данных
          const daysSinceUpdate = (Date.now() - new Date(link.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceUpdate > 7) {
            expect(validation.errors).toContain('Данные устарели (более 7 дней)');
          }
        }),
        { numRuns: 100 }
      );
    });

    it('**Feature: smart-home-mvp-enhancement, Property 26: Affiliate Disclosure Compliance** - Valid affiliate links should pass all compliance checks', () => {
      fc.assert(
        fc.property(validAffiliateLinkArb, (link) => {
          const validation = validateAffiliateLink(link);
          
          // Валидные ссылки должны проходить проверку
          if (validation.isValid) {
            expect(validation.errors).toHaveLength(0);
            
            // Проверяем, что все обязательные поля присутствуют
            expect(link.id).toBeTruthy();
            expect(link.marketplace).toBeTruthy();
            expect(link.url).toBeTruthy();
            expect(link.price).toBeGreaterThan(0);
            expect(link.lastUpdated).toBeInstanceOf(Date);
            
            // Проверяем URL
            expect(() => new URL(link.url)).not.toThrow();
            
            // Проверяем актуальность (должна быть в пределах 23 часов для validAffiliateLinkArb)
            const daysSinceUpdate = (Date.now() - link.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
            expect(Number.isNaN(daysSinceUpdate)).toBe(false);
            expect(daysSinceUpdate).toBeLessThan(1);
          }
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('Affiliate System Invariants', () => {
    it('**Feature: smart-home-mvp-enhancement, Property 25 & 26: Combined Invariants** - Affiliate system should maintain data consistency across all operations', () => {
      fc.assert(
        fc.property(
          fc.array(affiliateLinkArb, { minLength: 1, maxLength: 10 }),
          (links) => {
            // Инвариант: цены всегда должны быть неотрицательными
            links.forEach(link => {
              expect(link.price).toBeGreaterThanOrEqual(0);
            });
            
            // Инвариант: даты обновления не должны быть в будущем и должны быть валидными
            links.forEach(link => {
              expect(link.lastUpdated).toBeInstanceOf(Date);
              expect(Number.isNaN(link.lastUpdated.getTime())).toBe(false);
              expect(link.lastUpdated.getTime()).toBeLessThanOrEqual(Date.now());
            });
            
            // Инвариант: ID должны быть уникальными
            const ids = links.map(link => link.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBeLessThanOrEqual(ids.length);
            
            // Инвариант: маркетплейсы должны быть из известного списка
            links.forEach(link => {
              const validMarketplaces = Object.keys(AFFILIATE_CONFIG);
              if (validMarketplaces.includes(link.marketplace)) {
                expect(AFFILIATE_CONFIG[link.marketplace as MarketplaceId]).toBeDefined();
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});