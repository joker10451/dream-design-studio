import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { ContentSection } from "@/components/content/ContentSection";
import { ContentFilters } from "@/components/content/ContentFilters";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ComparisonTable } from "@/components/catalog/ComparisonTable";
import { ContentSearchFilters } from "@/data/contentTypes";
import { useState } from "react";
import { Award, Filter, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Ratings = () => {
  const [filters, setFilters] = useState<ContentSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const breadcrumbItems = [
    { name: "Рейтинги", url: "/ratings" }
  ];

  const topCategories = [
    {
      id: 'smart-plugs',
      name: 'Умные розетки',
      description: 'ТОП-50 лучших умных розеток 2026',
      count: 50,
      icon: '🔌',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'security-cameras',
      name: 'Камеры видеонаблюдения',
      description: 'Лучшие IP-камеры для дома',
      count: 35,
      icon: '📹',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'sensors',
      name: 'Датчики',
      description: 'Датчики движения, температуры, влажности',
      count: 42,
      icon: '🌡️',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'smart-lights',
      name: 'Умное освещение',
      description: 'Лампочки, выключатели, диммеры',
      count: 28,
      icon: '💡',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Рейтинги умных устройств - Smart Home 2026"
        description="ТОП-рейтинги лучших устройств умного дома 2026. Сравнение характеристик, цен и отзывов. Экспертные оценки IoT устройств для дома."
        keywords={[
          'рейтинг умных устройств',
          'лучшие iot устройства',
          'топ умных розеток',
          'рейтинг камер видеонаблюдения',
          'лучшие датчики умного дома',
          'сравнение умных устройств',
          'обзор smart home'
        ]}
        ogType="website"
      />
      
      <Navbar />
      
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Breadcrumbs */}
          <Breadcrumbs items={breadcrumbItems} className="mb-6" />
          
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 mb-4"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                Рейтинги устройств
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Экспертные рейтинги лучших устройств умного дома с подробным 
              сравнением характеристик и актуальными ценами
            </motion.p>
          </div>

          {/* Top Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {topCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all duration-300 group"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{category.icon}</span>
                    </div>
                    <CardTitle className="text-lg">{category.name}</CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Trophy className="w-4 h-4" />
                      <span>{category.count} устройств</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Фильтры
              </Button>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Всего рейтингов: 12</span>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <ContentFilters
                filters={filters}
                onFiltersChange={setFilters}
                contentType="ratings"
              />
            </motion.div>
          )}

          {/* Selected Category Comparison */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-12"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {topCategories.find(c => c.id === selectedCategory)?.name}
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(null)}
                >
                  Закрыть
                </Button>
              </div>
              <ComparisonTable category={selectedCategory} />
            </motion.div>
          )}

          {/* Content Section */}
          <ContentSection
            contentType="ratings"
            filters={filters}
            showAffiliateLinks={true}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Ratings;