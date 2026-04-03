import React from 'react';
import type { DemystifiedDocument, ChatMessage, KeyClause, RiskAndSolution, FAQ, DocumentStructure } from '@/types';
import { OutputTab } from '@/types';
import { 
  FileText, 
  Key, 
  AlertTriangle, 
  MessageSquare, 
  HelpCircle, 
  ShieldCheck, 
  FileSearch, 
  Users, 
  Calendar, 
  Gavel, 
  Banknote, 
  ClipboardList, 
  Tag,
  ArrowRight,
  ChevronDown,
  Lightbulb,
  FileSignature,
  ShieldAlert,
  Info,
  Layout,
  CheckCircle,
  AlertCircle,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import ActionBar from './ActionBar';
import ChatInterface from './ChatInterface';
import { cn } from '@/lib/utils';

interface OutputDisplayProps {
  data: DemystifiedDocument;
  activeTab: OutputTab;
  onRegenerate: () => void;
  chatHistory: ChatMessage[];
  isAnswering: boolean;
  chatError: string | null;
  onSendQuestion: (question: string) => void;
  onRegenerateAnswer: () => void;
  faqs: FAQ[] | null;
  isGeneratingFaqs: boolean;
  onGenerateFaqs: () => void;
  showToast: (message: string) => void;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  title?: string; 
  icon?: React.ReactNode;
  variant?: 'default' | 'risk' | 'success' | 'info' | 'warning'
}> = ({ children, className, title, icon, variant = 'default' }) => {
  const variantClasses = {
    default: "bg-card border-border/10 shadow-2xl shadow-primary/5",
    risk: "bg-destructive/5 border-destructive/10 shadow-sm",
    success: "bg-emerald-500/5 border-emerald-500/10 shadow-sm",
    info: "bg-blue-500/5 border-blue-500/10 shadow-sm",
    warning: "bg-amber-500/5 border-amber-500/10 shadow-sm",
  };

  const iconWrapperClasses = {
    default: "bg-secondary/50 text-primary/40 border border-border/10",
    risk: "bg-destructive/10 text-destructive border border-destructive/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  };

  return (
    <motion.div 
      variants={itemVariants}
      className={cn(
        "rounded-[2rem] border p-8 md:p-10 transition-all duration-300 group relative overflow-hidden", 
        variantClasses[variant], 
        className
      )}
    >
      {title && (
        <div className="flex items-center gap-4 mb-8">
          {icon && (
            <div className={cn("p-2.5 rounded-xl shrink-0 transition-all duration-300 group-hover:scale-105", iconWrapperClasses[variant])}>
              {React.cloneElement(icon as React.ReactElement, { size: 16 })}
            </div>
          )}
          <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/80">{title}</h4>
        </div>
      )}
      <div className="text-foreground/80 leading-relaxed text-sm md:text-base font-normal">
        {children}
      </div>
    </motion.div>
  );
};

const CollapsibleSection: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  icon?: React.ReactNode; 
  defaultOpen?: boolean;
  className?: string;
}> = ({ title, children, icon, defaultOpen = false, className }) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className={cn(
      "border border-border/10 rounded-2xl overflow-hidden bg-background transition-all duration-300 shadow-sm", 
      isOpen && "ring-1 ring-primary/5 border-primary/10", 
      className
    )}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-secondary/5 transition-all text-left group"
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div className={cn(
              "p-2.5 rounded-xl transition-all duration-300",
              isOpen ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" : "bg-secondary/50 text-primary/40 border border-border/10"
            )}>
              {React.cloneElement(icon as React.ReactElement, { size: 16 })}
            </div>
          )}
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300",
            isOpen ? "text-primary" : "text-foreground/80"
          )}>{title}</span>
        </div>
        <div className={cn(
          "h-8 w-8 rounded-xl bg-secondary/30 flex items-center justify-center transition-all duration-300 border border-border/10",
          isOpen && "rotate-180 bg-primary/5 text-primary border-primary/10"
        )}>
          <ChevronDown className="h-4 w-4 opacity-30" />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 md:px-8 pb-8 md:pb-10 text-sm md:text-base text-foreground/80 leading-relaxed border-t border-border/10 pt-6 md:pt-8 bg-secondary/5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TabHeader: React.FC<{ title: string; description: string; icon: React.ReactNode }> = ({ title, description, icon }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col gap-6 mb-12 md:mb-16"
  >
    <div className="flex items-center gap-5">
      <div className="p-3 rounded-2xl bg-secondary/50 text-primary/40 border border-border/10 shadow-sm">
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <div>
        <div className="flex items-center gap-3 mb-1">
          <span className="h-px w-6 bg-primary/20" />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40">Section Analysis</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-serif tracking-tight text-foreground font-medium">{title}</h2>
      </div>
    </div>
    <p className="text-base md:text-lg text-muted-foreground/80 max-w-2xl leading-relaxed font-normal">{description}</p>
  </motion.div>
);

