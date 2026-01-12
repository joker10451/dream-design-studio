-- Smart Home 2026 - Initial Database Schema
-- Создание основных таблиц для системы управления умным домом

-- Включаем необходимые расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Создаем пользовательские типы
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
CREATE TYPE article_category AS ENUM ('news', 'review', 'guide', 'comparison');
CREATE TYPE article_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'sent', 'failed');

-- =====================================================
-- ПОЛЬЗОВАТЕЛИ И ПРОФИЛИ
-- =====================================================

-- Расширение профиля пользователя (Supabase Auth уже предоставляет базовую таблицу users)
CREATE TABLE user_profiles (
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

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- КАТАЛОГ ПРОДУКТОВ
-- =====================================================

-- Категории продуктов
CREATE TABLE categories (
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

CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Бренды
CREATE TABLE brands (
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

CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Продукты
CREATE TABLE products (
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

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Изображения продуктов
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Партнерские ссылки
CREATE TABLE affiliate_links (
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

-- =====================================================
-- КОНТЕНТ-МЕНЕДЖМЕНТ
-- =====================================================

-- Статьи и новости
CREATE TABLE articles (
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

CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ПОЛЬЗОВАТЕЛЬСКИЕ ДАННЫЕ
-- =====================================================

-- Избранные товары
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Списки покупок
CREATE TABLE shopping_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_shopping_lists_updated_at 
    BEFORE UPDATE ON shopping_lists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Элементы списков покупок
CREATE TABLE shopping_list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  notes TEXT,
  is_purchased BOOLEAN DEFAULT false,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- История просмотров продуктов
CREATE TABLE user_product_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  session_id VARCHAR(255),
  -- Уникальность по пользователю, продукту и дню (для предотвращения дублирования)
  UNIQUE(user_id, product_id, DATE(viewed_at))
);

-- =====================================================
-- АНАЛИТИКА И СОБЫТИЯ
-- =====================================================

-- События аналитики
CREATE TABLE analytics_events (
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
CREATE TABLE affiliate_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  affiliate_link_id UUID REFERENCES affiliate_links(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- РАССЫЛКИ
-- =====================================================

-- Подписчики рассылки
CREATE TABLE newsletter_subscribers (
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
CREATE TABLE email_campaigns (
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

-- =====================================================
-- КОММЕНТАРИИ И ОТЗЫВЫ (дополнительно)
-- =====================================================

-- Отзывы на продукты
CREATE TABLE product_reviews (
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
  UNIQUE(product_id, user_id) -- Один отзыв на продукт от пользователя
);

CREATE TRIGGER update_product_reviews_updated_at 
    BEFORE UPDATE ON product_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- УВЕДОМЛЕНИЯ
-- =====================================================

-- Уведомления пользователей
CREATE TABLE user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'price_drop', 'new_article', 'system', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Дополнительные данные (product_id, article_id, etc.)
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- СИСТЕМНЫЕ ТАБЛИЦЫ
-- =====================================================

-- Настройки системы
CREATE TABLE system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Доступно ли через API
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_system_settings_updated_at 
    BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Логи системы
CREATE TABLE system_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level VARCHAR(20) NOT NULL, -- 'info', 'warning', 'error', 'debug'
  message TEXT NOT NULL,
  context JSONB DEFAULT '{}',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ФУНКЦИИ И ТРИГГЕРЫ
-- =====================================================

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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Функция для обновления рейтинга продукта при добавлении отзыва
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
CREATE TRIGGER update_product_rating_on_insert
  AFTER INSERT ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER update_product_rating_on_update
  AFTER UPDATE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

CREATE TRIGGER update_product_rating_on_delete
  AFTER DELETE ON product_reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Функция для логирования изменений в важных таблицах
CREATE OR REPLACE FUNCTION log_table_changes()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO system_logs (level, message, context)
  VALUES (
    'info',
    TG_OP || ' operation on ' || TG_TABLE_NAME,
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW),
      'timestamp', NOW()
    )
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Применяем логирование к критическим таблицам
CREATE TRIGGER log_products_changes
  AFTER INSERT OR UPDATE OR DELETE ON products
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();

CREATE TRIGGER log_user_profiles_changes
  AFTER INSERT OR UPDATE OR DELETE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION log_table_changes();

-- =====================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =====================================================

-- Вставляем базовые настройки системы
INSERT INTO system_settings (key, value, description, is_public) VALUES
('site_name', '"Smart Home 2026"', 'Название сайта', true),
('site_description', '"Портал умного дома - обзоры, рейтинги, лучшие цены"', 'Описание сайта', true),
('maintenance_mode', 'false', 'Режим технического обслуживания', false),
('max_file_size', '52428800', 'Максимальный размер файла в байтах (50MB)', false),
('allowed_file_types', '["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"]', 'Разрешенные типы файлов', false);

-- Вставляем базовые категории
INSERT INTO categories (name, slug, description, sort_order) VALUES
('Умные розетки', 'sockets', 'Умные розетки с Wi-Fi и Zigbee', 1),
('Освещение', 'lighting', 'Умные лампы, светильники и выключатели', 2),
('Видеокамеры', 'cameras', 'IP-камеры для видеонаблюдения', 3),
('Датчики', 'sensors', 'Датчики движения, температуры, влажности', 4),
('Безопасность', 'security', 'Системы безопасности и контроля доступа', 5),
('Умные колонки', 'speakers', 'Голосовые помощники и умные колонки', 6),
('Хабы', 'hubs', 'Центры управления умным домом', 7),
('Климат', 'climate', 'Кондиционеры, обогреватели, термостаты', 8);

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
('Tuya', 'tuya', 'Платформа и экосистема умных устройств');

COMMENT ON TABLE user_profiles IS 'Расширенные профили пользователей';
COMMENT ON TABLE categories IS 'Категории продуктов умного дома';
COMMENT ON TABLE brands IS 'Бренды производителей';
COMMENT ON TABLE products IS 'Каталог продуктов умного дома';
COMMENT ON TABLE product_images IS 'Изображения продуктов';
COMMENT ON TABLE affiliate_links IS 'Партнерские ссылки на маркетплейсы';
COMMENT ON TABLE articles IS 'Статьи, новости, обзоры';
COMMENT ON TABLE user_favorites IS 'Избранные товары пользователей';
COMMENT ON TABLE shopping_lists IS 'Списки покупок пользователей';
COMMENT ON TABLE analytics_events IS 'События для аналитики';
COMMENT ON TABLE newsletter_subscribers IS 'Подписчики рассылки';
COMMENT ON TABLE product_reviews IS 'Отзывы на продукты';
COMMENT ON TABLE user_notifications IS 'Уведомления пользователей';
COMMENT ON TABLE system_settings IS 'Настройки системы';
COMMENT ON TABLE system_logs IS 'Системные логи';