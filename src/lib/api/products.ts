import { BaseApiService, buildQuery, handleSupabaseError } from './base'
import { supabase } from '../supabase/client'
import type { 
  Product, 
  ProductWithRelations, 
  SearchFilters, 
  SortOptions,
  PaginationOptions,
  ApiResponse,
  PaginatedResponse 
} from '../../types/database'

export class ProductsApiService extends BaseApiService<Product> {
  constructor() {
    super('products')
  }

  // Получить продукты с связанными данными
  async getProductsWithRelations(
    filters: SearchFilters = {},
    sort: SortOptions = { field: 'created_at', direction: 'desc' },
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<ProductWithRelations>> {
    try {
      const offset = (pagination.page - 1) * pagination.limit
      
      let query = supabase
        .from('products')
        .select(`
          *,
          brands:brand_id (
            id,
            name,
            slug,
            logo_url
          ),
          categories:category_id (
            id,
            name,
            slug
          ),
          product_images (
            id,
            url,
            alt_text,
            is_primary,
            sort_order
          ),
          affiliate_links (
            id,
            marketplace,
            url,
            price,
            old_price,
            is_available,
            last_updated
          )
        `, { count: 'exact' })
        .eq('is_active', true)

      // Применяем фильтры
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      
      if (filters.category) {
        query = query.eq('categories.slug', filters.category)
      }
      
      if (filters.brand) {
        query = query.eq('brands.slug', filters.brand)
      }
      
      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice)
      }
      
      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice)
      }
      
      if (filters.rating !== undefined) {
        query = query.gte('rating', filters.rating)
      }
      
      if (filters.featured !== undefined) {
        query = query.eq('featured', filters.featured)
      }
      
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      // Применяем сортировку
      query = query.order(sort.field, { ascending: sort.direction === 'asc' })

      // Применяем пагинацию
      query = query.range(offset, offset + pagination.limit - 1)

      const { data, error, count } = await query

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

  // Получить продукт по slug с связанными данными
  async getProductBySlug(slug: string): Promise<ApiResponse<ProductWithRelations>> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          brands:brand_id (
            id,
            name,
            slug,
            description,
            logo_url,
            website_url
          ),
          categories:category_id (
            id,
            name,
            slug,
            description
          ),
          product_images (
            id,
            url,
            alt_text,
            is_primary,
            sort_order
          ),
          affiliate_links (
            id,
            marketplace,
            url,
            price,
            old_price,
            is_available,
            tracking_params,
            last_updated
          )
        `)
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

  // Получить похожие продукты
  async getSimilarProducts(
    productId: string, 
    limit: number = 4
  ): Promise<PaginatedResponse<ProductWithRelations>> {
    try {
      // Сначала получаем информацию о текущем продукте
      const { data: currentProduct } = await supabase
        .from('products')
        .select('category_id, brand_id, tags, price')
        .eq('id', productId)
        .single()

      if (!currentProduct) {
        return {
          data: [],
          count: 0,
          error: new Error('Продукт не найден')
        }
      }

      // Ищем похожие продукты по категории, бренду или тегам
      let query = supabase
        .from('products')
        .select(`
          *,
          brands:brand_id (
            id,
            name,
            slug,
            logo_url
          ),
          categories:category_id (
            id,
            name,
            slug
          ),
          product_images!inner (
            id,
            url,
            alt_text,
            is_primary
          )
        `)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(limit)

      // Приоритет: та же категория
      if (currentProduct.category_id) {
        query = query.eq('category_id', currentProduct.category_id)
      }

      const { data, error, count } = await query

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

  // Получить популярные продукты
  async getFeaturedProducts(limit: number = 8): Promise<PaginatedResponse<ProductWithRelations>> {
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select(`
          *,
          brands:brand_id (
            id,
            name,
            slug,
            logo_url
          ),
          categories:category_id (
            id,
            name,
            slug
          ),
          product_images!inner (
            id,
            url,
            alt_text,
            is_primary
          )
        `)
        .eq('is_active', true)
        .eq('featured', true)
        .order('rating', { ascending: false })
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

  // Получить новые продукты
  async getLatestProducts(limit: number = 8): Promise<PaginatedResponse<ProductWithRelations>> {
    try {
      const { data, error, count } = await supabase
        .from('products')
        .select(`
          *,
          brands:brand_id (
            id,
            name,
            slug,
            logo_url
          ),
          categories:category_id (
            id,
            name,
            slug
          ),
          product_images!inner (
            id,
            url,
            alt_text,
            is_primary
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
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

  // Поиск продуктов
  async searchProducts(
    searchTerm: string,
    filters: Omit<SearchFilters, 'search'> = {},
    limit: number = 20
  ): Promise<PaginatedResponse<ProductWithRelations>> {
    return this.getProductsWithRelations(
      { ...filters, search: searchTerm },
      { field: 'name', direction: 'asc' },
      { page: 1, limit }
    )
  }

  // Получить продукты по категории
  async getProductsByCategory(
    categorySlug: string,
    sort: SortOptions = { field: 'name', direction: 'asc' },
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<ProductWithRelations>> {
    return this.getProductsWithRelations(
      { category: categorySlug },
      sort,
      pagination
    )
  }

  // Получить продукты по бренду
  async getProductsByBrand(
    brandSlug: string,
    sort: SortOptions = { field: 'name', direction: 'asc' },
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<PaginatedResponse<ProductWithRelations>> {
    return this.getProductsWithRelations(
      { brand: brandSlug },
      sort,
      pagination
    )
  }
}

// Экспортируем экземпляр сервиса
export const productsApi = new ProductsApiService()