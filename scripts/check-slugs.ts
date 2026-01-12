#!/usr/bin/env tsx

import 'dotenv/config'
import { supabase } from '../src/lib/supabase/client'

async function checkSlugs() {
  console.log('🔍 Проверяем slug\'ы в базе данных...\n')
  
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, slug')
      .eq('is_active', true)
    
    if (error) {
      console.log('❌ Ошибка:', error.message)
      return
    }
    
    console.log('📦 Продукты и их slug\'ы:')
    products?.forEach(product => {
      console.log(`   • ${product.name}`)
      console.log(`     slug: "${product.slug}"`)
      console.log()
    })
    
  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
  }
}

checkSlugs()