#!/usr/bin/env tsx

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения для Supabase')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabase() {
  console.log('🔍 Проверяем состояние базы данных...\n')
  
  try {
    // Проверяем бренды
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name')
      .limit(10)
    
    if (brandsError) {
      console.log('❌ Ошибка при получении брендов:', brandsError.message)
    } else {
      console.log(`📊 Брендов в базе: ${brands?.length || 0}`)
      if (brands && brands.length > 0) {
        console.log('   Примеры:', brands.map(b => b.name).join(', '))
      }
    }
    
    // Проверяем категории
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(10)
    
    if (categoriesError) {
      console.log('❌ Ошибка при получении категорий:', categoriesError.message)
    } else {
      console.log(`📊 Категорий в базе: ${categories?.length || 0}`)
      if (categories && categories.length > 0) {
        console.log('   Примеры:', categories.map(c => c.name).join(', '))
      }
    }
    
    // Проверяем продукты
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name')
      .limit(10)
    
    if (productsError) {
      console.log('❌ Ошибка при получении продуктов:', productsError.message)
    } else {
      console.log(`📊 Продуктов в базе: ${products?.length || 0}`)
      if (products && products.length > 0) {
        console.log('   Примеры:', products.map(p => p.name).join(', '))
      }
    }
    
    // Проверяем системные настройки
    const { data: settings, error: settingsError } = await supabase
      .from('system_settings')
      .select('key, value')
      .limit(10)
    
    if (settingsError) {
      console.log('❌ Ошибка при получении настроек:', settingsError.message)
    } else {
      console.log(`📊 Настроек в базе: ${settings?.length || 0}`)
      if (settings && settings.length > 0) {
        console.log('   Примеры:', settings.map(s => `${s.key}: ${s.value}`).join(', '))
      }
    }
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
  }
}

checkDatabase()