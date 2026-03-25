import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps {
  message: string;
  show: boolean;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, show, onDismiss }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className="fixed top-8 left-1/2 z-[100] flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-foreground text-background shadow-2xl border border-white/10 min-w-[300px]"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="flex-grow">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-0.5 leading-none">Notification</p>
            <p className="text-sm font-medium tracking-tight leading-none">{message}</p>
          </div>
          <button 
            onClick={onDismiss} 
            className="p-1.5 rounded-xl hover:bg-white/10 transition-all text-background/30 hover:text-background" 
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
