import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { CostCalculator } from "@/components/calculator/CostCalculator";

const Calculator = () => {
  return (
    <div className="min-h-screen bg-background">
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