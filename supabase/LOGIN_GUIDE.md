# Как войти в админ аккаунт

## Обзор

После создания админ пользователя через скрипт `create_admin_user.sql`, есть несколько способов войти в систему в зависимости от того, как был создан аккаунт.

## Способ 1: Вход через существующего пользователя

Если скрипт обновил существующего пользователя до админа:

### В Supabase Dashboard:
1. Откройте **Authentication → Users**
2. Найдите пользователя с ролью админ
3. Посмотрите его **email** и **статус**

### Для входа в приложение:
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'email-пользователя@example.com',
  password: 'пароль-пользователя'
});
```

## Способ 2: Создание нового пользователя через Auth UI

### Создание через Supabase Dashboard:

1. **Откройте Supabase Dashboard**
2. **Authentication → Users → Add user**
3. **Заполните данные**:
   ```
   Email: admin@test.com
   Password: Admin123!
   Email confirm: true (отметить галочку)
   ```
4. **Нажмите "Create user"**
5. **Выполните скрипт** `create_admin_user.sql` - он обновит этого пользователя до админа

### Для входа:
```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'Admin123!'
});
```

## Способ 3: Программное создание пользователя

Создайте SQL скрипт для создания пользователя с паролем:

```sql
-- ВНИМАНИЕ: Выполняйте только в Supabase SQL Editor с правами админа
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@test.com',
  crypt('Admin123!', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

## Способ 4: Использование Supabase CLI

Если у вас установлен Supabase CLI:

```bash
# Создать пользователя
supabase auth users create admin@test.com --password Admin123!

# Или через интерактивный режим
supabase auth users create
```

## Проверка входа

### 1. Проверьте созданного пользователя:
```sql
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  up.username,
  up.role
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC;
```

### 2. Тестовый вход через JavaScript:
```javascript
// В консоли браузера или в приложении
const testLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@test.com',
    password: 'Admin123!'
  });
  
  if (error) {
    console.error('Ошибка входа:', error.message);
  } else {
    console.log('Успешный вход:', data.user);
    console.log('Роль пользователя:', data.user.user_metadata?.role);
  }
};

testLogin();
```

### 3. Проверка роли после входа:
```javascript
// Получить текущего пользователя
const { data: { user } } = await supabase.auth.getUser();

// Получить профиль с ролью
const { data: profile } = await supabase
  .from('user_profiles')
  .select('*')
  .eq('id', user.id)
  .single();

console.log('Роль пользователя:', profile.role);
```

## Troubleshooting

### Проблема: "Invalid login credentials"
**Возможные причины:**
1. Неправильный email или пароль
2. Email не подтвержден
3. Пользователь не существует в `auth.users`

**Решение:**
```sql
-- Проверить пользователя
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'admin@test.com';

-- Подтвердить email если нужно
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'admin@test.com' AND email_confirmed_at IS NULL;
```

### Проблема: Пользователь входит, но роль не админ
**Решение:**
```sql
-- Проверить профиль
SELECT * FROM user_profiles WHERE id = (
  SELECT id FROM auth.users WHERE email = 'admin@test.com'
);

-- Обновить роль
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@test.com');
```

### Проблема: Нет доступа к админ функциям
**Решение:**
```sql
-- Проверить функции ролей
SELECT public.user_role() as current_role;
SELECT public.is_admin() as is_admin;

-- Если функции не работают, пересоздать их
-- (выполните соответствующую часть из apply_migrations.sql)
```

## Рекомендуемый процесс

1. **Создайте пользователя через Supabase Dashboard**
2. **Выполните `create_admin_user.sql`**
3. **Проверьте роль в базе данных**
4. **Войдите через приложение**
5. **Протестируйте админ функции**

## Пример полного процесса

```bash
# 1. В Supabase Dashboard создать пользователя admin@test.com

# 2. Выполнить SQL скрипт
# create_admin_user.sql

# 3. Проверить в консоли браузера
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@test.com',
  password: 'Admin123!'
});

# 4. Проверить роль
const { data: profile } = await supabase
  .from('user_profiles')
  .select('role')
  .eq('id', data.user.id)
  .single();

console.log('Роль:', profile.role); // Должно быть 'admin'
```

Этот процесс гарантирует, что у вас будет рабочий админ аккаунт для тестирования системы!