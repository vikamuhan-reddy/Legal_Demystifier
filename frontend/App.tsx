import React, { useState, useCallback, useEffect } from 'react';
import './firebase.ts'; // Initialize Firebase
import { demystifyDocument, answerQuestionAboutDocument } from '../backend/geminiService.ts';
import * as historyService from '../backend/historyService.ts';
import { parsePdf, parseDocx } from '../backend/fileParser.ts';
import type { DemystifiedDocument, ChatMessage, ChatSession } from '../types.ts';
import { OutputTab } from '../types.ts';
import Header from './components/Header.tsx';
import InputArea from './components/TextAreaInput.tsx';
import OutputDisplay from './components/OutputDisplay.tsx';
import HistoryPanel from './components/HistoryPanel.tsx';
import Toast from './components/Toast.tsx';
import OutputSkeleton from './components/OutputSkeleton.tsx';

type View = 'home' | 'analysis';

const sampleLease = `RESIDENTIAL LEASE AGREEMENT
1. PARTIES: This Lease is made between Landlord XYZ Rentals ("Landlord") and Tenant John Doe ("Tenant").
2. PROPERTY: Landlord agrees to lease to Tenant the property located at 123 Main Street, Anytown, USA.
3. TERM: The term of this Lease shall be for 12 months, beginning on January 1, 2025, and ending on December 31, 2025.
4. RENT: Tenant shall pay Landlord a monthly rent of $1,500, due on the 1st day of each month. A late fee of $50 shall be applied if rent is not received by the 5th day of the month.
5. SECURITY DEPOSIT: Tenant shall pay a security deposit of $1,500 upon signing this Lease. Landlord may use the deposit to cover any damages or unpaid rent. The deposit will be returned within 30 days of lease termination, less any deductions.
6. UTILITIES: Tenant is responsible for all utilities, including electricity, gas, water, and internet.
7. MAINTENANCE: Tenant is responsible for keeping the property clean and in good repair. Landlord is responsible for major repairs to the structure and systems.
8. TERMINATION: Tenant may terminate this lease with 30 days written notice. If Tenant terminates before the end of the term, Tenant may be liable for the remaining rent.`;

const sampleTOS = `TERMS OF SERVICE - CoolApp
Welcome to CoolApp! By using our service, you agree to these terms.
1. User Account: You must be 13 years or older to create an account. You are responsible for all activity that occurs under your account.
2. Content: You retain ownership of content you post to the service. By posting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, and display such content in connection with the service.
3. Prohibited Conduct: You agree not to use the service to post content that is illegal, defamatory, or infringes on intellectual property rights. We may remove any content or suspend your account for any reason.
4. Limitation of Liability: CoolApp is provided "as is" without any warranties. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you have paid us in the last 12 months.
5. Termination: We may terminate or suspend your access to the service at any time, without prior notice or liability, for any reason whatsoever. Upon termination, your right to use the service will immediately cease.`;


