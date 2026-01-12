-- Создание админ аккаунта для тестирования
-- Выполните этот скрипт в SQL Editor вашего Supabase проекта

-- =====================================================
-- СОЗДАНИЕ ТЕСТОВОГО АДМИН ПОЛЬЗОВАТЕЛЯ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Создание тестового админ пользователя...';
END;
$$;

-- =====================================================
-- СПОСОБ 1: ОБНОВИТЬ СУЩЕСТВУЮЩЕГО ПОЛЬЗОВАТЕЛЯ
-- =====================================================

-- Замените 'your-email@example.com' на реальный email пользователя
-- Сначала найдем существующих пользователей
DO $$
DECLARE
  user_count INTEGER;
  user_record RECORD;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  IF user_count > 0 THEN
    RAISE NOTICE 'Найдено % пользователей в auth.users', user_count;
    RAISE NOTICE 'Список пользователей:';
    
    -- Показать существующих пользователей
    FOR user_record IN 
      SELECT id, email, created_at FROM auth.users LIMIT 5
    LOOP
      RAISE NOTICE 'ID: %, Email: %, Создан: %', user_record.id, user_record.email, user_record.created_at;
    END LOOP;
  ELSE
    RAISE NOTICE 'Пользователи не найдены в auth.users';
    RAISE NOTICE 'Создайте пользователя через Supabase Auth UI или регистрацию';
  END IF;
END;
$$;

-- Обновить первого найденного пользователя до админа
DO $$
DECLARE
  first_user_id UUID;
  first_user_email TEXT;
