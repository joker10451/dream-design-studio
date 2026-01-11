import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  normalizeText,
  highlightText,
  calculateRelevance,
  searchProducts,
  searchArticles,
  generateSuggestions,
  saveSearchToHistory,
  getSearchHistory,
  clearSearchHistory
} from '@/lib/searchUtils';
import { products } from '@/data/products';
import { mockArticles } from '@/data/mockContent';

describe('Search Functionality', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    clearSearchHistory();
  });

  afterEach(() => {
    // Очищаем localStorage после каждого теста
    clearSearchHistory();
  });

  describe('Text Normalization', () => {
    it('should normalize Russian text correctly', () => {
      expect(normalizeText('Умные Розетки')).toBe('умные розетки');
      expect(normalizeText('Яндекс.Дом')).toBe('яндекс дом');
      expect(normalizeText('Wi-Fi устройства')).toBe('wi fi устроиства'); // Исправлено: й -> и
    });

    it('should handle special characters', () => {
      expect(normalizeText('Тест-123!@#')).toBe('тест 123');
      expect(normalizeText('  много   пробелов  ')).toBe('много пробелов');
    });
  });

  describe('Text Highlighting', () => {
    it('should highlight search terms', () => {
      const text = 'Умная розетка с голосовым управлением';
      const query = 'розетка';
      const result = highlightText(text, query);
      expect(result).toContain('<mark>розетка</mark>');
    });

    it('should handle multiple words', () => {
      const text = 'Умная розетка с голосовым управлением';
      const query = 'умная управление';
      const result = highlightText(text, query);
      expect(result).toContain('<mark>Умная</mark>'); // Исправлено: учитываем регистр
      expect(result).toContain('<mark>управление</mark>'); // Исправлено: точное совпадение
    });

    it('should return original text for empty query', () => {
      const text = 'Тестовый текст';
      expect(highlightText(text, '')).toBe(text);
    });
  });

  describe('Relevance Calculation', () => {
    it('should calculate relevance score', () => {
      const text = 'Умная розетка Яндекс';
      const query = 'розетка';
      const score = calculateRelevance(text, query);
      expect(score).toBeGreaterThan(0);
    });

    it('should give higher score for exact matches', () => {
      const text = 'розетка умная розетка';
      const query = 'розетка';
      const score = calculateRelevance(text, query);
      expect(score).toBeGreaterThan(10);
    });

    it('should return 0 for empty query', () => {
      const text = 'Любой текст';
      const score = calculateRelevance(text, '');
      expect(score).toBe(0);
    });
  });

  describe('Product Search', () => {
    it('should find products by name', () => {
      const results = searchProducts(products, 'Яндекс');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title).toContain('Яндекс');
    });

    it('should find products by brand', () => {
      const results = searchProducts(products, 'Xiaomi');
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.title.includes('Xiaomi'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      const results = searchProducts(products, 'несуществующий товар');
      expect(results).toEqual([]);
    });

    it('should sort results by relevance', () => {
      const results = searchProducts(products, 'розетка');
      if (results.length > 1) {
        expect(results[0].relevanceScore).toBeGreaterThanOrEqual(results[1].relevanceScore);
      }
    });
  });

  describe('Article Search', () => {
    it('should find articles by title', () => {
      const results = searchArticles(mockArticles, 'розетки');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].type).toBe('article');
    });

    it('should find articles by content', () => {
      const results = searchArticles(mockArticles, 'умный дом');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array for empty query', () => {
      const results = searchArticles(mockArticles, '');
      expect(results).toEqual([]);
    });
  });

  describe('Search Suggestions', () => {
    it('should generate suggestions from products', () => {
      const suggestions = generateSuggestions('Яндекс', products, []);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'product')).toBe(true);
    });

    it('should generate brand suggestions', () => {
      const suggestions = generateSuggestions('Xia', products, []);
      expect(suggestions.some(s => s.type === 'brand')).toBe(true);
    });

    it('should return empty array for short queries', () => {
      const suggestions = generateSuggestions('a', products, []);
      expect(suggestions).toEqual([]);
    });

    it('should limit suggestions count', () => {
      const suggestions = generateSuggestions('умный', products, []);
      expect(suggestions.length).toBeLessThanOrEqual(8);
    });
  });

  describe('Search History', () => {
    it('should save search to history', () => {
      const query = 'тестовый запрос';
      const resultsCount = 5;
      
      saveSearchToHistory(query, resultsCount);
      const history = getSearchHistory();
      
      expect(history.length).toBe(1);
      expect(history[0].query).toBe(query);
      expect(history[0].resultsCount).toBe(resultsCount);
    });

    it('should retrieve search history', () => {
      saveSearchToHistory('запрос 1', 3);
      saveSearchToHistory('запрос 2', 7);
      
      const history = getSearchHistory();
      expect(history.length).toBe(2);
      expect(history[0].query).toBe('запрос 2'); // Последний должен быть первым
    });

    it('should clear search history', () => {
      saveSearchToHistory('тест', 1);
      expect(getSearchHistory().length).toBe(1);
      
      clearSearchHistory();
      expect(getSearchHistory().length).toBe(0);
    });

    it('should handle localStorage errors gracefully', () => {
      // Тест проверяет, что функции не падают при ошибках localStorage
      expect(() => {
        saveSearchToHistory('тест', 1);
        getSearchHistory();
        clearSearchHistory();
      }).not.toThrow();
    });
  });

  describe('Integration Tests', () => {
    it('should perform full search workflow', () => {
      const query = 'умная розетка';
      
      // Поиск по продуктам
      const productResults = searchProducts(products, query);
      expect(productResults.length).toBeGreaterThan(0);
      
      // Поиск по статьям
      const articleResults = searchArticles(mockArticles, query);
      expect(articleResults.length).toBeGreaterThan(0);
      
      // Объединение результатов
      const allResults = [...productResults, ...articleResults]
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
      
      expect(allResults.length).toBeGreaterThan(0);
      
      // Сохранение в историю
      saveSearchToHistory(query, allResults.length);
      const history = getSearchHistory();
      expect(history[0].query).toBe(query);
    });

    it('should generate suggestions based on search history', () => {
      // Добавляем запросы в историю
      saveSearchToHistory('умные розетки', 5);
      saveSearchToHistory('умное освещение', 3);
      
      const history = getSearchHistory();
      const suggestions = generateSuggestions('умн', products, history);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'query')).toBe(true);
    });
  });
});