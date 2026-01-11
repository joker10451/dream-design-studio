export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  specs: {
    protocol: string;
    power?: string;
    compatibility: string[];
    features: string[];
  };
  stores: {
    wildberries?: string;
    ozon?: string;
  };
}

export const categories = [
  { id: "all", name: "Все категории", count: 408 },
  { id: "sockets", name: "Умные розетки", count: 45 },
  { id: "lighting", name: "Освещение", count: 62 },
  { id: "cameras", name: "Видеокамеры", count: 38 },
  { id: "sensors", name: "Датчики", count: 54 },
  { id: "security", name: "Безопасность", count: 31 },
  { id: "speakers", name: "Умные колонки", count: 18 },
  { id: "hubs", name: "Хабы", count: 27 },
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
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    description: "Умная розетка с голосовым управлением через Алису. Мониторинг энергопотребления.",
    specs: {
      protocol: "WiFi 2.4GHz",
      power: "16A / 3500W",
      compatibility: ["Яндекс Алиса", "Яндекс Дом"],
      features: ["Таймер", "Расписание", "Мониторинг энергии", "Защита от перегрузки"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "2",
    name: "Xiaomi Mi Smart Plug",
    brand: "Xiaomi",
    category: "sockets",
    price: 890,
    rating: 4.5,
    reviewsCount: 5672,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop",
    description: "Компактная умная розетка с поддержкой Mi Home и голосовых помощников.",
    specs: {
      protocol: "WiFi 2.4GHz",
      power: "10A / 2200W",
      compatibility: ["Mi Home", "Google Home", "Яндекс Алиса"],
      features: ["Таймер", "Расписание", "Голосовое управление"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "3",
    name: "Aqara Smart Plug EU",
    brand: "Aqara",
    category: "sockets",
    price: 1890,
    rating: 4.8,
    reviewsCount: 1234,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=400&fit=crop",
    description: "Премиальная умная розетка с протоколом Zigbee и мониторингом энергии.",
    specs: {
      protocol: "Zigbee 3.0",
      power: "16A / 3680W",
      compatibility: ["Apple HomeKit", "Aqara Home", "Яндекс Алиса"],
      features: ["Таймер", "Мониторинг энергии", "Защита от перегрева", "Детская защита"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "4",
    name: "Philips Hue White",
    brand: "Philips Hue",
    category: "lighting",
    price: 1690,
    oldPrice: 2190,
    rating: 4.9,
    reviewsCount: 3456,
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&h=400&fit=crop",
    description: "Умная лампа с теплым белым светом. Диммирование и сценарии освещения.",
    specs: {
      protocol: "Zigbee + Bluetooth",
      power: "9.5W / 806lm",
      compatibility: ["Philips Hue", "Apple HomeKit", "Google Home", "Яндекс Алиса"],
      features: ["Диммирование", "Сценарии", "Таймер", "Пробуждение"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "5",
    name: "Xiaomi Yeelight LED",
    brand: "Xiaomi",
    category: "lighting",
    price: 990,
    rating: 4.6,
    reviewsCount: 8901,
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=400&fit=crop",
    description: "Умная RGB лампа с 16 миллионами цветов. Синхронизация с музыкой.",
    specs: {
      protocol: "WiFi 2.4GHz",
      power: "10W / 800lm",
      compatibility: ["Mi Home", "Google Home", "Яндекс Алиса"],
      features: ["RGB", "Диммирование", "Музыкальный режим", "Сценарии"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "6",
    name: "Aqara Camera Hub G3",
    brand: "Aqara",
    category: "cameras",
    price: 7990,
    rating: 4.7,
    reviewsCount: 567,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop",
    description: "Умная камера с хабом Zigbee. Распознавание лиц и жестов. 2K разрешение.",
    specs: {
      protocol: "WiFi + Zigbee 3.0",
      power: "5V/2A",
      compatibility: ["Apple HomeKit", "Aqara Home", "Яндекс Алиса"],
      features: ["2K видео", "ИИ распознавание", "PTZ", "Ночное видение", "Хаб Zigbee"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "7",
    name: "Xiaomi Mi 360° Camera",
    brand: "Xiaomi",
    category: "cameras",
    price: 3490,
    oldPrice: 4290,
    rating: 4.5,
    reviewsCount: 4532,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=400&fit=crop",
    description: "Панорамная камера с обзором 360°. Full HD видео и двусторонняя связь.",
    specs: {
      protocol: "WiFi 2.4GHz",
      power: "5V/2A",
      compatibility: ["Mi Home", "Google Home"],
      features: ["1080p", "Обзор 360°", "Ночное видение", "Детекция движения"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "8",
    name: "Aqara Temperature Sensor",
    brand: "Aqara",
    category: "sensors",
    price: 990,
    rating: 4.8,
    reviewsCount: 2345,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
    description: "Датчик температуры и влажности с протоколом Zigbee. Компактный размер.",
    specs: {
      protocol: "Zigbee 3.0",
      power: "CR2032 (2 года)",
      compatibility: ["Apple HomeKit", "Aqara Home", "Яндекс Алиса"],
      features: ["Температура", "Влажность", "Давление", "История"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "9",
    name: "Яндекс Станция Мини",
    brand: "Яндекс",
    category: "speakers",
    price: 4990,
    oldPrice: 5990,
    rating: 4.6,
    reviewsCount: 12456,
    image: "https://images.unsplash.com/photo-1589492477829-5e65395b66cc?w=400&h=400&fit=crop",
    description: "Компактная умная колонка с Алисой. Качественный звук и управление умным домом.",
    specs: {
      protocol: "WiFi + Bluetooth",
      power: "10W",
      compatibility: ["Яндекс Дом", "Zigbee устройства"],
      features: ["Алиса", "Музыка", "Подкасты", "Хаб умного дома"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "10",
    name: "Rubetek Wi-Fi Hub",
    brand: "Rubetek",
    category: "hubs",
    price: 2990,
    rating: 4.3,
    reviewsCount: 876,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    description: "Центр управления умным домом с поддержкой WiFi, Zigbee и RF433.",
    specs: {
      protocol: "WiFi + Zigbee + RF433",
      power: "5V/1A",
      compatibility: ["Rubetek", "Яндекс Алиса", "Google Home"],
      features: ["Мультипротокол", "Сценарии", "Удаленное управление"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "11",
    name: "TP-Link Tapo P100",
    brand: "TP-Link",
    category: "sockets",
    price: 690,
    rating: 4.4,
    reviewsCount: 3421,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop",
    description: "Бюджетная умная розетка с простой настройкой и надежной работой.",
    specs: {
      protocol: "WiFi 2.4GHz",
      power: "10A / 2300W",
      compatibility: ["Tapo", "Google Home", "Яндекс Алиса"],
      features: ["Таймер", "Расписание", "Режим отсутствия"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
  {
    id: "12",
    name: "Sonoff SNZB-02",
    brand: "Sonoff",
    category: "sensors",
    price: 590,
    rating: 4.5,
    reviewsCount: 1567,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop",
    description: "Компактный Zigbee датчик температуры и влажности. Отличное соотношение цена/качество.",
    specs: {
      protocol: "Zigbee 3.0",
      power: "CR2450 (2 года)",
      compatibility: ["eWeLink", "Яндекс Алиса"],
      features: ["Температура", "Влажность", "Компактный"],
    },
    stores: {
      wildberries: "https://wildberries.ru",
      ozon: "https://ozon.ru",
    },
  },
];
