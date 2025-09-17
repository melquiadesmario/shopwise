import React, { useMemo, useState, useCallback } from 'react';
import { Purchase } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MagicWandIcon } from './icons';

interface DashboardScreenProps {
    purchases: Purchase[];
    generateInsights: (purchases: Purchase[]) => Promise<string>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF196A', '#19D7FF', '#FFD719'];

const CategorySpendingChart: React.FC<{ data: { name: string, value: number }[] }> = ({ data }) => {
    return (
        <div className="w-full h-80">
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        // FIX: Explicitly type the label's destructured props to resolve a TypeScript error where the 'percent' property was not found.
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};


const DashboardScreen: React.FC<DashboardScreenProps> = ({ purchases, generateInsights }) => {
    const [insights, setInsights] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateInsights = useCallback(async () => {
        setIsLoading(true);
        setInsights('');
        try {
            const result = await generateInsights(purchases);
            setInsights(result);
        } catch(error) {
            setInsights('Ocorreu um erro ao gerar seus insights.');
        } finally {
            setIsLoading(false);
        }
    }, [purchases, generateInsights]);

    const stats = useMemo(() => {
        const totalSpent = purchases.reduce((acc, p) => acc + p.price, 0);
        const categorySpending = purchases.reduce((acc, p) => {
            acc[p.category] = (acc[p.category] || 0) + p.price;
            return acc;
        }, {} as { [key: string]: number });
        
        const categoryChartData = Object.entries(categorySpending)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        const topSpendingItems = [...purchases]
            .sort((a, b) => b.price - a.price)
            .slice(0, 5);

        return { totalSpent, categoryChartData, topSpendingItems };
    }, [purchases]);

    if (purchases.length === 0) {
        return (
             <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-slate-500 text-lg">Você ainda não tem dados de compras para analisar.</p>
                <p className="text-slate-400 text-sm mt-2">Complete uma lista no modo de compra para começar a ver seus insights!</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <h3 className="text-lg font-medium text-slate-500">Gasto Total</h3>
                    <p className="text-4xl font-bold text-teal-600 mt-2">R$ {stats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <h3 className="text-lg font-medium text-slate-500">Total de Compras</h3>
                    <p className="text-4xl font-bold text-blue-600 mt-2">{purchases.length}</p>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                    <h3 className="text-lg font-medium text-slate-500">Categorias Distintas</h3>
                    <p className="text-4xl font-bold text-amber-600 mt-2">{stats.categoryChartData.length}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-slate-700 mb-4">Gasto por Categoria</h3>
                    <CategorySpendingChart data={stats.categoryChartData} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-slate-700 mb-4">Itens Mais Caros</h3>
                    <ul className="space-y-3">
                        {stats.topSpendingItems.map(item => (
                            <li key={item.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-md">
                                <div>
                                    <p className="font-semibold text-slate-800">{item.itemName}</p>
                                    <p className="text-sm text-slate-500">{item.category}</p>
                                </div>
                                <p className="font-bold text-lg text-slate-700">R$ {item.price.toFixed(2)}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
             <div className="bg-white p-6 rounded-lg shadow-lg">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4">
                    <h3 className="text-xl font-bold text-slate-700">Insights da IA</h3>
                    <button 
                        onClick={handleGenerateInsights} 
                        disabled={isLoading}
                        className="mt-4 sm:mt-0 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-md shadow-sm hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-opacity disabled:opacity-50 disabled:cursor-wait">
                        <MagicWandIcon />
                        {isLoading ? 'Gerando...' : 'Gerar Análise Inteligente'}
                    </button>
                 </div>

                {isLoading && (
                     <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto"></div>
                        <p className="mt-4 text-slate-500">Analisando seus dados... Isso pode levar um momento.</p>
                    </div>
                )}
                
                {insights && (
                     <div className="prose prose-slate max-w-none p-4 bg-slate-50 rounded-md mt-4">
                         {insights.split('\n').map((line, i) => {
                             if (line.startsWith('**') || line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.') || line.startsWith('5.')) {
                                 return <p key={i} className="font-bold my-2">{line.replace(/\*\*/g, '')}</p>;
                             }
                             if (line.trim() === '') return null;
                             return <p key={i}>{line}</p>;
                         })}
                     </div>
                )}

             </div>

        </div>
    );
};

export default DashboardScreen;