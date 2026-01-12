import { useState, useEffect, useContext, createContext, ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { authService } from '../lib/auth/supabase-auth'
import type { AuthState, SignUpData, SignInData, UpdateProfileData } from '../lib/auth/supabase-auth'
import { logger } from '../lib/logger'

// Контекст для аутентификации
const AuthContext = createContext<{
  authState: AuthState
  signUp: (data: SignUpData) => Promise<void>
  signIn: (data: SignInData) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: UpdateProfileData) => Promise<void>
  resetPassword: (email: string) => Promise<{ error: any }>
  updatePassword: (newPassword: string) => Promise<{ error: any }>
  isAuthenticated: boolean
  isAdmin: boolean
  isModerator: boolean
  refreshUser: () => Promise<void>
} | null>(null)

// Провайдер аутентификации
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  logger.log('AuthProvider: Rendering');
  const queryClient = useQueryClient()

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null
  })

  // Инициализация аутентификации
  useEffect(() => {
    let mounted = true

    const initAuth = async () => {
      try {
        const session = await authService.getCurrentSession()

        if (session?.user && mounted) {
          const userProfile = await authService.getUserProfile(session.user.id)

          setAuthState({
            user: userProfile
              ? { ...userProfile, email: session.user.email }
              : { id: session.user.id, email: session.user.email, role: 'user' } as any,
            session,
            loading: false,
            error: null
          })
        } else if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        logger.error('useAuth: initAuth error', error)
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: error as any
          })
        }
      }
    }

    initAuth()

    // Подписка на изменения аутентификации
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        logger.log(`useAuth: Auth event: ${event}`, session?.user?.email)

        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          const userProfile = await authService.getUserProfile(session.user.id)
          setAuthState({
            user: userProfile
              ? { ...userProfile, email: session.user.email }
              : { id: session.user.id, email: session.user.email, role: 'user' } as any,
            session,
            loading: false,
            error: null
          })
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            error: null
          })
          // Очищаем кеш при выходе
          queryClient.clear()
        } else if (event === 'INITIAL_SESSION' && session?.user) {
          // Handle initial session if needed
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setAuthState(prev => ({
            ...prev,
            session,
            loading: false,
            error: null
          }))
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [queryClient])

  // Регистрация
  const signUp = async (data: SignUpData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await authService.signUp(data)

      if (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error
        }))
        throw error
      }

      setAuthState(prev => ({ ...prev, loading: false }))
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as any
      }))
      throw error
    }
  }

  // Вход
  const signIn = async (data: SignInData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await authService.signIn(data)

      if (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error
        }))
        throw error
      }

      // Состояние обновится через onAuthStateChange
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as any
      }))
      throw error
    }
  }

  // Выход
  const signOut = async () => {
    logger.log('useAuth: signOut - initiating robust logout');

    // 1. Немедленно очищаем локальное состояние для отзывчивости интерфейса
    setAuthState({
      user: null,
      session: null,
      loading: false,
      error: null
    })

    // 2. Очищаем кеш запросов
    queryClient.clear()

    try {
      // 3. Вызываем официальный метод выхода Supabase
      const { error } = await authService.signOut()

      if (error) {
        logger.warn('useAuth: Supabase signOut error (handling locally anyway):', error)
      }
    } catch (error) {
      logger.error('useAuth: signOut exception:', error)
    } finally {
      // 4. Принудительная очистка localStorage на случай, если Supabase не справился
      if (typeof window !== 'undefined') {
        try {
          const keysToRemove = Object.keys(localStorage).filter(key =>
            key.includes('supabase.auth.token') || key.startsWith('sb-')
          );
          keysToRemove.forEach(key => localStorage.removeItem(key));
          logger.log('useAuth: localStorage cleaned up', keysToRemove);
        } catch (e) {
          logger.error('useAuth: failed to clean localStorage', e);
        }
      }
      logger.log('useAuth: signOut process completed');

      // 5. Жесткая перезагрузка для полной очистки состояния приложения
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    }
  }

  // Обновление профиля
  const updateProfile = async (data: UpdateProfileData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await authService.updateProfile(data)

      if (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error
        }))
        throw error
      }

      // Обновляем профиль в состоянии
      if (authState.user) {
        const updatedUser = {
          ...authState.user,
          full_name: data.full_name || authState.user.full_name,
          avatar_url: data.avatar_url || authState.user.avatar_url,
          updated_at: new Date().toISOString()
        }

        setAuthState(prev => ({
          ...prev,
          user: updatedUser,
          loading: false
        }))
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error as any
      }))
      throw error
    }
  }

  // Сброс пароля
  const resetPassword = async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await authService.resetPassword(email)

      if (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error
        }))
        return { error }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error) {
      const authError = error as any
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: authError
      }))
      return { error: authError }
    }
  }

  // Обновление пароля
  const updatePassword = async (newPassword: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const { error } = await authService.updatePassword(newPassword)

      if (error) {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error
        }))
        return { error }
      }

      setAuthState(prev => ({ ...prev, loading: false }))
      return { error: null }
    } catch (error) {
      const authError = error as any
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: authError
      }))
      return { error: authError }
    }
  }

  // Обновление данных пользователя
  const refreshUser = async () => {
    if (!authState.session?.user) return

    try {
      const userProfile = await authService.getUserProfile(authState.session.user.id)
      setAuthState(prev => ({ ...prev, user: userProfile }))
    } catch (error) {
      logger.error('Ошибка обновления пользователя:', error)
    }
  }

  // Вычисляемые свойства
  const isAuthenticated = !!authState.user && !!authState.session
  const isAdmin = authState.user?.role === 'admin'
  const isModerator = authState.user?.role === 'moderator' || isAdmin

  const value = {
    authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    updatePassword,
    isAuthenticated,
    isAdmin,
    isModerator,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Хук для использования аутентификации
export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider')
  }

  return context
}

// Хук для проверки аутентификации (без ошибки если не в провайдере)
export const useAuthOptional = () => {
  return useContext(AuthContext)
}