const StructureContent: React.FC<{ structure?: DocumentStructure }> = ({ structure }) => {
  if (!structure || !structure.sections || structure.sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Layout className="h-12 w-12 text-muted-foreground/30" />
        <h3 className="mt-4 text-lg font-serif">Structure Not Available</h3>
        <p className="text-sm text-muted-foreground">We couldn&apos;t determine the detailed structure of this document.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TabHeader 
        title="Document Structure" 
        description="A detailed breakdown of the document's sections and their contents."
        icon={<Layout />}
      />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 gap-6"
      >
        {structure.sections.map((section, index) => (
          <CollapsibleSection 
            key={index} 
            title={section.heading} 
            icon={<Layout className="h-4 w-4 opacity-40" />}
          >
            <p className="text-base md:text-lg text-foreground leading-relaxed">
              {section.content}
            </p>
          </CollapsibleSection>
        ))}
      </motion.div>
    </div>
  );
};

const EntitiesContent: React.FC<{ entities: DemystifiedDocument['entities']; onRegenerate: () => void; showToast: (message: string) => void; }> = ({ entities, onRegenerate, showToast }) => {
    if (!entities) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Tag className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-serif">No Entities Found</h3>
                <p className="text-sm text-muted-foreground">We couldn&apos;t extract specific entities from this document.</p>
            </div>
        );
    }

    const hasEntities = (entities.parties?.length || 0) > 0 || 
                        (entities.dates?.length || 0) > 0 || 
                        !!entities.jurisdiction || 
                        (entities.financialTerms?.length || 0) > 0 || 
                        (entities.obligations?.length || 0) > 0;

    if (!hasEntities) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <Tag className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-serif">No Entities Found</h3>
                <p className="text-sm text-muted-foreground">We couldn&apos;t extract specific entities from this document.</p>
            </div>
        );
    }

    const EntitySection: React.FC<{ title: string; items?: string[]; icon: React.ReactNode; singleValue?: string; variant?: 'default' | 'info' | 'warning' | 'success' | 'risk' }> = ({ title, items, icon, singleValue, variant = 'default' }) => {
        if (!singleValue && (!items || items.length === 0)) return null;
        return (
            <Card title={title} icon={icon} variant={variant} className="flex flex-col h-full relative group border-border/30">
                <div className="flex-grow relative z-10">
                  {singleValue ? (
                      <p className="text-base md:text-lg text-foreground font-semibold tracking-tight leading-relaxed">{singleValue}</p>
                  ) : (
                      <ul className="space-y-2.5">
                          {items?.map((item, i) => (
                              <li key={i} className="text-sm md:text-base text-foreground/80 flex items-start gap-3 group/item">
                                  <div className="mt-2 h-1 w-1 rounded-full bg-primary/20 group-hover/item:bg-primary/50 transition-colors shrink-0" />
                                  <span className="leading-relaxed">{item}</span>
                              </li>
                          ))}
                      </ul>
                  )}
                </div>
            </Card>
        );
    };

    const textToCopy = [
        entities.parties?.length ? `Parties: ${entities.parties.join(', ')}` : '',
        entities.dates?.length ? `Dates: ${entities.dates.join(', ')}` : '',
        entities.jurisdiction ? `Jurisdiction: ${entities.jurisdiction}` : '',
        entities.financialTerms?.length ? `Financial Terms: ${entities.financialTerms.join(', ')}` : '',
        entities.obligations?.length ? `Obligations: ${entities.obligations.join(', ')}` : ''
    ].filter(Boolean).join('\n\n');

    return (
        <div className="space-y-6">
            <TabHeader 
              title="Key Entities" 
              description="Extracted parties, dates, financial terms, and other critical metadata."
              icon={<Tag />}
            />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                <EntitySection title="Parties Involved" items={entities.parties} icon={<Users size={18} />} variant="info" />
                <EntitySection title="Key Dates" items={entities.dates} icon={<Calendar size={18} />} variant="info" />
                <EntitySection title="Jurisdiction" singleValue={entities.jurisdiction} icon={<Gavel size={18} />} variant="warning" />
                <EntitySection title="Financial Terms" items={entities.financialTerms} icon={<Banknote size={18} />} variant="success" />
            </motion.div>
            <EntitySection title="Key Obligations" items={entities.obligations} icon={<ClipboardList size={18} />} />
            <ActionBar textToCopy={textToCopy} onRegenerate={onRegenerate} showToast={showToast} />
        </div>
    );
};

