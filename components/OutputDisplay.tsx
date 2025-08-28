
import React from 'react';
import type { DemystifiedDocument, ChatMessage, KeyClause, RiskAndSolution } from '../types';
import { OutputTab } from '../types';
import { SummaryIcon, KeyIcon, WarningIcon, ChatIcon, ShieldCheckIcon } from './icons';
import ChatInterface from './ChatInterface';
import ActionBar from './ActionBar';

interface OutputDisplayProps {
  data: DemystifiedDocument;
  activeTab: OutputTab;
  setActiveTab: (tab: OutputTab) => void;
  onRegenerate: () => void;
  // Q&A Props
  chatHistory: ChatMessage[];
  isAnswering: boolean;
  chatError: string | null;
  onSendQuestion: (question: string) => void;
  onRegenerateAnswer: () => void;
}

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-medium rounded-t-lg border-b-4 transition-all ${
      isActive
        ? 'border-brand-secondary text-brand-primary dark:text-white'
        : 'border-transparent text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700'
    }`}
    aria-current={isActive ? 'page' : undefined}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

const getKeyClausesText = (clauses: KeyClause[]): string => {
    return clauses.map(c => `Clause: ${c.clause}\nExplanation: ${c.explanation}`).join('\n\n');
};

const getPotentialRisksText = (risks: RiskAndSolution[]): string => {
    const riskText = risks.map(item => `Risk: ${item.risk}\nSolution: ${item.solution}`).join('\n\n');
    return `Risks and Solutions:\n${riskText}`;
};


const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
  data, 
  activeTab, 
  setActiveTab, 
  onRegenerate,
  chatHistory, 
  isAnswering, 
  chatError, 
  onSendQuestion,
  onRegenerateAnswer
}) => {
  const renderContent = () => {
    switch (activeTab) {
      case OutputTab.SUMMARY:
        return (
          <>
            <div className="prose prose-blue dark:prose-invert max-w-none flex-grow">
              <p>{data.summary}</p>
            </div>
            <ActionBar textToCopy={data.summary} onRegenerate={onRegenerate} />
          </>
        );
      case OutputTab.CLAUSES:
        return (
          <>
            <ul className="space-y-4 flex-grow">
              {data.keyClauses.map((item, index) => (
                <li key={index} className="p-4 bg-blue-50 dark:bg-slate-700/50 rounded-lg">
                  <h4 className="font-semibold text-brand-primary dark:text-brand-secondary">{item.clause}</h4>
                  <p className="mt-1 text-gray-700 dark:text-gray-300">{item.explanation}</p>
                </li>
              ))}
            </ul>
            <ActionBar textToCopy={getKeyClausesText(data.keyClauses)} onRegenerate={onRegenerate} />
          </>
        );
      case OutputTab.RISKS:
        return (
          <>
            <ul className="space-y-6 flex-grow">
              {data.potentialRisks.map((item, index) => (
                <li key={index} className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                  {/* Risk Section */}
                  <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20">
                    <div className="flex-shrink-0 pt-1">
                      <WarningIcon className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-800 dark:text-red-200">Potential Risk</h4>
                      <p className="mt-1 text-gray-800 dark:text-gray-200">{item.risk}</p>
                    </div>
                  </div>
                  {/* Solution Section */}
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20">
                    <div className="flex-shrink-0 pt-1">
                      <ShieldCheckIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                     <div>
                      <h4 className="font-semibold text-green-800 dark:text-green-200">Suggested Solution</h4>
                      <p className="mt-1 text-gray-800 dark:text-gray-200">{item.solution}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <ActionBar textToCopy={getPotentialRisksText(data.potentialRisks)} onRegenerate={onRegenerate} />
          </>
        );
      case OutputTab.QNA:
        return (
            <ChatInterface 
                history={chatHistory}
                isAnswering={isAnswering}
                error={chatError}
                onSendQuestion={onSendQuestion}
                onRegenerateAnswer={onRegenerateAnswer}
            />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-200 dark:border-slate-700">
        <TabButton label={OutputTab.SUMMARY} icon={<SummaryIcon className="w-5 h-5" />} isActive={activeTab === OutputTab.SUMMARY} onClick={() => setActiveTab(OutputTab.SUMMARY)} />
        <TabButton label={OutputTab.CLAUSES} icon={<KeyIcon className="w-5 h-5" />} isActive={activeTab === OutputTab.CLAUSES} onClick={() => setActiveTab(OutputTab.CLAUSES)} />
        <TabButton label={OutputTab.RISKS} icon={<WarningIcon className="w-5 h-5" />} isActive={activeTab === OutputTab.RISKS} onClick={() => setActiveTab(OutputTab.RISKS)} />
        <TabButton label={OutputTab.QNA} icon={<ChatIcon className="w-5 h-5" />} isActive={activeTab === OutputTab.QNA} onClick={() => setActiveTab(OutputTab.QNA)} />
      </div>
      <div className="py-6 flex-grow flex flex-col overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default OutputDisplay;