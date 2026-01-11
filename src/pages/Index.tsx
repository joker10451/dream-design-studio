import { Navbar } from "@/components/ui/navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { GuidesSection } from "@/components/sections/GuidesSection";
import { NewsSection } from "@/components/sections/NewsSection";
import { SubscribeSection } from "@/components/sections/SubscribeSection";
import { Footer } from "@/components/sections/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
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
