import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { ContentSection } from "@/components/content/ContentSection";
import { ContentFilters } from "@/components/content/ContentFilters";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContentSearchFilters } from "@/data/contentTypes";
import { useState } from "react";
import { BookOpen, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Guides = () => {
  const [filters, setFilters] = useState<ContentSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const breadcrumbItems = [
    { name: "Гайды", url: "/guides" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Гайды по умному дому - Smart Home 2026"
        description="Подробные инструкции и руководства по выбору, установке и настройке устройств умного дома. Пошаговые гайды для начинающих и экспертов."
        keywords={[
          'гайды умный дом',
          'инструкции iot',
          'как выбрать умные устройства',
          'настройка умного дома',
          'руководство smart home',
          'установка датчиков',
          'подключение умных розеток'
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                Гайды по умному дому
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Подробные инструкции и руководства по выбору, установке и настройке 
              устройств умного дома от экспертов Smart Home 2026
            </motion.p>
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
                <span>Найдено: 24 гайда</span>
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
                contentType="articles"
              />
            </motion.div>
          )}

          {/* Content Section */}
          <ContentSection
            contentType="guides"
            filters={filters}
            showAffiliateLinks={true}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Guides;