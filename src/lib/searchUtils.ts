import { Product } from '@/data/products';
import { Article, NewsItem, Rating } from '@/data/content';
import { SearchResult, SearchSuggestion, SearchFilters, SearchHistory } from '@/types/search';

// Функция для нормализации текста для поиска
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ёе]/g, 'е')
    .replace(/[йи]/g, 'и')
    .replace(/[^а-яa-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Функция для выделения найденных терминов
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const normalizedQuery = normalizeText(query);
  const words = normalizedQuery.split(' ').filter(word => word.length > 1);
  
  let highlightedText = text;
  
  words.forEach(word => {
    const regex = new RegExp(`(${word})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
}

// Функция для вычисления релевантности
export function calculateRelevance(
  text: string,
  query: string,
  titleWeight: number = 3,
  descriptionWeight: number = 2,
  tagsWeight: number = 1.5
): number {
  if (!query.trim()) return 0;
  
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 1);
  
  let score = 0;
  
  queryWords.forEach(word => {
    // Точное совпадение
    if (normalizedText.includes(word)) {
      score += 10;
    }
    
    // Частичное совпадение
    const partialMatches = normalizedText.match(new RegExp(word, 'g'));
    if (partialMatches) {
      score += partialMatches.length * 5;
    }
    
    // Бонус за совпадение в начале текста
    if (normalizedText.startsWith(word)) {
      score += 15;
    }
  });
  
  return score;
}

// Функция поиска по продуктам
export function searchProducts(products: Product[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  products.forEach(product => {
    const titleScore = calculateRelevance(product.name, query, 3);
    const descriptionScore = calculateRelevance(product.description, query, 2);
    const brandScore = calculateRelevance(product.brand, query, 2.5);
    const tagsScore = calculateRelevance(product.tags.join(' '), query, 1.5);
    const categoryScore = calculateRelevance(product.category, query, 2);
    
    const totalScore = titleScore + descriptionScore + brandScore + tagsScore + categoryScore;
    
    if (totalScore > 0) {
      results.push({
        id: product.id,
        title: product.name,
        excerpt: product.description,
        type: 'product',
        url: `/catalog?product=${product.id}`,
        category: product.category,
        tags: product.tags,
        relevanceScore: totalScore,
        highlightedText: highlightText(product.description, query),
        image: product.images[0]?.url,
        price: product.price,
        rating: product.rating
      });
    }
  });
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Функция поиска по статьям
export function searchArticles(articles: Article[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  articles.forEach(article => {
    const titleScore = calculateRelevance(article.title, query, 3);
    const excerptScore = calculateRelevance(article.excerpt, query, 2);
    const contentScore = calculateRelevance(article.content.substring(0, 500), query, 1);
    const tagsScore = calculateRelevance(article.tags.map(t => t.name).join(' '), query, 1.5);
    const categoryScore = calculateRelevance(article.category.name, query, 2);
    
    const totalScore = titleScore + excerptScore + contentScore + tagsScore + categoryScore;
    
    if (totalScore > 0) {
      results.push({
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        type: 'article',
        url: `/articles/${article.slug}`,
        category: article.category.name,
        tags: article.tags.map(t => t.name),
        relevanceScore: totalScore,
        highlightedText: highlightText(article.excerpt, query),
        image: article.featuredImage,
        publishedAt: article.publishedAt
      });
    }
  });
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Функция поиска по новостям
export function searchNews(news: NewsItem[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  news.forEach(item => {
    const titleScore = calculateRelevance(item.title, query, 3);
    const excerptScore = calculateRelevance(item.excerpt, query, 2);
    const contentScore = calculateRelevance(item.content.substring(0, 500), query, 1);
    const tagsScore = calculateRelevance(item.tags.map(t => t.name).join(' '), query, 1.5);
    const categoryScore = calculateRelevance(item.category, query, 2);
    
    const totalScore = titleScore + excerptScore + contentScore + tagsScore + categoryScore;
    
    if (totalScore > 0) {
      results.push({
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        type: 'news',
        url: `/news/${item.slug}`,
        category: item.category,
        tags: item.tags.map(t => t.name),
        relevanceScore: totalScore,
        highlightedText: highlightText(item.excerpt, query),
        image: item.featuredImage,
        publishedAt: item.publishedAt
      });
    }
  });
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Функция поиска по рейтингам
export function searchRatings(ratings: Rating[], query: string): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  ratings.forEach(rating => {
    const titleScore = calculateRelevance(rating.title, query, 3);
    const descriptionScore = calculateRelevance(rating.description, query, 2);
    const categoryScore = calculateRelevance(rating.category, query, 2);
    
    const totalScore = titleScore + descriptionScore + categoryScore;
    
    if (totalScore > 0) {
      results.push({
        id: rating.id,
        title: rating.title,
        excerpt: rating.description,
        type: 'rating',
        url: `/ratings/${rating.slug}`,
        category: rating.category,
        tags: [],
        relevanceScore: totalScore,
        highlightedText: highlightText(rating.description, query),
        image: rating.featuredImage,
        publishedAt: rating.publishedAt
      });
    }
  });
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Функция для генерации предложений автозаполнения
export function generateSuggestions(
  query: string,
  products: Product[],
  searchHistory: SearchHistory[]
): SearchSuggestion[] {
  if (!query.trim() || query.length < 2) return [];
  
  const suggestions: SearchSuggestion[] = [];
  const normalizedQuery = normalizeText(query);
  
  // Предложения из истории поиска
  const historySuggestions = searchHistory
    .filter(h => normalizeText(h.query).includes(normalizedQuery))
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, 3)
    .map(h => ({
      id: `history_${h.id}`,
      text: h.query,
      type: 'query' as const,
      count: h.resultsCount
    }));
  
  suggestions.push(...historySuggestions);
  
  // Предложения продуктов
  const productSuggestions = products
    .filter(p => 
      normalizeText(p.name).includes(normalizedQuery) ||
      normalizeText(p.brand).includes(normalizedQuery)
    )
    .slice(0, 5)
    .map(p => ({
      id: `product_${p.id}`,
      text: p.name,
      type: 'product' as const,
      category: p.category
    }));
  
  suggestions.push(...productSuggestions);
  
  // Предложения брендов
  const brandSuggestions = Array.from(
    new Set(
      products
        .filter(p => normalizeText(p.brand).includes(normalizedQuery))
        .map(p => p.brand)
    )
  )
    .slice(0, 3)
    .map(brand => ({
      id: `brand_${brand}`,
      text: brand,
      type: 'brand' as const
    }));
  
  suggestions.push(...brandSuggestions);
  
  // Предложения категорий
  const categorySuggestions = Array.from(
    new Set(
      products
        .filter(p => normalizeText(p.category).includes(normalizedQuery))
        .map(p => p.category)
    )
  )
    .slice(0, 3)
    .map(category => ({
      id: `category_${category}`,
      text: category,
      type: 'category' as const
    }));
  
  suggestions.push(...categorySuggestions);
  
  // Удаляем дубликаты и ограничиваем количество
  const uniqueSuggestions = suggestions
    .filter((suggestion, index, self) => 
      self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase()) === index
    )
    .slice(0, 8);
  
  return uniqueSuggestions;
}

// Функция для сохранения поискового запроса в историю
export function saveSearchToHistory(
  query: string,
  resultsCount: number,
  clickedResults: string[] = []
): SearchHistory {
  const searchHistory: SearchHistory = {
    id: `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    query: query.trim(),
    timestamp: new Date(),
    resultsCount,
    clickedResults
  };
  
  // Сохраняем в localStorage
  try {
    const existingHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const updatedHistory = [searchHistory, ...existingHistory].slice(0, 100); // Ограничиваем 100 записями
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  } catch (error) {
    console.warn('Failed to save search history:', error);
  }
  
  return searchHistory;
}

// Функция для получения истории поиска
export function getSearchHistory(): SearchHistory[] {
  try {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    return history.map((h: any) => ({
      ...h,
      timestamp: new Date(h.timestamp)
    }));
  } catch (error) {
    console.warn('Failed to load search history:', error);
    return [];
  }
}

// Функция для очистки истории поиска
export function clearSearchHistory(): void {
  try {
    localStorage.removeItem('searchHistory');
  } catch (error) {
    console.warn('Failed to clear search history:', error);
  }
}

// Функция для получения популярных поисковых запросов
export function getPopularSearches(limit: number = 10): string[] {
  const history = getSearchHistory();
  const queryCount = new Map<string, number>();
  
  history.forEach(h => {
    const count = queryCount.get(h.query) || 0;
    queryCount.set(h.query, count + 1);
  });
  
  return Array.from(queryCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([query]) => query);
}