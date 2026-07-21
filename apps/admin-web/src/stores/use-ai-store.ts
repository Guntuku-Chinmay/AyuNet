import { create } from 'zustand';
import { AiChatMessage } from '../features/ai/services/ai-service';

interface AiState {
  messages: AiChatMessage[];
  isStreaming: boolean;
  selectedModel: string;
  addMessage: (msg: AiChatMessage) => void;
  setIsStreaming: (isStreaming: boolean) => void;
  setSelectedModel: (selectedModel: string) => void;
}

const INITIAL_MESSAGES: AiChatMessage[] = [
  {
    id: 'ai-msg-1',
    sender: 'ASSISTANT',
    content: 'Hello Dr. Mehta, I am your AyuNet Clinical Copilot. I have loaded patient Rahul Sharma’s latest vitals and lab results (Serum K+ 6.8 mmol/L). How can I assist you with clinical note drafting or differential diagnosis?',
    citations: ['PubMed: 38192102 - Hyperkalemia Management Protocol'],
    requiresReview: true,
    timestamp: '10:35 AM',
  },
];

export const useAiStore = create<AiState>((set) => ({
  messages: INITIAL_MESSAGES,
  isStreaming: false,
  selectedModel: 'Gemini 1.5 Pro Healthcare',

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setIsStreaming: (isStreaming) => set({ isStreaming }),
  setSelectedModel: (selectedModel) => set({ selectedModel }),
}));
