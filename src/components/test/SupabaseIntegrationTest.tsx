import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, CheckCircle, Database, Users, Package, Tag } from 'lucide-react'

// Импортируем наши новые хуки
import { useSupabaseHealth, useAuth } from '@/hooks/api/useSupabase'
import { useProducts } from '@/hooks/api/useProducts'
import { useCategories } from '@/hooks/api/useCategories'
import { useBrands } from '@/hooks/api/useBrands'

export const SupabaseIntegrationTest: React.FC = () => {
  const { data: health, isLoading: healthLoading } = useSupabaseHealth()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  
  // Тестируем API хуки с небольшими лимитами
  const { data: productsResponse, isLoading: productsLoading, error: productsError } = useProducts({ limit: 5 })
  const { data: categoriesResponse, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const { data: brandsResponse, isLoading: brandsLoading, error: brandsError } = useBrands({ limit: 5 })

  const renderStatus = (isLoading: boolean, error: any, data: any, label: string) => {
    if (isLoading) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <span className="text-sm text-muted-foreground">Загрузка {label}...</span>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <span className="text-sm text-red-600">Ошибка {label}</span>
        </div>
      )
    }

    if (data) {
      return (
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-sm text-green-600">{label} работает</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-yellow-500" />
        <span className="text-sm text-yellow-600">Нет данных {label}</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Тест интеграции Supabase</h1>
        <p className="text-muted-foreground">
          Проверка подключения к базе данных и работы API
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Статус подключения */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Подключение к БД</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {healthLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="space-y-2">
                <Badge variant={health?.status === 'connected' ? 'default' : 'destructive'}>
                  {health?.status === 'connected' ? 'Подключено' : 'Ошибка'}
                </Badge>
                {health?.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    Проверено: {new Date(health.timestamp).toLocaleTimeString('ru-RU')}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Статус аутентификации */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Аутентификация</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {authLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div className="space-y-2">
                <Badge variant={isAuthenticated ? 'default' : 'secondary'}>
                  {isAuthenticated ? 'Авторизован' : 'Гость'}
                </Badge>
                {user && (
                  <p className="text-xs text-muted-foreground">
                    {user.email}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* API статус */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Статус</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {renderStatus(productsLoading, productsError, productsResponse, 'Продукты')}
              {renderStatus(categoriesLoading, categoriesError, categoriesResponse, 'Категории')}
              {renderStatus(brandsLoading, brandsError, brandsResponse, 'Бренды')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Детальная информация */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Продукты */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Продукты
            </CardTitle>
            <CardDescription>
              Тестирование API продуктов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : productsError ? (
              <p className="text-sm text-red-600">
                Ошибка: {productsError.message}
              </p>
            ) : productsResponse?.success && productsResponse.data ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Найдено: {productsResponse.count || 0} продуктов
                </p>
                <div className="space-y-1">
                  {productsResponse.data.slice(0, 3).map((product) => (
                    <div key={product.id} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-muted-foreground">
                        {product.brand?.name} • {product.category?.name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Нет данных</p>
            )}
          </CardContent>
        </Card>

        {/* Категории */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Категории
            </CardTitle>
            <CardDescription>
              Тестирование API категорий
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : categoriesError ? (
              <p className="text-sm text-red-600">
                Ошибка: {categoriesError.message}
              </p>
            ) : categoriesResponse?.success && categoriesResponse.data ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Найдено: {categoriesResponse.data.length} категорий
                </p>
                <div className="space-y-1">
                  {categoriesResponse.data.slice(0, 5).map((category) => (
                    <div key={category.id} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{category.name}</div>
                      {category.description && (
                        <div className="text-muted-foreground truncate">
                          {category.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Нет данных</p>
            )}
          </CardContent>
        </Card>

        {/* Бренды */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Бренды
            </CardTitle>
            <CardDescription>
              Тестирование API брендов
            </CardDescription>
          </CardHeader>
          <CardContent>
            {brandsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            ) : brandsError ? (
              <p className="text-sm text-red-600">
                Ошибка: {brandsError.message}
              </p>
            ) : brandsResponse?.success && brandsResponse.data ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Найдено: {brandsResponse.count || 0} брендов
                </p>
                <div className="space-y-1">
                  {brandsResponse.data.slice(0, 5).map((brand) => (
                    <div key={brand.id} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{brand.name}</div>
                      {brand.description && (
                        <div className="text-muted-foreground truncate">
                          {brand.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Нет данных</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Действия */}
      <Card>
        <CardHeader>
          <CardTitle>Действия для тестирования</CardTitle>
          <CardDescription>
            Дополнительные функции для проверки интеграции
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Обновить данные
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log('Products:', productsResponse)}
            >
              Логи продуктов
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log('Categories:', categoriesResponse)}
            >
              Логи категорий
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => console.log('Brands:', brandsResponse)}
            >
              Логи брендов
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default SupabaseIntegrationTest