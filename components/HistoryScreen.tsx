
import React, { useState } from 'react';
import { ShoppingList, LocationType } from '../types';
import { DeleteIcon, ReceiptIcon } from './icons';
import ConfirmationModal from './ConfirmationModal';

interface HistoryScreenProps {
    shoppingLists: ShoppingList[];
    onViewPurchaseDetail: (listId: string) => void;
    onDeleteList: (listId: string) => void;
}

const HistoryListCard: React.FC<{ list: ShoppingList; onViewDetails: (listId: string) => void; onDelete: (listId: string) => void; }> = ({ list, onViewDetails, onDelete }) => {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const locationColor = list.location_type === LocationType.Feira ? 'border-green-400' : 'border-blue-400';

    const handleDeleteConfirm = () => {
        onDelete(list.id);
        setIsDeleteModalOpen(false);
    };

    return (
        <>
            <div className={`bg-white rounded-lg shadow-md overflow-hidden border-t-4 ${locationColor} flex flex-col`}>
                <div className="p-4 flex-grow">
                     <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800">{list.name}</h3>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${list.location_type === LocationType.Feira ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                                {list.location_type}
                            </span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setIsDeleteModalOpen(true); }} className="text-slate-400 hover:text-red-500 transition-colors">
                            <DeleteIcon />
                        </button>
                    </div>
                     <div className="text-sm text-slate-600 mt-4">
                        <p>Total: <span className="font-bold text-slate-800">R$ {list.last_purchase_total?.toFixed(2) ?? '0.00'}</span></p>
                        <p className="text-xs text-slate-500">
                            Finalizada em {list.last_purchase_date ? new Date(list.last_purchase_date).toLocaleDateString('pt-BR') : ''}
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                     <button
                        onClick={() => onViewDetails(list.id)}
                        className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-md shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors duration-200"
                    >
                        <ReceiptIcon />
                        Ver Detalhes
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
    );
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ shoppingLists, onViewPurchaseDetail, onDeleteList }) => {
    const historyLists = shoppingLists
        .filter(list => list.status === 'completed')
        .sort((a, b) => new Date(b.last_purchase_date!).getTime() - new Date(a.last_purchase_date!).getTime());

    return (
        <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-6">Histórico de Compras</h1>
            {historyLists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {historyLists.map(list => (
                        <HistoryListCard
                            key={list.id}
                            list={list}
                            onViewDetails={onViewPurchaseDetail}
                            onDelete={onDeleteList}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-lg shadow-md">
                    <p className="text-slate-500 text-lg">Nenhuma compra foi finalizada ainda.</p>
                    <p className="text-slate-400 text-sm mt-2">Complete uma lista para ver seu histórico aqui!</p>
                </div>
            )}
        </div>
    );
};

export default HistoryScreen;