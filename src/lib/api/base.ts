import { supabase } from '../supabase/client'
import type { PostgrestError } from '@supabase/supabase-js'

// Базовые типы для API ответов
export interface ApiResponse<T> {
  data: T | null
  error: PostgrestError | Error | null
  loading?: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number | null
  error: PostgrestError | Error | null
  loading?: boolean
}

// Базовые параметры для запросов
export interface BaseQueryParams {
  limit?: number
  offset?: number
  orderBy?: string
  ascending?: boolean
}

export interface FilterParams {
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
  featured?: boolean
}

// Утилиты для работы с ошибками
export class ApiError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const handleSupabaseError = (error: PostgrestError | null): ApiError | null => {
  if (!error) return null
  
  return new ApiError(
    error.message || 'Произошла ошибка при запросе к базе данных',
    error.code,
    error.details
  )
}

// Утилиты для построения запросов
export const buildQuery = (
  baseQuery: any,
  params: BaseQueryParams & FilterParams
) => {
  let query = baseQuery

  // Фильтрация
  if (params.search) {
    query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }
  
  if (params.category) {
    query = query.eq('categories.slug', params.category)
  }
  
  if (params.brand) {
    query = query.eq('brands.slug', params.brand)
  }
  
  if (params.minPrice !== undefined) {
    query = query.gte('price', params.minPrice)
  }
  
  if (params.maxPrice !== undefined) {
    query = query.lte('price', params.maxPrice)
  }
  
  if (params.isActive !== undefined) {
    query = query.eq('is_active', params.isActive)
  }
  
  if (params.featured !== undefined) {
    query = query.eq('featured', params.featured)
  }

  // Сортировка
  if (params.orderBy) {
    query = query.order(params.orderBy, { ascending: params.ascending ?? true })
  }

  // Пагинация
  if (params.limit) {
    query = query.limit(params.limit)
  }
  
  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 10) - 1)
  }

  return query
}

// Базовые CRUD операции
export class BaseApiService<T = any> {
  constructor(protected tableName: string) {}

  async findAll(params: BaseQueryParams & FilterParams = {}): Promise<PaginatedResponse<T>> {
    try {
      const query = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })

      const builtQuery = buildQuery(query, params)
      const { data, error, count } = await builtQuery

      return {
        data: data || [],
        count,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: [],
        count: null,
        error: err instanceof Error ? err : new ApiError('Неизвестная ошибка')
      }
    }
  }

  async findById(id: string): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single()

      return {
        data,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new ApiError('Неизвестная ошибка')
      }
    }
  }

  async create(item: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(item)
        .select()
        .single()

      return {
        data,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new ApiError('Неизвестная ошибка')
      }
    }
  }

  async update(id: string, updates: Partial<T>): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      return {
        data,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err : new ApiError('Неизвестная ошибка')
      }
    }
  }

  async delete(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)

      return {
        data: !error,
        error: handleSupabaseError(error)
      }
    } catch (err) {
      return {
        data: false,
        error: err instanceof Error ? err : new ApiError('Неизвестная ошибка')
      }
    }
  }
}

// Экспорт Supabase клиента для прямого использования
export { supabase }