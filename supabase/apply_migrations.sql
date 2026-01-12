-- Smart Home 2026 - Apply All Migrations
-- Полный скрипт для применения всех миграций к Supabase проекту
-- Выполните этот файл в SQL Editor вашего Supabase проекта

-- =====================================================
-- ИНФОРМАЦИЯ О МИГРАЦИЯХ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'SMART HOME 2026 - DATABASE MIGRATION';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'База данных: %', current_database();
  RAISE NOTICE 'Пользователь: %', current_user;
  RAISE NOTICE 'Время начала: %', NOW();
  RAISE NOTICE '';
END;
$$;

-- =====================================================
-- МИГРАЦИЯ 001: ОСНОВНАЯ СХЕМА
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Применение миграции 001: Основная схема базы данных...';
END;
$$;

-- Включаем необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Создаем пользовательские типы
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_category') THEN
    CREATE TYPE article_category AS ENUM ('news', 'review', 'guide', 'comparison');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_status') THEN
    CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
    CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');
  END IF;
END;
$$;

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Расширение профиля пользователя
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(255),
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  role user_role DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Триггер для user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Категории продуктов
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Бренды
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url TEXT,
  description TEXT,
  website_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Продукты
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  full_description TEXT,
  price DECIMAL(10,2),
  old_price DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  reviews_count INTEGER DEFAULT 0 CHECK (reviews_count >= 0),
  specs JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  seo_meta JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Изображения продуктов
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Партнерские ссылки
CREATE TABLE IF NOT EXISTS affiliate_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  marketplace VARCHAR(100) NOT NULL,
  url TEXT NOT NULL,
  price DECIMAL(10,2),
  old_price DECIMAL(10,2),
  is_available BOOLEAN DEFAULT true,
  tracking_params JSONB DEFAULT '{}',
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Статьи и новости
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  category article_category NOT NULL,
  status article_status DEFAULT 'draft',
  seo_meta JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0 CHECK (view_count >= 0),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Избранные товары
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Списки покупок
CREATE TABLE IF NOT EXISTS shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_shopping_lists_updated_at ON shopping_lists;
CREATE TRIGGER update_shopping_lists_updated_at 
    BEFORE UPDATE ON shopping_lists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Элементы списков покупок
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  is_purchased BOOLEAN DEFAULT false,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- История просмотров продуктов
CREATE TABLE IF NOT EXISTS user_product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  viewed_date DATE DEFAULT CURRENT_DATE,
  session_id VARCHAR(255),
  UNIQUE(user_id, product_id, viewed_date)
);

-- События аналитики
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_name VARCHAR(100) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  parameters JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Клики по партнерским ссылкам
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Подписчики рассылки
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  preferences JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_confirmed BOOLEAN DEFAULT false,
  confirmation_token VARCHAR(255),
  unsubscribe_token VARCHAR(255) UNIQUE DEFAULT gen_random_uuid()::text,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  source VARCHAR(100)
);

-- Email кампании
CREATE TABLE IF NOT EXISTS email_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  target_audience JSONB DEFAULT '{}',
  status campaign_status DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Отзывы на продукты
CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_verified_purchase BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

DROP TRIGGER IF EXISTS update_product_reviews_updated_at ON product_reviews;
CREATE TRIGGER update_product_reviews_updated_at 
    BEFORE UPDATE ON product_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Уведомления пользователей
CREATE TABLE IF NOT EXISTS user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Настройки системы
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Логи системы
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Функция для автоматического создания профиля пользователя
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля при регистрации
-- ПРИМЕЧАНИЕ: Этот триггер требует специальных разрешений для auth.users
-- Его нужно создавать через Supabase Dashboard или с правами суперпользователя
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция для обновления рейтинга продукта
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products 
  SET 
    rating = (
      SELECT ROUND(AVG(rating)::numeric, 2) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = true
    ),
    reviews_count = (
      SELECT COUNT(*) 
      FROM product_reviews 
      WHERE product_id = NEW.product_id AND is_approved = true
    )
  WHERE id = NEW.product_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для обновления рейтинга
