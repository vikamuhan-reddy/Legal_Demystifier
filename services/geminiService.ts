
import { GoogleGenAI, Type } from "@google/genai";
import type { DemystifiedDocument } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise, easy-to-understand summary of the legal document in plain language, avoiding jargon.",
    },
    keyClauses: {
      type: Type.ARRAY,
      description: "An array of the most important clauses or sections from the document.",
      items: {
        type: Type.OBJECT,
        properties: {
          clause: {
            type: Type.STRING,
            description: "The name or title of the key clause (e.g., 'Termination Clause', 'Limitation of Liability')."
          },
          explanation: {
            type: Type.STRING,
            description: "A simple explanation of what this clause means for the user."
          }
        },
        required: ["clause", "explanation"]
      }
    },
    potentialRisks: {
      type: Type.ARRAY,
      description: "An array of potential risks, obligations, or unfavorable terms, each with a corresponding solution.",
      items: {
        type: Type.OBJECT,
        properties: {
          risk: {
            type: Type.STRING,
            description: "A single potential risk or obligation described clearly."
          },
          solution: {
            type: Type.STRING,
            description: "A specific, actionable solution or mitigation strategy for the identified risk."
          }
        },
        required: ["risk", "solution"]
      }
    }
  },
  required: ["summary", "keyClauses", "potentialRisks"]
};

export const demystifyDocument = async (legalText: string): Promise<DemystifiedDocument> => {
  const prompt = `
    Analyze the following legal document. Act as an expert legal assistant who specializes in simplifying complex contracts for the average person.
    Your task is to provide a structured analysis in JSON format. The analysis should include three parts:
    1.  **summary**: A brief, plain-language summary of the entire document's purpose and key outcomes.
    2.  **keyClauses**: Identify and explain the most critical clauses. For each, provide the clause's name and a simple explanation of its implications.
    3.  **potentialRisks**: Identify potential risks, liabilities, or significant obligations. For each risk you identify, you MUST provide a specific, actionable solution or mitigation strategy. The solution should directly address its corresponding risk.

    Here is the legal document:
    ---
    ${legalText}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    // Basic validation to ensure the parsed data matches our expected structure
    if (
      !parsedData.summary || 
      !Array.isArray(parsedData.keyClauses) || 
      !Array.isArray(parsedData.potentialRisks) ||
      (parsedData.potentialRisks.length > 0 && (typeof parsedData.potentialRisks[0].risk === 'undefined' || typeof parsedData.potentialRisks[0].solution === 'undefined'))
    ) {
      throw new Error("AI response is missing required fields or has an incorrect structure for risks and solutions.");
    }

    return parsedData as DemystifiedDocument;

  } catch (error) {
    console.error("Error calling Gemini API:", error);

    let errorMessage = "Failed to get a valid response from the AI model. Please try again later.";
    
    // Check for network-related or API key errors which often manifest as XHR failures.
    if (error instanceof Error && (error.message.includes("xhr error") || error.message.includes("RPC failed"))) {
        errorMessage = "A network error occurred. This could be due to a misconfigured or restricted API key, a poor network connection, or a temporary service outage. Please check your API key settings and try again.";
    }

    throw new Error(errorMessage);
  }
};

export const answerQuestionAboutDocument = async (legalText: string, question: string): Promise<string> => {
    const prompt = `
    You are an expert legal assistant AI, designed to make complex legal topics easy for anyone to understand. A user has provided a legal document and is asking a question about it.

    Your primary goal is to provide a clear, structured, and highly readable answer. Follow these instructions carefully:

    1.  **Analyze the User's Question:** Identify any key legal terms or concepts in the user's question.
    2.  **Define Key Terms First:** Begin your response by defining the most important legal term from the user's question in simple, plain language. Use a heading for this section.
    3.  **Answer Directly and Thoroughly:** Answer the user's question based *STRICTLY* on the provided legal document. Do not use external knowledge. If the document doesn't contain the answer, state that clearly.
    4.  **Use Structured Formatting (Markdown):**
        - Use headings (like '### Heading') to break down your answer into logical sections.
        - Use bold text ('**text**') to emphasize key phrases and concepts.
        - Use bulleted or numbered lists to present information, steps, or checklists. This is crucial for readability.
    5.  **Provide Actionable Insights:** When explaining a clause or concept, tell the user what to look for in their document. For example, "You can find this in the 'Termination Clause' section."
    6.  **End with a Concise Summary:** Conclude your response with a short "In short:" or "To summarize:" section that recaps the most critical points.
    7.  **Tone:** Maintain a helpful, clear, and supportive tone. Avoid overly complex legal jargon in your explanation.
    8.  **Style:** Do not use emojis.

    --- DOCUMENT FOR CONTEXT ---
    ${legalText}
    --- END OF DOCUMENT ---

    --- USER'S QUESTION ---
    ${question}
    --- END OF QUESTION ---

    Now, generate the response following all the instructions above.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.1,
      }
    });
    return response.text;
  } catch (error) {
     console.error("Error answering question:", error);
     let errorMessage = "Sorry, I was unable to answer that question. Please try rephrasing or ask something else.";
     if (error instanceof Error && (error.message.includes("xhr error") || error.message.includes("RPC failed"))) {
        errorMessage = "A network error occurred while trying to get an answer. Please check your connection and try again.";
    }
     throw new Error(errorMessage);
  }

}