# Интеграция системы подписки с email сервисами

## Обзор

Созданная система подписки использует моковые API для демонстрации функциональности. Для продакшена необходимо интегрировать с реальными email сервисами.

## Поддерживаемые сервисы

### 1. MailChimp (Рекомендуется)
- ✅ Популярный и надежный
- ✅ Хорошая бесплатная версия (до 500 контактов)
- ✅ Отличная аналитика
- ✅ GDPR совместимость

### 2. SendGrid
- ✅ Высокая доставляемость
- ✅ Хорошее API
- ✅ Бесплатно до 100 писем/день

### 3. Mailgun
- ✅ Надежный сервис
- ✅ Хорошие цены
- ✅ Отличное API

### 4. Российские сервисы
- UniSender (российский аналог)
- SendPulse
- MailRu для бизнеса

## Пошаговая интеграция

### Шаг 1: Выбор и настройка сервиса

#### MailChimp
1. Зарегистрируйтесь на [mailchimp.com](https://mailchimp.com)
2. Создайте аудиторию (Audience)
3. Получите API ключ в Account → Extras → API keys
4. Найдите Audience ID в настройках аудитории

#### SendGrid
1. Зарегистрируйтесь на [sendgrid.com](https://sendgrid.com)
2. Создайте API ключ в Settings → API Keys
3. Настройте отправителя в Settings → Sender Authentication

### Шаг 2: Установка зависимостей

```bash
# Для MailChimp
npm install @mailchimp/mailchimp_marketing

# Для SendGrid
npm install @sendgrid/mail

# Для универсального решения
npm install nodemailer
```

### Шаг 3: Создание конфигурации

Создайте файл `.env.local`:

```env
# MailChimp
MAILCHIMP_API_KEY=your_api_key_here
MAILCHIMP_AUDIENCE_ID=your_audience_id_here
MAILCHIMP_SERVER_PREFIX=us1

# SendGrid
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=noreply@smarthome2026.ru
SENDGRID_FROM_NAME=Smart Home 2026

# Общие настройки
EMAIL_SERVICE=mailchimp
NEWSLETTER_FROM_EMAIL=newsletter@smarthome2026.ru
NEWSLETTER_FROM_NAME=Smart Home 2026
NEWSLETTER_REPLY_TO=support@smarthome2026.ru
```

### Шаг 4: Создание API сервиса

Создайте файл `src/lib/emailService.ts`:

```typescript
import { NewsletterSubscriptionRequest, NewsletterPreferences } from '@/types/newsletter';

// Интерфейс для email сервиса
export interface EmailService {
  subscribe(request: NewsletterSubscriptionRequest): Promise<{ success: boolean; message: string; subscriptionId?: string }>;
  unsubscribe(email: string, reason?: string): Promise<{ success: boolean; message: string }>;
  updatePreferences(email: string, preferences: NewsletterPreferences): Promise<{ success: boolean; message: string }>;
  sendConfirmationEmail(email: string, confirmationUrl: string): Promise<boolean>;
  sendWelcomeEmail(email: string, preferences: NewsletterPreferences): Promise<boolean>;
}

// MailChimp реализация
class MailChimpService implements EmailService {
  private client: any;
  private audienceId: string;

  constructor() {
    if (typeof window === 'undefined') {
      const mailchimp = require('@mailchimp/mailchimp_marketing');
      mailchimp.setConfig({
        apiKey: process.env.MAILCHIMP_API_KEY,
        server: process.env.MAILCHIMP_SERVER_PREFIX,
      });
      this.client = mailchimp;
      this.audienceId = process.env.MAILCHIMP_AUDIENCE_ID!;
    }
  }

  async subscribe(request: NewsletterSubscriptionRequest) {
    try {
      const response = await this.client.lists.addListMember(this.audienceId, {
        email_address: request.email,
        status: 'pending', // Требует подтверждения
        merge_fields: {
          SOURCE: request.source || 'website'
        },
        interests: this.convertPreferencesToInterests(request.preferences),
        tags: ['website_signup']
      });

      return {
        success: true,
        message: 'Подписка оформлена! Проверьте почту для подтверждения.',
        subscriptionId: response.id
      };
    } catch (error: any) {
      if (error.response?.body?.title === 'Member Exists') {
        return {
          success: false,
          message: 'Этот email уже подписан на рассылку'
        };
      }
      throw new Error('Ошибка при подписке: ' + error.message);
    }
  }

  async unsubscribe(email: string, reason?: string) {
    try {
      await this.client.lists.updateListMember(this.audienceId, this.getMD5Hash(email), {
        status: 'unsubscribed'
      });

      // Опционально: сохранить причину отписки
      if (reason) {
        await this.client.lists.updateListMemberTags(this.audienceId, this.getMD5Hash(email), {
          tags: [{ name: `unsubscribe_reason_${reason.substring(0, 20)}`, status: 'active' }]
        });
      }

      return {
        success: true,
        message: 'Вы успешно отписались от рассылки'
      };
    } catch (error: any) {
      throw new Error('Ошибка при отписке: ' + error.message);
    }
  }

  async updatePreferences(email: string, preferences: NewsletterPreferences) {
    try {
      await this.client.lists.updateListMember(this.audienceId, this.getMD5Hash(email), {
        interests: this.convertPreferencesToInterests(preferences)
      });

      return {
        success: true,
        message: 'Настройки подписки обновлены'
      };
    } catch (error: any) {
      throw new Error('Ошибка при обновлении настроек: ' + error.message);
    }
  }

  async sendConfirmationEmail(email: string, confirmationUrl: string) {
    // MailChimp автоматически отправляет письма подтверждения
    return true;
  }

  async sendWelcomeEmail(email: string, preferences: NewsletterPreferences) {
    // Настройте автоматическое приветственное письмо в MailChimp
    return true;
  }

  private convertPreferencesToInterests(preferences?: Partial<NewsletterPreferences>) {
    if (!preferences) return {};
    
    // Сопоставьте ваши настройки с Interest Groups в MailChimp
    return {
      'weekly_digest_id': preferences.weeklyDigest || false,
      'product_updates_id': preferences.productUpdates || false,
      'new_articles_id': preferences.newArticles || false,
      'special_offers_id': preferences.specialOffers || false,
      'news_updates_id': preferences.newsUpdates || false,
      'ratings_updates_id': preferences.ratingsUpdates || false,
    };
  }

  private getMD5Hash(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }
}

// SendGrid реализация
class SendGridService implements EmailService {
  private client: any;

  constructor() {
    if (typeof window === 'undefined') {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.client = sgMail;
    }
  }

  async subscribe(request: NewsletterSubscriptionRequest) {
    try {
      // Добавить контакт в SendGrid
      const contactData = {
        contacts: [{
          email: request.email,
          custom_fields: {
            source: request.source || 'website',
            subscribed_at: new Date().toISOString(),
            ...this.convertPreferencesToCustomFields(request.preferences)
          }
        }]
      };

      const response = await fetch('https://api.sendgrid.com/v3/marketing/contacts', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (!response.ok) {
        throw new Error('Failed to add contact');
      }

      // Отправить письмо подтверждения
      await this.sendConfirmationEmail(request.email, 'confirmation_url_here');

      return {
        success: true,
        message: 'Подписка оформлена! Проверьте почту для подтверждения.',
        subscriptionId: request.email
      };
    } catch (error: any) {
      throw new Error('Ошибка при подписке: ' + error.message);
    }
  }

  async unsubscribe(email: string, reason?: string) {
    // Реализация отписки через SendGrid API
    return { success: true, message: 'Отписка выполнена' };
  }

  async updatePreferences(email: string, preferences: NewsletterPreferences) {
    // Реализация обновления настроек
    return { success: true, message: 'Настройки обновлены' };
  }

  async sendConfirmationEmail(email: string, confirmationUrl: string) {
    const msg = {
      to: email,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL!,
        name: process.env.SENDGRID_FROM_NAME!
      },
      subject: 'Подтвердите подписку на Smart Home 2026',
      html: `
        <h2>Подтвердите подписку</h2>
        <p>Спасибо за интерес к нашему проекту!</p>
        <p><a href="${confirmationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Подтвердить подписку</a></p>
        <p>Если кнопка не работает, скопируйте ссылку: ${confirmationUrl}</p>
      `
    };

    try {
      await this.client.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }
  }

  async sendWelcomeEmail(email: string, preferences: NewsletterPreferences) {
    // Реализация приветственного письма
    return true;
  }

  private convertPreferencesToCustomFields(preferences?: Partial<NewsletterPreferences>) {
    if (!preferences) return {};
    
    return {
      weekly_digest: preferences.weeklyDigest || false,
      product_updates: preferences.productUpdates || false,
      new_articles: preferences.newArticles || false,
      special_offers: preferences.specialOffers || false,
      news_updates: preferences.newsUpdates || false,
      ratings_updates: preferences.ratingsUpdates || false,
    };
  }
}

// Фабрика для создания сервиса
export function createEmailService(): EmailService {
  const serviceType = process.env.EMAIL_SERVICE || 'mailchimp';
  
  switch (serviceType) {
    case 'mailchimp':
      return new MailChimpService();
    case 'sendgrid':
      return new SendGridService();
    default:
      throw new Error(`Unsupported email service: ${serviceType}`);
  }
}
```

### Шаг 5: Создание API роутов (Next.js)

Если используете Next.js, создайте API роуты:

```typescript
// pages/api/newsletter/subscribe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { createEmailService } from '@/lib/emailService';
import { validateEmail } from '@/lib/newsletterUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, preferences, source } = req.body;

    // Валидация
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Подписка через email сервис
    const emailService = createEmailService();
    const result = await emailService.subscribe({ email, preferences, source });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
```

### Шаг 6: Обновление хука useNewsletter

Замените моковые API на реальные:

```typescript
// В src/hooks/useNewsletter.ts
const realNewsletterAPI = {
  subscribe: async (request: NewsletterSubscriptionRequest): Promise<NewsletterSubscriptionResponse> => {
    const response = await fetch('/api/newsletter/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Subscription failed');
    }
    
    return response.json();
  },

  unsubscribe: async (request: NewsletterUnsubscribeRequest) => {
    const response = await fetch('/api/newsletter/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Unsubscribe failed');
    }
    
    return response.json();
  },

  // ... остальные методы
};
```

### Шаг 7: Настройка веб-хуков

Для отслеживания событий (отписки, отказы) настройте веб-хуки:

```typescript
// pages/api/newsletter/webhook.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { type, data } = req.body;

  switch (type) {
    case 'unsubscribe':
      // Обработка отписки
      console.log('User unsubscribed:', data.email);
      break;
    case 'bounce':
      // Обработка отказов
      console.log('Email bounced:', data.email);
      break;
    case 'complaint':
      // Обработка жалоб на спам
      console.log('Spam complaint:', data.email);
      break;
  }

  res.status(200).json({ received: true });
}
```

## Дополнительные возможности

### 1. Автоматические рассылки

Настройте автоматические письма:
- Приветственное письмо
- Еженедельный дайджест
- Уведомления о новых статьях

### 2. Сегментация

Создайте сегменты пользователей:
- По интересам (умные розетки, камеры, датчики)
- По активности (активные читатели, новые подписчики)
- По источнику подписки

### 3. A/B тестирование

Тестируйте разные варианты:
- Темы писем
- Время отправки
- Содержание

### 4. Аналитика

Отслеживайте метрики:
- Открываемость писем
- Клики по ссылкам
- Конверсии в покупки
- Отписки

## Безопасность

1. **Защита API ключей**: Никогда не храните ключи в коде
2. **Валидация данных**: Всегда валидируйте входящие данные
3. **Rate limiting**: Ограничьте количество запросов
4. **GDPR**: Соблюдайте требования по защите данных

## Мониторинг

Настройте мониторинг:
- Логирование ошибок (Sentry)
- Метрики производительности
- Уведомления о проблемах

## Тестирование

Создайте тесты для:
- API эндпоинтов
- Email сервисов
- Валидации данных
- Обработки ошибок

Это руководство поможет вам интегрировать систему подписки с любым email сервисом. Начните с MailChimp для простоты, а затем можете переключиться на другие сервисы по мере роста проекта.