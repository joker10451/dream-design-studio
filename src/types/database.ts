// Базовые типы для работы с базой данных

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  website_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  parent_id?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductSpecs {
  protocol: string[]
  power?: string
  dimensions?: string
  weight?: string
  compatibility: string[]
  features: string[]
  warranty: string
  certifications: string[]
}

export interface ProductSeoMeta {
  title: string
  description: string
  keywords: string[]
  og_image?: string
}

export interface Product {
  id: string
  name: string
  slug: string
  brand_id?: string
  category_id?: string
  description: string
  full_description?: string
  price: number
  old_price?: number
  rating: number
  reviews_count: number
  specs: ProductSpecs
  tags: string[]
  seo_meta: ProductSeoMeta
  is_active: boolean
  featured: boolean
  created_at: string
  updated_at: string
  created_by?: string
  updated_by?: string
  
  // Связанные данные (для JOIN запросов)
  brands?: Brand
  categories?: Category
  product_images?: ProductImage[]
  affiliate_links?: AffiliateLink[]
}

export interface ProductImage {
  id: string
  product_id: string
  url: string
  alt_text?: string
  is_primary: boolean
  sort_order: number
  created_at: string
}

export interface AffiliateLink {
  id: string
  product_id: string
  marketplace: string
  url: string
  price: number
  old_price?: number
  is_available: boolean
  tracking_params?: Record<string, any>
  last_updated: string
  created_at: string
}

export interface SystemSetting {
  id: string
  key: string
  value: any
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

// Типы для пользователей (когда добавим аутентификацию)
export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'moderator' | 'admin'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserFavorite {
  id: string
  user_id: string
  product_id: string
  created_at: string
}

export interface ShoppingList {
  id: string
  user_id: string
  name: string
  description?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ShoppingListItem {
  id: string
  list_id: string
  product_id: string
  quantity: number
  notes?: string
  created_at: string
}

// Типы для аналитики
export interface AnalyticsEvent {
  id: string
  event_type: string
  event_data: Record<string, any>
  user_id?: string
  session_id?: string
  ip_address?: string
  user_agent?: string
  created_at: string
}

// Вспомогательные типы для API
export interface ProductWithRelations extends Product {
  brands: Brand
  categories: Category
  product_images: ProductImage[]
  affiliate_links: AffiliateLink[]
}

export interface CategoryWithCount extends Category {
  products_count?: number
}

export interface BrandWithCount extends Brand {
  products_count?: number
}

// Типы для поиска и фильтрации
export interface SearchFilters {
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  tags?: string[]
  featured?: boolean
}

export interface SortOptions {
  field: 'name' | 'price' | 'rating' | 'created_at'
  direction: 'asc' | 'desc'
}

export interface PaginationOptions {
  page: number
  limit: number
}

// Типы для статистики
export interface ProductStats {
  total_products: number
  active_products: number
  featured_products: number
  avg_price: number
  avg_rating: number
  categories_count: number
  brands_count: number
}

export interface PopularProduct {
  product_id: string
  product_name: string
  views_count: number
  clicks_count: number
  conversion_rate: number
}