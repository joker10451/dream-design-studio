import { useSearchParams } from 'react-router-dom';
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { SubscriptionManager } from "@/components/newsletter";

const ManageSubscription = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Управление подпиской
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Настройте ваши предпочтения для получения уведомлений или отпишитесь от рассылки
              </p>
            </div>

            {/* Subscription Manager */}
            <SubscriptionManager initialEmail={email} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ManageSubscription;