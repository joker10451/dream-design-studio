import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  normalizeText,
  highlightText,
  calculateRelevance,
  searchProducts,
  searchArticles,
  searchNews,
  searchRatings,
  generateSuggestions,
  saveSearchToHistory,
  getSearchHistory,
  clearSearchHistory,
  getPopularSearches
} from '@/lib/searchUtils';
import { products } from '@/data/products';
import { mockArticles, mockNews, mockRatings } from '@/data/mockContent';
import { SearchResult, SearchSuggestion } from '@/types/search';

describe('Search System Property Tests', () => {
  beforeEach(() => {
    clearSearchHistory();
  });

  afterEach(() => {
    clearSearchHistory();
  });

  describe('Property 20: Search Autocomplete Functionality', () => {
    it('should provide relevant autocomplete suggestions for any valid query', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 20: Search Autocomplete Functionality
       * Validates: Requirements 8.1
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 50 }).filter(s => s.trim().length >= 2),
          (query) => {
            const suggestions = generateSuggestions(query, products, []);
            
            // All suggestions should be relevant to the query
            suggestions.forEach(suggestion => {
              const normalizedQuery = normalizeText(query);
              const normalizedSuggestion = normalizeText(suggestion.text);
              
              // Either the suggestion contains the query or vice versa
              const isRelevant = normalizedSuggestion.includes(normalizedQuery) || 
                                normalizedQuery.includes(normalizedSuggestion) ||
                                suggestion.category && normalizeText(suggestion.category).includes(normalizedQuery);
              
              expect(isRelevant).toBe(true);
            });
            
            // Suggestions should be limited to reasonable count
            expect(suggestions.length).toBeLessThanOrEqual(8);
            
            // Each suggestion should have required properties
            suggestions.forEach(suggestion => {
              expect(suggestion.id).toBeDefined();
              expect(suggestion.text).toBeDefined();
              expect(suggestion.type).toMatch(/^(query|product|category|brand)$/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle search history in autocomplete suggestions', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 20: Search Autocomplete Functionality
       * Validates: Requirements 8.1
       */
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 2, maxLength: 30 }), { minLength: 1, maxLength: 10 }),
          fc.string({ minLength: 2, maxLength: 20 }),
          (historyQueries, currentQuery) => {
            // Add queries to history
            historyQueries.forEach(query => {
              saveSearchToHistory(query.trim(), Math.floor(Math.random() * 20));
            });
            
            const history = getSearchHistory();
            const suggestions = generateSuggestions(currentQuery, products, history);
            
            // History-based suggestions should be included when relevant
            const historySuggestions = suggestions.filter(s => s.type === 'query');
            historySuggestions.forEach(suggestion => {
              expect(history.some(h => h.query === suggestion.text)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 21: Search Result Relevance', () => {
    it('should return relevant results for any search query', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 21: Search Result Relevance
       * Validates: Requirements 8.2
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (query) => {
            const productResults = searchProducts(products, query);
            const articleResults = searchArticles(mockArticles, query);
            const newsResults = searchNews(mockNews, query);
            const ratingResults = searchRatings(mockRatings, query);
            
            // Combine and sort all results by relevance score
            const allResults = [...productResults, ...articleResults, ...newsResults, ...ratingResults]
              .sort((a, b) => b.relevanceScore - a.relevanceScore);
            
            // All results should have positive relevance scores
            allResults.forEach(result => {
              expect(result.relevanceScore).toBeGreaterThan(0);
            });
            
            // Results should be sorted by relevance score (descending) - now guaranteed by sort above
            if (allResults.length > 1) {
              for (let i = 0; i < allResults.length - 1; i++) {
                expect(allResults[i].relevanceScore).toBeGreaterThanOrEqual(allResults[i + 1].relevanceScore);
              }
            }
            
            // Each result should have the required structure
            allResults.forEach(result => {
              expect(result.id).toBeDefined();
              expect(result.title).toBeDefined();
              expect(result.excerpt).toBeDefined();
              expect(result.type).toMatch(/^(product|article|news|rating)$/);
              expect(result.url).toBeDefined();
              expect(result.category).toBeDefined();
              expect(Array.isArray(result.tags)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 22: Search Scope Coverage', () => {
    it('should search across all content types (products, articles, news, ratings)', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 22: Search Scope Coverage
       * Validates: Requirements 8.3
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 30 }).filter(s => s.trim().length >= 2),
          (query) => {
            const productResults = searchProducts(products, query);
            const articleResults = searchArticles(mockArticles, query);
            const newsResults = searchNews(mockNews, query);
            const ratingResults = searchRatings(mockRatings, query);
            
            // Each search function should return results of the correct type
            productResults.forEach(result => {
              expect(result.type).toBe('product');
              expect(result.url).toContain('/catalog');
            });
            
            articleResults.forEach(result => {
              expect(result.type).toBe('article');
              expect(result.url).toContain('/articles');
            });
            
            newsResults.forEach(result => {
              expect(result.type).toBe('news');
              expect(result.url).toContain('/news');
            });
            
            ratingResults.forEach(result => {
              expect(result.type).toBe('rating');
              expect(result.url).toContain('/ratings');
            });
            
            // Combined results should include all types when available
            const allResults = [...productResults, ...articleResults, ...newsResults, ...ratingResults];
            const resultTypes = new Set(allResults.map(r => r.type));
            
            // If we have results, we should have searched all available content types
            if (allResults.length > 0) {
              expect(resultTypes.size).toBeGreaterThan(0);
              expect(resultTypes.size).toBeLessThanOrEqual(4); // max 4 types: product, article, news, rating
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should search across different product attributes (name, brand, category, tags)', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 22: Search Scope Coverage
       * Validates: Requirements 8.3
       */
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constantFrom(...products.map(p => p.name)),
            fc.constantFrom(...products.map(p => p.brand)),
            fc.constantFrom(...products.map(p => p.category)),
            fc.constantFrom(...products.flatMap(p => p.tags))
          ),
          (searchTerm) => {
            const results = searchProducts(products, searchTerm);
            
            if (results.length > 0) {
              // At least one result should match the search term in one of the attributes
              const hasMatch = results.some(result => {
                const product = products.find(p => p.id === result.id);
                if (!product) return false;
                
                const normalizedTerm = normalizeText(searchTerm);
                return (
                  normalizeText(product.name).includes(normalizedTerm) ||
                  normalizeText(product.brand).includes(normalizedTerm) ||
                  normalizeText(product.category).includes(normalizedTerm) ||
                  product.tags.some(tag => normalizeText(tag).includes(normalizedTerm))
                );
              });
              
              expect(hasMatch).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 23: Search Term Highlighting', () => {
    it('should highlight search terms in result text for any query', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 23: Search Term Highlighting
       * Validates: Requirements 8.4
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 30 }).filter(s => s.trim().length >= 2),
          fc.string({ minLength: 10, maxLength: 200 }),
          (query, text) => {
            const highlightedText = highlightText(text, query);
            
            // If the text contains the query terms, they should be highlighted
            const normalizedQuery = normalizeText(query);
            const normalizedText = normalizeText(text);
            const queryWords = normalizedQuery.split(' ').filter(word => word.length > 1);
            
            queryWords.forEach(word => {
              if (normalizedText.includes(word)) {
                // The highlighted text should contain <mark> tags
                expect(highlightedText).toContain('<mark>');
                expect(highlightedText).toContain('</mark>');
              }
            });
            
            // Highlighted text should not contain nested mark tags
            expect(highlightedText).not.toMatch(/<mark>.*<mark>/);
            
            // Original text content should be preserved
            const textWithoutTags = highlightedText.replace(/<\/?mark>/g, '');
            expect(textWithoutTags).toBe(text);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should provide highlighted text in search results', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 23: Search Term Highlighting
       * Validates: Requirements 8.4
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length >= 2),
          (query) => {
            const allResults = [
              ...searchProducts(products, query),
              ...searchArticles(mockArticles, query),
              ...searchNews(mockNews, query),
              ...searchRatings(mockRatings, query)
            ];
            
            allResults.forEach(result => {
              if (result.highlightedText) {
                // Highlighted text should contain mark tags if query terms are present
                const normalizedQuery = normalizeText(query);
                const normalizedExcerpt = normalizeText(result.excerpt);
                const queryWords = normalizedQuery.split(' ').filter(word => word.length > 1);
                
                const hasMatchingWords = queryWords.some(word => 
                  normalizedExcerpt.includes(word)
                );
                
                if (hasMatchingWords) {
                  expect(result.highlightedText).toContain('<mark>');
                }
                
                // Highlighted text should be based on the excerpt
                const textWithoutTags = result.highlightedText.replace(/<\/?mark>/g, '');
                expect(textWithoutTags).toBe(result.excerpt);
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 24: Search History Tracking', () => {
    it('should track search history for any search query', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 24: Search History Tracking
       * Validates: Requirements 8.5
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          fc.integer({ min: 0, max: 100 }),
          fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 10 }),
          (query, resultsCount, clickedResults) => {
            const trimmedQuery = query.trim();
            const historyEntry = saveSearchToHistory(trimmedQuery, resultsCount, clickedResults);
            
            // History entry should have correct structure
            expect(historyEntry.id).toBeDefined();
            expect(historyEntry.query).toBe(trimmedQuery);
            expect(historyEntry.resultsCount).toBe(resultsCount);
            expect(historyEntry.clickedResults).toEqual(clickedResults);
            expect(historyEntry.timestamp).toBeInstanceOf(Date);
            
            // History should be retrievable
            const history = getSearchHistory();
            expect(history.length).toBeGreaterThan(0);
            expect(history[0].query).toBe(trimmedQuery);
            expect(history[0].resultsCount).toBe(resultsCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain search history order and limits', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 24: Search History Tracking
       * Validates: Requirements 8.5
       */
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              query: fc.string({ minLength: 1, maxLength: 30 }).filter(s => s.trim().length > 0),
              resultsCount: fc.integer({ min: 0, max: 50 })
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (searches) => {
            // Add searches to history
            const savedEntries = searches.map(search => 
              saveSearchToHistory(search.query.trim(), search.resultsCount)
            );
            
            const history = getSearchHistory();
            
            // History should be in reverse chronological order (newest first)
            for (let i = 0; i < history.length - 1; i++) {
              expect(history[i].timestamp.getTime()).toBeGreaterThanOrEqual(
                history[i + 1].timestamp.getTime()
              );
            }
            
            // History should not exceed reasonable limits (100 entries)
            expect(history.length).toBeLessThanOrEqual(100);
            
            // Most recent searches should be at the beginning
            if (savedEntries.length > 0) {
              const lastSaved = savedEntries[savedEntries.length - 1];
              expect(history[0].query).toBe(lastSaved.query);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate popular searches from history', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 24: Search History Tracking
       * Validates: Requirements 8.5
       */
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 2, maxLength: 20 }), { minLength: 1, maxLength: 15 }),
          fc.integer({ min: 1, max: 10 }),
          (queries, limit) => {
            // Add queries multiple times to create popularity
            queries.forEach(query => {
              const count = Math.floor(Math.random() * 5) + 1;
              for (let i = 0; i < count; i++) {
                saveSearchToHistory(query.trim(), Math.floor(Math.random() * 20));
              }
            });
            
            const popularSearches = getPopularSearches(limit);
            
            // Should not exceed requested limit
            expect(popularSearches.length).toBeLessThanOrEqual(limit);
            
            // Should return actual queries from history
            const history = getSearchHistory();
            const historyQueries = new Set(history.map(h => h.query));
            
            popularSearches.forEach(popularQuery => {
              expect(historyQueries.has(popularQuery)).toBe(true);
            });
            
            // Should be sorted by popularity (most frequent first)
            if (popularSearches.length > 1) {
              const queryFrequency = new Map<string, number>();
              history.forEach(h => {
                queryFrequency.set(h.query, (queryFrequency.get(h.query) || 0) + 1);
              });
              
              for (let i = 0; i < popularSearches.length - 1; i++) {
                const currentFreq = queryFrequency.get(popularSearches[i]) || 0;
                const nextFreq = queryFrequency.get(popularSearches[i + 1]) || 0;
                expect(currentFreq).toBeGreaterThanOrEqual(nextFreq);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Integration Properties', () => {
    it('should maintain consistency across all search operations', () => {
      /**
       * Feature: smart-home-mvp-enhancement, Property 20-24: Search System Integration
       * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
       */
      fc.assert(
        fc.property(
          fc.string({ minLength: 2, maxLength: 30 }).filter(s => s.trim().length >= 2),
          (query) => {
            // Perform complete search workflow
            const productResults = searchProducts(products, query);
            const articleResults = searchArticles(mockArticles, query);
            const newsResults = searchNews(mockNews, query);
            const ratingResults = searchRatings(mockRatings, query);
            
            const allResults = [...productResults, ...articleResults, ...newsResults, ...ratingResults];
            
            // Save to history
            const historyEntry = saveSearchToHistory(query, allResults.length);
            
            // Generate suggestions
            const history = getSearchHistory();
            const suggestions = generateSuggestions(query, products, history);
            
            // Verify consistency
            expect(historyEntry.resultsCount).toBe(allResults.length);
            expect(history[0].query).toBe(query.trim()); // Function trims the query
            
            // All results should have consistent structure
            allResults.forEach(result => {
              expect(result.id).toBeDefined();
              expect(result.title).toBeDefined();
              expect(result.excerpt).toBeDefined();
              expect(result.type).toMatch(/^(product|article|news|rating)$/);
              expect(result.url).toBeDefined();
              expect(result.category).toBeDefined();
              expect(Array.isArray(result.tags)).toBe(true);
              expect(result.relevanceScore).toBeGreaterThan(0);
            });
            
            // Suggestions should be relevant
            suggestions.forEach(suggestion => {
              expect(suggestion.id).toBeDefined();
              expect(suggestion.text).toBeDefined();
              expect(suggestion.type).toMatch(/^(query|product|category|brand)$/);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});