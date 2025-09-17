
import { supabase } from './supabaseClient';
import { Item, LocationType, ShoppingList } from '../types';

// Helper to handle Supabase errors
const handleSupabaseError = (error: any, context: string) => {
    if (error) {
        console.error(`Error in ${context}:`, error);
        throw error;
    }
}

// Fetch all items from the library
export const getItemsLibrary = async (): Promise<Item[]> => {
    const { data, error } = await supabase
        .from('items_library')
        .select('*')
        .order('name');
    handleSupabaseError(error, 'getItemsLibrary');
    return data || [];
};

// Fetch all shopping lists with their items
export const getShoppingLists = async (): Promise<ShoppingList[]> => {
    const { data: lists, error: listsError } = await supabase
        .from('shopping_lists')
        .select('*')
        .order('created_at', { ascending: false });
    handleSupabaseError(listsError, 'getShoppingLists');
    if (!lists) return [];

    // For each list, fetch its related items (both active and completed)
    const listsWithItems = await Promise.all(
        lists.map(async (list) => {
            if (list.status === 'active') {
                const { data: itemsData, error: itemsError } = await supabase
                    .from('shopping_list_items')
                    .select('items_library(*)')
                    .eq('list_id', list.id);
                handleSupabaseError(itemsError, 'getShoppingListItems');
                // The structure is { items_library: { id, name, ... } }
                const items = itemsData ? itemsData.map(i => i.items_library) as Item[] : [];
                return { ...list, items: items, completedItems: [] };
            } else { // status === 'completed'
                const { data: completedItems, error: completedItemsError } = await supabase
                    .from('completed_items')
                    .select('*')
                    .eq('list_id', list.id);
                handleSupabaseError(completedItemsError, 'getCompletedItems');
                return { ...list, items: [], completedItems: completedItems || [] };
            }
        })
    );
    return listsWithItems;
};

// Create a new shopping list
export const createList = async (name: string, location_type: LocationType) => {
    const { error } = await supabase
        .from('shopping_lists')
        .insert([{ name, location_type, status: 'active' }]);
    handleSupabaseError(error, 'createList');
};

// Delete a shopping list
export const deleteList = async (listId: string) => {
    const { error } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('id', listId);
    handleSupabaseError(error, 'deleteList');
};

// Find an item by name, or create it if it doesn't exist
export const findOrCreateItem = async (itemName: string, category: string): Promise<Item> => {
    // Check if item exists
    let { data: existingItem, error: findError } = await supabase
        .from('items_library')
        .select('*')
        .eq('name', itemName)
        .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116 is "exact one row not found"
        handleSupabaseError(findError, 'findOrCreateItem (find)');
    }
    
    if (existingItem) {
        return existingItem;
    }

    // Create item if it doesn't exist
    const { data: newItem, error: createError } = await supabase
        .from('items_library')
        .insert([{ name: itemName, category }])
        .select()
        .single();
    handleSupabaseError(createError, 'findOrCreateItem (create)');
    if(!newItem) throw new Error("Failed to create new item");
    return newItem;
};

// Add an item to a shopping list
export const addItemToList = async (listId: string, itemId: string) => {
    const { error } = await supabase
        .from('shopping_list_items')
        .insert([{ list_id: listId, item_id: itemId }]);
     handleSupabaseError(error, 'addItemToList');
};

// Remove an item from a shopping list
export const removeItemFromList = async (listId: string, itemId: string) => {
    const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .eq('list_id', listId)
        .eq('item_id', itemId);
    handleSupabaseError(error, 'removeItemFromList');
};

// Complete a shopping trip
export const completeShopping = async (listId: string, activeItems: Item[], purchasedItemsData: { [itemId: string]: { price: number; description: string } }) => {
    // 1. Prepare completed items records
    const completedItemsToInsert = Object.entries(purchasedItemsData).map(([itemId, data]) => {
        const itemDetails = activeItems.find(i => i.id === itemId);
        if (!itemDetails) return null;
        return {
            list_id: listId,
            item_id: itemId,
            name: itemDetails.name,
            category: itemDetails.category,
            price: data.price,
            description: data.description,
        };
    }).filter(Boolean);

    // 2. Insert completed items
    if (completedItemsToInsert.length > 0) {
        const { error: insertError } = await supabase.from('completed_items').insert(completedItemsToInsert);
        handleSupabaseError(insertError, 'completeShopping (insert)');
    }
    
    // 3. Delete active items from the join table
    const { error: deleteError } = await supabase.from('shopping_list_items').delete().eq('list_id', listId);
    handleSupabaseError(deleteError, 'completeShopping (delete)');

    // 4. Update the list status and totals
    const totalSpent = Object.values(purchasedItemsData).reduce((sum, item) => sum + item.price, 0);
    const { error: updateError } = await supabase
        .from('shopping_lists')
        .update({
            status: 'completed',
            last_purchase_total: totalSpent,
            last_purchase_date: new Date().toISOString()
        })
        .eq('id', listId);
    handleSupabaseError(updateError, 'completeShopping (update)');
};
