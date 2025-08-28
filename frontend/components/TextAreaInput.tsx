import React, { useState, useRef, useCallback } from 'react';
import { TextIcon, UploadIcon, FileIcon, CloseIcon } from './icons';

interface InputAreaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isParsing: boolean;
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  clearInput: () => void;
}

const InputArea: React.FC<InputAreaProps> = ({ value, onChange, onSubmit, isLoading, isParsing, onFileSelect, selectedFile, clearInput }) => {
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

  const dropzoneClasses = `relative flex flex-col items-center justify-center w-full h-full p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted'}`;

  const renderContent = () => {
    if (mode === 'text') {
      return (
         <textarea
          id="legal-text"
          value={value}
          onChange={onChange}
          disabled={isLoading || isParsing}
          placeholder="e.g., Terms of Service, Privacy Policy, Lease Agreement..."
          className="flex-grow p-4 border border-border rounded-lg w-full resize-none bg-secondary focus:ring-2 focus:ring-ring focus:outline-none transition-shadow min-h-[350px]"
        />
      );
    }

    return (
       <div 
        className="flex-grow min-h-[350px]"
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
        <div className={dropzoneClasses} onClick={() => fileInputRef.current?.click()}>
            {isParsing ? (
                 <div className="flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="mt-4 font-semibold text-foreground">Parsing Document...</p>
                    <p className="text-sm text-muted-foreground">Extracting text, please wait.</p>
                </div>
            ) : selectedFile ? (
                 <div className="flex flex-col items-center text-green-600 dark:text-green-400">
                    <FileIcon className="w-12 h-12" />
                    <p className="mt-2 font-semibold">File Selected:</p>
                    <p className="text-sm break-all">{selectedFile.name}</p>
                 </div>
            ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                    <UploadIcon className="w-12 h-12 mb-3" />
                    <p className="font-semibold">Drag & drop a file or <span className="text-primary font-bold">click to browse</span></p>
                    <p className="mt-1 text-sm">Supports PDF and DOCX files</p>
                </div>
            )}
        </div>
       </div>
    );
  };
  
  const hasInput = !!value.trim() || !!selectedFile;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="inline-flex border border-border rounded-md p-1 bg-muted">
            <TabButton label="Paste Text" icon={<TextIcon className="w-5 h-5"/>} isActive={mode === 'text'} onClick={() => setMode('text')} />
            <TabButton label="Upload" icon={<UploadIcon className="w-5 h-5"/>} isActive={mode === 'upload'} onClick={() => setMode('upload')} />
        </div>
        {hasInput && (
             <button onClick={clearInput} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors">
                <CloseIcon className="w-4 h-4" />
                Clear
            </button>
        )}
      </div>
      {renderContent()}
      <button
        onClick={onSubmit}
        disabled={isLoading || isParsing || !value.trim()}
        className="mt-4 w-full flex justify-center items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Demystify Document'
        )}
      </button>
    </div>
  );
};

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded transition-colors ${
      isActive
        ? 'bg-background text-primary shadow-sm'
        : 'text-muted-foreground hover:text-foreground'
    }`}
  >
    {icon}
    {label}
  </button>
);


export default InputArea;
