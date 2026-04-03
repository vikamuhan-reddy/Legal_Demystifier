# 📜 Legal Document Demystifier

An AI-powered intelligent document processing system designed to simplify complex legal documents. This tool extracts, analyzes, and summarizes content from various formats (PDF, DOCX, Images), helping users understand legal jargon, identify risks, and extract key information instantly.

## 🚀 Live Demo
**Live URL:** [https://ais-dev-w7suuxckwcgvgqzx4obxtc-448932192783.asia-east1.run.app](https://ais-dev-w7suuxckwcgvgqzx4obxtc-448932192783.asia-east1.run.app)

## 🛠 Tech Stack

- **Frontend:** Next.js (Pages Router), TypeScript, Tailwind CSS
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Backend:** Next.js API Routes (Serverless Functions)
- **Database & Auth:** Supabase (PostgreSQL)
- **AI Models:** Groq (Llama 3.3 70B Versatile)
- **OCR Engine:** Tesseract.js (Client-side)
- **Document Parsing:** PDF.js (PDF), Mammoth (DOCX)

## 🏗 Architecture Overview

The application follows a modern full-stack architecture:

1.  **Client-Side Processing:** Document parsing and OCR are performed directly in the browser using Tesseract.js and PDF.js. This ensures privacy and reduces server load.
2.  **API Proxy Layer:** A secure Next.js API route acts as a proxy to communicate with the Groq AI SDK, keeping API keys hidden from the client.
3.  **AI Analysis Engine:** The system uses a multi-stage prompt engineering approach to perform summarization, entity extraction, risk analysis, and sentiment classification in a single pass.
4.  **Persistence Layer:** Supabase handles user authentication and stores analysis history, allowing users to revisit and chat with previously uploaded documents.

## ✨ Key Features

- **Multi-format Support:** Seamlessly process PDF, DOCX, and images (PNG, JPG, SVG).
- **OCR Integration:** Extract text from scanned documents and images with real-time progress tracking.
- **AI Summarization:** Get a high-level executive summary of any legal document.
- **Risk Detection:** Automatically identify imbalanced clauses and potential liabilities.
- **Entity Extraction:** Extract parties, dates, jurisdictions, and financial terms.
- **Sentiment Analysis:** Classify the document's overall tone (Positive, Negative, Neutral).
- **Interactive Chat:** Ask follow-up questions about specific clauses or obligations.
- **History Management:** Securely save and manage your analysis history via Supabase.

## 🤖 AI Tools Used

As per the project policy, here are the AI tools and models utilized in this project:

1.  **Google AI Studio Build:** Used as the primary development assistant for code generation, architecture design, and UI/UX implementation.
2.  **ChatGPT (OpenAI):** Utilized as a secondary assistant for building extra features and identifying potential flaws during the AI evaluation process.
3.  **Claude (Anthropic):** Used as an assistant for feature enhancement and technical auditing to ensure high-quality outputs.
4.  **Groq (Llama 3.3 70B Versatile):** The core reasoning engine used for document demystification, risk analysis, and the interactive chat assistant.
5.  **Tesseract.js:** An AI-based OCR engine used for extracting text from images and scanned PDFs.

## ⚙️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- A Supabase Project
- A Groq API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/legal-document-demystifier.git
    cd legal-document-demystifier
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env.local` file in the root directory and add the following:
    ```env
    GROQ_API_KEY=your_groq_api_key
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Database Setup:**
    Run the following SQL in your Supabase SQL Editor to create the necessary table:
    ```sql
    CREATE TABLE documents (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES auth.users(id),
      title TEXT,
      original_text TEXT,
      cleaned_text TEXT,
      summary TEXT,
      sentiment TEXT,
      clauses JSONB,
      risks JSONB,
      entities JSONB,
      suggested_actions JSONB,
      chat_history JSONB DEFAULT '[]'::jsonb,
      faqs JSONB DEFAULT '[]'::jsonb,
      structure JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );
    ```

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to view the app.

## ⚠️ Known Limitations

- **Document Size:** Extremely large documents (50+ pages) may experience slower processing times due to client-side OCR limits.
- **OCR Accuracy:** Scanned documents with very poor handwriting or low resolution may result in partial text extraction.
- **Context Window:** While Llama 3.3 has a large context window, extremely long legal texts may be truncated for optimal analysis performance.
- **Legal Disclaimer:** This tool is for informational purposes only and does not constitute legal advice. Always consult with a qualified legal professional.

---
Developed with ❤️ using AI.
