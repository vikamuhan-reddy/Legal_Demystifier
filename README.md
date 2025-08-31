# Legal Document Demystifier (Firebase Edition)

This is an AI-powered tool to simplify complex legal documents. This version is configured for easy deployment to Google Firebase.

## Features

-   **Plain-language Summaries**: Get a simple, easy-to-understand summary of your legal documents.
-   **Key Clause Identification**: Automatically highlights the most important clauses and explains their meaning.
-   **Risk & Solution Analysis**: Identifies potential risks and suggests actionable solutions.
-   **Interactive Q&A**: Ask follow-up questions about the document in a conversational chat.
-   **Secure Backend**: Uses a Firebase Cloud Function to protect your Gemini API key.
-   **File Uploads**: Supports analyzing `.pdf` and `.docx` files.
-   **Light/Dark Mode**: A sleek interface that respects your theme preference.

## Setup & Deployment Guide

Follow these steps to get the application running on your own Firebase project.

### Step 1: Create a Firebase Project

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and follow the on-screen instructions to create a new project.
3.  Once your project is created, you will be redirected to the project dashboard.

### Step 2: Set up Your Web App in Firebase

1.  On your project dashboard, click the Web icon (`</>`) to add a Firebase app to your project.
2.  Give your app a nickname (e.g., "Legal Demystifier App").
3.  Click **"Register app"**.
4.  You will see your Firebase configuration details under **"SDK setup and configuration"**. You will need these for the next step.

### Step 3: Configure the Frontend

1.  In your project's code, open the file `frontend/firebase.ts`.
2.  You will see a placeholder `firebaseConfig` object.
3.  Copy the Firebase configuration object from the Firebase console (from Step 2) and use it to replace the placeholder values in this file.

    ```typescript
    // frontend/firebase.ts

    // ... (imports) ...

    // Paste your Firebase config object here, replacing the placeholder values.
    const firebaseConfig = {
      apiKey: "AIza....",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.appspot.com",
      messagingSenderId: "...",
      appId: "1:..."
    };

    // ... (initialization code) ...
    ```

### Step 4: Set up Firebase Cloud Functions

1.  In the Firebase Console, go to the **"Build"** section on the left menu and click on **"Functions"**.
2.  Click **"Upgrade project"** to enable the Blaze (Pay-as-you-go) billing plan. This is required to use Cloud Functions, including the free tier.

### Step 5: Configure the Gemini API Key

The application uses a Firebase Cloud Function that needs your Gemini API key. You must set this as an environment variable in Firebase.

1.  Make sure you have the Firebase CLI installed. If not, run: `npm install -g firebase-tools`.
2.  Log in to Firebase by running: `firebase login`.
3.  Navigate to the project's root directory in your terminal.
4.  Run the following command, replacing `"YOUR_API_KEY"` with your actual Google AI Studio API key:

    ```bash
    firebase functions:config:set gemini.key="YOUR_API_KEY"
    ```

### Step 6: Install Dependencies

You need to install dependencies for both the root project (for the UI) and the Cloud Functions.

1.  **Root dependencies:**
    In the project's root directory, run:
    ```bash
    npm install
    ```
2.  **Functions dependencies:**
    Navigate to the `firebase/functions` directory and run:
    ```bash
    cd firebase/functions
    npm install
    ```

### Step 7: Deploy to Firebase

1.  Navigate back to the project's root directory.
2.  Run the deployment command:
    ```bash
    firebase deploy
    ```
    This command will deploy the Cloud Function and the static web hosting files.

3.  After deployment is complete, the terminal will give you a **"Hosting URL"**. This is the URL where your live application is available.

Congratulations! Your Legal Document Demystifier is now running on Firebase.

### Step 8: Running Locally with the Firebase Emulator (Optional)

If you want to test your changes locally before deploying, you can use the Firebase Emulator Suite.

1.  **Fetch Environment Configuration:**
    The emulator needs the same API key you set for the deployed function. Run the following command from the project's root directory to download your configuration into a local file that the emulator can read:

    ```bash
    firebase functions:config:get > firebase/functions/.runtimeconfig.json
    ```
    > **Note:** This command creates a `.runtimeconfig.json` file inside the `firebase/functions` directory. This file contains your API key, so be careful not to commit it to a public repository.

2.  **Start the Emulator:**
    Run the following command from the project's root directory:
    ```bash
    npm run dev
    ```
    This will start the emulators for Functions and Hosting. You can access your local web app at `http://localhost:5000` (or whatever port the CLI indicates).
