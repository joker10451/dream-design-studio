#!/usr/bin/env tsx

/**
 * Тестовый скрипт для демонстрации миграции данных
 * Показывает, как будут преобразованы статичные данные
 */

import { products, categories, brands } from '../src/data/products'

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

// Демонстрация преобразования данных
function demonstrateMigration() {
  console.log('🚀 Демонстрация миграции данных в Supabase...\n')
  
  // Показываем преобразование брендов
  logProgress('Преобразование брендов:', 'info')
  const brandsData = brands.map((brandName, index) => ({
    id: `brand-${index + 1}`,
    name: brandName,
    slug: createSlug(brandName),
    description: `Официальные устройства ${brandName} для умного дома`,
    is_active: true
  }))
  
  console.log('Исходные бренды:', brands)
  console.log('Преобразованные бренды:', brandsData.slice(0, 3))
  console.log(`Всего брендов: ${brandsData.length}\n`)
  
  // Показываем преобразование категорий
  logProgress('Преобразование категорий:', 'info')
  const categoriesData = categories
    .filter(cat => cat.id !== 'all')
    .map((category, index) => ({
      id: `cat-${category.id}`,
      name: category.name,
      slug: category.id,
      description: `Категория ${category.name} - устройства для умного дома`,
      sort_order: index + 1,
      is_active: true
    }))
  
  console.log('Исходные категории:', categories.filter(c => c.id !== 'all'))
  console.log('Преобразованные категории:', categoriesData)
  console.log(`Всего категорий: ${categoriesData.length}\n`)
  
  // Показываем преобразование продуктов
  logProgress('Преобразование продуктов:', 'info')
  const brandMap = new Map(brandsData.map(b => [b.name, b.id]))
  const categoryMap = new Map(categoriesData.map(c => [c.slug, c.id]))
  
  const productsData = products.map(product => {
    const brandId = brandMap.get(product.brand)
    const categoryId = categoryMap.get(product.category)
    
    return {
      id: `prod-${product.id}`,
      name: product.name,
      slug: createSlug(product.name),
      brand_id: brandId,
      category_id: categoryId,
      description: product.description,
      price: product.price,
      old_price: product.oldPrice || null,
      rating: product.rating,
      reviews_count: product.reviewsCount,
      tags: product.tags,
      is_active: true,
      featured: product.rating >= 4.5
    }
  })
  
  console.log('Первый продукт (исходный):')
  console.log({
    id: products[0].id,
    name: products[0].name,
    brand: products[0].brand,
    category: products[0].category,
    price: products[0].price,
    rating: products[0].rating
  })
  
  console.log('\nПервый продукт (преобразованный):')
  console.log(productsData[0])
  console.log(`\nВсего продуктов: ${productsData.length}`)
  
  // Показываем статистику изображений
  logProgress('Анализ изображений:', 'info')
  let totalImages = 0
  let primaryImages = 0
  
  products.forEach(product => {
    totalImages += product.images.length
    primaryImages += product.images.filter(img => img.isPrimary).length
  })
  
  console.log(`Всего изображений: ${totalImages}`)
  console.log(`Основных изображений: ${primaryImages}`)
  
  // Показываем статистику партнерских ссылок
  logProgress('Анализ партнерских ссылок:', 'info')
  let totalLinks = 0
  const marketplaces = new Set<string>()
  
  products.forEach(product => {
    totalLinks += product.affiliateLinks.length
    product.affiliateLinks.forEach(link => {
      marketplaces.add(link.marketplace)
    })
  })
  
  console.log(`Всего партнерских ссылок: ${totalLinks}`)
  console.log(`Маркетплейсы: ${Array.from(marketplaces).join(', ')}`)
  
  // Показываем сводку
  console.log('\n📊 Сводка миграции:')
  console.log(`   • Бренды: ${brandsData.length}`)
  console.log(`   • Категории: ${categoriesData.length}`)
  console.log(`   • Продукты: ${productsData.length}`)
  console.log(`   • Изображения: ${totalImages}`)
  console.log(`   • Партнерские ссылки: ${totalLinks}`)
  console.log(`   • Маркетплейсы: ${marketplaces.size}`)
  
  logProgress('Демонстрация завершена успешно!', 'success')
  console.log('\n💡 Для реальной миграции настройте переменные окружения и запустите:')
  console.log('   npm run migrate-data')
}

// Запускаем демонстрацию
demonstrateMigration()