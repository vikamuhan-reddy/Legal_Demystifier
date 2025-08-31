# Local Development Setup Guide

This guide will walk you through setting up and running the "Legal Document Demystifier" application on your local machine using the Firebase Emulator Suite.

## Prerequisites

Before you begin, ensure you have the following installed:

1.  **Node.js and npm**: [Download and install Node.js](https://nodejs.org/) (npm is included).
2.  **Firebase CLI**: Install it globally by running:
    ```bash
    npm install -g firebase-tools
    ```
3.  **Google Gemini API Key**: Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

## Step-by-Step Setup

### 1. Clone the Repository

First, clone the project repository to your local machine.

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

The project has two `package.json` files: one in the root directory for the frontend and one in `firebase/functions` for the backend cloud function. You need to install dependencies for both.

-   **Install root dependencies:**
    ```bash
    npm install
    ```

-   **Install functions dependencies:**
    ```bash
    cd firebase/functions
    npm install
    cd ../..  # Return to the root directory
    ```

### 3. Create and Configure a Firebase Project

Even for local development, you need a Firebase project to get a configuration object.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Click **"Add project"** and follow the on-screen instructions.
3.  Once the project is created, register a new web app by clicking the web icon (`</>`).
4.  Give your app a nickname and click **"Register app"**.
5.  You'll see your Firebase configuration details. Copy the `firebaseConfig` object.

### 4. Configure the Frontend

In the project's code, open the file `frontend/firebase.ts`. Replace the placeholder `firebaseConfig` object with the one you copied from the Firebase Console.

```typescript
// frontend/firebase.ts

// ... (imports) ...

// Paste your Firebase config object here.
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

### 5. Configure the Gemini API Key for the Emulator

The local Firebase emulator needs access to your Gemini API key.

1.  **Log in to Firebase:**
    ```bash
    firebase login
    ```

2.  **Set the environment variable:** In your project's root directory, run the following command, replacing `"YOUR_API_KEY"` with your actual Gemini API key.
    ```bash
    firebase functions:config:set gemini.key="YOUR_API_KEY"
    ```

3.  **Fetch the configuration for the emulator:** This command downloads the configuration you just set into a local file that the emulator can read.
    ```bash
    firebase functions:config:get > firebase/functions/.runtimeconfig.json
    ```
    > **⚠️ Important:** The `.runtimeconfig.json` file contains your secret API key. The `.gitignore` file is already set up to ignore this file, but do not commit it to your repository.

### 6. Run the Application Locally

Now you're ready to start the Firebase Emulator Suite.

1.  From the project's root directory, run:
    ```bash
    npm run dev
    ```

2.  This command will start the emulators for Functions and Hosting. Once it's running, you can access your local web app at the URL provided in the terminal, which is usually:

    [http://127.0.0.1:5000](http://127.0.0.1:5000)

You can now use the application, make code changes, and see them reflected locally without needing to deploy to Firebase.
