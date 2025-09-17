
import { GoogleGenAI, Type } from "@google/genai";
import { Purchase, ShoppingList } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you would have a more robust way to handle this,
  // but for this context, we'll throw an error.
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const categorizeNewItem = async (itemName: string, categories: string[]): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Categorize o item de compra "${itemName}" em uma das seguintes categorias: ${categories.join(', ')}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        category: {
                            type: Type.STRING,
                            description: `A categoria para o item, que deve ser uma das seguintes: ${categories.join(', ')}.`,
                        },
                    },
                },
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        return result.category || 'Outros';
    } catch (error) {
        console.error("Error categorizing item with Gemini:", error);
        return 'Outros'; // Fallback category
    }
};

export const generatePurchaseDetailInsights = async (list: ShoppingList): Promise<string> => {
    if (!list.completedItems || list.completedItems.length === 0) {
        return "Não há itens nesta compra para analisar.";
    }

    const prompt = `
        Com base nos seguintes dados de uma única compra em formato JSON, atue como um assistente de compras.
        Analise os itens comprados e forneça um resumo com insights rápidos e úteis.

        O resumo deve incluir:
        1. **Resumo Rápido:** Um parágrafo curto sobre o perfil desta compra específica (ex: "Esta parece ser uma compra focada em laticínios e carnes...").
        2. **Principal Categoria:** Identifique a categoria com o maior gasto nesta compra.
        3. **Item de Destaque:** Aponte o item individual mais caro desta lista.
        4. **Dica Inteligente:** Ofereça uma dica de economia ou uma sugestão relacionada aos itens comprados (ex: "Para o 'Peito de Frango', considere comprar em maior quantidade na próxima vez para um preço melhor por quilo.").

        Formate a resposta em um tom amigável e direto. Use markdown para formatação (negrito, listas).

        Dados da Compra:
        ${JSON.stringify(list.completedItems, null, 2)}
    `;

    try {
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating purchase detail insights:", error);
        return "Ocorreu um erro ao tentar analisar esta compra. Por favor, tente novamente mais tarde.";
    }
};
