import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Package, FileText, Star, Newspaper } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useDebounce } from '@/hooks/useDebounce';
import { 
  SearchResult, 
  SearchSuggestion, 
  SearchFilters 
} from '@/types/search';
import {
  generateSuggestions,
  searchProducts,
  searchArticles,
  searchNews,
  searchRatings,
  saveSearchToHistory,
  getSearchHistory,
  getPopularSearches
} from '@/lib/searchUtils';
import { products } from '@/data/products';
import { mockArticles, mockNews, mockRatings } from '@/data/mockContent';

interface SearchBarProps {
  onSearch?: (results: SearchResult[], query: string) => void;
  onSuggestionClick?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  className?: string;
  showPopular?: boolean;
  maxSuggestions?: number;
}

const typeIcons = {
  product: Package,
  article: FileText,
  news: Newspaper,
  rating: Star,
  query: Search,
  brand: TrendingUp,
  category: Package
};

const typeLabels = {
  product: 'Товар',
  article: 'Статья',
  news: 'Новость',
  rating: 'Рейтинг',
  query: 'Запрос',
  brand: 'Бренд',
  category: 'Категория'
};

export function SearchBar({
  onSearch,
  onSuggestionClick,
  placeholder = "Поиск по товарам, статьям и новостям...",
  className = "",
  showPopular = true,
  maxSuggestions = 8
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const debouncedQuery = useDebounce(query, 300);

  // Загружаем популярные запросы при монтировании
  useEffect(() => {
    if (showPopular) {
      const popular = getPopularSearches(6);
      setPopularSearches(popular);
    }
  }, [showPopular]);

  // Генерируем предложения при изменении запроса
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setIsLoading(true);
      
      // Имитируем небольшую задержку для реалистичности
      const timer = setTimeout(() => {
        const searchHistory = getSearchHistory();
        const newSuggestions = generateSuggestions(
          debouncedQuery,
          products,
          searchHistory
        ).slice(0, maxSuggestions);
        
        setSuggestions(newSuggestions);
        setIsLoading(false);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setIsLoading(false);
    }
  }, [debouncedQuery, maxSuggestions]);

  // Закрываем выпадающий список при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Выполняем поиск
  const performSearch = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return;

    const productResults = searchProducts(products, searchQuery);
    const articleResults = searchArticles(mockArticles, searchQuery);
    const newsResults = searchNews(mockNews, searchQuery);
    const ratingResults = searchRatings(mockRatings, searchQuery);

    const allResults = [
      ...productResults,
      ...articleResults,
      ...newsResults,
      ...ratingResults
    ].sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Сохраняем в историю
    saveSearchToHistory(searchQuery, allResults.length);

    // Обновляем популярные запросы
    if (showPopular) {
      const popular = getPopularSearches(6);
      setPopularSearches(popular);
    }

    onSearch?.(allResults, searchQuery);
    setIsOpen(false);
  }, [onSearch, showPopular]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0 || showPopular);
  };

  const handleInputFocus = () => {
    setIsOpen(query.length > 0 || showPopular);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    setIsOpen(false);
    
    onSuggestionClick?.(suggestion);
    
    // Если это не продукт, выполняем поиск
    if (suggestion.type !== 'product') {
      performSearch(suggestion.text);
    }
  };

  const handlePopularClick = (popularQuery: string) => {
    setQuery(popularQuery);
    performSearch(popularQuery);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const showSuggestions = isOpen && (suggestions.length > 0 || (showPopular && popularSearches.length > 0 && query.length === 0));

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="pl-10 pr-10 h-12 text-base rounded-xl border-2 focus:border-primary transition-colors"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-secondary"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {/* Популярные запросы */}
            {showPopular && popularSearches.length > 0 && query.length === 0 && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Популярные запросы</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((popularQuery, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handlePopularClick(popularQuery)}
                    >
                      {popularQuery}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Предложения */}
            {suggestions.length > 0 && (
              <>
                {showPopular && popularSearches.length > 0 && query.length === 0 && (
                  <Separator />
                )}
                <div className="p-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    suggestions.map((suggestion) => {
                      const Icon = typeIcons[suggestion.type];
                      const label = typeLabels[suggestion.type];
                      
                      return (
                        <motion.div
                          key={suggestion.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer transition-colors group"
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex-shrink-0">
                            <Icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {suggestion.text}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {label}
                              </Badge>
                            </div>
                            {suggestion.category && (
                              <span className="text-xs text-muted-foreground">
                                в {suggestion.category}
                              </span>
                            )}
                          </div>
                          {suggestion.count !== undefined && (
                            <div className="flex-shrink-0">
                              <span className="text-xs text-muted-foreground">
                                {suggestion.count}
                              </span>
                            </div>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </>
            )}

            {/* История поиска */}
            {query.length === 0 && !showPopular && (
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Недавние поиски</span>
                </div>
                <div className="space-y-1">
                  {getSearchHistory().slice(0, 5).map((historyItem) => (
                    <div
                      key={historyItem.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                      onClick={() => handlePopularClick(historyItem.query)}
                    >
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{historyItem.query}</span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {historyItem.resultsCount} результатов
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}