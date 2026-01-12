import { BaseApiService, handleSupabaseError, ApiResponse, PaginatedResponse } from './base'
import { supabase } from '../supabase/client'
import type {
    UserFavorite,
    ShoppingList,
    ShoppingListItem,
    ProductWithRelations
} from '../../types/database'

export class UserDataApiService {
    // --- FAVORITES ---

    async getFavorites(): Promise<PaginatedResponse<ProductWithRelations>> {
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error('Пользователь не авторизован');

            const { data, error, count } = await supabase
                .from('user_favorites')
                .select(`
          product_id,
          products:product_id (
            *,
            brands:brand_id (*),
            categories:category_id (*),
            product_images (*),
            affiliate_links (*)
          )
        `, { count: 'exact' })
                .eq('user_id', user.user.id);

            // Мапим данные, чтобы вернуть массив продуктов
            const products = data?.map(item => item.products) || [];

            return {
                data: products as unknown as ProductWithRelations[],
                count,
                error: handleSupabaseError(error)
            };
        } catch (err) {
            return {
                data: [],
                count: null,
                error: err instanceof Error ? err : new Error('Неизвестная ошибка')
            };
        }
    }

    async toggleFavorite(productId: string): Promise<ApiResponse<boolean>> {
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error('Пользователь не авторизован');

            // Проверяем, есть ли уже в избранном
            const { data: existing } = await supabase
                .from('user_favorites')
                .select('id')
                .eq('user_id', user.user.id)
                .eq('product_id', productId)
                .single();

            if (existing) {
                // Удаляем
                const { error } = await supabase
                    .from('user_favorites')
                    .delete()
                    .eq('id', existing.id);

                return { data: false, error: handleSupabaseError(error) };
            } else {
                // Добавляем
                const { error } = await supabase
                    .from('user_favorites')
                    .insert({ user_id: user.user.id, product_id: productId });

                return { data: true, error: handleSupabaseError(error) };
            }
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error('Неизвестная ошибка')
            };
        }
    }

    // --- SHOPPING LISTS ---

    async getShoppingLists(): Promise<PaginatedResponse<ShoppingList>> {
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error('Пользователь не авторизован');

            const { data, error, count } = await supabase
                .from('shopping_lists')
                .select('*', { count: 'exact' })
                .eq('user_id', user.user.id)
                .order('created_at', { ascending: false });

            return {
                data: data || [],
                count,
                error: handleSupabaseError(error)
            };
        } catch (err) {
            return {
                data: [],
                count: null,
                error: err instanceof Error ? err : new Error('Неизвестная ошибка')
            };
        }
    }

    async createShoppingList(name: string, description?: string): Promise<ApiResponse<ShoppingList>> {
        try {
            const { data: user } = await supabase.auth.getUser();
            if (!user.user) throw new Error('Пользователь не авторизован');

            const { data, error } = await supabase
                .from('shopping_lists')
                .insert({ user_id: user.user.id, name, description })
                .select()
                .single();

            return {
                data,
                error: handleSupabaseError(error)
            };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error('Неизвестная ошибка')
            };
        }
    }

    async deleteShoppingList(listId: string): Promise<ApiResponse<boolean>> {
        try {
            const { error } = await supabase
                .from('shopping_lists')
                .delete()
                .eq('id', listId);

            return {
                data: !error,
                error: handleSupabaseError(error)
            };
        } catch (err) {
            return {
                data: false,
                error: err instanceof Error ? err : new Error('Неизвестная ошибка')
            };
        }
    }

    // --- SHOPPING LIST ITEMS ---

    async getShoppingListItems(listId: string): Promise<PaginatedResponse<ShoppingListItem & { product: ProductWithRelations }>> {
        try {
            const { data, error, count } = await supabase
                .from('shopping_list_items')
                .select(`
          *,
          product:product_id (
            *,
            brands:brand_id (*),
            categories:category_id (*),
            product_images (*),
            affiliate_links (*)
          )
        `, { count: 'exact' })
                .eq('list_id', listId);

            return {
                data: data as any || [],
                count,
                error: handleSupabaseError(error)
            };
        } catch (err) {
            return {
                data: [],
                count: null,
                error: err instanceof Error ? err : new Error('Неизвестная ошибка')
            };
        }
    }

    async addItemToList(listId: string, productId: string, quantity: number = 1): Promise<ApiResponse<ShoppingListItem>> {
        try {
            const { data, error } = await supabase
                .from('shopping_list_items')
                .insert({ list_id: listId, product_id: productId, quantity })
                .select()
                .single();

            return {
                data,
                error: handleSupabaseError(error)
            };
        } catch (err) {
            return {
                data: null,
                error: err instanceof Error ? err : new Error('Неизвестная ошибка')
            };
        }
    }

    async removeItemFromList(itemId: string): Promise<ApiResponse<boolean>> {
        try {
            const { error } = await supabase
                .from('shopping_list_items')
                .delete()
                .eq('id', itemId);

            return {
                data: !error,
                error: handleSupabaseError(error)
            };
        } catch (err) {
            return {
                data: false,
                error: err instanceof Error ? err : new Error('Неизвестная ошибка')
            };
        }
    }
}

export const userDataApi = new UserDataApiService();