const SummaryContent: React.FC<{ data: DemystifiedDocument; onRegenerate: () => void; showToast: (message: string) => void; }> = ({ data, onRegenerate, showToast }) => {
    const riskCount = data.risks?.length || 0;
    const clauseCount = Object.keys(data.clauses || {}).length;
    const entityCount = (data.entities?.parties?.length || 0) + (data.entities?.dates?.length || 0);

    const sentimentColors = {
        Positive: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        Negative: "text-destructive bg-destructive/10 border-destructive/20",
        Neutral: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    };

    const SentimentIcon = {
        Positive: Smile,
        Negative: Frown,
        Neutral: Meh,
    }[data.sentiment || 'Neutral'];

    return (
        <div className="space-y-10">
            <TabHeader 
              title="Document Summary" 
              description="A high-level overview of the document's purpose and key takeaways."
              icon={<FileText />}
            />

            {/* KPI Cards */}
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-4 gap-6"
            >
                <motion.div variants={itemVariants} className="transition-all">
                  <Card variant="risk" className="py-6 text-center group border-destructive/10">
                      <div className="flex flex-col items-center justify-center">
                        <ShieldAlert className="h-6 w-6 mb-3 text-destructive opacity-40" />
                        <span className="text-4xl font-serif tracking-tight font-medium">{riskCount}</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mt-2">Risks Detected</span>
                      </div>
                  </Card>
                </motion.div>
                <motion.div variants={itemVariants} className="transition-all">
                  <Card variant="info" className="py-6 text-center group border-blue-500/10">
                      <div className="flex flex-col items-center justify-center">
                        <FileSignature className="h-6 w-6 mb-3 text-blue-500 opacity-40" />
                        <span className="text-4xl font-serif tracking-tight font-medium">{clauseCount}</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mt-2">Key Clauses</span>
                      </div>
                  </Card>
                </motion.div>
                <motion.div variants={itemVariants} className="transition-all">
                  <Card variant="success" className="py-6 text-center group border-emerald-500/10">
                      <div className="flex flex-col items-center justify-center">
                        <Tag className="h-6 w-6 mb-3 text-emerald-500 opacity-40" />
                        <span className="text-4xl font-serif tracking-tight font-medium">{entityCount}</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mt-2">Entities Found</span>
                      </div>
                  </Card>
                </motion.div>
                <motion.div variants={itemVariants} className="transition-all">
                  <Card className={cn("py-6 text-center group border-border/10", sentimentColors[data.sentiment || 'Neutral'])}>
                      <div className="flex flex-col items-center justify-center">
                        <SentimentIcon className="h-6 w-6 mb-3 opacity-40" />
                        <span className="text-2xl font-serif tracking-tight font-medium uppercase tracking-widest">{data.sentiment || 'Neutral'}</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 mt-2">Sentiment</span>
                      </div>
                  </Card>
                </motion.div>
            </motion.div>

            <div className="space-y-8">
              <Card className="bg-secondary/5 border-border/30 p-6 sm:p-8 md:p-10">
                <div className="flex flex-col lg:flex-row gap-10 items-start relative z-10">
                    <div className="flex-grow space-y-6">
                        <div>
                          <div className="flex items-center gap-3 mb-4">
                            <span className="h-px w-6 bg-primary/30" />
                            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-primary/70">Analysis Report</span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-serif tracking-tight text-foreground leading-tight font-medium">{data.title}</h3>
                        </div>
                        <p className="text-base md:text-lg leading-relaxed text-foreground/70 font-normal max-w-4xl">
                          {data.summary}
                        </p>
                    </div>
                    <div className="shrink-0 w-full lg:w-56 p-6 rounded-xl bg-background border border-border/30 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="relative h-24 w-24 mb-5">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-muted/5"
                                    strokeWidth="2"
                                />
                                <motion.circle
                                    initial={{ strokeDasharray: "0, 100" }}
                                    animate={{ strokeDasharray: `${Math.max(10, 100 - (riskCount * 10))}, 100` }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className={cn(
                                        "transition-all duration-1000",
                                        riskCount > 5 ? "stroke-destructive" : riskCount > 2 ? "stroke-amber-500" : "stroke-emerald-500"
                                    )}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span 
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: 0.5 }}
                                  className="text-2xl font-serif tracking-tight font-medium"
                                >
                                  {Math.max(0, 100 - (riskCount * 10))}%
                                </motion.span>
                            </div>
                        </div>
                        <div className="space-y-3 w-full">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Safety Score</span>
                              <p className="text-[9px] text-muted-foreground/60 leading-tight">Risk Index Breakdown</p>
                            </div>
                            <div className="pt-3 border-t border-border/20 w-full space-y-1.5">
                                <div className="flex justify-between items-center text-[8px] uppercase tracking-wider">
                                    <span className="text-muted-foreground">Base Score</span>
                                    <span className="text-emerald-500 font-bold">100</span>
                                </div>
                                {data.risks?.map((risk, idx) => (
                                    <div key={idx} className="flex justify-between items-start text-[8px] uppercase tracking-wider gap-2">
                                        <span className="text-muted-foreground text-left line-clamp-1">{risk.risk}</span>
                                        <span className="text-destructive font-bold shrink-0">-10</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest pt-1 border-t border-border/10 mt-1">
                                    <span>Final</span>
                                    <span className={cn(riskCount > 5 ? "text-destructive" : riskCount > 2 ? "text-amber-500" : "text-emerald-500")}>
                                        {Math.max(0, 100 - (riskCount * 10))}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
              </Card>
            </div>

        {data.suggestedActions && data.suggestedActions.length > 0 && (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Lightbulb size={18} className="text-emerald-500" />
                  <h4 className="text-xl font-serif tracking-tight">Suggested Next Steps</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.suggestedActions.map((action, index) => (
                        <Card key={index} variant="success" className="flex items-start gap-4 p-5">
                            <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-sm md:text-base font-medium leading-snug">{action}</span>
                        </Card>
                    ))}
                </div>
            </div>
        )}
        <ActionBar textToCopy={`${data.title}\n\nSummary:\n${data.summary}\n\nSuggested Actions:\n${data.suggestedActions?.join('\n- ')}`} onRegenerate={onRegenerate} showToast={showToast} />
    </div>
);
};

const ClausesContent: React.FC<{ clauses: DemystifiedDocument['clauses']; onRegenerate: () => void; showToast: (message: string) => void; }> = ({ clauses, onRegenerate, showToast }) => {
    const clauseEntries = clauses ? Object.entries(clauses) : [];
    if (clauseEntries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileSignature className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-serif">No Key Clauses</h3>
                <p className="text-sm text-muted-foreground">No significant clauses were identified.</p>
            </div>
        );
    }
    const textToCopy = clauseEntries.map(([name, data]) => `Clause: ${name}\nExplanation: ${data.explanation}`).join('\n\n');
    return (
        <div className="space-y-6">
            <TabHeader 
              title="Key Clauses" 
              description="Critical legal provisions identified and explained in plain English."
              icon={<FileSignature />}
            />
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
            >
                {clauseEntries.map(([name, data], index) => (
                    <CollapsibleSection 
                      key={index} 
                      title={name} 
                      icon={<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-secondary text-[9px] text-primary font-bold border border-border/50 shadow-sm">{index + 1}</div>}
                    >
                      <div className="space-y-6">
                        <p className="text-base md:text-lg text-foreground font-normal leading-relaxed">
                          {data.explanation}
                        </p>
                        {data.originalWording && (
                          <div className="mt-6 p-5 bg-background border border-border/30 rounded-xl relative group/original">
                            <p className="mb-3 font-bold uppercase tracking-[0.2em] text-[9px] text-primary/70">Original Provision</p>
                            <div className="font-serif italic text-sm md:text-base text-muted-foreground/80 leading-relaxed border-l-2 border-primary/10 pl-5">
                              {data.originalWording}
                            </div>
                          </div>
                        )}
                      </div>
                    </CollapsibleSection>
                ))}
            </motion.div>
            <ActionBar textToCopy={textToCopy} onRegenerate={onRegenerate} showToast={showToast} />
        </div>
    );
};

const RisksContent: React.FC<{ risks: RiskAndSolution[]; onRegenerate: () => void; showToast: (message: string) => void; }> = ({ risks, onRegenerate, showToast }) => {
    if (!risks || risks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShieldCheck className="h-12 w-12 text-emerald-500/30" />
                <h3 className="mt-4 text-lg font-serif">No Risks Detected</h3>
                <p className="text-sm text-muted-foreground">This document appears to be low risk based on our analysis.</p>
            </div>
        );
    }
    const textToCopy = risks.map(r => `Risk: ${r.risk}\nSolution: ${r.solution}`).join('\n\n');
    return (
        <div className="space-y-6">
            <TabHeader 
              title="Risks & Solutions" 
              description="Potential liabilities detected in the document along with recommended mitigation strategies."
              icon={<ShieldAlert />}
            />

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
            >
                {risks.map((item, index) => (
                    <Card key={index} variant="risk" className="relative group border-destructive/10">
                        <div className="flex items-start gap-4 mb-5">
                          <div className="h-9 w-9 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                            <AlertCircle size={18} />
                          </div>
                          <div>
                            <h4 className="text-lg md:text-xl font-serif tracking-tight text-foreground font-medium">{item.risk}</h4>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-destructive/70 mt-1">Priority Risk</p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 group-hover:border-emerald-500/20 transition-all">
                            <div className="flex items-center gap-2.5 mb-3 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle size={14} />
                              <span className="font-bold text-[9px] uppercase tracking-[0.2em]">Mitigation Strategy</span>
                            </div>
                            <p className="text-sm md:text-base text-foreground/80 leading-relaxed font-normal">
                              {item.solution}
                            </p>
                          </div>
                        </div>
                    </Card>
                ))}
            </motion.div>
            <ActionBar textToCopy={`Risks and Solutions:\n${textToCopy}`} onRegenerate={onRegenerate} showToast={showToast} />
        </div>
    );
};

