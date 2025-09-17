
import { Item, Category } from './types';

export const CATEGORIES: Category[] = ['Laticínios', 'Verduras', 'Frutas', 'Carnes', 'Limpeza', 'Higiene', 'Padaria', 'Bebidas', 'Mercearia', 'Outros'];

export const INITIAL_ITEMS: Item[] = [
    // Frutas
    { id: 'item-1', name: 'Maçã Gala', category: 'Frutas' },
    { id: 'item-2', name: 'Banana Prata', category: 'Frutas' },
    { id: 'item-3', name: 'Laranja Pêra', category: 'Frutas' },
    { id: 'item-4', name: 'Mamão Formosa', category: 'Frutas' },
    { id: 'item-5', name: 'Uva Thompson', category: 'Frutas' },

    // Verduras
    { id: 'item-6', name: 'Alface Crespa', category: 'Verduras' },
    { id: 'item-7', name: 'Tomate Italiano', category: 'Verduras' },
    { id: 'item-8', name: 'Cebola', category: 'Verduras' },
    { id: 'item-9', name: 'Cenoura', category: 'Verduras' },
    { id: 'item-10', name: 'Batata Inglesa', category: 'Verduras' },

    // Laticínios
    { id: 'item-11', name: 'Leite Integral', category: 'Laticínios' },
    { id: 'item-12', name: 'Queijo Minas Frescal', category: 'Laticínios' },
    { id: 'item-13', name: 'Iogurte Natural', category: 'Laticínios' },
    { id: 'item-14', name: 'Manteiga com Sal', category: 'Laticínios' },
    
    // Carnes
    { id: 'item-15', name: 'Peito de Frango', category: 'Carnes' },
    { id: 'item-16', name: 'Patinho Moído', category: 'Carnes' },
    { id: 'item-17', name: 'Linguiça Toscana', category: 'Carnes' },
    
    // Padaria
    { id: 'item-18', name: 'Pão Francês', category: 'Padaria' },
    { id: 'item-19', name: 'Pão de Forma Integral', category: 'Padaria' },
    
    // Limpeza
    { id: 'item-20', name: 'Detergente', category: 'Limpeza' },
    { id: 'item-21', name: 'Sabão em Pó', category: 'Limpeza' },
    { id: 'item-22', name: 'Água Sanitária', category: 'Limpeza' },
    
    // Mercearia
    { id: 'item-23', name: 'Arroz Branco', category: 'Mercearia' },
    { id: 'item-24', name: 'Feijão Carioca', category: 'Mercearia' },
    { id: 'item-25', name: 'Óleo de Soja', category: 'Mercearia' },
    { id: 'item-26', name: 'Açúcar Refinado', category: 'Mercearia' },
    { id: 'item-27', name: 'Café em Pó', category: 'Mercearia' },
];
