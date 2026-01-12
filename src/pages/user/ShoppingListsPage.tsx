import React, { useState } from 'react'
import { Navbar } from "@/components/ui/navbar"
import { Footer } from "@/components/sections/Footer"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { useShoppingLists, useCreateShoppingList, useDeleteShoppingList } from "@/hooks/api/useUserData"
import { SEOHead } from '@/components/seo/SEOHead'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, ShoppingBag, Trash2, Calendar, LayoutList, ChevronRight } from "lucide-react"
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export const ShoppingListsPage: React.FC = () => {
    const navigate = useNavigate()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newListName, setNewListName] = useState("")
    const [newListDesc, setNewListDesc] = useState("")

    const { data: lists, isLoading } = useShoppingLists()
    const { mutate: createList, isPending: isCreating } = useCreateShoppingList()
    const { mutate: deleteList } = useDeleteShoppingList()

    const handleCreateList = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newListName.trim()) return

        createList({ name: newListName, description: newListDesc }, {
            onSuccess: () => {
                setIsDialogOpen(false)
                setNewListName("")
                setNewListDesc("")
                toast.success("Список покупок создан")
            }
        })
    }

    const handleDeleteList = (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        if (confirm("Вы уверены, что хотите удалить этот список?")) {
            deleteList(id, {
                onSuccess: () => toast.success("Список удален")
            })
        }
    }

    return (
        <ProtectedRoute requireAuth>
            <SEOHead
                title="Списки покупок"
                description="Планируйте оснащение вашего дома с помощью списков покупок в Smart Home 2026"
            />

            <div className="min-h-screen bg-background">
                <Navbar />

                <main className="pt-24 pb-16">
                    <div className="container mx-auto px-4">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold flex items-center gap-3">
                                    <ShoppingBag className="h-8 w-8 text-primary" />
                                    Списки покупок
                                </h1>
                                <p className="text-muted-foreground mt-1">
                                    Планируйте оснащение вашего дома по комнатам или этапам
                                </p>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="rounded-xl gap-2">
                                        <Plus className="h-4 w-4" />
                                        Новый список
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <form onSubmit={handleCreateList}>
                                        <DialogHeader>
                                            <DialogTitle>Создать новый список</DialogTitle>
                                            <DialogDescription>
                                                Дайте название вашему списку покупок, чтобы легче было ориентироваться
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Название</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Например: Гостиная"
                                                    value={newListName}
                                                    onChange={(e) => setNewListName(e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="description">Описание (необязательно)</Label>
                                                <Textarea
                                                    id="description"
                                                    placeholder="Устройства для автоматизации гостиной..."
                                                    value={newListDesc}
                                                    onChange={(e) => setNewListDesc(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                Отмена
                                            </Button>
                                            <Button type="submit" disabled={isCreating}>
                                                {isCreating ? "Создание..." : "Создать"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Content */}
                        {isLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map((n) => (
                                    <div key={n} className="h-48 bg-secondary/20 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : !lists?.data || lists.data.length === 0 ? (
                            <div className="text-center py-20 bg-secondary/10 rounded-3xl">
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LayoutList className="h-8 w-8 text-muted-foreground" />
                                </div>
                                <h2 className="text-2xl font-semibold mb-2">У вас пока нет списков</h2>
                                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                                    Создайте свой первый список покупок, чтобы начать планировать умный дом своей мечты.
                                </p>
                                <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                                    Создать список
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {lists.data.map((list, index) => (
                                        <motion.div
                                            key={list.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card
                                                className="group hover:border-primary/50 transition-all cursor-pointer h-full relative overflow-hidden"
                                                onClick={() => navigate(`/user/shopping-lists/${list.id}`)}
                                            >
                                                <CardHeader className="pb-2">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-xl line-clamp-1">{list.name}</CardTitle>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => handleDeleteList(e, list.id)}
                                                            className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                                                        {list.description || "Без описания"}
                                                    </p>
                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(list.created_at).toLocaleDateString("ru-RU")}
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </main>

                <Footer />
            </div>
        </ProtectedRoute>
    )
}

export default ShoppingListsPage;
