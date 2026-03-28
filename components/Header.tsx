import React, { useState, useRef, useEffect } from 'react';
import { History, Plus, Sun, Moon, Scale, User, FileText, Menu, X, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';

import { UserDropdown } from './UserDropdown';

interface HeaderProps {
    onNewChat: () => void;
    onToggleHistory: () => void;
    onToggleSidebar: () => void;
    projectTitle?: string;
}

const Header: React.FC<HeaderProps> = ({ onNewChat, onToggleHistory, onToggleSidebar, projectTitle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-8 max-w-[1800px] mx-auto">
        <div className="flex items-center gap-6">
          {projectTitle && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleSidebar}
              className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-secondary hover:text-foreground border border-border/40"
              title="Toggle Menu"
            >
              <Menu className="h-5 w-5" />
            </motion.button>
          )}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-3 group cursor-pointer" 
            onClick={onNewChat}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-all">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-serif font-semibold leading-none tracking-tight whitespace-nowrap">
                Demystify<span className="text-primary/80 italic">Legal</span>
              </h1>
              <span className="text-[7px] font-bold uppercase tracking-[0.4em] text-muted-foreground/30 leading-none mt-1.5">Intelligence Engine</span>
            </div>
          </motion.div>

          {projectTitle && (
            <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-border/10">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-secondary/10 border border-border/20 max-w-[350px] xl:max-w-[500px]">
                <FileText className="h-3 w-3 text-primary/20" />
                <h2 className="text-[9px] font-bold tracking-tight truncate text-foreground/50 uppercase">
                  {projectTitle}
                </h2>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!projectTitle && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onNewChat}
              className="hidden sm:inline-flex h-9 items-center justify-center rounded-xl bg-primary px-5 text-[9px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-lg shadow-primary/10 transition-all hover:bg-primary/90"
            >
              <Plus className="mr-2 h-3.5 w-3.5" />
              New Analysis
            </motion.button>
          )}
          
          <div className="h-5 w-[1px] bg-border/10 mx-2 hidden sm:block" />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleHistory}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary hover:text-foreground border border-transparent"
            title="View History"
          >
            <History className="h-4 w-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-secondary hover:text-foreground border border-transparent"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.button>

          <div className="flex items-center gap-4 pl-4 border-l border-border/10 ml-2">
            <UserDropdown showLogout={true} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
