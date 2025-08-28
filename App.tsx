
import React, { useState, useCallback } from 'react';
import { demystifyDocument, answerQuestionAboutDocument } from './services/geminiService';
import { parsePdf, parseDocx } from './services/fileParser';
import type { DemystifiedDocument, ChatMessage } from './types';
import { OutputTab } from './types';
import Header from './components/Header';
import InputArea from './components/TextAreaInput';
import OutputDisplay from './components/OutputDisplay';
import LoadingSpinner from './components/LoadingSpinner';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [demystifiedData, setDemystifiedData] = useState<DemystifiedDocument | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<OutputTab>(OutputTab.SUMMARY);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);

  // State for Q&A Chat
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);


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

  const clearInput = useCallback(() => {
    setInputText('');
    setSelectedFile(null);
    setError(null);
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
    // Reset chat on new analysis
    setChatHistory([]);
    setChatError(null);


    try {
      const result = await demystifyDocument(inputText);
      setDemystifiedData(result);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'An unknown error occurred while analyzing the document.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [inputText]);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if(selectedFile) {
        setSelectedFile(null);
    }
  }

  const handleSendQuestion = useCallback(async (question: string) => {
    if (!question.trim() || !inputText) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: question }];
    setChatHistory(newHistory);
    setIsAnswering(true);
    setChatError(null);

    try {
      const answer = await answerQuestionAboutDocument(inputText, question);
      setChatHistory([...newHistory, { role: 'model', text: answer }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred while getting the answer.';
      setChatError(message);
      // OPTIONAL: Add an error message to chat history
      // setChatHistory([...newHistory, { role: 'model', text: `Sorry, I encountered an error: ${message}` }]);
    } finally {
      setIsAnswering(false);
    }
  }, [chatHistory, inputText]);

  const handleRegenerateAnswer = useCallback(async () => {
    const lastMessage = chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
    const secondToLastMessage = chatHistory.length > 1 ? chatHistory[chatHistory.length - 2] : null;

    // Ensure we can regenerate: last message is from model, the one before is from user
    if (!inputText || !lastMessage || lastMessage.role !== 'model' || !secondToLastMessage || secondToLastMessage.role !== 'user') {
      return;
    }
    
    const questionToRetry = secondToLastMessage.text;
    const historyForRetry = chatHistory.slice(0, -1); // Remove the last model message

    setChatHistory(historyForRetry);
    setIsAnswering(true);
    setChatError(null);

    try {
      const answer = await answerQuestionAboutDocument(inputText, questionToRetry);
      setChatHistory([...historyForRetry, { role: 'model', text: answer }]);
    } catch (err) {
       const message = err instanceof Error ? err.message : 'An error occurred while getting the answer.';
       setChatError(message);
    } finally {
        setIsAnswering(false);
    }
  }, [chatHistory, inputText]);


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-brand-dark text-gray-800 dark:text-gray-200 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
            <InputArea
              value={inputText}
              onChange={handleTextChange}
              onSubmit={handleDemystify}
              isLoading={isLoading}
              isParsing={isParsing}
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              clearInput={clearInput}
            />
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg min-h-[500px] flex flex-col animate-fade-in">
            {isLoading ? (
              <div className="flex-grow flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : error ? (
              <div className="flex-grow flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-center">{error}</p>
              </div>
            ) : demystifiedData ? (
              <OutputDisplay
                data={demystifiedData}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onRegenerate={handleDemystify}
                // Q&A Props
                chatHistory={chatHistory}
                isAnswering={isAnswering}
                chatError={chatError}
                onSendQuestion={handleSendQuestion}
                onRegenerateAnswer={handleRegenerateAnswer}
              />
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-400 dark:text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold">AI Analysis Output</h3>
                <p className="mt-2 max-w-sm">Your simplified summary, key clauses, and potential risks will appear here after you submit a document.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
