import React from 'react';
import type { ChatSession } from '../../types.ts';
import { CloseIcon, TrashIcon, FileIcon } from './icons.tsx';

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
        <>
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/60 z-20 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
                aria-hidden="true"
            />
            {/* Panel */}
            <aside
                className={`fixed top-0 left-0 h-full w-full max-w-sm bg-background z-30 shadow-2xl transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="history-panel-title"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <h2 id="history-panel-title" className="text-xl font-bold text-foreground">
                            Chat History
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-accent"
                            aria-label="Close history panel"
                        >
                            <CloseIcon className="w-6 h-6 text-muted-foreground" />
                        </button>
                    </div>

                    {/* Session List */}
                    {sessions.length > 0 ? (
                        <ul className="flex-grow overflow-y-auto p-2">
                            {sessions.map((session) => (
                                <li key={session.id} className="mb-2 group">
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                                        <button onClick={() => onLoadSession(session.id)} className="flex items-start gap-3 text-left w-full">
                                            <FileIcon className="w-5 h-5 mt-1 flex-shrink-0 text-primary" />
                                            <div>
                                                <p className="font-semibold text-foreground leading-tight">
                                                    {session.demystifiedData.title}
                                                </p>
                                                <time className="text-xs text-muted-foreground">
                                                    {formatDate(session.createdAt)}
                                                </time>
                                            </div>
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                            className="p-2 rounded-full opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                            aria-label={`Delete session: ${session.demystifiedData.title}`}
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-1.125 0H5.625A2.25 2.25 0 003.375 6v12a2.25 2.25 0 002.25 2.25h12.75a2.25 2.25 0 002.25-2.25v-2.625M16.5 18.75h-9" /></svg>
                            <h3 className="text-lg font-semibold text-foreground">No History Yet</h3>
                            <p className="mt-1 text-sm">Your analyzed documents will appear here.</p>
                        </div>
                    )}


                    {/* Footer */}
                    {sessions.length > 0 && (
                        <div className="p-4 border-t border-border">
                            <button
                                onClick={onClearAll}
                                className="w-full flex items-center justify-center gap-2 text-sm text-destructive font-semibold p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                                Clear All History
                            </button>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default HistoryPanel;