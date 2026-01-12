import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Helmet } from 'react-helmet-async'
import { CheckCircle, XCircle, Loader2, User, Mail, Shield, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AuthStatusPage: React.FC = () => {
  const { authState, isAuthenticated, isAdmin, isModerator, signOut } = useAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      console.log('Выход успешен')
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
  }

  return (
    <>
      <Helmet>
        <title>Статус аутентификации - Dream Design Studio</title>
      </Helmet>

      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Статус аутентификации</h1>
            <p className="text-muted-foreground">
              Проверка состояния системы аутентификации
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Основной статус */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {authState.loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : isAuthenticated ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  Основной статус
                </CardTitle>
                <CardDescription>
                  Текущее состояние аутентификации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Загрузка</span>
                    <span className={`text-sm ${authState.loading ? 'text-yellow-600' : 'text-green-600'}`}>
                      {authState.loading ? 'Да' : 'Нет'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Авторизован</span>
                    <span className={`text-sm ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                      {isAuthenticated ? 'Да' : 'Нет'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Администратор</span>
                    <span className={`text-sm ${isAdmin ? 'text-blue-600' : 'text-gray-600'}`}>
                      {isAdmin ? 'Да' : 'Нет'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Модератор</span>
                    <span className={`text-sm ${isModerator ? 'text-purple-600' : 'text-gray-600'}`}>
                      {isModerator ? 'Да' : 'Нет'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Данные пользователя */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Данные пользователя
                </CardTitle>
                <CardDescription>
                  Информация о текущем пользователе
                </CardDescription>
              </CardHeader>
              <CardContent>
                {authState.user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{authState.user.email}</span>
                    </div>
                    
                    {authState.user.full_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{authState.user.full_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm capitalize">{authState.user.role}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(authState.user.created_at).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    
                    <div className="pt-2">
                      <span className="text-xs text-muted-foreground">ID: {authState.user.id}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Пользователь не авторизован
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Сессия */}
            {authState.session && (
              <Card>
                <CardHeader>
                  <CardTitle>Данные сессии</CardTitle>
                  <CardDescription>
                    Информация о текущей сессии
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Access Token:</strong> 
                      <span className="ml-2 font-mono text-xs">
                        {authState.session.access_token.substring(0, 20)}...
                      </span>
                    </div>
                    <div>
                      <strong>Expires At:</strong> 
                      <span className="ml-2">
                        {new Date(authState.session.expires_at! * 1000).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ошибки */}
            {authState.error && (
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-600">Ошибка</CardTitle>
                  <CardDescription>
                    Последняя ошибка аутентификации
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-red-600">{authState.error.message}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Действия */}
          <div className="mt-8 space-y-4">
            {isAuthenticated ? (
              <div className="flex gap-4">
                <Button onClick={handleSignOut} variant="destructive">
                  Выйти из аккаунта
                </Button>
                <Link to="/profile">
                  <Button variant="outline">
                    Перейти в профиль
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Для тестирования аутентификации используйте следующие страницы:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link to="/simple-auth">
                    <Button variant="outline" className="w-full">
                      Простая форма входа
                    </Button>
                  </Link>
                  <Link to="/minimal-auth">
                    <Button variant="outline" className="w-full">
                      Минимальная форма входа
                    </Button>
                  </Link>
                  <Link to="/supabase-auth-test">
                    <Button variant="outline" className="w-full">
                      Тест Supabase Auth
                    </Button>
                  </Link>
                  <Link to="/auth-test">
                    <Button variant="outline" className="w-full">
                      Полный тест аутентификации
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Тестовый аккаунт:</h4>
                  <p className="text-sm">
                    <strong>Email:</strong> admin@test.com<br />
                    <strong>Пароль:</strong> Admin123!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}