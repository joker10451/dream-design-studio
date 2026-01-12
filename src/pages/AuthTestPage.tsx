import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import { ProfileForm } from '../components/auth/ProfileForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

export const AuthTestPage: React.FC = () => {
  const { authState, isAuthenticated, isAdmin, isModerator, signOut } = useAuth()

  return (
    <>
      <Helmet>
        <title>Тест аутентификации - Dream Design Studio</title>
        <meta name="description" content="Страница для тестирования системы аутентификации" />
      </Helmet>

      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Тест системы аутентификации</h1>
            <p className="text-muted-foreground">
              Эта страница предназначена для тестирования всех компонентов аутентификации
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Статус аутентификации */}
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
                  Статус аутентификации
                </CardTitle>
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
                  <div>
                    <strong>Администратор:</strong> {isAdmin ? 'Да' : 'Нет'}
                  </div>
                  <div>
                    <strong>Модератор:</strong> {isModerator ? 'Да' : 'Нет'}
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
                      <div><strong>Активен:</strong> {authState.user.is_active ? 'Да' : 'Нет'}</div>
                      <div><strong>Создан:</strong> {new Date(authState.user.created_at).toLocaleString('ru-RU')}</div>
                    </div>
                  </div>
                )}

                {authState.session && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-2">Данные сессии:</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Access Token:</strong> {authState.session.access_token.substring(0, 20)}...</div>
                      <div><strong>Expires At:</strong> {new Date(authState.session.expires_at! * 1000).toLocaleString('ru-RU')}</div>
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
                    <Button onClick={signOut} variant="destructive" size="sm">
                      Выйти из аккаунта
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Формы аутентификации */}
            <div className="space-y-6">
              {!isAuthenticated ? (
                <Tabs defaultValue="login">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Вход</TabsTrigger>
                    <TabsTrigger value="register">Регистрация</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login" className="mt-4">
                    <LoginForm
                      onSuccess={() => console.log('Вход успешен!')}
                      onSwitchToRegister={() => console.log('Переключение на регистрацию')}
                      onForgotPassword={() => console.log('Забыли пароль')}
                    />
                  </TabsContent>
                  
                  <TabsContent value="register" className="mt-4">
                    <RegisterForm
                      onSuccess={() => console.log('Регистрация успешна!')}
                      onSwitchToLogin={() => console.log('Переключение на вход')}
                    />
                  </TabsContent>
                </Tabs>
              ) : (
                <ProfileForm />
              )}
            </div>
          </div>

          {/* Инструкции */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Инструкции по тестированию</CardTitle>
              <CardDescription>
                Как протестировать систему аутентификации
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">1. Тестирование регистрации:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Перейдите на вкладку "Регистрация"</li>
                  <li>Заполните форму с валидными данными</li>
                  <li>Проверьте email для подтверждения аккаунта</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">2. Тестирование входа:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Используйте тестовый аккаунт: admin@test.com / Admin123!</li>
                  <li>Или войдите с созданным аккаунтом</li>
                  <li>Проверьте отображение данных пользователя</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">3. Тестирование профиля:</h4>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>После входа появится форма профиля</li>
                  <li>Попробуйте обновить имя и аватар</li>
                  <li>Протестируйте смену пароля</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}