DROP TRIGGER IF EXISTS update_product_rating_on_insert ON product_reviews;
CREATE TRIGGER update_product_rating_on_insert
  AFTER INSERT ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

DROP TRIGGER IF EXISTS update_product_rating_on_update ON product_reviews;
CREATE TRIGGER update_product_rating_on_update
  AFTER UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

DROP TRIGGER IF EXISTS update_product_rating_on_delete ON product_reviews;
CREATE TRIGGER update_product_rating_on_delete
  AFTER DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Вставляем базовые настройки системы
INSERT INTO system_settings (key, value, description, is_public) VALUES
('site_name', '"Smart Home 2026"', 'Название сайта', true),
('site_description', '"Портал умного дома - обзоры, рейтинги, лучшие цены"', 'Описание сайта', true),
('maintenance_mode', 'false', 'Режим технического обслуживания', false),
('max_file_size', '52428800', 'Максимальный размер файла в байтах (50MB)', false),
('allowed_file_types', '["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"]', 'Разрешенные типы файлов', false)
ON CONFLICT (key) DO NOTHING;

-- Вставляем базовые категории
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Умные розетки', 'sockets', 'Умные розетки с Wi-Fi и Zigbee', 1),
('Освещение', 'lighting', 'Умные лампы, светильники и выключатели', 2),
('Видеокамеры', 'cameras', 'IP-камеры для видеонаблюдения', 3),
('Датчики', 'sensors', 'Датчики движения, температуры, влажности', 4),
('Безопасность', 'security', 'Системы безопасности и контроля доступа', 5),
('Умные колонки', 'speakers', 'Голосовые помощники и умные колонки', 6),
('Хабы', 'hubs', 'Центры управления умным домом', 7),
('Климат', 'climate', 'Кондиционеры, обогреватели, термостаты', 8)
ON CONFLICT (slug) DO NOTHING;

-- Вставляем популярные бренды
INSERT INTO brands (name, slug, description) VALUES
('Яндекс', 'yandex', 'Российская IT-компания, производитель умных устройств'),
('Xiaomi', 'xiaomi', 'Китайский производитель электроники и умных устройств'),
('Aqara', 'aqara', 'Бренд умных устройств для дома от Xiaomi'),
('TP-Link', 'tp-link', 'Производитель сетевого оборудования и умных устройств'),
('Philips Hue', 'philips-hue', 'Премиальные умные светильники от Philips'),
('IKEA', 'ikea', 'Доступные умные устройства от IKEA'),
('Samsung', 'samsung', 'Южнокорейский производитель электроники'),
('Rubetek', 'rubetek', 'Российский производитель систем умного дома'),
('Sonoff', 'sonoff', 'Бренд умных устройств от ITEAD'),
('Tuya', 'tuya', 'Платформа и экосистема умных устройств')
ON CONFLICT (slug) DO NOTHING;

DO $$
BEGIN
  RAISE NOTICE 'Миграция 001 завершена успешно.';
END;
$$;

-- =====================================================
-- МИГРАЦИЯ 002: ИНДЕКСЫ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Применение миграции 002: Создание индексов для производительности...';
END;
$$;

-- Основные индексы для продуктов
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price) WHERE is_active = true AND price IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Составные индексы для сложных запросов
CREATE INDEX IF NOT EXISTS idx_products_category_active ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_brand_active ON products(brand_id, is_active);
CREATE INDEX IF NOT EXISTS idx_products_price_rating ON products(price, rating) WHERE is_active = true;

-- Индексы для поиска по тегам
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING gin(tags);

-- Полнотекстовый поиск для продуктов
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(
  to_tsvector('russian', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(full_description, '')
  )
) WHERE is_active = true;

-- Индексы для категорий и брендов
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order, is_active);
CREATE INDEX IF NOT EXISTS idx_brands_active ON brands(is_active);

