-- Smart Home 2026 - Database Indexes
-- Создание индексов для оптимизации производительности запросов

-- =====================================================
-- ИНДЕКСЫ ДЛЯ ПРОДУКТОВ
-- =====================================================

-- Основные индексы для продуктов
CREATE INDEX idx_products_category ON products(category_id) WHERE is_active = true;
CREATE INDEX idx_products_brand ON products(brand_id) WHERE is_active = true;
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX idx_products_price ON products(price) WHERE is_active = true AND price IS NOT NULL;
CREATE INDEX idx_products_rating ON products(rating) WHERE is_active = true;
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_updated_at ON products(updated_at);

-- Составные индексы для сложных запросов
CREATE INDEX idx_products_category_active ON products(category_id, is_active);
CREATE INDEX idx_products_brand_active ON products(brand_id, is_active);
CREATE INDEX idx_products_price_rating ON products(price, rating) WHERE is_active = true;
CREATE INDEX idx_products_featured_created ON products(featured, created_at) WHERE is_active = true;

-- Индексы для поиска по тегам
CREATE INDEX idx_products_tags ON products USING gin(tags);

-- Полнотекстовый поиск для продуктов
CREATE INDEX idx_products_search ON products USING gin(
  to_tsvector('russian', 
    COALESCE(name, '') || ' ' || 
    COALESCE(description, '') || ' ' || 
    COALESCE(full_description, '')
  )
) WHERE is_active = true;

-- =====================================================
-- ИНДЕКСЫ ДЛЯ КАТЕГОРИЙ И БРЕНДОВ
-- =====================================================

CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_sort ON categories(sort_order, is_active);
CREATE INDEX idx_categories_slug ON categories(slug) WHERE is_active = true;

CREATE INDEX idx_brands_active ON brands(is_active);
CREATE INDEX idx_brands_slug ON brands(slug) WHERE is_active = true;
CREATE INDEX idx_brands_name ON brands(name) WHERE is_active = true;

-- =====================================================
-- ИНДЕКСЫ ДЛЯ ИЗОБРАЖЕНИЙ И ПАРТНЕРСКИХ ССЫЛОК
-- =====================================================

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(product_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_product_images_sort ON product_images(product_id, sort_order);

CREATE INDEX idx_affiliate_links_product ON affiliate_links(product_id);
CREATE INDEX idx_affiliate_links_marketplace ON affiliate_links(marketplace, is_available);
CREATE INDEX idx_affiliate_links_available ON affiliate_links(is_available) WHERE is_available = true;
CREATE INDEX idx_affiliate_links_updated ON affiliate_links(last_updated);

-- =====================================================
-- ИНДЕКСЫ ДЛЯ СТАТЕЙ И КОНТЕНТА
-- =====================================================

CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_category ON articles(category, status);
CREATE INDEX idx_articles_published ON articles(published_at) WHERE status = 'published';
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug) WHERE status = 'published';
CREATE INDEX idx_articles_created ON articles(created_at);
CREATE INDEX idx_articles_views ON articles(view_count) WHERE status = 'published';

-- Составные индексы для статей
CREATE INDEX idx_articles_category_published ON articles(category, published_at) WHERE status = 'published';
CREATE INDEX idx_articles_status_updated ON articles(status, updated_at);

-- Индексы для поиска по тегам статей
CREATE INDEX idx_articles_tags ON articles USING gin(tags);

-- Полнотекстовый поиск для статей
CREATE INDEX idx_articles_search ON articles USING gin(
  to_tsvector('russian', 
    COALESCE(title, '') || ' ' || 
    COALESCE(excerpt, '') || ' ' || 
    COALESCE(content, '')
  )
) WHERE status = 'published';

-- =====================================================
-- ИНДЕКСЫ ДЛЯ ПОЛЬЗОВАТЕЛЬСКИХ ДАННЫХ
-- =====================================================

-- Профили пользователей
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_username ON user_profiles(username) WHERE username IS NOT NULL;
CREATE INDEX idx_user_profiles_created ON user_profiles(created_at);

