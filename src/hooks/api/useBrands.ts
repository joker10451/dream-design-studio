import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandsApi } from '../../lib/api/brands'
import { QUERY_KEYS } from './useSupabase'
import type { Brand, BrandWithCount } from '../../types/database'

// Хук для получения всех активных брендов
export const useBrands = (enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.brands,
    queryFn: () => brandsApi.getActiveBrands(),
    enabled,
    staleTime: 15 * 60 * 1000, // 15 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения брендов с количеством продуктов
export const useBrandsWithCount = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.brands, 'with-count'],
    queryFn: () => brandsApi.getBrandsWithProductCount(),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения бренда по slug
export const useBrand = (slug: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.brand(slug),
    queryFn: () => brandsApi.getBrandBySlug(slug),
    enabled: enabled && !!slug,
    staleTime: 15 * 60 * 1000,
  })
}

// Хук для получения популярных брендов
export const usePopularBrands = (limit: number = 8) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.brands, 'popular', limit],
    queryFn: () => brandsApi.getPopularBrands(limit),
    staleTime: 20 * 60 * 1000, // 20 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для поиска брендов
export const useSearchBrands = (
  searchTerm: string,
  limit: number = 10,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.brands, 'search', searchTerm, limit],
    queryFn: () => brandsApi.searchBrands(searchTerm, limit),
    enabled: enabled && searchTerm.length >= 2, // Минимум 2 символа
    staleTime: 5 * 60 * 1000, // 5 минут
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения брендов по первой букве
export const useBrandsByLetter = (letter: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.brands, 'letter', letter],
    queryFn: () => brandsApi.getBrandsByLetter(letter),
    enabled: enabled && !!letter && letter.length === 1,
    staleTime: 20 * 60 * 1000,
    placeholderData: { data: [], count: 0, error: null },
  })
}

// Хук для получения алфавитного указателя брендов
export const useBrandsAlphabetIndex = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [...QUERY_KEYS.brands, 'alphabet-index'],
    queryFn: () => brandsApi.getBrandsAlphabetIndex(),
    enabled,
    staleTime: 30 * 60 * 1000, // 30 минут
  })
}

// Хук для создания бренда (для админки)
export const useCreateBrand = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (brandData: Partial<Brand>) => 
      brandsApi.create(brandData),
    onSuccess: () => {
      // Инвалидируем все запросы брендов
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands })
    },
  })
}

// Хук для обновления бренда (для админки)
export const useUpdateBrand = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Brand> }) =>
      brandsApi.update(id, updates),
    onSuccess: (data, variables) => {
      // Инвалидируем все запросы брендов
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands })
      // Обновляем конкретный бренд в кеше
      if (data.data?.slug) {
        queryClient.setQueryData(QUERY_KEYS.brand(data.data.slug), data)
      }
    },
  })
}

// Хук для удаления бренда (для админки)
export const useDeleteBrand = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => brandsApi.delete(id),
    onSuccess: () => {
      // Инвалидируем все запросы брендов
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands })
    },
  })
}

// Хук для предзагрузки бренда
export const usePrefetchBrand = () => {
  const queryClient = useQueryClient()
  
  return (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.brand(slug),
      queryFn: () => brandsApi.getBrandBySlug(slug),
      staleTime: 15 * 60 * 1000,
    })
  }
}

// Хук для получения статистики брендов
export const useBrandsStats = () => {
  return useQuery({
    queryKey: [...QUERY_KEYS.brands, 'stats'],
    queryFn: async () => {
      const [allBrands, withProducts] = await Promise.all([
        brandsApi.getActiveBrands(),
        brandsApi.getBrandsWithProductCount()
      ])

      const totalBrands = allBrands.count || 0
      const brandsWithProducts = withProducts.data?.filter(brand => brand.products_count && brand.products_count > 0).length || 0
      const avgProductsPerBrand = withProducts.data?.reduce((sum, brand) => sum + (brand.products_count || 0), 0) / (withProducts.data?.length || 1) || 0

      return {
        total: totalBrands,
        withProducts: brandsWithProducts,
        empty: totalBrands - brandsWithProducts,
        avgProductsPerBrand: Math.round(avgProductsPerBrand * 100) / 100,
        lastUpdated: new Date().toISOString()
      }
    },
    staleTime: 15 * 60 * 1000,
  })
}