import { Navbar } from "@/components/ui/navbar";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SimpleIndex = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Smart Home 2026 - Простая версия"
        description="Простая версия главной страницы для тестирования"
      />
      
      <Navbar />
      
      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Smart Home 2026</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Лучший портал об умном доме в России
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Link to="/auth-status">
              <Button variant="default" className="w-full">
                Статус аутентификации
              </Button>
            </Link>
            
            <Link to="/simple-auth">
              <Button variant="outline" className="w-full">
                Простая аутентификация
              </Button>
            </Link>
            
            <Link to="/minimal-auth">
              <Button variant="outline" className="w-full">
                Минимальная аутентификация
              </Button>
            </Link>
            
            <Link to="/supabase-auth-test">
              <Button variant="outline" className="w-full">
                Тест Supabase Auth
              </Button>
            </Link>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <Link to="/simple-auth-test">
              <Button variant="outline" className="w-full">
                Простой тест Auth
              </Button>
            </Link>
            
            <Link to="/auth-test">
              <Button variant="outline" className="w-full">
                Полный тест аутентификации
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleIndex;