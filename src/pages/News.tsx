import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { ContentSection } from "@/components/content/ContentSection";
import { ContentFilters } from "@/components/content/ContentFilters";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { RSSSubscription } from "@/components/content/RSSSubscription";
import { ContentSearchFilters } from "@/data/contentTypes";
import { useState } from "react";
import { Newspaper, Filter, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const News = () => {
  const [filters, setFilters] = useState<ContentSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const breadcrumbItems = [
    { name: "Новости", url: "/news" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Новости умного дома и IoT - Smart Home 2026"
        description="Последние новости индустрии умного дома, IoT устройств и домашней автоматизации. Актуальная информация о новинках, обновлениях и трендах."
        keywords={[
          'новости умный дом',
          'iot новости',
          'новинки умных устройств',
          'домашняя автоматизация новости',
          'smart home news',
          'технологии умного дома',
          'обновления прошивок'
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                Новости умного дома
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Последние новости индустрии IoT, обзоры новинок и актуальная 
              информация о мире умного дома
            </motion.p>
          </div>

          {/* RSS Subscription */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <RSSSubscription />
          </motion.div>

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
              
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => window.open('/rss', '_blank')}
              >
                <Rss className="w-4 h-4" />
                RSS
              </Button>
              
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Найдено: 156 новостей</span>
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
                contentType="news"
              />
            </motion.div>
          )}

          {/* Content Section */}
          <ContentSection
            contentType="news"
            filters={filters}
            showAffiliateLinks={true}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default News;