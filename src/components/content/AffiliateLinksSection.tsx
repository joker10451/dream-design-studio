import { motion } from "framer-motion";
import { ExternalLink, ShoppingCart, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AffiliateLink } from "@/data/products";
import { AffiliateLinksGrid } from "@/components/affiliate/AffiliateLinksGrid";
import { useAffiliateTracking } from "@/components/affiliate/AffiliateTracker";

interface AffiliateLinksProps {
  links: AffiliateLink[];
  productId?: string;
  source?: string;
  onLinkClick?: (link: AffiliateLink) => void;
}

export function AffiliateLinksSection({ 
  links, 
  productId,
  source = "content",
  onLinkClick 
}: AffiliateLinksProps) {
  const { trackClick } = useAffiliateTracking();

  const handleLinkClick = (link: AffiliateLink) => {
    // Трекинг клика
    trackClick(link, source, productId);
    onLinkClick?.(link);
  };

  // Используем новый компонент AffiliateLinksGrid
  return (
    <AffiliateLinksGrid
      links={links}
      productId={productId}
      source={source}
      title="Где купить"
      showComparison={true}
      showDisclosure={true}
      variant="list"
    />
  );
}