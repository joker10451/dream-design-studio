import { motion } from "framer-motion";
import { Search, X, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Filters } from "@/pages/Catalog";

interface CatalogFiltersProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  brands: string[];
  categories: { id: string; name: string; count: number }[];
  totalProducts: number;
}

export function CatalogFilters({
  filters,
  setFilters,
  brands,
  categories,
  totalProducts,
}: CatalogFiltersProps) {
  const resetFilters = () => {
    setFilters({
      category: "all",
      priceRange: [0, 50000],
      brands: [],
      minRating: 0,
      searchQuery: "",
    });
  };

  const toggleBrand = (brand: string) => {
    setFilters((prev) => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter((b) => b !== brand)
        : [...prev.brands, brand],
    }));
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 50000 ||
    filters.brands.length > 0 ||
    filters.minRating > 0 ||
    filters.searchQuery !== "";

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="sticky top-24 space-y-6"
    >
      {/* Search */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск устройств..."
            value={filters.searchQuery}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="pl-10 bg-secondary/50 border-border"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: "" }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="font-semibold mb-4">Категории</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilters((prev) => ({ ...prev, category: cat.id }))}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                filters.category === cat.id
                  ? "bg-primary/20 text-primary"
                  : "hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-xs opacity-60">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="font-semibold mb-4">Цена</h3>
        <div className="space-y-4">
          <Slider
            value={filters.priceRange}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, priceRange: value as [number, number] }))
            }
            min={0}
            max={50000}
            step={100}
            className="py-4"
          />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {filters.priceRange[0].toLocaleString("ru-RU")} ₽
            </span>
            <span className="text-muted-foreground">
              {filters.priceRange[1].toLocaleString("ru-RU")} ₽
            </span>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="font-semibold mb-4">Бренды</h3>
        <div className="space-y-3">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center space-x-3">
              <Checkbox
                id={brand}
                checked={filters.brands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label
                htmlFor={brand}
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="p-4 rounded-xl bg-card border border-border">
        <h3 className="font-semibold mb-4">Рейтинг от</h3>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilters((prev) => ({ ...prev, minRating: rating }))}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.minRating === rating
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {rating === 0 ? "Все" : `${rating}+`}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Сбросить фильтры
        </Button>
      )}

      {/* Results Count */}
      <div className="text-center text-sm text-muted-foreground">
        Найдено {totalProducts} устройств
      </div>
    </motion.div>
  );
}
