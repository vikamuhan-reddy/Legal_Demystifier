import { supabase } from '@/lib/supabaseClient';
import type { ChatSession, DemystifiedDocument, ChatMessage, FAQ } from '@/types';

export interface SupabaseDocument {
  id: string;
  user_id: string;
  original_text: string;
  cleaned_text: string | null;
  summary: string | null;
  sentiment: string | null;
  clauses: any;
  risks: any;
  entities: any;
  suggested_actions: any;
  title: string | null;
  structure: any;
  chat_history: any;
  faqs: any;
  created_at: string;
}

export const documentService = {
  /**
   * Save a demystified document session to Supabase.
   */
  async saveDocument(userId: string, session: ChatSession) {
    const { demystifiedData, originalText, chatHistory, faqs } = session;
    
    const { data, error } = await supabase
      .from('documents')
      .upsert({
        id: session.id,
        user_id: userId,
        original_text: originalText,
        cleaned_text: originalText,
        summary: demystifiedData.summary,
        sentiment: demystifiedData.sentiment,
        clauses: demystifiedData.clauses,
        risks: demystifiedData.risks,
        entities: demystifiedData.entities,
        suggested_actions: demystifiedData.suggestedActions,
        title: demystifiedData.title,
        structure: demystifiedData.structure,
        chat_history: chatHistory,
        faqs: faqs || [],
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing document (e.g., after chat or FAQ generation).
   */
  async updateDocument(userId: string, sessionId: string, updates: Partial<ChatSession>) {
    const supabaseUpdates: any = {};
    
    if (updates.chatHistory) supabaseUpdates.chat_history = updates.chatHistory;
    if (updates.faqs) supabaseUpdates.faqs = updates.faqs;
    if (updates.demystifiedData) {
        supabaseUpdates.summary = updates.demystifiedData.summary;
        supabaseUpdates.sentiment = updates.demystifiedData.sentiment;
        supabaseUpdates.clauses = updates.demystifiedData.clauses;
        supabaseUpdates.risks = updates.demystifiedData.risks;
        supabaseUpdates.entities = updates.demystifiedData.entities;
        supabaseUpdates.suggested_actions = updates.demystifiedData.suggestedActions;
        supabaseUpdates.title = updates.demystifiedData.title;
        supabaseUpdates.structure = updates.demystifiedData.structure;
    }

    const { data, error } = await supabase
      .from('documents')
      .update(supabaseUpdates)
      .eq('id', sessionId)
      .eq('user_id', userId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Fetch all documents for a specific user.
   */
  async fetchUserDocuments(userId: string): Promise<ChatSession[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data as SupabaseDocument[]).map(doc => ({
      id: doc.id,
      originalText: doc.original_text,
      chatHistory: doc.chat_history || [],
      faqs: doc.faqs || [],
      createdAt: new Date(doc.created_at).getTime(),
      demystifiedData: {
        summary: doc.summary || '',
        sentiment: doc.sentiment as any,
        clauses: doc.clauses || {},
        risks: doc.risks || [],
        entities: doc.entities || { parties: [], dates: [], jurisdiction: '', financialTerms: [], obligations: [] },
        suggestedActions: doc.suggested_actions || [],
        title: doc.title || 'Untitled Document',
        structure: doc.structure,
        faq: doc.faqs || [],
      }
    }));
  },

  /**
   * Delete a document from Supabase.
   */
  async deleteDocument(userId: string, documentId: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Clear all documents for a user.
   */
  async clearAllDocuments(userId: string) {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('user_id', userId);

    if (error) throw error;
  }
};
