import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Helmet } from 'react-helmet-async'

export const SimpleAuthTestPage: React.FC = () => {
  const { authState, isAuthenticated, signOut } = useAuth()

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
        <title>Простой тест аутентификации</title>
      </Helmet>

      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold mb-8">Простой тест аутентификации</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Статус аутентификации</CardTitle>
              <CardDescription>
                Текущее состояние системы аутентификации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Загрузка:</strong> {authState.loading ? 'Да' : 'Нет'}
                </div>
                <div>
                  <strong>Авторизован:</strong> {isAuthenticated ? 'Да' : 'Нет'}
                </div>
              </div>

              {authState.user && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Данные пользователя:</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>ID:</strong> {authState.user.id}</div>
                    <div><strong>Email:</strong> {authState.user.email}</div>
                    <div><strong>Имя:</strong> {authState.user.full_name || 'Не указано'}</div>
                    <div><strong>Роль:</strong> {authState.user.role}</div>
                  </div>
                </div>
              )}

              {authState.error && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2 text-red-600">Ошибка:</h4>
                  <p className="text-sm text-red-600">{authState.error.message}</p>
                </div>
              )}

              {isAuthenticated && (
                <div className="border-t pt-4">
                  <Button onClick={handleSignOut} variant="destructive" size="sm">
                    Выйти из аккаунта
                  </Button>
                </div>
              )}

              {!isAuthenticated && (
                <div className="border-t pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Для тестирования войдите через другие страницы:
                  </p>
                  <div className="space-y-2">
                    <div>
                      <a href="/simple-auth" className="text-blue-600 hover:underline">
                        /simple-auth - Простая форма входа
                      </a>
                    </div>
                    <div>
                      <a href="/minimal-auth" className="text-blue-600 hover:underline">
                        /minimal-auth - Минимальная форма входа
                      </a>
                    </div>
                    <div>
                      <a href="/supabase-auth-test" className="text-blue-600 hover:underline">
                        /supabase-auth-test - Тест Supabase аутентификации
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}