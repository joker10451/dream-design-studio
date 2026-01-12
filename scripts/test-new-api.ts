#!/usr/bin/env tsx

import 'dotenv/config'
import { productsApi } from '../src/lib/api/products'
import { categoriesApi } from '../src/lib/api/categories'
import { brandsApi } from '../src/lib/api/brands'

async function testNewAPI() {
  console.log('🧪 Тестирование новых API сервисов...\n')
  
  try {
    // Тест 1: Получение продуктов с фильтрацией
    console.log('📦 Тест 1: Получение продуктов с фильтрацией')
    const productsResult = await productsApi.getProductsWithRelations(
      { featured: true }, // только рекомендуемые
      { field: 'rating', direction: 'desc' }, // по рейтингу
      { page: 1, limit: 3 }
    )
    
    if (productsResult.error) {
      console.log('❌ Ошибка:', productsResult.error.message)
    } else {
      console.log(`✅ Найдено ${productsResult.count} продуктов`)
      productsResult.data.forEach(product => {
        console.log(`   • ${product.name} (${product.brands?.name}) - ${product.rating} ★`)
      })
    }
    
    console.log()
    
    // Тест 2: Поиск продуктов
    console.log('🔍 Тест 2: Поиск продуктов по слову "розетка"')
    const searchResult = await productsApi.searchProducts('розетка', {}, 5)
    
    if (searchResult.error) {
      console.log('❌ Ошибка:', searchResult.error.message)
    } else {
      console.log(`✅ Найдено ${searchResult.count} продуктов`)
      searchResult.data.forEach(product => {
        console.log(`   • ${product.name} - ${product.price} ₽`)
      })
    }
    
    console.log()
    
    // Тест 3: Категории с количеством продуктов
    console.log('🏷️ Тест 3: Категории с количеством продуктов')
    const categoriesResult = await categoriesApi.getCategoriesWithProductCount()
    
    if (categoriesResult.error) {
      console.log('❌ Ошибка:', categoriesResult.error.message)
    } else {
      console.log(`✅ Найдено ${categoriesResult.count} категорий`)
      categoriesResult.data.forEach(category => {
        console.log(`   • ${category.name}: ${category.products_count || 0} продуктов`)
      })
    }
    
    console.log()
    
    // Тест 4: Популярные бренды
    console.log('🌟 Тест 4: Популярные бренды')
    const brandsResult = await brandsApi.getPopularBrands(5)
    
    if (brandsResult.error) {
      console.log('❌ Ошибка:', brandsResult.error.message)
    } else {
      console.log(`✅ Найдено ${brandsResult.count} популярных брендов`)
      brandsResult.data.forEach(brand => {
        console.log(`   • ${brand.name}: ${brand.products_count || 0} продуктов`)
      })
    }
    
    console.log()
    
    // Тест 5: Получение продукта по slug
    console.log('🔗 Тест 5: Получение продукта по slug')
    const productResult = await productsApi.getProductBySlug('яндекс-розетка')
    
    if (productResult.error) {
      console.log('❌ Ошибка:', productResult.error.message)
    } else if (productResult.data) {
      const product = productResult.data
      console.log(`✅ Найден продукт: ${product.name}`)
      console.log(`   • Бренд: ${product.brands?.name}`)
      console.log(`   • Категория: ${product.categories?.name}`)
      console.log(`   • Цена: ${product.price} ₽`)
      console.log(`   • Рейтинг: ${product.rating} ★`)
      console.log(`   • Изображений: ${product.product_images?.length || 0}`)
      console.log(`   • Партнерских ссылок: ${product.affiliate_links?.length || 0}`)
    } else {
      console.log('⚠️ Продукт не найден')
    }
    
    console.log('\n🎉 Все тесты новых API сервисов завершены!')
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
  }
}

testNewAPI()