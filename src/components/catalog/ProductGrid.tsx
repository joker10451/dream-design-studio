import { motion } from "framer-motion";
import { Star, Plus, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { ResponsiveGrid } from "@/components/ui/responsive-container";
import { AffiliateButton } from "@/components/affiliate/AffiliateButton";
import { useAffiliateTracking } from "@/components/affiliate/AffiliateTracker";
import type { Product } from "@/data/products";

interface ProductGridProps {
  products: Product[];
  compareIds: string[];
  onToggleCompare: (id: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function ProductGrid({ products, compareIds, onToggleCompare }: ProductGridProps) {
  const { trackClick } = useAffiliateTracking();

  const handleAffiliateClick = (link: any, productId: string) => {
    trackClick(link, 'catalog_grid', productId);
  };

  if (products.length === 0) {
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
      {products.map((product) => {
        const isComparing = compareIds.includes(product.id);
        const discount = product.oldPrice
          ? Math.round((1 - product.price / product.oldPrice) * 100)
          : 0;

        return (
          <motion.div
            key={product.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5 }}
            className="group relative rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300"
          >
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 z-10 px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-xs font-medium">
                -{discount}%
              </div>
            )}

            {/* Compare Button */}
            <button
              onClick={() => onToggleCompare(product.id)}
              className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isComparing
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground"
              }`}
              title={isComparing ? "Убрать из сравнения" : "Добавить к сравнению"}
            >
              {isComparing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>

            {/* Optimized Image */}
            <div className="relative h-48 overflow-hidden bg-secondary/30">
              <OptimizedImage
                src={product.images[0]?.url || '/placeholder.svg'}
                alt={product.images[0]?.alt || product.name}
                className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                responsive={{
                  xs: product.images[0]?.url || '/placeholder.svg',
                  sm: product.images[0]?.url || '/placeholder.svg',
                  md: product.images[0]?.url || '/placeholder.svg',
                }}
              />
            </div>

            {/* Content */}
            <div className="p-5">
              {/* Brand */}
              <span className="text-xs text-primary font-medium uppercase tracking-wider">
                {product.brand}
              </span>

              {/* Name */}
              <h3 className="font-semibold text-lg mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {product.name}
              </h3>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-sm font-medium">{product.rating}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  ({product.reviewsCount.toLocaleString("ru-RU")} отзывов)
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold text-foreground">
                  {product.price.toLocaleString("ru-RU")} ₽
                </span>
                {product.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {product.oldPrice.toLocaleString("ru-RU")} ₽
                  </span>
                )}
              </div>

              {/* Store Buttons */}
              <div className="flex gap-2">
                {product.affiliateLinks.slice(0, 2).map((link) => (
                  <AffiliateButton
                    key={link.id}
                    link={link}
                    variant="compact"
                    showPrice={false}
                    className="flex-1"
                    onClick={(link) => handleAffiliateClick(link, product.id)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </ResponsiveGrid>
  );
}