const FAQContent: React.FC<{ 
  faqs: FAQ[] | null; 
  isGenerating: boolean; 
  onGenerate: () => void; 
  onRegenerate: () => void; 
  showToast: (message: string) => void; 
}> = ({ faqs, isGenerating, onGenerate, onRegenerate, showToast }) => {
    if (!faqs || faqs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <HelpCircle className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-4 text-lg font-serif">No FAQs Generated</h3>
                <p className="text-sm text-muted-foreground mb-6">Generate frequently asked questions to better understand this document.</p>
                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-2 h-11 px-8 rounded-xl bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-[0.15em] shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-50"
                >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    Generate FAQs
                </button>
            </div>
        );
    }

    const textToCopy = faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

    return (
        <div className="space-y-6">
            <TabHeader 
              title="Frequently Asked Questions" 
              description="Common questions and answers derived from the document's content."
              icon={<HelpCircle />}
            />
            
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
            >
                {faqs.map((faq, index) => (
                    <CollapsibleSection 
                      key={index} 
                      title={faq.question} 
                      icon={<HelpCircle className="h-4 w-4 opacity-40" />}
                    >
                      <p className="text-base md:text-lg text-foreground font-normal leading-relaxed">
                        {faq.answer}
                      </p>
                    </CollapsibleSection>
                ))}
            </motion.div>
            <ActionBar textToCopy={textToCopy} onRegenerate={onRegenerate} showToast={showToast} />
        </div>
    );
};

