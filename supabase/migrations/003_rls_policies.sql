-- Smart Home 2026 - Row Level Security Policies
-- Настройка политик безопасности для всех таблиц

-- =====================================================
-- ВКЛЮЧЕНИЕ RLS ДЛЯ ВСЕХ ТАБЛИЦ
-- =====================================================

-- Пользовательские данные
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;

-- Каталог продуктов
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_links ENABLE ROW LEVEL SECURITY;

-- Контент
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Аналитика
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Рассылки
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Системные таблицы
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ ПОЛИТИК
-- =====================================================

-- Функция для проверки роли пользователя
CREATE OR REPLACE FUNCTION auth.user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM public.user_profiles WHERE id = auth.uid()),
    'user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки, является ли пользователь админом или модератором
CREATE OR REPLACE FUNCTION auth.is_admin_or_moderator()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_role() IN ('admin', 'moderator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки, является ли пользователь админом
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ПРОФИЛЕЙ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================================

-- Пользователи могут просматривать свой профиль
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Пользователи могут обновлять свой профиль
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Админы могут просматривать все профили
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (auth.is_admin());

-- Админы могут обновлять все профили
CREATE POLICY "Admins can update all profiles" ON user_profiles
  FOR UPDATE USING (auth.is_admin());

-- Автоматическое создание профиля при регистрации
CREATE POLICY "Enable insert for new users" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ КАТАЛОГА ПРОДУКТОВ
-- =====================================================

-- Все могут просматривать активные продукты
CREATE POLICY "Anyone can view active products" ON products
  FOR SELECT USING (is_active = true);

-- Админы и модераторы могут просматривать все продукты
CREATE POLICY "Admins can view all products" ON products
  FOR SELECT USING (auth.is_admin_or_moderator());

-- Админы и модераторы могут управлять продуктами
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (auth.is_admin_or_moderator());

-- Все могут просматривать активные категории
CREATE POLICY "Anyone can view active categories" ON categories
  FOR SELECT USING (is_active = true);

-- Админы могут управлять категориями
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (auth.is_admin());

-- Все могут просматривать активные бренды
CREATE POLICY "Anyone can view active brands" ON brands
  FOR SELECT USING (is_active = true);

-- Админы могут управлять брендами
CREATE POLICY "Admins can manage brands" ON brands
  FOR ALL USING (auth.is_admin());

-- Все могут просматривать изображения продуктов
CREATE POLICY "Anyone can view product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = product_images.product_id AND is_active = true
    )
  );

-- Админы могут управлять изображениями
CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (auth.is_admin_or_moderator());

-- Все могут просматривать партнерские ссылки активных продуктов
CREATE POLICY "Anyone can view affiliate links" ON affiliate_links
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE id = affiliate_links.product_id AND is_active = true
    )
  );

-- Админы могут управлять партнерскими ссылками
CREATE POLICY "Admins can manage affiliate links" ON affiliate_links
  FOR ALL USING (auth.is_admin_or_moderator());

-- =====================================================
-- ПОЛИТИКИ ДЛЯ КОНТЕНТА
-- =====================================================

-- Все могут просматривать опубликованные статьи
CREATE POLICY "Anyone can view published articles" ON articles
  FOR SELECT USING (status = 'published');

-- Авторы могут просматривать свои статьи
CREATE POLICY "Authors can view own articles" ON articles
  FOR SELECT USING (auth.uid() = author_id);

-- Админы и модераторы могут просматривать все статьи
CREATE POLICY "Admins can view all articles" ON articles
  FOR SELECT USING (auth.is_admin_or_moderator());

-- Авторы могут создавать статьи
CREATE POLICY "Authors can create articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Авторы могут редактировать свои черновики
CREATE POLICY "Authors can edit own drafts" ON articles
  FOR UPDATE USING (
    auth.uid() = author_id AND 
    (status = 'draft' OR auth.is_admin_or_moderator())
  );

