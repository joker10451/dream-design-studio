import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { GuidesSection } from "@/components/sections/GuidesSection";
import { NewsSection } from "@/components/sections/NewsSection";
import { SubscribeSection } from "@/components/sections/SubscribeSection";
import { Footer } from "@/components/sections/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seoUtils";

const Index = () => {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();
  
  // Комбинируем схемы в один массив
  const combinedSchema = [organizationSchema, websiteSchema];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Smart Home 2026 - Лучший портал об умном доме в России"
        description="Обзоры, гайды, рейтинги и сравнения IoT устройств для умного дома. Актуальные цены на Wildberries, OZON и Яндекс.Маркет. Калькулятор стоимости системы умного дома."
        keywords={[
          'умный дом',
          'iot устройства',
          'умные розетки',
          'домашняя автоматизация',
          'обзоры техники',
          'smart home',
          'яндекс алиса',
          'xiaomi',
          'aqara',
          'wildberries',
          'ozon'
        ]}
        ogType="website"
        structuredData={combinedSchema}
      />
      
      <Navbar />
      <HeroSection />
      <CategoriesSection />
      <GuidesSection />
      <NewsSection />
      <SubscribeSection />
      <Footer />
    </div>
  );
};

export default Index;
