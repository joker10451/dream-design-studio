import { motion } from "framer-motion";
import { Search, Filter, X, Calendar, User, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ContentSearchFilters } from "@/data/contentTypes";
import { ARTICLE_CATEGORIES, COMMON_TAGS, AUTHORS } from "@/data/content";

interface ContentFiltersProps {
  filters: ContentSearchFilters;
  onFiltersChange: (filters: ContentSearchFilters) => void;
  contentType: 'articles' | 'news' | 'ratings';
  resultsCount?: number;
}

export function ContentFilters({ 
  filters, 
  onFiltersChange, 
  contentType,
  resultsCount 
}: ContentFiltersProps) {
  const updateFilters = (updates: Partial<ContentSearchFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Boolean(
    filters.query || 
    filters.category || 
    filters.author || 
    (filters.tags && filters.tags.length > 0) ||
    filters.dateFrom ||
    filters.dateTo
  );

  const getCategories = () => {
    if (contentType === 'articles') {
      return ARTICLE_CATEGORIES.map(cat => ({ id: cat.slug, name: cat.name }));
    }
    if (contentType === 'news') {
      return [
        { id: 'industry', name: 'Индустрия' },
        { id: 'products', name: 'Продукты' },
        { id: 'reviews', name: 'Обзоры' },
        { id: 'events', name: 'События' },
        { id: 'technology', name: 'Технологии' }
      ];
    }
    return []; // Для рейтингов категории определяются по продуктам
  };

  const categories = getCategories();

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder={`Поиск ${contentType === 'articles' ? 'статей' : contentType === 'news' ? 'новостей' : 'рейтингов'}...`}
              value={filters.query || ''}
              onChange={(e) => updateFilters({ query: e.target.value })}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Category Filter */}
        {categories.length > 0 && (
          <Select
            value={filters.category || ''}
            onValueChange={(value) => updateFilters({ category: value || undefined })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Все категории</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Author Filter */}
        <Select
          value={filters.author || ''}
          onValueChange={(value) => updateFilters({ author: value || undefined })}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Автор" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Все авторы</SelectItem>
            {AUTHORS.map((author) => (
              <SelectItem key={author.id} value={author.id}>
                {author.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tags Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Tag className="w-4 h-4" />
              Теги
              {filters.tags && filters.tags.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <h4 className="font-medium">Выберите теги</h4>
              <div className="grid grid-cols-2 gap-2">
                {COMMON_TAGS.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag.id}
                      checked={filters.tags?.includes(tag.slug) || false}
                      onCheckedChange={(checked) => {
                        const currentTags = filters.tags || [];
                        const newTags = checked
                          ? [...currentTags, tag.slug]
                          : currentTags.filter(t => t !== tag.slug);
                        updateFilters({ tags: newTags.length > 0 ? newTags : undefined });
                      }}
                    />
                    <label
                      htmlFor={tag.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Дата
              {(filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary" className="ml-1">1</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-3">
              <h4 className="font-medium">Период публикации</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm font-medium">От</label>
                  <Input
                    type="date"
                    value={filters.dateFrom?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({ 
                      dateFrom: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">До</label>
                  <Input
                    type="date"
                    value={filters.dateTo?.toISOString().split('T')[0] || ''}
                    onChange={(e) => updateFilters({ 
                      dateTo: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="gap-2">
            <X className="w-4 h-4" />
            Очистить
          </Button>
        )}

        {/* Results Count */}
        {resultsCount !== undefined && (
          <div className="ml-auto text-sm text-muted-foreground">
            {resultsCount === 0 
              ? 'Ничего не найдено' 
              : `Найдено: ${resultsCount}`}
          </div>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="flex flex-wrap gap-2"
        >
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              Категория: {categories.find(c => c.id === filters.category)?.name}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ category: undefined })}
              />
            </Badge>
          )}
          
          {filters.author && (
            <Badge variant="secondary" className="gap-1">
              Автор: {AUTHORS.find(a => a.id === filters.author)?.name}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ author: undefined })}
              />
            </Badge>
          )}

          {filters.tags?.map((tagSlug) => {
            const tag = COMMON_TAGS.find(t => t.slug === tagSlug);
            return tag ? (
              <Badge key={tagSlug} variant="secondary" className="gap-1">
                {tag.name}
                <X 
                  className="w-3 h-3 cursor-pointer" 
                  onClick={() => updateFilters({ 
                    tags: filters.tags?.filter(t => t !== tagSlug) 
                  })}
                />
              </Badge>
            ) : null;
          })}

          {(filters.dateFrom || filters.dateTo) && (
            <Badge variant="secondary" className="gap-1">
              Период: {filters.dateFrom?.toLocaleDateString('ru-RU')} - {filters.dateTo?.toLocaleDateString('ru-RU')}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ dateFrom: undefined, dateTo: undefined })}
              />
            </Badge>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}