-- Избранные товары
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_product ON user_favorites(product_id);
CREATE INDEX idx_user_favorites_created ON user_favorites(created_at);

-- Списки покупок
CREATE INDEX idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_public ON shopping_lists(is_public) WHERE is_public = true;
CREATE INDEX idx_shopping_lists_created ON shopping_lists(created_at);

CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(list_id);
CREATE INDEX idx_shopping_list_items_product ON shopping_list_items(product_id);
CREATE INDEX idx_shopping_list_items_purchased ON shopping_list_items(is_purchased);

-- История просмотров
CREATE INDEX idx_user_product_views_user ON user_product_views(user_id);
CREATE INDEX idx_user_product_views_product ON user_product_views(product_id);
CREATE INDEX idx_user_product_views_date ON user_product_views(viewed_at);
CREATE INDEX idx_user_product_views_session ON user_product_views(session_id);

-- Составной индекс для рекомендаций
CREATE INDEX idx_user_product_views_user_date ON user_product_views(user_id, viewed_at DESC);

-- =====================================================
-- ИНДЕКСЫ ДЛЯ АНАЛИТИКИ
-- =====================================================

-- События аналитики
CREATE INDEX idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX idx_analytics_events_user ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_ip ON analytics_events(ip_address);

-- Составные индексы для аналитики
CREATE INDEX idx_analytics_events_name_date ON analytics_events(event_name, created_at);
CREATE INDEX idx_analytics_events_user_date ON analytics_events(user_id, created_at) WHERE user_id IS NOT NULL;

-- Индекс для поиска по параметрам событий
CREATE INDEX idx_analytics_events_parameters ON analytics_events USING gin(parameters);

-- Клики по партнерским ссылкам
CREATE INDEX idx_affiliate_clicks_link ON affiliate_clicks(affiliate_link_id);
CREATE INDEX idx_affiliate_clicks_user ON affiliate_clicks(user_id);
CREATE INDEX idx_affiliate_clicks_session ON affiliate_clicks(session_id);
CREATE INDEX idx_affiliate_clicks_date ON affiliate_clicks(clicked_at);

-- =====================================================
-- ИНДЕКСЫ ДЛЯ РАССЫЛОК
-- =====================================================

-- Подписчики рассылки
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = true;
CREATE INDEX idx_newsletter_subscribers_confirmed ON newsletter_subscribers(is_confirmed) WHERE is_confirmed = true;
CREATE INDEX idx_newsletter_subscribers_token ON newsletter_subscribers(confirmation_token) WHERE confirmation_token IS NOT NULL;
CREATE INDEX idx_newsletter_subscribers_unsubscribe ON newsletter_subscribers(unsubscribe_token);
CREATE INDEX idx_newsletter_subscribers_source ON newsletter_subscribers(source);
CREATE INDEX idx_newsletter_subscribers_subscribed ON newsletter_subscribers(subscribed_at);

-- Индекс для поиска по предпочтениям
CREATE INDEX idx_newsletter_subscribers_preferences ON newsletter_subscribers USING gin(preferences);

