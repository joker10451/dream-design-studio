import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useNewsletter, useEmailValidation } from '@/hooks/useNewsletter';
import { NewsletterPreferences } from '@/types/newsletter';
import { getDefaultPreferences } from '@/lib/newsletterUtils';
import { cn } from '@/lib/utils';

interface NewsletterFormProps {
  variant?: 'compact' | 'full';
  source?: 'header' | 'footer' | 'article' | 'popup';
  className?: string;
  showPreferences?: boolean;
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
}

export function NewsletterForm({
  variant = 'compact',
  source = 'footer',
  className,
  showPreferences = false,
  title,
  description,
  placeholder = 'Введите ваш email',
  buttonText = 'Подписаться'
}: NewsletterFormProps) {
  const { email, validation, setEmail, isValid } = useEmailValidation();
  const { subscribe, isSubmitting, subscribeError, subscribeSuccess, subscribeData, resetSubscribe } = useNewsletter();
  const [preferences, setPreferences] = useState<NewsletterPreferences>(getDefaultPreferences());
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !email.trim()) {
      return;
    }

    try {
      await subscribe({
        email: email.trim(),
        preferences: showPreferences ? preferences : undefined,
        source
      });
      setShowSuccess(true);
      setEmail('');
      
      // Скрыть сообщение об успехе через 5 секунд
      setTimeout(() => {
        setShowSuccess(false);
        resetSubscribe();
      }, 5000);
    } catch (error) {
      // Ошибка обрабатывается через subscribeError
    }
  };

  const handlePreferenceChange = (key: keyof NewsletterPreferences, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const preferenceLabels: Record<keyof NewsletterPreferences, { label: string; description: string }> = {
    weeklyDigest: {
      label: 'Еженедельная сводка',
      description: 'Лучшие статьи и новости недели'
    },
    productUpdates: {
      label: 'Обновления продуктов',
      description: 'Новые устройства и обзоры'
    },
    newArticles: {
      label: 'Новые статьи',
      description: 'Уведомления о публикации гайдов'
    },
    specialOffers: {
      label: 'Специальные предложения',
      description: 'Скидки и акции от партнеров'
    },
    newsUpdates: {
      label: 'Новости индустрии',
      description: 'Последние новости IoT и умного дома'
    },
    ratingsUpdates: {
      label: 'Обновления рейтингов',
      description: 'Новые рейтинги и ТОП-списки'
    }
  };

  if (showSuccess && subscribeData) {
    return (
      <div className={cn('space-y-4', className)}>
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {subscribeData.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Заголовок и описание */}
      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Форма */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email поле */}
        <div className="space-y-2">
          {variant === 'full' && (
            <Label htmlFor="newsletter-email">Email адрес</Label>
          )}
          <div className={cn(
            'flex gap-2',
            variant === 'compact' ? 'flex-row' : 'flex-col sm:flex-row'
          )}>
            <div className="flex-1 space-y-1">
              <Input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={placeholder}
                className={cn(
                  'transition-colors',
                  !isValid && email && 'border-red-500 focus:border-red-500'
                )}
                disabled={isSubmitting}
                required
              />
              {!isValid && email && validation.error && (
                <p className="text-xs text-red-600">
                  {validation.error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              disabled={!isValid || !email.trim() || isSubmitting}
              className={cn(
                'shrink-0',
                variant === 'compact' ? 'px-4' : 'px-6'
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Подписка...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  {buttonText}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Настройки подписки */}
        {showPreferences && variant === 'full' && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Что вас интересует?
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(preferenceLabels).map(([key, { label, description }]) => (
                <div key={key} className="flex items-start space-x-2">
                  <Checkbox
                    id={`pref-${key}`}
                    checked={preferences[key as keyof NewsletterPreferences]}
                    onCheckedChange={(checked) => 
                      handlePreferenceChange(key as keyof NewsletterPreferences, checked as boolean)
                    }
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
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
          </div>
        )}

        {/* Ошибка */}
        {subscribeError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {subscribeError.message || 'Произошла ошибка при подписке. Попробуйте еще раз.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Согласие на обработку данных */}
        <div className="text-xs text-muted-foreground">
          Нажимая "Подписаться", вы соглашаетесь с{' '}
          <a href="/privacy" className="underline hover:text-foreground">
            политикой конфиденциальности
          </a>{' '}
          и обработкой персональных данных.
        </div>
      </form>
    </div>
  );
}

// Компактная версия для header
export function NewsletterFormCompact(props: Omit<NewsletterFormProps, 'variant'>) {
  return (
    <NewsletterForm
      {...props}
      variant="compact"
      showPreferences={false}
    />
  );
}

// Полная версия для footer и отдельных страниц
export function NewsletterFormFull(props: Omit<NewsletterFormProps, 'variant'>) {
  return (
    <NewsletterForm
      {...props}
      variant="full"
      showPreferences={true}
    />
  );
}