-- Админы и модераторы могут управлять всеми статьями
CREATE POLICY "Admins can manage all articles" ON articles
  FOR ALL USING (auth.is_admin_or_moderator());

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ПОЛЬЗОВАТЕЛЬСКИХ ДАННЫХ
-- =====================================================

-- Пользователи могут управлять своими избранными
CREATE POLICY "Users can manage own favorites" ON user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Пользователи могут управлять своими списками покупок
CREATE POLICY "Users can manage own shopping lists" ON shopping_lists
  FOR ALL USING (auth.uid() = user_id);

-- Все могут просматривать публичные списки покупок
CREATE POLICY "Anyone can view public shopping lists" ON shopping_lists
  FOR SELECT USING (is_public = true);

-- Пользователи могут управлять элементами своих списков
CREATE POLICY "Users can manage own shopping list items" ON shopping_list_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shopping_lists 
      WHERE id = shopping_list_items.list_id AND user_id = auth.uid()
    )
  );

-- Все могут просматривать элементы публичных списков
CREATE POLICY "Anyone can view public shopping list items" ON shopping_list_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shopping_lists 
      WHERE id = shopping_list_items.list_id AND is_public = true
    )
  );

-- Пользователи могут просматривать свою историю просмотров
CREATE POLICY "Users can view own product views" ON user_product_views
  FOR SELECT USING (auth.uid() = user_id);

-- Пользователи могут добавлять записи о просмотрах
CREATE POLICY "Users can insert own product views" ON user_product_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Анонимные пользователи могут добавлять просмотры по session_id
CREATE POLICY "Anonymous users can insert product views" ON user_product_views
  FOR INSERT WITH CHECK (user_id IS NULL AND session_id IS NOT NULL);

-- Админы могут просматривать всю историю просмотров
CREATE POLICY "Admins can view all product views" ON user_product_views
  FOR SELECT USING (auth.is_admin());

-- Пользователи могут управлять своими уведомлениями
CREATE POLICY "Users can manage own notifications" ON user_notifications
  FOR ALL USING (auth.uid() = user_id);

-- Пользователи могут оставлять отзывы на продукты
CREATE POLICY "Users can create product reviews" ON product_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Пользователи могут редактировать свои неодобренные отзывы
CREATE POLICY "Users can edit own unapproved reviews" ON product_reviews
  FOR UPDATE USING (
    auth.uid() = user_id AND is_approved = false
  );

-- Все могут просматривать одобренные отзывы
CREATE POLICY "Anyone can view approved reviews" ON product_reviews
  FOR SELECT USING (is_approved = true);

-- Пользователи могут просматривать свои отзывы
CREATE POLICY "Users can view own reviews" ON product_reviews
  FOR SELECT USING (auth.uid() = user_id);

-- Модераторы могут управлять всеми отзывами
CREATE POLICY "Moderators can manage all reviews" ON product_reviews
  FOR ALL USING (auth.is_admin_or_moderator());

-- =====================================================
-- ПОЛИТИКИ ДЛЯ АНАЛИТИКИ
-- =====================================================

-- Пользователи могут добавлять события аналитики
CREATE POLICY "Users can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL
  );

-- Анонимные пользователи могут добавлять события
CREATE POLICY "Anonymous users can insert analytics events" ON analytics_events
  FOR INSERT WITH CHECK (user_id IS NULL);

-- Админы могут просматривать всю аналитику
CREATE POLICY "Admins can view analytics" ON analytics_events
  FOR SELECT USING (auth.is_admin());

-- Пользователи могут просматривать свои события
CREATE POLICY "Users can view own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- Все могут добавлять клики по партнерским ссылкам
CREATE POLICY "Anyone can insert affiliate clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

-- Админы могут просматривать клики по партнерским ссылкам
CREATE POLICY "Admins can view affiliate clicks" ON affiliate_clicks
  FOR SELECT USING (auth.is_admin());

