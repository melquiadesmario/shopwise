
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingList, Item, LocationType } from '../types';
import { AddIcon, DeleteIcon, ShoppingCartIcon, CheckIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

interface ShoppingListScreenProps {
    shoppingLists: ShoppingList[];
    itemsLibrary: Item[];
    isCategorizing: boolean;
    onCreateList: (name: string, locationType: LocationType) => void;
    onAddItemToList: (listId: string, itemName:string) => Promise<void>;
    onRemoveItemFromList: (listId: string, itemId: string) => void;
    onDeleteList: (listId: string) => void;
    onEnterShoppingMode: (listId: string) => void;
}

// Toast Component Definition
const Toast: React.FC<{ message: string; show: boolean; }> = ({ message, show }) => {
    return (
        <div
            aria-live="polite"
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-slate-800 text-white text-sm font-semibold rounded-full shadow-2xl transition-all duration-300 ease-in-out z-50 ${
                show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
            }`}
        >
            <CheckIcon />
            <span>{message}</span>
        </div>
    );
};


const CreateListForm: React.FC<{ onCreateList: (name: string, locationType: LocationType) => void; }> = ({ onCreateList }) => {
    const [name, setName] = useState('');
    const [locationType, setLocationType] = useState<LocationType>(LocationType.Mercado);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            onCreateList(name, locationType);
            setName('');
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <h2 className="text-2xl font-bold text-slate-700 mb-4">Criar Nova Lista</h2>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-end gap-4">
                <div className="flex-grow">
                    <label htmlFor="list-name" className="block text-sm font-medium text-slate-600 mb-1">Nome da Lista</label>
                    <input
                        id="list-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Compras da Semana"
                        className="w-full px-4 py-2 bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="location-type" className="block text-sm font-medium text-slate-600 mb-1">Local</label>
                    <select
                        id="location-type"
                        value={locationType}
                        onChange={(e) => setLocationType(e.target.value as LocationType)}
                        className="w-full px-4 py-2 bg-slate-100 text-slate-900 border border-slate-300 rounded-md focus:ring-teal-500 focus:border-teal-500 transition"
                    >
                        <option value={LocationType.Mercado}>Mercado</option>
                        <option value={LocationType.Feira}>Feira</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="flex justify-center items-center gap-2 px-4 py-2 bg-teal-500 text-white font-semibold rounded-md shadow-sm hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-200"
                >
                    <AddIcon />
                    Criar
                </button>
            </form>
        </div>
    );
};

const AddItemForm: React.FC<{listId: string; onAddItem: (listId: string, itemName: string) => Promise<void>; isCategorizing: boolean; showToast: (message: string) => void;}> = ({ listId, onAddItem, isCategorizing, showToast }) => {
    const [itemName, setItemName] = useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (itemName.trim()){
            await onAddItem(listId, itemName.trim());
            setItemName('');
            showToast('Item adicionado com sucesso!');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input 
                type="text" 
                value={itemName} 
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Adicionar item..."
                className="flex-grow px-3 py-1.5 bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md text-sm focus:ring-teal-500 focus:border-teal-500 transition"
            />
            <button type="submit" disabled={isCategorizing} className="px-3 py-1.5 bg-slate-700 text-white text-sm font-medium rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-wait transition-colors">
                {isCategorizing ? '...' : 'Add'}
            </button>
        </form>
    )
}

const ShoppingListCard: React.FC<Omit<ShoppingListScreenProps, 'shoppingLists' | 'itemsLibrary' | 'onCreateList' > & { list: ShoppingList, setToastMessage: (message: string) => void; }> = ({ list, onAddItemToList, onRemoveItemFromList, onDeleteList, onEnterShoppingMode, isCategorizing, setToastMessage }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const locationColor = list.location_type === LocationType.Feira ? 'border-green-400' : 'border-blue-400';
    
    const handleDeleteConfirm = () => {
        onDeleteList(list.id);
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <div className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${locationColor}`}>
                <div className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{list.name}</h3>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${list.location_type === LocationType.Feira ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {list.location_type}
                            </span>
                        </div>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="text-slate-400 hover:text-red-500 transition-colors">
                            <DeleteIcon />
                        </button>
                    </div>
                </div>
                <div className="px-4 pb-4">
                     <div className="relative">
                        <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                            {list.items.map(item => (
                                <li key={item.id} className="flex justify-between items-center text-sm bg-slate-50 p-2 rounded-md">
                                    <span>{item.name} <span className="text-xs text-slate-500">({item.category})</span></span>
                                    <button onClick={() => onRemoveItemFromList(list.id, item.id)} className="text-slate-400 hover:text-red-500 text-xs font-semibold">
                                        remover
                                    </button>
                                </li>
                            ))}
                            {list.items.length === 0 && <p className="text-sm text-slate-400 text-center py-4">Sua lista está vazia.</p>}
                        </ul>
                     </div>
                     <AddItemForm listId={list.id} onAddItem={onAddItemToList} isCategorizing={isCategorizing} showToast={setToastMessage} />
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <button
                        onClick={() => onEnterShoppingMode(list.id)}
                        disabled={list.items.length === 0}
                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-emerald-500 text-white font-semibold rounded-md shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200 disabled:bg-slate-300 disabled:cursor-not-allowed"
                    >
                        <ShoppingCartIcon />
                        Iniciar Compra
                    </button>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                title="Confirmar Exclusão"
                message="Tem certeza que deseja excluir esta lista? Esta ação não pode ser desfeita."
            />
        </>
    )
}

const ShoppingListScreen: React.FC<ShoppingListScreenProps> = (props) => {
    const { shoppingLists } = props;
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage('');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    const activeLists = shoppingLists.filter(list => list.status === 'active' || !list.status);

    return (
        <div>
            <CreateListForm onCreateList={props.onCreateList} />
            
            <h2 className="text-2xl font-bold text-slate-700 mt-10 mb-6">Minhas Listas Ativas</h2>

            {activeLists.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <p className="text-slate-500">Você ainda não tem nenhuma lista de compras ativa.</p>
                    <p className="text-slate-400 text-sm mt-2">Use o formulário acima para criar uma nova lista!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeLists.map(list => (
                        <ShoppingListCard 
                            key={list.id} 
                            list={list}
                            setToastMessage={setToastMessage}
                            {...props} 
                        />
                    ))}
                </div>
            )}

            <Toast message={toastMessage} show={!!toastMessage} />
        </div>
    );
};

export default ShoppingListScreen;