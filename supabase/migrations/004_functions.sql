-- Smart Home 2026 - Database Functions and Triggers
-- Дополнительные функции для бизнес-логики и автоматизации

-- =====================================================
-- ФУНКЦИИ ДЛЯ ПОИСКА И РЕКОМЕНДАЦИЙ
-- =====================================================

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

-- Функция для получения рекомендаций на основе истории просмотров
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
    -- Категории, которые пользователь просматривал чаще всего
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
  ),
  similar_users AS (
    -- Пользователи с похожими интересами
    SELECT 
      upv2.user_id,
      COUNT(*) as common_views
    FROM user_product_views upv1
    JOIN user_product_views upv2 ON upv1.product_id = upv2.product_id
    WHERE upv1.user_id = target_user_id
      AND upv2.user_id != target_user_id
      AND upv1.viewed_at > NOW() - INTERVAL '30 days'
      AND upv2.viewed_at > NOW() - INTERVAL '30 days'
    GROUP BY upv2.user_id
    HAVING COUNT(*) >= 2
    ORDER BY common_views DESC
    LIMIT 10
  )
  SELECT 
    p.id as product_id,
    p.name as product_name,
    CASE 
      WHEN uc.category_id IS NOT NULL THEN 'Популярно в интересующих вас категориях'
      ELSE 'Рекомендовано пользователями с похожими интересами'
    END as reason,
    CASE 
      WHEN uc.category_id IS NOT NULL THEN p.rating * 0.8 + (uc.view_count::REAL / 10) * 0.2
      ELSE p.rating * 0.6 + (COUNT(upv.id)::REAL / 5) * 0.4
    END as score
  FROM products p
  LEFT JOIN user_categories uc ON p.category_id = uc.category_id
  LEFT JOIN user_product_views upv ON p.id = upv.product_id
  LEFT JOIN similar_users su ON upv.user_id = su.user_id
  WHERE p.is_active = true
    AND p.id NOT IN (
      -- Исключаем уже просмотренные продукты
      SELECT product_id FROM user_product_views 
      WHERE user_id = target_user_id
    )
    AND p.id NOT IN (
      -- Исключаем продукты в избранном
      SELECT product_id FROM user_favorites 
      WHERE user_id = target_user_id
    )
    AND (uc.category_id IS NOT NULL OR su.user_id IS NOT NULL)
  GROUP BY p.id, p.name, p.rating, uc.category_id, uc.view_count
  ORDER BY score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИИ ДЛЯ АНАЛИТИКИ
