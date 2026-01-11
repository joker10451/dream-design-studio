import { motion } from "framer-motion";
import { Calendar, TrendingUp, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const news = [
  {
    title: "Яндекс представил новую Станцию Мини 3",
    excerpt: "Компания анонсировала третье поколение умной колонки с улучшенным звуком и новыми функциями умного дома",
    date: "10 января 2026",
    trending: true,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
  },
  {
    title: "Matter 2.0: что нового в протоколе",
    excerpt: "Обновление стандарта принесло поддержку камер, дверных замков и улучшенную совместимость",
    date: "8 января 2026",
    trending: true,
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=400&h=300&fit=crop",
  },
  {
    title: "Рынок IoT в России вырос на 40%",
    excerpt: "Аналитики прогнозируют дальнейший рост рынка умных устройств в 2026 году",
    date: "5 января 2026",
    trending: false,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
  },
  {
    title: "ТОП-10 устройств для умного дома 2026",
    excerpt: "Редакция составила список лучших новинок года по соотношению цена/качество",
    date: "3 января 2026",
    trending: false,
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop",
  },
];

export function NewsSection() {
  const featuredNews = news[0];
  const otherNews = news.slice(1);

  return (
    <section className="py-24 relative">
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
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Новости</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-2 mb-4">
              Последние <span className="text-gradient">новости</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              Следите за новинками IoT индустрии, обновлениями прошивок и трендами умного дома
            </p>
          </div>
          <Button variant="ghost" className="mt-6 md:mt-0 group">
            Все новости
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* News Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured News */}
          <motion.article
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="group relative rounded-2xl bg-card border border-border overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300 row-span-2"
          >
            {/* Image */}
            <div className="relative h-64 lg:h-80 overflow-hidden">
              <img
                src={featuredNews.image}
                alt={featuredNews.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              
              {/* Trending Badge */}
              {featuredNews.trending && (
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-primary/90 text-primary-foreground">
                    <TrendingUp className="w-3 h-3" />
                    В тренде
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                <Calendar className="w-3.5 h-3.5" />
                {featuredNews.date}
              </div>
              <h3 className="text-xl lg:text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                {featuredNews.title}
              </h3>
              <p className="text-muted-foreground">
                {featuredNews.excerpt}
              </p>
            </div>
          </motion.article>

          {/* Other News */}
          <div className="space-y-6">
            {otherNews.map((item, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ x: 8 }}
                className="group flex gap-4 p-4 rounded-xl bg-card border border-border cursor-pointer hover:border-primary/50 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative w-24 h-24 md:w-32 md:h-24 flex-shrink-0 rounded-lg overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3" />
                    {item.date}
                    {item.trending && (
                      <span className="inline-flex items-center gap-1 text-primary">
                        <TrendingUp className="w-3 h-3" />
                        Тренд
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 hidden md:block">
                    {item.excerpt}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
