
import React, { useState } from 'react';

interface ItemPriceModalProps {
    itemName: string;
    onSave: (price: number, description: string) => void;
    onClose: () => void;
}

const ItemPriceModal: React.FC<ItemPriceModalProps> = ({ itemName, onSave, onClose }) => {
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        // Allow only numbers, and a single comma or dot for decimals
        if (/^[0-9]*[.,]?[0-9]*$/.test(value)) {
            setPrice(value);
        }
    };

    const handleSave = () => {
        const numericPrice = parseFloat(price.replace(',', '.'));
        if (!isNaN(numericPrice) && numericPrice > 0) {
            onSave(numericPrice, description);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Adicionar Detalhes do Item</h3>
                <p className="text-lg text-slate-600 mb-6">{itemName}</p>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-slate-700">Preço (R$)</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            id="price"
                            value={price}
                            onChange={handlePriceChange}
                            placeholder="Ex: 12,50"
                            className="mt-1 block w-full px-3 py-2 bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700">Descrição (Opcional)</label>
                        <input
                            type="text"
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ex: 2kg, 3 unidades, promoção"
                            className="mt-1 block w-full px-3 py-2 bg-slate-100 text-slate-900 placeholder-slate-400 border border-slate-300 rounded-md focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm transition"
                        />
                    </div>
                </div>

                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-md hover:bg-slate-300 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-md hover:bg-teal-600 transition-colors disabled:bg-slate-300"
                        disabled={!price}
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemPriceModal;