import * as pdfjsLib from 'pdfjs-dist';

// Set worker path from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

// mammoth is loaded as a global script from the CDN, so we declare it to satisfy TypeScript
declare const mammoth: any;

/**
 * Parses a PDF file and extracts its text content.
 * @param file The PDF file to parse.
 * @returns A promise that resolves to the extracted text.
 */
export const parsePdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        // The type for `item` is `TextItem`, which is not exported directly from the ES module build.
        // Using `any` here is a pragmatic choice for this setup.
        const pageText = content.items.map((item: any) => item.str).join(' ');
        text += pageText + '\n\n'; // Add space between pages
    }
    return text;
};

/**
 * Parses a DOCX file and extracts its raw text content.
 * @param file The DOCX file to parse.
 * @returns A promise that resolves to the extracted text.
 */
export const parseDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
    return result.value;
};
