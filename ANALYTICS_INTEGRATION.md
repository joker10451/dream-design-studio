# Интеграция аналитики - Google Analytics 4 и Яндекс.Метрика

## Обзор

Система аналитики интегрирует Google Analytics 4 и Яндекс.Метрику для отслеживания поведения пользователей, конверсий и эффективности контента. Включает GDPR-совместимое управление согласием на использование cookies.

## Настройка

### Переменные окружения

Добавьте в `.env` файл:

```env
# Analytics Configuration
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_YM_COUNTER_ID=12345678
VITE_ENABLE_COOKIE_CONSENT=true
```

### Инициализация

Аналитика автоматически инициализируется через `AnalyticsProvider` в `App.tsx`:

```tsx
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider';

const App = () => (
  <AnalyticsProvider>
    {/* Ваше приложение */}
  </AnalyticsProvider>
);
```

## Использование

### Хук useAnalytics

Основной способ взаимодействия с аналитикой:

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const {
    trackEvent,
    trackProductView,
    trackAffiliateClick,
    trackSearch,
    trackNewsletterSignup,
    trackSocialShare,
    trackCalculatorUse,
    setUserProperties,
    updateConsent,
    getConsent
  } = useAnalytics();

  const handleProductClick = (product) => {
    trackProductView(product.id, product.name, product.category, product.price);
  };

  return (
    <button onClick={handleProductClick}>
      Посмотреть товар
    </button>
  );
}
```

### Автоматическое отслеживание

#### Просмотры страниц
Автоматически отслеживаются при изменении маршрута через React Router.

#### Партнерские ссылки
Автоматически отслеживаются через компонент `AffiliateButton`:

```tsx
import { AffiliateButton } from '@/components/affiliate/AffiliateButton';

<AffiliateButton 
  link={affiliateLink}
  variant="default"
  showPrice={true}
/>
```

## Типы событий

### Стандартные события

1. **page_view** - Просмотр страницы
2. **view_item** - Просмотр товара
3. **affiliate_click** - Клик по партнерской ссылке
4. **search** - Поиск
5. **newsletter_signup** - Подписка на рассылку
6. **share** - Социальный шаринг
7. **calculator_use** - Использование калькулятора
8. **conversion** - Конверсия/покупка

### Пользовательские события

```tsx
const { trackEvent } = useAnalytics();

trackEvent('custom_event', {
  category: 'user_interaction',
  action: 'button_click',
  label: 'header_cta',
  value: 1
});
```

## Управление согласием (GDPR)

### Компонент CookieConsent

Автоматически отображается при первом посещении:

```tsx
import { CookieConsent } from '@/components/analytics/CookieConsent';

<CookieConsent onConsentChange={handleConsentChange} />
```

### Программное управление согласием

```tsx
const { updateConsent, getConsent } = useAnalytics();

// Получить текущее согласие
const currentConsent = getConsent();

// Обновить согласие
updateConsent({
  analytics: true,
  marketing: false,
  functional: true,
  timestamp: new Date()
});
```

## Аналитическая панель

Доступна по адресу `/analytics` для просмотра статистики:

- Ключевые метрики (пользователи, время сессии, конверсия)
- Популярные страницы
- Клики по партнерским ссылкам
- Поисковые запросы
- Графики и диаграммы

## Интеграция с партнерскими ссылками

### AffiliateTracker

Автоматически интегрируется с новой системой аналитики:

```tsx
import { useAffiliateTracking } from '@/components/affiliate/AffiliateTracker';

const { trackClick, trackConversion } = useAffiliateTracking();

// Отслеживание клика
trackClick(affiliateLink, 'product_page', productId);

// Отслеживание конверсии
trackConversion(linkId, 'wildberries', 1500, 'order_123');
```

## Обработка ошибок

Система включает обработку ошибок:

- Graceful degradation при недоступности сервисов
- Локальное кэширование событий
- Повторная отправка при восстановлении соединения
- Логирование ошибок в консоль

## Производительность

### Ленивая загрузка
Скрипты аналитики загружаются асинхронно.

### Кэширование
События кэшируются локально при проблемах с сетью.

### Батчинг
События группируются для оптимизации запросов.

## Отладка

### Режим отладки
Включается автоматически в development режиме:

```tsx
const config = {
  debugMode: import.meta.env.DEV,
  // ...
};
```

### Консольные логи
В режиме отладки все события логируются в консоль.

## Соответствие требованиям

### GDPR
- Согласие пользователя перед отслеживанием
- Возможность отзыва согласия
- Прозрачная информация об использовании данных

### Российское законодательство
- Соответствие ФЗ-152 "О персональных данных"
- Локализованные уведомления
- Возможность отказа от обработки данных

## Миграция с существующей системы

Если у вас уже есть Google Analytics или Яндекс.Метрика:

1. Обновите переменные окружения
2. Удалите старые скрипты из HTML
3. Замените прямые вызовы gtag/ym на хук useAnalytics
4. Настройте согласие на cookies

## Тестирование

Система включает тесты для:
- Инициализации провайдеров
- Отправки событий
- Управления согласием
- Обработки ошибок

Запуск тестов:
```bash
npm run test
```

## Поддержка

При возникновении проблем:
1. Проверьте переменные окружения
2. Убедитесь в корректности ID счетчиков
3. Проверьте консоль браузера на ошибки
4. Используйте режим отладки для диагностики