BEGIN
  -- Найти первого пользователя
  SELECT id, email INTO first_user_id, first_user_email 
  FROM auth.users 
  ORDER BY created_at 
  LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    -- Обновить метаданные пользователя
    UPDATE auth.users 
    SET raw_user_meta_data = jsonb_set(
      COALESCE(raw_user_meta_data, '{}'),
      '{role}',
      '"admin"'
    )
    WHERE id = first_user_id;
    
    -- Создать или обновить профиль пользователя с админскими правами
    INSERT INTO public.user_profiles (
      id,
      username,
      full_name,
      role,
      bio,
      preferences,
      created_at,
      updated_at
    ) VALUES (
      first_user_id,
      'admin_user',
      'Administrator',
      'admin',
      'Администратор системы',
      '{"theme": "dark", "language": "ru"}',
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      role = 'admin',
      username = 'admin_user',
      full_name = 'Administrator',
      bio = 'Администратор системы',
      preferences = '{"theme": "dark", "language": "ru"}',
      updated_at = NOW();
    
    RAISE NOTICE 'Пользователь % (%) обновлен до админа', first_user_email, first_user_id;
  ELSE
    RAISE NOTICE 'Пользователи не найдены. Создайте пользователя через Auth UI.';
  END IF;
END;
$$;

-- =====================================================
-- СПОСОБ 2: СОЗДАНИЕ ТЕСТОВЫХ ПРОФИЛЕЙ БЕЗ AUTH
-- =====================================================

-- ВНИМАНИЕ: Этот способ создает профили без реальной аутентификации
-- Используйте только для тестирования функций, не для входа в систему

DO $$
BEGIN
  RAISE NOTICE 'Создание тестовых профилей без auth.users...';
  RAISE NOTICE 'ВНИМАНИЕ: Эти профили нельзя использовать для входа!';
END;
$$;

-- Временно отключить проверку внешних ключей (только для тестирования)
SET session_replication_role = replica;

DO $$
DECLARE
  test_admin_id UUID := '00000000-0000-0000-0000-000000000001';
  test_moderator_id UUID := '00000000-0000-0000-0000-000000000002';
  test_user_id UUID := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- Создать тестовый админ профиль
  INSERT INTO public.user_profiles (
    id,
    username,
    full_name,
    role,
    bio,
    preferences,
    created_at,
    updated_at
  ) VALUES (
    test_admin_id,
    'test_admin',
    'Test Administrator',
    'admin',
    'Тестовый администратор системы',
    '{"theme": "dark", "language": "ru"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    username = 'test_admin',
    full_name = 'Test Administrator',
    updated_at = NOW();
  
  -- Создать тестового модератора
  INSERT INTO public.user_profiles (
    id,
    username,
    full_name,
    role,
    bio,
    created_at,
    updated_at
  ) VALUES (
    test_moderator_id,
    'test_moderator',
    'Test Moderator',
    'moderator',
    'Тестовый модератор системы',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'moderator',
    username = 'test_moderator',
    updated_at = NOW();
  
  -- Создать обычного тестового пользователя
  INSERT INTO public.user_profiles (
    id,
    username,
    full_name,
    role,
    bio,
    created_at,
    updated_at
  ) VALUES (
    test_user_id,
    'test_user',
    'Test User',
    'user',
    'Обычный тестовый пользователь',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    username = 'test_user',
    updated_at = NOW();
  
  RAISE NOTICE 'Созданы тестовые профили:';
  RAISE NOTICE '- Админ ID: %', test_admin_id;
  RAISE NOTICE '- Модератор ID: %', test_moderator_id;
  RAISE NOTICE '- Пользователь ID: %', test_user_id;
END;
$$;

-- Включить обратно проверку внешних ключей
SET session_replication_role = DEFAULT;

-- =====================================================
-- ПРОВЕРКА СОЗДАННЫХ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Проверка созданных пользователей...';
END;
$$;

-- Показать всех пользователей с их ролями
SELECT 
  id,
  username,
  full_name,
  role,
  created_at,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = user_profiles.id) 
    THEN 'Есть в auth.users' 
    ELSE 'Только профиль (тестовый)' 
  END as auth_status
FROM public.user_profiles
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'moderator' THEN 2 
    WHEN 'user' THEN 3 
  END,
  created_at;

-- =====================================================
-- ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'НАСТРОЙКА ПОЛЬЗОВАТЕЛЕЙ ЗАВЕРШЕНА!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'РЕАЛЬНЫЕ ПОЛЬЗОВАТЕЛИ (можно использовать для входа):';
  RAISE NOTICE '- Проверьте таблицу выше на наличие "Есть в auth.users"';
  RAISE NOTICE '';
  RAISE NOTICE 'ТЕСТОВЫЕ ПРОФИЛИ (только для тестирования функций):';
  RAISE NOTICE '- АДМИН:      00000000-0000-0000-0000-000000000001';
  RAISE NOTICE '- МОДЕРАТОР:  00000000-0000-0000-0000-000000000002';
  RAISE NOTICE '- ПОЛЬЗОВАТЕЛЬ: 00000000-0000-0000-0000-000000000003';
  RAISE NOTICE '';
  RAISE NOTICE 'Для тестирования RLS политик используйте:';
  RAISE NOTICE 'SET LOCAL "request.jwt.claims" = ''{"sub": "USER_ID_HERE"}'';';
  RAISE NOTICE '';
  RAISE NOTICE 'ВАЖНО: Тестовые профили только для разработки!';
  RAISE NOTICE 'Для входа в приложение создайте пользователей через Auth UI.';
  RAISE NOTICE '';
END;
$$;

-- =====================================================
-- ПРОВЕРКА СОЗДАННЫХ ПОЛЬЗОВАТЕЛЕЙ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Проверка созданных тестовых пользователей...';
END;
$$;

-- Показать всех пользователей с их ролями
SELECT 
  id,
  username,
  full_name,
  role,
  created_at
FROM public.user_profiles
ORDER BY 
  CASE role 
    WHEN 'admin' THEN 1 
    WHEN 'moderator' THEN 2 
    WHEN 'user' THEN 3 
  END,
  created_at;

-- =====================================================
-- ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'ТЕСТОВЫЕ ПОЛЬЗОВАТЕЛИ СОЗДАНЫ!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Для тестирования используйте следующие ID:';
  RAISE NOTICE '';
  RAISE NOTICE 'АДМИН:      00000000-0000-0000-0000-000000000001';
  RAISE NOTICE 'МОДЕРАТОР:  00000000-0000-0000-0000-000000000002';
  RAISE NOTICE 'ПОЛЬЗОВАТЕЛЬ: 00000000-0000-0000-0000-000000000003';
  RAISE NOTICE '';
  RAISE NOTICE 'Для тестирования RLS политик используйте:';
  RAISE NOTICE 'SET LOCAL "request.jwt.claims" = ''{"sub": "00000000-0000-0000-0000-000000000001"}'';';
  RAISE NOTICE '';
  RAISE NOTICE 'ВАЖНО: Эти пользователи только для разработки!';
  RAISE NOTICE 'В продакшене используйте реальную аутентификацию Supabase.';
  RAISE NOTICE '';
END;
$$;