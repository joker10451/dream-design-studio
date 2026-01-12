import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userDataApi } from '../../lib/api/user-data'
import { QUERY_KEYS } from './useSupabase'
import type {
    ShoppingList,
    ShoppingListItem,
    ProductWithRelations
} from '../../types/database'

// --- FAVORITES ---

export const useFavorites = (enabled: boolean = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.favorites,
        queryFn: () => userDataApi.getFavorites(),
        enabled,
        staleTime: 5 * 60 * 1000,
    })
}

export const useToggleFavorite = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (productId: string) => userDataApi.toggleFavorite(productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.favorites })
        },
    })
}

// --- SHOPPING LISTS ---

export const useShoppingLists = (enabled: boolean = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.shoppingLists,
        queryFn: () => userDataApi.getShoppingLists(),
        enabled,
        staleTime: 5 * 60 * 1000,
    })
}

export const useCreateShoppingList = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ name, description }: { name: string, description?: string }) =>
            userDataApi.createShoppingList(name, description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists })
        },
    })
}

export const useDeleteShoppingList = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (listId: string) => userDataApi.deleteShoppingList(listId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingLists })
        },
    })
}

// --- SHOPPING LIST ITEMS ---

export const useShoppingListItems = (listId: string, enabled: boolean = true) => {
    return useQuery({
        queryKey: QUERY_KEYS.shoppingListItems(listId),
        queryFn: () => userDataApi.getShoppingListItems(listId),
        enabled: enabled && !!listId,
        staleTime: 5 * 60 * 1000,
    })
}

export const useAddItemToList = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ listId, productId, quantity }: { listId: string, productId: string, quantity?: number }) =>
            userDataApi.addItemToList(listId, productId, quantity),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingListItems(variables.listId) })
        },
    })
}

export const useRemoveItemFromList = (listId: string) => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (itemId: string) => userDataApi.removeItemFromList(itemId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.shoppingListItems(listId) })
        },
    })
}