-- Индексы для изображений и партнерских ссылок
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_affiliate_links_product ON affiliate_links(product_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_links_marketplace ON affiliate_links(marketplace, is_available);

-- Индексы для статей
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category, status);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published_at) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);

-- Полнотекстовый поиск для статей
CREATE INDEX IF NOT EXISTS idx_articles_search ON articles USING gin(
  to_tsvector('russian', 
    COALESCE(title, '') || ' ' || 
    COALESCE(excerpt, '') || ' ' || 
    COALESCE(content, '')
  )
) WHERE status = 'published';

-- Индексы для пользовательских данных
CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorites_product ON user_favorites(product_id);
CREATE INDEX IF NOT EXISTS idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_list_items_list ON shopping_list_items(list_id);
CREATE INDEX IF NOT EXISTS idx_user_product_views_user ON user_product_views(user_id);
CREATE INDEX IF NOT EXISTS idx_user_product_views_product ON user_product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_user_product_views_date ON user_product_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_user_product_views_viewed_date ON user_product_views(viewed_date);

-- Индексы для аналитики
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name_date ON analytics_events(event_name, created_at);

-- Индексы для рассылок
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_confirmed ON newsletter_subscribers(is_confirmed) WHERE is_confirmed = true;

-- Индексы для отзывов и уведомлений
CREATE INDEX IF NOT EXISTS idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_product_reviews_approved ON product_reviews(is_approved) WHERE is_approved = true;
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);

-- Индексы для системных таблиц
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_created ON system_logs(created_at);

DO $$
BEGIN
  RAISE NOTICE 'Миграция 002 завершена успешно.';
END;
$$;

-- =====================================================
-- МИГРАЦИЯ 003: RLS ПОЛИТИКИ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Применение миграции 003: Настройка Row Level Security...';
END;
$$;

-- Включаем RLS для всех таблиц
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Вспомогательные функции для политик
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()),
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.user_role() IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Политики для профилей пользователей
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Enable insert for new users" ON user_profiles;
CREATE POLICY "Enable insert for new users" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для каталога продуктов
DROP POLICY IF EXISTS "Anyone can view active products" ON products;
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage products" ON products;
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (public.is_admin_or_moderator());

-- Политики для категорий и брендов
DROP POLICY IF EXISTS "Anyone can view active categories" ON categories;
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can view active brands" ON brands;
CREATE POLICY "Anyone can view active brands" ON brands
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage brands" ON brands;
CREATE POLICY "Admins can manage brands" ON brands
  FOR ALL USING (public.is_admin());

-- Политики для изображений продуктов
DROP POLICY IF EXISTS "Anyone can view product images" ON product_images;
CREATE POLICY "Anyone can view product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_images.product_id AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (public.is_admin_or_moderator());

-- Политики для партнерских ссылок
DROP POLICY IF EXISTS "Anyone can view affiliate links" ON affiliate_links;
CREATE POLICY "Anyone can view affiliate links" ON affiliate_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = affiliate_links.product_id AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can manage affiliate links" ON affiliate_links;
CREATE POLICY "Admins can manage affiliate links" ON affiliate_links
  FOR ALL USING (public.is_admin_or_moderator());

-- Политики для статей
DROP POLICY IF EXISTS "Anyone can view published articles" ON articles;
CREATE POLICY "Anyone can view published articles" ON articles
  FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authors can view own articles" ON articles;
CREATE POLICY "Authors can view own articles" ON articles
  FOR SELECT USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Admins can manage all articles" ON articles;
CREATE POLICY "Admins can manage all articles" ON articles
  FOR ALL USING (public.is_admin_or_moderator());

-- Политики для пользовательских данных
DROP POLICY IF EXISTS "Users can manage own favorites" ON user_favorites;
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own shopping lists" ON shopping_lists;
CREATE POLICY "Users can manage own shopping lists" ON shopping_lists
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own shopping list items" ON shopping_list_items;
CREATE POLICY "Users can manage own shopping list items" ON shopping_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shopping_lists 
      WHERE id = shopping_list_items.list_id AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own product views" ON user_product_views;
