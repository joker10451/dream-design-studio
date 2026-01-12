import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { SEOHead } from "@/components/seo/SEOHead";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductList } from "@/components/admin/ProductList";

const AdminPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <SEOHead title="Admin Dashboard | Smart Home 2026" description="Admin Panel" />
            <Navbar />
            <main className="pt-24 pb-16 container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                        <ProductForm />
                    </div>

                    <div className="lg:col-span-2">
                        <ProductList />
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default AdminPage;
