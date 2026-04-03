import * as pdfjsLib from 'pdfjs-dist';
import Tesseract from 'tesseract.js';

// Set worker path from CDN. In a Next.js environment, this is a simple way to avoid worker file bundling issues.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

// mammoth is loaded as a global script from the CDN, so we declare it to satisfy TypeScript
declare const mammoth: any;

const MAX_OCR_PAGES = 10; // Limit to 10 pages to prevent browser performance issues

/**
 * Extracts selectable text from a PDF file.
 * @param file The PDF file to parse.
 * @returns A promise that resolves to the extracted text.
 */
export const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n\n';
    }
    return text;
};

/**
 * Smartly extracts text from a PDF by detecting if it's scanned.
 * @param file The PDF file to parse.
 * @param onOCRStart Optional callback triggered when OCR fallback begins.
 * @param onProgress Optional callback for OCR progress updates.
 * @returns A promise that resolves to the extracted text.
 */
export const smartExtractFromPDF = async (
    file: File, 
    onOCRStart?: () => void,
    onProgress?: (progress: number) => void
): Promise<string> => {
    console.log('Starting smart PDF extraction...');
    
    const normalText = await extractTextFromPDF(file);
    
    if (normalText.trim().length < 100) {
        console.log('Scanned PDF detected (low selectable text), falling back to OCR...');
        onOCRStart?.();
        return extractTextFromScannedPDF(file, onProgress);
    }
    
    console.log('Normal PDF detected, returning selectable text.');
    return normalText;
};

/**
 * Extracts text from a scanned PDF using OCR with a simple retry mechanism.
 * @param file The PDF file to parse.
 * @param onProgress Optional callback for progress updates (0-100).
 * @param retries Number of retries for the entire process.
 * @returns A promise that resolves to the extracted text.
 */
export const extractTextFromScannedPDF = async (
    file: File,
    onProgress?: (progress: number) => void,
    retries = 2
): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        let fullText = '';

        const numPages = Math.min(pdf.numPages, MAX_OCR_PAGES);
        if (pdf.numPages > MAX_OCR_PAGES) {
            console.warn(`PDF has ${pdf.numPages} pages. Limiting OCR to first ${MAX_OCR_PAGES} pages.`);
        }

        // Create a single worker for all pages to improve performance
        const worker = await Tesseract.createWorker('eng', 1, {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    // This is handled per page below for more accurate overall progress
                }
            },
        });

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) continue;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const imageData = canvas.toDataURL('image/png');
            
            // Update progress: (current page - 1) / total pages * 100
            onProgress?.(Math.round(((i - 1) / numPages) * 100));

            const { data: { text } } = await worker.recognize(imageData);
            fullText += `--- Page ${i} ---\n${text}\n\n`;
            
            // Small delay to allow UI to breathe
            await new Promise(resolve => setTimeout(resolve, 10));
        }

        await worker.terminate();
        onProgress?.(100);

        if (pdf.numPages > MAX_OCR_PAGES) {
            fullText += `\n\n[Note: Only the first ${MAX_OCR_PAGES} pages were processed due to performance limits.]`;
        }

        return fullText;
    } catch (error: any) {
        console.error(`OCR PDF Error (retries left: ${retries}):`, error);
        if (retries > 0) {
            console.log(`Retrying OCR PDF extraction...`);
            return extractTextFromScannedPDF(file, onProgress, retries - 1);
        }
        throw new Error(`Failed to extract text from scanned PDF after multiple attempts: ${error.message}`);
    }
};

/**
 * Extracts text from an image file using OCR (Tesseract.js) with a retry mechanism.
 * Handles SVG by rendering to canvas first.
 * @param file The image file to parse.
 * @param onOCRStart Optional callback triggered when OCR begins.
 * @param onProgress Optional callback for OCR progress updates (0-100).
 * @param retries Number of retries for the entire process.
 * @returns A promise that resolves to the extracted text.
 */
export const extractTextFromImage = async (
    file: File, 
    onOCRStart?: () => void,
    onProgress?: (progress: number) => void,
    retries = 2
): Promise<string> => {
    try {
        onOCRStart?.();
        
        let source: any = file;

        // Special handling for SVG to ensure it's rasterized for Tesseract
        if (file.type === 'image/svg+xml') {
            source = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.width || 1000;
                        canvas.height = img.height || 1000;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.fillStyle = 'white';
                            ctx.fillRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0);
                            resolve(canvas.toDataURL('image/png'));
                        } else {
                            reject(new Error('Failed to get canvas context'));
                        }
                    };
                    img.onerror = reject;
                    img.src = e.target?.result as string;
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        const { data: { text } } = await Tesseract.recognize(
            source,
            'eng',
            {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        onProgress?.(Math.round(m.progress * 100));
                    }
                }
            }
        );
        onProgress?.(100);
        return text;
    } catch (error: any) {
        console.error(`OCR Image Error (retries left: ${retries}):`, error);
        if (retries > 0) {
            console.log(`Retrying OCR image extraction...`);
            return extractTextFromImage(file, onOCRStart, onProgress, retries - 1);
        }
        throw new Error(`Failed to extract text from image after multiple attempts: ${error.message}`);
    }
};

/**
 * Parses a DOCX file and extracts its raw text content.
 * @param file The DOCX file to parse.
 * @returns A promise that resolves to the extracted text.
 */
export const parseDocx = async (file: File): Promise<string> => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        return result.value;
    } catch (error: any) {
        throw new Error(`Failed to parse DOCX: ${error.message}`);
    }
};

/**
 * Unified function to parse different file types (PDF, DOCX, Image, Text).
 * @param file The file to parse.
 * @param onOCRStart Optional callback for OCR start.
 * @param onProgress Optional callback for OCR progress updates.
 * @returns A promise that resolves to the extracted text.
 */
export const parseFile = async (
    file: File, 
    onOCRStart?: () => void,
    onProgress?: (progress: number) => void
): Promise<string> => {
    if (file.type === 'application/pdf') {
        return smartExtractFromPDF(file, onOCRStart, onProgress);
    } else if (file.type.startsWith('image/')) {
        return extractTextFromImage(file, onOCRStart, onProgress);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        return parseDocx(file);
    } else if (file.type === 'text/plain') {
        return file.text();
    } else {
        throw new Error(`Unsupported file type: ${file.type}. Please upload a PDF, DOCX, Image, or Text file.`);
    }
};