export const OutputDisplay: React.FC<OutputDisplayProps> = ({
  data,
  activeTab,
  onRegenerate,
  chatHistory,
  isAnswering,
  chatError,
  onSendQuestion,
  onRegenerateAnswer,
  faqs,
  isGeneratingFaqs,
  onGenerateFaqs,
  showToast,
}) => {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No Data Available</h3>
        <p className="text-sm text-muted-foreground">Please upload a document to begin analysis.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case OutputTab.SUMMARY:
        return <SummaryContent data={data} onRegenerate={onRegenerate} showToast={showToast} />;
      case OutputTab.STRUCTURE:
        return <StructureContent structure={data.structure} />;
      case OutputTab.ENTITIES:
        return <EntitiesContent entities={data.entities} onRegenerate={onRegenerate} showToast={showToast} />;
      case OutputTab.CLAUSES:
        return <ClausesContent clauses={data.clauses} onRegenerate={onRegenerate} showToast={showToast} />;
      case OutputTab.RISKS:
        return <RisksContent risks={data.risks} onRegenerate={onRegenerate} showToast={showToast} />;
      case OutputTab.FAQ:
        return (
          <FAQContent 
            faqs={faqs || data.faq} 
            isGenerating={isGeneratingFaqs} 
            onGenerate={onGenerateFaqs} 
            onRegenerate={onRegenerate} 
            showToast={showToast} 
          />
        );
      case OutputTab.CHAT:
        return (
          <ChatInterface
            history={chatHistory}
            isAnswering={isAnswering}
            error={chatError}
            onSendQuestion={onSendQuestion}
            onRegenerateAnswer={onRegenerateAnswer}
            showToast={showToast}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "flex-grow p-6 md:p-8 scrollbar-hide",
      activeTab === OutputTab.CHAT ? "overflow-hidden" : "overflow-y-auto"
    )}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
