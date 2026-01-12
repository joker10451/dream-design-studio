import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ResetPasswordForm } from '../../components/auth/ResetPasswordForm'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Home } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../../lib/supabase/client'
import { logger } from '../../lib/logger'

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkToken = async () => {
      try {
        // Проверяем наличие токена в URL
        const accessToken = searchParams.get('access_token')
        const type = searchParams.get('type')
        
        if (!accessToken || type !== 'recovery') {
          setIsValidToken(false)
          setIsLoading(false)
          return
        }

        // Проверяем сессию
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error || !session) {
          setIsValidToken(false)
        } else {
          setIsValidToken(true)
        }
      } catch (error) {
        logger.error('Ошибка проверки токена:', error)
        setIsValidToken(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkToken()
  }, [searchParams])

  const handleGoHome = () => {
    navigate('/')
  }

  const handleGoBack = () => {
    navigate('/auth/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Проверка ссылки...</p>
        </div>
      </div>
    )
  }

  if (!isValidToken) {
    return (
      <>
        <Helmet>
          <title>Недействительная ссылка - Dream Design Studio</title>
          <meta 
            name="description" 
            content="Ссылка для сброса пароля недействительна или истекла" 
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

            {/* Сообщение об ошибке */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center space-y-4">
              <h2 className="text-xl font-semibold text-destructive">
                Ссылка недействительна
              </h2>
              <p className="text-muted-foreground">
                Ссылка для сброса пароля недействительна или истекла. Ссылки для сброса пароля действительны в течение 1 часа.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/auth/login')}
                  className="w-full"
                >
                  Запросить новую ссылку
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="w-full"
                >
                  Вернуться на главную
                </Button>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Сброс пароля - Dream Design Studio</title>
        <meta 
          name="description" 
          content="Установите новый пароль для вашего аккаунта Dream Design Studio" 
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

          {/* Форма сброса пароля */}
          <ResetPasswordForm />
        </div>
      </div>
    </>
  )
}

