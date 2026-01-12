import { BaseApiService, handleSupabaseError } from './base'
import { supabase } from '../supabase/client'
import type { Brand, BrandWithCount, ApiResponse, PaginatedResponse } from '../../types/database'

export class BrandsApiService extends BaseApiService<Brand> {
  constructor() {
    super('brands')
  }

  // Получить все активные бренды
  async getActiveBrands(): Promise<PaginatedResponse<Brand>> {
    try {
      const { data, error, count } = await supabase
        .from('brands')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('name', { ascending: true })

      return {
        data: data || [],
        count,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err : new Error('Неизвестная ошибка')
      }
    }
  }

  // Получить бренды с количеством продуктов
  async getBrandsWithProductCount(): Promise<PaginatedResponse<BrandWithCount>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select(`
          *,
          products!inner (
            id
          )
        `)
        .eq('is_active', true)
        .eq('products.is_active', true)
        .order('name', { ascending: true })

      // Подсчитываем количество продуктов для каждого бренда
      const brandsWithCount = data?.map(brand => ({
        ...brand,
        products_count: brand.products?.length || 0,
        products: undefined // Убираем массив продуктов, оставляем только счетчик
      })) || []

      return {
        data: brandsWithCount,
        count: brandsWithCount.length,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err : new Error('Неизвестная ошибка')
      }
    }
  }

  // Получить бренд по slug
  async getBrandBySlug(slug: string): Promise<ApiResponse<Brand>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

      return {
        data,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Неизвестная ошибка')
      }
    }
  }

  // Получить популярные бренды (с наибольшим количеством продуктов)
  async getPopularBrands(limit: number = 8): Promise<PaginatedResponse<BrandWithCount>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select(`
          *,
          products!inner (
            id
          )
        `)
        .eq('is_active', true)
        .eq('products.is_active', true)
        .order('name', { ascending: true })

      if (error) {
        return {
          data: [],
          count: null,
          error: handleSupabaseError(error)
        }
      }

      // Подсчитываем и сортируем по количеству продуктов
      const brandsWithCount = data?.map(brand => ({
        ...brand,
        products_count: brand.products?.length || 0,
        products: undefined
      }))
        .filter(brand => brand.products_count > 0) // Только бренды с продуктами
        .sort((a, b) => (b.products_count || 0) - (a.products_count || 0))
        .slice(0, limit) || []

      return {
        data: brandsWithCount,
        count: brandsWithCount.length,
        error: null
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err : new Error('Неизвестная ошибка')
      }
    }
  }

  // Поиск брендов по названию
  async searchBrands(searchTerm: string, limit: number = 10): Promise<PaginatedResponse<Brand>> {
    try {
      const { data, error, count } = await supabase
        .from('brands')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .ilike('name', `%${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(limit)

      return {
        data: data || [],
        count,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err : new Error('Неизвестная ошибка')
      }
    }
  }

  // Получить бренды по первой букве (для алфавитного указателя)
  async getBrandsByLetter(letter: string): Promise<PaginatedResponse<BrandWithCount>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select(`
          *,
          products!inner (
            id
          )
        `)
        .eq('is_active', true)
        .eq('products.is_active', true)
        .ilike('name', `${letter}%`)
        .order('name', { ascending: true })

      const brandsWithCount = data?.map(brand => ({
        ...brand,
        products_count: brand.products?.length || 0,
        products: undefined
      })) || []

      return {
        data: brandsWithCount,
        count: brandsWithCount.length,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err : new Error('Неизвестная ошибка')
      }
    }
  }

  // Получить алфавитный указатель брендов
  async getBrandsAlphabetIndex(): Promise<ApiResponse<Record<string, number>>> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('name')
        .eq('is_active', true)

      if (error) {
        return {
          data: null,
          error: handleSupabaseError(error)
        }
      }

      // Группируем по первой букве
      const alphabetIndex: Record<string, number> = {}
      
      data?.forEach(brand => {
        const firstLetter = brand.name.charAt(0).toUpperCase()
        alphabetIndex[firstLetter] = (alphabetIndex[firstLetter] || 0) + 1
      })

      return {
        data: alphabetIndex,
        error: null
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Неизвестная ошибка')
      }
    }
  }
}

// Экспортируем экземпляр сервиса
export const brandsApi = new BrandsApiService()