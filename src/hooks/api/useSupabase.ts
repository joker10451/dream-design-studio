import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '../../lib/supabase/client'
import type { ApiResponse, PaginatedResponse } from '../../lib/api/base'

// Базовые ключи для React Query
export const QUERY_KEYS = {
  // Продукты
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  productsByCategory: (category: string) => ['products', 'category', category] as const,
  productsByBrand: (brand: string) => ['products', 'brand', brand] as const,

  // Категории
  categories: ['categories'] as const,
  category: (id: string) => ['categories', id] as const,

  // Бренды
  brands: ['brands'] as const,
  brand: (id: string) => ['brands', id] as const,

  // Системные настройки
  settings: ['settings'] as const,
  setting: (key: string) => ['settings', key] as const,

  // Аналитика
  analytics: ['analytics'] as const,
  stats: ['analytics', 'stats'] as const,

  // Данные пользователя
  favorites: ['favorites'] as const,
  shoppingLists: ['shoppingLists'] as const,
  shoppingListItems: (listId: string) => ['shoppingLists', 'items', listId] as const,
} as const

// Хук для проверки подключения к Supabase
export const useSupabaseConnection = () => {
  return useQuery({
    queryKey: ['supabase-connection'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('key')
          .limit(1)

        if (error) throw error

        return { connected: true, timestamp: new Date().toISOString() }
      } catch (error) {
        throw new Error(`Ошибка подключения к Supabase: ${error}`)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
    retry: 3,
    retryDelay: 1000,
  })
}

// Хук для получения системных настроек
export const useSystemSettings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.settings,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('is_public', true)

      if (error) throw error

      // Преобразуем в удобный формат key-value
      const settings: Record<string, any> = {}
      data?.forEach(setting => {
        settings[setting.key] = setting.value
      })

      return settings
    },
    staleTime: 10 * 60 * 1000, // 10 минут
  })
}

// Хук для получения конкретной настройки
export const useSystemSetting = (key: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.setting(key),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', key)
        .eq('is_public', true)
        .single()

      if (error) throw error
      return data?.value
    },
    staleTime: 10 * 60 * 1000,
  })
}

// Хук для получения статистики базы данных
export const useDatabaseStats = () => {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      const [
        brandsResult,
        categoriesResult,
        productsResult,
        imagesResult,
        linksResult
      ] = await Promise.all([
        supabase.from('brands').select('id', { count: 'exact', head: true }),
        supabase.from('categories').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('product_images').select('id', { count: 'exact', head: true }),
        supabase.from('affiliate_links').select('id', { count: 'exact', head: true })
      ])

      return {
        brands: brandsResult.count || 0,
        categories: categoriesResult.count || 0,
        products: productsResult.count || 0,
        images: imagesResult.count || 0,
        affiliateLinks: linksResult.count || 0,
        lastUpdated: new Date().toISOString()
      }
    },
    staleTime: 5 * 60 * 1000, // 5 минут
  })
}

// Утилиты для инвалидации кеша
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient()

  return {
    invalidateProducts: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.products }),
    invalidateCategories: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.categories }),
    invalidateBrands: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brands }),
    invalidateSettings: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings }),
    invalidateStats: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats }),
    invalidateAll: () => queryClient.invalidateQueries(),
  }
}

// Хук для мутаций с автоматической инвалидацией
export const useSupabaseMutation = <TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
    invalidateKeys?: string[][]
  }
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Инвалидируем указанные ключи
      options?.invalidateKeys?.forEach(key => {
        queryClient.invalidateQueries({ queryKey: key })
      })

      options?.onSuccess?.(data, variables)
    },
    onError: options?.onError,
  })
}

// Хук для real-time подписок
export const useSupabaseSubscription = <T = any>(
  table: string,
  filter?: string,
  callback?: (payload: any) => void
) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = supabase
      .channel(`${table}-changes`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter
        },
        (payload) => {
          // Инвалидируем связанные запросы
          queryClient.invalidateQueries({ queryKey: [table] as any })
          callback?.(payload)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, filter, callback, queryClient])
}