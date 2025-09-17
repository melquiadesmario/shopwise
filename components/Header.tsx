
import React from 'react';
import { ShoppingBagIcon, HistoryIcon } from './icons';

type View = 'lists' | 'shopping' | 'history' | 'purchaseDetail';

interface HeaderProps {
    currentView: View;
    setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
    const navItems = [
        { id: 'lists', label: 'Minhas Listas', icon: <ShoppingBagIcon /> },
        { id: 'history', label: 'Histórico', icon: <HistoryIcon /> },
    ];

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center py-4">
                <div className="flex items-center space-x-2">
                    <span className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center">
                        <i className="fa fa-shopping-cart text-white"></i>
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                        Shop<span className="text-teal-500">Wise</span>
                    </h1>
                </div>
                <nav className="flex items-center space-x-2 sm:space-x-4">
                    {navItems.map((item) => {
                         const isActive = currentView === item.id || (currentView === 'shopping' && item.id === 'lists') || (currentView === 'purchaseDetail' && item.id === 'history');
                         return (
                            <button
                                key={item.id}
                                onClick={() => setView(item.id as View)}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                                    isActive
                                        ? 'bg-teal-50 text-teal-600'
                                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                }`}
                            >
                                {item.icon}
                                <span className="hidden sm:inline">{item.label}</span>
                            </button>
                         )
                    })}
                </nav>
            </div>
        </header>
    );
};

export default Header;
