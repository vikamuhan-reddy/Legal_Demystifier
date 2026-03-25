
export interface KeyClause {
  clause: string;
  explanation: string;
}

export interface RiskAndSolution {
  risk: string;
  solution: string;
}

export interface RiskAnalysis {
  clause: string;
  risk: string;
  reason: string;
  suggestion: string;
}

export interface FAQ {
    question: string;
    answer: string;
}

export interface DocumentSection {
  heading: string;
  content: string;
}

export interface DocumentStructure {
  title: string;
  sections: DocumentSection[];
}

export interface DemystifiedDocument {
  summary: string;
  clauses: {
    [key: string]: {
      explanation: string;
      originalWording: string;
    };
  };
  risks: RiskAndSolution[];
  entities: {
    parties: string[];
    dates: string[];
    jurisdiction: string;
    financialTerms: string[];
    obligations: string[];
  };
  faq: FAQ[];
  title: string;
  suggestedActions: string[];
  structure?: DocumentStructure;
}

export enum OutputTab {
  SUMMARY = 'Summary',
  STRUCTURE = 'Document Structure',
  ENTITIES = 'Key Entities',
  CLAUSES = 'Key Clauses',
  RISKS = 'Risks & Solutions',
  CHAT = 'Chat Assistant',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface ChatSession {
  id: string;
  demystifiedData: DemystifiedDocument;
  originalText: string;
  chatHistory: ChatMessage[];
  createdAt: number;
  faqs?: FAQ[];
}