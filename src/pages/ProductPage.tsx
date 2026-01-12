import { useParams, useNavigate } from 'react-router-dom';
import { products } from '@/data/products';
import { Navbar } from '@/components/ui/navbar';
import { Footer } from '@/components/sections/Footer';
import { SEOHead } from '@/components/seo/SEOHead';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Star, Share2, Heart, Check, Minus, Plus } from 'lucide-react';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { AffiliateButton } from '@/components/affiliate/AffiliateButton';
import { useAffiliateTracking } from '@/components/affiliate/AffiliateTracker';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ProductPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { trackClick } = useAffiliateTracking();
    const { authState } = useAuth();

    const product = products.find(p => p.id === id);

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <div className="flex-1 container mx-auto px-4 flex items-center justify-center">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
                        <Button onClick={() => navigate('/catalog')}>В каталог</Button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const handleAffiliateClick = (link: any) => {
        trackClick(link, 'product_page', product.id);
    };

    const discount = product.oldPrice
        ? Math.round((1 - product.price / product.oldPrice) * 100)
        : 0;

    return (
        <div className="min-h-screen bg-background">
            <SEOHead
                title={`${product.name} | Smart Home 2026`}
                description={product.seoMeta.description}
                keywords={product.seoMeta.keywords}
                ogImage={product.seoMeta.ogImage}
            />

            <Navbar />

            <main className="pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate(-1)}>
                        <ArrowLeft className="w-4 h-4" />
                        Назад
                    </Button>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-square relative rounded-2xl overflow-hidden border border-border bg-secondary/10">
                                <OptimizedImage
                                    src={product.images[0]?.url}
                                    alt={product.images[0]?.alt}
                                    className="w-full h-full object-contain p-8"
                                />
                                {discount > 0 && (
                                    <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                                        -{discount}%
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div>
                            <div className="mb-2">
                                <Badge variant="outline" className="text-primary border-primary/20">
                                    {product.brand}
                                </Badge>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                                    <span className="font-medium text-lg">{product.rating}</span>
                                </div>
                                <span className="text-muted-foreground">
                                    {product.reviewsCount.toLocaleString('ru-RU')} отзывов
                                </span>
                            </div>

                            <div className="flex items-baseline gap-3 mb-8">
                                <span className="text-4xl font-bold">
                                    {product.price.toLocaleString('ru-RU')} ₽
                                </span>
                                {product.oldPrice && (
                                    <span className="text-xl text-muted-foreground line-through">
                                        {product.oldPrice.toLocaleString('ru-RU')} ₽
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 mb-8">
                                {product.affiliateLinks.map(link => (
                                    <AffiliateButton
                                        key={link.id}
                                        link={link}
                                        variant="default"
                                        className="w-full md:w-auto h-12 text-lg"
                                        onClick={() => handleAffiliateClick(link)}
                                    />
                                ))}
                            </div>

                            <Tabs defaultValue="description" className="w-full">
                                <TabsList>
                                    <TabsTrigger value="description">Описание</TabsTrigger>
                                    <TabsTrigger value="specs">Характеристики</TabsTrigger>
                                </TabsList>
                                <TabsContent value="description" className="mt-4">
                                    <div className="prose prose-invert max-w-none">
                                        <p className="text-lg leading-relaxed text-muted-foreground">
                                            {product.fullDescription}
                                        </p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="specs" className="mt-4">
                                    <Card>
                                        <CardContent className="p-6">
                                            <div className="space-y-4">
                                                {Object.entries(product.specs).map(([key, value]) => (
                                                    <div key={key} className="grid grid-cols-2 gap-4 border-b border-border/50 pb-3 last:border-0 last:pb-0">
                                                        <span className="text-muted-foreground capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <span className="font-medium">
                                                            {Array.isArray(value) ? value.join(', ') : value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ProductPage;
