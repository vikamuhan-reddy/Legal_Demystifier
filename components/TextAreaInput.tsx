import React, { useState, useRef, useCallback } from 'react';
import { FileText, Upload, File, X, Sparkles, Loader2, MousePointer2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InputAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isParsing: boolean;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  clearInput: () => void;
  onClean: () => void;
  isCleaning: boolean;
  onTrySample?: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading, 
  isParsing, 
  onFileSelect, 
  selectedFile, 
  clearInput, 
  onClean, 
  isCleaning, 
  onTrySample 
}) => {
  const [mode, setMode] = useState<'text' | 'upload'>('text');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [onFileSelect]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const hasInput = !!value.trim() || !!selectedFile;

  return (
    <div className="flex flex-col h-full space-y-6 md:space-y-10 max-w-5xl mx-auto w-full">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl md:text-4xl font-serif tracking-tight text-foreground font-semibold">Analyze Document</h2>
        <p className="text-sm md:text-base text-muted-foreground/80 max-w-2xl leading-relaxed font-normal">
          Paste text or upload a document to demystify its legal complexity with our advanced AI engine.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="inline-flex items-center rounded-xl bg-secondary/10 p-1 border border-border/10 w-full sm:w-auto">
          <button
            onClick={() => setMode('text')}
            className={cn(
              "flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-200",
              mode === 'text' ? "bg-background text-foreground shadow-sm border border-border/10" : "text-muted-foreground/70 hover:text-foreground"
            )}
          >
            <FileText className="mr-2 h-3 w-3" />
            Paste Text
          </button>
          <button
            onClick={() => setMode('upload')}
            className={cn(
              "flex-1 sm:flex-none inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-200",
              mode === 'upload' ? "bg-background text-foreground shadow-sm border border-border/10" : "text-muted-foreground/70 hover:text-foreground"
            )}
          >
            <Upload className="mr-2 h-3 w-3" />
            Upload File
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <AnimatePresence>
            {mode === 'text' && !value.trim() && onTrySample && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={onTrySample}
                className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80 hover:text-primary flex items-center gap-2 px-4 py-1.5 rounded-xl bg-primary/5 border border-primary/10 transition-all"
              >
                <MousePointer2 className="h-3 w-3" />
                Try Sample
              </motion.button>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {mode === 'text' && value.trim() && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={onClean}
                disabled={isCleaning || isLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80 transition-all hover:bg-primary/10 hover:text-primary disabled:opacity-50 border border-primary/10"
              >
                {isCleaning ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                {isCleaning ? 'Cleaning...' : 'Clean Text'}
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {hasInput && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={clearInput}
                className="inline-flex items-center gap-2 rounded-xl px-4 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 transition-all hover:bg-destructive/5 hover:text-destructive border border-transparent hover:border-destructive/10"
              >
                <X className="h-3 w-3" />
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative flex-grow min-h-[350px] md:min-h-[550px]">
        <AnimatePresence mode="wait">
          {mode === 'text' ? (
            <motion.div
              key="text-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
            >
              <textarea
                value={value}
                onChange={onChange}
                disabled={isLoading || isParsing}
                placeholder="Paste your legal document text here (Terms of Service, Privacy Policy, Contracts...)"
                className="h-full w-full rounded-3xl border border-border/10 bg-background px-6 py-6 md:px-8 md:py-8 text-base md:text-lg ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/5 focus-visible:border-primary/20 disabled:cursor-not-allowed disabled:opacity-50 resize-none shadow-2xl shadow-primary/5 transition-all duration-300 leading-relaxed font-normal"
              />
            </motion.div>
          ) : (
            <motion.div
              key="upload-mode"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full"
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.docx"
                className="hidden"
                disabled={isParsing || isLoading}
              />
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-300 bg-background p-6",
                  isDragging ? "border-primary bg-primary/5" : "border-border/10 hover:border-primary/20 hover:bg-secondary/5"
                )}
              >
                {isParsing ? (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="h-14 w-14 rounded-2xl bg-primary/5 flex items-center justify-center border border-border/10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg md:text-xl font-serif tracking-tight font-semibold">Parsing Document</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-2 uppercase tracking-[0.2em]">Extracting text, please wait...</p>
                    </div>
                  </div>
                ) : selectedFile ? (
                  <div className="flex flex-col items-center space-y-6">
                    <div className="relative">
                      <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/20 border border-primary/10">
                        <File className="h-8 w-8" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-emerald-500/80 text-white flex items-center justify-center shadow-lg border-4 border-background">
                        <CheckCircle className="h-3.5 w-3.5" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-lg md:text-xl font-serif tracking-tight text-primary/80 font-semibold">File Ready</p>
                      <p className="max-w-[250px] truncate text-[10px] text-muted-foreground/70 mt-2 uppercase tracking-[0.2em]">{selectedFile.name}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearInput(); }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/10 text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/70 hover:text-destructive hover:bg-destructive/5 transition-all border border-border/10"
                    >
                      <X className="h-3 w-3" />
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-6 group">
                    <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary/5 text-muted-foreground/20 group-hover:bg-primary/5 group-hover:text-primary/40 transition-all duration-500 border border-border/10">
                      <Upload className="h-8 w-8" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg md:text-xl font-serif tracking-tight font-semibold">Drop your document here</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-2 uppercase tracking-[0.2em]">PDF or DOCX (max. 10MB)</p>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all">
                      <MousePointer2 className="h-3.5 w-3.5" />
                      Select File
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.995 }}
        onClick={onSubmit}
        disabled={isLoading || isParsing || !hasInput}
        className={cn(
          "relative inline-flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl px-10 font-bold text-base transition-all duration-300",
          isLoading || isParsing || !hasInput 
            ? "bg-secondary/50 text-muted-foreground/60 border border-border/10 cursor-not-allowed" 
            : "bg-primary text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/90"
        )}
      >
        {isLoading && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "0%" }}
            transition={{ duration: 15, ease: "linear" }}
            className="absolute inset-0 bg-white/5 pointer-events-none"
          />
        )}
        
        <div className="relative z-10 flex items-center gap-3">
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="uppercase tracking-[0.2em] text-xs md:text-sm">Analyzing...</span>
            </>
          ) : isParsing ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="uppercase tracking-[0.2em] text-xs md:text-sm">Parsing...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span className="uppercase tracking-[0.2em] text-xs md:text-sm">Demystify Document</span>
            </>
          )}
        </div>
      </motion.button>
    </div>
  );
};

export default InputArea;
