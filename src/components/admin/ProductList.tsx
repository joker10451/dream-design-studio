import { useProducts, useDeleteProduct } from '@/hooks/api/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export function ProductList() {
    const { data, isLoading } = useProducts();
    const deleteProduct = useDeleteProduct();

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this product?')) {
            deleteProduct.mutate(id, {
                onSuccess: () => toast.success('Product deleted')
            });
        }
    };

    if (isLoading) return <div className="p-4"><Loader2 className="animate-spin" /> Loading products...</div>;

    const products = data?.data || [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Текущие товары ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Название</TableHead>
                            <TableHead>Цена</TableHead>
                            <TableHead>Категория</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                    Товаров пока нет. Создайте первый!
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product: any) => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{product.price} ₽</TableCell>
                                    <TableCell>{product.categories?.name || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
