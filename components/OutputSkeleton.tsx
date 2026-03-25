import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles, Search, FileText, ShieldCheck, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const loadingMessages = [
    "Connecting to the AI assistant...",
    "Reading and comprehending the document...",
    "Identifying the most important clauses...",
    "Analyzing for potential risks and obligations...",
    "Crafting a simplified summary...",
    "Formatting the final report..."
];

const icons = [
  <Loader2 key="loader" className="h-8 w-8 animate-spin" />,
  <Search key="search" className="h-8 w-8" />,
  <FileText key="filetext" className="h-8 w-8" />,
  <ShieldCheck key="shieldcheck" className="h-8 w-8" />,
  <Sparkles key="sparkles" className="h-8 w-8" />,
  <Zap key="zap" className="h-8 w-8" />
];

const OutputSkeleton: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center text-center p-8 bg-secondary/5 rounded-[3rem] border border-border/10 relative overflow-hidden">
            {/* Shimmer Effect */}
            <motion.div
              animate={{ x: ["-100%", "200%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 pointer-events-none"
            />

            <div className="relative mb-16">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={messageIndex}
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 1.1, opacity: 0, y: -10 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="h-28 w-28 rounded-[2.5rem] bg-primary/5 flex items-center justify-center text-primary/40 shadow-2xl shadow-primary/5 border border-primary/10"
                  >
                    {icons[messageIndex]}
                  </motion.div>
                </AnimatePresence>
                
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-6 -right-6 text-primary/20"
                >
                  <Sparkles className="h-10 w-10" />
                </motion.div>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-primary/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary/40">AI Engine Active</span>
              <span className="h-px w-8 bg-primary/20" />
            </div>

            <motion.h3 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-serif tracking-tight mb-6 font-medium"
            >
              Analyzing Document
            </motion.h3>
            
            <div className="h-10 overflow-hidden relative w-full max-w-md">
              <AnimatePresence mode="wait">
                <motion.p 
                  key={messageIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="text-lg text-muted-foreground/60 font-normal leading-relaxed"
                >
                  {loadingMessages[messageIndex]}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="mt-16 w-full max-w-sm bg-secondary/30 rounded-full h-1.5 overflow-hidden border border-border/10 p-0">
              <motion.div 
                className="bg-primary h-full rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                initial={{ width: "0%" }}
                animate={{ width: `${((messageIndex + 1) / loadingMessages.length) * 100}%` }}
                transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
              />
            </div>
            
            <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.3em] text-muted-foreground/30">
              Deep Learning Analysis in Progress
            </p>
        </div>
    );
};

export default OutputSkeleton;
