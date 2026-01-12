import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { logger } from '../../lib/logger'

// Схема валидации для формы восстановления пароля
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email обязателен')
    .email('Некорректный email'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onSuccess?: () => void
  onBack?: () => void
  className?: string
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSuccess,
  onBack,
  className
}) => {
  const { resetPassword } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    
    try {
      const { error } = await resetPassword(data.email)
      
      if (error) {
        if (error.message?.includes('rate limit')) {
          setError('root', { 
            message: 'Слишком много запросов. Попробуйте позже.' 
          })
        } else {
          setError('root', { 
            message: error.message || 'Произошла ошибка при отправке письма' 
          })
        }
        toast.error('Ошибка отправки письма')
      } else {
        setIsSuccess(true)
        toast.success('Письмо с инструкциями отправлено на ваш email')
        // Автоматически вернуться через 3 секунды
        setTimeout(() => {
          onSuccess?.()
        }, 3000)
      }
    } catch (error: any) {
      logger.error('Ошибка восстановления пароля:', error)
      setError('root', { 
        message: error.message || 'Произошла ошибка при отправке письма' 
      })
      toast.error('Ошибка отправки письма')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className={className}>
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Письмо отправлено!</CardTitle>
          <CardDescription className="text-center">
            Мы отправили инструкции по восстановлению пароля на адрес
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm font-medium text-center break-all">
              {getValues('email')}
            </p>
          </div>
          
          <Alert>
            <AlertDescription className="text-sm">
              Проверьте папку "Входящие" и "Спам". Ссылка для сброса пароля действительна в течение 1 часа.
            </AlertDescription>
          </Alert>

          {onBack && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBack}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к входу
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Восстановление пароля</CardTitle>
        <CardDescription className="text-center">
          Введите email, который вы использовали при регистрации. Мы отправим вам инструкции по восстановлению пароля.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                className="pl-10"
                {...register('email')}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Ошибки формы */}
          {errors.root && (
            <Alert variant="destructive">
              <AlertDescription>{errors.root.message}</AlertDescription>
            </Alert>
          )}

          {/* Кнопка отправки */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Отправка...
              </>
            ) : (
              'Отправить инструкции'
            )}
          </Button>

          {/* Кнопка назад */}
          {onBack && (
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={onBack}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к входу
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

