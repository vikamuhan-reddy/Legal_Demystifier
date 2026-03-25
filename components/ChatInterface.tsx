import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types';
import { 
  Send, 
  MessageSquare, 
  Loader2, 
  User, 
  Bot, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertTriangle,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  history: ChatMessage[];
  isAnswering: boolean;
  error: string | null;
  onSendQuestion: (question: string) => void;
  onRegenerateAnswer: () => void;
  showToast: (message: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  history, 
  isAnswering, 
  error, 
  onSendQuestion, 
  onRegenerateAnswer, 
  showToast 
}) => {
  const [question, setQuestion] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [history, isAnswering]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (question.trim() && !isAnswering) {
      onSendQuestion(question.trim());
      setQuestion('');
      // Reset height of textarea
      if (inputRef.current) {
        inputRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      showToast('Copied to clipboard!');
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const suggestedPrompts = [
    "What are the main risks in this document?",
    "Summarize the termination clause.",
    "Are there any hidden costs?",
    "What is the governing law?"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px] bg-background/50 backdrop-blur-sm rounded-2xl border border-border/30 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-4 md:px-6 py-6 border-b border-border/10 flex items-center justify-between bg-secondary/5">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 border border-border/10">
              <Bot size={18} />
            </div>
            <div className={cn(
              "absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-background shadow-sm transition-colors duration-500", 
              isAnswering ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground/30"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="h-px w-4 bg-primary/20" />
              <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary/40">AI Assistant</span>
            </div>
            <h2 className="text-xl font-serif font-medium tracking-tight">Document Expert</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <motion.button 
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRegenerateAnswer}
              disabled={isAnswering}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary transition-all text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 hover:text-foreground disabled:opacity-50 border border-border/10"
            >
              <RefreshCw className={cn("h-3 w-3", isAnswering && "animate-spin")} />
              <span className="hidden sm:inline">Regenerate</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-6 space-y-6 scrollbar-hide">
        <AnimatePresence initial={false}>
          {history.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full text-center space-y-8"
            >
              <div className="relative">
                <div className="h-20 w-20 rounded-2xl bg-secondary/30 flex items-center justify-center text-primary/20">
                  <MessageSquare size={32} />
                </div>
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="absolute -top-1 -right-1 h-8 w-8 rounded-lg bg-background border border-border/30 shadow-sm flex items-center justify-center text-primary"
                >
                  <Sparkles size={14} />
                </motion.div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-foreground">How can I help?</h3>
                <p className="max-w-xs text-xs md:text-sm text-muted-foreground leading-relaxed font-medium mx-auto px-4">
                  Ask me anything about your document&apos;s risks, clauses, or overall structure.
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl px-4">
                {suggestedPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => onSendQuestion(prompt)}
                    className="group flex items-center justify-between p-5 rounded-2xl bg-secondary/5 border border-border/10 hover:border-primary/20 hover:bg-secondary/20 transition-all text-left shadow-sm"
                  >
                    <span className="text-[10px] md:text-xs font-medium text-muted-foreground/60 group-hover:text-foreground transition-colors line-clamp-2 uppercase tracking-wide">{prompt}</span>
                    <div className="h-7 w-7 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all shrink-0 ml-3">
                      <ChevronRight size={14} />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            history.map((msg, index) => {
              const isUser = msg.role === 'user';
              
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex w-full",
                    isUser ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex gap-3 max-w-[90%] sm:max-w-[85%]",
                    isUser ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "h-8 w-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                      isUser ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "bg-secondary/50 text-foreground border border-border/10"
                    )}>
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className={cn(
                      "space-y-2",
                      isUser ? "items-end" : "items-start"
                    )}>
                      <div className={cn(
                        "px-4 py-2.5 rounded-2xl text-xs md:text-sm leading-relaxed",
                        isUser 
                          ? "bg-primary text-primary-foreground rounded-tr-none shadow-lg shadow-primary/10" 
                          : "bg-card border border-border/10 rounded-tl-none"
                      )}>
                        {isUser ? (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        ) : (
                          <div className="prose prose-xs dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight prose-strong:text-foreground">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                      
                      {!isUser && (
                        <div className="flex items-center gap-3 px-1">
                          <button
                            onClick={() => handleCopy(msg.text, index)}
                            className="group flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all"
                          >
                            <div className="h-5 w-5 rounded-md bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              {copiedIndex === index ? <Check size={10} className="text-emerald-500" /> : <Copy size={10} />}
                            </div>
                            <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                          </button>
                          <button 
                            onClick={onRegenerateAnswer}
                            className="group flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-all"
                          >
                            <div className="h-5 w-5 rounded-md bg-secondary/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                              <RefreshCw size={10} className={cn(isAnswering && "animate-spin")} />
                            </div>
                            <span>Regenerate</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>

        {isAnswering && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary/50 flex items-center justify-center border border-border/30">
                <Bot size={14} className="text-primary" />
              </div>
              <div className="bg-card border border-border/30 px-4 py-3 rounded-xl rounded-tl-none">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i}
                      animate={{ 
                        y: [0, -4, 0],
                        opacity: [0.4, 1, 0.4]
                      }} 
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1, 
                        delay: i * 0.2,
                        ease: "easeInOut"
                      }} 
                      className="h-1.5 w-1.5 rounded-full bg-primary" 
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <div className="flex justify-center">
            <div className="bg-destructive/5 border border-destructive/20 text-destructive px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle size={12} />
              {error}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 md:px-6 py-8 bg-background/30 border-t border-border/10">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end gap-3 p-4 bg-secondary/5 rounded-[2rem] border border-border/10 shadow-2xl shadow-primary/5 focus-within:border-primary/20 focus-within:ring-1 focus-within:ring-primary/5 transition-all">
            <textarea
              ref={inputRef}
              value={question}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about this document..."
              rows={1}
              className="flex-grow bg-transparent border-none focus:ring-0 resize-none py-3 px-2 text-sm md:text-base placeholder:text-muted-foreground/30 scrollbar-hide min-h-[44px] max-h-32 font-medium leading-relaxed"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSend()}
              disabled={!question.trim() || isAnswering}
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-2xl transition-all shadow-lg",
                question.trim() && !isAnswering 
                  ? "bg-primary text-primary-foreground shadow-primary/20" 
                  : "bg-secondary text-muted-foreground/30 opacity-50 shadow-none"
              )}
            >
              {isAnswering ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </motion.button>
          </div>
        </div>
        <p className="text-[7px] text-center mt-6 text-muted-foreground font-bold uppercase tracking-[0.4em] opacity-30">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;
