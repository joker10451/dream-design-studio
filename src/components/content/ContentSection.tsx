import { useState, useEffect } from "react";
import { ContentList } from "./ContentList";
import { Article, NewsItem, Rating } from "@/data/content";
import { mockArticles, mockNews, mockRatings } from "@/data/mockContent";
import { ContentSearchFilters } from "@/data/contentTypes";

type ContentType = 'guides' | 'news' | 'ratings' | 'blog';

interface ContentSectionProps {
  contentType: ContentType;
  filters: ContentSearchFilters;
  showAffiliateLinks?: boolean;
}

export function ContentSection({ contentType, filters, showAffiliateLinks = false }: ContentSectionProps) {
  const [items, setItems] = useState<(Article | NewsItem | Rating)[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      
      // Симуляция загрузки данных
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let data: (Article | NewsItem | Rating)[] = [];
      
      switch (contentType) {
        case 'guides':
          data = mockArticles.filter(article => 
            article.category === 'guides' || 
            (typeof article.category === 'object' && article.category.name === 'guides')
          );
          break;
        case 'blog':
          data = mockArticles.filter(article => 
            article.category === 'blog' || 
            (typeof article.category === 'object' && article.category.name === 'blog')
          );
          break;
        case 'news':
          data = mockNews;
          break;
        case 'ratings':
          data = mockRatings;
          break;
        default:
          data = [];
      }

      // Применяем фильтры
      if (filters.category && filters.category !== 'all') {
        data = data.filter(item => {
          if ('category' in item) {
            const category = typeof item.category === 'string' ? item.category : item.category.name;
            return category === filters.category;
          }
          return true;
        });
      }

      if (filters.query) {
        const query = filters.query.toLowerCase();
        data = data.filter(item => 
          item.title.toLowerCase().includes(query) ||
          ('excerpt' in item && item.excerpt.toLowerCase().includes(query)) ||
          ('description' in item && item.description.toLowerCase().includes(query))
        );
      }

      if (filters.author) {
        data = data.filter(item => item.author.id === filters.author);
      }

      if (filters.tags && filters.tags.length > 0) {
        data = data.filter(item => 
          item.tags.some(tag => 
            filters.tags!.includes(typeof tag === 'string' ? tag : tag.slug)
          )
        );
      }

      // Сортировка
      data.sort((a, b) => {
        // По умолчанию сортируем по дате (новые первые)
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });

      setItems(data);
      setLoading(false);
    };

    loadContent();
  }, [contentType, filters]);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-muted rounded-lg h-48 mb-4"></div>
            <div className="space-y-2">
              <div className="bg-muted rounded h-4 w-3/4"></div>
              <div className="bg-muted rounded h-4 w-1/2"></div>
              <div className="bg-muted rounded h-3 w-full"></div>
              <div className="bg-muted rounded h-3 w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const getContentListType = (): 'articles' | 'news' | 'ratings' => {
    if (contentType === 'news') return 'news';
    if (contentType === 'ratings') return 'ratings';
    return 'articles';
  };

  return (
    <ContentList
      items={items}
      type={getContentListType()}
      showLoadMore={items.length >= 12}
      onLoadMore={() => {
        // Здесь можно добавить логику загрузки дополнительных элементов
        console.log('Load more items');
      }}
    />
  );
}