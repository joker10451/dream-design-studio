import { motion } from "framer-motion";
import { ShoppingCart, TrendingDown, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AffiliateButton } from "./AffiliateButton";
import { AffiliateDisclosure } from "./AffiliateDisclosure";
import { useAffiliateTracking } from "./AffiliateTracker";
import { AffiliateLink } from "@/data/products";

interface AffiliateLinksGridProps {
  links: AffiliateLink[];
  productId?: string;
  source?: string;
  title?: string;
  showComparison?: boolean;
  showDisclosure?: boolean;
  variant?: "grid" | "list" | "compact";
  className?: string;
}

export function AffiliateLinksGrid({
  links,
  productId,
  source = "product_page",
  title = "Где купить",
  showComparison = true,
  showDisclosure = true,
  variant = "grid",
  className
}: AffiliateLinksGridProps) {
  const { trackClick } = useAffiliateTracking();

  // Фильтруем и сортируем ссылки
  const availableLinks = links.filter(link => link.isAvailable);
  const unavailableLinks = links.filter(link => !link.isAvailable);
  const sortedAvailableLinks = [...availableLinks].sort((a, b) => a.price - b.price);

  // Находим лучшую цену
  const bestPrice = sortedAvailableLinks[0]?.price || 0;

  // Обработчик клика с трекингом
  const handleLinkClick = (link: AffiliateLink) => {
    trackClick(link, source, productId);
  };

  // Получаем информацию о скидке
  const getDiscountInfo = (link: AffiliateLink) => {
    const discount = link.trackingParams.discount;
    if (discount && typeof discount === 'string') {
      return parseInt(discount);
    }
    return null;
  };

  // Получаем экономию относительно других магазинов
  const getSavings = (price: number) => {
    if (price === bestPrice) return 0;
    return price - bestPrice;
  };

  if (links.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            {title}
          </CardTitle>
          {showDisclosure && (
            <AffiliateDisclosure variant="inline" className="mt-2" />
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Доступные ссылки */}
          {availableLinks.length > 0 && (
            <div className="space-y-3">
              {variant === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sortedAvailableLinks.map((link, index) => {
                    const isBestPrice = link.price === bestPrice;
                    const savings = getSavings(link.price);
                    const discount = getDiscountInfo(link);

                    return (
                      <motion.div
                        key={link.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`relative border rounded-lg p-4 hover:border-primary/50 transition-colors ${
                          isBestPrice ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''
                        }`}
                      >
                        {/* Бейджи */}
                        <div className="flex items-center gap-2 mb-3">
                          {isBestPrice && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <TrendingDown className="w-3 h-3 mr-1" />
                              Лучшая цена
                            </Badge>
                          )}
                          {discount && (
                            <Badge variant="destructive" className="text-xs">
                              -{discount}%
                            </Badge>
                          )}
                        </div>

                        {/* Цена и экономия */}
                        <div className="mb-3">
                          <div className="text-2xl font-bold">
                            {link.price.toLocaleString("ru-RU")} ₽
                          </div>
                          {savings > 0 && (
                            <div className="text-sm text-red-600">
                              +{savings.toLocaleString("ru-RU")} ₽ к лучшей цене
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Обновлено: {new Date(link.lastUpdated).toLocaleDateString("ru-RU")}
                          </div>
                        </div>

                        {/* Кнопка покупки */}
                        <AffiliateButton
                          link={link}
                          variant="default"
                          showPrice={false}
                          onClick={handleLinkClick}
                        />
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {variant === "list" && (
                <div className="space-y-2">
                  {sortedAvailableLinks.map((link, index) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <AffiliateButton
                        link={link}
                        variant="default"
                        showPrice={true}
                        showDiscount={true}
                        onClick={handleLinkClick}
                      />
                    </motion.div>
                  ))}
                </div>
              )}

              {variant === "compact" && (
                <div className="flex flex-wrap gap-2">
                  {sortedAvailableLinks.map((link, index) => (
                    <motion.div
                      key={link.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <AffiliateButton
                        link={link}
                        variant="compact"
                        showPrice={true}
                        onClick={handleLinkClick}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Сравнение цен */}
          {showComparison && availableLinks.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-3 bg-muted/30 rounded-lg"
            >
              <h4 className="text-sm font-medium mb-2">Сравнение цен:</h4>
              <div className="space-y-1">
                {sortedAvailableLinks.map((link, index) => {
                  const isBestPrice = index === 0;
                  const savings = getSavings(link.price);
                  
                  return (
                    <div key={link.id} className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2">
                        {link.marketplace === 'wildberries' ? 'Wildberries' : 
                         link.marketplace === 'ozon' ? 'OZON' : 
                         link.marketplace === 'yandex' ? 'Яндекс.Маркет' : 
                         link.marketplace}
                        {isBestPrice && (
                          <Badge variant="outline" className="text-xs">
                            Лучшая
                          </Badge>
                        )}
                      </span>
                      <span className={isBestPrice ? 'font-semibold text-green-600' : ''}>
                        {link.price.toLocaleString("ru-RU")} ₽
                        {savings > 0 && (
                          <span className="text-xs text-red-600 ml-1">
                            (+{savings.toLocaleString("ru-RU")})
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Недоступные ссылки */}
          {unavailableLinks.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Временно недоступно:
              </h4>
              <div className="space-y-2">
                {unavailableLinks.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 border rounded-lg opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">
                        {link.marketplace === 'wildberries' ? 'Wildberries' : 
                         link.marketplace === 'ozon' ? 'OZON' : 
                         link.marketplace === 'yandex' ? 'Яндекс.Маркет' : 
                         link.marketplace}
                      </Badge>
                      <div>
                        <div className="font-semibold text-lg line-through">
                          {link.price.toLocaleString("ru-RU")} ₽
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Нет в наличии
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Дополнительное раскрытие информации */}
          {showDisclosure && (
            <AffiliateDisclosure variant="footer" className="mt-4" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}