#!/usr/bin/env tsx

/**
 * Скрипт для миграции статичных данных в Supabase
 * Запуск: npm run migrate-data
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import type { Database } from '../src/lib/supabase/database.types'
import { products, categories, brands } from '../src/data/products'
// import { ARTICLE_CATEGORIES, AUTHORS, COMMON_TAGS } from '../src/data/content'

// Настройка Supabase клиента
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения для Supabase')
  console.error('Необходимы: VITE_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Утилиты для миграции
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-zа-я0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const logProgress = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const icons = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }
  console.log(`${icons[type]} ${message}`)
}

// Функция для очистки существующих данных (опционально)
async function clearExistingData() {
  logProgress('Очистка существующих данных...', 'warning')
  
  try {
    // Очищаем в правильном порядке (учитывая foreign keys)
    await supabase.from('affiliate_links').delete().neq('id', '')
    await supabase.from('product_images').delete().neq('id', '')
    await supabase.from('products').delete().neq('id', '')
    await supabase.from('categories').delete().neq('id', '')
    await supabase.from('brands').delete().neq('id', '')
    
    logProgress('Существующие данные очищены', 'success')
  } catch (error) {
    logProgress(`Ошибка при очистке данных: ${error}`, 'error')
  }
}

// Миграция брендов
async function migrateBrands() {
  logProgress('Миграция брендов...', 'info')
  
  // Сначала проверяем, какие бренды уже существуют
  const { data: existingBrands } = await supabase
    .from('brands')
    .select('name, id')
  
  const existingBrandNames = new Set(existingBrands?.map(b => b.name) || [])
  
  // Фильтруем только новые бренды
  const newBrands = brands.filter(brandName => !existingBrandNames.has(brandName))
  
  if (newBrands.length === 0) {
    logProgress('Все бренды уже существуют в базе', 'info')
    return existingBrands || []
  }
  
  const brandsData = newBrands.map((brandName) => ({
    id: randomUUID(),
    name: brandName,
    slug: createSlug(brandName),
    description: `Официальные устройства ${brandName} для умного дома`,
    logo_url: null,
    website_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
  
  const { data, error } = await supabase
    .from('brands')
    .insert(brandsData)
    .select()
  
  if (error) {
    logProgress(`Ошибка миграции брендов: ${error.message}`, 'error')
    return null
  }
  
  logProgress(`Добавлено ${data.length} новых брендов`, 'success')
  
  // Возвращаем все бренды (существующие + новые)
  const { data: allBrands } = await supabase
    .from('brands')
    .select('*')
  
  return allBrands || []
}

// Миграция категорий
async function migrateCategories() {
  logProgress('Миграция категорий...', 'info')
  
  // Проверяем существующие категории
  const { data: existingCategories } = await supabase
    .from('categories')
    .select('slug, id, name')
  
  const existingSlugs = new Set(existingCategories?.map(c => c.slug) || [])
  
  const categoriesToMigrate = categories
    .filter(cat => cat.id !== 'all') // Исключаем "Все категории"
    .filter(cat => !existingSlugs.has(cat.id)) // Исключаем уже существующие
  
  if (categoriesToMigrate.length === 0) {
    logProgress('Все категории уже существуют в базе', 'info')
    return existingCategories || []
  }
  
  const categoriesData = categoriesToMigrate.map((category) => ({
    id: randomUUID(),
    name: category.name,
    slug: category.id,
    description: `Категория ${category.name} - устройства для умного дома`,
    parent_id: null,
    sort_order: categories.indexOf(category),
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }))
  
  const { data, error } = await supabase
    .from('categories')
    .insert(categoriesData)
    .select()
  
  if (error) {
    logProgress(`Ошибка миграции категорий: ${error.message}`, 'error')
    return null
  }
  
  logProgress(`Добавлено ${data.length} новых категорий`, 'success')
  
  // Возвращаем все категории
  const { data: allCategories } = await supabase
    .from('categories')
    .select('*')
  
  return allCategories || []
}

// Миграция продуктов
async function migrateProducts(migratedBrands: any[], migratedCategories: any[]) {
  logProgress('Миграция продуктов...', 'info')
  
  // Создаем мапы для поиска ID
  const brandMap = new Map(migratedBrands.map(b => [b.name, b.id]))
  const categoryMap = new Map(migratedCategories.map(c => [c.slug, c.id]))
  
  const productsData = products.map(product => {
    const brandId = brandMap.get(product.brand)
    const categoryId = categoryMap.get(product.category)
    
    return {
      id: randomUUID(),
      name: product.name,
      slug: createSlug(product.name),
      brand_id: brandId || null,
      category_id: categoryId || null,
      description: product.description,
      full_description: product.fullDescription,
      price: product.price,
      old_price: product.oldPrice || null,
      rating: product.rating,
      reviews_count: product.reviewsCount,
      specs: {
        protocol: product.specs.protocol,
        power: product.specs.power,
        dimensions: product.specs.dimensions,
        weight: product.specs.weight,
        compatibility: product.specs.compatibility,
        features: product.specs.features,
        warranty: product.specs.warranty,
        certifications: product.specs.certifications
      },
      tags: product.tags,
      seo_meta: {
        title: product.seoMeta.title,
        description: product.seoMeta.description,
        keywords: product.seoMeta.keywords,
        og_image: product.seoMeta.ogImage
      },
      is_active: true,
      featured: product.rating >= 4.5, // Помечаем как featured продукты с высоким рейтингом
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
      updated_by: null
    }
  })
  
  const { data, error } = await supabase
    .from('products')
    .insert(productsData)
    .select()
  
  if (error) {
    logProgress(`Ошибка миграции продуктов: ${error.message}`, 'error')
    return null
  }
  
  logProgress(`Мигрировано ${data.length} продуктов`, 'success')
  return data
}

// Миграция изображений продуктов
async function migrateProductImages(migratedProducts: any[]) {
  logProgress('Миграция изображений продуктов...', 'info')
  
  const productMap = new Map(migratedProducts.map(p => [p.slug, p.id]))
  const imagesData: any[] = []
  
  products.forEach(product => {
    const productId = productMap.get(createSlug(product.name))
    if (!productId) return
    
    product.images.forEach((image, index) => {
      imagesData.push({
        id: randomUUID(),
        product_id: productId,
        url: image.url,
        alt_text: image.alt,
        is_primary: image.isPrimary,
        sort_order: index + 1,
        created_at: new Date().toISOString()
      })
    })
  })
  
  if (imagesData.length === 0) {
    logProgress('Нет изображений для миграции', 'warning')
    return []
  }
  
  const { data, error } = await supabase
    .from('product_images')
    .insert(imagesData)
    .select()
  
  if (error) {
    logProgress(`Ошибка миграции изображений: ${error.message}`, 'error')
    return null
  }
  
  logProgress(`Мигрировано ${data.length} изображений`, 'success')
  return data
}

// Миграция партнерских ссылок
async function migrateAffiliateLinks(migratedProducts: any[]) {
  logProgress('Миграция партнерских ссылок...', 'info')
  
  const productMap = new Map(migratedProducts.map(p => [p.slug, p.id]))
  const linksData: any[] = []
  
  products.forEach(product => {
    const productId = productMap.get(createSlug(product.name))
    if (!productId) return
    
    product.affiliateLinks.forEach(link => {
      linksData.push({
        id: randomUUID(),
        product_id: productId,
        marketplace: link.marketplace,
        url: link.url,
        price: link.price,
        old_price: null,
        is_available: link.isAvailable,
        tracking_params: link.trackingParams,
        last_updated: link.lastUpdated.toISOString(),
        created_at: new Date().toISOString()
      })
    })
  })
  
  if (linksData.length === 0) {
    logProgress('Нет партнерских ссылок для миграции', 'warning')
    return []
  }
  
  const { data, error } = await supabase
    .from('affiliate_links')
    .insert(linksData)
    .select()
  
  if (error) {
    logProgress(`Ошибка миграции партнерских ссылок: ${error.message}`, 'error')
    return null
  }
  
  logProgress(`Мигрировано ${data.length} партнерских ссылок`, 'success')
  return data
}

// Миграция системных настроек
async function migrateSystemSettings() {
  logProgress('Миграция системных настроек...', 'info')
  
  const settingsData = [
    {
      id: randomUUID(),
      key: 'site_title',
      value: 'Smart Home 2026',
      description: 'Название сайта',
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: randomUUID(),
      key: 'site_description',
      value: 'Лучший портал об умном доме в России',
      description: 'Описание сайта',
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: randomUUID(),
      key: 'products_per_page',
      value: 20,
      description: 'Количество продуктов на странице',
      is_public: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: randomUUID(),
      key: 'enable_analytics',
      value: true,
      description: 'Включить аналитику',
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]
  
  const { data, error } = await supabase
    .from('system_settings')
    .insert(settingsData)
    .select()
  
  if (error) {
    logProgress(`Ошибка миграции настроек: ${error.message}`, 'error')
    return null
  }
  
  logProgress(`Мигрировано ${data.length} системных настроек`, 'success')
  return data
}

// Основная функция миграции
async function main() {
  console.log('🚀 Начинаем миграцию данных в Supabase...\n')
  
  try {
    // Проверяем подключение
    const { data: healthCheck, error: healthError } = await supabase
      .from('system_settings')
      .select('count')
      .limit(1)
    
    if (healthError) {
      logProgress(`Ошибка подключения к Supabase: ${healthError.message}`, 'error')
      process.exit(1)
    }
    
    logProgress('Подключение к Supabase успешно', 'success')
    
    // Опционально очищаем существующие данные
    const shouldClear = process.argv.includes('--clear')
    if (shouldClear) {
      await clearExistingData()
    }
    
    // Выполняем миграцию в правильном порядке
    const migratedBrands = await migrateBrands()
    if (!migratedBrands) {
      logProgress('Миграция прервана из-за ошибки с брендами', 'error')
      process.exit(1)
    }
    
    const migratedCategories = await migrateCategories()
    if (!migratedCategories) {
      logProgress('Миграция прервана из-за ошибки с категориями', 'error')
      process.exit(1)
    }
    
    const migratedProducts = await migrateProducts(migratedBrands, migratedCategories)
    if (!migratedProducts) {
      logProgress('Миграция прервана из-за ошибки с продуктами', 'error')
      process.exit(1)
    }
    
    await migrateProductImages(migratedProducts)
    await migrateAffiliateLinks(migratedProducts)
    await migrateSystemSettings()
    
    console.log('\n🎉 Миграция данных завершена успешно!')
    console.log('\n📊 Сводка:')
    console.log(`   • Бренды: ${migratedBrands.length}`)
    console.log(`   • Категории: ${migratedCategories.length}`)
    console.log(`   • Продукты: ${migratedProducts.length}`)
    console.log('\n💡 Теперь вы можете протестировать интеграцию на странице /supabase-test')
    
  } catch (error) {
    logProgress(`Критическая ошибка: ${error}`, 'error')
    process.exit(1)
  }
}

// Запускаем миграцию
main().catch(console.error)