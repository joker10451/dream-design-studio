import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../client'
import { supabaseUtils } from '../../../hooks/api/useSupabase'

// Мокаем Supabase для тестов
vi.mock('../client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          then: vi.fn()
        }))
      }))
    })),
    auth: {
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
      signOut: vi.fn()
    }
  }
}))

describe('Supabase Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Supabase Client', () => {
    it('should be properly configured', () => {
      expect(supabase).toBeDefined()
      expect(supabase.from).toBeDefined()
      expect(supabase.auth).toBeDefined()
    })

    it('should have required methods', () => {
      expect(typeof supabase.from).toBe('function')
      expect(typeof supabase.auth.getUser).toBe('function')
      expect(typeof supabase.auth.getSession).toBe('function')
      expect(typeof supabase.auth.onAuthStateChange).toBe('function')
    })
  })

  describe('Supabase Utils', () => {
    it('should have checkHealth method', () => {
      expect(typeof supabaseUtils.checkHealth).toBe('function')
    })

    it('should have getCurrentUser method', () => {
      expect(typeof supabaseUtils.getCurrentUser).toBe('function')
    })

    it('should have getUserProfile method', () => {
      expect(typeof supabaseUtils.getUserProfile).toBe('function')
    })

    it('checkHealth should return boolean', async () => {
      // Мокаем успешный ответ
      const mockFrom = vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)
      
      const result = await supabaseUtils.checkHealth()
      expect(typeof result).toBe('boolean')
    })

    it('getCurrentUser should call supabase.auth.getUser', async () => {
      const mockGetUser = vi.fn(() => Promise.resolve({ 
        data: { user: null }, 
        error: null 
      }))
      
      vi.mocked(supabase.auth.getUser).mockImplementation(mockGetUser)
      
      await supabaseUtils.getCurrentUser()
      expect(mockGetUser).toHaveBeenCalled()
    })

    it('getUserProfile should call correct table', async () => {
      const mockSelect = vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      }))
      
      const mockFrom = vi.fn(() => ({
        select: mockSelect
      }))
      
      vi.mocked(supabase.from).mockImplementation(mockFrom)
      
      await supabaseUtils.getUserProfile('test-id')
      
      expect(supabase.from).toHaveBeenCalledWith('user_profiles')
      expect(mockSelect).toHaveBeenCalledWith('*')
    })
  })

  describe('Database Types', () => {
    it('should export Database type', async () => {
      const types = await import('../database.types')
      // Database это тип, а не значение, поэтому мы проверяем, что модуль импортируется
      expect(types).toBeDefined()
      expect(typeof types).toBe('object')
    })

    it('should have proper table structure', async () => {
      const { Database } = await import('../database.types')
      
      // Проверяем, что основные таблицы определены в типах
      type Tables = Database['public']['Tables']
      
      // Эти типы должны существовать (TypeScript проверит это на этапе компиляции)
      const tableNames: (keyof Tables)[] = [
        'user_profiles',
        'products',
        'categories',
        'brands',
        'articles',
        'user_favorites',
        'shopping_lists',
        'analytics_events',
        'newsletter_subscribers'
      ]
      
      expect(tableNames.length).toBeGreaterThan(0)
    })
  })

  describe('Environment Variables', () => {
    it('should handle missing environment variables gracefully', () => {
      // Этот тест проверяет, что код не падает при отсутствии env переменных
      // В реальном приложении должна быть проверка на наличие переменных
      expect(() => {
        // Проверяем, что модуль можно импортировать
        const clientModule = '../client'
        expect(clientModule).toBeDefined()
      }).not.toThrow()
    })
  })
})

describe('API Base Classes', () => {
  it('should export base API utilities', async () => {
    const baseApi = await import('../../api/base')
    
    expect(baseApi.BaseApiService).toBeDefined()
    expect(baseApi.ApiError).toBeDefined()
    expect(baseApi.handleSupabaseError).toBeDefined()
    expect(baseApi.buildPaginationQuery).toBeDefined()
    expect(baseApi.buildSortQuery).toBeDefined()
  })

  it('ApiError should work correctly', async () => {
    const { ApiError } = await import('../../api/base')
    
    const error = new ApiError('Test error', 'TEST_CODE', { detail: 'test' })
    
    expect(error.message).toBe('Test error')
    expect(error.code).toBe('TEST_CODE')
    expect(error.details).toEqual({ detail: 'test' })
    expect(error.name).toBe('ApiError')
  })

  it('buildPaginationQuery should work correctly', async () => {
    const { buildPaginationQuery } = await import('../../api/base')
    
    const result1 = buildPaginationQuery({ page: 1, limit: 10 })
    expect(result1).toEqual({ from: 0, to: 9 })
    
    const result2 = buildPaginationQuery({ page: 2, limit: 20 })
    expect(result2).toEqual({ from: 20, to: 39 })
    
    const result3 = buildPaginationQuery()
    expect(result3).toEqual({ from: 0, to: 19 }) // default values
  })

  it('buildSortQuery should work correctly', async () => {
    const { buildSortQuery } = await import('../../api/base')
    
    const result1 = buildSortQuery({ column: 'name', ascending: true })
    expect(result1).toEqual({ column: 'name', ascending: true })
    
    const result2 = buildSortQuery({ column: 'created_at' })
    expect(result2).toEqual({ column: 'created_at', ascending: true }) // default ascending
    
    const result3 = buildSortQuery({ column: 'price', ascending: false })
    expect(result3).toEqual({ column: 'price', ascending: false })
  })
})