import type { DemystifiedDocument, ChatMessage } from '../types';

/**
 * A helper function to call our backend API proxy.
 * @param body The request body to send to the proxy.
 * @returns The JSON response from the proxy.
 */
const callApiProxy = async (body: object) => {
    const response = await fetch('/api/proxy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response from server.' }));
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
    }

    return response.json();
}


export const demystifyDocument = async (legalText: string): Promise<DemystifiedDocument> => {
  try {
      const data = await callApiProxy({ action: 'demystify', legalText });
      
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
  } catch (error) {
      console.error("Error demystifying document:", error);
      // Re-throw the error to be caught by the UI component
      throw error;
  }
};

export const answerQuestionAboutDocument = async (legalText: string, chatHistory: ChatMessage[], question: string): Promise<string> => {
    try {
        const data = await callApiProxy({ action: 'answer', legalText, chatHistory, question });
        if (typeof data.text !== 'string') {
            throw new Error("Invalid response format from server for question answer.");
        }
        return data.text;
    } catch (error) {
        console.error("Error answering question:", error);
        // Re-throw the error to be caught by the UI component
        throw error;
    }
}
