import { supabase } from '../supabase/client'
import { logger } from '../logger'
import type {
  User,
  Session,
  AuthError,
  AuthResponse,
  AuthOtpResponse,
  Provider
} from '@supabase/supabase-js'

// Типы для нашей системы аутентификации
export interface AuthUser {
  id: string
  email?: string
  full_name?: string
  avatar_url?: string
  role: 'user' | 'moderator' | 'admin'
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
  fullName?: string
}

export interface SignInData {
  email: string
  password: string
}

export interface UpdateProfileData {
  full_name?: string
  avatar_url?: string
}

// Класс для управления аутентификацией
export class SupabaseAuthService {
  // Регистрация нового пользователя
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { email, password, fullName } = data

      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || '',
          }
        }
      })

      // Если регистрация успешна, создаем запись в таблице users
      if (response.data.user && !response.error) {
        await this.createUserProfile(response.data.user, fullName)
      }

      return response
    } catch (error) {
      throw new Error(`Ошибка регистрации: ${error}`)
    }
  }

  // Вход пользователя
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      return response
    } catch (error) {
      throw new Error(`Ошибка входа: ${error}`)
    }
  }

  // Выход пользователя
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Получение текущего пользователя
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      logger.error('Ошибка получения пользователя:', error)
      return null
    }
  }

  // Получение текущей сессии
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session
    } catch (error) {
      logger.error('Ошибка получения сессии:', error)
      return null
    }
  }

  // Обновление профиля пользователя
  async updateProfile(data: UpdateProfileData): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        data: data
      })

      // Также обновляем запись в таблице users
      if (!error) {
        const user = await this.getCurrentUser()
        if (user) {
          await supabase
            .from('user_profiles')
            .update({
              full_name: data.full_name,
              avatar_url: data.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
        }
      }

      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Сброс пароля
  async resetPassword(email: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Обновление пароля
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    }
  }

  // Получение профиля пользователя из базы данных
  async getUserProfile(userId: string): Promise<AuthUser | null> {
    // Создаем промис с таймаутом, чтобы не зависать бесконечно
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error('Query timeout')), 10000);
    });

    try {
      const fetchPromise = (async () => {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()

        if (error) {
          logger.error('AuthService: error fetching profile:', error)
          return null
        }

        return data as AuthUser
      })();

      // Ждем либо результата, либо таймаута
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      return result;
    } catch (error) {
      logger.error('AuthService: exception or timeout fetching profile:', error)
      return null
    }
  }

  // Создание профиля пользователя в базе данных
  private async createUserProfile(user: User, fullName?: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          full_name: fullName || user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || null,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (error) {
        logger.error('Ошибка создания профиля:', error)
      }
    } catch (error) {
      logger.error('Ошибка создания профиля:', error)
    }
  }

  // Проверка роли пользователя
  async checkUserRole(userId: string): Promise<'user' | 'moderator' | 'admin' | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        logger.error('Ошибка проверки роли:', error)
        return null
      }

      return data?.role || 'user'
    } catch (error) {
      logger.error('Ошибка проверки роли:', error)
      return null
    }
  }

  // Подписка на изменения аутентификации
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Вход через Google (для будущего использования)
  async signInWithGoogle(): Promise<any> {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }

  // Вход через GitHub (для будущего использования)
  async signInWithGitHub(): Promise<any> {
    return await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }
}

// Экспортируем экземпляр сервиса
export const authService = new SupabaseAuthService()