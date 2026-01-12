import { BaseApiService, handleSupabaseError } from './base'
import { supabase } from '../supabase/client'
import type { Category, CategoryWithCount, ApiResponse, PaginatedResponse } from '../../types/database'

export class CategoriesApiService extends BaseApiService<Category> {
  constructor() {
    super('categories')
  }

  // Получить все активные категории
  async getActiveCategories(): Promise<PaginatedResponse<Category>> {
    try {
      const { data, error, count } = await supabase
        .from('categories')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

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

  // Получить категории с количеством продуктов
  async getCategoriesWithProductCount(): Promise<PaginatedResponse<CategoryWithCount>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products!inner (
            id
          )
        `)
        .eq('is_active', true)
        .eq('products.is_active', true)
        .order('sort_order', { ascending: true })

      // Подсчитываем количество продуктов для каждой категории
      const categoriesWithCount = data?.map(category => ({
        ...category,
        products_count: category.products?.length || 0,
        products: undefined // Убираем массив продуктов, оставляем только счетчик
      })) || []

      return {
        data: categoriesWithCount,
        count: categoriesWithCount.length,
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

  // Получить категорию по slug
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await supabase
        .from('categories')
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

  // Получить популярные категории (с наибольшим количеством продуктов)
  async getPopularCategories(limit: number = 6): Promise<PaginatedResponse<CategoryWithCount>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          products!inner (
            id
          )
        `)
        .eq('is_active', true)
        .eq('products.is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        return {
          data: [],
          count: null,
          error: handleSupabaseError(error)
        }
      }

      // Подсчитываем и сортируем по количеству продуктов
      const categoriesWithCount = data?.map(category => ({
        ...category,
        products_count: category.products?.length || 0,
        products: undefined
      }))
        .sort((a, b) => (b.products_count || 0) - (a.products_count || 0))
        .slice(0, limit) || []

      return {
        data: categoriesWithCount,
        count: categoriesWithCount.length,
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

  // Получить иерархию категорий (родительские и дочерние)
  async getCategoriesHierarchy(): Promise<PaginatedResponse<Category & { children?: Category[] }>> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        return {
          data: [],
          count: null,
          error: handleSupabaseError(error)
        }
      }

      // Строим иерархию
      const categoriesMap = new Map<string, Category & { children: Category[] }>()
      const rootCategories: (Category & { children: Category[] })[] = []

      // Инициализируем все категории
      data?.forEach(category => {
        categoriesMap.set(category.id, { ...category, children: [] })
      })

      // Строим иерархию
      data?.forEach(category => {
        const categoryWithChildren = categoriesMap.get(category.id)!
        
        if (category.parent_id) {
          const parent = categoriesMap.get(category.parent_id)
          if (parent) {
            parent.children.push(categoryWithChildren)
          }
        } else {
          rootCategories.push(categoryWithChildren)
        }
      })

      return {
        data: rootCategories,
        count: rootCategories.length,
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
}

// Экспортируем экземпляр сервиса
export const categoriesApi = new CategoriesApiService()