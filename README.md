# Legal Document Demystifier (Next.js)

This is an AI-powered tool to simplify complex legal documents. This version is built with Next.js for a modern, performant frontend.

## Features

-   **Plain-language Summaries**: Get a simple, easy-to-understand summary of your legal documents.
-   **Key Clause Identification**: Automatically highlights the most important clauses and explains their meaning.
-   **Risk & Solution Analysis**: Identifies potential risks and suggests actionable solutions.
-   **Interactive Q&A**: Ask follow-up questions about the document in a conversational chat.
-   **Generated FAQs**: On-demand generation of Frequently Asked Questions based on the document.
-   **Actionable Next Steps**: Provides a checklist of suggested actions after analysis.
-   **Secure API Routes**: Uses a Next.js API route to protect your Gemini API key.
-   **File Uploads**: Supports analyzing `.pdf` and `.docx` files.
-   **Light/Dark Mode**: A sleek interface that respects your theme preference.
-   **Local History**: Saves your analysis sessions directly in your browser.

## Local Setup & Deployment Guide

### Prerequisites
- Node.js (v18 or newer)
- A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Local Setup

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/your-username/your-repository-name.git
    cd your-repository-name
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Set Environment Variables**: Create a file named `.env.local` in the root of your project and add your Gemini API key.
    ```
    # File: .env.local
    API_KEY="YOUR_GEMINI_API_KEY"
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

### Deploy to Vercel

1.  **Fork the Repository**: Start by forking this repository to your own GitHub account.

2.  **Deploy Project**: Push your forked repository to Vercel.

3.  **Set Environment Variables**: In your Vercel project settings, add your Gemini API key:
    *   `API_KEY`: Your Google Gemini API key.

4.  **Done!**: Vercel will build and deploy your application.
