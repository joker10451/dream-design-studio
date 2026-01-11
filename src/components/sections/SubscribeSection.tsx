import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail("");
      }, 3000);
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 mb-6">
            <Mail className="w-7 h-7 text-primary" />
          </div>

          {/* Content */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Получайте <span className="text-gradient">лучшие обзоры</span> первыми
          </h2>
          <p className="text-muted-foreground mb-8">
            Подпишитесь на нашу рассылку и узнавайте о новых устройствах, 
            скидках и эксклюзивных гайдах раньше всех
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Input
                type="email"
                placeholder="Ваш email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-4 pr-4 bg-secondary/50 border-border focus:border-primary"
                required
              />
            </div>
            <Button 
              type="submit" 
              variant="glow" 
              size="lg"
              disabled={isSubscribed}
              className="h-12"
            >
              {isSubscribed ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Подписано!
                </>
              ) : (
                <>
                  Подписаться
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Trust Indicators */}
          <p className="text-xs text-muted-foreground mt-4">
            🔒 Без спама. Отписаться можно в любое время. Уже 10,000+ подписчиков
          </p>
        </motion.div>
      </div>
    </section>
  );
}
