import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
    generateRSSFeed,
    convertArticleToRSSItem,
    convertNewsToRSSItem,
    convertRatingToRSSItem,
    validateRSSFeed
} from '../rssGenerator';
import type { Article, NewsItem, Rating } from '@/data/content';

// Генераторы данных
const authorArbitrary = fc.record({
    id: fc.string(),
    name: fc.string({ minLength: 1 }),
    email: fc.emailAddress()
});

const categoryArbitrary = fc.record({
    id: fc.string(),
    name: fc.string({ minLength: 1 }),
    slug: fc.string()
});

const seoMetaArbitrary = fc.record({
    title: fc.string(),
    description: fc.string(),
    keywords: fc.array(fc.string())
});

const commonDateRange = { min: new Date('2020-01-01'), max: new Date('2030-12-31') };

const articleArbitrary = fc.record({
    id: fc.string(),
    title: fc.string({ minLength: 1 }),
    slug: fc.string({ minLength: 1 }),
    excerpt: fc.string(),
    content: fc.string(),
    category: categoryArbitrary,
    tags: fc.array(fc.record({ id: fc.string(), name: fc.string(), slug: fc.string() })),
    publishedAt: fc.date(commonDateRange),
    author: authorArbitrary,
    featuredImage: fc.oneof(fc.constant(undefined), fc.webUrl()),
    readingTime: fc.integer(),
    status: fc.constantFrom('published', 'draft', 'archived'),
    seoMeta: seoMetaArbitrary,
    relatedArticles: fc.array(fc.string()),
    relatedProducts: fc.array(fc.string()),
    affiliateLinks: fc.array(fc.anything())
}) as fc.Arbitrary<Article>;

const newsItemArbitrary = fc.record({
    id: fc.string(),
    title: fc.string({ minLength: 1 }),
    slug: fc.string({ minLength: 1 }),
    excerpt: fc.string(),
    content: fc.string(),
    publishedAt: fc.date(commonDateRange),
    author: authorArbitrary,
    category: fc.constantFrom('industry', 'products', 'reviews', 'events', 'technology'),
    tags: fc.array(fc.record({ id: fc.string(), name: fc.string(), slug: fc.string() })),
    priority: fc.constantFrom('low', 'normal', 'high', 'urgent'),
    featuredImage: fc.oneof(fc.constant(undefined), fc.webUrl()),
    seoMeta: seoMetaArbitrary,
    relatedNews: fc.array(fc.string()),
    relatedProducts: fc.array(fc.string()),
    relatedArticles: fc.array(fc.string())
}) as fc.Arbitrary<NewsItem>;

const ratingArbitrary = fc.record({
    id: fc.string(),
    title: fc.string({ minLength: 1 }),
    slug: fc.string({ minLength: 1 }),
    description: fc.string(),
    category: fc.string(),
    publishedAt: fc.date(commonDateRange),
    author: authorArbitrary,
    products: fc.array(fc.anything()),
    criteria: fc.array(fc.anything()),
    featuredImage: fc.oneof(fc.constant(undefined), fc.webUrl()),
    seoMeta: seoMetaArbitrary,
    relatedRatings: fc.array(fc.string()),
    relatedArticles: fc.array(fc.string())
}) as fc.Arbitrary<Rating>;

describe('RSS Feed Property Tests', () => {
    describe('Generator Validation', () => {
        it('should always generate valid RSS XML structure', () => {
            fc.assert(
                fc.property(
                    fc.array(articleArbitrary, { maxLength: 5 }),
                    fc.array(newsItemArbitrary, { maxLength: 5 }),
                    fc.array(ratingArbitrary, { maxLength: 5 }),
                    (articles, news, ratings) => {
                        const rss = generateRSSFeed(articles, news, ratings);
                        const validation = validateRSSFeed(rss);

                        expect(validation.isValid).toBe(true);
                        expect(validation.errors).toHaveLength(0);
                    }
                )
            );
        });

        it('should contain all required channel elements', () => {
            fc.assert(
                fc.property(
                    fc.array(articleArbitrary, { maxLength: 1 }),
                    (articles) => {
                        const rss = generateRSSFeed(articles);
                        expect(rss).toContain('<title>');
                        expect(rss).toContain('<description>');
                        expect(rss).toContain('<link>');
                        expect(rss).toContain('<language>');
                        expect(rss).toContain('<lastBuildDate>');
                    }
                )
            );
        });
    });

    describe('Item Properties', () => {
        it('should correctly format article dates to UTC string', () => {
            fc.assert(
                fc.property(articleArbitrary, (article) => {
                    const rss = generateRSSFeed([article]);
                    const expectedDate = article.publishedAt.toUTCString();
                    expect(rss).toContain(`<pubDate>${expectedDate}</pubDate>`);
                })
            );
        });

        it('should include enclosure if featured image is present', () => {
            fc.assert(
                fc.property(
                    articleArbitrary.filter(a => !!a.featuredImage),
                    (article) => {
                        const rss = generateRSSFeed([article]);
                        expect(rss).toContain('<enclosure');
                        expect(rss).toContain(`url="${article.featuredImage}"`);
                    }
                )
            );
        });

        it('should escape special characters in titles and descriptions', () => {
            const specialArticle = {
                ...fc.sample(articleArbitrary, 1)[0],
                title: 'Title with & < > " \'',
                excerpt: 'Description with & < > " \''
            };

            const rss = generateRSSFeed([specialArticle]);
            expect(rss).not.toContain('Title with & < > " \'');
            expect(rss).toContain('Title with &amp; &lt; &gt; &quot; &#39;');
        });

        it('should use unique GUIDs based on absolute URLs', () => {
            fc.assert(
                fc.property(
                    fc.array(articleArbitrary, { minLength: 2, maxLength: 10 }),
                    (articles) => {
                        // Ensure unique slugs
                        const uniqueArticles = articles.map((a, i) => ({ ...a, slug: `slug-${i}` }));
                        const rss = generateRSSFeed(uniqueArticles);

                        uniqueArticles.forEach(article => {
                            expect(rss).toContain(`<guid isPermaLink="true">https://smarthome2026.ru/guides/${article.slug}</guid>`);
                        });
                    }
                )
            );
        });
    });

    describe('Content Integrity', () => {
        it('should limit the number of items in the feed', () => {
            fc.assert(
                fc.property(
                    fc.array(articleArbitrary, { minLength: 10, maxLength: 20 }),
                    fc.integer({ min: 1, max: 5 }),
                    (articles, limit) => {
                        const rss = generateRSSFeed(articles, [], [], limit);
                        const itemMatches = rss.match(/<item>/g) || [];
                        expect(itemMatches.length).toBeLessThanOrEqual(limit);
                    }
                )
            );
        });
    });
});
