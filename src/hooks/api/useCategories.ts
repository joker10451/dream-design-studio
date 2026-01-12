import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriesApi } from '../../lib/api/categories'
import { QUERY_KEYS } from './useSupabase'
import type { Category, CategoryWithCount } from '../../types/database'

// Хук для получения всех активных категорий
export const useCategories = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: () => categoriesApi.getActiveCategories(),
    enabled,
    staleTime: 15 * 60 * 1000, // 15 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения категорий с количеством продуктов
export const useCategoriesWithCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.categories, 'with-count'],
    queryFn: () => categoriesApi.getCategoriesWithProductCount(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения категории по slug
export const useCategory = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.category(slug),
    queryFn: () => categoriesApi.getCategoryBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 15 * 60 * 1000,
  })
}

// Хук для получения популярных категорий
export const usePopularCategories = (limit: number = 6) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.categories, 'popular', limit],
    queryFn: () => categoriesApi.getPopularCategories(limit),
    staleTime: 20 * 60 * 1000, // 20 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения иерархии категорий
export const useCategoriesHierarchy = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.categories, 'hierarchy'],
    queryFn: () => categoriesApi.getCategoriesHierarchy(),
    enabled,
    staleTime: 20 * 60 * 1000,
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для создания категории (для админки)
export const useCreateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (categoryData: Partial<Category>) => 
      categoriesApi.create(categoryData),
    onSuccess: () => {
      // Инвалидируем все запросы категорий
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
    },
  })
}

// Хук для обновления категории (для админки)
export const useUpdateCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      categoriesApi.update(id, updates),
    onSuccess: (data, variables) => {
      // Инвалидируем все запросы категорий
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
      // Обновляем конкретную категорию в кеше
      if (data.data?.slug) {
        queryClient.setQueryData(QUERY_KEYS.category(data.data.slug), data)
      }
    },
  })
}

// Хук для удаления категории (для админки)
export const useDeleteCategory = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      // Инвалидируем все запросы категорий
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories })
    },
  })
}

// Хук для предзагрузки категории
export const usePrefetchCategory = () => {
  const queryClient = useQueryClient()
  
  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.category(slug),
      queryFn: () => categoriesApi.getCategoryBySlug(slug),
      staleTime: 15 * 60 * 1000,
    })
  }
}

// Хук для получения статистики категорий
export const useCategoriesStats = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.categories, 'stats'],
    queryFn: async () => {
      const [allCategories, withProducts] = await Promise.all([
        categoriesApi.getActiveCategories(),
        categoriesApi.getCategoriesWithProductCount()
      ])

      const totalCategories = allCategories.count || 0
      const categoriesWithProducts = withProducts.data?.filter(cat => cat.products_count && cat.products_count > 0).length || 0
      const avgProductsPerCategory = withProducts.data?.reduce((sum, cat) => sum + (cat.products_count || 0), 0) / (withProducts.data?.length || 1) || 0

      return {
        total: totalCategories,
        withProducts: categoriesWithProducts,
        empty: totalCategories - categoriesWithProducts,
        avgProductsPerCategory: Math.round(avgProductsPerCategory * 100) / 100,
        lastUpdated: new Date().toISOString()
      }
    },
    staleTime: 15 * 60 * 1000,
  })
}