-- =====================================================

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
  click_count BIGINT,
  popularity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    COALESCE(views.view_count, 0) as view_count,
    COALESCE(favorites.favorite_count, 0) as favorite_count,
    COALESCE(clicks.click_count, 0) as click_count,
    (
      COALESCE(views.view_count, 0) * 1.0 +
      COALESCE(favorites.favorite_count, 0) * 3.0 +
      COALESCE(clicks.click_count, 0) * 5.0
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
  LEFT JOIN (
    SELECT 
      al.product_id, 
      COUNT(*) as click_count
    FROM affiliate_clicks ac
    JOIN affiliate_links al ON ac.affiliate_link_id = al.id
    WHERE ac.clicked_at > NOW() - time_period
    GROUP BY al.product_id
  ) clicks ON p.id = clicks.product_id
  WHERE p.is_active = true
  ORDER BY popularity_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Функция для получения статистики по категориям
CREATE OR REPLACE FUNCTION get_category_stats()
RETURNS TABLE (
  category_id UUID,
  category_name VARCHAR(255),
  product_count BIGINT,
  avg_price DECIMAL(10,2),
  avg_rating DECIMAL(3,2),
  total_views BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as category_id,
    c.name as category_name,
    COUNT(p.id) as product_count,
    ROUND(AVG(p.price), 2) as avg_price,
    ROUND(AVG(p.rating), 2) as avg_rating,
    COALESCE(SUM(views.view_count), 0) as total_views
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
  LEFT JOIN (
    SELECT 
      p2.category_id,
      COUNT(*) as view_count
    FROM user_product_views upv
    JOIN products p2 ON upv.product_id = p2.id
    WHERE upv.viewed_at > NOW() - INTERVAL '30 days'
    GROUP BY p2.category_id
  ) views ON c.id = views.category_id
  WHERE c.is_active = true
  GROUP BY c.id, c.name
  ORDER BY product_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИИ ДЛЯ УВЕДОМЛЕНИЙ
-- =====================================================

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
  -- Получаем название продукта
  SELECT name INTO product_name FROM products WHERE id = target_product_id;
  
  -- Создаем уведомления для всех пользователей, у которых продукт в избранном
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

-- Функция для создания уведомления о новой статье
CREATE OR REPLACE FUNCTION create_article_notification(
  article_id UUID
)
RETURNS VOID AS $$
DECLARE
  article_title VARCHAR(255);
  article_category article_category;
  user_record RECORD;
BEGIN
  -- Получаем данные статьи
  SELECT title, category INTO article_title, article_category 
  FROM articles WHERE id = article_id;
  
  -- Создаем уведомления для пользователей, подписанных на этот тип контента
  FOR user_record IN 
    SELECT DISTINCT up.id as user_id
    FROM user_profiles up
    WHERE up.preferences->>'new_articles' = 'true'
       OR up.preferences->>('category_' || article_category) = 'true'
  LOOP
    INSERT INTO user_notifications (
      user_id,
      type,
      title,
      message,
      data
    ) VALUES (
      user_record.user_id,
      'new_article',
      'Новая статья',
      format('Опубликована новая статья: "%s"', article_title),
      jsonb_build_object(
        'article_id', article_id,
        'category', article_category
      )
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ТРИГГЕРЫ ДЛЯ АВТОМАТИЗАЦИИ
-- =====================================================

-- Триггер для отслеживания изменения цен
CREATE OR REPLACE FUNCTION trigger_price_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Если цена снизилась более чем на 5%
  IF OLD.price IS NOT NULL AND NEW.price IS NOT NULL 
     AND NEW.price < OLD.price 
     AND (OLD.price - NEW.price) / OLD.price > 0.05 THEN
    
    PERFORM create_price_drop_notification(NEW.id, OLD.price, NEW.price);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_price_change_trigger
  AFTER UPDATE OF price ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_price_change();

-- Триггер для уведомлений о новых статьях
CREATE OR REPLACE FUNCTION trigger_article_published()
RETURNS TRIGGER AS $$
BEGIN
  -- Если статья была опубликована (изменился статус на published)
  IF OLD.status != 'published' AND NEW.status = 'published' THEN
    PERFORM create_article_notification(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_published_trigger
  AFTER UPDATE OF status ON articles
  FOR EACH ROW
  EXECUTE FUNCTION trigger_article_published();

-- Триггер для автоматического обновления счетчика просмотров статей
CREATE OR REPLACE FUNCTION increment_article_views()
RETURNS TRIGGER AS $$
BEGIN
  -- Увеличиваем счетчик просмотров статьи
  UPDATE articles 
  SET view_count = view_count + 1 
  WHERE id = (NEW.parameters->>'article_id')::UUID;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_view_counter_trigger
  AFTER INSERT ON analytics_events
  FOR EACH ROW
  WHEN (NEW.event_name = 'article_view')
  EXECUTE FUNCTION increment_article_views();

-- =====================================================
-- ФУНКЦИИ ДЛЯ ОЧИСТКИ ДАННЫХ
-- =====================================================

-- Функция для очистки старых аналитических данных
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
  
  -- Логируем операцию очистки
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

-- Функция для очистки старых логов
CREATE OR REPLACE FUNCTION cleanup_old_logs(
  retention_days INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM system_logs 
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL
    AND level NOT IN ('error', 'warning'); -- Сохраняем важные логи дольше
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ФУНКЦИИ ДЛЯ ЭКСПОРТА ДАННЫХ
-- =====================================================

-- Функция для экспорта статистики продуктов
CREATE OR REPLACE FUNCTION export_product_stats(
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),
  category_name VARCHAR(255),
  brand_name VARCHAR(255),
  price DECIMAL(10,2),
  rating DECIMAL(3,2),
  reviews_count INTEGER,
  view_count BIGINT,
  favorite_count BIGINT,
  affiliate_clicks BIGINT
) AS $$
BEGIN
  IF start_date IS NULL THEN
    start_date := CURRENT_DATE - INTERVAL '30 days';
  END IF;
  
  IF end_date IS NULL THEN
    end_date := CURRENT_DATE;
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id as product_id,
    p.name as product_name,
    c.name as category_name,
    b.name as brand_name,
    p.price,
    p.rating,
    p.reviews_count,
    COALESCE(views.view_count, 0) as view_count,
    COALESCE(favorites.favorite_count, 0) as favorite_count,
    COALESCE(clicks.click_count, 0) as affiliate_clicks
  FROM products p
  LEFT JOIN categories c ON p.category_id = c.id
  LEFT JOIN brands b ON p.brand_id = b.id
  LEFT JOIN (
    SELECT product_id, COUNT(*) as view_count
    FROM user_product_views 
    WHERE DATE(viewed_at) BETWEEN start_date AND end_date
    GROUP BY product_id
  ) views ON p.id = views.product_id
  LEFT JOIN (
    SELECT product_id, COUNT(*) as favorite_count
    FROM user_favorites 
    WHERE DATE(created_at) BETWEEN start_date AND end_date
    GROUP BY product_id
  ) favorites ON p.id = favorites.product_id
  LEFT JOIN (
    SELECT al.product_id, COUNT(*) as click_count
    FROM affiliate_clicks ac
    JOIN affiliate_links al ON ac.affiliate_link_id = al.id
    WHERE DATE(ac.clicked_at) BETWEEN start_date AND end_date
    GROUP BY al.product_id
  ) clicks ON p.id = clicks.product_id
  WHERE p.is_active = true
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ПЛАНИРОВЩИК ЗАДАЧ
-- =====================================================

-- Создаем расширение для планировщика (если доступно)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Планируем ежедневную очистку старых данных (если pg_cron доступен)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    -- Очистка аналитики каждый день в 2:00
    PERFORM cron.schedule('cleanup-analytics', '0 2 * * *', 'SELECT cleanup_old_analytics(90);');
    
    -- Очистка логов каждый день в 3:00
    PERFORM cron.schedule('cleanup-logs', '0 3 * * *', 'SELECT cleanup_old_logs(30);');
    
    -- Обновление статистики каждый день в 4:00
    PERFORM cron.schedule('update-stats', '0 4 * * *', 'ANALYZE;');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Игнорируем ошибки, если pg_cron недоступен
    NULL;
END;
$$;

-- =====================================================
-- КОММЕНТАРИИ К ФУНКЦИЯМ
-- =====================================================

COMMENT ON FUNCTION search_products IS 'Полнотекстовый поиск продуктов с фильтрацией и ранжированием';
COMMENT ON FUNCTION get_user_recommendations IS 'Персонализированные рекомендации на основе истории просмотров';
COMMENT ON FUNCTION get_popular_products IS 'Получение популярных продуктов за указанный период';
COMMENT ON FUNCTION get_category_stats IS 'Статистика по категориям продуктов';
COMMENT ON FUNCTION create_price_drop_notification IS 'Создание уведомлений о снижении цен';
COMMENT ON FUNCTION cleanup_old_analytics IS 'Очистка старых аналитических данных';
COMMENT ON FUNCTION export_product_stats IS 'Экспорт статистики продуктов за период';

-- Обновляем статистику после создания функций
ANALYZE;