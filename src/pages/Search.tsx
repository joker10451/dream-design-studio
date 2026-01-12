import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchBar } from '@/components/search/SearchBar';
import { SearchResults } from '@/components/search/SearchResults';
import { SearchResult, SearchSuggestion } from '@/types/search';
import { SEOHead } from '@/components/seo/SEOHead';
import {
  searchProducts,
  searchArticles,
  searchNews,
  searchRatings,
  saveSearchToHistory
} from '@/lib/searchUtils';
import { products } from '@/data/products';
import { mockArticles, mockNews, mockRatings } from '@/data/mockContent';
import { logger } from '@/lib/logger';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');

  // Получаем начальный запрос из URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setCurrentQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setCurrentQuery(query);

    // Обновляем URL
    setSearchParams({ q: query });

    try {
      // Имитируем задержку для реалистичности
      await new Promise(resolve => setTimeout(resolve, 300));

      // Выполняем поиск по всем типам контента
      const productResults = searchProducts(products, query);
      const articleResults = searchArticles(mockArticles, query);
      const newsResults = searchNews(mockNews, query);
      const ratingResults = searchRatings(mockRatings, query);

      // Объединяем и сортируем результаты
      const allResults = [
        ...productResults,
        ...articleResults,
        ...newsResults,
        ...ratingResults
      ].sort((a, b) => b.relevanceScore - a.relevanceScore);

      setResults(allResults);

      // Сохраняем в историю поиска
      saveSearchToHistory(query, allResults.length);
    } catch (error) {
      logger.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchResults: SearchResult[], query: string) => {
    setResults(searchResults);
    setCurrentQuery(query);
    setSearchParams({ q: query });
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Для продуктов можем перенаправить на страницу каталога
    if (suggestion.type === 'product') {
      window.location.href = `/catalog?search=${encodeURIComponent(suggestion.text)}`;
    } else {
      performSearch(suggestion.text);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    // Здесь можно добавить аналитику кликов
    logger.log('Result clicked:', result);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title={currentQuery ? `Поиск: ${currentQuery}` : "Поиск по сайту"}
        description="Найдите нужные устройства умного дома, обзоры, гайды и новости в Smart Home 2026."
        keywords={['поиск умного дома', 'найти гаджеты', 'каталог iot поиск']}
      />
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold text-primary">
                Smart Home 2026
              </a>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <SearchBar
                onSearch={handleSearch}
                onSuggestionClick={handleSuggestionClick}
                placeholder="Поиск по товарам, статьям и новостям..."
                showPopular={!currentQuery}
              />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <a href="/catalog" className="text-sm hover:text-primary transition-colors">
                Каталог
              </a>
              <a href="/calculator" className="text-sm hover:text-primary transition-colors">
                Калькулятор
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Результаты поиска */}
          <SearchResults
            results={results}
            query={currentQuery}
            onResultClick={handleResultClick}
            isLoading={isLoading}
          />

          {/* Пустое состояние */}
          {!currentQuery && !isLoading && (
            <div className="text-center py-16">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold mb-4">
                  Поиск по Smart Home 2026
                </h1>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Найдите нужные товары, статьи, новости и рейтинги.
                  Используйте поиск выше или выберите популярные запросы.
                </p>

                {/* Популярные категории */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                  {[
                    { name: 'Умные розетки', query: 'умные розетки' },
                    { name: 'Освещение', query: 'умное освещение' },
                    { name: 'Безопасность', query: 'камеры безопасности' },
                    { name: 'Датчики', query: 'датчики движения' }
                  ].map((category) => (
                    <button
                      key={category.name}
                      onClick={() => performSearch(category.query)}
                      className="p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-left"
                    >
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Поиск: {category.query}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}