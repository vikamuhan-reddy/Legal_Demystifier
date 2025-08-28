
import React, { useState, useEffect, useCallback } from 'react';
import { CopyIcon, CheckIcon, ShareIcon, SpeakerIcon, StopIcon, RegenerateIcon } from './icons';

interface ActionBarProps {
  textToCopy: string;
  onRegenerate?: () => void;
}

const ActionButton: React.FC<{ onClick: () => void; children: React.ReactNode; 'aria-label': string }> = ({ onClick, children, 'aria-label': ariaLabel }) => (
    <button
        onClick={onClick}
        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        aria-label={ariaLabel}
    >
        {children}
    </button>
);

/**
 * Pre-processes raw text into a more conversational, spoken-word format.
 * It detects content structure (like lists of risks or clauses) and reformats it.
 * @param rawText The original text to process.
 * @returns A string formatted for speech synthesis.
 */
const getSpokenText = (rawText: string): string => {
    let formattedText = rawText;

    // 1. Handle lists of Risks and Solutions
    if (rawText.startsWith('Risks and Solutions:\n')) {
        const pairs = rawText.replace('Risks and Solutions:\n', '').split('\n\n').filter(Boolean);
        const riskStatements = pairs.map(p => {
            const parts = p.split('\n');
            const risk = parts[0]?.replace('Risk: ', '').trim();
            const solution = parts[1]?.replace('Solution: ', '').trim();
            if (risk && solution) {
                return `Regarding the risk "${risk}", the suggested solution is: ${solution}.`;
            }
            return '';
        }).filter(Boolean);

        if (riskStatements.length > 0) {
            formattedText = `Here are the potential risks and their solutions. ${riskStatements.join(' ')}`;
        }
    }
    // 2. Handle lists of Clauses
    else if (rawText.includes('Clause:') && rawText.includes('Explanation:')) {
        const clauses = rawText.split('\n\n').filter(Boolean);
        const clauseStatements = clauses.map(c => {
            const parts = c.split('\n');
            const clauseTitle = parts[0]?.replace('Clause: ', '').trim();
            const explanation = parts[1]?.replace('Explanation: ', '').trim();
            if (clauseTitle && explanation) {
                return `Regarding the clause for "${clauseTitle}", the explanation is as follows: ${explanation}.`;
            }
            return '';
        }).filter(Boolean);

        if (clauseStatements.length > 0) {
            formattedText = `Let's review the key clauses. ${clauseStatements.join(' ')}`;
        }
    }
    // 3. Handle General Text / Chat (strips markdown)
    else {
        formattedText = rawText
            .replace(/###\s*(.*)/g, '$1.')      // h3
            .replace(/##\s*(.*)/g, '$1.')       // h2
            .replace(/#\s*(.*)/g, '$1.')        // h1
            .replace(/\*\*(.*?)\*\*/g, '$1')    // Bold
            .replace(/\*(.*?)\*/g, '$1')        // Italic
            .replace(/`([^`]+)`/g, '$1')        // Inline code
            .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Links
            .replace(/^\s*[-*+]\s+/gm, '');      // List items
    }

    // General cleanup for any format - preserves quotes, apostrophes, and hyphens
    return formattedText.replace(/[^\w\s.,?!'"-]/g, ' ').replace(/\s\s+/g, ' ').trim();
};


const ActionBar: React.FC<ActionBarProps> = ({ textToCopy, onRegenerate }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [canShare, setCanShare] = useState(false);
    
    useEffect(() => {
        try {
            if (typeof navigator.share === 'function') {
                setCanShare(true);
            }
        } catch (e) {
            console.error('Could not check for navigator.share: ', e);
        }
        // General cleanup on unmount
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        });
    }, [textToCopy]);

    const handleShare = useCallback(() => {
        if (canShare) {
            navigator.share({
                title: 'Legal Document Analysis',
                text: textToCopy,
            }).catch(error => console.error('Error sharing:', error));
        }
    }, [textToCopy, canShare]);
    
    const handleReadAloud = useCallback(() => {
        const speak = () => {
            const spokenText = getSpokenText(textToCopy);
            if (!spokenText) return;

            window.speechSynthesis.cancel(); // Cancel any previous speech
            const utterance = new SpeechSynthesisUtterance(spokenText);
            
            const allVoices = window.speechSynthesis.getVoices();
            const heeraVoice = allVoices.find(v => v.name === 'Microsoft Heera - English (India)');
            
            if (heeraVoice) {
                utterance.voice = heeraVoice;
            } else {
                const englishVoices = allVoices.filter(v => v.lang.startsWith('en-'));
                if (englishVoices.length > 0) {
                     // Smart fallback selection logic
                    const fallbackVoice = 
                      englishVoices.find(v => /google/i.test(v.name) && v.lang === 'en-US') ||
                      englishVoices.find(v => /microsoft/i.test(v.name) && /zira|david/i.test(v.name) && v.lang === 'en-US') ||
                      englishVoices.find(v => /samantha|alex|daniel/i.test(v.name) && v.lang === 'en-US') ||
                      englishVoices.find(v => v.default && v.lang.startsWith('en-')) ||
                      englishVoices.find(v => v.lang === 'en-US') || // any US voice
                      englishVoices[0]; // first available English voice
                    
                    if (fallbackVoice) {
                        utterance.voice = fallbackVoice;
                    }
                }
            }
            
            // Enhance vocal clarity for better understanding of legal text
            utterance.rate = 0.85; // Slower for clarity
            utterance.pitch = 1.1; // Slightly higher pitch
            utterance.volume = 1;  // Max volume
    
            utterance.onend = () => setIsSpeaking(false);
            utterance.onerror = (e) => {
                console.error('Speech synthesis error:', (e as SpeechSynthesisErrorEvent).error);
                setIsSpeaking(false);
            };
    
            window.speechSynthesis.speak(utterance);
            setIsSpeaking(true);
        };

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        // In some browsers (like Chrome), getVoices() returns an empty list on first call.
        // We must wait for the 'voiceschanged' event.
        if (window.speechSynthesis.getVoices().length === 0) {
            window.speechSynthesis.onvoiceschanged = () => {
                speak();
                 // Prevent this from being called multiple times
                window.speechSynthesis.onvoiceschanged = null;
            };
        } else {
            speak();
        }
    }, [textToCopy, isSpeaking]);


    return (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700/50">
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
                <ActionButton onClick={handleReadAloud} aria-label={isSpeaking ? "Stop reading" : "Read aloud"}>
                    {isSpeaking ? <StopIcon className="w-5 h-5" /> : <SpeakerIcon className="w-5 h-5" />}
                </ActionButton>
            </div>
        </div>
    );
};

export default ActionBar;