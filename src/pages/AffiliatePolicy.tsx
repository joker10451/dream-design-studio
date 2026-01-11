import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Shield, DollarSign, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AFFILIATE_CONFIG } from "@/lib/affiliateUtils";

export default function AffiliatePolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Заголовок */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" className="mb-4" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient">Политика партнерских программ</h1>
              <p className="text-muted-foreground">Прозрачность и честность в рекомендациях</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Основной контент */}
          <div className="lg:col-span-2 space-y-6">
            {/* Общая информация */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Общие положения
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Smart Home 2026 участвует в партнерских программах различных интернет-магазинов 
                    и маркетплейсов. Это означает, что мы можем получать комиссию с покупок, 
                    совершенных по нашим ссылкам.
                  </p>
                  
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Важно знать:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Партнерские комиссии не влияют на цены товаров для покупателей</li>
                      <li>• Мы рекомендуем только те товары, которые считаем качественными</li>
                      <li>• Все партнерские ссылки четко обозначены на сайте</li>
                      <li>• Доходы от партнерских программ помогают развивать проект</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Партнеры */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Наши партнеры
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(AFFILIATE_CONFIG).map(([key, config]) => (
                      <div
                        key={key}
                        className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{config.name}</h4>
                          <Badge 
                            variant="secondary"
                            style={{ 
                              backgroundColor: config.color + '20',
                              color: config.color 
                            }}
                          >
                            Партнер
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Комиссия: {(config.commission * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Один из крупнейших российских маркетплейсов с широким ассортиментом 
                          товаров для умного дома.
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Принципы работы */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Принципы работы
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">1. Честность и прозрачность</h4>
                      <p className="text-sm text-muted-foreground">
                        Мы всегда указываем, когда ссылка является партнерской. Все партнерские 
                        ссылки помечены соответствующими уведомлениями.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">2. Независимость рекомендаций</h4>
                      <p className="text-sm text-muted-foreground">
                        Наши обзоры и рекомендации основаны на реальном опыте использования 
                        устройств, технических характеристиках и отзывах пользователей.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">3. Актуальность информации</h4>
                      <p className="text-sm text-muted-foreground">
                        Мы регулярно обновляем цены и информацию о доступности товаров. 
                        Дата последнего обновления указывается для каждого товара.
                      </p>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-semibold mb-2">4. Защита интересов пользователей</h4>
                      <p className="text-sm text-muted-foreground">
                        Мы всегда стремимся найти лучшие цены и предложения для наших читателей. 
                        Сравнение цен помогает выбрать наиболее выгодный вариант.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Использование доходов */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Использование доходов</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Доходы от партнерских программ направляются на развитие проекта:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Создание новых обзоров и гайдов</li>
                    <li>• Тестирование новых устройств умного дома</li>
                    <li>• Улучшение функциональности сайта</li>
                    <li>• Поддержание актуальности информации</li>
                    <li>• Техническая поддержка и хостинг</li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Боковая панель */}
          <div className="space-y-6">
            {/* Быстрые ссылки */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Полезные ссылки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/privacy" target="_blank" rel="noopener noreferrer">
                      <Shield className="w-4 h-4 mr-2" />
                      Политика конфиденциальности
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/terms" target="_blank" rel="noopener noreferrer">
                      <FileText className="w-4 h-4 mr-2" />
                      Пользовательское соглашение
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </Button>
                  
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <a href="/contact" target="_blank" rel="noopener noreferrer">
                      <Users className="w-4 h-4 mr-2" />
                      Связаться с нами
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Контактная информация */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Вопросы?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Если у вас есть вопросы о нашей партнерской политике, 
                    свяжитесь с нами:
                  </p>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Email:</strong>{" "}
                      <a href="mailto:info@smarthome2026.ru" className="text-primary hover:underline">
                        info@smarthome2026.ru
                      </a>
                    </p>
                    <p>
                      <strong>Telegram:</strong>{" "}
                      <a href="https://t.me/smarthome2026" className="text-primary hover:underline">
                        @smarthome2026
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Дата обновления */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
        </motion.div>
      </div>
    </div>
  );
}