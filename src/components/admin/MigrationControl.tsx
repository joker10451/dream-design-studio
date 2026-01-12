import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { products, brands, categories } from '@/data/products';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function MigrationControl() {
    const [isMigrating, setIsMigrating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const migrate = async () => {
        setIsMigrating(true);
        setProgress(0);
        setLogs([]);

        try {
            addLog('Starting migration...');

            // 1. Migrate Categories
            addLog(`Migrating ${categories.length} categories...`);
            for (const cat of categories) {
                const { error } = await supabase.from('categories').upsert({
                    id: cat.id,
                    name: cat.name,
                    slug: cat.id, // using id as slug for simplicity or cat.id
                    is_active: true
                });
                if (error) throw new Error(`Category error: ${error.message}`);
            }
            addLog('Categories migrated.');
            setProgress(10);

            // 2. Migrate Brands
            addLog(`Migrating ${brands.length} brands...`);
            for (const brandName of brands) {
                const id = brandName.toLowerCase().replace(/\s+/g, '-');
                const { error } = await supabase.from('brands').upsert({
                    id: id,
                    name: brandName,
                    slug: id,
                    is_active: true
                });
                if (error) throw new Error(`Brand error: ${error.message}`);
            }
            addLog('Brands migrated.');
            setProgress(20);

            // 3. Migrate Products
            const totalProducts = products.length;
            let processed = 0;

            for (const product of products) {
                addLog(`Migrating product: ${product.name}...`);

                // Prepare product data
                const brandId = product.brand.toLowerCase().replace(/\s+/g, '-');

                const productData = {
                    id: product.id,
                    name: product.name,
                    slug: product.id, // Simple slug
                    brand_id: brandId,
                    category_id: product.category,
                    description: product.description,
                    full_description: product.fullDescription,
                    price: product.price,
                    old_price: product.oldPrice,
                    rating: product.rating,
                    reviews_count: product.reviewsCount,
                    specs: product.specs as any, // Json type
                    tags: product.tags,
                    seo_meta: product.seoMeta as any,
                    is_active: true,
                    featured: false
                };

                const { error: prodError } = await supabase.from('products').upsert(productData);
                if (prodError) throw new Error(`Product ${product.id} error: ${prodError.message}`);

                // Migrate Images
                if (product.images.length > 0) {
                    const { error: imgError } = await supabase.from('product_images').delete().eq('product_id', product.id);
                    if (imgError) console.error('Error clearing images', imgError);

                    const imagesToInsert = product.images.map((img, idx) => ({
                        product_id: product.id,
                        url: img.url,
                        alt_text: img.alt,
                        is_primary: img.isPrimary || idx === 0,
                        sort_order: idx
                    }));

                    const { error: imgInsertError } = await supabase.from('product_images').insert(imagesToInsert);
                    if (imgInsertError) addLog(`Warning: Image insert failed for ${product.name}`);
                }

                // Migrate Affiliate Links
                if (product.affiliateLinks.length > 0) {
                    const { error: linkError } = await supabase.from('affiliate_links').delete().eq('product_id', product.id);
                    if (linkError) console.error('Error clearing links', linkError);

                    const linksToInsert = product.affiliateLinks.map(link => ({
                        product_id: product.id,
                        marketplace: link.marketplace,
                        url: link.url,
                        price: link.price,
                        is_available: link.isAvailable,
                        tracking_params: link.trackingParams as any,
                        last_updated: new Date().toISOString()
                    }));

                    const { error: linkInsertError } = await supabase.from('affiliate_links').insert(linksToInsert);
                    if (linkInsertError) addLog(`Warning: Link insert failed for ${product.name}`);
                }

                processed++;
                setProgress(20 + Math.floor((processed / totalProducts) * 80));
            }

            addLog('Migration completed successfully!');
            toast.success('Migration completed!');
        } catch (error: any) {
            addLog(`ERROR: ${error.message}`);
            toast.error(`Migration failed: ${error.message}`);
        } finally {
            setIsMigrating(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-10">
            <CardHeader>
                <CardTitle>Database Migration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-yellow-500/10 p-4 rounded-md border border-yellow-500/50 text-yellow-500">
                    Warning: This action will overwrite existing data in the database with data from <code>products.ts</code>.
                </div>

                <div className="flex items-center gap-4">
                    <Button onClick={migrate} disabled={isMigrating}>
                        {isMigrating ? 'Migrating...' : 'Start Migration'}
                    </Button>
                    {isMigrating && <span>Processing... {Math.round(progress)}%</span>}
                </div>

                <Progress value={progress} className="w-full" />

                <div className="h-64 overflow-y-auto bg-muted p-4 rounded-md font-mono text-xs">
                    {logs.length === 0 ? <span className="text-muted-foreground">Logs will appear here...</span> : logs.map((log, i) => (
                        <div key={i}>{log}</div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
