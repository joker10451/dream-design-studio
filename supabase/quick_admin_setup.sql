-- Быстрое создание админ пользователя для тестирования
-- ВНИМАНИЕ: Используйте только в development окружении!

-- =====================================================
-- БЫСТРОЕ СОЗДАНИЕ ТЕСТОВОГО АДМИНА
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== СОЗДАНИЕ ТЕСТОВОГО АДМИНА ===';
  RAISE NOTICE 'Email: admin@test.com';
  RAISE NOTICE 'Password: Admin123!';
  RAISE NOTICE '';
END;
$$;

-- Создать пользователя в auth.users (требует прав суперпользователя)
-- Если этот блок не работает, создайте пользователя через Supabase Dashboard

DO $$
DECLARE
  new_user_id UUID;
  existing_user_id UUID;
BEGIN
  -- Проверить, существует ли уже пользователь
  SELECT id INTO existing_user_id 
  FROM auth.users 
  WHERE email = 'admin@test.com';
  
  IF existing_user_id IS NOT NULL THEN
    RAISE NOTICE 'Пользователь admin@test.com уже существует с ID: %', existing_user_id;
    new_user_id := existing_user_id;
  ELSE
    -- Попытаться создать нового пользователя
    BEGIN
      new_user_id := gen_random_uuid();
      
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        'admin@test.com',
        crypt('Admin123!', gen_salt('bf')),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        '{"role": "admin"}',
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Создан новый пользователь с ID: %', new_user_id;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Не удалось создать пользователя в auth.users';
      RAISE NOTICE 'Создайте пользователя через Supabase Dashboard:';
      RAISE NOTICE '1. Authentication → Users → Add user';
      RAISE NOTICE '2. Email: admin@test.com';
      RAISE NOTICE '3. Password: Admin123!';
      RAISE NOTICE '4. Email confirm: true';
      RAISE NOTICE '';
      RAISE NOTICE 'Затем выполните этот скрипт снова.';
      RETURN;
    END;
  END IF;
  
  -- Создать или обновить профиль пользователя
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
    new_user_id,
    'admin',
    'Test Administrator',
    'admin',
    'Тестовый администратор системы',
    '{"theme": "dark", "language": "ru"}',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    username = 'admin',
    full_name = 'Test Administrator',
    bio = 'Тестовый администратор системы',
    preferences = '{"theme": "dark", "language": "ru"}',
    updated_at = NOW();
  
  RAISE NOTICE 'Профиль админа создан/обновлен для пользователя: %', new_user_id;
END;
$$;

-- =====================================================
-- ПРОВЕРКА СОЗДАННОГО ПОЛЬЗОВАТЕЛЯ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=== ПРОВЕРКА РЕЗУЛЬТАТА ===';
END;
$$;

-- Показать информацию о созданном пользователе
SELECT 
  'ПОЛЬЗОВАТЕЛЬ В AUTH.USERS' as info,
  au.id::text as id,
  au.email as details,
  CASE WHEN au.email_confirmed_at IS NOT NULL THEN 'Подтвержден' ELSE 'Не подтвержден' END as status,
  au.created_at
FROM auth.users au
WHERE au.email = 'admin@test.com'

UNION ALL

SELECT 
  'ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ' as info,
  up.id::text as id,
  up.username as details,
  up.role::text as status,
  up.created_at
FROM public.user_profiles up
WHERE up.id = (SELECT id FROM auth.users WHERE email = 'admin@test.com');

-- =====================================================
-- ИНСТРУКЦИИ ПО ВХОДУ
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'ТЕСТОВЫЙ АДМИН ГОТОВ К ИСПОЛЬЗОВАНИЮ!';
  RAISE NOTICE '=================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'ДАННЫЕ ДЛЯ ВХОДА:';
  RAISE NOTICE 'Email: admin@test.com';
  RAISE NOTICE 'Password: Admin123!';
  RAISE NOTICE '';
  RAISE NOTICE 'ТЕСТ ВХОДА В JAVASCRIPT:';
  RAISE NOTICE 'const { data, error } = await supabase.auth.signInWithPassword({';
  RAISE NOTICE '  email: "admin@test.com",';
  RAISE NOTICE '  password: "Admin123!"';
  RAISE NOTICE '});';
  RAISE NOTICE '';
  RAISE NOTICE 'ПРОВЕРКА РОЛИ:';
  RAISE NOTICE 'const { data: profile } = await supabase';
  RAISE NOTICE '  .from("user_profiles")';
  RAISE NOTICE '  .select("role")';
  RAISE NOTICE '  .eq("id", data.user.id)';
  RAISE NOTICE '  .single();';
  RAISE NOTICE '';
  RAISE NOTICE 'ВАЖНО: Используйте только для тестирования!';
  RAISE NOTICE '';
END;
$$;