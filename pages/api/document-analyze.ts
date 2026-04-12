import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from "groq-sdk";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Polyfill for DOMMatrix which is missing in Node.js but required by some PDF libraries
    if (typeof (global as any).DOMMatrix === 'undefined') {
        (global as any).DOMMatrix = class DOMMatrix {
            m11 = 1; m12 = 0; m13 = 0; m14 = 0;
            m21 = 0; m22 = 1; m23 = 0; m24 = 0;
            m31 = 0; m32 = 0; m33 = 1; m34 = 0;
            m41 = 0; m42 = 0; m43 = 0; m44 = 1;
            constructor() {}
        };
    }
    // Additional minimal polyfills for Node.js environment to satisfy pdfjs-dist
    if (typeof (global as any).Image === 'undefined') (global as any).Image = class {};
    if (typeof (global as any).document === 'undefined') (global as any).document = { 
        createElement: () => ({
            getContext: () => ({
                fillRect: () => {},
                clearRect: () => {},
                getImageData: (x: any, y: any, w: any, h: any) => ({ data: new Uint8ClampedArray(w * h * 4) }),
                putImageData: () => {},
                createImageData: () => ({ data: new Uint8ClampedArray(0) }),
                setTransform: () => {},
                drawImage: () => {},
                save: () => {},
                restore: () => {},
                beginPath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                closePath: () => {},
                stroke: () => {},
                fill: () => {},
                arc: () => {},
                rect: () => {},
                scale: () => {},
                rotate: () => {},
                translate: () => {},
                transform: () => {},
                setLineDash: () => {},
                measureText: () => ({ width: 0 }),
                fillText: () => {},
                strokeText: () => {},
            }),
            style: {},
            width: 0,
            height: 0,
        }) 
    };
    if (typeof (global as any).URL.createObjectURL === 'undefined') {
        (global as any).URL.createObjectURL = () => '';
        (global as any).URL.revokeObjectURL = () => {};
    }
    if (typeof (global as any).Path2D === 'undefined') (global as any).Path2D = class {};
    if (typeof (global as any).navigator === 'undefined') (global as any).navigator = { userAgent: 'Node.js' };

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
    // In a real app, you'd check this against an environment variable
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
        // Clean Base64 (remove data URI prefix if present)
        let cleanBase64 = fileBase64.trim();
        if (cleanBase64.includes(';base64,')) {
            cleanBase64 = cleanBase64.split(';base64,')[1];
        }

        console.log(`[API Analyze] Processing ${fileType} file: ${fileName}`);
        const buffer = Buffer.from(cleanBase64, 'base64');

        try {
            if (fileType === 'pdf') {
                const pdf = require('pdf-parse');
                const data = await pdf(buffer);
                legalText = data.text;
            } else if (fileType === 'docx') {
                const mammoth = require('mammoth');
                const result = await mammoth.extractRawText({ buffer });
                legalText = result.value;
            } else if (['png', 'jpg', 'jpeg', 'webp', 'image'].includes(fileType)) {
                const Tesseract = require('tesseract.js');
                const { data: { text } } = await Tesseract.recognize(buffer, 'eng');
                legalText = text;
            } else {
                throw new Error(`Unsupported file type: ${fileType}`);
            }
        } catch (parseError: any) {
            console.error("[API Analyze] Parsing failed:", parseError);
            throw new Error(`Failed to extract text from ${fileType}: ${parseError.message}`);
        }

        if (!legalText || legalText.trim().length < 10) {
            throw new Error("Could not extract meaningful text from the provided document.");
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