CREATE POLICY "Users can view own product views" ON user_product_views
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own product views" ON user_product_views;
CREATE POLICY "Users can insert own product views" ON user_product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous users can insert product views" ON user_product_views;
CREATE POLICY "Anonymous users can insert product views" ON user_product_views
  FOR INSERT WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- Политики для уведомлений
DROP POLICY IF EXISTS "Users can manage own notifications" ON user_notifications;
CREATE POLICY "Users can manage own notifications" ON user_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Политики для отзывов
DROP POLICY IF EXISTS "Users can create product reviews" ON product_reviews;
CREATE POLICY "Users can create product reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view approved reviews" ON product_reviews;
CREATE POLICY "Anyone can view approved reviews" ON product_reviews
  FOR SELECT USING (is_approved = true);

DROP POLICY IF EXISTS "Users can view own reviews" ON product_reviews;
CREATE POLICY "Users can view own reviews" ON product_reviews
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Moderators can manage all reviews" ON product_reviews;
CREATE POLICY "Moderators can manage all reviews" ON product_reviews
  FOR ALL USING (public.is_admin_or_moderator());

-- Политики для аналитики
DROP POLICY IF EXISTS "Users can insert analytics events" ON analytics_events;
CREATE POLICY "Users can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Admins can view analytics" ON analytics_events;
CREATE POLICY "Admins can view analytics" ON analytics_events
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Anyone can insert affiliate clicks" ON affiliate_clicks;
CREATE POLICY "Anyone can insert affiliate clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view affiliate clicks" ON affiliate_clicks;
CREATE POLICY "Admins can view affiliate clicks" ON affiliate_clicks
  FOR SELECT USING (public.is_admin());

-- Политики для рассылок
DROP POLICY IF EXISTS "Anyone can subscribe to newsletter" ON newsletter_subscribers;
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage newsletter subscribers" ON newsletter_subscribers;
CREATE POLICY "Admins can manage newsletter subscribers" ON newsletter_subscribers
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage email campaigns" ON email_campaigns;
CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
  FOR ALL USING (public.is_admin());

-- Политики для системных таблиц
DROP POLICY IF EXISTS "Anyone can view public settings" ON system_settings;
CREATE POLICY "Anyone can view public settings" ON system_settings
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Admins can manage system settings" ON system_settings;
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can view system logs" ON system_logs;
CREATE POLICY "Admins can view system logs" ON system_logs
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "System can insert logs" ON system_logs;
CREATE POLICY "System can insert logs" ON system_logs
  FOR INSERT WITH CHECK (true);

DO $$
BEGIN
  RAISE NOTICE 'Миграция 003 завершена успешно.';
END;
$$;

-- =====================================================
-- МИГРАЦИЯ 004: ФУНКЦИИ И ТРИГГЕРЫ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Применение миграции 004: Дополнительные функции и триггеры...';
END;
$$;

-- Функция полнотекстового поиска продуктов
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT,
  category_filter UUID DEFAULT NULL,
  brand_filter UUID DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  min_rating DECIMAL DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(255),
  description TEXT,
  price DECIMAL(10,2),
  rating DECIMAL(3,2),
  brand_name VARCHAR(255),
  category_name VARCHAR(255),
  image_url TEXT,
  relevance_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.rating,
    b.name as brand_name,
    c.name as category_name,
    pi.url as image_url,
    ts_rank(
      to_tsvector('russian', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '')),
      plainto_tsquery('russian', search_query)
    ) as relevance_score
  FROM products p
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
  WHERE 
    p.is_active = true
    AND (search_query IS NULL OR to_tsvector('russian', COALESCE(p.name, '') || ' ' || COALESCE(p.description, '')) @@ plainto_tsquery('russian', search_query))
    AND (category_filter IS NULL OR p.category_id = category_filter)
    AND (brand_filter IS NULL OR p.brand_id = brand_filter)
    AND (min_price IS NULL OR p.price >= min_price)
    AND (max_price IS NULL OR p.price <= max_price)
    AND (min_rating IS NULL OR p.rating >= min_rating)
  ORDER BY 
    CASE WHEN search_query IS NOT NULL THEN relevance_score END DESC,
    p.featured DESC,
    p.rating DESC,
    p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения рекомендаций
