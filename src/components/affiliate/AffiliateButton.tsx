import { motion } from "framer-motion";
import { ExternalLink, ShoppingCart, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AffiliateLink } from "@/data/products";
import { useAffiliateTracking } from "./AffiliateTracker";
import { useAnalytics } from "@/hooks/useAnalytics";

interface AffiliateButtonProps {
  link: AffiliateLink;
  variant?: "default" | "compact" | "minimal";
  showPrice?: boolean;
  showDiscount?: boolean;
  className?: string;
  onClick?: (link: AffiliateLink) => void;
}

export function AffiliateButton({ 
  link, 
  variant = "default", 
  showPrice = true, 
  showDiscount = false,
  className,
  onClick 
}: AffiliateButtonProps) {
  const { trackClick } = useAffiliateTracking();
  const { trackAffiliateClick } = useAnalytics();

  const getMarketplaceName = (marketplace: string) => {
    const names = {
      'wildberries': 'Wildberries',
      'ozon': 'OZON',
      'yandex': 'Яндекс.Маркет'
    };
    return names[marketplace as keyof typeof names] || marketplace;
  };

  const getMarketplaceColor = (marketplace: string) => {
    const colors = {
      'wildberries': '#CB11AB',
      'ozon': '#005BFF', 
      'yandex': '#FC3F1D'
    };
    return colors[marketplace as keyof typeof colors] || '#6366f1';
  };

  const handleClick = () => {
    try {
      // Трекинг через новый сервис аналитики
      trackAffiliateClick(
        link.id,
        `Product from ${link.marketplace}`,
        link.marketplace,
        link.price,
        link.url
      );

      // Трекинг через AffiliateTracker
      trackClick(link, 'button_click', link.id);
    } catch (error) {
      console.warn('Analytics tracking failed:', error);
    }

    // Вызываем callback если передан
    onClick?.(link);

    // Открываем ссылку в новой вкладке
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  if (variant === "minimal") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={!link.isAvailable}
        className={cn("text-xs", className)}
      >
        {getMarketplaceName(link.marketplace)}
        <ExternalLink className="w-3 h-3 ml-1" />
      </Button>
    );
  }

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn("inline-block", className)}
      >
        <Button
          onClick={handleClick}
          disabled={!link.isAvailable}
          size="sm"
          className="h-8"
          style={{ 
            backgroundColor: link.isAvailable ? getMarketplaceColor(link.marketplace) : undefined 
          }}
        >
          <ShoppingCart className="w-3 h-3 mr-1" />
          {getMarketplaceName(link.marketplace)}
          {showPrice && (
            <span className="ml-1 font-semibold">
              {link.price.toLocaleString("ru-RU")}₽
            </span>
          )}
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn("w-full", className)}
    >
      <Button
        onClick={handleClick}
        disabled={!link.isAvailable}
        className="w-full justify-between group"
        style={{ 
          backgroundColor: link.isAvailable ? getMarketplaceColor(link.marketplace) : undefined 
        }}
      >
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Купить на {getMarketplaceName(link.marketplace)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {showPrice && (
            <span className="font-semibold">
              {link.price.toLocaleString("ru-RU")}₽
            </span>
          )}
          {showDiscount && link.trackingParams.discount && (
            <Badge variant="secondary" className="text-xs">
              -{link.trackingParams.discount}%
            </Badge>
          )}
          <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Button>
    </motion.div>
  );
}