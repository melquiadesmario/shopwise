
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ShoppingList, Item, LocationType, CompletedItem } from './types';
import { CATEGORIES } from './constants';
import { categorizeNewItem, generatePurchaseDetailInsights } from './services/geminiService';
import * as db from './services/database';
import ShoppingListScreen from './components/ShoppingListScreen';
import ShoppingModeScreen from './components/ShoppingModeScreen';
import HistoryScreen from './components/HistoryScreen';
import Header from './components/Header';
import PurchaseDetailScreen from './components/PurchaseDetailScreen';

type View = 'lists' | 'shopping' | 'history' | 'purchaseDetail';

const App: React.FC = () => {
    const [view, setView] = useState<View>('lists');
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const [viewingListId, setViewingListId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [itemsLibrary, setItemsLibrary] = useState<Item[]>([]);
    const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
    
    const [isCategorizing, setIsCategorizing] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        const [lists, items] = await Promise.all([
            db.getShoppingLists(),
            db.getItemsLibrary()
        ]);
        setShoppingLists(lists);
        setItemsLibrary(items);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateList = async (name: string, locationType: LocationType) => {
        await db.createList(name, locationType);
        await fetchData();
    };

    const handleAddItemToList = useCallback(async (listId: string, itemName: string) => {
        let item = itemsLibrary.find(i => i.name.toLowerCase() === itemName.toLowerCase());

        if (!item) {
            setIsCategorizing(true);
            try {
                const category = await categorizeNewItem(itemName, CATEGORIES);
                const newItem = await db.findOrCreateItem(itemName, category || 'Outros');
                item = newItem;
            } catch (error) {
                console.error("Failed to categorize or create item:", error);
                const newItem = await db.findOrCreateItem(itemName, 'Outros');
                item = newItem;
            } finally {
                setIsCategorizing(false);
            }
        }
        
        if (item) {
           await db.addItemToList(listId, item.id);
           await fetchData();
        }
    }, [itemsLibrary, fetchData]);

    const handleRemoveItemFromList = async (listId: string, itemId: string) => {
       await db.removeItemFromList(listId, itemId);
       await fetchData();
    };
    
    const handleDeleteList = async (listId: string) => {
        await db.deleteList(listId);
        await fetchData();
    };

    const handleEnterShoppingMode = (listId: string) => {
        setActiveListId(listId);
        setView('shopping');
    };

    const handleCompleteShopping = async (listId: string, purchasedItems: { [itemId: string]: { price: number; description: string } }) => {
        const list = shoppingLists.find(l => l.id === listId);
        if (!list) return;

        await db.completeShopping(listId, list.items, purchasedItems);

        await fetchData();
        setView('lists');
        setActiveListId(null);
    };

    const handleViewPurchaseDetail = (listId: string) => {
        setViewingListId(listId);
        setView('purchaseDetail');
    };

    const activeList = useMemo(() => {
        return shoppingLists.find(list => list.id === activeListId);
    }, [activeListId, shoppingLists]);
    
    const viewingList = useMemo(() => {
        return shoppingLists.find(list => list.id === viewingListId);
    }, [viewingListId, shoppingLists]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
                </div>
            )
        }
        switch (view) {
            case 'shopping':
                return activeList ? (
                    <ShoppingModeScreen
                        list={activeList}
                        onComplete={handleCompleteShopping}
                        onBack={() => setView('lists')}
                    />
                ) : null;
            case 'history':
                return <HistoryScreen 
                    shoppingLists={shoppingLists}
                    onViewPurchaseDetail={handleViewPurchaseDetail}
                    onDeleteList={handleDeleteList}
                />;
            case 'purchaseDetail':
                return viewingList ? (
                    <PurchaseDetailScreen 
                        list={viewingList} 
                        onBack={() => { setView('history'); setViewingListId(null); }}
                        generateInsights={generatePurchaseDetailInsights}
                    />
                ) : null;
            case 'lists':
            default:
                return (
                    <ShoppingListScreen
                        shoppingLists={shoppingLists}
                        itemsLibrary={itemsLibrary}
                        isCategorizing={isCategorizing}
                        onCreateList={handleCreateList}
                        onAddItemToList={handleAddItemToList}
                        onRemoveItemFromList={handleRemoveItemFromList}
                        onDeleteList={handleDeleteList}
                        onEnterShoppingMode={handleEnterShoppingMode}
                    />
                );
        }
    };
    
    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <Header currentView={view} setView={setView} />
            <main className="p-4 sm:p-6 md:p-8">
                {renderContent()}
            </main>
        </div>
    );
};

export default App;