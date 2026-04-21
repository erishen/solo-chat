import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];
  timestamp: number;
}

interface AppState {
  messages: Message[];
  currentModel: string;
  temperature: number;
  ollamaUrl: string;
  isConnected: boolean;
  addMessage: (message: Message) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setModel: (model: string) => void;
  setTemperature: (temp: number) => void;
  setOllamaUrl: (url: string) => void;
  setConnected: (connected: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      messages: [],
      currentModel: 'gemma4:latest',
      temperature: 0.7,
      ollamaUrl: 'http://localhost:11434',
      isConnected: false,

      addMessage: (message: Message) =>
        set((state) => ({ messages: [...state.messages, message] })),

      updateLastMessage: (content: string) =>
        set((state) => {
          const messages = [...state.messages];
          if (messages.length > 0) {
            messages[messages.length - 1] = {
              ...messages[messages.length - 1],
              content,
            };
          }
          return { messages };
        }),

      clearMessages: () => set({ messages: [] }),

      setModel: (model: string) => set({ currentModel: model }),

      setTemperature: (temp: number) => set({ temperature: temp }),

      setOllamaUrl: (url: string) => set({ ollamaUrl: url }),

      setConnected: (connected: boolean) => set({ isConnected: connected }),
    }),
    {
      name: 'solo-chat-storage',
      partialize: (state) => ({
        currentModel: state.currentModel,
        temperature: state.temperature,
        ollamaUrl: state.ollamaUrl,
        messages: state.messages.slice(-100),
      }),
    }
  )
);
