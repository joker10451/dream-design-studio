import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Alert, AlertDescription } from '../components/ui/alert'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'

export const SupabaseAuthTestPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading')
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Форма для тестирования
  const [email, setEmail] = useState('admin@test.com')
  const [password, setPassword] = useState('Admin123!')

  // Проверка подключения к Supabase
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1)
        if (error) {
          console.error('Ошибка подключения:', error)
          setConnectionStatus('error')
        } else {
          setConnectionStatus('connected')
        }
      } catch (err) {
        console.error('Ошибка подключения:', err)
        setConnectionStatus('error')
      }
    }

    checkConnection()

    // Подписка на изменения аутентификации
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session)
      setUser(session?.user || null)
    })

    // Проверка текущего пользователя
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        setError(error.message)
      } else {
        console.log('Вход успешен:', data)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(error.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleTestRegistration = async () => {
    setLoading(true)
    setError(null)

    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        console.log('Регистрация успешна:', data)
        alert(`Тестовый пользователь создан: ${testEmail}`)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Тест Supabase Auth - Dream Design Studio</title>
        <meta name="description" content="Прямое тестирование Supabase аутентификации" />
      </Helmet>

      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Тест Supabase Auth</h1>
            <p className="text-muted-foreground">
              Прямое тестирование подключения и аутентификации Supabase
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Статус подключения */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {connectionStatus === 'loading' && <Loader2 className="h-5 w-5 animate-spin" />}
                  {connectionStatus === 'connected' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {connectionStatus === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                  Статус подключения
                </CardTitle>
                <CardDescription>
                  Проверка подключения к Supabase
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Подключение:</span>
                    <span className={connectionStatus === 'connected' ? 'text-green-600' : 'text-red-600'}>
                      {connectionStatus === 'loading' ? 'Проверка...' :
                        connectionStatus === 'connected' ? 'Подключено' : 'Ошибка'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Пользователь:</span>
                    <span>{user ? 'Авторизован' : 'Не авторизован'}</span>
                  </div>
                  {user && (
                    <div className="border-t pt-2 mt-2">
                      <div className="text-sm space-y-1">
                        <div><strong>ID:</strong> {user.id}</div>
                        <div><strong>Email:</strong> {user.email}</div>
                        <div><strong>Создан:</strong> {new Date(user.created_at).toLocaleString('ru-RU')}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Форма тестирования */}
            <Card>
              <CardHeader>
                <CardTitle>Тестирование аутентификации</CardTitle>
                <CardDescription>
                  Прямые вызовы Supabase Auth API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Пароль</Label>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={handleSignIn}
                        disabled={loading || !email || !password}
                        className="w-full"
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Войти
                      </Button>

                      <Button
                        onClick={handleTestRegistration}
                        disabled={loading}
                        variant="outline"
                        className="w-full"
                      >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Создать тестового пользователя
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-green-600 font-medium">Вы авторизованы!</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>

                    <Button
                      onClick={handleSignOut}
                      disabled={loading}
                      variant="destructive"
                      className="w-full"
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Выйти
                    </Button>
                  </div>
                )}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Инструкции */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Инструкции</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Тестовый аккаунт:</strong> admin@test.com / Admin123!</p>
                <p><strong>Создание нового пользователя:</strong> Нажмите "Создать тестового пользователя" для автоматического создания</p>
                <p><strong>Проверка подключения:</strong> Зеленый статус означает успешное подключение к Supabase</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}