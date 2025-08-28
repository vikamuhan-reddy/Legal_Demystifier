// Fix: Use Firebase v9 compat libraries to match firebase.ts
import firebase from 'firebase/compat/app';
import type { DemystifiedDocument, ChatMessage } from '../types.ts';

const functions = firebase.functions();

// This is the name of the function exported from firebase/functions/src/index.ts
const geminiProxy = functions.httpsCallable('geminiProxy');

const callGeminiProxy = async (payload: object) => {
    try {
        const result = await geminiProxy(payload);
        return result.data;
    } catch (error) {
        console.error("Firebase Functions call failed:", error);
        // Fix: Cast to compat HttpsError type
        const functionsError = error as firebase.functions.HttpsError;
        // Provide a more user-friendly error message
        const message = (functionsError.details as any)?.error || functionsError.message || 'An unknown error occurred with the server.';
        throw new Error(message);
    }
}

export const demystifyDocument = async (legalText: string): Promise<DemystifiedDocument> => {
  const data = await callGeminiProxy({ action: 'demystify', legalText }) as any;
  
  // Basic client-side validation of the response from our proxy
  if (
    !data.title ||
    !data.summary || 
    !Array.isArray(data.keyClauses) || 
    !Array.isArray(data.potentialRisks)
  ) {
    throw new Error("AI response from the server is missing required fields.");
  }
  return data as DemystifiedDocument;
};

export const answerQuestionAboutDocument = async (legalText: string, chatHistory: ChatMessage[], question: string): Promise<string> => {
    const data = await callGeminiProxy({ action: 'answer', legalText, chatHistory, question }) as any;
    if (typeof data.text !== 'string') {
        throw new Error("Invalid response format from server for question answer.");
    }
    return data.text;
}
