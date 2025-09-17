
export type Category = 'Laticínios' | 'Verduras' | 'Frutas' | 'Carnes' | 'Limpeza' | 'Higiene' | 'Padaria' | 'Bebidas' | 'Mercearia' | 'Outros';

export enum LocationType {
    Feira = 'Feira',
    Mercado = 'Mercado',
}

export interface Item {
    id: string;
    name: string;
    category: Category | string;
    created_at?: string;
}

export interface CompletedItem {
    id: string;
    name: string;
    category: Category | string;
    price: number;
    description: string;
}

// Representa a tabela de junção shopping_list_items
export interface ShoppingListItem {
    list_id: string;
    item_id: string;
    items_library: Item; // Relação com a biblioteca de itens
}

export interface ShoppingList {
    id: string;
    name:string;
    location_type: LocationType;
    created_at: string;
    status: 'active' | 'completed';
    last_purchase_total?: number;
    last_purchase_date?: string;
    // Itens ativos de uma lista virão da tabela de junção
    items: Item[]; 
    // Itens comprados virão da tabela completed_items
    completedItems?: CompletedItem[]; 
}

export interface Purchase {
    id: string;
    itemId: string;
    itemName: string;
    category: Category | string;
    price: number;
    location: string;
    locationType: LocationType;
    listId: string;
    purchaseDate: string;
}