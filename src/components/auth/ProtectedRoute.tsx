import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  requireModerator?: boolean
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  requireModerator = false,
  redirectTo = '/auth/login'
}) => {
  const { authState, isAuthenticated, isAdmin, isModerator } = useAuth()
  const location = useLocation()

  // Показываем загрузку пока проверяем аутентификацию
  if (authState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Проверка аутентификации...</p>
        </div>
      </div>
    )
  }

  // Проверяем требования к аутентификации
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Проверяем требования к роли администратора
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  // Проверяем требования к роли модератора
  if (requireModerator && !isModerator) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

// Компонент для страницы "Нет доступа"
export const UnauthorizedPage: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-red-600">403</h1>
        <h2 className="text-2xl font-semibold">Доступ запрещен</h2>
        <p className="text-muted-foreground max-w-md">
          {isAuthenticated 
            ? 'У вас недостаточно прав для доступа к этой странице.'
            : 'Войдите в аккаунт для доступа к этой странице.'
          }
        </p>
        <div className="space-x-4">
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Назад
          </button>
          {!isAuthenticated && (
            <button 
              onClick={() => window.location.href = '/auth/login'}
              className="px-4 py-2 border border-input rounded-md hover:bg-accent"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </div>
  )
}