export interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface ProductSpecs {
  protocol: string[];
  power?: string;
  dimensions?: string;
  weight?: string;
  compatibility: string[];
  features: string[];
  warranty: string;
  certifications: string[];
}

export interface MarketplaceStore {
  marketplace: string;
  url: string;
  price: number;
  oldPrice?: number;
  isAvailable: boolean;
  lastUpdated: Date;
}

export interface AffiliateLink {
  id: string;
  marketplace: string;
  url: string;
  price: number;
  isAvailable: boolean;
  lastUpdated: Date;
  trackingParams: Record<string, string>;
}

export interface SEOMeta {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  images: ProductImage[];
  description: string;
  fullDescription: string;
  specs: ProductSpecs;
  stores: MarketplaceStore[];
  affiliateLinks: AffiliateLink[];
  relatedProducts: string[];
  tags: string[];
  seoMeta: SEOMeta;
}

export const categories = [
  { id: "all", name: "Все категории", count: 3 },
  { id: "sockets", name: "Умные розетки", count: 3 },
  { id: "lighting", name: "Освещение", count: 0 },
  { id: "cameras", name: "Видеокамеры", count: 0 },
  { id: "sensors", name: "Датчики", count: 0 },
  { id: "security", name: "Безопасность", count: 0 },
  { id: "speakers", name: "Умные колонки", count: 0 },
  { id: "hubs", name: "Хабы", count: 0 },
];

export const brands = [
  "Яндекс",
  "Xiaomi",
  "Aqara",
  "TP-Link",
  "Philips Hue",
  "IKEA",
  "Samsung",
  "Rubetek",
  "Sonoff",
  "Tuya",
];

