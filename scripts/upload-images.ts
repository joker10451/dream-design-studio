#!/usr/bin/env tsx

/**
 * Скрипт для загрузки изображений в Supabase Storage
 * Запуск: npm run upload-images
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/supabase/database.types'
import fs from 'fs/promises'
import path from 'path'
import fetch from 'node-fetch'

// Настройка Supabase клиента
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Отсутствуют переменные окружения для Supabase')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

// Конфигурация
const BUCKETS = {
  PRODUCTS: 'product-images',
  ARTICLES: 'article-images',
  BRANDS: 'brand-logos',
  GENERAL: 'general-images'
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Утилиты
const logProgress = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
  const icons = {
    info: '📝',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }
  console.log(`${icons[type]} ${message}`)
}

const generateFileName = (originalName: string, prefix?: string): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName).toLowerCase()
  const baseName = path.basename(originalName, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 30)
  
  return prefix 
    ? `${prefix}/${timestamp}-${random}-${baseName}${ext}`
    : `${timestamp}-${random}-${baseName}${ext}`
}

// Создание buckets если они не существуют
async function createBucketsIfNotExist() {
  logProgress('Проверка и создание buckets...', 'info')
  
  const { data: existingBuckets } = await supabase.storage.listBuckets()
  const existingBucketNames = existingBuckets?.map(b => b.name) || []
  
  for (const [key, bucketName] of Object.entries(BUCKETS)) {
    if (!existingBucketNames.includes(bucketName)) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: MAX_FILE_SIZE
      })
      
      if (error) {
        logProgress(`Ошибка создания bucket ${bucketName}: ${error.message}`, 'error')
      } else {
        logProgress(`Создан bucket: ${bucketName}`, 'success')
      }
    }
  }
}

// Загрузка файла в Storage
async function uploadFile(
  filePath: string, 
  bucket: string, 
  storagePath?: string
): Promise<string | null> {
  try {
    const fileBuffer = await fs.readFile(filePath)
    const fileName = storagePath || generateFileName(path.basename(filePath))
    
    // Проверяем размер файла
    if (fileBuffer.length > MAX_FILE_SIZE) {
      logProgress(`Файл ${filePath} слишком большой (${Math.round(fileBuffer.length / 1024 / 1024)}MB)`, 'error')
      return null
    }
    
    // Проверяем расширение
    const ext = path.extname(filePath).toLowerCase()
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      logProgress(`Неподдерживаемый формат файла: ${ext}`, 'error')
      return null
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, fileBuffer, {
        contentType: `image/${ext.substring(1)}`,
        upsert: true
      })
    
    if (error) {
      logProgress(`Ошибка загрузки ${filePath}: ${error.message}`, 'error')
      return null
    }
    
    // Получаем публичный URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    logProgress(`Загружен: ${path.basename(filePath)} → ${publicUrlData.publicUrl}`, 'success')
    return publicUrlData.publicUrl
    
  } catch (error) {
    logProgress(`Ошибка загрузки файла ${filePath}: ${error}`, 'error')
    return null
  }
}

// Загрузка изображения по URL
async function uploadFromUrl(
  imageUrl: string, 
  bucket: string, 
  storagePath?: string
): Promise<string | null> {
  try {
    logProgress(`Загружаем изображение с URL: ${imageUrl}`, 'info')
    
    const response = await fetch(imageUrl)
    if (!response.ok) {
      logProgress(`Ошибка загрузки URL ${imageUrl}: ${response.statusText}`, 'error')
      return null
    }
    
    const buffer = await response.buffer()
    
    // Проверяем размер
    if (buffer.length > MAX_FILE_SIZE) {
      logProgress(`Изображение по URL ${imageUrl} слишком большое`, 'error')
      return null
    }
    
    // Определяем расширение из Content-Type или URL
    const contentType = response.headers.get('content-type')
    let ext = '.jpg'
    if (contentType?.includes('png')) ext = '.png'
    else if (contentType?.includes('webp')) ext = '.webp'
    else if (contentType?.includes('gif')) ext = '.gif'
    
    const fileName = storagePath || generateFileName(`image${ext}`)
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: contentType || 'image/jpeg',
        upsert: true
      })
    
    if (error) {
      logProgress(`Ошибка загрузки URL ${imageUrl}: ${error.message}`, 'error')
      return null
    }
    
    // Получаем публичный URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName)
    
    logProgress(`Загружено с URL: ${imageUrl} → ${publicUrlData.publicUrl}`, 'success')
    return publicUrlData.publicUrl
    
  } catch (error) {
    logProgress(`Ошибка загрузки URL ${imageUrl}: ${error}`, 'error')
    return null
  }
}

// Загрузка всех файлов из папки
async function uploadFolder(folderPath: string, bucket: string, prefix?: string) {
  try {
    const files = await fs.readdir(folderPath)
    const imageFiles = files.filter(file => 
      ALLOWED_EXTENSIONS.includes(path.extname(file).toLowerCase())
    )
    
    logProgress(`Найдено ${imageFiles.length} изображений в папке ${folderPath}`, 'info')
    
    const results = []
    for (const file of imageFiles) {
      const filePath = path.join(folderPath, file)
      const storagePath = prefix ? `${prefix}/${file}` : undefined
      const url = await uploadFile(filePath, bucket, storagePath)
      if (url) {
        results.push({ file, url })
      }
    }
    
    logProgress(`Загружено ${results.length} из ${imageFiles.length} файлов`, 'success')
    return results
    
  } catch (error) {
    logProgress(`Ошибка чтения папки ${folderPath}: ${error}`, 'error')
    return []
  }
}

// Обновление URL изображений в базе данных
async function updateProductImages() {
  logProgress('Обновление URL изображений продуктов...', 'info')
  
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name')
  
  if (error) {
    logProgress(`Ошибка получения продуктов: ${error.message}`, 'error')
    return
  }
  
  let updatedCount = 0
  
  for (const product of products || []) {
    // Получаем изображения продукта
    const { data: images } = await supabase
      .from('product_images')
      .select('id, url')
      .eq('product_id', product.id)
    
    if (!images || images.length === 0) continue
    
    for (const image of images) {
      // Если URL внешний (например, Unsplash), загружаем в Storage
      if (image.url.startsWith('http') && !image.url.includes(supabaseUrl)) {
        const newUrl = await uploadFromUrl(
          image.url, 
          BUCKETS.PRODUCTS, 
          `products/${product.id}/${Date.now()}.jpg`
        )
        
        if (newUrl) {
          await supabase
            .from('product_images')
            .update({ url: newUrl })
            .eq('id', image.id)
          
          updatedCount++
        }
      }
    }
  }
  
  logProgress(`Обновлено ${updatedCount} изображений продуктов`, 'success')
}

// Создание структуры папок для примера
async function createExampleStructure() {
  const examplePath = 'example-images'
  
  try {
    await fs.mkdir(examplePath, { recursive: true })
    await fs.mkdir(path.join(examplePath, 'products'), { recursive: true })
    await fs.mkdir(path.join(examplePath, 'brands'), { recursive: true })
    await fs.mkdir(path.join(examplePath, 'articles'), { recursive: true })
    
    // Создаем README файл с инструкциями
    const readme = `# Структура папок для загрузки изображений

## Папки:
- products/ - изображения продуктов
- brands/ - логотипы брендов  
- articles/ - изображения для статей

## Поддерживаемые форматы:
- .jpg, .jpeg
- .png
- .webp
- .gif

## Максимальный размер файла: 5MB

## Использование:
npm run upload-images example-images/products
npm run upload-images example-images/brands
npm run upload-images --update-products
`
    
    await fs.writeFile(path.join(examplePath, 'README.md'), readme)
    
    logProgress(`Создана структура папок: ${examplePath}/`, 'success')
    
  } catch (error) {
    logProgress(`Ошибка создания структуры: ${error}`, 'error')
  }
}

// Основная функция
async function main() {
  const args = process.argv.slice(2)
  
  if (args.length === 0) {
    console.log('🖼️  Загрузка изображений в Supabase Storage')
    console.log('\nИспользование:')
    console.log('  npm run upload-images <папка>')
    console.log('  npm run upload-images <файл>')
    console.log('  npm run upload-images --update-products')
    console.log('  npm run upload-images --create-example')
    console.log('\nПримеры:')
    console.log('  npm run upload-images ./images/products')
    console.log('  npm run upload-images ./logo.png')
    console.log('  npm run upload-images --update-products')
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
  
  // Создаем buckets
  await createBucketsIfNotExist()
  
  const command = args[0]
  
  if (command === '--create-example') {
    await createExampleStructure()
    return
  }
  
  if (command === '--update-products') {
    await updateProductImages()
    return
  }
  
  // Проверяем, существует ли путь
  try {
    const stats = await fs.stat(command)
    
    if (stats.isDirectory()) {
      // Загружаем всю папку
      await uploadFolder(command, BUCKETS.PRODUCTS, 'products')
    } else if (stats.isFile()) {
      // Загружаем один файл
      const url = await uploadFile(command, BUCKETS.PRODUCTS)
      if (url) {
        console.log(`\n📋 URL изображения: ${url}`)
      }
    }
    
  } catch (error) {
    logProgress(`Путь ${command} не найден`, 'error')
  }
}

// Запускаем загрузку
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
}