import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../../types';
import ActionBar from './ActionBar';

// marked is loaded as a global script from the CDN, so we declare it to satisfy TypeScript
declare const marked: any;

interface ChatInterfaceProps {
  history: ChatMessage[];
  isAnswering: boolean;
  error: string | null;
  onSendQuestion: (question: string) => void;
  onRegenerateAnswer: () => void;
  showToast: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ history, isAnswering, error, onSendQuestion, onRegenerateAnswer, showToast }) => {
  const [question, setQuestion] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, isAnswering]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isAnswering) {
      onSendQuestion(question);
      setQuestion('');
    }
  };

  return (
    <div className="flex-grow flex flex-col h-full">
      <div className="flex-grow overflow-y-auto pr-2 space-y-4">
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 4.5l7.5 7.5-7.5 7.5" />
             </svg>
            <h3 className="text-lg font-semibold text-foreground">Ask anything about the document.</h3>
            <p className="mt-1 max-w-sm text-sm">e.g., "What is the termination policy?" or "Explain the confidentiality clause in simple terms."</p>
          </div>
        )}
        {history.map((msg, index) => {
          const isLastModelMessage = msg.role === 'model' && index === history.length - 1 && !isAnswering;
          return (
            <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div
                    className="prose prose-sm prose-slate dark:prose-invert max-w-none text-foreground"
                    dangerouslySetInnerHTML={{ __html: marked.parse(msg.text) }}
                  />
                )}
              </div>
              {msg.role === 'model' && (
                  <div className="w-full max-w-md lg:max-w-lg">
                      <ActionBar
                          textToCopy={msg.text}
                          onRegenerate={isLastModelMessage ? onRegenerateAnswer : undefined}
                          showToast={showToast}
                      />
                  </div>
              )}
            </div>
          )
        })}
        {isAnswering && (
          <div className="flex justify-start">
             <div className="max-w-md lg:max-w-lg px-4 py-3 rounded-2xl bg-muted text-muted-foreground">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{animationDelay: '0.4s'}}></div>
                </div>
             </div>
          </div>
        )}
        {error && (
            <div className="p-3 bg-destructive/20 rounded-md text-destructive-foreground text-sm">
                <strong>Error:</strong> {error}
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a follow-up question..."
            className="flex-grow p-3 border border-border rounded-lg w-full bg-background focus:ring-2 focus:ring-ring focus:outline-none transition-shadow"
            disabled={isAnswering}
            aria-label="Ask a follow-up question"
          />
          <button
            type="submit"
            disabled={isAnswering || !question.trim()}
            className="bg-primary hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-bold p-3 rounded-lg transition-colors transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            aria-label="Send question"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
