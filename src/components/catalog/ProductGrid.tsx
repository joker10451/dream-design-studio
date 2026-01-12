import { ResponsiveGrid } from "@/components/ui/responsive-container";
import { ProductCard } from "./ProductCard";
import type { Product } from "@/data/products";
import type { ProductWithRelations } from "@/types/database";

interface ProductGridProps {
  products: (Product | ProductWithRelations)[];
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

export function ProductGrid({ products, compareIds, onToggleCompare }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">Устройства не найдены</p>
        <p className="text-sm text-muted-foreground mt-2">
          Попробуйте изменить параметры фильтров
        </p>
      </div>
    );
  }

  return (
    <ResponsiveGrid
      cols={{ xs: 1, sm: 2, lg: 3 }}
      gap="lg"
      className="w-full"
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product as any}
          isComparing={compareIds.includes(product.id)}
          onToggleCompare={onToggleCompare}
        />
      ))}
    </ResponsiveGrid>
  );
}
