import React from 'react';
import type { ChatSession } from '@/types';
import { X, Trash2, FileText, Clock, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  isOpen: boolean;
  sessions: ChatSession[];
  onClose: () => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ isOpen, sessions, onClose, onLoadSession, onDeleteSession, onClearAll }) => {
    
    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffSeconds = Math.round((now.getTime() - date.getTime()) / 1000);

        if (diffSeconds < 60) return `${diffSeconds}s ago`;
        const diffMinutes = Math.round(diffSeconds / 60);
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        const diffHours = Math.round(diffMinutes / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
                        onClick={onClose}
                        aria-hidden="true"
                    />
                    {/* Panel */}
                    <motion.aside
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-full w-full max-w-sm bg-background z-[60] shadow-2xl border-r border-border/20"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="history-panel-title"
                    >
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="flex items-center justify-between p-8 border-b border-border/10 bg-secondary/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary/40 border border-border/10">
                                        <Clock size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                          <span className="h-px w-4 bg-primary/20" />
                                          <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-primary/40">Archive</span>
                                        </div>
                                        <h2 id="history-panel-title" className="text-xl font-serif font-medium tracking-tight">
                                            Recent Analysis
                                        </h2>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 rounded-xl hover:bg-secondary/50 transition-all text-muted-foreground/30 hover:text-foreground border border-transparent hover:border-border/10"
                                    aria-label="Close history panel"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Session List */}
                            <div className="flex-grow overflow-y-auto p-4 space-y-2 scrollbar-hide">
                                {sessions.length > 0 ? (
                                    sessions.map((session) => (
                                        <motion.div 
                                            key={session.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="group relative flex items-center gap-5 p-4 rounded-[2rem] hover:bg-secondary/20 transition-all cursor-pointer border border-transparent hover:border-border/10 shadow-sm hover:shadow-xl hover:shadow-primary/5"
                                            onClick={() => onLoadSession(session.id)}
                                        >
                                            <div className="h-12 w-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary/30 group-hover:text-primary/60 transition-all border border-border/10">
                                                <FileText size={20} />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <p className="text-[11px] font-bold tracking-tight truncate text-foreground/70 group-hover:text-foreground transition-colors">
                                                    {session.demystifiedData.title || "Untitled Document"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                                                      {formatDate(session.createdAt)}
                                                  </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    onDeleteSession(session.id); 
                                                }}
                                                className="p-2.5 rounded-xl opacity-0 group-hover:opacity-100 text-muted-foreground/30 hover:text-destructive hover:bg-destructive/5 transition-all border border-transparent hover:border-destructive/10"
                                                aria-label={`Delete session`}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                                        <div className="h-12 w-12 rounded-2xl bg-secondary/30 flex items-center justify-center mb-4 text-muted-foreground/30">
                                            <AlertCircle size={24} />
                                        </div>
                                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">No history yet</h3>
                                        <p className="mt-2 text-[10px] text-muted-foreground/40 leading-relaxed max-w-[180px] mx-auto">
                                            Your analyzed documents will appear here for quick access.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            {sessions.length > 0 && (
                                <div className="p-6 border-t border-border/10">
                                    <button
                                        onClick={onClearAll}
                                        className="w-full flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-destructive p-2.5 rounded-xl hover:bg-destructive/5 transition-all border border-border/10 hover:border-destructive/20"
                                    >
                                        <Trash2 size={12} />
                                        Clear All History
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
};

export default HistoryPanel;
