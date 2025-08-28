
import type { ChatSession } from '../types.ts';

const HISTORY_KEY = 'legalDemystifierHistory';

/**
 * Retrieves the chat history from localStorage.
 * @returns An array of ChatSession objects, or an empty array if none found or on error.
 */
export const getHistory = (): ChatSession[] => {
    try {
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
            const parsed = JSON.parse(savedHistory);
            // Basic validation to ensure it's an array
            return Array.isArray(parsed) ? parsed : [];
        }
        return [];
    } catch (error) {
        console.error("Failed to parse chat history from localStorage:", error);
        // Clear corrupted data
        localStorage.removeItem(HISTORY_KEY);
        return [];
    }
};

/**
 * Saves the entire chat history to localStorage.
 * @param sessions An array of ChatSession objects to save.
 */
export const saveHistory = (sessions: ChatSession[]): void => {
    try {
        const stringifiedHistory = JSON.stringify(sessions);
        localStorage.setItem(HISTORY_KEY, stringifiedHistory);
    } catch (error) {
        console.error("Failed to save chat history to localStorage:", error);
    }
};