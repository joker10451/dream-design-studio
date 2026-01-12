// Утилита для тестирования подключения к Supabase
import { supabase } from './client'

export interface ConnectionTestResult {
  success: boolean
  message: string
  details?: any
  timestamp: string
}

export async function testSupabaseConnection(): Promise<ConnectionTestResult> {
  const timestamp = new Date().toISOString()
  
  try {
    // Тест 1: Проверка базового подключения
    const { data: healthCheck, error: healthError } = await supabase
      .from('system_settings')
      .select('count')
      .limit(1)

    if (healthError) {
      return {
        success: false,
        message: `Ошибка подключения к базе данных: ${healthError.message}`,
        details: healthError,
        timestamp
      }
    }

    // Тест 2: Проверка аутентификации
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError && authError.message !== 'Auth session missing!') {
      return {
        success: false,
        message: `Ошибка аутентификации: ${authError.message}`,
        details: authError,
        timestamp
      }
    }

    // Тест 3: Проверка доступа к публичным данным
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5)

    if (categoriesError) {
      return {
        success: false,
        message: `Ошибка доступа к данным: ${categoriesError.message}`,
        details: categoriesError,
        timestamp
      }
    }

    // Тест 4: Проверка доступа к продуктам
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, is_active')
      .eq('is_active', true)
      .limit(5)

    if (productsError) {
      return {
        success: false,
        message: `Ошибка доступа к продуктам: ${productsError.message}`,
        details: productsError,
        timestamp
      }
    }

    return {
      success: true,
      message: `Подключение к Supabase успешно! Найдено ${categories?.length || 0} категорий и ${products?.length || 0} продуктов.`,
      details: {
        user: user ? { id: user.id, email: user.email } : null,
        categoriesCount: categories?.length || 0,
        productsCount: products?.length || 0,
        environment: {
          url: import.meta.env.VITE_SUPABASE_URL,
          hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      },
      timestamp
    }

  } catch (error) {
    return {
      success: false,
      message: `Неожиданная ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      details: error,
      timestamp
    }
  }
}

export async function testDatabaseTables(): Promise<ConnectionTestResult> {
  const timestamp = new Date().toISOString()
  
  try {
    const requiredTables = [
      'categories',
      'brands', 
      'products',
      'user_profiles',
      'articles',
      'system_settings'
    ]

    const results = []

    for (const table of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1)

        results.push({
          table,
          accessible: !error,
          error: error?.message || null
        })
      } catch (err) {
        results.push({
          table,
          accessible: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        })
      }
    }

    const accessibleTables = results.filter(r => r.accessible)
    const inaccessibleTables = results.filter(r => !r.accessible)

    if (inaccessibleTables.length > 0) {
      return {
        success: false,
        message: `Некоторые таблицы недоступны: ${inaccessibleTables.map(t => t.table).join(', ')}`,
        details: { results, accessibleTables: accessibleTables.length, inaccessibleTables: inaccessibleTables.length },
        timestamp
      }
    }

    return {
      success: true,
      message: `Все ${requiredTables.length} основных таблиц доступны`,
      details: { results, accessibleTables: accessibleTables.length },
      timestamp
    }

  } catch (error) {
    return {
      success: false,
      message: `Ошибка при проверке таблиц: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`,
      details: error,
      timestamp
    }
  }
}

// Функция для логирования результатов тестирования
export function logConnectionTest(result: ConnectionTestResult) {
  const emoji = result.success ? '✅' : '❌'
  console.log(`${emoji} Supabase Connection Test - ${result.timestamp}`)
  console.log(`Message: ${result.message}`)
  
  if (result.details) {
    console.log('Details:', result.details)
  }
  
  if (!result.success) {
    console.error('Connection test failed:', result)
  }
}