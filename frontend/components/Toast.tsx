import React, { useEffect } from 'react';
import { CheckIcon, CloseIcon } from './icons.tsx';

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
      }, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) {
    return null;
  }

  return (
    <div 
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-full bg-foreground text-background shadow-lg animate-fade-in"
      role="alert"
      aria-live="assertive"
    >
        <CheckIcon className="w-6 h-6 text-green-500" />
        <p className="font-medium text-sm">{message}</p>
        <button onClick={onDismiss} className="p-1 -mr-2 rounded-full hover:bg-white/10 dark:hover:bg-black/20 transition-colors" aria-label="Dismiss">
            <CloseIcon className="w-4 h-4" />
        </button>
    </div>
  );
};

export default Toast;