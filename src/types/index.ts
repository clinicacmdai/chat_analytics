export interface User {
  id: string;
  email: string;
  created_at: string;
}

// type: 'human' | 'ai' (from DB), role: 'user' | 'assistant' (for UI compatibility)
export interface ChatMessage {
  type?: string; // 'human' | 'ai' or other
  role?: 'user' | 'assistant'; // for UI
  content: string;
}

export interface ChatHistory {
  id: number;
  session_id: string;
  message: ChatMessage;
  created_at: string;
}

export interface Conversation {
  session_id: string;
  messages: ChatMessage[];
  last_message: ChatMessage;
  last_message_time: Date;
  created_at_list?: string[];
}

export interface Insight {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
  created_at: Date;
}

export interface DashboardStats {
  total_conversations: number;
  unique_sessions: number;
  last_conversation_time: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  content: string;
  sender: string;
  timestamp: Date;
}

export interface Produto {
  id: number;
  created_at: string;
  descricao: string | null;
  grupo: string | null;
  codigo_amb: string | null;
  codigo_cbhpm: string | null;
  codigo_tuss: string | null;
  valor: number | null;
  ativo: string | null;
} 