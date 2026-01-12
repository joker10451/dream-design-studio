/**
 * Fallback API для случаев недоступности Supabase
 * Использует статичные данные как резервный источник
 */

import { products as staticProducts, categories as staticCategories, brands as staticBrands } from '@/data/products'
import type { ApiResponse, PaginatedResponse } from './base'
import type { ProductWithRelations, ProductQueryParams } from './products'
import type { CategoryWithChildren } from './categories'
import type { BrandWithStats, BrandQueryParams } from './brands'

// Утилиты для работы со статичными данными
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Преобразование статичных данных в формат API
const transformStaticProduct = (product: any): ProductWithRelations => {
  return {
    id: `prod-${product.id}`,
    name: product.name,
    slug: createSlug(product.name),
    brand_id: `brand-${staticBrands.indexOf(product.brand) + 1}`,
    category_id: `cat-${product.category}`,
    description: product.description,
    full_description: product.fullDescription,
    price: product.price,
    old_price: product.oldPrice || null,
    rating: product.rating,
    reviews_count: product.reviewsCount,
    specs: product.specs,
    tags: product.tags,
    seo_meta: product.seoMeta,
    is_active: true,
    featured: product.rating >= 4.5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    updated_by: null,
    brand: {
      id: `brand-${staticBrands.indexOf(product.brand) + 1}`,
      name: product.brand,
      slug: createSlug(product.brand),
      logo_url: null,
      description: `Устройства ${product.brand} для умного дома`,
      website_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    category: {
      id: `cat-${product.category}`,
      name: staticCategories.find(c => c.id === product.category)?.name || product.category,
      slug: product.category,
      description: `Категория ${product.category}`,
      parent_id: null,
      sort_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    images: product.images.map((img: any, index: number) => ({
      id: `img-${product.id}-${index + 1}`,
      product_id: `prod-${product.id}`,
      url: img.url,
      alt_text: img.alt,
      is_primary: img.isPrimary,
      sort_order: index + 1,
      created_at: new Date().toISOString()
    })),
    affiliate_links: product.affiliateLinks.map((link: any) => ({
      id: `aff-${link.id}`,
      product_id: `prod-${product.id}`,
      marketplace: link.marketplace,
      url: link.url,
      price: link.price,
      old_price: null,
      is_available: link.isAvailable,
      tracking_params: link.trackingParams,
      last_updated: link.lastUpdated.toISOString(),
      created_at: new Date().toISOString()
    }))
  }
}

const transformStaticCategory = (category: any): CategoryWithChildren => {
  return {
    id: `cat-${category.id}`,
    name: category.name,
    slug: category.id,
    description: `Категория ${category.name}`,
    parent_id: null,
    sort_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

const transformStaticBrand = (brandName: string, index: number): BrandWithStats => {
  const brandProducts = staticProducts.filter(p => p.brand === brandName)
  const totalRating = brandProducts.reduce((sum, p) => sum + p.rating, 0)
  const totalReviews = brandProducts.reduce((sum, p) => sum + p.reviewsCount, 0)
  
  return {
    id: `brand-${index + 1}`,
    name: brandName,
    slug: createSlug(brandName),
    logo_url: null,
    description: `Устройства ${brandName} для умного дома`,
    website_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    products_count: brandProducts.length,
    avg_rating: brandProducts.length > 0 ? totalRating / brandProducts.length : 0,
    total_reviews: totalReviews
  }
}

// Fallback API для продуктов
export class FallbackProductsApi {
  async getProducts(params: ProductQueryParams = {}): Promise<PaginatedResponse<ProductWithRelations>> {
    await delay(100) // Имитируем задержку сети
    
    let filteredProducts = staticProducts
    
    // Применяем фильтры
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.brand.toLowerCase().includes(searchLower)
      )
    }
    
    if (params.categoryId) {
      const categorySlug = params.categoryId.replace('cat-', '')
      filteredProducts = filteredProducts.filter(p => p.category === categorySlug)
    }
    
    if (params.brandId) {
      const brandIndex = parseInt(params.brandId.replace('brand-', '')) - 1
      const brandName = staticBrands[brandIndex]
      if (brandName) {
        filteredProducts = filteredProducts.filter(p => p.brand === brandName)
      }
    }
    
    if (params.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= params.minPrice!)
    }
    
    if (params.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= params.maxPrice!)
    }
    
    if (params.minRating !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.rating >= params.minRating!)
    }
    
    if (params.featured !== undefined) {
      filteredProducts = filteredProducts.filter(p => (p.rating >= 4.5) === params.featured)
    }
    
    // Сортировка
    const sortBy = params.sortBy || 'created_at'
    const sortOrder = params.sortOrder || 'desc'
    
    filteredProducts.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'price':
          aValue = a.price
          bValue = b.price
          break
        case 'rating':
          aValue = a.rating
          bValue = b.rating
          break
        default:
          aValue = new Date().getTime() // Имитируем created_at
          bValue = new Date().getTime()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    // Пагинация
    const page = params.page || 1
    const limit = params.limit || 20
    const offset = (page - 1) * limit
    const paginatedProducts = filteredProducts.slice(offset, offset + limit)
    
    return {
      data: paginatedProducts.map(transformStaticProduct),
      error: null,
      success: true,
      count: filteredProducts.length,
      page,
      limit,
      hasMore: offset + limit < filteredProducts.length
    }
  }
  
  async getProductById(id: string): Promise<ApiResponse<ProductWithRelations>> {
    await delay(50)
    
    const productId = id.replace('prod-', '')
    const product = staticProducts.find(p => p.id === productId)
    
    if (!product) {
      return {
        data: null,
        error: 'Продукт не найден',
        success: false
      }
    }
    
    return {
      data: transformStaticProduct(product),
      error: null,
      success: true
    }
  }
  
  async getProductBySlug(slug: string): Promise<ApiResponse<ProductWithRelations>> {
    await delay(50)
    
    const product = staticProducts.find(p => createSlug(p.name) === slug)
    
    if (!product) {
      return {
        data: null,
        error: 'Продукт не найден',
        success: false
      }
    }
    
    return {
      data: transformStaticProduct(product),
      error: null,
      success: true
    }
  }
  
  async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<ProductWithRelations[]>> {
    await delay(50)
    
    const featuredProducts = staticProducts
      .filter(p => p.rating >= 4.5)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
    
    return {
      data: featuredProducts.map(transformStaticProduct),
      error: null,
      success: true
    }
  }
  
  async searchProducts(searchTerm: string, limit: number = 20): Promise<ApiResponse<ProductWithRelations[]>> {
    await delay(100)
    
    const searchLower = searchTerm.toLowerCase()
    const results = staticProducts
      .filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      )
      .slice(0, limit)
    
    return {
      data: results.map(transformStaticProduct),
      error: null,
      success: true
    }
  }
}

