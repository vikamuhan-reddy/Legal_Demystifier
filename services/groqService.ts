import type { DemystifiedDocument, ChatMessage, FAQ, RiskAnalysis } from '@/types';

const callGroqProxy = async (payload: object) => {
    try {
        const response = await fetch('/api/proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Request failed with status ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error("API proxy call failed:", error);
        let message = error instanceof Error ? error.message : "An unknown error occurred with the server.";
        
        // Handle specific browser network errors
        if (message.toLowerCase().includes('load failed') || message.toLowerCase().includes('failed to fetch')) {
            message = "Chatbot connection failed. This is usually caused by an ad-blocker, VPN, or network restriction. Please try disabling your ad-blocker or using an Incognito window.";
        }
        
        throw new Error(message);
    }
}

export const demystifyDocument = async (legalText: string, userId: string, fileName?: string): Promise<DemystifiedDocument> => {
    const data = await callGroqProxy({ action: 'demystify', legalText, userId, fileName });
    return data as DemystifiedDocument;
};

export const answerQuestionAboutDocument = async (legalText: string, chatHistory: ChatMessage[], question: string, userId: string): Promise<string> => {
    const data = await callGroqProxy({ action: 'answer', legalText, chatHistory, question, userId }) as any;
    if (typeof data.text !== 'string') {
        throw new Error("Invalid response format from server for question answer.");
    }
    return data.text;
}

export const cleanText = async (legalText: string, userId: string): Promise<string> => {
    const data = await callGroqProxy({ action: 'clean', legalText, userId }) as any;
    if (typeof data.text !== 'string') {
        throw new Error("Invalid response format from server for text cleaning.");
    }
    return data.text;
}

export const generateFaqs = async (legalText: string, userId: string): Promise<FAQ[]> => {
    const data = await callGroqProxy({ action: 'generateFaqs', legalText, userId });
    if (!Array.isArray(data)) {
        throw new Error("Invalid response format from server for FAQs.");
    }
    return data as FAQ[];
}

export const analyzeRisks = async (legalText: string, userId: string): Promise<RiskAnalysis[]> => {
    const data = await callGroqProxy({ action: 'analyzeRisks', legalText, userId });
    if (!Array.isArray(data)) {
        throw new Error("Invalid response format from server for risk analysis.");
    }
    return data as RiskAnalysis[];
}
