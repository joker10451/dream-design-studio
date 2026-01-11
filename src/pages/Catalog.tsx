import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/sections/Footer";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { ComparisonTable } from "@/components/catalog/ComparisonTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, TableIcon } from "lucide-react";
import { products, brands, categories } from "@/data/products";

// Extract unique protocols and features from products
const allProtocols = Array.from(new Set(
  products.flatMap(p => p.specs.protocol)
)).sort();

const allFeatures = Array.from(new Set(
  products.flatMap(p => p.specs.features)
)).sort();

export interface Filters {
  category: string;
  priceRange: [number, number];
  brands: string[];
  minRating: number;
  searchQuery: string;
  protocols: string[];
  features: string[];
}

const Catalog = () => {
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    priceRange: [0, 50000],
    brands: [],
    minRating: 0,
    searchQuery: "",
    protocols: [],
    features: [],
  });

  const [compareIds, setCompareIds] = useState<string[]>([]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (filters.category !== "all" && product.category !== filters.category) {
        return false;
      }

      // Price filter
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }

      // Brand filter
      if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
        return false;
      }

      // Rating filter
      if (product.rating < filters.minRating) {
        return false;
      }

      // Protocol filter
      if (filters.protocols.length > 0) {
        const hasMatchingProtocol = filters.protocols.some(protocol =>
          product.specs.protocol.some(p => p.toLowerCase().includes(protocol.toLowerCase()))
        );
        if (!hasMatchingProtocol) {
          return false;
        }
      }

      // Features filter
      if (filters.features.length > 0) {
        const hasMatchingFeature = filters.features.some(feature =>
          product.specs.features.some(f => f.toLowerCase().includes(feature.toLowerCase()))
        );
        if (!hasMatchingFeature) {
          return false;
        }
      }

      // Enhanced search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.fullDescription.toLowerCase().includes(query) ||
          product.specs.features.some(f => f.toLowerCase().includes(query)) ||
          product.specs.protocol.some(p => p.toLowerCase().includes(query)) ||
          product.tags.some(t => t.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [filters]);

  const compareProducts = useMemo(() => {
    return products.filter((p) => compareIds.includes(p.id));
  }, [compareIds]);

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Каталог <span className="text-gradient">устройств</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              Более 400 устройств умного дома. Сравнивайте характеристики, 
              читайте отзывы и находите лучшие цены на Wildberries и OZON
            </p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <CatalogFilters
                filters={filters}
                setFilters={setFilters}
                brands={brands}
                categories={categories}
                protocols={allProtocols}
                features={allFeatures}
                totalProducts={filteredProducts.length}
              />
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              <Tabs defaultValue="grid" className="w-full">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    Найдено: <span className="text-foreground font-medium">{filteredProducts.length}</span> устройств
                  </p>
                  
                  <div className="flex items-center gap-4">
                    {compareIds.length > 0 && (
                      <span className="text-sm text-primary">
                        К сравнению: {compareIds.length}
                      </span>
                    )}
                    <TabsList className="bg-secondary/50">
                      <TabsTrigger value="grid" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <LayoutGrid className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="table" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <TableIcon className="w-4 h-4" />
                      </TabsTrigger>
                    </TabsList>
                  </div>
                </div>

                <TabsContent value="grid">
                  <ProductGrid
                    products={filteredProducts}
                    compareIds={compareIds}
                    onToggleCompare={toggleCompare}
                  />
                </TabsContent>

                <TabsContent value="table">
                  <ComparisonTable products={filteredProducts} />
                </TabsContent>
              </Tabs>

              {/* Comparison Section */}
              {compareIds.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12"
                >
                  <h2 className="text-2xl font-bold mb-6">
                    Сравнение <span className="text-gradient">устройств</span>
                  </h2>
                  <ComparisonTable products={compareProducts} isCompareMode />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
