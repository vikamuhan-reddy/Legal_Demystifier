import React, { useState, useCallback, useEffect } from 'react';
import { demystifyDocument, answerQuestionAboutDocument, generateFaqs, cleanText } from '@/services/groqService';
import * as historyService from '@/services/historyService';
import { documentService } from '@/services/documentService';
import { parseFile } from '@/services/fileParser';
import type { DemystifiedDocument, ChatMessage, ChatSession, FAQ } from '@/types';
import { OutputTab } from '@/types';
import Header from '@/components/Header';
import InputArea from '@/components/TextAreaInput';
import { OutputDisplay } from '@/components/OutputDisplay';
import HistoryPanel from '@/components/HistoryPanel';
import Sidebar from '@/components/Sidebar';
import Toast from '@/components/Toast';
import OutputSkeleton from '@/components/OutputSkeleton';
import LandingPage from '@/components/LandingPage';
import Head from 'next/head';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, FileSearch, AlertCircle, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'next/router';

const Home: React.FC = () => {
  const { user, loading: authLoading, isDemoMode } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const [inputText, setInputText] = useState<string>('');
  const [demystifiedData, setDemystifiedData] = useState<DemystifiedDocument | null>(null);
  
  // ... rest of the component state ...
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [faqs, setFaqs] = useState<FAQ[] | null>(null);
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>(OutputTab.SUMMARY);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [isOCRProcessing, setIsOCRProcessing] = useState<boolean>(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isGeneratingFaqs, setIsGeneratingFaqs] = useState<boolean>(false);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);

  // Session State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryPanelOpen, setIsHistoryPanelOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

  // UI State
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
  };

  const handleLoadSession = useCallback((sessionId: string) => {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
          setCurrentSessionId(session.id);
          setInputText(session.originalText);
          setDemystifiedData(session.demystifiedData);
          setChatHistory(session.chatHistory);
          setFaqs(session.faqs || null);
          setActiveTab(OutputTab.SUMMARY);
          setIsHistoryPanelOpen(false); // Close panel on load
      }
  }, [sessions]);

  // Handle query parameters for history and session loading
  useEffect(() => {
    if (router.isReady && sessions.length > 0) {
      const { history, session } = router.query;
      
      if (history === 'open') {
        setIsHistoryPanelOpen(true);
        // Clear the query param to avoid re-opening on refresh
        router.replace('/', undefined, { shallow: true });
      }
      
      if (session && typeof session === 'string') {
        handleLoadSession(session);
        // Clear the query param
        router.replace('/', undefined, { shallow: true });
      }
    }
  }, [router.isReady, router.query, sessions.length, handleLoadSession, router]);

  // Load history from local storage or Supabase
  useEffect(() => {
    const loadHistory = async () => {
      if (user && !isDemoMode) {
        try {
          const supabaseHistory = await documentService.fetchUserDocuments(user.id);
          setSessions(supabaseHistory);
        } catch (err) {
          console.error('Failed to load Supabase history:', err);
          setSessions(historyService.getLocalHistory());
        }
      } else {
        setSessions(historyService.getLocalHistory());
      }
    };
    
    if (!authLoading) {
      loadHistory();
    }
  }, [user, authLoading, isDemoMode]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (isLoading || isParsing) return;
    setError(null);
    setSelectedFile(file);
    setIsParsing(true);
    setIsOCRProcessing(false);
    setOcrProgress(0);
    try {
      const text = await parseFile(
        file, 
        () => setIsOCRProcessing(true),
        (progress) => setOcrProgress(progress)
      );
      setInputText(text);
      showToast('File parsed successfully!');
    } catch (err: any) {
      setError(`File parsing failed: ${err.message}`);
      setSelectedFile(null);
    } finally {
      setIsParsing(false);
      setIsOCRProcessing(false);
    }
  }, [isLoading, isParsing]);

  const clearInput = () => {
    setInputText('');
    setSelectedFile(null);
    setError(null);
  };

  const handleCleanText = async () => {
    if (!inputText.trim()) return;
    setIsCleaning(true);
    setError(null);
    try {
      const cleaned = await cleanText(inputText);
      setInputText(cleaned);
      showToast('Text cleaned and formatted!');
    } catch (err: any) {
      setError(`Cleaning failed: ${err.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const handleTrySample = () => {
    const sampleText = `CONSULTING SERVICES AGREEMENT
This Consulting Services Agreement (the "Agreement") is entered into as of January 1, 2024, by and between TechFlow Solutions Inc. ("Client") and Sarah Jenkins ("Consultant").

1. SERVICES
Consultant shall provide software architecture consulting services as described in Exhibit A.

2. PAYMENT TERMS
Client shall pay Consultant a fixed fee of $5,000 per month. Invoices are due within 15 days of receipt. Late payments shall accrue interest at 1.5% per month.

3. TERMINATION
Either party may terminate this Agreement upon 30 days' written notice. If either party breaches a material provision, the non-breaching party may terminate immediately if the breach is not cured within 10 days.

4. LIMITATION OF LIABILITY
In no event shall either party be liable for any indirect, incidental, or consequential damages. Consultant's total liability under this agreement shall not exceed the total fees paid by Client in the 6 months preceding the claim.

5. CONFIDENTIALITY
Consultant agrees to maintain the confidentiality of all Client proprietary information and shall not disclose it to any third party without prior written consent. This obligation survives termination for 5 years.

6. GOVERNING LAW
This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. Any disputes shall be settled in the courts of New Castle County.`;
    setInputText(sampleText);
    showToast('Sample document loaded!');
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) {
      setError('Please enter some legal text or upload a document.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setDemystifiedData(null);
    setChatHistory([]);
    setFaqs(null);
    setActiveTab(OutputTab.SUMMARY);
    setCurrentSessionId(null);

    try {
      const result = await demystifyDocument(inputText);
      setDemystifiedData(result);
      setFaqs(result.faq || []); // Set the FAQs from the initial analysis
      
      const newSession: ChatSession = {
        id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
        demystifiedData: result,
        originalText: inputText,
        chatHistory: [],
        faqs: result.faq || [], // Store FAQs in the session too
        createdAt: Date.now(),
      };
      
      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      setCurrentSessionId(newSession.id);
      
      if (user && !isDemoMode) {
        await documentService.saveDocument(user.id, newSession);
      } else {
        historyService.saveLocalHistory(updatedSessions);
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegenerateAnalysis = () => {
    if (inputText) {
        handleSubmit(); // Simply re-submit the original text
    }
  };

  const handleSendQuestion = useCallback(async (question: string) => {
    if (!demystifiedData || !inputText) return;
    
    const userMessage: ChatMessage = { role: 'user', text: question };
    const newHistory: ChatMessage[] = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setIsAnswering(true);
    setChatError(null);

    try {
        const answer = await answerQuestionAboutDocument(inputText, chatHistory, question);
        const modelMessage: ChatMessage = { role: 'model', text: answer };
        const updatedHistory = [...newHistory, modelMessage];
        setChatHistory(updatedHistory);

        // Update session
        if (currentSessionId) {
            const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
            if (sessionIndex !== -1) {
                const updatedSessions = [...sessions];
                updatedSessions[sessionIndex].chatHistory = updatedHistory;
                setSessions(updatedSessions);
                
                if (user && !isDemoMode) {
                    await documentService.updateDocument(user.id, currentSessionId, { chatHistory: updatedHistory });
                } else {
                    historyService.saveLocalHistory(updatedSessions);
                }
            }
        }

    } catch (err: any) {
        setChatError(err.message);
    } finally {
        setIsAnswering(false);
    }
  }, [demystifiedData, inputText, chatHistory, currentSessionId, sessions, user, isDemoMode]);

  const handleRegenerateAnswer = useCallback(async () => {
    if (chatHistory.length === 0) return;
    const lastUserQuestion = chatHistory.filter(m => m.role === 'user').pop();
    if (!lastUserQuestion) return;
    
    // Remove the last model answer before resubmitting
    const historyWithoutLastAnswer = chatHistory.filter((_, index) => index !== chatHistory.length - 1);
    setChatHistory(historyWithoutLastAnswer);
    
    await handleSendQuestion(lastUserQuestion.text);
  }, [chatHistory, handleSendQuestion]);
  
  const handleGenerateFaqs = useCallback(async () => {
      if (!inputText || !currentSessionId) return;
      setIsGeneratingFaqs(true);
      try {
          const generatedFaqs = await generateFaqs(inputText);
          setFaqs(generatedFaqs);
          
          const sessionIndex = sessions.findIndex(s => s.id === currentSessionId);
          if (sessionIndex !== -1) {
              const updatedSessions = [...sessions];
              updatedSessions[sessionIndex].faqs = generatedFaqs;
              setSessions(updatedSessions);
              
              if (user && !isDemoMode) {
                  await documentService.updateDocument(user.id, currentSessionId, { faqs: generatedFaqs });
              } else {
                  historyService.saveLocalHistory(updatedSessions);
              }
          }
      } catch (err: any) {
          showToast(`Error generating FAQs: ${err.message}`);
      } finally {
          setIsGeneratingFaqs(false);
      }
  }, [inputText, currentSessionId, sessions, user, isDemoMode]);


  const handleNewChat = () => {
    // Always reset the state for a new chat
    setDemystifiedData(null);
    setInputText('');
    setSelectedFile(null);
    setChatHistory([]);
    setFaqs(null);
    setError(null);
    setCurrentSessionId(null);
  };

  const handleDeleteSession = async (sessionId: string) => {
      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      
      if (user && !isDemoMode) {
          try {
              await documentService.deleteDocument(user.id, sessionId);
          } catch (err) {
              console.error('Failed to delete from Supabase:', err);
          }
      } else {
          historyService.saveLocalHistory(updatedSessions);
      }
      
      // If the deleted session was the active one, clear the view
      if (currentSessionId === sessionId) {
        handleNewChat();
      }
      showToast('Session deleted.');
  };
  
  const handleClearHistory = async () => {
      // In an iframe, confirm() can cause issues. We'll just perform the action.
      // A better approach would be a custom modal, but for now we'll just clear it.
      setSessions([]);
      
      if (user && !isDemoMode) {
          try {
              await documentService.clearAllDocuments(user.id);
          } catch (err) {
              console.error('Failed to clear Supabase history:', err);
          }
      } else {
          historyService.clearLocalHistory();
      }
      
      handleNewChat();
      showToast('All history cleared.');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-primary/20 mb-6"
        >
          <Loader2 size={32} />
        </motion.div>
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60 animate-pulse">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10">
      <Head>
        <title>Legal Document Demystifier | AI-Powered Legal Intelligence</title>
        <meta name="description" content="Stop guessing. Understand your legal documents instantly with AI. Identify risks, summarize clauses, and chat with your contracts." />
      </Head>
      <Header
        onNewChat={handleNewChat}
        onToggleHistory={() => setIsHistoryPanelOpen(!isHistoryPanelOpen)}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        projectTitle={demystifiedData?.title}
      />
      
      <div className="flex flex-grow overflow-hidden relative">
        {demystifiedData && (
          <Sidebar 
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              setIsSidebarOpen(false); // Close on mobile after selection
            }}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onNewAnalysis={handleNewChat}
          />
        )}

        <main className={cn(
          "flex-grow transition-all duration-300 overflow-y-auto w-full",
          demystifiedData && (isSidebarCollapsed ? "md:ml-20" : "md:ml-64")
        )}>
          <div className="container mx-auto px-4 py-8 md:px-8 md:py-12">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-4xl mx-auto"
                >
                  <OutputSkeleton />
                </motion.div>
              ) : demystifiedData ? (
                <motion.div
                  key="output"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-7xl mx-auto"
                >
                  <OutputDisplay
                    data={demystifiedData}
                    activeTab={activeTab}
                    onRegenerate={handleRegenerateAnalysis}
                    chatHistory={chatHistory}
                    isAnswering={isAnswering}
                    chatError={chatError}
                    onSendQuestion={handleSendQuestion}
                    onRegenerateAnswer={handleRegenerateAnswer}
                    faqs={faqs}
                    isGeneratingFaqs={isGeneratingFaqs}
                    onGenerateFaqs={handleGenerateFaqs}
                    showToast={showToast}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-4xl mx-auto"
                >
                  <div className="mb-12 text-center">
                    <h2 className="text-4xl font-serif font-semibold tracking-tight mb-3">Legal AI Assistant</h2>
                    <p className="text-sm text-muted-foreground/70 max-w-[400px] mx-auto leading-relaxed">
                      Upload your legal documents for instant, high-precision analysis and strategic insights.
                    </p>
                  </div>

                  <InputArea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    isParsing={isParsing}
                    onFileSelect={handleFileSelect}
                    selectedFile={selectedFile}
                    clearInput={clearInput}
                    onClean={handleCleanText}
                    isCleaning={isCleaning}
                    onTrySample={handleTrySample}
                  />

                  <AnimatePresence>
                    {isOCRProcessing && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-4"
                      >
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Loader2 size={20} className="animate-spin" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-xs font-bold uppercase tracking-widest text-primary">OCR in progress ({ocrProgress}%)</p>
                          <p className="text-[11px] text-muted-foreground/70">Extracting text from scanned document... This may take a moment.</p>
                          <div className="mt-2 h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                            <motion.div 
                              className="h-full bg-primary"
                              initial={{ width: 0 }}
                              animate={{ width: `${ocrProgress}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {!isOCRProcessing && inputText && selectedFile && !demystifiedData && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-8 p-6 bg-secondary/5 border border-border/30 rounded-3xl"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                              <CheckCircle size={16} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground">Extraction Complete</p>
                              <p className="text-[9px] text-muted-foreground uppercase tracking-wider">Review the extracted text before analysis</p>
                            </div>
                          </div>
                          <button 
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="h-9 px-6 rounded-xl bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-2"
                          >
                            {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            Start AI Analysis
                          </button>
                        </div>
                        <div className="max-h-40 overflow-y-auto p-4 bg-background rounded-xl border border-border/20 font-mono text-[10px] text-muted-foreground/80 leading-relaxed scrollbar-hide">
                          {inputText}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 p-4 bg-destructive/5 border border-destructive/10 rounded-xl text-destructive text-[10px] font-bold uppercase tracking-wider flex items-center gap-3"
                      >
                        <AlertCircle size={16} />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="group p-8 bg-secondary/10 rounded-3xl border border-border/10 text-center transition-all hover:bg-secondary/20 hover:border-border/20">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/20 group-hover:text-primary mx-auto mb-6 transition-colors border border-border/10">
                        <Sparkles size={24} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-3">Risk Detection</h4>
                      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">Identify potential liabilities and unfavorable clauses instantly with high precision.</p>
                    </div>
                    <div className="group p-8 bg-secondary/10 rounded-3xl border border-border/10 text-center transition-all hover:bg-secondary/20 hover:border-border/20">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/20 group-hover:text-primary mx-auto mb-6 transition-colors border border-border/10">
                        <FileSearch size={24} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-3">Smart Extraction</h4>
                      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">Automatically extract parties, dates, and financial terms from complex agreements.</p>
                    </div>
                    <div className="group p-8 bg-secondary/10 rounded-3xl border border-border/10 text-center transition-all hover:bg-secondary/20 hover:border-border/20">
                      <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/20 group-hover:text-primary mx-auto mb-6 transition-colors border border-border/10">
                        <MessageSquare size={24} />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-3">Interactive Q&A</h4>
                      <p className="text-[11px] text-muted-foreground/70 leading-relaxed">Ask complex questions about your document in plain English and get instant answers.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <HistoryPanel
        isOpen={isHistoryPanelOpen}
        sessions={sessions}
        onClose={() => setIsHistoryPanelOpen(false)}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        onClearAll={handleClearHistory}
      />
      
      <Toast 
        message={toastMessage} 
        show={!!toastMessage}
        onDismiss={() => setToastMessage('')}
      />
    </div>
  );
};

export default Home;
