import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Check, Share2, Volume2, Square, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ActionBarProps {
  textToCopy: string;
  onRegenerate?: () => void;
  showToast: (message: string) => void;
}

const ActionButton: React.FC<{ 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  className?: string; 
}> = ({ onClick, icon, label, active, className }) => (
  <motion.button
    whileHover={{ y: -1, backgroundColor: "rgba(var(--primary-rgb), 0.05)" }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn(
      "p-2.5 md:p-3 rounded-xl transition-all flex items-center gap-2.5 text-[9px] font-bold uppercase tracking-[0.2em] border border-transparent",
      active 
        ? "bg-primary/10 text-primary border-primary/20 shadow-lg shadow-primary/5" 
        : "text-muted-foreground/40 hover:text-foreground hover:border-border/10",
      className
    )}
    aria-label={label}
  >
    <div className={cn("transition-transform duration-300", active && "scale-110")}>
      {icon}
    </div>
    <span className="sr-only md:not-sr-only">{label}</span>
  </motion.button>
);

const getSpokenText = (rawText: string): string => {
    let formattedText = rawText;
    if (rawText.startsWith('Risks and Solutions:\n')) {
        const pairs = rawText.replace('Risks and Solutions:\n', '').split('\n\n').filter(Boolean);
        const riskStatements = pairs.map(p => {
            const parts = p.split('\n');
            const risk = parts[0]?.replace('Risk: ', '').trim();
            const solution = parts[1]?.replace('Solution: ', '').trim();
            if (risk && solution) return `Regarding the risk "${risk}", the suggested solution is: ${solution}.`;
            return '';
        }).filter(Boolean);
        if (riskStatements.length > 0) formattedText = `Here are the potential risks and their solutions. ${riskStatements.join(' ')}`;
    }
    else if (rawText.includes('Clause:') && rawText.includes('Explanation:')) {
        const clauses = rawText.split('\n\n').filter(Boolean);
        const clauseStatements = clauses.map(c => {
            const parts = c.split('\n');
            const clauseTitle = parts[0]?.replace('Clause: ', '').trim();
            const explanation = parts[1]?.replace('Explanation: ', '').trim();
            if (clauseTitle && explanation) return `Regarding the clause for "${clauseTitle}", the explanation is as follows: ${explanation}.`;
            return '';
        }).filter(Boolean);
        if (clauseStatements.length > 0) formattedText = `Let's review the key clauses. ${clauseStatements.join(' ')}`;
    }
    else {
        formattedText = rawText
            .replace(/###\s*(.*)/g, '$1.')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
            .replace(/^\s*[-*+]\s+/gm, '');
    }
    return formattedText.replace(/[^\w\s.,?!'"-]/g, ' ').replace(/\s\s+/g, ' ').trim();
};


const ActionBar: React.FC<ActionBarProps> = ({ textToCopy, onRegenerate, showToast }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [canShare, setCanShare] = useState(false);
    const [speechProgress, setSpeechProgress] = useState(0);
    
    useEffect(() => {
        if (typeof navigator.share === 'function') {
            setCanShare(true);
        }
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            showToast('Copied to clipboard!');
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [textToCopy, showToast]);

    const handleShare = useCallback(() => {
        if (canShare) {
            navigator.share({
                title: 'Legal Document Analysis',
                text: textToCopy,
            }).catch(error => console.error('Error sharing:', error));
        }
    }, [textToCopy, canShare]);
    
    const handleReadAloud = useCallback(() => {
        const utteranceRef = new SpeechSynthesisUtterance();

        const speak = () => {
            const spokenText = getSpokenText(textToCopy);
            if (!spokenText) return;

            window.speechSynthesis.cancel();
            utteranceRef.text = spokenText;
            
            const allVoices = window.speechSynthesis.getVoices();
            const englishVoices = allVoices.filter(v => v.lang.startsWith('en-'));
            const highQualityVoice = 
                englishVoices.find(v => /google/i.test(v.name) && v.lang === 'en-US') ||
                englishVoices.find(v => /microsoft/i.test(v.name) && /zira|david/i.test(v.name) && v.lang === 'en-US') ||
                englishVoices.find(v => /samantha|alex|daniel/i.test(v.name) && v.lang === 'en-US') ||
                englishVoices.find(v => v.default && v.lang.startsWith('en-')) ||
                englishVoices[0];
            
            if (highQualityVoice) utteranceRef.voice = highQualityVoice;
            
            utteranceRef.rate = 0.9;
            utteranceRef.pitch = 1.0;
            utteranceRef.volume = 1;
    
            utteranceRef.onboundary = (event) => {
                if (utteranceRef.text) {
                    const progress = (event.charIndex + event.charLength) / utteranceRef.text.length;
                    setSpeechProgress(progress * 100);
                }
            };
            utteranceRef.onend = () => {
                setIsSpeaking(false);
                setSpeechProgress(0);
            };
            utteranceRef.onerror = (e) => {
                const error = (e as SpeechSynthesisErrorEvent).error;
                if (error !== 'interrupted' && error !== 'canceled') {
                    console.error('Speech synthesis error:', error);
                }
                setIsSpeaking(false);
                setSpeechProgress(0);
            };
    
            window.speechSynthesis.speak(utteranceRef);
            setIsSpeaking(true);
        };

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setSpeechProgress(0);
            return;
        }

        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                speak();
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            speak();
        }
    }, [textToCopy, isSpeaking]);


    return (
        <div className="flex flex-col gap-4 mt-8 pt-8 border-t border-border/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {onRegenerate && (
                        <ActionButton 
                            onClick={onRegenerate} 
                            label="Regenerate" 
                            icon={<RefreshCw className="w-3.5 h-3.5 opacity-40" />} 
                        />
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <ActionButton 
                        onClick={handleCopy} 
                        label={isCopied ? "Copied" : "Copy"} 
                        icon={isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-40" />} 
                    />
                    {canShare && (
                        <ActionButton 
                            onClick={handleShare} 
                            label="Share" 
                            icon={<Share2 className="w-3.5 h-3.5 opacity-40" />} 
                        />
                    )}
                    <ActionButton 
                        onClick={handleReadAloud} 
                        label={isSpeaking ? "Stop" : "Listen"} 
                        active={isSpeaking}
                        icon={isSpeaking ? <Square className="w-3.5 h-3.5 fill-current opacity-40" /> : <Volume2 className="w-3.5 h-3.5 opacity-40" />} 
                    />
                </div>
            </div>
            
            <AnimatePresence>
                {isSpeaking && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full bg-muted rounded-full h-1 overflow-hidden"
                    >
                        <motion.div 
                            className="bg-primary h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${speechProgress}%` }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ActionBar;
