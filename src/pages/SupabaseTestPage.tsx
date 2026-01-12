import React from 'react';
import { useSupabaseConnection, useDatabaseStats } from '../hooks/api/useSupabase';
import { useProducts, useFeaturedProducts, useLatestProducts } from '../hooks/api/useProducts';
import { useCategoriesWithCount, usePopularCategories } from '../hooks/api/useCategories';
import { useBrandsWithCount, usePopularBrands } from '../hooks/api/useBrands';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Loader2, Database, CheckCircle, XCircle, Star, TrendingUp, Clock } from 'lucide-react';

const SupabaseTestPage: React.FC = () => {
  // Тест подключения к Supabase
  const { data: connectionTest, isLoading: connectionLoading, error: connectionError } = useSupabaseConnection();

  // Статистика базы данных
  const { data: stats, isLoading: statsLoading } = useDatabaseStats();

  // Тестируем новые хуки
  const { data: productsData, isLoading: productsLoading, error: productsError } = useProducts(
    {}, // без фильтров
    { field: 'rating', direction: 'desc' }, // сортировка по рейтингу
    { page: 1, limit: 6 } // первые 6 продуктов
  );

  const { data: featuredProducts, isLoading: featuredLoading } = useFeaturedProducts(4);
  const { data: latestProducts, isLoading: latestLoading } = useLatestProducts(4);
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesWithCount();
  const { data: brandsData, isLoading: brandsLoading } = useBrandsWithCount();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Тестирование API интеграции Supabase</h1>
        <p className="text-muted-foreground">
          Проверка новых React Query хуков и API сервисов
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        {/* Статус подключения */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Статус подключения
            </CardTitle>
          </CardHeader>
          <CardContent>
            {connectionLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Проверка подключения...</span>
              </div>
            ) : connectionError ? (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span>Ошибка подключения: {connectionError.message}</span>
              </div>
            ) : connectionTest ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>Подключение к Supabase успешно</span>
                <Badge variant="outline" className="ml-2">
                  {new Date(connectionTest.timestamp).toLocaleTimeString()}
                </Badge>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Статистика базы данных */}
        <Card>
          <CardHeader>
            <CardTitle>Статистика базы данных</CardTitle>
            <CardDescription>Количество записей в основных таблицах</CardDescription>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Загрузка статистики...</span>
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.brands}</div>
                  <div className="text-sm text-muted-foreground">Брендов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.categories}</div>
                  <div className="text-sm text-muted-foreground">Категорий</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.products}</div>
                  <div className="text-sm text-muted-foreground">Продуктов</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.images}</div>
                  <div className="text-sm text-muted-foreground">Изображений</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.affiliateLinks}</div>
                  <div className="text-sm text-muted-foreground">Партн. ссылок</div>
                </div>
              </div>
            ) : (
              <div className="text-red-600">Ошибка загрузки статистики</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Тестирование продуктов */}
      <div className="grid gap-6 mb-8">
        {/* Все продукты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Продукты (с новыми хуками)
            </CardTitle>
            <CardDescription>
              Тестирование useProducts хука с фильтрацией и сортировкой
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Загрузка продуктов...</span>
              </div>
            ) : productsError ? (
              <div className="text-red-600 py-4">
                Ошибка загрузки продуктов: {productsError.message}
              </div>
            ) : productsData?.data && productsData.data.length > 0 ? (
              <div className="grid gap-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Найдено {productsData.count} продуктов, показано {productsData.data.length}
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productsData.data.map((product) => (
                    <Card key={product.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-sm">{product.name}</h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs">{product.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.brands?.name || 'Без бренда'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {product.categories?.name || 'Без категории'}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-bold text-green-600">
                            {product.price.toLocaleString('ru-RU')} ₽
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {product.affiliate_links?.length || 0} ссылок
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Продукты не найдены
              </div>
            )}
          </CardContent>
        </Card>

        {/* Рекомендуемые и новые продукты */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Рекомендуемые продукты
              </CardTitle>
            </CardHeader>
            <CardContent>
              {featuredLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Загрузка...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {featuredProducts?.data?.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{product.name}</span>
                      <Badge variant="secondary">{product.rating} ★</Badge>
                    </div>
                  )) || <div className="text-muted-foreground">Нет данных</div>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Новые продукты
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Загрузка...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {latestProducts?.data?.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{product.name}</span>
                      <Badge variant="outline">{product.price.toLocaleString()} ₽</Badge>
                    </div>
                  )) || <div className="text-muted-foreground">Нет данных</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Категории и бренды */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Категории с количеством продуктов</CardTitle>
            </CardHeader>
            <CardContent>
              {categoriesLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Загрузка...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {categoriesData?.data?.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{category.name}</span>
                      <Badge variant="secondary">{category.products_count || 0}</Badge>
                    </div>
                  )) || <div className="text-muted-foreground">Нет данных</div>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Бренды с количеством продуктов</CardTitle>
            </CardHeader>
            <CardContent>
              {brandsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Загрузка...</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {brandsData?.data?.map((brand) => (
                    <div key={brand.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm font-medium">{brand.name}</span>
                      <Badge variant="secondary">{brand.products_count || 0}</Badge>
                    </div>
                  )) || <div className="text-muted-foreground">Нет данных</div>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Кнопки для дополнительных тестов */}
      <div className="mt-8 flex gap-4">
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Обновить данные
        </Button>
        <Button 
          onClick={() => window.open('/catalog', '_blank')} 
          variant="default"
        >
          Перейти к каталогу
        </Button>
      </div>
    </div>
  );
};

export default SupabaseTestPage;