const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [demystifiedData, setDemystifiedData] = useState<DemystifiedDocument | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>(OutputTab.SUMMARY);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);

  // View and Session State
  const [view, setView] = useState<View>('home');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);

  // UI State
  const [toastMessage, setToastMessage] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  useEffect(() => {
    setSessions(historyService.getHistory());
     // Theme initialization
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark'; // Default to dark mode if nothing is saved
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);
  
  useEffect(() => {
    // If we are in analysis view but have no data (e.g. after clearing history), go home.
    if (view === 'analysis' && !demystifiedData) {
      setView('home');
    }
  }, [view, demystifiedData]);

  const saveSessions = (updatedSessions: ChatSession[]) => {
    setSessions(updatedSessions);
    historyService.saveHistory(updatedSessions);
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleFileSelect = useCallback(async (file: File) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload a PDF or DOCX file.');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setError(null);
    setDemystifiedData(null);
    setInputText('');
    setCurrentSessionId(null); // New file means new session

    try {
      let text = '';
      if (file.type === 'application/pdf') {
        text = await parsePdf(file);
      } else {
        text = await parseDocx(file);
      }
      setInputText(text);
    } catch (err) {
      console.error("File parsing error:", err);
      setError('Failed to parse the document. The file might be corrupted or protected.');
      setSelectedFile(null);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const createNewSession = useCallback(() => {
    setInputText('');
    setSelectedFile(null);
    setError(null);
    setDemystifiedData(null);
    setChatHistory([]);
    setChatError(null);
    setCurrentSessionId(null);
    setActiveTab(OutputTab.SUMMARY);
    setIsHistoryPanelOpen(false);
    setView('home');
  }, []);

  const handleDemystify = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please paste some legal text or upload a document to analyze.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDemystifiedData(null);
    setActiveTab(OutputTab.SUMMARY);
    setChatHistory([]);
    setChatError(null);

    try {
      const result = await demystifyDocument(inputText);
      setDemystifiedData(result);

      // Create and save new session
      const newSession: ChatSession = {
        id: Date.now().toString(),
        originalText: inputText,
        demystifiedData: result,
        chatHistory: [],
        createdAt: Date.now(),
      };
      
      setCurrentSessionId(newSession.id);
      saveSessions([newSession, ...sessions]);
      setView('analysis');

    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred while analyzing the document.';
      setError(message);
      setView('home'); // Go back home on error
    } finally {
      setIsLoading(false);
    }
  }, [inputText, sessions]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if(selectedFile) {
        setSelectedFile(null);
    }
    // Changing text means we are starting a new potential session
    setCurrentSessionId(null);
  }

  const handleSampleSelect = (sampleText: string) => {
    setInputText(sampleText);
    setSelectedFile(null);
    setCurrentSessionId(null);
    setError(null);
  };

  const handleSendQuestion = useCallback(async (question: string) => {
    if (!question.trim() || !inputText || !currentSessionId) return;

    const userMessage: ChatMessage = { role: 'user', text: question };
    const newHistory: ChatMessage[] = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setIsAnswering(true);
    setChatError(null);

    try {
      // Pass the previous chat history (without the current question) to the service
      const answer = await answerQuestionAboutDocument(inputText, chatHistory, question);
      const modelMessage: ChatMessage = { role: 'model', text: answer };
      const finalHistory = [...newHistory, modelMessage];
      setChatHistory(finalHistory);

      // Update session in history
      const updatedSessions = sessions.map(s => 
        s.id === currentSessionId ? { ...s, chatHistory: finalHistory } : s
      );
      saveSessions(updatedSessions);

    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while getting the answer.';
      setChatError(message);
    } finally {
      setIsAnswering(false);
    }
  }, [chatHistory, inputText, currentSessionId, sessions]);

  const handleRegenerateAnswer = useCallback(async () => {
    // We assume the conversation ends with a user message followed by a model message.
    if (chatHistory.length < 2) return;
    
    const lastUserMessage = chatHistory[chatHistory.length - 2];
    if (lastUserMessage.role !== 'user' || !inputText || !currentSessionId) {
        // This case shouldn't happen with the current UI flow, but it's a good safeguard.
        console.error("Regeneration failed: Last message pair is not User -> Model");
        return;
    }

    // The history for the UI should show everything up to the last user question.
    const historyForUi = chatHistory.slice(0, -1);
    
    setChatHistory(historyForUi);
    setIsAnswering(true);
    setChatError(null);

    try {
      // The history for the AI needs to be everything *before* that last user question.
      const historyForApi = chatHistory.slice(0, -2);
      const answer = await answerQuestionAboutDocument(inputText, historyForApi, lastUserMessage.text);
      
      const modelMessage: ChatMessage = { role: 'model', text: answer };
      const finalHistory = [...historyForUi, modelMessage];
      setChatHistory(finalHistory);

      // Update the session with the new chat history
      const updatedSessions = sessions.map(s => 
        s.id === currentSessionId ? { ...s, chatHistory: finalHistory } : s
      );
      saveSessions(updatedSessions);

    } catch (err) {
       const message = err instanceof Error ? err.message : 'An error occurred while getting the answer.';
       setChatError(message);
    } finally {
        setIsAnswering(false);
    }
  }, [chatHistory, inputText, currentSessionId, sessions]);

  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
        setCurrentSessionId(session.id);
        setInputText(session.originalText);
        setDemystifiedData(session.demystifiedData);
        setChatHistory(session.chatHistory);
        setError(null);
        setChatError(null);
        setSelectedFile(null);
        setActiveTab(OutputTab.SUMMARY);
        setIsHistoryPanelOpen(false);
        setView('analysis');
    }
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    const updatedSessions = sessions.filter(s => s.id !== sessionId);
    saveSessions(updatedSessions);
    if (currentSessionId === sessionId) {
        createNewSession();
    }
  }, [sessions, currentSessionId, createNewSession]);

  const clearHistory = useCallback(() => {
    saveSessions([]);
    createNewSession();
  }, [createNewSession]);


  const renderView = () => {
    if (isLoading) {
      return <OutputSkeleton />;
    }

    if (view === 'analysis' && demystifiedData) {
      return (
        <div className="max-w-4xl w-full mx-auto">
          <div className="bg-secondary/50 p-6 rounded-lg border border-border min-h-[500px] flex flex-col animate-fade-in">
            <OutputDisplay
              data={demystifiedData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onRegenerate={handleDemystify}
              chatHistory={chatHistory}
              isAnswering={isAnswering}
              chatError={chatError}
              onSendQuestion={handleSendQuestion}
              onRegenerateAnswer={handleRegenerateAnswer}
              showToast={showToast}
            />
          </div>
        </div>
      );
    }

    // Default to home page
    return (
      <div className="max-w-3xl w-full mx-auto text-center animate-fade-in">
        <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl md:text-6xl">
          Demystify Legal Docs
        </h2>
        <p className="mt-4 max-w-md mx-auto text-lg text-muted-foreground sm:text-xl md:mt-5 md:max-w-3xl leading-relaxed">
          Paste in complex legal text, and our AI will provide a simple summary, identify key clauses, and highlight potential risks.
        </p>

        <div className="mt-8 bg-secondary/50 border border-border p-6 rounded-lg shadow-lg text-left">
          <InputArea
            value={inputText}
            onChange={handleTextChange}
            onSubmit={handleDemystify}
            isLoading={isLoading}
            isParsing={isParsing}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            clearInput={createNewSession}
          />
          {error && !isLoading && (
            <div className="mt-4 text-red-700 dark:text-red-300 bg-red-50 dark:bg-destructive/20 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted-foreground">Or try one of our samples:</p>
          <div className="mt-3 flex gap-3 justify-center flex-wrap">
            <button onClick={() => handleSampleSelect(sampleLease)} className="px-4 py-2 text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-muted rounded-full transition-colors">Lease Agreement</button>
            <button onClick={() => handleSampleSelect(sampleTOS)} className="px-4 py-2 text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-muted rounded-full transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    );
  };


  return (
    <>
      <Toast message={toastMessage} show={!!toastMessage} onDismiss={() => setToastMessage('')} />
      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        sessions={sessions}
        onClose={() => setIsHistoryPanelOpen(false)}
        onLoadSession={loadSession}
        onDeleteSession={deleteSession}
        onClearAll={clearHistory}
      />
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
        <Header 
          onNewChat={createNewSession} 
          onToggleHistory={() => setIsHistoryPanelOpen(true)}
          onToggleTheme={handleToggleTheme}
          theme={theme}
        />
        <main className="container mx-auto p-4 md:p-8 flex-grow flex flex-col justify-center">
           {renderView()}
        </main>
      </div>
    </>
  );
};

export default App;