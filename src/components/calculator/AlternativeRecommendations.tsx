import { motion } from "framer-motion";
import { Lightbulb, TrendingDown, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { products, type Product } from "@/data/products";
import type { Alternative, SelectedDevice } from "@/types/calculator";

interface AlternativeRecommendationsProps {
  selectedDevices: SelectedDevice[];
  onReplaceDevice: (oldDeviceId: string, newDevice: SelectedDevice) => void;
}

export function AlternativeRecommendations({ 
  selectedDevices, 
  onReplaceDevice 
}: AlternativeRecommendationsProps) {
  // Генерируем альтернативы для выбранных устройств
  const generateAlternatives = (): Alternative[] => {
    const alternatives: Alternative[] = [];

    selectedDevices.forEach(selectedDevice => {
      const currentProduct = products.find(p => p.id === selectedDevice.deviceId);
      if (!currentProduct) return;

      // Находим более дешевые альтернативы в той же категории
      const categoryProducts = products.filter(p => 
        p.category === currentProduct.category && 
        p.id !== currentProduct.id &&
        p.price < currentProduct.price
      );

      // Сортируем по рейтингу и цене
      const sortedAlternatives = categoryProducts
        .sort((a, b) => b.rating - a.rating || a.price - b.price)
        .slice(0, 2); // Берем топ-2 альтернативы

      sortedAlternatives.forEach(altProduct => {
        const savings = (currentProduct.price - altProduct.price) * selectedDevice.quantity;
        if (savings > 0) {
          alternatives.push({
            deviceId: altProduct.id,
            reason: `Экономия ${savings.toLocaleString("ru-RU")} ₽ при сохранении функциональности`,
            savings,
            category: currentProduct.category
          });
        }
      });

      // Находим более функциональные альтернативы (с лучшим рейтингом)
      const betterRatedProducts = products.filter(p => 
        p.category === currentProduct.category && 
        p.id !== currentProduct.id &&
        p.rating > currentProduct.rating &&
        p.price <= currentProduct.price * 1.3 // Не более чем на 30% дороже
      );

      betterRatedProducts
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 1)
        .forEach(betterProduct => {
          const extraCost = (betterProduct.price - currentProduct.price) * selectedDevice.quantity;
          alternatives.push({
            deviceId: betterProduct.id,
            reason: `Лучший рейтинг (${betterProduct.rating} vs ${currentProduct.rating}) за доплату ${extraCost.toLocaleString("ru-RU")} ₽`,
            savings: -extraCost,
            category: currentProduct.category
          });
        });
    });

    return alternatives.slice(0, 6); // Ограничиваем количество рекомендаций
  };

  const alternatives = generateAlternatives();

  const handleReplaceDevice = (alternative: Alternative) => {
    const altProduct = products.find(p => p.id === alternative.deviceId);
    if (!altProduct) return;

    // Находим оригинальное устройство для замены
    const originalDevice = selectedDevices.find(device => {
      const product = products.find(p => p.id === device.deviceId);
      return product?.category === alternative.category;
    });

    if (!originalDevice) return;

    const affiliateLink = altProduct.affiliateLinks[0];
    if (!affiliateLink) return;

    const newDevice: SelectedDevice = {
      deviceId: altProduct.id,
      quantity: originalDevice.quantity,
      selectedMarketplace: affiliateLink.marketplace,
      price: affiliateLink.price
    };

    onReplaceDevice(originalDevice.deviceId, newDevice);
  };

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Рекомендации по оптимизации
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Альтернативные варианты для экономии или улучшения функциональности
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alternatives.map((alternative, index) => {
            const altProduct = products.find(p => p.id === alternative.deviceId);
            if (!altProduct) return null;

            const isSavings = alternative.savings > 0;

            return (
              <motion.div
                key={`${alternative.deviceId}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={altProduct.images[0]?.url}
                    alt={altProduct.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">
                          {altProduct.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {altProduct.brand}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                          <span className="text-xs">{altProduct.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          {altProduct.price.toLocaleString("ru-RU")} ₽
                        </p>
                        <Badge 
                          variant={isSavings ? "secondary" : "outline"}
                          className={`text-xs ${
                            isSavings ? "text-green-600" : "text-blue-600"
                          }`}
                        >
                          {isSavings ? (
                            <>
                              <TrendingDown className="w-3 h-3 mr-1" />
                              -{alternative.savings.toLocaleString("ru-RU")} ₽
                            </>
                          ) : (
                            <>
                              +{Math.abs(alternative.savings).toLocaleString("ru-RU")} ₽
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-3">
                      {alternative.reason}
                    </p>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleReplaceDevice(alternative)}
                      >
                        Заменить
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="px-2"
                        asChild
                      >
                        <a 
                          href={altProduct.affiliateLinks[0]?.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}