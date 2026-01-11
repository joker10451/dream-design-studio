import { motion } from "framer-motion";
import { Star, Plus, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
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

            {/* Image */}
            <div className="relative h-48 overflow-hidden bg-secondary/30">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
                {product.stores.wildberries && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                    asChild
                  >
                    <a href={product.stores.wildberries} target="_blank" rel="noopener noreferrer">
                      Wildberries
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
                {product.stores.ozon && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 text-xs"
                    asChild
                  >
                    <a href={product.stores.ozon} target="_blank" rel="noopener noreferrer">
                      OZON
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
