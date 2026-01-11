import { motion } from "framer-motion";
import { Calendar, Clock, User, Eye, TrendingUp, Trophy, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Article, NewsItem, Rating } from "@/data/content";
import { formatDate } from "@/lib/contentUtils";

type ContentItem = Article | NewsItem | Rating;

interface ContentListProps {
  items: ContentItem[];
  type: 'articles' | 'news' | 'ratings';
  onItemClick?: (item: ContentItem) => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  loading?: boolean;
}

export function ContentList({ 
  items, 
  type, 
  onItemClick, 
  showLoadMore = false, 
  onLoadMore,
  loading = false 
}: ContentListProps) {
  const getItemIcon = (item: ContentItem) => {
    if ('priority' in item) return TrendingUp; // NewsItem
    if ('products' in item) return Trophy; // Rating
    return Star; // Article
  };

  const getItemCategory = (item: ContentItem) => {
    if ('priority' in item) {
      // NewsItem
      const categoryNames = {
        'industry': 'Индустрия',
        'products': 'Продукты',
        'reviews': 'Обзоры',
        'events': 'События',
        'technology': 'Технологии'
      };
      return categoryNames[item.category as keyof typeof categoryNames] || item.category;
    }
    if ('products' in item) return 'Рейтинг'; // Rating
    return typeof item.category === 'string' ? item.category : item.category.name; // Article
  };

  const getItemUrl = (item: ContentItem) => {
    if ('priority' in item) return `/news/${item.slug}`;
    if ('products' in item) return `/rating/${item.slug}`;
    return `/article/${item.slug}`;
  };

  const handleItemClick = (item: ContentItem) => {
    onItemClick?.(item);
    // Можно добавить навигацию
    // navigate(getItemUrl(item));
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          {type === 'articles' && 'Статьи не найдены'}
          {type === 'news' && 'Новости не найдены'}
          {type === 'ratings' && 'Рейтинги не найдены'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => {
          const Icon = getItemIcon(item);
          const category = getItemCategory(item);
          
          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <Card className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50">
                {/* Image */}
                {item.featuredImage && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.featuredImage}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <Badge variant="secondary" className="text-xs px-2 py-1">
                        <Icon className="w-3 h-3 mr-1" />
                        {category}
                      </Badge>
                    </div>

                    {/* Priority/Trending Badge for News */}
                    {'priority' in item && (item.priority === 'high' || item.priority === 'urgent') && (
                      <div className="absolute top-4 right-4">
                        <Badge 
                          variant={item.priority === 'urgent' ? 'destructive' : 'default'}
                          className="text-xs px-2 py-1"
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {item.priority === 'urgent' ? 'Срочно' : 'Важно'}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                <CardContent className="p-6">
                  {/* Title */}
                  <h3 className="font-semibold text-lg mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {'excerpt' in item ? item.excerpt : 
                     'description' in item ? item.description : 
                     item.seoMeta.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {item.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.publishedAt, 'short')}
                      </span>
                      {'readingTime' in item && item.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {item.readingTime} мин
                        </span>
                      )}
                    </div>

                    {/* Views */}
                    {item.viewsCount && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.viewsCount > 1000 
                          ? `${Math.round(item.viewsCount / 1000)}k` 
                          : item.viewsCount}
                      </span>
                    )}
                  </div>

                  {/* Special Info for Ratings */}
                  {'products' in item && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {item.products.length} продуктов в рейтинге
                        </span>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium">
                            Лидер: #{item.products.find(p => p.rank === 1)?.rank || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.article>
          );
        })}
      </div>

      {/* Load More Button */}
      {showLoadMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: items.length * 0.1 }}
          className="text-center pt-6"
        >
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outline"
            size="lg"
          >
            {loading ? 'Загрузка...' : 'Показать еще'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}