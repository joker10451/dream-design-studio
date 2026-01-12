import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Loader2, User, Mail, Shield, Calendar, Eye, EyeOff, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'
import { AvatarUpload } from './AvatarUpload'

// Схема валидации для обновления профиля
const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов')
    .optional(),
  avatar_url: z
    .string()
    .url('Некорректный URL изображения')
    .optional()
    .or(z.literal(''))
})

// Схема для смены пароля
const passwordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Введите текущий пароль'),
  newPassword: z
    .string()
    .min(6, 'Новый пароль должен содержать минимум 6 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать строчные и заглавные буквы, а также цифры'),
  confirmNewPassword: z
    .string()
    .min(1, 'Подтвердите новый пароль')
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Пароли не совпадают",
  path: ["confirmNewPassword"],
})

type ProfileFormData = z.infer<typeof profileSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

interface ProfileFormProps {
  className?: string
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ className }) => {
  const { authState, updateProfile, updatePassword, signOut } = useAuth()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null)

  // Форма профиля
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    setError: setProfileError,
    reset: resetProfile
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  })

  // Форма пароля
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    setError: setPasswordError,
    reset: resetPassword
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema)
  })

  // Заполняем форму данными пользователя
  useEffect(() => {
    if (authState.user) {
      resetProfile({
        full_name: authState.user.full_name || '',
        avatar_url: authState.user.avatar_url || ''
      })
      setAvatarDataUrl(authState.user.avatar_url || null)
    }
  }, [authState.user, resetProfile])

  // Обновление профиля
  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true)

    try {
      await updateProfile({
        full_name: data.full_name,
        avatar_url: avatarDataUrl || data.avatar_url || undefined
      })
      toast.success('Профиль обновлен успешно!')
    } catch (error: any) {
      console.error('Ошибка обновления профиля:', error)
      setProfileError('root', {
        message: error.message || 'Произошла ошибка при обновлении профиля'
      })
      toast.error('Ошибка обновления профиля')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Смена пароля
  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true)

    try {
      // В реальном приложении нужно проверить текущий пароль
      await updatePassword(data.newPassword)
      toast.success('Пароль изменен успешно!')
      resetPassword()
    } catch (error: any) {
      console.error('Ошибка смены пароля:', error)
      setPasswordError('root', {
        message: error.message || 'Произошла ошибка при смене пароля'
      })
      toast.error('Ошибка смены пароля')
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'moderator': return 'secondary'
      default: return 'outline'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор'
      case 'moderator': return 'Модератор'
      default: return 'Пользователь'
    }
  }

  if (!authState.user) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Войдите в аккаунт для управления профилем
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Информация об аккаунте */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Информация об аккаунте
          </CardTitle>
          <CardDescription>
            Основная информация о вашем аккаунте
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input value={authState.user.email} disabled />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Роль
              </Label>
              <div>
                <Badge variant={getRoleBadgeVariant(authState.user.role)}>
                  {getRoleLabel(authState.user.role)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Дата регистрации
              </Label>
              <Input
                value={new Date(authState.user.created_at).toLocaleDateString('ru-RU')}
                disabled
              />
            </div>

            <div className="space-y-2">
              <Label>Статус аккаунта</Label>
              <div>
                <Badge variant={authState.user.is_active ? 'default' : 'secondary'}>
                  {authState.user.is_active ? 'Активен' : 'Неактивен'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Редактирование профиля */}
      <Card>
        <CardHeader>
          <CardTitle>Редактирование профиля</CardTitle>
          <CardDescription>
            Обновите информацию о себе
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Полное имя</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Введите ваше имя"
                {...registerProfile('full_name')}
                disabled={isUpdatingProfile}
              />
              {profileErrors.full_name && (
                <p className="text-sm text-red-600">{profileErrors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Фото профиля</Label>
              <AvatarUpload
                currentAvatar={avatarDataUrl || authState.user.avatar_url}
                userName={authState.user.full_name}
                onAvatarChange={(url) => setAvatarDataUrl(url)}
                size="md"
              />
            </div>

            {profileErrors.root && (
              <Alert variant="destructive">
                <AlertDescription>{profileErrors.root.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Обновление...
                </>
              ) : (
                'Обновить профиль'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Смена пароля */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Смена пароля
          </CardTitle>
          <CardDescription>
            Обновите пароль для повышения безопасности
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Текущий пароль</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  {...registerPassword('currentPassword')}
                  disabled={isUpdatingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isUpdatingPassword}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-sm text-red-600">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Новый пароль</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  {...registerPassword('newPassword')}
                  disabled={isUpdatingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isUpdatingPassword}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-red-600">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Подтверждение нового пароля</Label>
              <div className="relative">
                <Input
                  id="confirmNewPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pr-10"
                  {...registerPassword('confirmNewPassword')}
                  disabled={isUpdatingPassword}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isUpdatingPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              {passwordErrors.confirmNewPassword && (
                <p className="text-sm text-red-600">{passwordErrors.confirmNewPassword.message}</p>
              )}
            </div>

            {passwordErrors.root && (
              <Alert variant="destructive">
                <AlertDescription>{passwordErrors.root.message}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isUpdatingPassword}
            >
              {isUpdatingPassword ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Изменение...
                </>
              ) : (
                'Изменить пароль'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Опасная зона */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Опасная зона</CardTitle>
          <CardDescription>
            Действия, которые могут повлиять на ваш аккаунт
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                signOut()
                toast.success('Вы вышли из аккаунта')
              }
            }}
          >
            Выйти из аккаунта
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}