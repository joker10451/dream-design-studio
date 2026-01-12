#!/usr/bin/env tsx

/**
 * Скрипт для импорта продуктов из внешних источников
 * Запуск: npm run import-products
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/supabase/database.types'
import fs from 'fs/promises'
import path from 'path'

// Настройка Supabase клиента
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

let supabase: any = null

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)
} else if (process.argv.includes('--create-examples')) {
  // Для создания примеров Supabase не нужен
  console.log('⚠️ Supabase не настроен, но это нормально для создания примеров')
} else {
  console.error('❌ Отсутствуют переменные окружения для Supabase')
  process.exit(1)
}

// Интерфейс для импорта продуктов
interface ImportProduct {
  name: string
  brand: string
  category: string
  price?: number
  oldPrice?: number
  description: string
  fullDescription?: string
  imageUrl?: string
  specs?: Record<string, any>
  tags?: string[]
  affiliateLinks?: Array<{
    marketplace: string
    url: string
    price?: number
  }>
}

// Утилиты
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

// Функция для получения или создания бренда
async function getOrCreateBrand(brandName: string) {
  // Сначала пытаемся найти существующий бренд
  const { data: existingBrand } = await supabase
    .from('brands')
    .select('id')
    .eq('name', brandName)
    .single()
  
  if (existingBrand) {
    return existingBrand.id
  }
  
  // Создаем новый бренд
  const { data: newBrand, error } = await supabase
    .from('brands')
    .insert({
      name: brandName,
      slug: createSlug(brandName),
      description: `Устройства ${brandName} для умного дома`,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single()
  
  if (error) {
    logProgress(`Ошибка создания бренда ${brandName}: ${error.message}`, 'error')
    return null
  }
  
  logProgress(`Создан новый бренд: ${brandName}`, 'success')
  return newBrand.id
}

// Функция для получения или создания категории
async function getOrCreateCategory(categoryName: string) {
  const categorySlug = createSlug(categoryName)
  
  // Сначала пытаемся найти существующую категорию
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()
  
  if (existingCategory) {
    return existingCategory.id
  }
  
  // Создаем новую категорию
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name: categoryName,
      slug: categorySlug,
      description: `Категория ${categoryName}`,
      sort_order: 999, // Новые категории в конец
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select('id')
    .single()
  
  if (error) {
    logProgress(`Ошибка создания категории ${categoryName}: ${error.message}`, 'error')
    return null
  }
  
  logProgress(`Создана новая категория: ${categoryName}`, 'success')
  return newCategory.id
}

// Функция для импорта одного продукта
async function importProduct(productData: ImportProduct) {
  try {
    // Получаем или создаем бренд и категорию
    const brandId = await getOrCreateBrand(productData.brand)
    const categoryId = await getOrCreateCategory(productData.category)
    
    if (!brandId || !categoryId) {
      logProgress(`Не удалось создать бренд или категорию для ${productData.name}`, 'error')
      return false
    }
    
    // Создаем продукт
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        slug: createSlug(productData.name),
        brand_id: brandId,
        category_id: categoryId,
        description: productData.description,
        full_description: productData.fullDescription || productData.description,
        price: productData.price || null,
        old_price: productData.oldPrice || null,
        rating: 0, // Начальный рейтинг
        reviews_count: 0,
        specs: productData.specs || {},
        tags: productData.tags || [],
        seo_meta: {
          title: `${productData.name} - Smart Home 2026`,
          description: productData.description,
          keywords: [productData.name, productData.brand, productData.category, 'умный дом']
        },
        is_active: true,
        featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id')
      .single()
    
    if (productError) {
      logProgress(`Ошибка создания продукта ${productData.name}: ${productError.message}`, 'error')
      return false
    }
    
    // Добавляем изображение, если есть
    if (productData.imageUrl && product) {
      await supabase
        .from('product_images')
        .insert({
          product_id: product.id,
          url: productData.imageUrl,
          alt_text: productData.name,
          is_primary: true,
          sort_order: 1,
          created_at: new Date().toISOString()
        })
    }
    
    // Добавляем партнерские ссылки, если есть
    if (productData.affiliateLinks && productData.affiliateLinks.length > 0 && product) {
      const affiliateLinksData = productData.affiliateLinks.map((link, index) => ({
        product_id: product.id,
        marketplace: link.marketplace,
        url: link.url,
        price: link.price || null,
        old_price: null,
        is_available: true,
        tracking_params: {},
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString()
      }))
      
      await supabase
        .from('affiliate_links')
        .insert(affiliateLinksData)
    }
    
    logProgress(`Импортирован продукт: ${productData.name}`, 'success')
    return true
    
  } catch (error) {
    logProgress(`Ошибка импорта продукта ${productData.name}: ${error}`, 'error')
    return false
  }
}

// Функция для импорта из JSON файла
async function importFromJSON(filePath: string) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const products: ImportProduct[] = JSON.parse(fileContent)
    
    logProgress(`Найдено ${products.length} продуктов для импорта`, 'info')
    
    let successCount = 0
    let errorCount = 0
    
    for (const product of products) {
      const success = await importProduct(product)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
    }
    
    logProgress(`Импорт завершен. Успешно: ${successCount}, Ошибок: ${errorCount}`, 'success')
    
  } catch (error) {
    logProgress(`Ошибка чтения файла ${filePath}: ${error}`, 'error')
  }
}

// Функция для импорта из CSV файла
async function importFromCSV(filePath: string) {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8')
    const lines = fileContent.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    logProgress(`Найдено ${lines.length - 1} строк для импорта`, 'info')
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const productData: ImportProduct = {
        name: '',
        brand: '',
        category: '',
        description: ''
      }
      
      // Маппинг CSV колонок
      headers.forEach((header, index) => {
        const value = values[index]
        switch (header.toLowerCase()) {
          case 'name':
          case 'название':
            productData.name = value
            break
          case 'brand':
          case 'бренд':
            productData.brand = value
            break
          case 'category':
          case 'категория':
            productData.category = value
            break
          case 'price':
          case 'цена':
            productData.price = parseFloat(value) || undefined
            break
          case 'old_price':
          case 'старая_цена':
            productData.oldPrice = parseFloat(value) || undefined
            break
          case 'description':
          case 'описание':
            productData.description = value
            break
          case 'image_url':
          case 'изображение':
            productData.imageUrl = value
            break
        }
      })
      
      if (!productData.name || !productData.brand || !productData.category) {
        logProgress(`Пропущена строка ${i}: отсутствуют обязательные поля`, 'warning')
        continue
      }
      
      const success = await importProduct(productData)
      if (success) {
        successCount++
      } else {
        errorCount++
      }
    }
    
    logProgress(`Импорт завершен. Успешно: ${successCount}, Ошибок: ${errorCount}`, 'success')
    
  } catch (error) {
    logProgress(`Ошибка чтения CSV файла ${filePath}: ${error}`, 'error')
  }
}

// Создание примера файла для импорта
async function createExampleFiles() {
  const exampleJSON: ImportProduct[] = [
    {
      name: "Пример умной розетки",
      brand: "Пример Бренд",
      category: "Умные розетки",
      price: 1500,
      oldPrice: 2000,
      description: "Пример описания умной розетки",
      fullDescription: "Подробное описание умной розетки с функциями...",
      imageUrl: "https://example.com/image.jpg",
      specs: {
        protocol: ["WiFi"],
        power: "16A"
      },
      tags: ["умная розетка", "wifi"],
      affiliateLinks: [
        {
          marketplace: "wildberries",
          url: "https://wildberries.ru/example",
          price: 1500
        }
      ]
    }
  ]
  
  const exampleCSV = `name,brand,category,price,old_price,description,image_url
Пример умной розетки,Пример Бренд,Умные розетки,1500,2000,Пример описания умной розетки,https://example.com/image.jpg`
  
  await fs.writeFile('example-products.json', JSON.stringify(exampleJSON, null, 2))
  await fs.writeFile('example-products.csv', exampleCSV)
  
  logProgress('Созданы примеры файлов: example-products.json и example-products.csv', 'success')
}

// Основная функция
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('📦 Импорт продуктов в Supabase')
    console.log('\nИспользование:')
    console.log('  npm run import-products <файл.json>')
    console.log('  npm run import-products <файл.csv>')
    console.log('  npm run import-products --create-examples')
    console.log('\nПримеры:')
    console.log('  npm run import-products products.json')
    console.log('  npm run import-products products.csv')
    console.log('  npm run import-products --create-examples')
    return
  }
  
  if (args[0] === '--create-examples') {
    await createExampleFiles()
    return
  }
  
  const filePath = args[0]
  
  try {
    await fs.access(filePath)
  } catch {
    logProgress(`Файл ${filePath} не найден`, 'error')
    return
  }
  
  // Проверяем подключение к Supabase
  const { error: healthError } = await supabase
    .from('system_settings')
    .select('count')
    .limit(1)
  
  if (healthError) {
    logProgress(`Ошибка подключения к Supabase: ${healthError.message}`, 'error')
    return
  }
  
  logProgress('Подключение к Supabase успешно', 'success')
  
  // Определяем тип файла и импортируем
  if (filePath.endsWith('.json')) {
    await importFromJSON(filePath)
  } else if (filePath.endsWith('.csv')) {
    await importFromCSV(filePath)
  } else {
    logProgress('Поддерживаются только файлы .json и .csv', 'error')
  }
}

// Запускаем импорт
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}