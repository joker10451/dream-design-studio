# Supabase Database Migrations

Этот каталог содержит SQL миграции для базы данных Smart Home 2026.

## Структура миграций

### 001_initial_schema.sql
**Основная схема базы данных**

Создает:
- Пользовательские типы данных (ENUM)
- Основные таблицы системы
- Базовые триггеры и функции
- Начальные данные (категории, бренды, настройки)

**Таблицы:**
- `user_profiles` - Расширенные профили пользователей
- `categories` - Категории продуктов
- `brands` - Бренды производителей
- `products` - Каталог продуктов
- `product_images` - Изображения продуктов
- `affiliate_links` - Партнерские ссылки
- `articles` - Статьи и новости
- `user_favorites` - Избранные товары
- `shopping_lists` - Списки покупок
- `shopping_list_items` - Элементы списков покупок
- `user_product_views` - История просмотров
- `analytics_events` - События аналитики
- `affiliate_clicks` - Клики по партнерским ссылкам
- `newsletter_subscribers` - Подписчики рассылки
- `email_campaigns` - Email кампании
- `product_reviews` - Отзывы на продукты
- `user_notifications` - Уведомления пользователей
- `system_settings` - Настройки системы
- `system_logs` - Системные логи

### 002_indexes.sql
**Индексы для производительности**

Создает:
- Индексы для быстрого поиска продуктов
- Полнотекстовые индексы для поиска
- Составные индексы для сложных запросов
- Частичные индексы для оптимизации
- Представления для часто используемых запросов

### 003_rls_policies.sql
**Row Level Security политики**

Настраивает:
- Политики доступа для всех таблиц
- Разграничение прав по ролям пользователей
- Защиту персональных данных
- API доступ для внешних сервисов

**Роли пользователей:**
- `user` - Обычный пользователь
- `moderator` - Модератор контента
- `admin` - Администратор системы

### 004_functions.sql
**Дополнительные функции и триггеры**

Создает:
- Функции поиска и рекомендаций
- Аналитические функции
- Функции уведомлений
- Триггеры для автоматизации
- Функции очистки данных
- Планировщик задач

## Применение миграций

### Вариант 1: Через Supabase Dashboard

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Перейдите в ваш проект
3. Откройте **SQL Editor**
4. Выполните миграции по порядку:
   ```sql
   -- Скопируйте и выполните содержимое каждого файла:
   -- 1. 001_initial_schema.sql
   -- 2. 002_indexes.sql  
   -- 3. 003_rls_policies.sql
   -- 4. 004_functions.sql
   ```

### Вариант 2: Через единый скрипт

1. Откройте **SQL Editor** в Supabase Dashboard
2. Скопируйте и выполните содержимое `apply_migrations.sql`

### Вариант 3: Через Supabase CLI (локальная разработка)

```bash
# Инициализация проекта
supabase init

# Запуск локального Supabase
supabase start

# Применение миграций
supabase db push

# Генерация TypeScript типов
supabase gen types typescript --local > src/lib/supabase/database.types.ts
```

## Проверка миграций

После применения миграций проверьте:

### 1. Таблицы созданы
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 2. Индексы созданы
```sql
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```

### 3. RLS включен
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### 4. Политики созданы
```sql
SELECT tablename, policyname, cmd, roles 
FROM pg_policies 
ORDER BY tablename, policyname;
```

### 5. Функции созданы
```sql
SELECT proname, pronargs 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY proname;
```

## Тестирование

### Тест подключения
```sql
-- Проверка базовых операций
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM brands;
SELECT COUNT(*) FROM system_settings;
```

### Тест поиска
```sql
-- Тест функции поиска продуктов
SELECT * FROM search_products('умная розетка', NULL, NULL, NULL, NULL, NULL, 5, 0);
```

### Тест RLS
```sql
-- Тест политик безопасности (должен работать только для авторизованных пользователей)
SELECT * FROM user_profiles LIMIT 1;
```

## Откат миграций

Если нужно откатить миграции:

### Удаление всех таблиц
```sql
-- ВНИМАНИЕ: Это удалит ВСЕ данные!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

### Удаление конкретных объектов
```sql
-- Удаление функций
DROP FUNCTION IF EXISTS search_products CASCADE;
DROP FUNCTION IF EXISTS get_user_recommendations CASCADE;

-- Удаление представлений
DROP VIEW IF EXISTS active_products CASCADE;
DROP VIEW IF EXISTS published_articles CASCADE;

-- Удаление таблиц (в обратном порядке зависимостей)
DROP TABLE IF EXISTS system_logs CASCADE;
DROP TABLE IF EXISTS user_notifications CASCADE;
-- ... и так далее
```

## Обслуживание

### Регулярные задачи

1. **Очистка старых данных** (автоматически через pg_cron):
   ```sql
   SELECT cleanup_old_analytics(90); -- Очистка аналитики старше 90 дней
   SELECT cleanup_old_logs(30);      -- Очистка логов старше 30 дней
   ```

2. **Обновление статистики**:
   ```sql
   ANALYZE; -- Обновление статистики для оптимизатора запросов
   ```

3. **Мониторинг производительности**:
   ```sql
   -- Медленные запросы
   SELECT query, mean_time, calls 
   FROM pg_stat_statements 
   ORDER BY mean_time DESC 
   LIMIT 10;
   ```

### Резервное копирование

```bash
# Создание бэкапа через Supabase CLI
supabase db dump --local > backup.sql

# Восстановление из бэкапа
psql -h localhost -p 54322 -U postgres -d postgres < backup.sql
```

## Мониторинг

### Ключевые метрики

1. **Размер базы данных**:
   ```sql
   SELECT pg_size_pretty(pg_database_size(current_database()));
   ```

2. **Размер таблиц**:
   ```sql
   SELECT 
     schemaname,
     tablename,
     pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
   FROM pg_tables 
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
   ```

3. **Активность таблиц**:
   ```sql
   SELECT 
     schemaname,
     tablename,
     n_tup_ins as inserts,
     n_tup_upd as updates,
     n_tup_del as deletes
   FROM pg_stat_user_tables
   ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC;
   ```

## Поддержка

При возникновении проблем:

1. Проверьте логи в `system_logs` таблице
2. Убедитесь, что все миграции применены в правильном порядке
3. Проверьте права доступа пользователей
4. Обратитесь к документации Supabase: https://supabase.com/docs

## Версионирование

- **v1.0** - Базовая схема (001-004 миграции)
- Будущие версии будут добавлены как новые миграции с инкрементальными номерами