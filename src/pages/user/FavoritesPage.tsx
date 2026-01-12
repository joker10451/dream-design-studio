import React from 'react'
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/sections/Footer"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useFavorites } from "@/hooks/api/useUserData"
import { ProductCard } from "@/components/catalog/ProductCard"
import { SEOHead } from '@/components/seo/SEOHead'
import { Button } from "@/components/ui/button"
import { ArrowLeft, Heart, ShoppingBag } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { motion } from "framer-motion"
import { ResponsiveGrid } from "@/components/ui/responsive-container"

export const FavoritesPage: React.FC = () => {
    const navigate = useNavigate()
    const { data: favorites, isLoading, isError } = useFavorites()

    const handleGoBack = () => {
        navigate(-1)
    }

    return (
        <ProtectedRoute requireAuth>
            <SEOHead
                title="Избранное"
                description="Ваши избранные устройства умного дома в Smart Home 2026"
            />

            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4">
                        {/* Заголовок */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleGoBack}
                                    className="hidden md:flex items-center gap-2"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Назад
                                </Button>

                                <div>
                                    <h1 className="text-3xl font-bold flex items-center gap-3">
                                        <Heart className="h-8 w-8 text-red-500 fill-current" />
                                        Избранное
                                    </h1>
                                    <p className="text-muted-foreground mt-1">
                                        Устройства, которые вы отложили для покупки
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => navigate('/catalog')}>
                                    В каталог
                                </Button>
                            </div>
                        </div>

                        {/* Контент */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="h-96 bg-secondary/20 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : isError ? (
                            <div className="text-center py-20 bg-secondary/10 rounded-3xl">
                                <p className="text-destructive font-medium mb-4">Ошибка загрузки избранного</p>
                                <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
                            </div>
                        ) : favorites?.data?.length === 0 ? (
                            <div className="text-center py-20 bg-secondary/10 rounded-3xl">
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Heart className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">Здесь пока пусто</h2>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                    Добавляйте понравившиеся товары в избранное, чтобы не потерять их и следить за ценой.
                                </p>
                                <Button className="rounded-xl px-8" onClick={() => navigate('/catalog')}>
                                    Перейти в каталог
                                </Button>
                            </div>
                        ) : (
                            <ResponsiveGrid cols={{ xs: 1, sm: 2, lg: 3 }} gap="lg">
                                {favorites?.data?.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        showCompare={false}
                                    />
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

export default FavoritesPage;
