import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { ContentSection } from "@/components/content/ContentSection";
import { ContentFilters } from "@/components/content/ContentFilters";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { ContentSearchFilters } from "@/data/contentTypes";
import { useState } from "react";
import { FileText, Filter, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Blog = () => {
  const [filters, setFilters] = useState<ContentSearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const breadcrumbItems = [
    { name: "Блог", url: "/blog" }
  ];

  const featuredTopics = [
    {
      id: 'automation-scenarios',
      name: 'Сценарии автоматизации',
      description: 'Готовые сценарии для умного дома',
      count: 15,
      icon: '🏠',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'diy-projects',
      name: 'DIY проекты',
      description: 'Самодельные решения для умного дома',
      count: 23,
      icon: '🔧',
      color: 'from-green-500 to-teal-500'
    },
    {
      id: 'reviews',
      name: 'Обзоры устройств',
      description: 'Детальные обзоры новинок',
      count: 45,
      icon: '⭐',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'tutorials',
      name: 'Туториалы',
      description: 'Пошаговые инструкции',
      count: 32,
      icon: '📚',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Блог о умном доме - Smart Home 2026"
        description="Экспертные статьи, обзоры, туториалы и DIY проекты по умному дому. Практические советы по автоматизации дома и IoT устройствам."
        keywords={[
          'блог умный дом',
          'статьи iot',
          'обзоры умных устройств',
          'diy умный дом',
          'сценарии автоматизации',
          'туториалы smart home',
          'советы по умному дому'
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
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gradient">
                Блог Smart Home 2026
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              Экспертные статьи, практические советы и инсайты от команды 
              Smart Home 2026 о мире умного дома и IoT технологий
            </motion.p>
          </div>

          {/* Featured Topics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {featuredTopics.map((topic, index) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${topic.color} flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                      <span className="text-2xl">{topic.icon}</span>
                    </div>
                    <CardTitle className="text-lg">{topic.name}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <PenTool className="w-4 h-4" />
                      <span>{topic.count} статей</span>
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
                <span>Всего статей: 115</span>
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
            contentType="blog"
            filters={filters}
            showAffiliateLinks={true}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Blog;