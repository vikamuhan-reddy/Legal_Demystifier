import * as functions from "firebase-functions";
import {GoogleGenAI, Type} from "@google/genai";

// We define types here because this serverless function is a standalone endpoint.
interface ChatMessage {
  role: "user" | "model";
  text: string;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A short, descriptive title for the legal document, 5 words or less (e.g., 'Software Licensing Agreement').",
    },
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
            description: "The name or title of the key clause (e.g., 'Termination Clause', 'Limitation of Liability').",
          },
          explanation: {
            type: Type.STRING,
            description: "A simple explanation of what this clause means for the user.",
          },
        },
        required: ["clause", "explanation"],
      },
    },
    potentialRisks: {
      type: Type.ARRAY,
      description: "An array of potential risks, obligations, or unfavorable terms, each with a corresponding solution.",
      items: {
        type: Type.OBJECT,
        properties: {
          risk: {
            type: Type.STRING,
            description: "A single potential risk or obligation described clearly.",
          },
          solution: {
            type: Type.STRING,
            description: "A specific, actionable solution or mitigation strategy for the identified risk.",
          },
        },
        required: ["risk", "solution"],
      },
    },
  },
  required: ["title", "summary", "keyClauses", "potentialRisks"],
};


// The API key is stored in Firebase environment configuration.
// To set it, run: firebase functions:config:set gemini.key="YOUR_API_KEY"
const API_KEY = functions.config().gemini?.key;

if (!API_KEY) {
  throw new Error("API key is not configured. Run 'firebase functions:config:set gemini.key=\"YOUR_API_KEY\"' and redeploy. For local development, also run 'firebase functions:config:get > firebase/functions/.runtimeconfig.json' from your project root.");
}

const ai = new GoogleGenAI({apiKey: API_KEY});

// Fix: The onCall handler for this version of firebase-functions receives a single
// request object, and the payload is in the `data` property of that object.
// The signature has been updated from `(data, context)` to `(request)`.
export const geminiProxy = functions.https.onCall(async (request) => {
  const {action, legalText, chatHistory, question} = request.data;

  try {
    if (action === "demystify") {
      if (!legalText) {
        throw new functions.https.HttpsError("invalid-argument", "`legalText` is required for the demystify action.");
      }

      const prompt = `
        Analyze the following legal document. Act as an expert legal assistant who specializes in simplifying complex contracts for the average person.
        Your task is to provide a structured analysis in JSON format. The analysis should include four parts:
        1.  **title**: A short, descriptive title for the legal document, 5 words or less.
        2.  **summary**: A brief, plain-language summary of the entire document's purpose and key outcomes.
        3.  **keyClauses**: Identify and explain the most critical clauses. For each, provide the clause's name and a simple explanation of its implications.
        4.  **potentialRisks**: Identify potential risks, liabilities, or significant obligations. For each risk you identify, you MUST provide a specific, actionable solution or mitigation strategy. The solution should directly address its corresponding risk.

        Here is the legal document:
        ---
        ${legalText}
        ---
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          temperature: 0.2,
        },
      });

      const parsedData = JSON.parse(response.text.trim());
      return parsedData;
    } else if (action === "answer") {
      if (!legalText || !question) {
        throw new functions.https.HttpsError("invalid-argument", "`legalText` and `question` are required for the answer action.");
      }

      const formattedHistory = (chatHistory as ChatMessage[] || []).length > 0 ?
        (chatHistory as ChatMessage[]).map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.text}`).join("\n\n") :
        "No previous conversation.";

      const prompt = `
          You are an expert legal assistant AI, designed to make complex legal topics easy for anyone to understand. A user has provided a legal document and is asking questions about it. You have access to the original document and the history of the conversation to provide context-aware answers.

          Your primary goal is to provide a clear, structured, and highly readable answer. Follow these instructions carefully:
          1.  **Analyze the User's Question:** Consider the current question in the context of the conversation history. Identify any key legal terms or concepts.
          2.  **Define Key Terms First:** If the question introduces a new key legal term, begin your response by defining it in simple, plain language. Use a heading for this section.
          3.  **Answer Directly and Thoroughly:** Answer the user's question based *STRICTLY* on the provided legal document. Do not use external knowledge. If the document doesn't contain the answer, state that clearly. Refer to previous parts of the conversation if the user's question is a follow-up.
          4.  **Use Structured Formatting (Markdown):** Use headings, bold text, and lists to make your answer easy to read.
          5.  **Provide Actionable Insights:** When explaining a clause or concept, tell the user what to look for in their document.
          6.  **End with a Concise Summary:** Conclude your response with a short "In short:" or "To summarize:" section.
          7.  **Tone:** Maintain a helpful, clear, and supportive tone.
          8.  **Style:** Do not use emojis.

          --- DOCUMENT FOR CONTEXT ---
          ${legalText}
          --- END OF DOCUMENT ---

          --- CONVERSATION HISTORY ---
          ${formattedHistory}
          --- END OF CONVERSATION HISTORY ---

          --- CURRENT USER'S QUESTION ---
          ${question}
          --- END OF QUESTION ---

          Now, generate the response following all the instructions above.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
        },
      });

      return {text: response.text};
    } else {
      throw new functions.https.HttpsError("invalid-argument", "Invalid action provided. Must be 'demystify' or 'answer'.");
    }
  } catch (error) {
    const err = error as any;
    console.error(`Error processing action "${action}":`, err);
    throw new functions.https.HttpsError("internal", err.message || "An unknown internal server error occurred.", {error: err.toString()});
  }
});
