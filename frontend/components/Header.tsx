import React from 'react';
import { HistoryIcon, PlusIcon, SunIcon, MoonIcon } from './icons.tsx';

interface HeaderProps {
    onNewChat: () => void;
    onToggleHistory: () => void;
    onToggleTheme: () => void;
    theme: 'light' | 'dark';
}


const Header: React.FC<HeaderProps> = ({ onNewChat, onToggleHistory, onToggleTheme, theme }) => {
  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 md:px-8 flex justify-between items-center">
        <div className="flex-1">
            {/* Empty div for spacing, allows title to be centered */}
        </div>
        <div className="text-center flex-grow">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Legal Document Demystifier
            </h1>
            <p className="hidden md:block mt-1 text-sm text-muted-foreground">
              Your AI-powered legal assistant.
            </p>
        </div>
        <div className="flex-1 flex items-center justify-end space-x-2">
            <button
                onClick={onNewChat}
                className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="New Chat"
                title="New Chat"
            >
                <PlusIcon className="w-6 h-6" />
            </button>
            <button
                onClick={onToggleHistory}
                className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="View History"
                title="View History"
            >
                <HistoryIcon className="w-6 h-6" />
            </button>
            <button
                onClick={onToggleTheme}
                className="p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                aria-label="Toggle theme"
                title="Toggle theme"
            >
                {theme === 'dark' ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;