import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Plus, Minus, ShoppingCart, TrendingDown, ExternalLink, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { products, type Product } from "@/data/products";
import { MarketplaceComparison } from "./MarketplaceComparison";
import { AlternativeRecommendations } from "./AlternativeRecommendations";
import type { SelectedDevice, CostCalculatorState, CalculatorRecommendation } from "@/types/calculator";

const deviceCategories = [
  {
    id: "sockets",
    name: "Умные розетки",
    description: "Базовые элементы автоматизации",
    minQuantity: 2,
    maxQuantity: 10,
    isRequired: true
  },
  {
    id: "lighting",
    name: "Освещение",
    description: "Умные лампы и выключатели",
    minQuantity: 1,
    maxQuantity: 8,
    isRequired: false
  },
  {
    id: "sensors",
    name: "Датчики",
    description: "Датчики движения, температуры, влажности",
    minQuantity: 1,
    maxQuantity: 6,
    isRequired: false
  },
  {
    id: "cameras",
    name: "Видеокамеры",
    description: "Системы видеонаблюдения",
    minQuantity: 1,
    maxQuantity: 4,
    isRequired: false
  },
  {
    id: "hubs",
    name: "Хабы",
    description: "Центры управления умным домом",
    minQuantity: 1,
    maxQuantity: 2,
    isRequired: false
  }
];

