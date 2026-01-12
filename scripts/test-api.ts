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

async function testAPI() {
  console.log('🧪 Тестирование API интеграции...\n')
  
  try {
    // Тест 1: Загрузка продуктов с связанными данными
    console.log('📦 Тест 1: Загрузка продуктов с связанными данными')
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        description,
        price,
        rating,
        brands:brand_id (name),
        categories:category_id (name),
        product_images (url, alt_text, is_primary),
        affiliate_links (marketplace, price, is_available)
      `)
      .eq('is_active', true)
      .limit(5)
    
    if (productsError) {
      console.log('❌ Ошибка загрузки продуктов:', productsError.message)
    } else {
      console.log(`✅ Загружено ${products?.length || 0} продуктов`)
      products?.forEach(product => {
        console.log(`   • ${product.name} (${product.brands?.name}) - ${product.price} ₽`)
        console.log(`     Изображений: ${product.product_images?.length || 0}, Партн. ссылок: ${product.affiliate_links?.length || 0}`)
      })
    }
    
    console.log()
    
    // Тест 2: Поиск продуктов по категории
    console.log('🔍 Тест 2: Поиск продуктов по категории "sockets"')
    const { data: socketProducts, error: searchError } = await supabase
      .from('products')
      .select(`
        name,
        price,
        categories!inner (name, slug)
      `)
      .eq('categories.slug', 'sockets')
      .eq('is_active', true)
    
    if (searchError) {
      console.log('❌ Ошибка поиска:', searchError.message)
    } else {
      console.log(`✅ Найдено ${socketProducts?.length || 0} продуктов в категории "Умные розетки"`)
      socketProducts?.forEach(product => {
        console.log(`   • ${product.name} - ${product.price} ₽`)
      })
    }
    
    console.log()
    
    // Тест 3: Загрузка брендов с количеством продуктов
    console.log('🏷️ Тест 3: Загрузка брендов с количеством продуктов')
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select(`
        name,
        slug,
        products (id)
      `)
      .eq('is_active', true)
    
    if (brandsError) {
      console.log('❌ Ошибка загрузки брендов:', brandsError.message)
    } else {
      console.log(`✅ Загружено ${brands?.length || 0} брендов`)
      brands?.forEach(brand => {
        const productCount = brand.products?.length || 0
        console.log(`   • ${brand.name}: ${productCount} продуктов`)
      })
    }
    
    console.log()
    
    // Тест 4: Проверка партнерских ссылок
    console.log('🔗 Тест 4: Проверка партнерских ссылок')
    const { data: affiliateLinks, error: linksError } = await supabase
      .from('affiliate_links')
      .select(`
        marketplace,
        price,
        is_available,
        products (name)
      `)
      .eq('is_available', true)
      .limit(10)
    
    if (linksError) {
      console.log('❌ Ошибка загрузки партнерских ссылок:', linksError.message)
    } else {
      console.log(`✅ Найдено ${affiliateLinks?.length || 0} активных партнерских ссылок`)
      affiliateLinks?.forEach(link => {
        console.log(`   • ${link.products?.name}: ${link.marketplace} - ${link.price} ₽`)
      })
    }
    
    console.log('\n🎉 Все тесты API завершены!')
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
  }
}

testAPI()