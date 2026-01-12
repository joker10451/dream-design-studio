import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { ProfileForm } from '../../components/auth/ProfileForm'
import { ProtectedRoute } from '../../components/auth/ProtectedRoute'
import { Button } from '../../components/ui/button'
import { ArrowLeft, Heart, ShoppingBag, Settings, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { SEOHead } from '../../components/seo/SEOHead'
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const ProfilePage: React.FC = () => {
  const { authState } = useAuth()
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate('/')
  }

  const navItems = [
    {
      title: 'Избранное',
      description: 'Ваши сохраненные товары',
      icon: <Heart className="h-6 w-6 text-red-500" />,
      link: '/user/favorites'
    },
    {
      title: 'Списки покупок',
      description: 'Планирование покупок',
      icon: <ShoppingBag className="h-6 w-6 text-primary" />,
      link: '/user/shopping-lists'
    }
  ]

  return (
    <ProtectedRoute requireAuth>
      <SEOHead
        title="Личный кабинет"
        description="Управление профилем пользователя Smart Home 2026"
      />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 pt-24">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-12">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoBack}
              className="w-fit flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              На главную
            </Button>

            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border-2 border-primary/50">
                <AvatarImage src={authState.user?.avatar_url} alt={authState.user?.full_name || authState.user?.email} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {authState.user?.full_name
                    ? authState.user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : authState.user?.email?.[0].toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold">Личный кабинет</h1>
                {authState.user && (
                  <p className="text-muted-foreground">
                    {authState.user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar Nav */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold px-2 mb-4">Навигация</h2>
              <div className="grid grid-cols-1 gap-3">
                {navItems.map((item) => (
                  <Card
                    key={item.title}
                    className="hover:border-primary/50 cursor-pointer transition-all"
                    onClick={() => navigate(item.link)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Main Content - Profile Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <h2 className="text-xl font-semibold">Настройки профиля</h2>
                  </div>
                  <ProfileForm />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}