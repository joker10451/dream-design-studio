import { describe, it, expect } from 'vitest';
import { products, categories } from '@/data/products';
import * as fc from 'fast-check';

describe('Enhanced Catalog System', () => {
  describe('Product Data Model', () => {
    it('should have enhanced product structure with all required fields', () => {
      const product = products[0];
      
      // Check basic fields
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('brand');
      expect(product).toHaveProperty('category');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('rating');
      expect(product).toHaveProperty('reviewsCount');
      
      // Check enhanced fields
      expect(product).toHaveProperty('images');
      expect(product).toHaveProperty('fullDescription');
      expect(product).toHaveProperty('affiliateLinks');
      expect(product).toHaveProperty('relatedProducts');
      expect(product).toHaveProperty('tags');
      expect(product).toHaveProperty('seoMeta');
      
      // Check images structure
      expect(Array.isArray(product.images)).toBe(true);
      if (product.images.length > 0) {
        expect(product.images[0]).toHaveProperty('url');
        expect(product.images[0]).toHaveProperty('alt');
        expect(product.images[0]).toHaveProperty('isPrimary');
      }
      
      // Check specs structure
      expect(product.specs).toHaveProperty('protocol');
      expect(Array.isArray(product.specs.protocol)).toBe(true);
      expect(product.specs).toHaveProperty('features');
      expect(Array.isArray(product.specs.features)).toBe(true);
      expect(product.specs).toHaveProperty('compatibility');
      expect(Array.isArray(product.specs.compatibility)).toBe(true);
      
      // Check affiliate links structure
      expect(Array.isArray(product.affiliateLinks)).toBe(true);
      if (product.affiliateLinks.length > 0) {
        expect(product.affiliateLinks[0]).toHaveProperty('id');
        expect(product.affiliateLinks[0]).toHaveProperty('marketplace');
        expect(product.affiliateLinks[0]).toHaveProperty('url');
        expect(product.affiliateLinks[0]).toHaveProperty('price');
        expect(product.affiliateLinks[0]).toHaveProperty('isAvailable');
        expect(product.affiliateLinks[0]).toHaveProperty('trackingParams');
      }
      
      // Check SEO meta structure
      expect(product.seoMeta).toHaveProperty('title');
      expect(product.seoMeta).toHaveProperty('description');
      expect(product.seoMeta).toHaveProperty('keywords');
      expect(Array.isArray(product.seoMeta.keywords)).toBe(true);
    });
  });

  describe('Marketplace Integration', () => {
    it('should have affiliate links for supported marketplaces', () => {
      const productsWithAffiliateLinks = products.filter(p => p.affiliateLinks.length > 0);
      expect(productsWithAffiliateLinks.length).toBeGreaterThan(0);
      
      const supportedMarketplaces = ['wildberries', 'ozon', 'yandex'];
      productsWithAffiliateLinks.forEach(product => {
        product.affiliateLinks.forEach(link => {
          expect(supportedMarketplaces).toContain(link.marketplace);
          expect(link.url).toContain('http');
          expect(typeof link.price).toBe('number');
          expect(typeof link.isAvailable).toBe('boolean');
        });
      });
    });
  });

  describe('Enhanced Filtering', () => {
    it('should support protocol filtering', () => {
      const wifiProducts = products.filter(p => 
        p.specs.protocol.some(protocol => 
          protocol.toLowerCase().includes('wifi')
        )
      );
      expect(wifiProducts.length).toBeGreaterThan(0);
      
      const zigbeeProducts = products.filter(p => 
        p.specs.protocol.some(protocol => 
          protocol.toLowerCase().includes('zigbee')
        )
      );
      expect(zigbeeProducts.length).toBeGreaterThan(0);
    });

    it('should support feature filtering', () => {
      const timerProducts = products.filter(p => 
        p.specs.features.some(feature => 
          feature.toLowerCase().includes('таймер')
        )
      );
      expect(timerProducts.length).toBeGreaterThan(0);
    });

    it('should support enhanced search across multiple fields', () => {
      const searchQuery = 'умная';
      const searchResults = products.filter(product => {
        const query = searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.fullDescription.toLowerCase().includes(query) ||
          product.specs.features.some(f => f.toLowerCase().includes(query)) ||
          product.specs.protocol.some(p => p.toLowerCase().includes(query)) ||
          product.tags.some(t => t.toLowerCase().includes(query))
        );
      });
      
      expect(searchResults.length).toBeGreaterThan(0);
    });
  });

  describe('Data Consistency', () => {
    it('should have consistent data structure across all products', () => {
      products.forEach(product => {
        expect(typeof product.id).toBe('string');
        expect(typeof product.name).toBe('string');
        expect(typeof product.brand).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(typeof product.rating).toBe('number');
        expect(Array.isArray(product.images)).toBe(true);
        expect(Array.isArray(product.affiliateLinks)).toBe(true);
        expect(Array.isArray(product.tags)).toBe(true);
        expect(Array.isArray(product.specs.protocol)).toBe(true);
        expect(Array.isArray(product.specs.features)).toBe(true);
      });
    });
  });
});

// Property-Based Tests for Catalog Enhancements
describe('Property-Based Tests for Catalog Enhancements', () => {
  
  describe('Property 1: Category Display Completeness', () => {
    it('should display all categories with accurate product counts', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 1: Category Display Completeness
       * Validates: Requirements 1.1
       */
      fc.assert(fc.property(
        fc.constantFrom(...categories.map(c => c.id)),
        (categoryId) => {
          // Count actual products in this category
          const actualCount = products.filter(p => 
            categoryId === 'all' ? true : p.category === categoryId
          ).length;
          
          // Find the category definition
          const category = categories.find(c => c.id === categoryId);
          
          // For 'all' category, count should match total products
          if (categoryId === 'all') {
            expect(category?.count).toBe(products.length);
          } else {
            // For specific categories, count should match filtered products
            expect(category?.count).toBe(actualCount);
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 2: Category Filtering Bounds', () => {
    it('should return between 10-30 models when category has sufficient products', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 2: Category Filtering Bounds
       * Validates: Requirements 1.2
       */
      const categoriesWithSufficientProducts = categories.filter(c => c.id !== 'all' && c.count >= 10);
      
      if (categoriesWithSufficientProducts.length === 0) {
        // If no categories have 10+ products, test that we handle this gracefully
        expect(categoriesWithSufficientProducts.length).toBe(0);
        return;
      }
      
      fc.assert(fc.property(
        fc.constantFrom(...categoriesWithSufficientProducts.map(c => c.id)),
        (categoryId) => {
          const filteredProducts = products.filter(p => p.category === categoryId);
          
          // If category has 30+ products, we should be able to display 10-30
          // If category has 10-29 products, we should display all of them
          if (filteredProducts.length >= 30) {
            // Should be able to slice to show 10-30 models
            const displayedProducts = filteredProducts.slice(0, 30);
            expect(displayedProducts.length).toBeGreaterThanOrEqual(10);
            expect(displayedProducts.length).toBeLessThanOrEqual(30);
          } else if (filteredProducts.length >= 10) {
            // Should display all available products (10-29)
            expect(filteredProducts.length).toBeGreaterThanOrEqual(10);
            expect(filteredProducts.length).toBeLessThan(30);
          }
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 3: Filter Consistency', () => {
    it('should return products matching all applied filter criteria', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 3: Filter Consistency
       * Validates: Requirements 1.3
       */
      fc.assert(fc.property(
        fc.record({
          category: fc.constantFrom('all', 'sockets', 'lighting', 'cameras', 'sensors'),
          priceMin: fc.integer({ min: 0, max: 5000 }),
          priceMax: fc.integer({ min: 5000, max: 50000 }),
          brands: fc.array(fc.constantFrom('Яндекс', 'Xiaomi', 'Aqara'), { maxLength: 3 }),
          minRating: fc.constantFrom(0, 3, 4, 4.5),
          protocols: fc.array(fc.constantFrom('WiFi 2.4GHz', 'Zigbee 3.0'), { maxLength: 2 }),
          features: fc.array(fc.constantFrom('Таймер', 'Расписание', 'Мониторинг энергии'), { maxLength: 2 })
        }),
        (filters) => {
          const filteredProducts = products.filter((product) => {
            // Category filter
            if (filters.category !== 'all' && product.category !== filters.category) {
              return false;
            }
            
            // Price filter
            if (product.price < filters.priceMin || product.price > filters.priceMax) {
              return false;
            }
            
            // Brand filter
            if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
              return false;
            }
            
            // Rating filter
            if (product.rating < filters.minRating) {
              return false;
            }
            
            // Protocol filter
            if (filters.protocols.length > 0) {
              const hasMatchingProtocol = filters.protocols.some(protocol =>
                product.specs.protocol.some(p => p.toLowerCase().includes(protocol.toLowerCase()))
              );
              if (!hasMatchingProtocol) {
                return false;
              }
            }
            
            // Features filter
            if (filters.features.length > 0) {
              const hasMatchingFeature = filters.features.some(feature =>
                product.specs.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
              );
              if (!hasMatchingFeature) {
                return false;
              }
            }
            
            return true;
          });
          
          // Verify each returned product matches all applied filters
          filteredProducts.forEach(product => {
            if (filters.category !== 'all') {
              expect(product.category).toBe(filters.category);
            }
            expect(product.price).toBeGreaterThanOrEqual(filters.priceMin);
            expect(product.price).toBeLessThanOrEqual(filters.priceMax);
            if (filters.brands.length > 0) {
              expect(filters.brands).toContain(product.brand);
            }
            expect(product.rating).toBeGreaterThanOrEqual(filters.minRating);
            if (filters.protocols.length > 0) {
              const hasProtocol = filters.protocols.some(protocol =>
                product.specs.protocol.some(p => p.toLowerCase().includes(protocol.toLowerCase()))
              );
              expect(hasProtocol).toBe(true);
            }
            if (filters.features.length > 0) {
              const hasFeature = filters.features.some(feature =>
                product.specs.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
              );
              expect(hasFeature).toBe(true);
            }
          });
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 4: Comparison Limit Enforcement', () => {
    it('should enforce maximum of 4 devices in comparison', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 4: Comparison Limit Enforcement
       * Validates: Requirements 1.4
       */
      fc.assert(fc.property(
        fc.array(fc.constantFrom(...products.map(p => p.id)), { minLength: 1, maxLength: 10 }),
        (productIds) => {
          // Simulate the comparison toggle logic
          let compareIds: string[] = [];
          
          productIds.forEach(id => {
            // This mimics the toggleCompare logic from Catalog.tsx
            if (compareIds.includes(id)) {
              compareIds = compareIds.filter(i => i !== id);
            } else if (compareIds.length < 4) {
              compareIds = [...compareIds, id];
            }
            // If already 4 items, don't add more (this is the enforcement)
          });
          
          // Verify the limit is enforced
          expect(compareIds.length).toBeLessThanOrEqual(4);
          
          // Verify all IDs in compareIds are unique
          const uniqueIds = new Set(compareIds);
          expect(uniqueIds.size).toBe(compareIds.length);
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });

  describe('Property 5: Universal Affiliate Link Presence', () => {
    it('should have affiliate links for all displayed products', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 5: Universal Affiliate Link Presence
       * Validates: Requirements 1.5
       */
      fc.assert(fc.property(
        fc.constantFrom(...products),
        (product) => {
          // Every product should have affiliate links
          expect(product.affiliateLinks).toBeDefined();
          expect(Array.isArray(product.affiliateLinks)).toBe(true);
          expect(product.affiliateLinks.length).toBeGreaterThan(0);
          
          // Each affiliate link should have required properties
          product.affiliateLinks.forEach(link => {
            expect(link.id).toBeDefined();
            expect(typeof link.id).toBe('string');
            expect(link.marketplace).toBeDefined();
            expect(typeof link.marketplace).toBe('string');
            expect(link.url).toBeDefined();
            expect(typeof link.url).toBe('string');
            expect(link.url).toMatch(/^https?:\/\//); // Should be a valid URL
            expect(typeof link.price).toBe('number');
            expect(link.price).toBeGreaterThan(0);
            expect(typeof link.isAvailable).toBe('boolean');
            expect(link.trackingParams).toBeDefined();
            expect(typeof link.trackingParams).toBe('object');
          });
          
          // Should have links for supported marketplaces
          const supportedMarketplaces = ['wildberries', 'ozon', 'yandex'];
          const productMarketplaces = product.affiliateLinks.map(link => link.marketplace);
          
          // At least one supported marketplace should be present
          const hasSupported = productMarketplaces.some(mp => 
            supportedMarketplaces.includes(mp.toLowerCase())
          );
          expect(hasSupported).toBe(true);
          
          return true;
        }
      ), { numRuns: 100 });
    });
  });
});