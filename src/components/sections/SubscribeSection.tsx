import { motion } from "framer-motion";
import { Mail, Bell, Zap, TrendingUp } from "lucide-react";
import { NewsletterFormFull } from "@/components/newsletter";

const benefits = [
  {
    icon: Bell,
    title: "Первыми узнавайте о новинках",
    description: "Получайте уведомления о новых устройствах и технологиях"
  },
  {
    icon: TrendingUp,
    title: "Эксклюзивные рейтинги",
    description: "Доступ к подробным сравнениям и ТОП-спискам"
  },
  {
    icon: Zap,
    title: "Специальные предложения",
    description: "Скидки и акции от наших партнеров до 50%"
  }
];

export function SubscribeSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: "2s" }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Бесплатная подписка</span>
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-foreground">Не пропустите </span>
              <span className="text-gradient">важные новости</span>
              <br />
              <span className="text-foreground">умного дома</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Присоединяйтесь к 100,000+ читателей, которые получают лучшие статьи, 
              обзоры и эксклюзивные предложения каждую неделю
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-xl gradient-border p-3 bg-card/50 backdrop-blur-sm shrink-0">
                    <benefit.icon className="w-full h-full text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Newsletter Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="lg:pl-8"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border rounded-2xl p-8 gradient-border">
                <NewsletterFormFull
                  source="article"
                  title="Подпишитесь на рассылку"
                  description="Выберите, какие уведомления вы хотите получать"
                  placeholder="Введите ваш email адрес"
                  buttonText="Подписаться бесплатно"
                  showPreferences={true}
                />
              </div>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-border"
          >
            {[
              { value: "100K+", label: "Подписчиков" },
              { value: "95%", label: "Читают до конца" },
              { value: "2-3", label: "Письма в неделю" },
              { value: "0", label: "Спама" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gradient mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <p className="text-xs text-muted-foreground">
              ✓ Никакого спама ✓ Отписка в один клик ✓ Ваши данные защищены
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}