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
  { id: "all", name: "Все категории", count: 22 },
  { id: "sockets", name: "Умные розетки", count: 5 },
  { id: "lighting", name: "Освещение", count: 3 },
  { id: "cameras", name: "Видеокамеры", count: 3 },
  { id: "sensors", name: "Датчики", count: 4 },
  { id: "security", name: "Безопасность", count: 3 },
  { id: "speakers", name: "Умные колонки", count: 3 },
  { id: "hubs", name: "Хабы", count: 1 },
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
        url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop",
        alt: "Яндекс Розетка",
        isPrimary: true
      }
    ],
    description: "Умная розетка с голосовым управлением через Алису. Мониторинг энергопотребления.",
    fullDescription: "Яндекс Розетка — это умная розетка с поддержкой голосового управления через Алису. Устройство позволяет дистанционно управлять подключенными приборами, создавать расписания работы и отслеживать энергопотребление.",
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
        url: "https://www.wildberries.ru/catalog/17364782/detail.aspx",
        price: 1490,
        oldPrice: 1990,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        marketplace: "ozon",
        url: "https://www.ozon.ru/product/umnaya-rozetka-yandeks-s-alisoy-267847364/",
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
        url: "https://www.wildberries.ru/catalog/17364782/detail.aspx",
        price: 1490,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      },
      {
        id: "ozon_1",
        marketplace: "ozon",
        url: "https://www.ozon.ru/product/umnaya-rozetka-yandeks-s-alisoy-267847364/",
        price: 1590,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      }
    ],
    relatedProducts: ["2", "21"],
    tags: ["умная розетка", "яндекс", "алиса", "энергомониторинг"],
    seoMeta: {
      title: "Яндекс Розетка - умная розетка с Алисой | Smart Home 2026",
      description: "Купить Яндекс Розетку с голосовым управлением через Алису. Мониторинг энергопотребления, таймеры, расписания.",
      keywords: ["яндекс розетка", "умная розетка", "алиса", "умный дом"],
      ogImage: "https://avatars.mds.yandex.net/get-mpic/5304425/img_id6897953234987236147.jpeg/orig"
    }
  },
  {
    id: "2",
    name: "Xiaomi Smart Power Plug 2 EU",
    brand: "Xiaomi",
    category: "sockets",
    price: 2553,
    oldPrice: 2990,
    rating: 4.5,
    reviewsCount: 5672,
    images: [
      {
        url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=500&h=500&fit=crop",
        alt: "Xiaomi Smart Power Plug 2",
        isPrimary: true
      }
    ],
    description: "Компактная умная розетка с поддержкой Mi Home и голосовых помощников.",
    fullDescription: "Xiaomi Smart Power Plug 2 EU — компактная и надежная умная розетка с поддержкой экосистемы Mi Home. Позволяет дистанционно управлять электроприборами через мобильное приложение.",
    specs: {
      protocol: ["WiFi 2.4GHz"],
      power: "16A / 3680W",
      dimensions: "45x45x72 мм",
      weight: "75г",
      compatibility: ["Mi Home", "Google Home", "Яндекс Алиса"],
      features: ["Таймер", "Расписание", "Голосовое управление"],
      warranty: "1 год",
      certifications: ["CE", "EAC"]
    },
    stores: [
      {
        marketplace: "wildberries",
        url: "https://www.wildberries.ru/catalog/139456721/detail.aspx",
        price: 2490,
        isAvailable: true,
        lastUpdated: new Date()
      },
      {
        marketplace: "ozon",
        url: "https://www.ozon.ru/product/umnaya-rozetka-xiaomi-bhr6868eu-smart-power-plug-2-eu-1058684374/",
        price: 2553,
        isAvailable: true,
        lastUpdated: new Date()
      }
    ],
    affiliateLinks: [
      {
        id: "wb_2",
        marketplace: "wildberries",
        url: "https://www.wildberries.ru/catalog/139456721/detail.aspx",
        price: 2490,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      },
      {
        id: "ozon_2",
        marketplace: "ozon",
        url: "https://www.ozon.ru/product/umnaya-rozetka-xiaomi-bhr6868eu-smart-power-plug-2-eu-1058684374/",
        price: 2553,
        isAvailable: true,
        lastUpdated: new Date(),
        trackingParams: { partner: "smarthome2026", source: "catalog" }
      }
    ],
    relatedProducts: ["1", "3"],
    tags: ["xiaomi", "умная розетка", "mi home", "компактная"],
    seoMeta: {
      title: "Xiaomi Smart Power Plug 2 EU | Smart Home 2026",
      description: "Купить Xiaomi Smart Power Plug 2 EU с поддержкой Mi Home. Сравните цены на маркетплейсах.",
      keywords: ["xiaomi smart plug", "умная розетка xiaomi", "mi home"],
      ogImage: "https://ir.ozone.ru/s3/multimedia-1-d/wc1000/6929091441.jpg"
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
  },
  {
    id: "4",
    name: "Умная лампа Яндекс",
    brand: "Яндекс",
    category: "lighting",
    price: 990,
    rating: 4.8,
    reviewsCount: 15420,
    images: [{ url: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop", alt: "Лампа Яндекс", isPrimary: true }],
    description: "Многоцветная умная лампа с голосовым управлением Алисой.",
    fullDescription: "Создавайте уютную атмосферу с помощью миллионов цветов и оттенков белого.",
    specs: { protocol: ["WiFi 2.4GHz"], compatibility: ["Алиса"], features: ["RGB", "Диммирование"], warranty: "1 год", certifications: ["EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_4", marketplace: "wildberries", url: "#", price: 990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_4", marketplace: "ozon", url: "#", price: 1050, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: [],
    tags: ["лампа", "яндекс", "rgb"],
    seoMeta: { title: "Лампа Яндекс", description: "Умная лампа", keywords: [] }
  },
  {
    id: "5",
    name: "Датчик движения Aqara",
    brand: "Aqara",
    category: "sensors",
    price: 1290,
    rating: 4.9,
    reviewsCount: 3210,
    images: [{ url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop", alt: "Датчик Aqara", isPrimary: true }],
    description: "Компактный датчик движения и освещенности.",
    fullDescription: "Датчик Zigbee для автоматизации освещения и безопасности.",
    specs: { protocol: ["Zigbee"], compatibility: ["HomeKit", "Алиса"], features: ["Освещенность"], warranty: "1 год", certifications: ["EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_5", marketplace: "wildberries", url: "#", price: 1290, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_5", marketplace: "ozon", url: "#", price: 1350, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: [],
    tags: ["датчик", "aqara"],
    seoMeta: { title: "Датчик Aqara", description: "Датчик движения", keywords: [] }
  },
  {
    id: "6",
    name: "Xiaomi Mi Smart Home Hub 2",
    brand: "Xiaomi",
    category: "hubs",
    price: 2990,
    rating: 4.7,
    reviewsCount: 890,
    images: [{ url: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400&h=400&fit=crop", alt: "Хаб Xiaomi", isPrimary: true }],
    description: "Центральный хаб с поддержкой Bluetooth, Zigbee и Wi-Fi.",
    fullDescription: "Универсальный шлюз для подключения всех ваших умных устройств Xiaomi и Aqara.",
    specs: { protocol: ["Zigbee 3.0", "Bluetooth Mesh", "WiFi"], compatibility: ["Mi Home", "Алиса"], features: ["Двухдиапазонный Wi-Fi"], warranty: "1 год", certifications: ["EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_6", marketplace: "wildberries", url: "#", price: 2990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_6", marketplace: "ozon", url: "#", price: 3100, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: [],
    tags: ["хаб", "xiaomi", "шлюз"],
    seoMeta: { title: "Хаб Xiaomi", description: "Умный хаб", keywords: [] }
  },
  // === КАМЕРЫ ===
  {
    id: "7",
    name: "Xiaomi Mi 360° Home Security Camera 2K",
    brand: "Xiaomi",
    category: "cameras",
    price: 3490,
    oldPrice: 4290,
    rating: 4.6,
    reviewsCount: 4521,
    images: [{ url: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=500&h=500&fit=crop", alt: "Камера Xiaomi 360", isPrimary: true }],
    description: "Поворотная камера с разрешением 2K и ночным видением.",
    fullDescription: "Xiaomi Mi 360° — камера видеонаблюдения с панорамным обзором 360°, разрешением 2304×1296p и улучшенным ночным видением.",
    specs: { protocol: ["WiFi 2.4GHz"], power: "5V/2A", compatibility: ["Mi Home", "Алиса"], features: ["Ночное видение", "Обнаружение движения", "Двусторонняя связь"], warranty: "1 год", certifications: ["EAC", "CE"] },
    stores: [
      { marketplace: "wildberries", url: "https://www.wildberries.ru/catalog/52841367/detail.aspx", price: 3490, isAvailable: true, lastUpdated: new Date() },
      { marketplace: "ozon", url: "https://www.ozon.ru/product/ip-kamera-xiaomi-mi-360-home-security-camera-2k-pro-255478923/", price: 3690, isAvailable: true, lastUpdated: new Date() }
    ],
    affiliateLinks: [
      { id: "wb_7", marketplace: "wildberries", url: "https://www.wildberries.ru/catalog/52841367/detail.aspx", price: 3490, isAvailable: true, lastUpdated: new Date(), trackingParams: { partner: "smarthome2026" } },
      { id: "ozon_7", marketplace: "ozon", url: "https://www.ozon.ru/product/ip-kamera-xiaomi-mi-360-home-security-camera-2k-pro-255478923/", price: 3690, isAvailable: true, lastUpdated: new Date(), trackingParams: { partner: "smarthome2026" } }
    ],
    relatedProducts: ["8", "9"],
    tags: ["камера", "xiaomi", "2K", "поворотная"],
    seoMeta: { title: "Xiaomi Mi 360° Camera 2K", description: "Поворотная камера 2K", keywords: ["xiaomi камера", "видеонаблюдение"] }
  },
  {
    id: "8",
    name: "Aqara Camera Hub G3",
    brand: "Aqara",
    category: "cameras",
    price: 7990,
    rating: 4.8,
    reviewsCount: 1245,
    images: [{ url: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop", alt: "Aqara G3", isPrimary: true }],
    description: "Премиальная камера-хаб с AI-распознаванием и Apple HomeKit.",
    fullDescription: "Aqara Camera Hub G3 — камера с функцией Zigbee-хаба, AI-распознаванием жестов и лиц, поддержкой Apple HomeKit Secure Video.",
    specs: { protocol: ["Zigbee 3.0", "WiFi"], compatibility: ["HomeKit", "Aqara Home", "Алиса"], features: ["AI распознавание", "Zigbee Hub", "HomeKit Secure Video"], warranty: "2 года", certifications: ["Apple HomeKit", "EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_8", marketplace: "wildberries", url: "#", price: 7990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_8", marketplace: "ozon", url: "#", price: 8290, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["7", "3"],
    tags: ["aqara", "камера", "homekit", "AI"],
    seoMeta: { title: "Aqara Camera Hub G3", description: "AI-камера с HomeKit", keywords: ["aqara камера", "homekit"] }
  },
  {
    id: "9",
    name: "TP-Link Tapo C200",
    brand: "TP-Link",
    category: "cameras",
    price: 2190,
    rating: 4.5,
    reviewsCount: 8932,
    images: [{ url: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400&h=400&fit=crop", alt: "Tapo C200", isPrimary: true }],
    description: "Бюджетная поворотная камера с Full HD и ночным видением.",
    fullDescription: "TP-Link Tapo C200 — доступная IP-камера с поворотом 360°, Full HD разрешением и ИК-подсветкой до 9 метров.",
    specs: { protocol: ["WiFi 2.4GHz"], power: "5V/1A", compatibility: ["Tapo App", "Алиса"], features: ["Ночное видение 9м", "Обнаружение движения", "microSD до 256GB"], warranty: "3 года", certifications: ["CE", "EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_9", marketplace: "wildberries", url: "#", price: 2190, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_9", marketplace: "ozon", url: "#", price: 2290, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["7"],
    tags: ["tp-link", "tapo", "камера", "бюджетная"],
    seoMeta: { title: "TP-Link Tapo C200", description: "Бюджетная IP-камера", keywords: ["tapo камера", "tp-link"] }
  },
  // === БЕЗОПАСНОСТЬ ===
  {
    id: "10",
    name: "Aqara Door and Window Sensor P2",
    brand: "Aqara",
    category: "security",
    price: 1490,
    rating: 4.9,
    reviewsCount: 2156,
    images: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", alt: "Датчик двери Aqara", isPrimary: true }],
    description: "Датчик открытия двери/окна с Thread и Matter.",
    fullDescription: "Aqara Door Sensor P2 — датчик открытия нового поколения с поддержкой Thread/Matter для максимальной совместимости.",
    specs: { protocol: ["Thread", "Matter"], compatibility: ["HomeKit", "Aqara Home", "Алиса"], features: ["Thread/Matter", "Автоматизация", "Низкое энергопотребление"], warranty: "2 года", certifications: ["Matter", "Thread"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_10", marketplace: "wildberries", url: "#", price: 1490, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_10", marketplace: "ozon", url: "#", price: 1590, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["5", "11"],
    tags: ["aqara", "датчик", "дверь", "matter"],
    seoMeta: { title: "Aqara Door Sensor P2", description: "Датчик двери Matter", keywords: ["датчик двери", "matter"] }
  },
  {
    id: "11",
    name: "Rubetek Сирена RS-3218",
    brand: "Rubetek",
    category: "security",
    price: 1990,
    rating: 4.4,
    reviewsCount: 567,
    images: [{ url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop", alt: "Сирена Rubetek", isPrimary: true }],
    description: "Громкая WiFi-сирена для системы безопасности умного дома.",
    fullDescription: "Rubetek RS-3218 — беспроводная сирена 110дБ с интеграцией в системы Rubetek и Яндекс.Алиса.",
    specs: { protocol: ["WiFi 2.4GHz"], power: "Батарейки CR123A", compatibility: ["Rubetek", "Алиса"], features: ["110 дБ", "Автономная работа", "Push-уведомления"], warranty: "1 год", certifications: ["EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_11", marketplace: "wildberries", url: "#", price: 1990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_11", marketplace: "ozon", url: "#", price: 2090, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["10"],
    tags: ["rubetek", "сирена", "безопасность"],
    seoMeta: { title: "Rubetek Сирена", description: "WiFi сирена", keywords: ["сирена", "rubetek"] }
  },
  {
    id: "12",
    name: "Xiaomi Mi Smart Door Lock E",
    brand: "Xiaomi",
    category: "security",
    price: 14990,
    rating: 4.7,
    reviewsCount: 2341,
    images: [{ url: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop", alt: "Замок Xiaomi", isPrimary: true }],
    description: "Умный дверной замок с отпечатком пальца и NFC.",
    fullDescription: "Xiaomi Mi Smart Door Lock E — электронный замок с 6 способами разблокировки: отпечаток, код, NFC, ключ, Bluetooth, пароль.",
    specs: { protocol: ["Bluetooth", "NFC"], compatibility: ["Mi Home", "Алиса"], features: ["Отпечаток пальца", "NFC", "Код", "Ключ"], warranty: "2 года", certifications: ["EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_12", marketplace: "wildberries", url: "#", price: 14990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_12", marketplace: "ozon", url: "#", price: 15490, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["10", "11"],
    tags: ["xiaomi", "замок", "безопасность", "NFC"],
    seoMeta: { title: "Xiaomi Smart Door Lock E", description: "Умный замок", keywords: ["умный замок", "xiaomi"] }
  },
  // === УМНЫЕ КОЛОНКИ ===
  {
    id: "13",
    name: "Яндекс Станция Лайт",
    brand: "Яндекс",
    category: "speakers",
    price: 5490,
    oldPrice: 6990,
    rating: 4.6,
    reviewsCount: 12453,
    images: [{ url: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=500&h=500&fit=crop", alt: "Станция Лайт", isPrimary: true }],
    description: "Компактная умная колонка с Алисой в 5 цветах.",
    fullDescription: "Яндекс Станция Лайт — компактная колонка с голосовым помощником Алиса. Управление умным домом, музыка, ответы на вопросы.",
    specs: { protocol: ["WiFi", "Bluetooth"], compatibility: ["Алиса", "Яндекс Дом"], features: ["Голосовое управление", "Музыка", "Управление умным домом"], warranty: "1 год", certifications: ["EAC"] },
    stores: [
      { marketplace: "wildberries", url: "https://www.wildberries.ru/catalog/48656318/detail.aspx", price: 5490, isAvailable: true, lastUpdated: new Date() },
      { marketplace: "ozon", url: "https://www.ozon.ru/product/yandeks-stantsiya-layt-s-alisoy-334455667/", price: 5690, isAvailable: true, lastUpdated: new Date() }
    ],
    affiliateLinks: [
      { id: "wb_13", marketplace: "wildberries", url: "https://www.wildberries.ru/catalog/48656318/detail.aspx", price: 5490, isAvailable: true, lastUpdated: new Date(), trackingParams: { partner: "smarthome2026" } },
      { id: "ozon_13", marketplace: "ozon", url: "https://www.ozon.ru/product/yandeks-stantsiya-layt-s-alisoy-334455667/", price: 5690, isAvailable: true, lastUpdated: new Date(), trackingParams: { partner: "smarthome2026" } }
    ],
    relatedProducts: ["14", "15"],
    tags: ["яндекс", "алиса", "колонка"],
    seoMeta: { title: "Яндекс Станция Лайт", description: "Умная колонка Алиса", keywords: ["яндекс станция", "алиса"] }
  },
  {
    id: "14",
    name: "Яндекс Станция Макс",
    brand: "Яндекс",
    category: "speakers",
    price: 19990,
    rating: 4.8,
    reviewsCount: 5678,
    images: [{ url: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400&h=400&fit=crop", alt: "Станция Макс", isPrimary: true }],
    description: "Флагманская станция с LED-дисплеем и Hi-Res звуком.",
    fullDescription: "Яндекс Станция Макс — топовая умная колонка с LED-экраном, звуком 65 Вт и поддержкой Zigbee-устройств.",
    specs: { protocol: ["WiFi", "Bluetooth", "Zigbee"], compatibility: ["Алиса", "Яндекс Дом"], features: ["LED дисплей", "65 Вт", "Zigbee Hub"], warranty: "1 год", certifications: ["EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_14", marketplace: "wildberries", url: "#", price: 19990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_14", marketplace: "ozon", url: "#", price: 20490, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["13", "6"],
    tags: ["яндекс", "станция макс", "premium"],
    seoMeta: { title: "Яндекс Станция Макс", description: "Флагманская колонка", keywords: ["яндекс станция макс"] }
  },
  {
    id: "15",
    name: "VK Капсула Мини",
    brand: "VK",
    category: "speakers",
    price: 3990,
    rating: 4.3,
    reviewsCount: 3421,
    images: [{ url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop", alt: "VK Капсула", isPrimary: true }],
    description: "Компактная колонка с голосовым помощником Маруся.",
    fullDescription: "VK Капсула Мини — умная колонка с ассистентом Маруся. Музыка из VK, управление умным домом, детский режим.",
    specs: { protocol: ["WiFi", "Bluetooth"], compatibility: ["Маруся", "Smart Home"], features: ["Маруся", "VK Музыка", "Детский режим"], warranty: "1 год", certifications: ["EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_15", marketplace: "wildberries", url: "#", price: 3990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_15", marketplace: "ozon", url: "#", price: 4190, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["13"],
    tags: ["vk", "маруся", "колонка"],
    seoMeta: { title: "VK Капсула Мини", description: "Колонка Маруся", keywords: ["vk капсула", "маруся"] }
  },
  // === ДОПОЛНИТЕЛЬНОЕ ОСВЕЩЕНИЕ ===
  {
    id: "16",
    name: "Philips Hue White and Color Ambiance",
    brand: "Philips Hue",
    category: "lighting",
    price: 3490,
    rating: 4.9,
    reviewsCount: 6789,
    images: [{ url: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=400&h=400&fit=crop", alt: "Philips Hue", isPrimary: true }],
    description: "Премиальная RGB лампа с 16 миллионами цветов.",
    fullDescription: "Philips Hue — эталон умного освещения. 16 млн цветов, синхронизация с музыкой и фильмами, голосовое управление.",
    specs: { protocol: ["Zigbee", "Bluetooth"], compatibility: ["Hue Bridge", "Алиса", "HomeKit"], features: ["16 млн цветов", "Синхронизация", "Таймеры"], warranty: "2 года", certifications: ["CE", "EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_16", marketplace: "wildberries", url: "#", price: 3490, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_16", marketplace: "ozon", url: "#", price: 3690, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["4", "17"],
    tags: ["philips", "hue", "rgb", "освещение"],
    seoMeta: { title: "Philips Hue Ambiance", description: "RGB лампа Philips", keywords: ["philips hue", "умное освещение"] }
  },
  {
    id: "17",
    name: "IKEA TRÅDFRI LED лампа E27",
    brand: "IKEA",
    category: "lighting",
    price: 990,
    rating: 4.4,
    reviewsCount: 2345,
    images: [{ url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop", alt: "IKEA лампа", isPrimary: true }],
    description: "Доступная умная лампа с регулировкой яркости и температуры.",
    fullDescription: "IKEA TRÅDFRI — бюджетная умная лампа с диммированием и настройкой цветовой температуры через приложение IKEA Home Smart.",
    specs: { protocol: ["Zigbee"], compatibility: ["IKEA Home Smart", "Алиса"], features: ["Диммирование", "Температура 2200-4000K"], warranty: "1 год", certifications: ["CE", "EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_17", marketplace: "wildberries", url: "#", price: 990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_17", marketplace: "ozon", url: "#", price: 1090, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["16", "4"],
    tags: ["ikea", "лампа", "бюджетная"],
    seoMeta: { title: "IKEA TRÅDFRI", description: "Бюджетная умная лампа", keywords: ["ikea лампа", "tradfri"] }
  },
  // === ДОПОЛНИТЕЛЬНЫЕ ДАТЧИКИ ===
  {
    id: "18",
    name: "Aqara Temperature and Humidity Sensor T1",
    brand: "Aqara",
    category: "sensors",
    price: 1190,
    rating: 4.8,
    reviewsCount: 3456,
    images: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", alt: "Датчик Aqara T1", isPrimary: true }],
    description: "Датчик температуры и влажности с экраном e-ink.",
    fullDescription: "Aqara T1 — компактный датчик температуры и влажности с дисплеем e-ink, работающий по Zigbee 3.0.",
    specs: { protocol: ["Zigbee 3.0"], compatibility: ["HomeKit", "Aqara Home", "Алиса"], features: ["E-ink дисплей", "Высокая точность", "2 года автономии"], warranty: "2 года", certifications: ["HomeKit", "EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_18", marketplace: "wildberries", url: "#", price: 1190, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_18", marketplace: "ozon", url: "#", price: 1290, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["5", "19"],
    tags: ["aqara", "датчик", "температура", "влажность"],
    seoMeta: { title: "Aqara Temperature Sensor T1", description: "Датчик температуры", keywords: ["датчик температуры", "aqara"] }
  },
  {
    id: "19",
    name: "Xiaomi Mi Flood Detector",
    brand: "Xiaomi",
    category: "sensors",
    price: 890,
    rating: 4.6,
    reviewsCount: 1234,
    images: [{ url: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?w=400&h=400&fit=crop", alt: "Датчик протечки", isPrimary: true }],
    description: "Датчик протечки воды для защиты от затопления.",
    fullDescription: "Xiaomi Flood Detector — беспроводной датчик протечки для оперативного оповещения о затоплении.",
    specs: { protocol: ["Zigbee"], compatibility: ["Mi Home", "Алиса"], features: ["Защита IP67", "Моментальное оповещение"], warranty: "1 год", certifications: ["EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_19", marketplace: "wildberries", url: "#", price: 890, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_19", marketplace: "ozon", url: "#", price: 990, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["18", "5"],
    tags: ["xiaomi", "датчик", "протечка", "защита"],
    seoMeta: { title: "Xiaomi Flood Detector", description: "Датчик протечки", keywords: ["датчик протечки", "xiaomi"] }
  },
  {
    id: "20",
    name: "Sonoff SNZB-02 Zigbee",
    brand: "Sonoff",
    category: "sensors",
    price: 590,
    rating: 4.3,
    reviewsCount: 2567,
    images: [{ url: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop", alt: "Sonoff датчик", isPrimary: true }],
    description: "Бюджетный Zigbee датчик температуры и влажности.",
    fullDescription: "Sonoff SNZB-02 — доступный датчик для мониторинга климата в умном доме через eWeLink или сторонние хабы.",
    specs: { protocol: ["Zigbee 3.0"], compatibility: ["eWeLink", "Zigbee хабы"], features: ["Компактный", "Долгая автономия"], warranty: "1 год", certifications: ["CE"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_20", marketplace: "wildberries", url: "#", price: 590, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_20", marketplace: "ozon", url: "#", price: 650, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["18"],
    tags: ["sonoff", "датчик", "zigbee", "бюджетный"],
    seoMeta: { title: "Sonoff SNZB-02", description: "Бюджетный датчик", keywords: ["sonoff датчик", "zigbee"] }
  },
  // === ДОПОЛНИТЕЛЬНЫЕ РОЗЕТКИ ===
  {
    id: "21",
    name: "TP-Link Tapo P100",
    brand: "TP-Link",
    category: "sockets",
    price: 790,
    rating: 4.4,
    reviewsCount: 7654,
    images: [{ url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop", alt: "Tapo P100", isPrimary: true }],
    description: "Самая доступная умная розетка с голосовым управлением.",
    fullDescription: "TP-Link Tapo P100 — бюджетная WiFi-розетка с поддержкой Alexa, Google Home и расписаний.",
    specs: { protocol: ["WiFi 2.4GHz"], power: "10A / 2300W", compatibility: ["Tapo App", "Алиса", "Google Home"], features: ["Таймер", "Расписание", "Удаленное управление"], warranty: "3 года", certifications: ["CE", "EAC"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_21", marketplace: "wildberries", url: "#", price: 790, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_21", marketplace: "ozon", url: "#", price: 850, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["1", "2"],
    tags: ["tp-link", "tapo", "розетка", "бюджетная"],
    seoMeta: { title: "TP-Link Tapo P100", description: "Бюджетная розетка", keywords: ["tapo розетка", "tp-link"] }
  },
  {
    id: "22",
    name: "Sonoff S26R2",
    brand: "Sonoff",
    category: "sockets",
    price: 650,
    rating: 4.2,
    reviewsCount: 3421,
    images: [{ url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop", alt: "Sonoff S26", isPrimary: true }],
    description: "Компактная WiFi розетка для DIY-автоматизации.",
    fullDescription: "Sonoff S26R2 — популярная розетка среди энтузиастов умного дома. Поддержка eWeLink и прошивки Tasmota.",
    specs: { protocol: ["WiFi 2.4GHz"], power: "10A / 2200W", compatibility: ["eWeLink", "Алиса"], features: ["Компактная", "DIY-дружелюбная"], warranty: "1 год", certifications: ["CE"] },
    stores: [],
    affiliateLinks: [
      { id: "wb_22", marketplace: "wildberries", url: "#", price: 650, isAvailable: true, lastUpdated: new Date(), trackingParams: {} },
      { id: "ozon_22", marketplace: "ozon", url: "#", price: 720, isAvailable: true, lastUpdated: new Date(), trackingParams: {} }
    ],
    relatedProducts: ["21", "20"],
    tags: ["sonoff", "розетка", "DIY"],
    seoMeta: { title: "Sonoff S26R2", description: "DIY розетка", keywords: ["sonoff розетка"] }
  }
];
