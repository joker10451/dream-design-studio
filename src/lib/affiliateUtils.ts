import { AffiliateLink } from "@/data/products";

// Конфигурация партнерских программ
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
} as const;

export type MarketplaceId = keyof typeof AFFILIATE_CONFIG;

// Генерация партнерской ссылки
export function generateAffiliateUrl(
  baseUrl: string, 
  marketplace: MarketplaceId, 
  source: string = 'website',
  productId?: string
): string {
  const config = AFFILIATE_CONFIG[marketplace];
  if (!config) return baseUrl;

  const url = new URL(baseUrl);
  
  // Добавляем партнерский параметр
  url.searchParams.set(config.trackingParam, config.partnerId);
  
  // Добавляем источник трафика
  url.searchParams.set('utm_source', 'smarthome2026');
  url.searchParams.set('utm_medium', 'affiliate');
  url.searchParams.set('utm_campaign', source);
  
  // Добавляем ID продукта если есть
  if (productId) {
    url.searchParams.set('utm_content', productId);
  }
  
  // Добавляем временную метку для уникальности
  url.searchParams.set('utm_term', Date.now().toString());

  return url.toString();
}

// Валидация партнерской ссылки
export function validateAffiliateLink(link: AffiliateLink): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Проверяем обязательные поля
  if (!link.id) errors.push('Отсутствует ID ссылки');
  if (!link.marketplace) errors.push('Не указан маркетплейс');
  if (!link.url) errors.push('Отсутствует URL');
  if (!link.price || link.price <= 0) errors.push('Некорректная цена');

  // Проверяем URL
  try {
    const url = new URL(link.url);
    const config = AFFILIATE_CONFIG[link.marketplace as MarketplaceId];
    
    if (config && !url.searchParams.has(config.trackingParam)) {
      errors.push(`Отсутствует партнерский параметр ${config.trackingParam}`);
    }
  } catch {
    errors.push('Некорректный URL');
  }

  // Проверяем актуальность данных
  const daysSinceUpdate = (Date.now() - new Date(link.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpdate > 7) {
    errors.push('Данные устарели (более 7 дней)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Получение лучшей цены среди партнерских ссылок
export function getBestPrice(links: AffiliateLink[]): {
  bestLink: AffiliateLink | null;
  savings: number;
  savingsPercent: number;
} {
  const availableLinks = links.filter(link => link.isAvailable);
  
  if (availableLinks.length === 0) {
    return { bestLink: null, savings: 0, savingsPercent: 0 };
  }

  const sortedLinks = [...availableLinks].sort((a, b) => a.price - b.price);
  const bestLink = sortedLinks[0];
  const worstPrice = sortedLinks[sortedLinks.length - 1].price;
  
  const savings = worstPrice - bestLink.price;
  const savingsPercent = worstPrice > 0 ? (savings / worstPrice) * 100 : 0;

  return {
    bestLink,
    savings,
    savingsPercent: Math.round(savingsPercent)
  };
}

// Группировка ссылок по доступности
export function groupLinksByAvailability(links: AffiliateLink[]): {
  available: AffiliateLink[];
  unavailable: AffiliateLink[];
  sortedByPrice: AffiliateLink[];
} {
  const available = links.filter(link => link.isAvailable);
  const unavailable = links.filter(link => !link.isAvailable);
  const sortedByPrice = [...available].sort((a, b) => a.price - b.price);

  return {
    available,
    unavailable,
    sortedByPrice
  };
}

// Расчет потенциальной комиссии
export function calculateCommission(link: AffiliateLink, quantity: number = 1): {
  commission: number;
  commissionPercent: number;
  totalValue: number;
} {
  const config = AFFILIATE_CONFIG[link.marketplace as MarketplaceId];
  const commissionPercent = config?.commission || 0;
  const totalValue = link.price * quantity;
  const commission = totalValue * commissionPercent;

  return {
    commission: Math.round(commission),
    commissionPercent: Math.round(commissionPercent * 100),
    totalValue
  };
}

// Форматирование цены с валютой
export function formatPrice(price: number, currency: string = 'RUB'): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

// Получение информации о скидке
export function getDiscountInfo(currentPrice: number, oldPrice?: number): {
  hasDiscount: boolean;
  discountAmount: number;
  discountPercent: number;
} {
  if (!oldPrice || oldPrice <= currentPrice) {
    return {
      hasDiscount: false,
      discountAmount: 0,
      discountPercent: 0
    };
  }

  const discountAmount = oldPrice - currentPrice;
  const discountPercent = (discountAmount / oldPrice) * 100;

  return {
    hasDiscount: true,
    discountAmount,
    discountPercent: Math.round(discountPercent)
  };
}

// Проверка актуальности цен
export function isPriceStale(lastUpdated: Date, maxAgeHours: number = 24): boolean {
  const ageInHours = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
  return ageInHours > maxAgeHours;
}

// Генерация UTM параметров для трекинга
export function generateUTMParams(
  source: string,
  medium: string = 'affiliate',
  campaign: string,
  content?: string,
  term?: string
): Record<string, string> {
  const params: Record<string, string> = {
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign
  };

  if (content) params.utm_content = content;
  if (term) params.utm_term = term;

  return params;
}

// Создание партнерской ссылки с полным трекингом
export function createTrackedAffiliateLink(
  baseUrl: string,
  marketplace: MarketplaceId,
  productId: string,
  source: string = 'website',
  campaign: string = 'product_page'
): string {
  const config = AFFILIATE_CONFIG[marketplace];
  if (!config) return baseUrl;

  try {
    const url = new URL(baseUrl);
    
    // Партнерский параметр
    url.searchParams.set(config.trackingParam, config.partnerId);
    
    // UTM параметры
    const utmParams = generateUTMParams(
      'smarthome2026',
      'affiliate',
      campaign,
      productId,
      source
    );
    
    Object.entries(utmParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    // Уникальный идентификатор клика
    url.searchParams.set('click_id', `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

    return url.toString();
  } catch (error) {
    console.error('Error creating tracked affiliate link:', error);
    return baseUrl;
  }
}

// Извлечение информации о маркетплейсе из URL
export function extractMarketplaceFromUrl(url: string): MarketplaceId | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    if (hostname.includes('wildberries')) return 'wildberries';
    if (hostname.includes('ozon')) return 'ozon';
    if (hostname.includes('market.yandex')) return 'yandex';

    return null;
  } catch {
    return null;
  }
}

// Очистка партнерских ссылок от устаревших данных
export function cleanupStaleLinks(links: AffiliateLink[], maxAgeHours: number = 168): AffiliateLink[] {
  return links.filter(link => !isPriceStale(link.lastUpdated, maxAgeHours));
}

// Сортировка ссылок по приоритету (цена + доступность + актуальность)
export function sortLinksByPriority(links: AffiliateLink[]): AffiliateLink[] {
  return [...links].sort((a, b) => {
    // Сначала доступные
    if (a.isAvailable && !b.isAvailable) return -1;
    if (!a.isAvailable && b.isAvailable) return 1;

    // Затем по цене (если оба доступны)
    if (a.isAvailable && b.isAvailable) {
      return a.price - b.price;
    }

    // Для недоступных - по дате обновления
    return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
  });
}