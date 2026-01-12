import React from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  FileText,
  Newspaper,
  Star,
  Calendar,
  User,
  ExternalLink,
  TrendingUp,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SearchResult, SearchFilters } from '@/types/search';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  filters?: SearchFilters;
  onFilterChange?: (filters: SearchFilters) => void;
  onResultClick?: (result: SearchResult) => void;
  isLoading?: boolean;
}

const typeIcons = {
  product: Package,
  article: FileText,
  news: Newspaper,
  rating: Star
};

const typeLabels = {
  product: 'Товар',
  article: 'Статья',
  news: 'Новость',
  rating: 'Рейтинг'
};

const typeColors = {
  product: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  article: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  news: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  rating: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
};

export function SearchResults({
  results,
  query,
  filters,
  onFilterChange,
  onResultClick,
  isLoading = false
}: SearchResultsProps) {
  // Группируем результаты по типам
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  // Статистика по типам
  const typeStats = Object.entries(groupedResults).map(([type, items]) => ({
    type: type as keyof typeof typeIcons,
    count: items.length,
    label: typeLabels[type as keyof typeof typeLabels]
  }));

  const handleResultClick = (result: SearchResult) => {
    onResultClick?.(result);

    // Открываем ссылку
    if (result.url.startsWith('http')) {
      window.open(result.url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = result.url;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-muted-foreground">Поиск...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Ничего не найдено</h3>
        <p className="text-muted-foreground mb-4">
          По запросу "{query}" не найдено результатов
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Попробуйте:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Проверить правильность написания</li>
            <li>Использовать более общие термины</li>
            <li>Попробовать синонимы</li>
            <li>Уменьшить количество слов в запросе</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с результатами */}
      {query && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Результаты поиска
            </h2>
            <p className="text-muted-foreground">
              Найдено {results.length} результатов по запросу "{query}"
            </p>
          </div>

          {/* Статистика по типам */}
          <div className="flex items-center gap-2">
            {typeStats.map(({ type, count, label }) => {
              const Icon = typeIcons[type];
              return (
                <Badge key={type} variant="outline" className="gap-1">
                  <Icon className="w-3 h-3" />
                  {label}: {count}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {/* Результаты */}
      <div className="space-y-4">
        {results.map((result, index) => {
          const Icon = typeIcons[result.type];
          const typeColor = typeColors[result.type];

          return (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardContent
                  className="p-6"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-4">
                    {/* Изображение */}
                    {result.image && (
                      <div className="flex-shrink-0">
                        <img
                          src={result.image}
                          alt={result.title}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                    )}

                    {/* Основной контент */}
                    <div className="flex-1 min-w-0">
                      {/* Заголовок и тип */}
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                            {result.title}
                          </h3>
                        </div>
                        <Badge className={typeColor}>
                          {typeLabels[result.type]}
                        </Badge>
                      </div>

                      {/* Описание */}
                      <div className="mb-3">
                        {result.highlightedText ? (
                          <p
                            className="text-muted-foreground line-clamp-2"
                            dangerouslySetInnerHTML={{ __html: result.highlightedText }}
                          />
                        ) : (
                          <p className="text-muted-foreground line-clamp-2">
                            {result.excerpt}
                          </p>
                        )}
                      </div>

                      {/* Метаданные */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {/* Категория */}
                        <div className="flex items-center gap-1">
                          <Filter className="w-3 h-3" />
                          <span>{result.category}</span>
                        </div>

                        {/* Дата публикации */}
                        {result.publishedAt && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(result.publishedAt)}</span>
                          </div>
                        )}

                        {/* Цена для товаров */}
                        {result.price && (
                          <div className="flex items-center gap-1 font-semibold text-primary">
                            <TrendingUp className="w-3 h-3" />
                            <span>{formatPrice(result.price)}</span>
                          </div>
                        )}

                        {/* Рейтинг для товаров */}
                        {result.rating && (
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span>{result.rating}</span>
                          </div>
                        )}

                        {/* Релевантность */}
                        <div className="flex items-center gap-1 ml-auto">
                          <span className="text-xs">
                            Релевантность: {Math.round(result.relevanceScore)}%
                          </span>
                        </div>
                      </div>

                      {/* Теги */}
                      {result.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {result.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {result.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{result.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Кнопка перехода */}
                    <div className="flex-shrink-0">
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Показать больше результатов */}
      {results.length > 10 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Показать больше результатов
          </Button>
        </div>
      )}
    </div>
  );
}