export function CostCalculator() {
  const [calculatorState, setCalculatorState] = useState<CostCalculatorState>({
    selectedDevices: [],
    totalCost: 0,
    alternatives: [],
    marketplaceComparison: []
  });

  const [recommendations, setRecommendations] = useState<CalculatorRecommendation[]>([]);
  const [selectedProductForComparison, setSelectedProductForComparison] = useState<Product | null>(null);

  // Получаем продукты по категориям
  const getProductsByCategory = (categoryId: string): Product[] => {
    return products.filter(product => product.category === categoryId);
  };

  // Добавляем устройство в калькулятор
  const addDevice = (product: Product, marketplace: string, quantity: number = 1) => {
    const affiliateLink = product.affiliateLinks.find(link => link.marketplace === marketplace);
    if (!affiliateLink) return;

    const newDevice: SelectedDevice = {
      deviceId: product.id,
      quantity,
      selectedMarketplace: marketplace,
      price: affiliateLink.price
    };

    setCalculatorState(prev => ({
      ...prev,
      selectedDevices: [...prev.selectedDevices, newDevice]
    }));
  };

  // Удаляем устройство из калькулятора
  const removeDevice = (deviceId: string) => {
    setCalculatorState(prev => ({
      ...prev,
      selectedDevices: prev.selectedDevices.filter(device => device.deviceId !== deviceId)
    }));
  };

  // Обновляем количество устройства
  const updateQuantity = (deviceId: string, quantity: number) => {
    if (quantity <= 0) {
      removeDevice(deviceId);
      return;
    }

    setCalculatorState(prev => ({
      ...prev,
      selectedDevices: prev.selectedDevices.map(device =>
        device.deviceId === deviceId ? { ...device, quantity } : device
      )
    }));
  };

  // Пересчитываем общую стоимость
  useEffect(() => {
    const totalCost = calculatorState.selectedDevices.reduce(
      (sum, device) => sum + (device.price * device.quantity),
      0
    );

    setCalculatorState(prev => ({
      ...prev,
      totalCost
    }));

    // Генерируем рекомендации
    generateRecommendations();
  }, [calculatorState.selectedDevices]);

  // Генерируем альтернативные рекомендации
  const generateRecommendations = () => {
    const budgetRec: CalculatorRecommendation = {
      category: 'budget',
      totalCost: 0,
      devices: [],
      description: 'Базовый набор для начинающих'
    };

    const midRangeRec: CalculatorRecommendation = {
      category: 'mid-range',
      totalCost: 0,
      devices: [],
      description: 'Оптимальное соотношение цена/качество'
    };

    const premiumRec: CalculatorRecommendation = {
      category: 'premium',
      totalCost: 0,
      devices: [],
      description: 'Премиальные решения с максимальным функционалом'
    };

    // Для каждой категории выбираем самые дешевые, средние и дорогие устройства
    deviceCategories.forEach(category => {
      const categoryProducts = getProductsByCategory(category.id);
      if (categoryProducts.length === 0) return;

      const sortedByPrice = [...categoryProducts].sort((a, b) => a.price - b.price);
      
      // Бюджетный вариант - самое дешевое
      if (sortedByPrice[0]) {
        const cheapest = sortedByPrice[0];
        const affiliateLink = cheapest.affiliateLinks[0];
        if (affiliateLink) {
          budgetRec.devices.push({
            deviceId: cheapest.id,
            quantity: category.minQuantity,
            selectedMarketplace: affiliateLink.marketplace,
            price: affiliateLink.price
          });
          budgetRec.totalCost += affiliateLink.price * category.minQuantity;
        }
      }

      // Средний вариант
      const midIndex = Math.floor(sortedByPrice.length / 2);
      if (sortedByPrice[midIndex]) {
        const mid = sortedByPrice[midIndex];
        const affiliateLink = mid.affiliateLinks[0];
        if (affiliateLink) {
          midRangeRec.devices.push({
            deviceId: mid.id,
            quantity: category.minQuantity,
            selectedMarketplace: affiliateLink.marketplace,
            price: affiliateLink.price
          });
          midRangeRec.totalCost += affiliateLink.price * category.minQuantity;
        }
      }

      // Премиум вариант - самое дорогое
      const mostExpensive = sortedByPrice[sortedByPrice.length - 1];
      if (mostExpensive) {
        const affiliateLink = mostExpensive.affiliateLinks[0];
        if (affiliateLink) {
          premiumRec.devices.push({
            deviceId: mostExpensive.id,
            quantity: category.minQuantity,
            selectedMarketplace: affiliateLink.marketplace,
            price: affiliateLink.price
          });
          premiumRec.totalCost += affiliateLink.price * category.minQuantity;
        }
      }
    });

    // Рассчитываем экономию относительно текущего выбора
    if (calculatorState.totalCost > 0) {
      budgetRec.savings = Math.max(0, calculatorState.totalCost - budgetRec.totalCost);
      midRangeRec.savings = Math.max(0, calculatorState.totalCost - midRangeRec.totalCost);
    }

    setRecommendations([budgetRec, midRangeRec, premiumRec]);
  };

  // Применяем рекомендацию
  const applyRecommendation = (recommendation: CalculatorRecommendation) => {
    setCalculatorState(prev => ({
      ...prev,
      selectedDevices: [...recommendation.devices],
      totalCost: recommendation.totalCost
    }));
  };

  // Заменяем устройство на альтернативное
  const replaceDevice = (oldDeviceId: string, newDevice: SelectedDevice) => {
    setCalculatorState(prev => ({
      ...prev,
      selectedDevices: prev.selectedDevices.map(device =>
        device.deviceId === oldDeviceId ? newDevice : device
      )
    }));
  };

  // Показываем сравнение цен для продукта
  const showPriceComparison = (product: Product) => {
    setSelectedProductForComparison(product);
  };

  // Добавляем устройство из сравнения цен
  const addDeviceFromComparison = (marketplace: string, price: number) => {
    if (!selectedProductForComparison) return;
    addDevice(selectedProductForComparison, marketplace);
    setSelectedProductForComparison(null);
  };

  // Получаем продукт по ID
  const getProductById = (id: string): Product | undefined => {
    return products.find(product => product.id === id);
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-gradient">Калькулятор стоимости</h1>
        </div>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Рассчитайте стоимость системы умного дома и получите персональные рекомендации
        </p>
      </div>

      {/* Информационное сообщение */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Выберите устройства из каталога, сравните цены на разных маркетплейсах и получите рекомендации по оптимизации бюджета.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Выбор устройств */}
        <div className="lg:col-span-2 space-y-6">
          {deviceCategories.map((category) => {
            const categoryProducts = getProductsByCategory(category.id);
            
            return (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {category.name}
                        {category.isRequired && (
                          <Badge variant="secondary">Обязательно</Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {categoryProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryProducts.map((product) => (
                        <motion.div
                          key={product.id}
                          whileHover={{ scale: 1.02 }}
                          className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={product.images[0]?.url}
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {product.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                {product.brand}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="font-semibold text-sm">
                                  от {Math.min(...product.affiliateLinks.map(l => l.price)).toLocaleString("ru-RU")} ₽
                                </span>
                              </div>
                              <div className="flex gap-1 mt-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs h-7 flex-1"
                                  onClick={() => showPriceComparison(product)}
                                >
                                  Сравнить цены
                                </Button>
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="text-xs h-7"
                                  onClick={() => {
                                    const cheapestLink = product.affiliateLinks.reduce((prev, current) => 
                                      prev.price < current.price ? prev : current
                                    );
                                    addDevice(product, cheapestLink.marketplace);
                                  }}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Устройства этой категории скоро появятся
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Рекомендации по альтернативам */}
          {calculatorState.selectedDevices.length > 0 && (
            <AlternativeRecommendations
              selectedDevices={calculatorState.selectedDevices}
              onReplaceDevice={replaceDevice}
            />
          )}
        </div>

        {/* Корзина и итоги */}
        <div className="space-y-6">
          {/* Выбранные устройства */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Ваш набор
              </CardTitle>
            </CardHeader>
            <CardContent>
              {calculatorState.selectedDevices.length > 0 ? (
                <div className="space-y-4">
                  {calculatorState.selectedDevices.map((device) => {
                    const product = getProductById(device.deviceId);
                    if (!product) return null;

                    return (
                      <div key={`${device.deviceId}-${device.selectedMarketplace}`} className="flex items-center gap-3">
                        <img
                          src={product.images[0]?.url}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {device.selectedMarketplace === 'wildberries' ? 'Wildberries' : 
                             device.selectedMarketplace === 'ozon' ? 'OZON' : 
                             device.selectedMarketplace}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(device.deviceId, device.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {device.quantity}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(device.deviceId, device.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">
                            {(device.price * device.quantity).toLocaleString("ru-RU")} ₽
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Итого:</span>
                    <span className="text-2xl font-bold text-primary">
                      {calculatorState.totalCost.toLocaleString("ru-RU")} ₽
                    </span>
                  </div>

                  {/* Кнопки покупки */}
                  <div className="space-y-2">
                    {calculatorState.selectedDevices.map((device) => {
                      const product = getProductById(device.deviceId);
                      const affiliateLink = product?.affiliateLinks.find(
                        link => link.marketplace === device.selectedMarketplace
                      );
                      
                      if (!product || !affiliateLink) return null;

                      return (
                        <Button
                          key={`${device.deviceId}-${device.selectedMarketplace}`}
                          variant="outline"
                          size="sm"
                          className="w-full justify-between"
                          asChild
                        >
                          <a href={affiliateLink.url} target="_blank" rel="noopener noreferrer">
                            <span>{product.name} x{device.quantity}</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm text-center py-8">
                  Выберите устройства для расчета стоимости
                </p>
              )}
            </CardContent>
          </Card>

          {/* Рекомендации */}
          {recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="w-5 h-5" />
                  Готовые решения
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.category}
                      className="border rounded-lg p-3 hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => applyRecommendation(rec)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={
                          rec.category === 'budget' ? 'secondary' :
                          rec.category === 'mid-range' ? 'default' : 'destructive'
                        }>
                          {rec.category === 'budget' ? 'Бюджет' :
                           rec.category === 'mid-range' ? 'Оптимум' : 'Премиум'}
                        </Badge>
                        <span className="font-semibold text-sm">
                          {rec.totalCost.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {rec.description}
                      </p>
                      {rec.savings && rec.savings > 0 && (
                        <p className="text-xs text-green-600">
                          Экономия: {rec.savings.toLocaleString("ru-RU")} ₽
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Модальное окно сравнения цен */}
      {selectedProductForComparison && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="font-semibold">Сравнение цен</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProductForComparison(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-4">
              <MarketplaceComparison
                product={selectedProductForComparison}
                onSelectMarketplace={addDeviceFromComparison}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}