
import React, { useState, useMemo } from 'react';
import { ShoppingList } from '../types';
import ItemPriceModal from './ItemPriceModal';
import { BackIcon } from './icons';

interface ShoppingModeScreenProps {
    list: ShoppingList;
    onComplete: (listId: string, purchasedItems: { [itemId: string]: { price: number; description: string } }) => void;
    onBack: () => void;
}

const ShoppingModeScreen: React.FC<ShoppingModeScreenProps> = ({ list, onComplete, onBack }) => {
    const [checkedItems, setCheckedItems] = useState<{ [itemId: string]: boolean }>({});
    const [purchasedItemsData, setPurchasedItemsData] = useState<{ [itemId: string]: { price: number; description: string } }>({});
    const [modalItem, setModalItem] = useState<string | null>(null);

    const runningTotal = useMemo(() => {
        return Object.values(purchasedItemsData).reduce((total, item) => total + item.price, 0);
    }, [purchasedItemsData]);

    const handleCheckItem = (itemId: string) => {
        if (!checkedItems[itemId]) {
            setModalItem(itemId);
        } else {
            // Uncheck
            setCheckedItems(prev => ({ ...prev, [itemId]: false }));
            setPurchasedItemsData(prev => {
                const newData = { ...prev };
                delete newData[itemId];
                return newData;
            });
        }
    };

    const handleSaveItemData = (itemId: string, price: number, description: string) => {
        setCheckedItems(prev => ({ ...prev, [itemId]: true }));
        setPurchasedItemsData(prev => ({ ...prev, [itemId]: { price, description } }));
        setModalItem(null);
    };

    const handleFinishShopping = () => {
        onComplete(list.id, purchasedItemsData);
    };
    
    const currentItemForModal = list.items.find(item => item.id === modalItem);

    return (
        <div className="max-w-2xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 mb-4">
                <BackIcon />
                Voltar para listas
            </button>

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{list.name}</h2>
                <p className="text-slate-500 mb-6">Modo de compra ativo. Marque os itens que você comprou.</p>
                
                <ul className="space-y-3">
                    {list.items.map(item => (
                        <li key={item.id}>
                            <label className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 cursor-pointer ${checkedItems[item.id] ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'} border`}>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={!!checkedItems[item.id]}
                                        onChange={() => handleCheckItem(item.id)}
                                        className="h-5 w-5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className={`ml-4 text-lg ${checkedItems[item.id] ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                        {item.name}
                                    </span>
                                </div>
                                {checkedItems[item.id] && purchasedItemsData[item.id] && (
                                    <span className="font-semibold text-emerald-700">
                                        R$ {purchasedItemsData[item.id].price.toFixed(2)}
                                    </span>
                                )}
                            </label>
                        </li>
                    ))}
                </ul>
                
                <div className="mt-8 border-t pt-6">
                    <div className="flex justify-between items-center text-xl font-bold text-slate-700 mb-4">
                        <span>Total Parcial:</span>
                        <span>R$ {runningTotal.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleFinishShopping}
                        disabled={Object.keys(purchasedItemsData).length === 0}
                        className="w-full bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        Finalizar Compra ({Object.keys(purchasedItemsData).length} item(s))
                    </button>
                </div>
            </div>
            
            {currentItemForModal && (
                <ItemPriceModal
                    itemName={currentItemForModal.name}
                    onSave={(price, description) => handleSaveItemData(currentItemForModal.id, price, description)}
                    onClose={() => setModalItem(null)}
                />
            )}
        </div>
    );
};

export default ShoppingModeScreen;