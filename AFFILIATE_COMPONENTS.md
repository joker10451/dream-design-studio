# Компоненты партнерских ссылок

Система управления партнерскими ссылками для Smart Home 2026, включающая компоненты для отображения, трекинга и монетизации партнерских ссылок.

## Компоненты

### AffiliateButton
Кнопка для партнерских ссылок с автоматическим трекингом кликов.

```tsx
import { AffiliateButton } from '@/components/affiliate';

<AffiliateButton 
  link={affiliateLink}
  variant="default" // "default" | "compact" | "minimal"
  showPrice={true}
  showDiscount={true}
  onClick={(link) => console.log('Clicked:', link)}
/>
```

### AffiliateDisclosure
Компонент для раскрытия информации о партнерских программах (обязательно по закону).

```tsx
import { AffiliateDisclosure } from '@/components/affiliate';

<AffiliateDisclosure 
  variant="alert" // "alert" | "card" | "inline" | "footer"
  showDetails={true}
/>
```

### AffiliateLinksGrid
Сетка партнерских ссылок с сравнением цен и трекингом.

```tsx
import { AffiliateLinksGrid } from '@/components/affiliate';

<AffiliateLinksGrid
  links={product.affiliateLinks}
  productId={product.id}
  source="product_page"
  title="Где купить"
  showComparison={true}
  showDisclosure={true}
  variant="grid" // "grid" | "list" | "compact"
/>
```

### ContextualAffiliateLinks
Контекстуальные рекомендации товаров на основе содержимого страницы.

```tsx
import { ContextualAffiliateLinks } from '@/components/affiliate';

<ContextualAffiliateLinks
  context="article" // "article" | "news" | "rating" | "calculator" | "search"
  contentId="article-123"
  keywords={["умная розетка", "xiaomi"]}
  category="sockets"
  maxItems={3}
/>
```

### AffiliateTracker
Провайдер для трекинга партнерских ссылок (уже интегрирован в App.tsx).

```tsx
import { AffiliateTracker, useAffiliateTracking } from '@/components/affiliate';

// В компоненте
const { trackClick, trackConversion, getClickStats } = useAffiliateTracking();

// Трекинг клика
trackClick(affiliateLink, 'product_page', productId);

// Трекинг конверсии
trackConversion(linkId, 'wildberries', 1500, 'order-123');
```

## Утилиты

### affiliateUtils.ts
Набор утилит для работы с партнерскими ссылками:

```tsx
import { 
  generateAffiliateUrl,
  getBestPrice,
  validateAffiliateLink,
  formatPrice,
  calculateCommission
} from '@/lib/affiliateUtils';

// Генерация партнерской ссылки
const trackedUrl = generateAffiliateUrl(
  'https://wildberries.ru/product/123',
  'wildberries',
  'product_page',
  'product-123'
);

// Поиск лучшей цены
const { bestLink, savings, savingsPercent } = getBestPrice(affiliateLinks);

// Валидация ссылки
const { isValid, errors } = validateAffiliateLink(link);
```

## Конфигурация партнеров

Конфигурация маркетплейсов находится в `src/lib/affiliateUtils.ts`:

```tsx
export const AFFILIATE_CONFIG = {
  wildberries: {
    name: 'Wildberries',
    color: '#CB11AB',
    commission: 0.05, // 5%
    trackingParam: 'partner',
    partnerId: 'smarthome2026'
  },
  ozon: {
    name: 'OZON',
    color: '#005BFF',
    commission: 0.03, // 3%
    trackingParam: 'partner',
    partnerId: 'smarthome2026'
  },
  yandex: {
    name: 'Яндекс.Маркет',
    color: '#FC3F1D',
    commission: 0.04, // 4%
    trackingParam: 'clid',
    partnerId: 'smarthome2026'
  }
};
```

## Аналитика и трекинг

Система автоматически отправляет события в:
- Google Analytics 4
- Яндекс.Метрика
- Локальное хранилище (для офлайн режима)

### События трекинга:
- `affiliate_click` - клик по партнерской ссылке
- `affiliate_conversion` - покупка по партнерской ссылке
- `purchase` - событие покупки для GA4

### Локальное хранение:
- `affiliate_clicks` - история кликов
- `affiliate_conversions` - история конверсий
- `analytics_retry_queue` - очередь для повторной отправки

## Соответствие требованиям

### Требование 9.1 - Интеграция с партнерскими программами
✅ Поддержка Wildberries, OZON, Яндекс.Маркет
✅ Автоматическая генерация партнерских ссылок
✅ Конфигурируемые параметры трекинга

### Требование 9.2 - Трекинг кликов
✅ Автоматический трекинг всех кликов
✅ Интеграция с GA4 и Яндекс.Метрика
✅ Локальное сохранение для офлайн режима

### Требование 9.3 - Актуальные цены
✅ Отображение цен с маркетплейсов
✅ Индикаторы актуальности данных
✅ Сравнение цен между площадками

### Требование 9.4 - Контекстуальное размещение
✅ Компонент ContextualAffiliateLinks
✅ Алгоритм релевантности на основе контекста
✅ Адаптивное размещение в статьях, новостях, рейтингах

### Требование 9.5 - Раскрытие информации
✅ Компонент AffiliateDisclosure
✅ Различные варианты отображения
✅ Ссылки на политику партнерских программ
✅ Соответствие российскому законодательству

## Использование в существующих компонентах

Компоненты уже интегрированы в:
- ✅ ProductGrid (каталог товаров)
- ✅ CostCalculator (калькулятор стоимости)
- ✅ MarketplaceComparison (сравнение цен)
- ✅ AffiliateLinksSection (секция партнерских ссылок)

## Тестирование

Базовые тесты находятся в `src/components/affiliate/__tests__/affiliate-components.test.tsx`:
- Рендеринг компонентов
- Обработка кликов
- Форматирование цен
- Распознавание маркетплейсов
- Интеграция с аналитикой

Запуск тестов:
```bash
npm run test
```

## Дальнейшее развитие

1. **API интеграция** - подключение к реальным API маркетплейсов для получения актуальных цен
2. **A/B тестирование** - тестирование различных вариантов размещения ссылок
3. **Расширенная аналитика** - дашборд с детальной статистикой по конверсиям
4. **Автоматизация** - автоматическое обновление партнерских ссылок
5. **Персонализация** - рекомендации на основе истории пользователя