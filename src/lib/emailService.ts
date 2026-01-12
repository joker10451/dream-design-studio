import { 
  NewsletterSubscriptionRequest, 
  NewsletterSubscriptionResponse,
  NewsletterUnsubscribeRequest,
  NewsletterPreferences 
} from '@/types/newsletter';

// Интерфейс для email сервиса
export interface EmailService {
  subscribe(request: NewsletterSubscriptionRequest): Promise<NewsletterSubscriptionResponse>;
  unsubscribe(request: NewsletterUnsubscribeRequest): Promise<{ success: boolean; message: string }>;
  updatePreferences(email: string, preferences: NewsletterPreferences): Promise<{ success: boolean; message: string }>;
  getSubscription(email: string): Promise<any>;
  sendConfirmationEmail?(email: string, confirmationUrl: string): Promise<boolean>;
  sendWelcomeEmail?(email: string, preferences: NewsletterPreferences): Promise<boolean>;
}

// Моковый сервис (текущая реализация)
class MockEmailService implements EmailService {
  async subscribe(request: NewsletterSubscriptionRequest): Promise<NewsletterSubscriptionResponse> {
    // Симуляция задержки API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Симуляция проверки существующей подписки
    const existingSubscription = localStorage.getItem(`newsletter_${request.email}`);
    if (existingSubscription) {
      const subscription = JSON.parse(existingSubscription);
      if (subscription.isActive) {
        throw new Error('Этот email уже подписан на рассылку');
      }
    }

    // Создание новой подписки
    const subscription = {
      email: request.email.toLowerCase().trim(),
      subscribedAt: new Date(),
      preferences: { 
        weeklyDigest: true,
        productUpdates: true,
        newArticles: true,
        specialOffers: false,
        newsUpdates: true,
        ratingsUpdates: true,
        ...request.preferences 
      },
      isActive: true,
      isConfirmed: false,
      confirmationToken: Math.random().toString(36).substring(2)
    };

    localStorage.setItem(`newsletter_${subscription.email}`, JSON.stringify(subscription));

    return {
      success: true,
      message: `Спасибо за подписку! Мы отправили письмо с подтверждением на ${subscription.email}. Пожалуйста, проверьте почту и перейдите по ссылке для активации подписки.`,
      requiresConfirmation: true,
      subscriptionId: subscription.email
    };
  }

  async unsubscribe(request: NewsletterUnsubscribeRequest): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!request.email) {
      throw new Error('Email адрес обязателен');
    }

    const subscriptionKey = `newsletter_${request.email}`;
    const existingSubscription = localStorage.getItem(subscriptionKey);
    
    if (!existingSubscription) {
      throw new Error('Подписка не найдена');
    }

    const subscription = JSON.parse(existingSubscription);
    subscription.isActive = false;
    subscription.unsubscribedAt = new Date();
    subscription.unsubscribeReason = request.reason;

    localStorage.setItem(subscriptionKey, JSON.stringify(subscription));

    return {
      success: true,
      message: 'Вы успешно отписались от рассылки. Мы сожалеем, что вы уходите!'
    };
  }

  async updatePreferences(email: string, preferences: NewsletterPreferences): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subscriptionKey = `newsletter_${email}`;
    const existingSubscription = localStorage.getItem(subscriptionKey);
    
    if (!existingSubscription) {
      throw new Error('Подписка не найдена');
    }

    const subscription = JSON.parse(existingSubscription);
    subscription.preferences = preferences;
    subscription.updatedAt = new Date();

    localStorage.setItem(subscriptionKey, JSON.stringify(subscription));

    const activePreferences = Object.entries(preferences)
      .filter(([_, enabled]) => enabled)
      .map(([key, _]) => {
        const labels: Record<string, string> = {
          weeklyDigest: 'Еженедельная сводка',
          productUpdates: 'Обновления продуктов',
          newArticles: 'Новые статьи',
          specialOffers: 'Специальные предложения',
          newsUpdates: 'Новости индустрии',
          ratingsUpdates: 'Обновления рейтингов'
        };
        return labels[key];
      })
      .filter(Boolean);

    const message = activePreferences.length === 0 
      ? 'Подписка оформлена, но все уведомления отключены. Вы можете изменить настройки в любое время.'
      : `Подписка успешно оформлена! Вы будете получать: ${activePreferences.join(', ')}.`;

    return {
      success: true,
      message
    };
  }

  async getSubscription(email: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const subscriptionKey = `newsletter_${email}`;
    const existingSubscription = localStorage.getItem(subscriptionKey);
    
    if (!existingSubscription) {
      return null;
    }

    const subscription = JSON.parse(existingSubscription);
    
    // Преобразуем строки дат обратно в объекты Date
    subscription.subscribedAt = new Date(subscription.subscribedAt);
    if (subscription.updatedAt) {
      subscription.updatedAt = new Date(subscription.updatedAt);
    }
    if (subscription.unsubscribedAt) {
      subscription.unsubscribedAt = new Date(subscription.unsubscribedAt);
    }

    return subscription;
  }
}

