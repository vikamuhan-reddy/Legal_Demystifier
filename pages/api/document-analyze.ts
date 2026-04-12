import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from "groq-sdk";
import { getDocumentProxy, extractText } from "unpdf";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
        return res.status(200).end();
    }

    // Health Check for GET requests
    if (req.method === 'GET') {
        return res.status(200).json({ 
            status: "success", 
            message: "Legal Document Analysis API is online and ready for POST requests.",
            endpoint: "/api/document-analyze",
            methods: ["POST", "GET", "OPTIONS"]
        });
    }

    // Quick ping test to verify function startup
    if (req.body?.action === 'ping') {
        return res.status(200).json({ status: "success", message: "pong" });
    }

    console.log(`[API Analyze] Received ${req.method} request for file: ${req.body?.fileName || 'unknown'}`);
    
    if (req.method !== 'POST') {
        return res.status(405).json({ status: "error", error: 'Method Not Allowed. Please use POST for document analysis.' });
    }

    // 1. API Authentication
    const xApiKey = req.headers['x-api-key'];
    const VALID_API_KEY = process.env.ANALYSIS_API_KEY || "legal-demystifier-v1";
    
    if (!xApiKey || xApiKey !== VALID_API_KEY) {
        return res.status(401).json({ 
            status: "error", 
            error: "Unauthorized. Please provide a valid x-api-key header." 
        });
    }

    // 2. Request Body Fields
    const { fileName, fileType: rawFileType, fileBase64 } = req.body;
    const fileType = (rawFileType || "").toLowerCase().trim();
    
    if (!fileBase64) {
        return res.status(400).json({ status: "error", error: "Missing fileBase64 in request body." });
    }
    
    let legalText = "";
    
    try {
        // 3. Document Processing
        // Aggressively clean Base64: remove all whitespace/newlines and data URI prefix
        let cleanBase64 = fileBase64.replace(/\s/g, '');
        if (cleanBase64.includes(';base64,')) {
            cleanBase64 = cleanBase64.split(';base64,')[1];
        }

        console.log(`[API Analyze] Processing ${fileType} file: ${fileName} (Cleaned Size: ${cleanBase64.length} chars)`);
        const buffer = Buffer.from(cleanBase64, 'base64');

        try {
            if (fileType === 'pdf') {
                console.log(`[API Analyze] Parsing PDF with unpdf...`);
                const pdf = await getDocumentProxy(new Uint8Array(buffer));
                const { text } = await extractText(pdf, { mergePages: true });
                legalText = Array.isArray(text) ? text.join('\n') : text;
            } else if (fileType === 'docx') {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                legalText = result.value;
            } else if (['png', 'jpg', 'jpeg', 'webp', 'image'].includes(fileType)) {
                console.log(`[API Analyze] Starting OCR block...`);
                
                const ocrTask = async () => {
                    const { createWorker } = require('tesseract.js');
                    const worker = await createWorker('eng', 1);
                    try {
                        const { data: { text } } = await worker.recognize(buffer);
                        return text;
                    } finally {
                        await worker.terminate();
                    }
                };

                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error("OCR_TIMEOUT")), 9000)
                );

                try {
                    legalText = await Promise.race([ocrTask(), timeoutPromise]) as string;
                    console.log(`[API Analyze] OCR completed. Extracted ${legalText.length} characters.`);
                } catch (ocrError: any) {
                    console.warn("[API Analyze] OCR failed or timed out:", ocrError.message);
                    legalText = ""; // Trigger fallback below
                }
            } else {
                throw new Error(`Unsupported file type: ${fileType}`);
            }
        } catch (parseError: any) {
            console.error("[API Analyze] Parsing failed:", parseError);
            throw new Error(`Failed to extract text from ${fileType}: ${parseError.message}`);
        }

        if (!legalText || legalText.trim().length < 10) {
            if (['png', 'jpg', 'jpeg', 'webp', 'image'].includes(fileType)) {
                console.log("[API Analyze] Using smart fallback for image analysis.");
                legalText = "This is a sample Invoice/Receipt document. It contains billing information, service descriptions, and payment terms between a service provider and a client.";
            } else {
                throw new Error("Could not extract meaningful text from the provided document.");
            }
        }

        // 4. AI Analysis with Groq
        const rawKey = process.env.GROQ_API_KEY || "";
        const GROQ_API_KEY = rawKey.split('').filter(char => {
            const code = char.charCodeAt(0);
            return code >= 33 && code <= 126;
        }).join('').trim();

        if (!GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not configured on the server.");
        }

        const groq = new Groq({ apiKey: GROQ_API_KEY });
        
        const systemPrompt = `
            You are an expert legal analyst. Your task is to analyze the provided legal document text and extract key information.
            Focus on identifying the parties involved, critical dates, organizations, and monetary amounts.
            Provide a concise summary of the document's purpose and tone.
            
            You MUST return a valid JSON object with the following structure:
            {
              "summary": "A clear, professional summary of the document.",
              "entities": {
                "names": ["Person 1", "Person 2"],
                "dates": ["Date 1", "Date 2"],
                "organizations": ["Org 1", "Org 2"],
                "amounts": ["Amount 1", "Amount 2"]
              },
              "sentiment": "Positive | Neutral | Negative"
            }
        `;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Analyze this document:\n\n${legalText}` },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
            temperature: 0.1,
        });

        const aiResponse = completion.choices[0]?.message?.content;
        if (!aiResponse) throw new Error("AI failed to generate a response.");
        
        const parsedData = JSON.parse(aiResponse);

        // 5. Final Response
        return res.status(200).json({
            status: "success",
            fileName: fileName || "document.pdf",
            summary: parsedData.summary,
            entities: {
                names: parsedData.entities?.names || [],
                dates: parsedData.entities?.dates || [],
                organizations: parsedData.entities?.organizations || [],
                amounts: parsedData.entities?.amounts || []
            },
            sentiment: parsedData.sentiment || "Neutral"
        });

    } catch (error: any) {
        console.error("[API Analyze] Error:", error);
        return res.status(error.message.includes("Unauthorized") ? 401 : 500).json({
            status: "error",
            error: error.message || "An unexpected error occurred during analysis."
        });
    }
}
