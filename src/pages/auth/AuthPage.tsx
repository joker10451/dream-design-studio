import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { LoginForm } from '../../components/auth/LoginForm'
import { RegisterForm } from '../../components/auth/RegisterForm'
import { ForgotPasswordForm } from '../../components/auth/ForgotPasswordForm'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { ArrowLeft, Home } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

type AuthMode = 'login' | 'register' | 'forgot-password'

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login')
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Если пользователь уже авторизован, перенаправляем на главную
  React.useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  const handleAuthSuccess = () => {
    const from = location.state?.from?.pathname || '/'
    navigate(from, { replace: true })
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <Helmet>
        <title>
          {mode === 'login' 
            ? 'Вход' 
            : mode === 'register' 
            ? 'Регистрация' 
            : 'Восстановление пароля'} - Dream Design Studio
        </title>
        <meta 
          name="description" 
          content={
            mode === 'login' 
              ? 'Войдите в свой аккаунт Dream Design Studio для доступа к персональным функциям'
              : mode === 'register'
              ? 'Создайте аккаунт Dream Design Studio для доступа к избранному, спискам покупок и другим функциям'
              : 'Восстановите доступ к вашему аккаунту Dream Design Studio'
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
          {/* Навигация */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Назад
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Главная
            </Button>
          </div>

          {/* Формы аутентификации */}
          {mode === 'forgot-password' ? (
            <ForgotPasswordForm
              onSuccess={() => setMode('login')}
              onBack={() => setMode('login')}
            />
          ) : (
            <>
              <Tabs value={mode} onValueChange={(value) => setMode(value as AuthMode)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Вход</TabsTrigger>
                  <TabsTrigger value="register">Регистрация</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="mt-4">
                  <LoginForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToRegister={() => setMode('register')}
                    onForgotPassword={() => setMode('forgot-password')}
                  />
                </TabsContent>
                
                <TabsContent value="register" className="mt-4">
                  <RegisterForm
                    onSuccess={handleAuthSuccess}
                    onSwitchToLogin={() => setMode('login')}
                  />
                </TabsContent>
              </Tabs>

              {/* Дополнительная информация */}
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">Зачем нужен аккаунт?</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Сохранение избранных товаров</li>
                      <li>• Создание списков покупок</li>
                      <li>• Персональные рекомендации</li>
                      <li>• Уведомления о скидках</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  )
}