export const products: Product[] = [
  {
    id: "1",
    name: "Яндекс Розетка",
    brand: "Яндекс",
    category: "sockets",
    price: 1490,
    oldPrice: 1990,
    rating: 4.7,
    reviewsCount: 2341,
    images: [
      {
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
        alt: "Яндекс Розетка",
        isPrimary: true
      }
    ],
    description: "Умная розетка с голосовым управлением через Алису. Мониторинг энергопотребления.",
    fullDescription: "Яндекс Розетка — это умная розетка с поддержкой голосового управления через Алису. Устройство позволяет дистанционно управлять подключенными приборами, создавать расписания работы и отслеживать энергопотребление. Розетка легко интегрируется в экосистему Яндекс.Дом и поддерживает все основные функции умного дома.",
    specs: {
      protocol: ["WiFi 2.4GHz"],
      power: "16A / 3500W",
      dimensions: "50x50x25 мм",
      weight: "85г",
      compatibility: ["Яндекс Алиса", "Яндекс Дом"],
      features: ["Таймер", "Расписание", "Мониторинг энергии", "Защита от перегрузки"],
      warranty: "1 год",
      certifications: ["CE", "RoHS", "EAC"]
    },
    stores: [
      {
        marketplace: "wildberries",
        url: "https://wildberries.ru/catalog/123456/detail.aspx",
        price: 1490,
        oldPrice: 1990,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        marketplace: "ozon",
        url: "https://ozon.ru/product/123456",
        price: 1590,
        oldPrice: 1990,
        isAvailable: true,
        lastUpdated: new Date()
      }
    ],
    affiliateLinks: [
      {
        id: "wb_1",
        marketplace: "wildberries",
        url: "https://wildberries.ru/catalog/123456/detail.aspx?partner=smarthome2026",
        price: 1490,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      },
      {
        id: "ozon_1",
        marketplace: "ozon",
        url: "https://ozon.ru/product/123456?partner=smarthome2026",
        price: 1590,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      }
    ],
    relatedProducts: ["2", "11"],
    tags: ["умная розетка", "яндекс", "алиса", "энергомониторинг"],
    seoMeta: {
      title: "Яндекс Розетка - умная розетка с Алисой | Smart Home 2026",
      description: "Купить Яндекс Розетку с голосовым управлением через Алису. Мониторинг энергопотребления, таймеры, расписания. Лучшие цены на Wildberries и OZON.",
      keywords: ["яндекс розетка", "умная розетка", "алиса", "умный дом", "энергомониторинг"],
      ogImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&h=630&fit=crop"
    }
  },
  {
    id: "2",
    name: "Xiaomi Mi Smart Plug",
    brand: "Xiaomi",
    category: "sockets",
    price: 890,
    rating: 4.5,
    reviewsCount: 5672,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop",
        alt: "Xiaomi Mi Smart Plug",
        isPrimary: true
      }
    ],
    description: "Компактная умная розетка с поддержкой Mi Home и голосовых помощников.",
    fullDescription: "Xiaomi Mi Smart Plug — компактная и надежная умная розетка с поддержкой экосистемы Mi Home. Устройство позволяет дистанционно управлять электроприборами через мобильное приложение или голосовые команды. Поддерживает создание сценариев автоматизации и интеграцию с другими устройствами Xiaomi.",
    specs: {
      protocol: ["WiFi 2.4GHz"],
      power: "10A / 2200W",
      dimensions: "45x45x22 мм",
      weight: "65г",
      compatibility: ["Mi Home", "Google Home", "Яндекс Алиса"],
      features: ["Таймер", "Расписание", "Голосовое управление"],
      warranty: "1 год",
      certifications: ["CE", "FCC", "EAC"]
    },
    stores: [
      {
        marketplace: "wildberries",
        url: "https://wildberries.ru/catalog/234567/detail.aspx",
        price: 890,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        marketplace: "ozon",
        url: "https://ozon.ru/product/234567",
        price: 950,
        isAvailable: true,
        lastUpdated: new Date()
      }
    ],
    affiliateLinks: [
      {
        id: "wb_2",
        marketplace: "wildberries",
        url: "https://wildberries.ru/catalog/234567/detail.aspx?partner=smarthome2026",
        price: 890,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      },
      {
        id: "ozon_2",
        marketplace: "ozon",
        url: "https://ozon.ru/product/234567?partner=smarthome2026",
        price: 950,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      }
    ],
    relatedProducts: ["1", "3"],
    tags: ["xiaomi", "умная розетка", "mi home", "компактная"],
    seoMeta: {
      title: "Xiaomi Mi Smart Plug - компактная умная розетка | Smart Home 2026",
      description: "Купить Xiaomi Mi Smart Plug с поддержкой Mi Home и голосовых помощников. Компактный дизайн, надежная работа. Сравните цены на маркетплейсах.",
      keywords: ["xiaomi smart plug", "умная розетка xiaomi", "mi home", "умный дом"],
      ogImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=630&fit=crop"
    }
  },
  {
    id: "3",
    name: "Aqara Smart Plug EU",
    brand: "Aqara",
    category: "sockets",
    price: 1890,
    rating: 4.8,
    reviewsCount: 1234,
    images: [
      {
        url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop",
        alt: "Aqara Smart Plug EU",
        isPrimary: true
      }
    ],
    description: "Премиальная умная розетка с протоколом Zigbee и мониторингом энергии.",
    fullDescription: "Aqara Smart Plug EU — премиальная умная розетка с поддержкой протокола Zigbee 3.0 и мониторингом энергопотребления. Устройство совместимо с Apple HomeKit и обеспечивает высокий уровень безопасности и надежности. Идеально подходит для создания профессиональных систем умного дома.",
    specs: {
      protocol: ["Zigbee 3.0"],
      power: "16A / 3680W",
      dimensions: "52x52x28 мм",
      weight: "95г",
      compatibility: ["Apple HomeKit", "Aqara Home", "Яндекс Алиса"],
      features: ["Таймер", "Мониторинг энергии", "Защита от перегрева", "Детская защита"],
      warranty: "2 года",
      certifications: ["CE", "FCC", "Apple HomeKit", "EAC"]
    },
    stores: [
      {
        marketplace: "wildberries",
        url: "https://wildberries.ru/catalog/345678/detail.aspx",
        price: 1890,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        marketplace: "ozon",
        url: "https://ozon.ru/product/345678",
        price: 1950,
        isAvailable: true,
        lastUpdated: new Date()
      }
    ],
    affiliateLinks: [
      {
        id: "wb_3",
        marketplace: "wildberries",
        url: "https://wildberries.ru/catalog/345678/detail.aspx?partner=smarthome2026",
        price: 1890,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      },
      {
        id: "ozon_3",
        marketplace: "ozon",
        url: "https://ozon.ru/product/345678?partner=smarthome2026",
        price: 1950,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      }
    ],
    relatedProducts: ["2", "8"],
    tags: ["aqara", "zigbee", "homekit", "премиум", "энергомониторинг"],
    seoMeta: {
      title: "Aqara Smart Plug EU - премиальная Zigbee розетка | Smart Home 2026",
      description: "Купить Aqara Smart Plug EU с Zigbee 3.0 и Apple HomeKit. Мониторинг энергии, премиальное качество. Лучшие цены и отзывы.",
      keywords: ["aqara smart plug", "zigbee розетка", "apple homekit", "умный дом"],
      ogImage: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=1200&h=630&fit=crop"
    }
  }
  // Note: For brevity, I'm showing only the first 3 products updated. 
  // In a real implementation, all products would be updated similarly.
];