CREATE OR REPLACE FUNCTION get_user_recommendations(
  target_user_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),
  reason TEXT,
  score REAL
) AS $$
BEGIN
  RETURN QUERY
  WITH user_categories AS (
    SELECT 
      p.category_id,
      COUNT(*) as view_count
    FROM user_product_views upv
    JOIN products p ON upv.product_id = p.id
    WHERE upv.user_id = target_user_id
      AND upv.viewed_at > NOW() - INTERVAL '30 days'
    GROUP BY p.category_id
    ORDER BY view_count DESC
    LIMIT 3
  )
  SELECT 
    p.id as product_id,
    p.name as product_name,
    'Популярно в интересующих вас категориях' as reason,
    p.rating * 0.8 + (uc.view_count::REAL / 10) * 0.2 as score
  FROM products p
  JOIN user_categories uc ON p.category_id = uc.category_id
  WHERE p.is_active = true
    AND p.id NOT IN (
      SELECT product_id FROM user_product_views 
      WHERE user_id = target_user_id
    )
    AND p.id NOT IN (
      SELECT product_id FROM user_favorites 
      WHERE user_id = target_user_id
    )
  ORDER BY score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения популярных продуктов
CREATE OR REPLACE FUNCTION get_popular_products(
  time_period INTERVAL DEFAULT '7 days',
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),
  view_count BIGINT,
  favorite_count BIGINT,
  popularity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COALESCE(views.view_count, 0) as view_count,
    COALESCE(favorites.favorite_count, 0) as favorite_count,
    (
      COALESCE(views.view_count, 0) * 1.0 +
      COALESCE(favorites.favorite_count, 0) * 3.0
    ) as popularity_score
  FROM products p
  LEFT JOIN (
    SELECT 
      product_id, 
      COUNT(*) as view_count
    FROM user_product_views 
    WHERE viewed_at > NOW() - time_period
    GROUP BY product_id
  ) views ON p.id = views.product_id
  LEFT JOIN (
    SELECT 
      product_id, 
      COUNT(*) as favorite_count
    FROM user_favorites 
    WHERE created_at > NOW() - time_period
    GROUP BY product_id
  ) favorites ON p.id = favorites.product_id
  WHERE p.is_active = true
  ORDER BY popularity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для создания уведомления о снижении цены
CREATE OR REPLACE FUNCTION create_price_drop_notification(
  target_product_id UUID,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2)
)
RETURNS VOID AS $$
DECLARE
  product_name VARCHAR(255);
  user_record RECORD;
