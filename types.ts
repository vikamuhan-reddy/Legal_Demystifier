
export interface KeyClause {
  clause: string;
  explanation: string;
}

export interface RiskAndSolution {
  risk: string;
  solution: string;
}

export interface DemystifiedDocument {
  title: string;
  summary: string;
  keyClauses: KeyClause[];
  potentialRisks: RiskAndSolution[];
}

export enum OutputTab {
  SUMMARY = 'Simplified Summary',
  CLAUSES = 'Key Clauses',
  RISKS = 'Risks & Solutions',
  QNA = 'Ask a Question',
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
}