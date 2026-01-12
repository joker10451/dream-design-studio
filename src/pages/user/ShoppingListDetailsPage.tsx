import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/sections/Footer"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useShoppingListItems, useRemoveItemFromList } from "@/hooks/api/useUserData"
import { Helmet } from 'react-helmet-async'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2, ExternalLink, PackageOpen } from "lucide-react"
import { ProductCard } from "@/components/catalog/ProductCard"
import { ResponsiveGrid } from "@/components/ui/responsive-container"
import { toast } from "sonner"

export const ShoppingListDetailsPage: React.FC = () => {
    const { listId } = useParams<{ listId: string }>()
    const navigate = useNavigate()

    const { data: items, isLoading } = useShoppingListItems(listId || "")
    const { mutate: removeItem } = useRemoveItemFromList(listId || "")

    const handleRemove = (itemId: string) => {
        removeItem(itemId, {
            onSuccess: () => toast.success("Товар удален из списка")
        })
    }

    const totalPrice = items?.data?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0

    return (
        <ProtectedRoute requireAuth>
            <Helmet>
                <title>Детали списка - Dream Design Studio</title>
            </Helmet>

            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4">
                        {/* Nav */}
                        <div className="flex items-center gap-4 mb-8">
                            <Button variant="ghost" size="sm" onClick={() => navigate('/user/shopping-lists')} className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                К спискам
                            </Button>
                        </div>

                        {/* Header / Stats */}
                        <div className="bg-secondary/10 rounded-3xl p-6 md:p-10 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Детали списка</h1>
                                <p className="text-muted-foreground">
                                    Количество товаров: <span className="text-foreground font-medium">{items?.data?.length || 0}</span>
                                </p>
                            </div>

                            <div className="bg-background/50 backdrop-blur-sm border border-border px-8 py-4 rounded-2xl">
                                <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider">Общая стоимость</p>
                                <p className="text-3xl font-bold text-primary">{totalPrice.toLocaleString("ru-RU")} ₽</p>
                            </div>
                        </div>

                        {/* Content */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="h-96 bg-secondary/20 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : !items?.data || items.data.length === 0 ? (
                            <div className="text-center py-20 border-2 border-dashed border-border rounded-3xl">
                                <PackageOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h2 className="text-xl font-semibold mb-2">В этом списке пока нет товаров</h2>
                                <p className="text-muted-foreground mb-6">Добавляйте товары из каталога или избранного</p>
                                <Button onClick={() => navigate('/catalog')}>Перейти в каталог</Button>
                            </div>
                        ) : (
                            <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap="lg">
                                {items.data.map((item) => (
                                    <div key={item.id} className="relative group">
                                        <ProductCard product={item.product} showCompare={false} showFavorite={false} />
                                        <div className="absolute top-4 right-4 z-20 flex gap-2">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleRemove(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="absolute bottom-20 left-4 z-20 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                                            Кол-во: {item.quantity}
                                        </div>
                                    </div>
                                ))}
                            </ResponsiveGrid>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </ProtectedRoute>
    )
}

export default ShoppingListDetailsPage;