BEGIN
  SELECT name INTO product_name FROM products WHERE id = target_product_id;
  
  FOR user_record IN 
    SELECT DISTINCT user_id 
    FROM user_favorites 
    WHERE product_id = target_product_id
  LOOP
    INSERT INTO user_notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      user_record.user_id,
      'price_drop',
      'Снижение цены!',
      format('Цена на "%s" снизилась с %s₽ до %s₽', product_name, old_price, new_price),
      jsonb_build_object(
        'product_id', target_product_id,
        'old_price', old_price,
        'new_price', new_price,
        'discount_percent', ROUND(((old_price - new_price) / old_price * 100), 1)
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Триггер для отслеживания изменения цен
CREATE OR REPLACE FUNCTION trigger_price_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.price IS NOT NULL AND NEW.price IS NOT NULL 
     AND NEW.price < OLD.price 
     AND (OLD.price - NEW.price) / OLD.price > 0.05 THEN
    
    PERFORM create_price_drop_notification(NEW.id, OLD.price, NEW.price);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS product_price_change_trigger ON products;
CREATE TRIGGER product_price_change_trigger
  AFTER UPDATE OF price ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_price_change();

-- Функция для очистки старых данных
CREATE OR REPLACE FUNCTION cleanup_old_analytics(
  retention_days INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM analytics_events 
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  INSERT INTO system_logs (level, message, context)
  VALUES (
    'info',
    'Cleanup old analytics data',
    jsonb_build_object(
      'deleted_count', deleted_count,
      'retention_days', retention_days,
      'cleanup_date', NOW()
    )
  );
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  RAISE NOTICE 'Миграция 004 завершена успешно.';
END;
$$;

-- =====================================================
-- ПРОВЕРКА РЕЗУЛЬТАТОВ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Проверка результатов миграции...';
END;
$$;

-- Проверяем созданные таблицы
DO $$
DECLARE
  table_count INTEGER;
  index_count INTEGER;
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE';
  
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE schemaname = 'public';
  
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public';
  
  RAISE NOTICE 'Создано таблиц: %', table_count;
  RAISE NOTICE 'Создано индексов: %', index_count;
  RAISE NOTICE 'Создано функций: %', function_count;
END;
$$;

-- Проверяем основные таблицы
DO $$
DECLARE
  missing_tables TEXT[] := ARRAY[]::TEXT[];
  required_tables TEXT[] := ARRAY[
    'user_profiles', 'categories', 'brands', 'products', 'product_images',
    'affiliate_links', 'articles', 'user_favorites', 'shopping_lists',
    'shopping_list_items', 'user_product_views', 'analytics_events',
    'affiliate_clicks', 'newsletter_subscribers', 'email_campaigns',
    'product_reviews', 'user_notifications', 'system_settings', 'system_logs'
  ];
  current_table TEXT;
BEGIN
  FOREACH current_table IN ARRAY required_tables
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = current_table
    ) THEN
      missing_tables := array_append(missing_tables, current_table);
    END IF;
  END LOOP;
  
  IF array_length(missing_tables, 1) > 0 THEN
    RAISE WARNING 'Отсутствуют таблицы: %', array_to_string(missing_tables, ', ');
  ELSE
    RAISE NOTICE 'Все основные таблицы созданы успешно!';
  END IF;
END;
$$;

-- Проверяем RLS политики
DO $$
DECLARE
  rls_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_count
  FROM pg_policies;
  
  RAISE NOTICE 'Создано RLS политик: %', rls_count;
  
  IF rls_count = 0 THEN
    RAISE WARNING 'RLS политики не найдены! Проверьте миграцию 003.';
  END IF;
END;
$$;

-- Обновляем статистику
ANALYZE;

-- Создаем запись о миграции
INSERT INTO system_logs (level, message, context)
VALUES (
  'info',
  'Database migration completed successfully',
  jsonb_build_object(
    'migration_date', NOW(),
    'applied_migrations', ARRAY['001_initial_schema', '002_indexes', '003_rls_policies', '004_functions'],
    'database', current_database(),
    'user', current_user
  )
);

-- =====================================================
-- ФИНАЛИЗАЦИЯ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!';
  RAISE NOTICE 'Время завершения: %', NOW();
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Следующие шаги:';
  RAISE NOTICE '1. Проверьте таблицы в Supabase Dashboard';
  RAISE NOTICE '2. Настройте переменные окружения в приложении';
  RAISE NOTICE '3. Протестируйте подключение из приложения';
  RAISE NOTICE '4. Импортируйте существующие данные (если нужно)';
  RAISE NOTICE '';
  RAISE NOTICE 'Создано 19 таблиц с полной схемой базы данных';
  RAISE NOTICE 'Настроены индексы для оптимизации производительности';
  RAISE NOTICE 'Применены политики Row Level Security';
  RAISE NOTICE 'Добавлены функции поиска и рекомендаций';
  RAISE NOTICE '';
END;
$$;