import { Link } from "react-router-dom";
import { Home, Mail, MessageCircle, Youtube, Instagram } from "lucide-react";

const footerLinks = {
  catalog: [
    { name: "Умные розетки", href: "/catalog/rozhetki" },
    { name: "Освещение", href: "/catalog/osveshchenie" },
    { name: "Видеокамеры", href: "/catalog/videokamery" },
    { name: "Датчики", href: "/catalog/datchiki" },
    { name: "Безопасность", href: "/catalog/bezopasnost" },
  ],
  guides: [
    { name: "Как выбрать устройство", href: "/guides/kak-vybrat" },
    { name: "Установка и настройка", href: "/guides/ustanovka" },
    { name: "Протоколы подключения", href: "/guides/protokoly" },
    { name: "Экономия энергии", href: "/guides/ekonomiya" },
  ],
  company: [
    { name: "О проекте", href: "/about" },
    { name: "Контакты", href: "/contacts" },
    { name: "Политика конфиденциальности", href: "/privacy" },
    { name: "Раскрытие партнёрства", href: "/disclosure" },
  ],
};

const socialLinks = [
  { name: "Telegram", icon: MessageCircle, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Email", icon: Mail, href: "mailto:info@smarthome2026.ru" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Home className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">Smart Home</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6">
              Всё об умном доме в России. Обзоры, рейтинги и гайды по IoT устройствам.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-secondary/50 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                  title={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h3 className="font-semibold mb-4">Каталог</h3>
            <ul className="space-y-2.5">
              {footerLinks.catalog.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides Links */}
          <div>
            <h3 className="font-semibold mb-4">Гайды</h3>
            <ul className="space-y-2.5">
              {footerLinks.guides.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold mb-4">Компания</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 Smart Home. Все права защищены.
          </p>
          <p className="text-xs text-muted-foreground">
            Сайт содержит партнёрские ссылки на Wildberries и OZON
          </p>
        </div>
      </div>
    </footer>
  );
}
