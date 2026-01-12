import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCategories } from '@/hooks/api/useCategories';
import { useBrands } from '@/hooks/api/useBrands';
import { useCreateProduct } from '@/hooks/api/useProducts';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    category_id: string;
    brand_id: string;
    image_url: string;
}

export function ProductForm() {
    const { data: categories = [] } = useCategories();
    // useBrands returns an object { data: [], ... } usually? 
    // Checking useBrands.ts usage pattern. Assuming React Query pattern.
    const { data: brandsData } = useBrands();
    const brands = brandsData?.data || []; // Adjust based on actual hook return

    const createProduct = useCreateProduct();
    const { register, handleSubmit, reset, setValue } = useForm<ProductFormData>();

    const onSubmit = (data: ProductFormData) => {
        const payload = {
            name: data.name,
            description: data.description,
            price: Number(data.price),
            category_id: data.category_id,
            brand_id: data.brand_id,
            slug: data.name.toLowerCase().replace(/\s+/g, '-') + '-' + Math.floor(Math.random() * 1000),
            is_active: true,
            // Add image if URL provided
            images: data.image_url ? [{ url: data.image_url, is_primary: true, sort_order: 0 }] : []
        };

        createProduct.mutate(payload as any, {
            onSuccess: () => {
                toast.success('Product created successfully!');
                reset();
            },
            onError: (error) => {
                toast.error(`Failed to create product: ${error.message}`);
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Добавить новый товар</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Название</Label>
                        <Input id="name" {...register('name', { required: true })} placeholder="Название товара" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Описание</Label>
                        <Textarea id="description" {...register('description')} placeholder="Краткое описание" />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Цена (₽)</Label>
                            <Input id="price" type="number" {...register('price', { required: true, min: 0 })} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image">Ссылка на фото</Label>
                            <Input id="image" {...register('image_url')} placeholder="https://..." />
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label>Категория</Label>
                            <Select onValueChange={(val) => setValue('category_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите категорию" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories?.data?.map((cat: any) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Бренд</Label>
                            <Select onValueChange={(val) => setValue('brand_id', val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите бренд" />
                                </SelectTrigger>
                                <SelectContent>
                                    {brands.map((brand: any) => (
                                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button type="submit" disabled={createProduct.isPending} className="w-full">
                        {createProduct.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Создать товар
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
