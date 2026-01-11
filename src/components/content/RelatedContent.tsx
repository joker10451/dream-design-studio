import { motion } from "framer-motion";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/contentUtils";

interface RelatedContentItem {
  id: string;
  title: string;
  excerpt: string;
  url: string;
  image?: string;
  publishedAt: Date;
  readingTime?: number;
  category?: string;
}

interface RelatedContentProps {
  title: string;
  items: RelatedContentItem[];
  maxItems?: number;
  onItemClick?: (item: RelatedContentItem) => void;
}

export function RelatedContent({ 
  title, 
  items, 
  maxItems = 5,
  onItemClick 
}: RelatedContentProps) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) return null;

  const handleItemClick = (item: RelatedContentItem) => {
    onItemClick?.(item);
    // Можно добавить навигацию через React Router
    // navigate(item.url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayItems.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group cursor-pointer"
            onClick={() => handleItemClick(item)}
          >
            <div className="flex gap-3">
              {/* Image */}
              {item.image && (
                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                  {item.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.publishedAt, 'short')}
                  </span>
                  
                  {item.readingTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.readingTime} мин
                    </span>
                  )}

                  {item.category && (
                    <span className="px-2 py-0.5 bg-muted rounded text-xs">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 self-center">
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </motion.article>
        ))}

        {/* Show More Button */}
        {items.length > maxItems && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: displayItems.length * 0.1 }}
            className="pt-2 border-t"
          >
            <Button variant="ghost" size="sm" className="w-full group">
              Показать еще ({items.length - maxItems})
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}