// Fallback API для категорий
export class FallbackCategoriesApi {
  async getCategories(): Promise<ApiResponse<CategoryWithChildren[]>> {
    await delay(50)
    
    const categories = staticCategories
      .filter(c => c.id !== 'all')
      .map(transformStaticCategory)
    
    return {
      data: categories,
      error: null,
      success: true
    }
  }
  
  async getCategoryById(id: string): Promise<ApiResponse<CategoryWithChildren>> {
    await delay(50)
    
    const categoryId = id.replace('cat-', '')
    const category = staticCategories.find(c => c.id === categoryId)
    
    if (!category) {
      return {
        data: null,
        error: 'Категория не найдена',
        success: false
      }
    }
    
    return {
      data: transformStaticCategory(category),
      error: null,
      success: true
    }
  }
  
  async getCategoryBySlug(slug: string): Promise<ApiResponse<CategoryWithChildren>> {
    await delay(50)
    
    const category = staticCategories.find(c => c.id === slug)
    
    if (!category) {
      return {
        data: null,
        error: 'Категория не найдена',
        success: false
      }
    }
    
    return {
      data: transformStaticCategory(category),
      error: null,
      success: true
    }
  }
}

// Fallback API для брендов
export class FallbackBrandsApi {
  async getBrands(params: BrandQueryParams = {}): Promise<PaginatedResponse<BrandWithStats>> {
    await delay(50)
    
    let filteredBrands = staticBrands
    
    if (params.search) {
      const searchLower = params.search.toLowerCase()
      filteredBrands = filteredBrands.filter(b => 
        b.toLowerCase().includes(searchLower)
      )
    }
    
    // Пагинация
    const page = params.page || 1
    const limit = params.limit || 20
    const offset = (page - 1) * limit
    const paginatedBrands = filteredBrands.slice(offset, offset + limit)
    
    return {
      data: paginatedBrands.map((brand, index) => transformStaticBrand(brand, staticBrands.indexOf(brand))),
      error: null,
      success: true,
      count: filteredBrands.length,
      page,
      limit,
      hasMore: offset + limit < filteredBrands.length
    }
  }
  
  async getAllBrands(): Promise<ApiResponse<BrandWithStats[]>> {
    await delay(50)
    
    return {
      data: staticBrands.map((brand, index) => transformStaticBrand(brand, index)),
      error: null,
      success: true
    }
  }
  
  async getBrandById(id: string): Promise<ApiResponse<BrandWithStats>> {
    await delay(50)
    
    const brandIndex = parseInt(id.replace('brand-', '')) - 1
    const brandName = staticBrands[brandIndex]
    
    if (!brandName) {
      return {
        data: null,
        error: 'Бренд не найден',
        success: false
      }
    }
    
    return {
      data: transformStaticBrand(brandName, brandIndex),
      error: null,
      success: true
    }
  }
}

// Экспорт fallback API
export const fallbackProductsApi = new FallbackProductsApi()
export const fallbackCategoriesApi = new FallbackCategoriesApi()
export const fallbackBrandsApi = new FallbackBrandsApi()

// Утилита для определения, нужно ли использовать fallback
export const shouldUseFallback = (error: any): boolean => {
  if (!error) return false
  
  // Проверяем типичные ошибки подключения
  const connectionErrors = [
    'fetch',
    'network',
    'connection',
    'timeout',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT'
  ]
  
  const errorMessage = error.message?.toLowerCase() || ''
  return connectionErrors.some(keyword => errorMessage.includes(keyword))
}

// Wrapper для автоматического fallback
export const withFallback = <T extends any[], R>(
  primaryFn: (...args: T) => Promise<R>,
  fallbackFn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      const result = await primaryFn(...args)
      
      // Проверяем, успешен ли результат
      if (typeof result === 'object' && result !== null && 'success' in result) {
        if (result.success) {
          return result
        }
        
        // Если результат неуспешен, но не из-за подключения, возвращаем как есть
        if (!shouldUseFallback(result)) {
          return result
        }
      }
      
      return result
      
    } catch (error) {
      console.warn('Primary API failed, using fallback:', error)
      
      if (shouldUseFallback(error)) {
        return fallbackFn(...args)
      }
      
      throw error
    }
  }
}