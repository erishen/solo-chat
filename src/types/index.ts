export interface ChatRequest {
  message: string;
  context?: {
    holdings?: unknown[];
    trades?: unknown[];
    market?: Record<string, unknown>;
    preferences?: Record<string, unknown>;
  };
  use_rag?: boolean;
  use_signals?: boolean;
  use_portfolio?: boolean;
  fast_mode?: boolean;
}

export interface ChatResponse {
  response: string;
  sources: string[];
  confidence: number;
  suggestions: string[];
  related_questions: string[];
}

export interface SignalsRequest {
  signal_type?: string;
  min_score?: number;
  limit?: number;
}

export interface RAGRequest {
  query: string;
  k?: number;
}

export interface RAGResponse {
  results: Array<{
    content: string;
    title?: string;
    source?: string;
    category?: string;
  }>;
  total: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: number;
}

export interface AppState {
  messages: Message[];
  currentModel: string;
  ollamaUrl: string;
  temperature: number;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setModel: (model: string) => void;
  setOllamaUrl: (url: string) => void;
  setTemperature: (temp: number) => void;
}
