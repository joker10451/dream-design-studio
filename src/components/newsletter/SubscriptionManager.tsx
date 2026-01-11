import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Loader2, 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Trash2,
  Calendar,
  Bell
} from 'lucide-react';
import { useNewsletter, useSubscriptionStatus, useEmailValidation } from '@/hooks/useNewsletter';
import { NewsletterPreferences } from '@/types/newsletter';
import { formatPreferencesForDisplay } from '@/lib/newsletterUtils';
import { cn } from '@/lib/utils';

interface SubscriptionManagerProps {
  initialEmail?: string;
  className?: string;
}

export function SubscriptionManager({ initialEmail, className }: SubscriptionManagerProps) {
  const { email, setEmail, isValid, error } = useEmailValidation();
  const { 
    updatePreferences, 
    unsubscribe, 
    isUpdatingPreferences, 
    isUnsubscribing,
    updatePreferencesError,
    unsubscribeError,
    updatePreferencesSuccess,
    unsubscribeSuccess,
    updatePreferencesData,
    unsubscribeData
  } = useNewsletter();
  
  const { data: subscription, isLoading, error: fetchError } = useSubscriptionStatus(email);
  const [preferences, setPreferences] = useState<NewsletterPreferences | null>(null);
  const [unsubscribeReason, setUnsubscribeReason] = useState('');
  const [showUnsubscribeForm, setShowUnsubscribeForm] = useState(false);

  // Инициализация email
  useEffect(() => {
    if (initialEmail && !email) {
      setEmail(initialEmail);
    }
  }, [initialEmail, email, setEmail]);

  // Обновление настроек при загрузке подписки
  useEffect(() => {
    if (subscription?.preferences) {
      setPreferences(subscription.preferences);
    }
  }, [subscription]);

  const handlePreferenceChange = (key: keyof NewsletterPreferences, checked: boolean) => {
    if (!preferences) return;
    
    setPreferences(prev => prev ? {
      ...prev,
      [key]: checked
    } : null);
  };

  const handleUpdatePreferences = async () => {
    if (!email || !preferences || !isValid) return;

    try {
      await updatePreferences(email, preferences);
    } catch (error) {
      // Ошибка обрабатывается через updatePreferencesError
    }
  };

  const handleUnsubscribe = async () => {
    if (!email || !isValid) return;

    try {
      await unsubscribe({
        email,
        reason: unsubscribeReason || undefined
      });
    } catch (error) {
      // Ошибка обрабатывается через unsubscribeError
    }
  };

  // Если успешно отписались
  if (unsubscribeSuccess && unsubscribeData) {
    return (
      <div className={cn('max-w-2xl mx-auto space-y-6', className)}>
        <Card>
          <CardHeader className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-green-800">Отписка выполнена</CardTitle>
            <CardDescription>
              {unsubscribeData.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Если вы передумаете, вы всегда можете подписаться снова на главной странице.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Вернуться на главную
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn('max-w-2xl mx-auto space-y-6', className)}>
      {/* Поиск подписки */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Управление подпиской
          </CardTitle>
          <CardDescription>
            Введите ваш email адрес для управления настройками подписки
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manage-email">Email адрес</Label>
            <Input
              id="manage-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите ваш email"
              className={cn(
                'transition-colors',
                !isValid && email && 'border-red-500 focus:border-red-500'
              )}
            />
            {!isValid && email && error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
          </div>

          {fetchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Ошибка при загрузке данных подписки
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Информация о подписке */}
      {isLoading && email && isValid && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Загрузка данных подписки...
          </CardContent>
        </Card>
      )}

      {subscription && !isLoading && (
        <>
          {/* Статус подписки */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Подписка активна
              </CardTitle>
              <CardDescription className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Подписан с {subscription.subscribedAt.toLocaleDateString('ru-RU')}
                </span>
                {!subscription.isConfirmed && (
                  <span className="text-amber-600 text-sm">
                    Требуется подтверждение email
                  </span>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Настройки уведомлений */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Настройки уведомлений
              </CardTitle>
              <CardDescription>
                Выберите, какие уведомления вы хотите получать
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {preferences && (
                <div className="space-y-4">
                  {formatPreferencesForDisplay(preferences).map(({ key, label, description, enabled }) => (
                    <div key={key} className="flex items-start space-x-3">
                      <Checkbox
                        id={`pref-${key}`}
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          handlePreferenceChange(key, checked as boolean)
                        }
                        className="mt-0.5"
                      />
                      <div className="space-y-1 flex-1">
                        <Label 
                          htmlFor={`pref-${key}`}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {label}
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          {description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdatePreferences}
                  disabled={isUpdatingPreferences || !preferences}
                  className="flex-1"
                >
                  {isUpdatingPreferences ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Сохранение...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Сохранить настройки
                    </>
                  )}
                </Button>
              </div>

              {updatePreferencesError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {updatePreferencesError.message || 'Ошибка при сохранении настроек'}
                  </AlertDescription>
                </Alert>
              )}

              {updatePreferencesSuccess && updatePreferencesData && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {updatePreferencesData.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Отписка */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <Trash2 className="w-5 h-5" />
                Отписаться от рассылки
              </CardTitle>
              <CardDescription>
                Если вы больше не хотите получать наши письма, вы можете отписаться
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!showUnsubscribeForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowUnsubscribeForm(true)}
                  className="border-red-200 text-red-700 hover:bg-red-50"
                >
                  Отписаться от рассылки
                </Button>
              ) : (
                <div className="space-y-4">
                  <Separator />
                  <div className="space-y-3">
                    <Label htmlFor="unsubscribe-reason">
                      Расскажите, почему вы отписываетесь (необязательно)
                    </Label>
                    <Textarea
                      id="unsubscribe-reason"
                      value={unsubscribeReason}
                      onChange={(e) => setUnsubscribeReason(e.target.value)}
                      placeholder="Ваш отзыв поможет нам стать лучше..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowUnsubscribeForm(false)}
                      disabled={isUnsubscribing}
                    >
                      Отмена
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleUnsubscribe}
                      disabled={isUnsubscribing}
                    >
                      {isUnsubscribing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Отписка...
                        </>
                      ) : (
                        'Подтвердить отписку'
                      )}
                    </Button>
                  </div>

                  {unsubscribeError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {unsubscribeError.message || 'Ошибка при отписке'}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Подписка не найдена */}
      {!subscription && !isLoading && email && isValid && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Подписка не найдена</h3>
            <p className="text-muted-foreground mb-4">
              Мы не нашли активную подписку для адреса {email}
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/'}>
              Подписаться на рассылку
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}