-- =====================================================
-- ПОЛИТИКИ ДЛЯ РАССЫЛОК
-- =====================================================

-- Все могут подписаться на рассылку
CREATE POLICY "Anyone can subscribe to newsletter" ON newsletter_subscribers
  FOR INSERT WITH CHECK (true);

-- Подписчики могут обновлять свои данные по email
CREATE POLICY "Subscribers can update own data" ON newsletter_subscribers
  FOR UPDATE USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Админы могут управлять всеми подписчиками
CREATE POLICY "Admins can manage newsletter subscribers" ON newsletter_subscribers
  FOR ALL USING (auth.is_admin());

-- Админы могут управлять email кампаниями
CREATE POLICY "Admins can manage email campaigns" ON email_campaigns
  FOR ALL USING (auth.is_admin());

-- =====================================================
-- ПОЛИТИКИ ДЛЯ СИСТЕМНЫХ ТАБЛИЦ
-- =====================================================

-- Все могут просматривать публичные настройки
CREATE POLICY "Anyone can view public settings" ON system_settings
  FOR SELECT USING (is_public = true);

-- Админы могут управлять всеми настройками
CREATE POLICY "Admins can manage system settings" ON system_settings
  FOR ALL USING (auth.is_admin());

-- Админы могут просматривать системные логи
CREATE POLICY "Admins can view system logs" ON system_logs
  FOR SELECT USING (auth.is_admin());

-- Система может добавлять логи
CREATE POLICY "System can insert logs" ON system_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- ПОЛИТИКИ ДЛЯ ПРЕДСТАВЛЕНИЙ
-- =====================================================

-- Создаем политики для представлений
CREATE POLICY "Anyone can view active products view" ON active_products
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view published articles view" ON published_articles
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view product stats view" ON product_stats
  FOR SELECT USING (true);

-- =====================================================
-- ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ БЕЗОПАСНОСТИ
-- =====================================================

-- Функция для проверки владельца списка покупок
CREATE OR REPLACE FUNCTION auth.owns_shopping_list(list_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shopping_lists 
    WHERE id = list_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки доступа к продукту
CREATE OR REPLACE FUNCTION auth.can_access_product(product_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM products 
    WHERE id = product_id AND (is_active = true OR auth.is_admin_or_moderator())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для проверки доступа к статье
CREATE OR REPLACE FUNCTION auth.can_access_article(article_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM articles 
    WHERE id = article_id AND (
      status = 'published' OR 
      author_id = auth.uid() OR 
      auth.is_admin_or_moderator()
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ПОЛИТИКИ ДЛЯ API ДОСТУПА
-- =====================================================

-- Создаем роль для API доступа
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'api_user') THEN
    CREATE ROLE api_user;
  END IF;
END
$$;

-- Предоставляем права API роли
GRANT USAGE ON SCHEMA public TO api_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO api_user;
GRANT INSERT, UPDATE, DELETE ON user_favorites, shopping_lists, shopping_list_items, 
  user_product_views, analytics_events, affiliate_clicks, newsletter_subscribers TO api_user;

-- =====================================================
-- КОММЕНТАРИИ К ПОЛИТИКАМ
-- =====================================================

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 
  'Пользователи могут просматривать только свой профиль';

COMMENT ON POLICY "Anyone can view active products" ON products IS 
  'Публичный доступ к активным продуктам для всех пользователей';

COMMENT ON POLICY "Admins can manage products" ON products IS 
  'Админы и модераторы имеют полный доступ к управлению продуктами';

COMMENT ON POLICY "Users can manage own favorites" ON user_favorites IS 
  'Пользователи могут управлять только своими избранными товарами';

COMMENT ON POLICY "Anyone can view published articles" ON articles IS 
  'Публичный доступ к опубликованным статьям';

COMMENT ON POLICY "Users can insert analytics events" ON analytics_events IS 
  'Пользователи могут отправлять события аналитики';

-- Обновляем статистику после создания политик
ANALYZE;