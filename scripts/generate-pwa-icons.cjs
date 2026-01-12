// Скрипт для генерации PWA иконок
// Запускать: node scripts/generate-pwa-icons.cjs

const fs = require('fs');
const path = require('path');

console.log('🎨 Генерируем PWA иконки...');

// Читаем SVG иконку
const svgPath = path.join(__dirname, '../public/icon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

console.log('✅ SVG иконка найдена');

// Создаем простые PNG заглушки (base64)
const createPngPlaceholder = (size) => {
  // Простая PNG заглушка 1x1 пиксель, прозрачная
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77zgAAAABJRU5ErkJggg==';
  return Buffer.from(pngBase64, 'base64');
};

// Создаем PNG файлы
const sizes = [192, 512];
sizes.forEach(size => {
  const pngPath = path.join(__dirname, `../public/pwa-${size}x${size}.png`);
  const pngData = createPngPlaceholder(size);
  fs.writeFileSync(pngPath, pngData);
  console.log(`✅ Создан pwa-${size}x${size}.png`);
});

// Обновляем манифест для использования PNG
const manifestPath = path.join(__dirname, '../public/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

manifest.icons = [
  {
    "src": "/favicon.ico",
    "sizes": "16x16 32x32",
    "type": "image/x-icon"
  },
  {
    "src": "/pwa-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/pwa-512x512.png", 
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any"
  },
  {
    "src": "/icon.svg",
    "sizes": "192x192",
    "type": "image/svg+xml",
    "purpose": "maskable"
  }
];

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log('✅ Манифест обновлен');

console.log('🎉 PWA иконки созданы!');
console.log('💡 Для лучшего качества замени PNG файлы на настоящие иконки');