import { motion } from "framer-motion";
import { ExternalLink, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAffiliateTracking } from "@/components/affiliate/AffiliateTracker";
import { AFFILIATE_CONFIG } from "@/lib/affiliateUtils";
import type { Product } from "@/data/products";

interface MarketplaceComparisonProps {
  product: Product;
  onSelectMarketplace: (marketplace: string, price: number) => void;
}

export function MarketplaceComparison({ product, onSelectMarketplace }: MarketplaceComparisonProps) {
  const { trackClick } = useAffiliateTracking();
  
  // Сортируем партнерские ссылки по цене
  const sortedLinks = [...product.affiliateLinks].sort((a, b) => a.price - b.price);
  const lowestPrice = sortedLinks[0]?.price || 0;

  const getMarketplaceName = (marketplace: string) => {
    return AFFILIATE_CONFIG[marketplace as keyof typeof AFFILIATE_CONFIG]?.name || marketplace;
  };

  const handleLinkClick = (link: any) => {
    trackClick(link, 'price_comparison', product.id);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Сравнение цен</CardTitle>
        <p className="text-sm text-muted-foreground">
          {product.name}
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedLinks.map((link, index) => {
            const isLowest = link.price === lowestPrice;
            const discount = product.oldPrice 
              ? Math.round((1 - link.price / product.oldPrice) * 100)
              : 0;
            const priceDifference = link.price - lowestPrice;

            return (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`border rounded-lg p-4 transition-colors hover:border-primary/50 ${
                  isLowest ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {getMarketplaceName(link.marketplace)}
                    </h4>
                    {isLowest && (
                      <Badge variant="secondary" className="text-xs">
                        Лучшая цена
                      </Badge>
                    )}
                  </div>
                  {link.isAvailable ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      В наличии
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-red-600 border-red-600">
                      Нет в наличии
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold">
                      {link.price.toLocaleString("ru-RU")} ₽
                    </span>
                    {product.oldPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        {product.oldPrice.toLocaleString("ru-RU")} ₽
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {discount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        -{discount}%
                      </Badge>
                    )}
                    {priceDifference > 0 && (
                      <div className="flex items-center gap-1 text-xs text-red-600">
                        <TrendingUp className="w-3 h-3" />
                        +{priceDifference.toLocaleString("ru-RU")} ₽
                      </div>
                    )}
                    {isLowest && priceDifference === 0 && (
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingDown className="w-3 h-3" />
                        Экономия
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={isLowest ? "default" : "outline"}
                    size="sm"
                    className="flex-1"
                    onClick={() => onSelectMarketplace(link.marketplace, link.price)}
                    disabled={!link.isAvailable}
                  >
                    Добавить в расчет
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    disabled={!link.isAvailable}
                    onClick={() => handleLinkClick(link)}
                  >
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground mt-2">
                  Обновлено: {new Date(link.lastUpdated).toLocaleDateString("ru-RU")}
                </p>
              </motion.div>
            );
          })}
        </div>

        {sortedLinks.length === 0 && (
          <p className="text-muted-foreground text-sm text-center py-4">
            Цены временно недоступны
          </p>
        )}
      </CardContent>
    </Card>
  );
}