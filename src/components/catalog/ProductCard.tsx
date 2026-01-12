import { motion } from "framer-motion";
import { Star, Plus, Check, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { AffiliateButton } from "@/components/affiliate/AffiliateButton";
import { useAffiliateTracking } from "@/components/affiliate/AffiliateTracker";
import type { ProductWithRelations } from "@/types/database";
import { useToggleFavorite, useFavorites } from "@/hooks/api/useUserData";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface ProductCardProps {
    product: ProductWithRelations;
    isComparing?: boolean;
    onToggleCompare?: (id: string) => void;
    showCompare?: boolean;
    showFavorite?: boolean;
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
};

export function ProductCard({
    product,
    isComparing = false,
    onToggleCompare,
    showCompare = true,
    showFavorite = true
}: ProductCardProps) {
    const navigate = useNavigate();
    const { trackClick } = useAffiliateTracking();
    const { authState } = useAuth();
    const { mutate: toggleFavorite } = useToggleFavorite();
    const { data: favorites } = useFavorites(!!authState.user);

    const isFavorite = favorites?.data?.some(f => f.id === product.id);

    // Normalize data (handle both snake_case from DB and camelCase from local mock)
    const images = product.product_images || (product as any).images || [];
    const mainImage = images.find((img: any) => img.is_primary || img.isPrimary) || images[0];
    const imageUrl = mainImage?.url || '/placeholder.svg';
    const imageAlt = mainImage?.alt_text || mainImage?.alt || product.name;

    const reviewsCount = product.reviews_count || (product as any).reviewsCount || 0;
    const oldPrice = product.old_price || (product as any).oldPrice;

    // Fix affiliate links mapping
    const affiliateLinks = product.affiliate_links || (product as any).affiliateLinks || [];

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if clicking on buttons
        if ((e.target as HTMLElement).closest('button')) return;
        navigate(`/product/${product.id}`);
    };

    const handleAffiliateClick = (link: any) => {
        trackClick(link, 'product_card', product.id);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!authState.user) {
            toast.error("Войдите, чтобы добавить в избранное");
            return;
        }

        toggleFavorite(product.id, {
            onSuccess: (res) => {
                if (res.data) {
                    toast.success("Добавлено в избранное");
                } else {
                    toast.success("Удалено из избранного");
                }
            }
        });
    };

    const discount = oldPrice
        ? Math.round((1 - product.price / oldPrice) * 100)
        : 0;

    const brandName = product.brands?.name || (product as any).brand || "Бренд";

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ y: -5 }}
            onClick={handleCardClick}
            className="group relative rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 h-full flex flex-col cursor-pointer"
        >
            {/* Discount Badge */}
            {discount > 0 && (
                <div className="absolute top-4 left-4 z-10 px-2 py-1 rounded-md bg-destructive text-destructive-foreground text-xs font-medium">
                    -{discount}%
                </div>
            )}

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                {showCompare && onToggleCompare && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompare(product.id);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isComparing
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                            }`}
                        title={isComparing ? "Убрать из сравнения" : "Добавить к сравнению"}
                    >
                        {isComparing ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                )}

                {showFavorite && (
                    <button
                        onClick={handleFavoriteClick}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isFavorite
                            ? "bg-red-500 text-white"
                            : "bg-secondary/80 text-muted-foreground hover:bg-red-500 hover:text-white"
                            }`}
                        title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
                    >
                        <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
                    </button>
                )}
            </div>

            {/* Optimized Image */}
            <div className="relative h-48 overflow-hidden bg-secondary/30">
                <OptimizedImage
                    src={imageUrl}
                    alt={imageAlt}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-110 object-contain p-4"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Brand */}
                <span className="text-xs text-primary font-medium uppercase tracking-wider">
                    {brandName}
                </span>

                {/* Name */}
                <h3 className="font-semibold text-lg mt-1 mb-2 group-hover:text-primary transition-colors line-clamp-2 min-h-[3.5rem]">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-sm font-medium">{product.rating}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        ({reviewsCount.toLocaleString("ru-RU") || 0} отзывов)
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {product.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-2xl font-bold text-foreground">
                        {product.price.toLocaleString("ru-RU")} ₽
                    </span>
                    {oldPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            {oldPrice.toLocaleString("ru-RU")} ₽
                        </span>
                    )}
                </div>

                {/* Store Buttons */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {affiliateLinks.slice(0, 2).map((link: any) => (
                        <AffiliateButton
                            key={link.id}
                            link={link}
                            variant="compact"
                            showPrice={false}
                            className="flex-1"
                            onClick={() => handleAffiliateClick(link)}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
