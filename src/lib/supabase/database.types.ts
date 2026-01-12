// Автоматически генерируемые типы Supabase
// Обновляются командой: supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      // Клики по партнерским ссылкам
      affiliate_clicks: {
        Row: {
          id: string
          affiliate_link_id: string
          user_id: string | null
          session_id: string | null
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          clicked_at: string
        }
        Insert: {
          id?: string
          affiliate_link_id: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          clicked_at?: string
        }
        Update: {
          id?: string
          affiliate_link_id?: string
          user_id?: string | null
          session_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          clicked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_link_id_fkey"
            columns: ["affiliate_link_id"]
            isOneToOne: false
            referencedRelation: "affiliate_links"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Партнерские ссылки
      affiliate_links: {
        Row: {
          id: string
          product_id: string
          marketplace: string
          url: string
          price: number | null
          old_price: number | null
          is_available: boolean
          tracking_params: Json
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          marketplace: string
          url: string
          price?: number | null
          old_price?: number | null
          is_available?: boolean
          tracking_params?: Json
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          marketplace?: string
          url?: string
          price?: number | null
          old_price?: number | null
          is_available?: boolean
          tracking_params?: Json
          last_updated?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // События аналитики
      analytics_events: {
        Row: {
          id: string
          event_name: string
          user_id: string | null
          session_id: string | null
          parameters: Json
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_name: string
          user_id?: string | null
          session_id?: string | null
          parameters?: Json
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_name?: string
          user_id?: string | null
          session_id?: string | null
          parameters?: Json
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          created_at?: string
        }
        Relationships: []
      }
      
      // Статьи
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string
          featured_image_url: string | null
          category: 'news' | 'review' | 'guide' | 'comparison'
          status: 'draft' | 'published' | 'archived'
          seo_meta: Json
          tags: string[]
          view_count: number
          published_at: string | null
          created_at: string
          updated_at: string
          author_id: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content: string
          featured_image_url?: string | null
          category: 'news' | 'review' | 'guide' | 'comparison'
          status?: 'draft' | 'published' | 'archived'
          seo_meta?: Json
          tags?: string[]
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
          author_id?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string
          featured_image_url?: string | null
          category?: 'news' | 'review' | 'guide' | 'comparison'
          status?: 'draft' | 'published' | 'archived'
          seo_meta?: Json
          tags?: string[]
          view_count?: number
          published_at?: string | null
          created_at?: string
          updated_at?: string
          author_id?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      
      // Бренды
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          description: string | null
          website_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          description?: string | null
          website_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          description?: string | null
          website_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      
      // Категории
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Email кампании
      email_campaigns: {
        Row: {
          id: string
          name: string
          subject: string
          content: string
          target_audience: Json
          status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          scheduled_at: string | null
          sent_at: string | null
          stats: Json
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          subject: string
          content: string
          target_audience?: Json
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          content?: string
          target_audience?: Json
          status?: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
          scheduled_at?: string | null
          sent_at?: string | null
          stats?: Json
          created_at?: string
          created_by?: string | null
        }
        Relationships: []
      }
      
      // Подписчики рассылки
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          preferences: Json
          is_active: boolean
          is_confirmed: boolean
          confirmation_token: string | null
          unsubscribe_token: string | null
          subscribed_at: string
          confirmed_at: string | null
          source: string | null
        }
        Insert: {
          id?: string
          email: string
          preferences?: Json
          is_active?: boolean
          is_confirmed?: boolean
          confirmation_token?: string | null
          unsubscribe_token?: string | null
          subscribed_at?: string
          confirmed_at?: string | null
          source?: string | null
        }
        Update: {
          id?: string
          email?: string
          preferences?: Json
          is_active?: boolean
          is_confirmed?: boolean
          confirmation_token?: string | null
          unsubscribe_token?: string | null
          subscribed_at?: string
          confirmed_at?: string | null
          source?: string | null
        }
        Relationships: []
      }
      
      // Изображения продуктов
      product_images: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_text: string | null
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          url: string
          alt_text?: string | null
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          url?: string
          alt_text?: string | null
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Отзывы на продукты
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string
          rating: number
          title: string | null
          content: string
          is_verified_purchase: boolean
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          user_id: string
          rating: number
          title?: string | null
          content: string
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          content?: string
          is_verified_purchase?: boolean
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Продукты
      products: {
        Row: {
          id: string
          name: string
          slug: string
          brand_id: string | null
          category_id: string | null
          description: string | null
          full_description: string | null
          price: number | null
          old_price: number | null
          rating: number
          reviews_count: number
          specs: Json
          tags: string[]
          seo_meta: Json
          is_active: boolean
          featured: boolean
          created_at: string
          updated_at: string
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          brand_id?: string | null
          category_id?: string | null
          description?: string | null
          full_description?: string | null
          price?: number | null
          old_price?: number | null
          rating?: number
          reviews_count?: number
          specs?: Json
          tags?: string[]
          seo_meta?: Json
          is_active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          brand_id?: string | null
          category_id?: string | null
          description?: string | null
          full_description?: string | null
          price?: number | null
          old_price?: number | null
          rating?: number
          reviews_count?: number
          specs?: Json
          tags?: string[]
          seo_meta?: Json
          is_active?: boolean
          featured?: boolean
          created_at?: string
          updated_at?: string
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Элементы списков покупок
      shopping_list_items: {
        Row: {
          id: string
          list_id: string
          product_id: string
          quantity: number
          notes: string | null
          is_purchased: boolean
          added_at: string
        }
        Insert: {
          id?: string
          list_id: string
          product_id: string
          quantity?: number
          notes?: string | null
          is_purchased?: boolean
          added_at?: string
        }
        Update: {
          id?: string
          list_id?: string
          product_id?: string
          quantity?: number
          notes?: string | null
          is_purchased?: boolean
          added_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopping_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "shopping_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shopping_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Списки покупок
      shopping_lists: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      
      // Системные логи
      system_logs: {
        Row: {
          id: string
          level: string
          message: string
          context: Json
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          level: string
          message: string
          context?: Json
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          level?: string
          message?: string
          context?: Json
          user_id?: string | null
          created_at?: string
        }
        Relationships: []
      }
      
      // Настройки системы
      system_settings: {
        Row: {
          id: string
          key: string
          value: Json
          description: string | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          description?: string | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      
      // Избранные товары
      user_favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Уведомления пользователей
      user_notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          data?: Json
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      
      // История просмотров продуктов
      user_product_views: {
        Row: {
          id: string
          user_id: string
          product_id: string
          viewed_at: string
          session_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          viewed_at?: string
          session_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          viewed_at?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_product_views_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          }
        ]
      }
      
      // Профили пользователей
      user_profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          preferences: Json
          role: 'user' | 'moderator' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          preferences?: Json
          role?: 'user' | 'moderator' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          preferences?: Json
          role?: 'user' | 'moderator' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'user' | 'moderator' | 'admin'
      article_category: 'news' | 'review' | 'guide' | 'comparison'
      article_status: 'draft' | 'published' | 'archived'
      campaign_status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}