-- Email кампании
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_scheduled ON email_campaigns(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_email_campaigns_created ON email_campaigns(created_at);
CREATE INDEX idx_email_campaigns_creator ON email_campaigns(created_by);

-- =====================================================
-- ИНДЕКСЫ ДЛЯ ОТЗЫВОВ И УВЕДОМЛЕНИЙ
-- =====================================================

-- Отзывы на продукты
CREATE INDEX idx_product_reviews_product ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user ON product_reviews(user_id);
CREATE INDEX idx_product_reviews_approved ON product_reviews(is_approved) WHERE is_approved = true;
CREATE INDEX idx_product_reviews_rating ON product_reviews(rating) WHERE is_approved = true;
CREATE INDEX idx_product_reviews_created ON product_reviews(created_at);

-- Составной индекс для отзывов
CREATE INDEX idx_product_reviews_product_approved ON product_reviews(product_id, is_approved, created_at);

-- Уведомления пользователей
CREATE INDEX idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX idx_user_notifications_type ON user_notifications(type);
CREATE INDEX idx_user_notifications_read ON user_notifications(is_read);
CREATE INDEX idx_user_notifications_created ON user_notifications(created_at);

-- Составной индекс для непрочитанных уведомлений
CREATE INDEX idx_user_notifications_user_unread ON user_notifications(user_id, is_read, created_at) WHERE is_read = false;

-- =====================================================
-- ИНДЕКСЫ ДЛЯ СИСТЕМНЫХ ТАБЛИЦ
-- =====================================================

-- Настройки системы
CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_public ON system_settings(is_public) WHERE is_public = true;

-- Системные логи
CREATE INDEX idx_system_logs_level ON system_logs(level);
CREATE INDEX idx_system_logs_user ON system_logs(user_id);
CREATE INDEX idx_system_logs_created ON system_logs(created_at);

-- Составной индекс для поиска логов
CREATE INDEX idx_system_logs_level_date ON system_logs(level, created_at);

-- Индекс для поиска по контексту логов
CREATE INDEX idx_system_logs_context ON system_logs USING gin(context);

-- =====================================================
-- ЧАСТИЧНЫЕ ИНДЕКСЫ ДЛЯ ОПТИМИЗАЦИИ
-- =====================================================

-- Индексы только для активных записей (экономия места)
CREATE INDEX idx_products_active_only ON products(id) WHERE is_active = true;
CREATE INDEX idx_categories_active_only ON categories(id) WHERE is_active = true;
CREATE INDEX idx_brands_active_only ON brands(id) WHERE is_active = true;

-- Индексы для недавних записей (горячие данные)
CREATE INDEX idx_products_recent ON products(created_at) WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX idx_articles_recent ON articles(created_at) WHERE created_at > NOW() - INTERVAL '30 days';
CREATE INDEX idx_analytics_events_recent ON analytics_events(created_at) WHERE created_at > NOW() - INTERVAL '7 days';

-- =====================================================
-- СТАТИСТИКА И КОММЕНТАРИИ
-- =====================================================

-- Обновляем статистику для всех таблиц
ANALYZE;

-- Комментарии к индексам
COMMENT ON INDEX idx_products_search IS 'Полнотекстовый поиск по продуктам на русском языке';
COMMENT ON INDEX idx_articles_search IS 'Полнотекстовый поиск по статьям на русском языке';
COMMENT ON INDEX idx_products_category_active IS 'Составной индекс для фильтрации по категории и активности';
COMMENT ON INDEX idx_user_notifications_user_unread IS 'Оптимизация запросов непрочитанных уведомлений';
COMMENT ON INDEX idx_analytics_events_recent IS 'Индекс для горячих данных аналитики (последние 7 дней)';

-- Создаем представления для часто используемых запросов
CREATE VIEW active_products AS
SELECT p.*, b.name as brand_name, c.name as category_name
FROM products p
LEFT JOIN brands b ON p.brand_id = b.id
LEFT JOIN categories c ON p.category_id = c.id
WHERE p.is_active = true;

CREATE VIEW published_articles AS
SELECT a.*, up.full_name as author_name
FROM articles a
LEFT JOIN user_profiles up ON a.author_id = up.id
WHERE a.status = 'published';

CREATE VIEW product_stats AS
SELECT 
  p.id,
  p.name,
  p.rating,
  p.reviews_count,
  COUNT(uf.id) as favorites_count,
  COUNT(DISTINCT upv.user_id) as unique_views
FROM products p
LEFT JOIN user_favorites uf ON p.id = uf.product_id
LEFT JOIN user_product_views upv ON p.id = upv.product_id
WHERE p.is_active = true
GROUP BY p.id, p.name, p.rating, p.reviews_count;

COMMENT ON VIEW active_products IS 'Активные продукты с информацией о бренде и категории';
COMMENT ON VIEW published_articles IS 'Опубликованные статьи с информацией об авторе';
COMMENT ON VIEW product_stats IS 'Статистика по продуктам (рейтинг, избранное, просмотры)';