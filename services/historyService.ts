import type { ChatSession } from '@/types';

const LOCAL_HISTORY_KEY = 'legalDemystifierHistory';

// --- Local Storage Functions for Guest Users ---

export const getLocalHistory = (): ChatSession[] => {
    try {
        const savedHistory = localStorage.getItem(LOCAL_HISTORY_KEY);
        if (savedHistory) {
            const parsed = JSON.parse(savedHistory);
            return Array.isArray(parsed) ? parsed : [];
        }
        return [];
    } catch (error) {
        console.error("Failed to parse chat history from localStorage:", error);
        localStorage.removeItem(LOCAL_HISTORY_KEY);
        return [];
    }
};

export const saveLocalHistory = (sessions: ChatSession[]): void => {
    try {
        const stringifiedHistory = JSON.stringify(sessions);
        localStorage.setItem(LOCAL_HISTORY_KEY, stringifiedHistory);
    } catch (error) {
        console.error("Failed to save chat history to localStorage:", error);
    }
};

export const clearLocalHistory = (): void => {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
};
