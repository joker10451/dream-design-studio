import { NewsletterValidationResult, NewsletterPreferences } from '@/types/newsletter';

// Валидация email адреса
export function validateEmail(email: string): NewsletterValidationResult {
  if (!email) {
    return {
      isValid: false,
      error: 'Email адрес обязателен'
    };
  }

  if (email.length > 254) {
    return {
      isValid: false,
      error: 'Email адрес слишком длинный'
    };
  }

  // Регулярное выражение для валидации email
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Некорректный формат email адреса'
    };
  }

  // Проверка на распространенные ошибки
  if (email.includes('..')) {
    return {
      isValid: false,
      error: 'Email не может содержать две точки подряд'
    };
  }

  if (email.startsWith('.') || email.endsWith('.')) {
    return {
      isValid: false,
      error: 'Email не может начинаться или заканчиваться точкой'
    };
  }

  // Проверка на одноразовые email сервисы (базовый список)
  const disposableEmailDomains = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && disposableEmailDomains.includes(domain)) {
    return {
      isValid: false,
      error: 'Одноразовые email адреса не поддерживаются'
    };
  }

  return {
    isValid: true
  };
}

// Нормализация email адреса
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Генерация токена для подтверждения/отписки
export function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Создание настроек по умолчанию
export function getDefaultPreferences(): NewsletterPreferences {
  return {
    weeklyDigest: true,
    productUpdates: true,
    newArticles: true,
    specialOffers: false,
    newsUpdates: true,
    ratingsUpdates: true
  };
}

// Проверка, есть ли активные подписки
export function hasActivePreferences(preferences: NewsletterPreferences): boolean {
  return Object.values(preferences).some(value => value === true);
}

// Форматирование настроек для отображения
export function formatPreferencesForDisplay(preferences: NewsletterPreferences): Array<{
  key: keyof NewsletterPreferences;
  label: string;
  description: string;
  enabled: boolean;
}> {
  const labels: Record<keyof NewsletterPreferences, { label: string; description: string }> = {
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

  return Object.entries(preferences).map(([key, enabled]) => ({
    key: key as keyof NewsletterPreferences,
    label: labels[key as keyof NewsletterPreferences].label,
    description: labels[key as keyof NewsletterPreferences].description,
    enabled
  }));
}

// Создание ссылки для отписки
export function createUnsubscribeUrl(email: string, token: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smarthome2026.ru';
  const params = new URLSearchParams({
    email,
    token
  });
  return `${baseUrl}/unsubscribe?${params.toString()}`;
}

// Создание ссылки для управления подпиской
export function createManageSubscriptionUrl(email: string, token: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smarthome2026.ru';
  const params = new URLSearchParams({
    email,
    token
  });
  return `${baseUrl}/manage-subscription?${params.toString()}`;
}

// Проверка частоты подписок (защита от спама)
export function checkSubscriptionRate(email: string, attempts: Array<{ email: string; timestamp: Date }>): boolean {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  // Проверяем количество попыток подписки с этого email за последний час
  const recentAttempts = attempts.filter(
    attempt => attempt.email === email && attempt.timestamp > oneHourAgo
  );
  
  // Максимум 3 попытки в час
  return recentAttempts.length < 3;
}

// Создание сообщения подтверждения
export function createConfirmationMessage(email: string): string {
  return `Спасибо за подписку! Мы отправили письмо с подтверждением на ${email}. Пожалуйста, проверьте почту и перейдите по ссылке для активации подписки.`;
}

// Создание сообщения об успешной подписке
export function createSuccessMessage(preferences: NewsletterPreferences): string {
  const activePreferences = Object.entries(preferences)
    .filter(([_, enabled]) => enabled)
    .map(([key, _]) => {
      const labels = formatPreferencesForDisplay(preferences);
      return labels.find(p => p.key === key)?.label;
    })
    .filter(Boolean);

  if (activePreferences.length === 0) {
    return 'Подписка оформлена, но все уведомления отключены. Вы можете изменить настройки в любое время.';
  }

  return `Подписка успешно оформлена! Вы будете получать: ${activePreferences.join(', ')}.`;
}

// Логирование событий подписки (для аналитики)
export function logSubscriptionEvent(
  event: 'subscribe' | 'unsubscribe' | 'confirm' | 'update_preferences',
  email: string,
  source?: string,
  metadata?: Record<string, unknown>
): void {
  // В реальном приложении здесь была бы отправка в аналитику
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'newsletter_' + event, {
      email_hash: btoa(email).substring(0, 10), // хешированный email для приватности
      source: source || 'unknown',
      ...metadata
    });
  }

  // Логирование в консоль для разработки
  console.log('Newsletter event:', {
    event,
    email: email.replace(/(.{2}).*@/, '$1***@'), // маскируем email
    source,
    timestamp: new Date().toISOString(),
    ...metadata
  });
}

// Проверка доступности email сервиса
export async function checkEmailServiceHealth(): Promise<boolean> {
  try {
    // В реальном приложении здесь была бы проверка API email сервиса
    // Пока возвращаем true для демонстрации
    return true;
  } catch (error) {
    console.error('Email service health check failed:', error);
    return false;
  }
}

// Экспорт подписчиков (для администрирования)
export function exportSubscribers(subscribers: Array<{ email: string; preferences: NewsletterPreferences; subscribedAt: Date }>): string {
  const headers = ['Email', 'Subscribed At', 'Weekly Digest', 'Product Updates', 'New Articles', 'Special Offers', 'News Updates', 'Ratings Updates'];
  
  const csvContent = [
    headers.join(','),
    ...subscribers.map(sub => [
      sub.email,
      sub.subscribedAt.toISOString(),
      sub.preferences.weeklyDigest ? 'Yes' : 'No',
      sub.preferences.productUpdates ? 'Yes' : 'No',
      sub.preferences.newArticles ? 'Yes' : 'No',
      sub.preferences.specialOffers ? 'Yes' : 'No',
      sub.preferences.newsUpdates ? 'Yes' : 'No',
      sub.preferences.ratingsUpdates ? 'Yes' : 'No'
    ].join(','))
  ].join('\n');

  return csvContent;
}