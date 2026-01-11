import { motion } from "framer-motion";
import { Star, ExternalLink, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/data/products";

interface ComparisonTableProps {
  products: Product[];
  isCompareMode?: boolean;
}

export function ComparisonTable({ products, isCompareMode = false }: ComparisonTableProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground text-lg">Нет устройств для отображения</p>
      </div>
    );
  }

  if (isCompareMode) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto"
      >
        <div className="min-w-[600px] rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead className="w-40">Характеристика</TableHead>
                {products.map((product) => (
                  <TableHead key={product.id} className="text-center min-w-[200px]">
                    <div className="flex flex-col items-center gap-2">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="text-xs text-primary">{product.brand}</span>
                      <span className="text-sm font-medium">{product.name}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Цена</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <span className="text-lg font-bold text-primary">
                      {p.price.toLocaleString("ru-RU")} ₽
                    </span>
                    {p.oldPrice && (
                      <span className="block text-xs text-muted-foreground line-through">
                        {p.oldPrice.toLocaleString("ru-RU")} ₽
                      </span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Рейтинг</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-medium">{p.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({p.reviewsCount} отзывов)
                    </span>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Протокол</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center text-sm">
                    {p.specs.protocol}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Мощность</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center text-sm">
                    {p.specs.power || "—"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Совместимость</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <div className="flex flex-wrap justify-center gap-1">
                      {p.specs.compatibility.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-secondary text-muted-foreground"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Функции</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <div className="space-y-1">
                      {p.specs.features.slice(0, 4).map((f, i) => (
                        <div key={i} className="flex items-center justify-center gap-1 text-xs">
                          <Check className="w-3 h-3 text-primary" />
                          {f}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Купить</TableCell>
                {products.map((p) => (
                  <TableCell key={p.id} className="text-center">
                    <div className="flex flex-col gap-2">
                      {p.stores.wildberries && (
                        <Button variant="secondary" size="sm" asChild className="text-xs">
                          <a href={p.stores.wildberries} target="_blank" rel="noopener noreferrer">
                            Wildberries <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {p.stores.ozon && (
                        <Button variant="secondary" size="sm" asChild className="text-xs">
                          <a href={p.stores.ozon} target="_blank" rel="noopener noreferrer">
                            OZON <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </motion.div>
    );
  }

  // Regular table view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="overflow-x-auto"
    >
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead className="w-[300px]">Устройство</TableHead>
              <TableHead>Бренд</TableHead>
              <TableHead>Протокол</TableHead>
              <TableHead className="text-center">Рейтинг</TableHead>
              <TableHead className="text-right">Цена</TableHead>
              <TableHead className="text-center">Магазины</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id} className="hover:bg-secondary/20">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium hover:text-primary transition-colors cursor-pointer">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-primary">{product.brand}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{product.specs.protocol}</span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="font-medium">{product.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-bold">{product.price.toLocaleString("ru-RU")} ₽</span>
                  {product.oldPrice && (
                    <span className="block text-xs text-muted-foreground line-through">
                      {product.oldPrice.toLocaleString("ru-RU")} ₽
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    {product.stores.wildberries && (
                      <a
                        href={product.stores.wildberries}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs rounded bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        WB
                      </a>
                    )}
                    {product.stores.ozon && (
                      <a
                        href={product.stores.ozon}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 text-xs rounded bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        OZ
                      </a>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}
