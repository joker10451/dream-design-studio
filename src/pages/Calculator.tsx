import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { CostCalculator } from "@/components/calculator/CostCalculator";
import { SEOHead } from "@/components/seo/SEOHead";

const Calculator = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Калькулятор стоимости умного дома"
        description="Рассчитайте стоимость системы умного дома онлайн. Подбор устройств под ваш бюджет и потребности в Smart Home 2026."
        keywords={['калькулятор умного дома', 'расчет стоимости iot', 'планирование умного дома']}
      />
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <CostCalculator />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Calculator;