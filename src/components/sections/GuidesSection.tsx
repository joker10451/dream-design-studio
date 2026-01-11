import { motion } from "framer-motion";
import { Clock, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const guides = [
  {
    title: "Как выбрать умную розетку в 2026",
    description: "Полное руководство по выбору: WiFi vs Zigbee, лучшие модели по цене",
    readTime: "8 мин",
    category: "Руководство",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  {
    title: "Система умного дома за 5000₽",
    description: "Собираем бюджетный умный дом с нуля: розетки, датчики, освещение",
    readTime: "12 мин",
    category: "DIY",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
  },
  {
    title: "Настройка Яндекс Станции",
    description: "Пошаговая инструкция: подключение устройств и создание сценариев",
    readTime: "6 мин",
    category: "Инструкция",
    image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=400&h=300&fit=crop",
  },
  {
    title: "Протоколы умного дома: сравнение",
    description: "WiFi, Bluetooth, ZigBee, Z-Wave — какой выбрать и почему",
    readTime: "10 мин",
    category: "Обзор",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
  },
];

export function GuidesSection() {
  return (
    <section className="py-24 relative bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Гайды</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
              Популярные <span className="text-gradient">руководства</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Практические инструкции от экспертов. Узнайте как выбрать, 
              установить и настроить умные устройства
            </p>
          </div>
          <Button variant="ghost" className="mt-6 md:mt-0 group">
            Все гайды
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((guide, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative rounded-2xl bg-card border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                
                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
                    {guide.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {guide.description}
                </p>
                
                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {guide.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    Читать
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
