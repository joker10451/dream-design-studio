import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AffiliateButton } from "./AffiliateButton";
import { useAffiliateTracking } from "./AffiliateTracker";
import { products, Product, AffiliateLink } from "@/data/products";

interface ContextualAffiliateLinksProps {
  context: "article" | "news" | "rating" | "calculator" | "search";
  contentId?: string;
  keywords?: string[];
  category?: string;
  maxItems?: number;
  className?: string;
}

interface RecommendedProduct {
  product: Product;
  relevanceScore: number;
  reason: string;
}

export function ContextualAffiliateLinks({
  context,
  contentId,
  keywords = [],
  category,
  maxItems = 3,
  className
}: ContextualAffiliateLinksProps) {
  const { trackClick } = useAffiliateTracking();

  // Получаем рекомендованные продукты на основе контекста
  const getRecommendedProducts = (): RecommendedProduct[] => {
    let recommendations: RecommendedProduct[] = [];

    // Фильтруем продукты по категории если указана
    let filteredProducts = category 
      ? products.filter(p => p.category === category)
      : products;

    // Алгоритм релевантности на основе контекста
    filteredProducts.forEach(product => {
      let score = 0;
      let reason = "";

      // Базовый скор по рейтингу и популярности
      score += product.rating * 10;
      score += Math.min(product.reviewsCount / 100, 10);

      // Контекстуальная релевантность
      switch (context) {
        case "article":
          // В статьях показываем продукты, упомянутые в тексте
          if (keywords.some(keyword => 
            product.name.toLowerCase().includes(keyword.toLowerCase()) ||
            product.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
          )) {
            score += 50;
            reason = "Упоминается в статье";
          }
          break;

        case "news":
          // В новостях показываем новинки и популярные продукты
          if (product.tags.includes("новинка")) {
            score += 30;
            reason = "Новинка";
          } else if (product.reviewsCount > 1000) {
            score += 20;
            reason = "Популярный выбор";
          }
          break;

        case "rating":
          // В рейтингах показываем топовые продукты
          if (product.rating >= 4.5) {
            score += 40;
            reason = "Высокий рейтинг";
          }
          break;

        case "calculator":
          // В калькуляторе показываем оптимальные по цене продукты
          const priceScore = product.price < 2000 ? 30 : product.price < 5000 ? 20 : 10;
          score += priceScore;
          reason = "Оптимальная цена";
          break;

        case "search":
          // В поиске показываем наиболее релевантные
          if (keywords.some(keyword => 
            product.name.toLowerCase().includes(keyword.toLowerCase())
          )) {
            score += 60;
            reason = "Точное совпадение";
          }
          break;
      }

      // Бонус за наличие скидки
      if (product.oldPrice && product.oldPrice > product.price) {
        score += 15;
        if (!reason) reason = "Скидка";
      }

      // Бонус за доступность на нескольких площадках
      if (product.affiliateLinks.filter(link => link.isAvailable).length > 1) {
        score += 10;
      }

      recommendations.push({
        product,
        relevanceScore: score,
        reason: reason || "Рекомендуем"
      });
    });

    // Сортируем по релевантности и берем топ
    return recommendations
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxItems);
  };

  const recommendations = getRecommendedProducts();

  if (recommendations.length === 0) {
    return null;
  }

  const handleLinkClick = (link: AffiliateLink, productId: string) => {
    trackClick(link, `contextual_${context}`, productId);
  };

  const getContextTitle = () => {
    switch (context) {
      case "article":
        return "Рекомендуемые товары";
      case "news":
        return "Актуальные предложения";
      case "rating":
        return "Лидеры рейтинга";
      case "calculator":
        return "Популярный выбор";
      case "search":
        return "Похожие товары";
      default:
        return "Рекомендации";
    }
  };

  const getContextIcon = () => {
    switch (context) {
      case "article":
        return <ShoppingBag className="w-5 h-5" />;
      case "news":
        return <Sparkles className="w-5 h-5" />;
      case "rating":
        return <TrendingUp className="w-5 h-5" />;
      case "calculator":
        return <ShoppingBag className="w-5 h-5" />;
      case "search":
        return <ShoppingBag className="w-5 h-5" />;
      default:
        return <ShoppingBag className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {getContextIcon()}
            <h3 className="text-lg font-semibold">{getContextTitle()}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => {
              const { product, reason } = rec;
              const bestLink = product.affiliateLinks
                .filter(link => link.isAvailable)
                .sort((a, b) => a.price - b.price)[0];

              if (!bestLink) return null;

              const discount = product.oldPrice 
                ? Math.round((1 - product.price / product.oldPrice) * 100)
                : 0;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background/50"
                >
                  {/* Изображение и бейдж */}
                  <div className="relative mb-3">
                    <img
                      src={product.images[0]?.url}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 left-2 text-xs"
                    >
                      {reason}
                    </Badge>
                    {discount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute top-2 right-2 text-xs"
                      >
                        -{discount}%
                      </Badge>
                    )}
                  </div>

                  {/* Информация о продукте */}
                  <div className="mb-3">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {product.brand}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold">
                          {bestLink.price.toLocaleString("ru-RU")} ₽
                        </span>
                        {product.oldPrice && (
                          <span className="text-xs text-muted-foreground line-through">
                            {product.oldPrice.toLocaleString("ru-RU")} ₽
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs">⭐</span>
                        <span className="text-xs font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка покупки */}
                  <AffiliateButton
                    link={bestLink}
                    variant="compact"
                    showPrice={false}
                    className="w-full"
                    onClick={(link) => handleLinkClick(link, product.id)}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Дисклеймер */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Рекомендации основаны на контексте страницы и популярности товаров. 
              Мы получаем комиссию с покупок по партнерским ссылкам.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}