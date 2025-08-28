import React, { useState, useEffect, useCallback } from 'react';
import { CopyIcon, CheckIcon, ShareIcon, SpeakerIcon, StopIcon, RegenerateIcon } from './icons';

interface ActionBarProps {
  textToCopy: string;
  onRegenerate?: () => void;
  showToast: (message: string) => void;
}

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string; className?: string; }> = ({ onClick, children, 'aria-label': ariaLabel, className = '' }) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-full text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors ${className}`}
        aria-label={ariaLabel}
    >
        {children}
    </button>
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
            if (showToast) {
              showToast('Copied to clipboard!');
            }
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
                if ((e as SpeechSynthesisErrorEvent).error !== 'interrupted') {
                    console.error('Speech synthesis error:', (e as SpeechSynthesisErrorEvent).error);
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
        <div className="flex flex-col">
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                <div className="flex-grow">
                     {onRegenerate && (
                        <ActionButton onClick={onRegenerate} aria-label="Regenerate analysis">
                            <RegenerateIcon className="w-5 h-5" />
                        </ActionButton>
                    )}
                </div>
                <div className="flex items-center">
                    <ActionButton onClick={handleCopy} aria-label="Copy text">
                        {isCopied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <CopyIcon className="w-5 h-5" />}
                    </ActionButton>
                    {canShare && (
                        <ActionButton onClick={handleShare} aria-label="Share text">
                            <ShareIcon className="w-5 h-5" />
                        </ActionButton>
                    )}
                    <ActionButton onClick={handleReadAloud} aria-label={isSpeaking ? "Stop reading" : "Read aloud"} className={isSpeaking ? 'animate-pulse-speaker' : ''}>
                        {isSpeaking ? <StopIcon className="w-5 h-5" /> : <SpeakerIcon className="w-5 h-5" />}
                    </ActionButton>
                </div>
            </div>
             {isSpeaking && (
                <div className="w-full bg-muted rounded-full h-1 mt-3">
                    <div className="bg-primary h-1 rounded-full" style={{ width: `${speechProgress}%`, transition: 'width 0.1s linear' }}></div>
                </div>
            )}
        </div>
    );
};

export default ActionBar;
