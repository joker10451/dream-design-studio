import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '../../lib/api/products'
import { QUERY_KEYS } from './useSupabase'
import type { 
  SearchFilters, 
  SortOptions, 
  PaginationOptions,
  ProductWithRelations 
} from '../../types/database'

// Хук для получения продуктов с фильтрацией и пагинацией
export const useProducts = (
  filters: SearchFilters = {},
  sort: SortOptions = { field: 'created_at', direction: 'desc' },
  pagination: PaginationOptions = { page: 1, limit: 20 },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, 'filtered', filters, sort, pagination],
    queryFn: () => productsApi.getProductsWithRelations(filters, sort, pagination),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения продукта по slug
export const useProduct = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.product(slug),
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 10 * 60 * 1000, // 10 минут
  })
}

// Хук для получения похожих продуктов
export const useSimilarProducts = (productId: string, limit: number = 4) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, 'similar', productId, limit],
    queryFn: () => productsApi.getSimilarProducts(productId, limit),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения рекомендуемых продуктов
export const useFeaturedProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, 'featured', limit],
    queryFn: () => productsApi.getFeaturedProducts(limit),
    staleTime: 15 * 60 * 1000, // 15 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения новых продуктов
export const useLatestProducts = (limit: number = 8) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, 'latest', limit],
    queryFn: () => productsApi.getLatestProducts(limit),
    staleTime: 5 * 60 * 1000,
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для поиска продуктов
export const useSearchProducts = (
  searchTerm: string,
  filters: Omit<SearchFilters, 'search'> = {},
  limit: number = 20,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, 'search', searchTerm, filters, limit],
    queryFn: () => productsApi.searchProducts(searchTerm, filters, limit),
    enabled: enabled && searchTerm.length >= 2, // Минимум 2 символа для поиска
    staleTime: 2 * 60 * 1000, // 2 минуты
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения продуктов по категории
export const useProductsByCategory = (
  categorySlug: string,
  sort: SortOptions = { field: 'name', direction: 'asc' },
  pagination: PaginationOptions = { page: 1, limit: 20 },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.productsByCategory(categorySlug), sort, pagination],
    queryFn: () => productsApi.getProductsByCategory(categorySlug, sort, pagination),
    enabled: enabled && !!categorySlug,
    staleTime: 10 * 60 * 1000,
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения продуктов по бренду
export const useProductsByBrand = (
  brandSlug: string,
  sort: SortOptions = { field: 'name', direction: 'asc' },
  pagination: PaginationOptions = { page: 1, limit: 20 },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.productsByBrand(brandSlug), sort, pagination],
    queryFn: () => productsApi.getProductsByBrand(brandSlug, sort, pagination),
    enabled: enabled && !!brandSlug,
    staleTime: 10 * 60 * 1000,
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для создания продукта (для админки)
export const useCreateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (productData: Partial<ProductWithRelations>) => 
      productsApi.create(productData),
    onSuccess: () => {
      // Инвалидируем все запросы продуктов
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
    },
  })
}

// Хук для обновления продукта (для админки)
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ProductWithRelations> }) =>
      productsApi.update(id, updates),
    onSuccess: (data, variables) => {
      // Инвалидируем все запросы продуктов
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
      // Обновляем конкретный продукт в кеше
      if (data.data) {
        queryClient.setQueryData(QUERY_KEYS.product(variables.id), data)
      }
    },
  })
}

// Хук для удаления продукта (для админки)
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      // Инвалидируем все запросы продуктов
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products })
    },
  })
}

// Хук для предзагрузки продукта (для оптимизации)
export const usePrefetchProduct = () => {
  const queryClient = useQueryClient()
  
  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.product(slug),
      queryFn: () => productsApi.getProductBySlug(slug),
      staleTime: 10 * 60 * 1000,
    })
  }
}

// Хук для получения статистики продуктов
export const useProductsStats = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.products, 'stats'],
    queryFn: async () => {
      const [totalResult, activeResult, featuredResult] = await Promise.all([
        productsApi.findAll({}),
        productsApi.findAll({ isActive: true }),
        productsApi.findAll({ isActive: true, featured: true })
      ])

      return {
        total: totalResult.count || 0,
        active: activeResult.count || 0,
        featured: featuredResult.count || 0,
        lastUpdated: new Date().toISOString()
      }
    },
    staleTime: 15 * 60 * 1000, // 15 минут
  })
}