// MailChimp сервис (для продакшена)
class MailChimpService implements EmailService {
  private apiKey: string;
  private audienceId: string;
  private serverPrefix: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_MAILCHIMP_API_KEY || '';
    this.audienceId = import.meta.env.VITE_MAILCHIMP_AUDIENCE_ID || '';
    this.serverPrefix = import.meta.env.VITE_MAILCHIMP_SERVER_PREFIX || 'us1';
    this.baseUrl = `https://${this.serverPrefix}.api.mailchimp.com/3.0`;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || error.title || 'API request failed');
    }

    return response.json();
  }

  private getMD5Hash(email: string): string {
    // В браузере используем простую реализацию
    // В продакшене лучше использовать crypto-js или серверную реализацию
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  private convertPreferencesToInterests(preferences?: Partial<NewsletterPreferences>) {
    if (!preferences) return {};
    
    // Замените эти ID на реальные Interest Group ID из вашего MailChimp аккаунта
    return {
      'weekly_digest_interest_id': preferences.weeklyDigest || false,
      'product_updates_interest_id': preferences.productUpdates || false,
      'new_articles_interest_id': preferences.newArticles || false,
      'special_offers_interest_id': preferences.specialOffers || false,
      'news_updates_interest_id': preferences.newsUpdates || false,
      'ratings_updates_interest_id': preferences.ratingsUpdates || false,
    };
  }

  async subscribe(request: NewsletterSubscriptionRequest): Promise<NewsletterSubscriptionResponse> {
    try {
      const memberData = {
        email_address: request.email,
        status: 'pending', // Требует подтверждения по email
        merge_fields: {
          SOURCE: request.source || 'website',
          SIGNUP_DATE: new Date().toISOString().split('T')[0]
        },
        interests: this.convertPreferencesToInterests(request.preferences),
        tags: ['website_signup', `source_${request.source || 'unknown'}`]
      };

      const response = await this.makeRequest(`/lists/${this.audienceId}/members`, {
        method: 'POST',
        body: JSON.stringify(memberData)
      });

      return {
        success: true,
        message: 'Подписка оформлена! Проверьте почту для подтверждения.',
        requiresConfirmation: true,
        subscriptionId: response.id
      };
    } catch (error: any) {
      if (error.message.includes('Member Exists')) {
        throw new Error('Этот email уже подписан на рассылку');
      }
      throw new Error('Ошибка при подписке: ' + error.message);
    }
  }

  async unsubscribe(request: NewsletterUnsubscribeRequest): Promise<{ success: boolean; message: string }> {
    try {
      const emailHash = this.getMD5Hash(request.email!);
      
      await this.makeRequest(`/lists/${this.audienceId}/members/${emailHash}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'unsubscribed'
        })
      });

      // Добавляем тег с причиной отписки, если указана
      if (request.reason) {
        await this.makeRequest(`/lists/${this.audienceId}/members/${emailHash}/tags`, {
          method: 'POST',
          body: JSON.stringify({
            tags: [{ 
              name: `unsubscribe_reason_${request.reason.substring(0, 20)}`, 
              status: 'active' 
            }]
          })
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

  async updatePreferences(email: string, preferences: NewsletterPreferences): Promise<{ success: boolean; message: string }> {
    try {
      const emailHash = this.getMD5Hash(email);
      
      await this.makeRequest(`/lists/${this.audienceId}/members/${emailHash}`, {
        method: 'PATCH',
        body: JSON.stringify({
          interests: this.convertPreferencesToInterests(preferences)
        })
      });

      return {
        success: true,
        message: 'Настройки подписки обновлены'
      };
    } catch (error: any) {
      throw new Error('Ошибка при обновлении настроек: ' + error.message);
    }
  }

  async getSubscription(email: string): Promise<any> {
    try {
      const emailHash = this.getMD5Hash(email);
      const member = await this.makeRequest(`/lists/${this.audienceId}/members/${emailHash}`);
      
      if (member.status === 'unsubscribed' || member.status === 'cleaned') {
        return null;
      }

      // Преобразуем данные MailChimp в наш формат
      return {
        email: member.email_address,
        subscribedAt: new Date(member.timestamp_signup),
        preferences: this.convertInterestsToPreferences(member.interests),
        isActive: member.status === 'subscribed',
        isConfirmed: member.status === 'subscribed',
        updatedAt: new Date(member.last_changed)
      };
    } catch (error: any) {
      if (error.message.includes('404')) {
        return null; // Подписка не найдена
      }
      throw error;
    }
  }

  private convertInterestsToPreferences(interests: Record<string, boolean>): NewsletterPreferences {
    return {
      weeklyDigest: interests['weekly_digest_interest_id'] || false,
      productUpdates: interests['product_updates_interest_id'] || false,
      newArticles: interests['new_articles_interest_id'] || false,
      specialOffers: interests['special_offers_interest_id'] || false,
      newsUpdates: interests['news_updates_interest_id'] || false,
      ratingsUpdates: interests['ratings_updates_interest_id'] || false,
    };
  }

  async sendConfirmationEmail(email: string, confirmationUrl: string): Promise<boolean> {
    // MailChimp автоматически отправляет письма подтверждения
    // при статусе 'pending'
    return true;
  }

  async sendWelcomeEmail(email: string, preferences: NewsletterPreferences): Promise<boolean> {
    // Настройте автоматическое приветственное письмо в MailChimp
    // через Automation workflows
    return true;
  }
}

// Фабрика для создания email сервиса
export function createEmailService(): EmailService {
  const serviceType = import.meta.env.VITE_EMAIL_SERVICE || 'mock';
  
  switch (serviceType) {
    case 'mailchimp':
      return new MailChimpService();
    case 'mock':
    default:
      return new MockEmailService();
  }
}

// Экспорт для использования в компонентах
export const emailService = createEmailService();