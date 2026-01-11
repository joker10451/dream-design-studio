// Типы для системы поиска

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  type: 'product' | 'article' | 'news' | 'rating';
  url: string;
  category: string;
  tags: string[];
  relevanceScore: number;
  highlightedText?: string;
  image?: string;
  publishedAt?: Date;
  price?: number;
  rating?: number;
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'query' | 'product' | 'category' | 'brand';
  count?: number;
  category?: string;
}

export interface SearchFilters {
  query: string;
  type?: 'all' | 'product' | 'article' | 'news' | 'rating';
  category?: string;
  priceRange?: [number, number];
  minRating?: number;
  dateRange?: [Date, Date];
  brands?: string[];
  tags?: string[];
}

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
  clickedResults: string[];
}

export interface PopularSearch {
  query: string;
  count: number;
  trend: 'up' | 'down' | 'stable';
}

export interface SearchAnalytics {
  totalSearches: number;
  uniqueQueries: number;
  averageResultsPerQuery: number;
  topQueries: PopularSearch[];
  noResultsQueries: string[];
  clickThroughRate: number;
}