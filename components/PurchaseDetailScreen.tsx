
import React, { useMemo, useState } from 'react';
import { ShoppingList } from '../types';
import { BackIcon, MagicWandIcon } from './icons';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF196A', '#19D7FF', '#FFD719'];

const PurchaseCategoryChart: React.FC<{ data: { name: string, value: number }[] }> = ({ data }) => {
     if (data.length === 0) return <div className="text-center text-slate-500">Sem dados para o gráfico.</div>;
    return (
        <div className="w-full h-64">
             <ResponsiveContainer>
                <PieChart>
                    <Pie data={data} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name">
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

interface PurchaseDetailScreenProps {
    list: ShoppingList;
    onBack: () => void;
    generateInsights: (list: ShoppingList) => Promise<string>;
}

const PurchaseDetailScreen: React.FC<PurchaseDetailScreenProps> = ({ list, onBack, generateInsights }) => {
    const [insights, setInsights] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateInsights = async () => {
        setIsLoading(true);
        setInsights('');
        try {
            const result = await generateInsights(list);
            setInsights(result);
        } catch(error) {
            setInsights('Ocorreu um erro ao gerar seus insights.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const categoryChartData = useMemo(() => {
        if (!list.completedItems) return [];

        const categorySpending = list.completedItems.reduce((acc, item) => {
            const category = item.category || 'Outros';
            acc[category] = (acc[category] || 0) + item.price;
            return acc;
        }, {} as { [key: string]: number });
        
        return Object.entries(categorySpending)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [list.completedItems]);

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 hover:text-teal-600 mb-4 font-semibold">
                <BackIcon />
                Voltar para o Histórico
            </button>

             <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
                <header className="border-b border-slate-200 pb-4 mb-6">
                    <h2 className="text-3xl font-bold text-slate-800">{list.name}</h2>
                    <p className="text-slate-500 mt-1">
                        Compra finalizada em {list.last_purchase_date ? new Date(list.last_purchase_date).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' }) : 'N/A'}
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
                    <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-slate-500">Total Gasto</h4>
                        <p className="text-2xl font-bold text-teal-600">R$ {list.last_purchase_total?.toFixed(2) ?? '0,00'}</p>
                    </div>
                     <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-slate-500">Itens Comprados</h4>
                        <p className="text-2xl font-bold text-blue-600">{list.completedItems?.length ?? 0}</p>
                    </div>
                     <div className="bg-slate-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-slate-500">Local da Compra</h4>
                        <p className="text-2xl font-bold text-amber-600">{list.location_type}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                         <h3 className="text-xl font-bold text-slate-700 mb-4">Itens da Compra</h3>
                         <div className="max-h-96 overflow-y-auto pr-2 -mr-2">
                             <ul className="space-y-3">
                                 {list.completedItems?.map(item => (
                                    <li key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                                        <div>
                                            <p className="font-semibold text-slate-800">{item.name}</p>
                                            {item.description && <p className="text-sm text-slate-500">{item.description}</p>}
                                        </div>
                                        <p className="font-bold text-lg text-slate-700 whitespace-nowrap">R$ {item.price.toFixed(2)}</p>
                                    </li>
                                 ))}
                                 {(list.completedItems?.length ?? 0) === 0 && (
                                     <p className="text-slate-500 text-center py-4">Nenhum item foi registrado nesta compra.</p>
                                 )}
                             </ul>
                         </div>
                    </div>
                    <div className="lg:col-span-2">
                        <h3 className="text-xl font-bold text-slate-700 mb-4">Gasto por Categoria</h3>
                         <PurchaseCategoryChart data={categoryChartData} />
                    </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-6">
                     <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-700">Análise da Compra com IA</h3>
                        <button 
                            onClick={handleGenerateInsights} 
                            disabled={isLoading}
                            className="mt-4 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                            <MagicWandIcon />
                            {isLoading ? 'Analisando...' : 'Gerar Análise'}
                        </button>
                     </div>

                    {isLoading && (
                         <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                            <p className="mt-4 text-slate-500">Analisando sua compra... Isso pode levar um momento.</p>
                        </div>
                    )}
                    
                    {insights && (
                         <div className="prose prose-slate max-w-none p-4 bg-slate-50 rounded-md mt-4">
                             {insights.split('\n').map((line, i) => {
                                 if (line.startsWith('**') || /^\d+\./.test(line)) {
                                     return <p key={i} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>;
                                 }
                                 if (line.trim() === '') return null;
                                 return <p key={i}>{line}</p>;
                             })}
                         </div>
                    )}
                 </div>
            </div>
        </div>
    );
};

export default PurchaseDetailScreen;