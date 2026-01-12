import { describe, it, expect } from 'vitest';
import {
  generateOrganizationSchema,
  generateWebsiteSchema,
  generateProductSchema,
  generateMetaTags,
  sanitizeMetaContent,
  validateMetaLength,
  generateBreadcrumbSchema,
  generateFAQSchema
} from '../seoUtils';
import { products } from '@/data/products';

describe('SEO Utils', () => {
  describe('Schema Generation', () => {
    it('generates valid organization schema', () => {
      const schema = generateOrganizationSchema();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Organization');
      expect(schema.name).toBe('Smart Home 2026');
      expect(schema.url).toBe('https://smarthome2026.ru');
      expect(schema.contactPoint).toBeDefined();
      expect(schema.sameAs).toBeInstanceOf(Array);
    });

    it('generates valid website schema', () => {
      const schema = generateWebsiteSchema();
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('WebSite');
      expect(schema.name).toBe('Smart Home 2026');
      expect(schema.potentialAction).toBeDefined();
      expect(schema.potentialAction['@type']).toBe('SearchAction');
    });

    it('generates valid product schema', () => {
      const product = products[0];
      const schema = generateProductSchema(product);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('Product');
      expect(schema.name).toBe(product.name);
      expect(schema.brand.name).toBe(product.brand);
      expect(schema.offers).toBeDefined();
      expect(schema.offers['@type']).toBe('AggregateOffer');
      expect(schema.offers.offers).toBeInstanceOf(Array);
    });

    it('generates breadcrumb schema correctly', () => {
      const items = [
        { name: 'Главная', url: '/' },
        { name: 'Каталог', url: '/catalog' },
        { name: 'Умные розетки', url: '/catalog/sockets' }
      ];
      
      const schema = generateBreadcrumbSchema(items);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('BreadcrumbList');
      expect(schema.itemListElement).toHaveLength(3);
      expect(schema.itemListElement[0].position).toBe(1);
      expect(schema.itemListElement[0].name).toBe('Главная');
    });

    it('generates FAQ schema correctly', () => {
      const faqItems = [
        { question: 'Что такое умный дом?', answer: 'Система автоматизации дома' },
        { question: 'Как выбрать устройства?', answer: 'Нужно учитывать совместимость' }
      ];
      
      const schema = generateFAQSchema(faqItems);
      
      expect(schema['@context']).toBe('https://schema.org');
      expect(schema['@type']).toBe('FAQPage');
      expect(schema.mainEntity).toHaveLength(2);
      expect(schema.mainEntity[0]['@type']).toBe('Question');
      expect(schema.mainEntity[0].acceptedAnswer['@type']).toBe('Answer');
    });
  });

  describe('Meta Tags Generation', () => {
    it('generates meta tags with proper formatting', () => {
      const result = generateMetaTags(
        'Test Title',
        'Test description for SEO',
        ['test', 'seo', 'meta']
      );
      
      expect(result.title).toBe('Test Title | Smart Home 2026');
      expect(result.description).toBe('Test description for SEO');
      expect(result.keywords).toContain('test');
      expect(result.keywords).toContain('умный дом');
      expect(result.ogImage).toBe('/images/og-default.jpg');
    });

    it('truncates long descriptions', () => {
      const longDescription = 'A'.repeat(200);
      const result = generateMetaTags('Title', longDescription);
      
      expect(result.description.length).toBeLessThanOrEqual(160);
      expect(result.description).toMatch(/\.\.\.$/);
    });
  });

  describe('Content Sanitization', () => {
    it('sanitizes meta content correctly', () => {
      const dirtyContent = '<script>alert("xss")</script>Test   content   with   spaces';
      const clean = sanitizeMetaContent(dirtyContent);
      
      expect(clean).toBe('scriptalert("xss")/scriptTest content with spaces');
      expect(clean).not.toContain('<');
      expect(clean).not.toContain('>');
    });

    it('validates meta length correctly', () => {
      const longContent = 'A'.repeat(200);
      const validated = validateMetaLength(longContent, 160);
      
      expect(validated.length).toBeLessThanOrEqual(160);
      expect(validated).toMatch(/\.\.\.$/);
    });

    it('keeps short content unchanged', () => {
      const shortContent = 'Short content';
      const validated = validateMetaLength(shortContent, 160);
      
      expect(validated).toBe(shortContent);
    });
  });

  describe('Product Schema Edge Cases', () => {
    it('handles products without reviews', () => {
      const productWithoutReviews = {
        ...products[0],
        reviewsCount: 0,
        rating: 0
      };
      
      const schema = generateProductSchema(productWithoutReviews);
      
      expect(schema.aggregateRating).toBeUndefined();
    });

    it('handles products with single store', () => {
      const productWithOneStore = {
        ...products[0],
        stores: [products[0].stores[0]]
      };
      
      const schema = generateProductSchema(productWithOneStore);
      
      expect(schema.offers.lowPrice).toBe(schema.offers.highPrice);
      expect(schema.offers.offerCount).toBe(1);
    });

    it('handles products with multiple images', () => {
      const productWithImages = {
        ...products[0],
        images: [
          { url: 'image1.jpg', alt: 'Image 1', isPrimary: true },
          { url: 'image2.jpg', alt: 'Image 2', isPrimary: false },
          { url: 'image3.jpg', alt: 'Image 3', isPrimary: false }
        ]
      };
      
      const schema = generateProductSchema(productWithImages);
      
      expect(schema.image).toHaveLength(3);
      expect(schema.image).toContain('image1.jpg');
      expect(schema.image).toContain('image2.jpg');
      expect(schema.image).toContain('image3.jpg');
    });
  });
});